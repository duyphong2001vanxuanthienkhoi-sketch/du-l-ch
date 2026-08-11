// Kho đăng ký Web Push — bảng `push_dang_ky` (endpoint TEXT PK, data JSONB).
// Mỗi trình duyệt/thiết bị = 1 subscription (có endpoint riêng), gắn với userId.
import { sql } from './db'

// Lưu (hoặc cập nhật) một subscription cho user. endpoint là khóa duy nhất.
export async function luuDangKy(userId, subscription) {
    const endpoint = subscription?.endpoint
    if (!endpoint) return
    const data = { userId, subscription, capNhatLuc: new Date().toISOString() }
    await sql`
        INSERT INTO push_dang_ky (endpoint, data) VALUES (${endpoint}, ${JSON.stringify(data)}::jsonb)
        ON CONFLICT (endpoint) DO UPDATE SET data = ${JSON.stringify(data)}::jsonb`
}

// Lấy tất cả subscription của một user (họ có thể mở trên nhiều thiết bị).
export async function dangKyCuaUser(userId) {
    const rows = await sql`SELECT data FROM push_dang_ky WHERE data->>'userId' = ${userId}`
    return rows.map(r => r.data.subscription).filter(Boolean)
}

// Xóa 1 subscription (khi trình duyệt báo hết hạn/không còn hợp lệ, hoặc user tắt).
export async function xoaDangKy(endpoint) {
    if (!endpoint) return
    await sql`DELETE FROM push_dang_ky WHERE endpoint = ${endpoint}`
}
