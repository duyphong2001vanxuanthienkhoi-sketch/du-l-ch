// "Bảng" mã giảm giá — bảng `coupons` trong Postgres (Neon), khóa chính là `code`.
// Mã do ADMIN phát cho TOÀN SÀN. Giảm theo % trên tổng tiền hàng,
// có thể yêu cầu đơn tối thiểu và có hạn dùng.
import { sql } from './db'
import { formatVND } from '@/lib/utils/currency'

export const chuanHoaCode = (code) => String(code || '').trim().toUpperCase()

export async function danhSachMa() {
    const rows = await sql`SELECT data FROM coupons ORDER BY data->>'taoLuc' DESC`
    return rows.map(r => r.data)
}

export async function timMaTheoCode(code) {
    const rows = await sql`SELECT data FROM coupons WHERE code = ${chuanHoaCode(code)} LIMIT 1`
    return rows[0]?.data || null
}

export async function taoMa({ code, moTa, phanTramGiam, donToiThieu, hetHan }) {
    const ma = {
        code: chuanHoaCode(code),
        moTa,
        phanTramGiam,   // 1..100
        donToiThieu,    // VND, 0 = không yêu cầu
        hetHan,         // chuỗi ISO hoặc null (không hết hạn)
        kichHoat: true,
        taoLuc: new Date().toISOString(),
    }
    // Trùng mã thì ghi đè (admin sửa lại mã cùng tên).
    await sql`
        INSERT INTO coupons (code, data) VALUES (${ma.code}, ${JSON.stringify(ma)}::jsonb)
        ON CONFLICT (code) DO UPDATE SET data = EXCLUDED.data`
    return ma
}

export async function xoaMa(code) {
    const rows = await sql`DELETE FROM coupons WHERE code = ${chuanHoaCode(code)} RETURNING code`
    return rows.length > 0
}

// Kiểm tra mã có dùng được cho tổng tiền hàng này không.
// Trả về { ok: true, ma, tienGiam } hoặc { ok: false, error }.
// DÙNG CHUNG cho API kiểm mã (khách bấm "Áp dụng") và API đặt đơn (kiểm lại ở server).
export async function kiemTraMa(code, tongTienHang) {
    const ma = await timMaTheoCode(code)
    if (!ma) return { ok: false, error: 'Mã giảm giá không tồn tại' }
    if (ma.kichHoat === false) return { ok: false, error: 'Mã giảm giá đã ngừng áp dụng' }
    if (ma.hetHan && new Date(ma.hetHan) < new Date()) {
        return { ok: false, error: 'Mã giảm giá đã hết hạn' }
    }
    if (ma.donToiThieu && tongTienHang < ma.donToiThieu) {
        return { ok: false, error: `Đơn tối thiểu ${formatVND(ma.donToiThieu)} mới dùng được mã này` }
    }
    const tienGiam = Math.round(tongTienHang * ma.phanTramGiam / 100)
    return { ok: true, ma, tienGiam }
}
