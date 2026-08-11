// "Bảng" đơn đặt món — bảng `don_do_an` trong Postgres (Neon), mỗi dòng (id, data JSONB).
// Luồng đặt đồ ăn TÁCH RIÊNG khỏi đơn hàng chợ.
// Trạng thái đơn: 'cho_nhan' (chưa nhận) -> 'da_nhan' -> 'dang_giao' -> 'da_giao'; hoặc 'huy'.
import { sql } from './db'
import crypto from 'crypto'

export const TRANG_THAI_DON = ['cho_nhan', 'da_nhan', 'dang_giao', 'da_giao', 'huy']

export async function taoDonDoAn({ userId, quanAnId, tenQuan, items, tongTien, tenKhach, soDienThoai, diaChi, viTri, ghiChu }) {
    const don = {
        id: 'do_' + crypto.randomUUID(),
        userId,
        quanAnId,
        tenQuan,        // chụp lại tên quán để hiện dù quán đổi tên
        items,          // [{ monId, ten, gia, soLuong }]
        tongTien,
        tenKhach,
        soDienThoai,
        diaChi,         // nơi giao (nhập tay)
        viTri,          // { lat, lng } ghim từ GPS trình duyệt (null nếu khách không chia sẻ)
        ghiChu,
        trangThai: 'cho_nhan',
        createdAt: new Date().toISOString(),
        capNhatLuc: new Date().toISOString(),
    }
    await sql`INSERT INTO don_do_an (id, data) VALUES (${don.id}, ${JSON.stringify(don)}::jsonb)`
    return don
}

export async function timDonDoAnTheoId(id) {
    const rows = await sql`SELECT data FROM don_do_an WHERE id = ${id} LIMIT 1`
    return rows[0]?.data || null
}

// Đơn của một quán (cho chủ quán) — mới nhất trước
export async function donTheoQuan(quanAnId) {
    const rows = await sql`SELECT data FROM don_do_an WHERE data->>'quanAnId' = ${quanAnId} ORDER BY data->>'createdAt' DESC`
    return rows.map(r => r.data)
}

// Đơn của một khách (theo dõi trạng thái) — mới nhất trước
export async function donTheoKhach(userId) {
    const rows = await sql`SELECT data FROM don_do_an WHERE data->>'userId' = ${userId} ORDER BY data->>'createdAt' DESC`
    return rows.map(r => r.data)
}

export async function capNhatTrangThaiDon(id, trangThai) {
    const rows = await sql`
        UPDATE don_do_an
        SET data = data || ${JSON.stringify({ trangThai, capNhatLuc: new Date().toISOString() })}::jsonb
        WHERE id = ${id} RETURNING data`
    return rows[0]?.data || null
}
