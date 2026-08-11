// Gửi Web Push tới các thiết bị đã đăng ký của một user.
// Khóa VAPID lấy từ .env. Nếu thiếu cấu hình → bỏ qua êm (chat vẫn chạy).
import webpush from 'web-push'
import { dangKyCuaUser, xoaDangKy } from './pushDb'

let _sanSang = false
function chuanBi() {
    if (_sanSang) return true
    const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        console.warn('[web-push] Thiếu VAPID_* — thông báo đẩy bị tắt.')
        return false
    }
    webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:admin@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
    _sanSang = true
    return true
}

// Gửi push tới MỌI thiết bị của user. payload là object (sẽ JSON hóa).
// Endpoint hết hạn (404/410) sẽ tự bị xóa khỏi kho.
export async function guiPushToiUser(userId, payload) {
    try {
        if (!chuanBi()) return
        const subs = await dangKyCuaUser(userId)
        if (!subs.length) return
        const body = JSON.stringify(payload)
        await Promise.all(subs.map(async sub => {
            try {
                await webpush.sendNotification(sub, body)
            } catch (e) {
                if (e?.statusCode === 404 || e?.statusCode === 410) await xoaDangKy(sub.endpoint)
                else console.warn('[web-push] Gửi lỗi:', e?.statusCode || e?.message)
            }
        }))
    } catch (e) {
        console.warn('[web-push] Lỗi tổng:', e?.message)
    }
}
