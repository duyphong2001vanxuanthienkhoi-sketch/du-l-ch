// Web Push phía trình duyệt: đăng ký Service Worker + xin quyền + tạo subscription,
// rồi gửi lên server lưu. Dùng khóa VAPID PUBLIC (an toàn để lộ).

// Trình duyệt có hỗ trợ Web Push không?
export function hoTroPush() {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

// Đổi khóa VAPID (base64url) sang Uint8Array cho applicationServerKey
function doiKhoa(base64) {
    const pad = '='.repeat((4 - (base64.length % 4)) % 4)
    const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/')
    const raw = atob(b64)
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

// Đảm bảo Service Worker /sw.js đã đăng ký, trả về registration.
async function daoSW() {
    return await navigator.serviceWorker.register('/sw.js')
}

// Đang bật thông báo đẩy trên thiết bị này chưa?
export async function dangBatPush() {
    if (!hoTroPush() || Notification.permission !== 'granted') return false
    try {
        const reg = await navigator.serviceWorker.getRegistration('/sw.js')
        const sub = await reg?.pushManager.getSubscription()
        return !!sub
    } catch { return false }
}

// Bật: xin quyền → subscribe → lưu server. Trả về { ok, lyDo }
export async function batPush() {
    if (!hoTroPush()) return { ok: false, lyDo: 'Trình duyệt không hỗ trợ thông báo' }
    const khoa = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!khoa) return { ok: false, lyDo: 'Chưa cấu hình VAPID' }

    // Nếu đã CHẶN trước đó, trình duyệt không hỏi lại → phải tự vào cài đặt trang mở lại
    if (Notification.permission === 'denied') {
        return { ok: false, lyDo: 'Thông báo đang bị chặn. Bấm biểu tượng 🔒 cạnh ô địa chỉ → cho phép "Thông báo/Notifications", rồi bấm lại.' }
    }
    const quyen = await Notification.requestPermission()
    if (quyen !== 'granted') return { ok: false, lyDo: 'Bạn chưa cho phép quyền thông báo' }

    const reg = await daoSW()
    await navigator.serviceWorker.ready
    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: doiKhoa(khoa) })
    }
    const res = await fetch('/api/push/dang-ky', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: sub }),
    })
    if (!res.ok) return { ok: false, lyDo: 'Không lưu được đăng ký' }
    return { ok: true }
}

// Tắt trên thiết bị này
export async function tatPush() {
    try {
        const reg = await navigator.serviceWorker.getRegistration('/sw.js')
        const sub = await reg?.pushManager.getSubscription()
        if (sub) {
            await fetch('/api/push/dang-ky', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) })
            await sub.unsubscribe()
        }
        return { ok: true }
    } catch { return { ok: false } }
}
