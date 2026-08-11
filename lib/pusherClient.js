// Pusher phía TRÌNH DUYỆT — chỉ dùng key + cluster CÔNG KHAI (an toàn để lộ).
// Tạo MỘT kết nối dùng chung cho toàn app (nhiều component cùng subscribe không mở nhiều socket).
// Private channel sẽ tự gọi /api/pusher/auth để xin phép (kèm cookie phiên đăng nhập).
import Pusher from 'pusher-js'

let _client = null

export function layPusherClient() {
    if (typeof window === 'undefined') return null // chỉ chạy ở client
    if (_client) return _client

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    if (!key || !cluster) {
        console.warn('[pusher] Thiếu NEXT_PUBLIC_PUSHER_KEY / NEXT_PUBLIC_PUSHER_CLUSTER — chat sẽ không realtime.')
        return null
    }

    _client = new Pusher(key, {
        cluster,
        authEndpoint: '/api/pusher/auth', // gửi kèm cookie mặc định (same-origin)
    })
    return _client
}
