import { NextResponse } from 'next/server'
import { yeuCauChuQuanDaDuyet } from '@/lib/server/quyen'
import { monTheoQuan, taoMon } from '@/lib/server/monAnDb'
import { luuAnhUpload } from '@/lib/server/luuAnh'

// GET /api/quan-an/mon — thực đơn của quán mình (chủ quán)
export async function GET() {
    const quyen = await yeuCauChuQuanDaDuyet()
    if (!quyen) return NextResponse.json({ error: 'Chỉ chủ quán đã duyệt mới được truy cập' }, { status: 403 })
    const mon = await monTheoQuan(quyen.quan.id)
    return NextResponse.json({ mon })
}

// POST /api/quan-an/mon — thêm một món vào thực đơn (chủ quán)
export async function POST(request) {
    try {
        const quyen = await yeuCauChuQuanDaDuyet()
        if (!quyen) return NextResponse.json({ error: 'Chỉ chủ quán đã duyệt mới được thêm món' }, { status: 403 })

        const form = await request.formData()
        const ten = String(form.get('ten') || '').trim()
        const moTa = String(form.get('moTa') || '').trim()
        const gia = Number(form.get('gia'))
        const phan = String(form.get('phan') || '').trim() || 'Món khác'
        const anhFile = form.get('anh')

        if (!ten) return NextResponse.json({ error: 'Vui lòng nhập tên món' }, { status: 400 })
        if (!Number.isFinite(gia) || gia <= 0) return NextResponse.json({ error: 'Giá món phải là số dương (VNĐ)' }, { status: 400 })

        let anh = ''
        if (anhFile && typeof anhFile !== 'string') {
            try { anh = await luuAnhUpload(anhFile, 'mon') }
            catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }) }
        }

        const mon = await taoMon({ quanAnId: quyen.quan.id, ten, moTa, gia, phan, anh })
        return NextResponse.json({ mon })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
