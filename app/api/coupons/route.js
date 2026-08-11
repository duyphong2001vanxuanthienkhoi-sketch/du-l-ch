import { NextResponse } from 'next/server'
import { danhSachMa } from '@/lib/server/couponDb'

// GET /api/coupons — các mã ĐANG CÒN HIỆU LỰC, để quảng bá công khai (banner khuyến mãi).
// Mã giảm giá vốn để phát cho khách nên hiển thị công khai là bình thường.
export async function GET() {
    const now = new Date()
    const list = (await danhSachMa())
        .filter(m => m.kichHoat !== false && (!m.hetHan || new Date(m.hetHan) >= now))
        .map(m => ({ code: m.code, moTa: m.moTa, phanTramGiam: m.phanTramGiam, donToiThieu: m.donToiThieu }))
    return NextResponse.json({ coupons: list })
}
