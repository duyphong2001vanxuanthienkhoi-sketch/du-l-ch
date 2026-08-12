// "Bảng" SỰ KIỆN & LỄ HỘI — bảng `su_kien` trong Postgres (Neon), mỗi dòng (id, data JSONB).
//
// Lễ hội địa phương là thứ du khách không tra được ở đâu khác: hội đền Đức Ông 29–30/4,
// hội chùa Long Tiên 24/3 âm lịch...
//
// NGÀY ÂM LỊCH: app KHÔNG tự quy đổi âm sang dương (quy đổi sai còn tệ hơn không có).
// Lễ hội theo âm lịch thì để `batDau` trống và ghi rõ ở `ghiChuNgay`
// (vd 'Ngày 24/3 âm lịch hằng năm'); giao diện hiện câu chữ đó thay vì đếm ngược.
import { sql } from './db'
import { taoSlug } from '@/lib/diaDiemLoai'

const ba = (v) => (Array.isArray(v) ? [0, 1, 2].map(i => String(v[i] ?? '')) : ['', '', ''])

// 'YYYY-MM-DD' hoặc rỗng
const ngay = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : '')

export function chuanHoaSuKien(d = {}, cu = null) {
    const ten = ba(d.ten)
    return {
        id: cu?.id || taoSlug(d.id || ten[0]),

        ten,
        mota: ba(d.mota),
        noiDung: (Array.isArray(d.noiDung) ? d.noiDung : []).map(ba).filter(p => p.some(s => s.trim())),

        diaDiemId: String(d.diaDiemId || ''),   // gắn với địa điểm diễn ra

        batDau: ngay(d.batDau),
        ketThuc: ngay(d.ketThuc),
        hangNam: !!d.hangNam,                   // lặp lại mỗi năm
        amLich: !!d.amLich,                     // tính theo âm lịch -> không đếm ngược
        ghiChuNgay: ba(d.ghiChuNgay),           // câu chữ về thời điểm, luôn hiện

        anhBia: String(d.anhBia ?? ''),
        mau: String(d.mau ?? ''),
        icon: String(d.icon ?? ''),

        status: d.status || 'da_duyet',
        noiBat: Number(d.noiBat) || 0,
        createdAt: cu?.createdAt || new Date().toISOString(),
        capNhatLuc: new Date().toISOString(),
    }
}

export async function danhSachSuKien({ status } = {}) {
    const rows = status
        ? await sql`SELECT data FROM su_kien WHERE data->>'status' = ${status}`
        : await sql`SELECT data FROM su_kien`
    return rows
        .map(r => r.data)
        .sort((a, b) => (b.noiBat || 0) - (a.noiBat || 0) ||
            String(a.batDau || '9999').localeCompare(String(b.batDau || '9999')))
}

export async function timSuKienTheoId(id) {
    const rows = await sql`SELECT data FROM su_kien WHERE id = ${id} LIMIT 1`
    return rows[0]?.data || null
}

export async function taoSuKien(d) {
    const sk = chuanHoaSuKien(d)
    if (!sk.id) throw new Error('Thiếu tên sự kiện để tạo mã')
    if (await timSuKienTheoId(sk.id)) throw new Error(`Mã "${sk.id}" đã tồn tại`)
    await sql`INSERT INTO su_kien (id, data) VALUES (${sk.id}, ${JSON.stringify(sk)}::jsonb)`
    return sk
}

export async function capNhatSuKien(id, thayDoi) {
    const cu = await timSuKienTheoId(id)
    if (!cu) return null
    const moi = chuanHoaSuKien({ ...cu, ...thayDoi }, cu)
    await sql`UPDATE su_kien SET data = ${JSON.stringify(moi)}::jsonb WHERE id = ${id}`
    return moi
}

export async function xoaSuKien(id) {
    const rows = await sql`DELETE FROM su_kien WHERE id = ${id} RETURNING id`
    return rows.length > 0
}
