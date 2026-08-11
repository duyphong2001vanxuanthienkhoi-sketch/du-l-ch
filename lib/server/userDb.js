// Kho người dùng — bảng `users` trong Postgres (Neon). Mỗi dòng là (id, data JSONB)
// giữ nguyên object như bản file JSON cũ, nên phần còn lại của app không phải sửa.
import { sql } from './db'
import crypto from 'crypto'

export async function timTheoEmail(email) {
    const rows = await sql`SELECT data FROM users WHERE lower(data->>'email') = lower(${String(email)}) LIMIT 1`
    return rows[0]?.data || null
}

export async function timTheoId(id) {
    const rows = await sql`SELECT data FROM users WHERE id = ${id} LIMIT 1`
    return rows[0]?.data || null
}

// role: 'khach' | 'tieu_thuong' | 'admin'
// Trả về { user } nếu tạo được, hoặc { trungEmail: true } nếu email đã tồn tại.
// Chống trùng email ở tầng CSDL (chỉ mục duy nhất trên lower(email)) — an toàn tuyệt đối
// kể cả khi nhiều tiến trình serverless đăng ký cùng lúc.
export async function taoNguoiDung({ name, email, passwordHash, role = 'khach' }) {
    const user = {
        id: 'u_' + crypto.randomUUID(),
        name,
        email: String(email).toLowerCase(),
        passwordHash,
        role,
        createdAt: new Date().toISOString(),
    }
    try {
        await sql`INSERT INTO users (id, data) VALUES (${user.id}, ${JSON.stringify(user)}::jsonb)`
    } catch (e) {
        if (e?.code === '23505' || /users_email_uniq|duplicate key/i.test(String(e?.message))) {
            return { trungEmail: true }
        }
        throw e
    }
    return { user }
}

// Danh sách người dùng theo vai trò (vd: tất cả admin để gửi thông báo hỗ trợ).
export async function danhSachTheoRole(role) {
    const rows = await sql`SELECT data FROM users WHERE data->>'role' = ${role}`
    return rows.map(r => r.data)
}

export async function capNhatNguoiDung(id, thayDoi) {
    // `data || ...` = trộn nông (JSONB) đúng như Object.assign của bản cũ.
    const rows = await sql`UPDATE users SET data = data || ${JSON.stringify(thayDoi)}::jsonb WHERE id = ${id} RETURNING data`
    return rows[0]?.data || null
}

// Không bao giờ trả passwordHash ra ngoài API
export function anThongTinNhayCam(user) {
    if (!user) return null
    const { passwordHash, ...congKhai } = user
    return congKhai
}
