// "Bảng" quán ăn — bảng `quan_an` trong Postgres (Neon), mỗi dòng (id, data JSONB).
// Module Đồ Ăn Hồng Gai TÁCH RIÊNG khỏi gian hàng chợ: một tài khoản có thể vừa có
// gian hàng vừa có quán ăn (hoặc chỉ một trong hai).
// Trạng thái quán: 'cho_duyet' | 'da_duyet' | 'tu_choi'
import { sql } from './db'
import crypto from 'crypto'

// Mỗi người dùng tối đa 1 quán ăn
export async function timQuanAnTheoUserId(userId) {
    const rows = await sql`SELECT data FROM quan_an WHERE data->>'userId' = ${userId} LIMIT 1`
    return rows[0]?.data || null
}

export async function timQuanAnTheoId(id) {
    const rows = await sql`SELECT data FROM quan_an WHERE id = ${id} LIMIT 1`
    return rows[0]?.data || null
}

export async function taoQuanAn({ userId, ten, tenChu, soDienThoai, diaChi, moTa, gioMoCua, gioDongCua, loai, nhom, logo }) {
    const quan = {
        id: 'q_' + crypto.randomUUID(),
        userId,
        ten,
        tenChu,
        soDienThoai,
        diaChi,
        moTa,
        gioMoCua,   // vd '08:00'
        gioDongCua, // vd '22:00'
        loai: Array.isArray(loai) ? loai : [], // buổi phục vụ: an_sang | an_trua | an_toi | an_vat (nhiều buổi)
        nhom: Array.isArray(nhom) ? nhom : [], // loại món: do_an_vat | bun | pho | com | chao | mien | hai_san
        logo,
        status: 'cho_duyet', // quán mới luôn chờ duyệt
        createdAt: new Date().toISOString(),
    }
    await sql`INSERT INTO quan_an (id, data) VALUES (${quan.id}, ${JSON.stringify(quan)}::jsonb)`
    return quan
}

export async function capNhatQuanAn(id, thayDoi) {
    const rows = await sql`UPDATE quan_an SET data = data || ${JSON.stringify(thayDoi)}::jsonb WHERE id = ${id} RETURNING data`
    return rows[0]?.data || null
}

// Danh sách quán, lọc theo trạng thái nếu cần.
// LƯU Ý: mọi chỗ hiển thị công khai cho khách PHẢI gọi với { status: 'da_duyet' }
export async function danhSachQuanAn({ status } = {}) {
    const rows = status
        ? await sql`SELECT data FROM quan_an WHERE data->>'status' = ${status}`
        : await sql`SELECT data FROM quan_an`
    return rows.map(r => r.data)
}
