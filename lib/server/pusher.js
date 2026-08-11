// Pusher phía SERVER — dùng để "bắn" (trigger) sự kiện realtime tới các client.
// Bí mật (secret, app_id) chỉ ở đây, KHÔNG bao giờ lộ ra trình duyệt.
// Khai báo 4 biến trong .env: PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER
import Pusher from 'pusher'

let _pusher = null

// Tạo một lần rồi dùng lại (module cache). Nếu thiếu cấu hình thì trả null —
// tính năng chat vẫn lưu tin vào CSDL, chỉ mất phần "hiện ngay" realtime.
export function layPusher() {
    if (_pusher) return _pusher
    const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env
    if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
        console.warn('[pusher] Thiếu biến môi trường PUSHER_* — realtime bị tắt, tin nhắn vẫn lưu bình thường.')
        return null
    }
    _pusher = new Pusher({
        appId: PUSHER_APP_ID,
        key: PUSHER_KEY,
        secret: PUSHER_SECRET,
        cluster: PUSHER_CLUSTER,
        useTLS: true,
    })
    return _pusher
}

// Bắn sự kiện an toàn — nuốt lỗi để realtime hỏng không làm gãy API.
export async function ban(channel, event, payload) {
    try {
        const p = layPusher()
        if (p) await p.trigger(channel, event, payload)
    } catch (e) {
        console.warn('[pusher] Bắn sự kiện lỗi:', e?.message)
    }
}

// Tên kênh dùng chung giữa server và client (tránh gõ sai mỗi nơi một kiểu).
export const kenh = {
    hoiThoai: (id) => `private-ht-${id}`,   // 1 cuộc hội thoại
    khach: (userId) => `private-khach-${userId}`, // hộp thư của 1 khách
    quan: (quanAnId) => `private-quan-${quanAnId}`, // hộp thư của 1 quán
    admin: () => 'private-admin',           // hộp thư HỖ TRỢ dùng chung cho mọi admin
}
