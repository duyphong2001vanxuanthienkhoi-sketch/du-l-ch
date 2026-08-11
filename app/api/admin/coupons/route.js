import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import { danhSachMa, taoMa, timMaTheoCode, chuanHoaCode } from '@/lib/server/couponDb'

// GET /api/admin/coupons — chỉ admin, liệt kê toàn bộ mã giảm giá
export async function GET() {
    if (!await yeuCauAdmin()) {
        return NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })
    }
    return NextResponse.json({ coupons: await danhSachMa() })
}

// POST /api/admin/coupons — chỉ admin, tạo mã mới
// body: { code, moTa, phanTramGiam, donToiThieu, hetHan }
export async function POST(request) {
    if (!await yeuCauAdmin()) {
        return NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })
    }

    try {
        const { code, moTa, phanTramGiam, donToiThieu, hetHan } = await request.json()

        const c = chuanHoaCode(code)
        if (!/^[A-Z0-9]{3,20}$/.test(c)) {
            return NextResponse.json({ error: 'Mã chỉ gồm chữ và số, dài 3–20 ký tự' }, { status: 400 })
        }

        const pt = Number(phanTramGiam)
        if (!Number.isInteger(pt) || pt < 1 || pt > 100) {
            return NextResponse.json({ error: 'Mức giảm phải là số nguyên từ 1 đến 100%' }, { status: 400 })
        }

        const dtt = Number(donToiThieu)
        if (!Number.isFinite(dtt) || dtt < 0) {
            return NextResponse.json({ error: 'Đơn tối thiểu không hợp lệ' }, { status: 400 })
        }

        // hetHan: cho phép trống (không hết hạn) hoặc một ngày hợp lệ
        let hetHanISO = null
        if (hetHan) {
            const d = new Date(hetHan)
            if (isNaN(d)) return NextResponse.json({ error: 'Ngày hết hạn không hợp lệ' }, { status: 400 })
            hetHanISO = d.toISOString()
        }

        if (await timMaTheoCode(c)) {
            return NextResponse.json({ error: 'Mã này đã tồn tại' }, { status: 409 })
        }

        const ma = await taoMa({
            code: c,
            moTa: String(moTa || '').trim(),
            phanTramGiam: pt,
            donToiThieu: Math.round(dtt),
            hetHan: hetHanISO,
        })
        return NextResponse.json({ coupon: ma })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
