import { NextResponse } from 'next/server'
import { kiemTraMa } from '@/lib/server/couponDb'

// POST /api/coupons/check  body: { code, tongTien }
// API công khai — khách bấm "Áp dụng" để kiểm mã trước khi đặt.
// Đây chỉ là bước hiển thị trước; API đặt đơn vẫn KIỂM LẠI để chống gian lận.
export async function POST(request) {
    try {
        const { code, tongTien } = await request.json()
        const kq = await kiemTraMa(code, Number(tongTien) || 0)
        if (!kq.ok) return NextResponse.json({ error: kq.error }, { status: 400 })

        return NextResponse.json({
            code: kq.ma.code,
            moTa: kq.ma.moTa,
            phanTramGiam: kq.ma.phanTramGiam,
            donToiThieu: kq.ma.donToiThieu,
            tienGiam: kq.tienGiam,
        })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
