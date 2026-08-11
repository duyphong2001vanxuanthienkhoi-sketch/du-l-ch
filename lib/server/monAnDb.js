// "Bảng" món ăn — bảng `mon_an` trong Postgres (Neon), mỗi dòng (id, data JSONB).
// Mỗi món thuộc về một quán (quanAnId) và nằm trong một "phần" thực đơn
// (vd: 'Món chính', 'Đồ uống', 'Tráng miệng') để trang quán gom nhóm hiển thị.
import { sql } from './db'
import crypto from 'crypto'

// Toàn bộ món của 1 quán — sắp theo phần rồi theo thời điểm tạo
export async function monTheoQuan(quanAnId) {
    const rows = await sql`
        SELECT data FROM mon_an
        WHERE data->>'quanAnId' = ${quanAnId}
        ORDER BY data->>'phan', data->>'createdAt'`
    return rows.map(r => r.data)
}

export async function timMonTheoId(id) {
    const rows = await sql`SELECT data FROM mon_an WHERE id = ${id} LIMIT 1`
    return rows[0]?.data || null
}

export async function taoMon({ quanAnId, ten, moTa, gia, phan, anh }) {
    const mon = {
        id: 'm_' + crypto.randomUUID(),
        quanAnId,
        ten,
        moTa,
        gia,
        phan: phan || 'Món khác',
        anh,
        con: true, // còn phục vụ; quán có thể tắt khi hết món
        createdAt: new Date().toISOString(),
    }
    await sql`INSERT INTO mon_an (id, data) VALUES (${mon.id}, ${JSON.stringify(mon)}::jsonb)`
    return mon
}

export async function capNhatMon(id, thayDoi) {
    const rows = await sql`UPDATE mon_an SET data = data || ${JSON.stringify(thayDoi)}::jsonb WHERE id = ${id} RETURNING data`
    return rows[0]?.data || null
}

export async function xoaMon(id) {
    await sql`DELETE FROM mon_an WHERE id = ${id}`
}
