// "Bảng" gian hàng — bảng `stores` trong Postgres (Neon), mỗi dòng (id, data JSONB).
// Trạng thái gian: 'cho_duyet' | 'da_duyet' | 'tu_choi'
// Loại gian:       'cho_tuoi'  | 'qua_quang_ninh'
import { sql } from './db'
import crypto from 'crypto'

// Mỗi người dùng chỉ có tối đa 1 gian hàng
export async function timGianTheoUserId(userId) {
    const rows = await sql`SELECT data FROM stores WHERE data->>'userId' = ${userId} LIMIT 1`
    return rows[0]?.data || null
}

export async function timGianTheoId(id) {
    const rows = await sql`SELECT data FROM stores WHERE id = ${id} LIMIT 1`
    return rows[0]?.data || null
}

export async function taoGianHang({ userId, tenGian, tenChu, soDienThoai, loaiGian, moTa, logo, email, diaChi, fax, nguoiChiuTrachNhiem, giayPhep }) {
    const gian = {
        id: 's_' + crypto.randomUUID(),
        userId,
        tenGian,
        tenChu,
        soDienThoai,
        loaiGian,
        moTa,
        logo,
        // Thông tin nhà bán chi tiết
        email,
        diaChi,
        fax,
        nguoiChiuTrachNhiem,
        giayPhep,
        status: 'cho_duyet', // gian mới luôn chờ duyệt, admin sẽ quyết định
        createdAt: new Date().toISOString(),
    }
    await sql`INSERT INTO stores (id, data) VALUES (${gian.id}, ${JSON.stringify(gian)}::jsonb)`
    return gian
}

export async function capNhatGianHang(id, thayDoi) {
    const rows = await sql`UPDATE stores SET data = data || ${JSON.stringify(thayDoi)}::jsonb WHERE id = ${id} RETURNING data`
    return rows[0]?.data || null
}

// Danh sách gian, lọc theo trạng thái nếu cần.
// LƯU Ý: mọi chỗ hiển thị công khai cho khách PHẢI gọi với { status: 'da_duyet' }
export async function danhSachGian({ status } = {}) {
    const rows = status
        ? await sql`SELECT data FROM stores WHERE data->>'status' = ${status}`
        : await sql`SELECT data FROM stores`
    return rows.map(r => r.data)
}
