// "Bảng" LỘ TRÌNH & BỘ SƯU TẬP — bảng `lo_trinh` trong Postgres (Neon), mỗi dòng (id, data JSONB).
//
// Hai thứ này CÙNG hình dạng — một danh sách địa điểm có thứ tự, có tên và ảnh bìa —
// nên dùng chung bảng, phân biệt bằng `kieu`:
//   'lo_trinh'    — có giờ bắt đầu + thời lượng từng chặng, vẽ đường nối trên bản đồ
//                   ("Hồng Gai một ngày", "Nửa ngày tâm linh")
//   'bo_suu_tap'  — chỉ là danh sách theo chủ đề, không giờ giấc
//                   ("Cà phê view vịnh", "Check-in hoàng hôn")
//
// Đây là thứ Google Maps KHÔNG có, và là lý do chính để du khách mở app này.
import { sql } from './db'
import { taoSlug } from '@/lib/diaDiemLoai'

const ba = (v) => (Array.isArray(v) ? [0, 1, 2].map(i => String(v[i] ?? '')) : ['', '', ''])

// Một chặng: địa điểm + (nếu là lộ trình) giờ tới và thời gian nên dành ra
const chuanHoaDiem = (d = {}) => ({
    diaDiemId: String(d.diaDiemId || ''),
    gio: String(d.gio || ''),          // '08:00'
    phut: Number(d.phut) || 0,         // thời lượng gợi ý, phút
    ghiChu: ba(d.ghiChu),
})

export function chuanHoaLoTrinh(d = {}, cu = null) {
    const ten = ba(d.ten)
    return {
        id: cu?.id || taoSlug(d.id || ten[0]),
        kieu: d.kieu === 'bo_suu_tap' ? 'bo_suu_tap' : 'lo_trinh',

        ten,
        mota: ba(d.mota),
        thoiLuong: ba(d.thoiLuong),   // 'Khoảng 1 ngày' — chữ tự do, không tính máy

        diem: (Array.isArray(d.diem) ? d.diem : [])
            .map(chuanHoaDiem)
            .filter(x => x.diaDiemId),

        anhBia: String(d.anhBia ?? ''),
        mau: String(d.mau ?? ''),
        icon: String(d.icon ?? ''),

        status: d.status || 'da_duyet',
        noiBat: Number(d.noiBat) || 0,
        createdAt: cu?.createdAt || new Date().toISOString(),
        capNhatLuc: new Date().toISOString(),
    }
}

export async function danhSachLoTrinh({ status, kieu } = {}) {
    let rows
    if (status && kieu) {
        rows = await sql`SELECT data FROM lo_trinh
            WHERE data->>'status' = ${status} AND data->>'kieu' = ${kieu}`
    } else if (status) {
        rows = await sql`SELECT data FROM lo_trinh WHERE data->>'status' = ${status}`
    } else if (kieu) {
        rows = await sql`SELECT data FROM lo_trinh WHERE data->>'kieu' = ${kieu}`
    } else {
        rows = await sql`SELECT data FROM lo_trinh`
    }
    return rows
        .map(r => r.data)
        .sort((a, b) => (b.noiBat || 0) - (a.noiBat || 0) ||
            String(a.ten?.[0] || '').localeCompare(String(b.ten?.[0] || ''), 'vi'))
}

export async function timLoTrinhTheoId(id) {
    const rows = await sql`SELECT data FROM lo_trinh WHERE id = ${id} LIMIT 1`
    return rows[0]?.data || null
}

export async function taoLoTrinh(d) {
    const lt = chuanHoaLoTrinh(d)
    if (!lt.id) throw new Error('Thiếu tên lộ trình để tạo mã')
    if (await timLoTrinhTheoId(lt.id)) throw new Error(`Mã "${lt.id}" đã tồn tại`)
    await sql`INSERT INTO lo_trinh (id, data) VALUES (${lt.id}, ${JSON.stringify(lt)}::jsonb)`
    return lt
}

export async function capNhatLoTrinh(id, thayDoi) {
    const cu = await timLoTrinhTheoId(id)
    if (!cu) return null
    const moi = chuanHoaLoTrinh({ ...cu, ...thayDoi }, cu)
    await sql`UPDATE lo_trinh SET data = ${JSON.stringify(moi)}::jsonb WHERE id = ${id}`
    return moi
}

export async function xoaLoTrinh(id) {
    const rows = await sql`DELETE FROM lo_trinh WHERE id = ${id} RETURNING id`
    return rows.length > 0
}
