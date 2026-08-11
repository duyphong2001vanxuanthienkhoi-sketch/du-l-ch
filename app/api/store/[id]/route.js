import { NextResponse } from 'next/server'
import { timGianTheoId } from '@/lib/server/storeDb'

// GET /api/store/[id] — thông tin công khai của MỘT gian.
// Chỉ trả gian 'da_duyet'; gian chờ duyệt/từ chối coi như không tồn tại với khách.
export async function GET(request, { params }) {
    const { id } = await params
    const gian = await timGianTheoId(id)

    if (!gian || gian.status !== 'da_duyet') {
        return NextResponse.json({ error: 'Không tìm thấy gian hàng' }, { status: 404 })
    }

    return NextResponse.json({
        store: {
            id: gian.id,
            tenGian: gian.tenGian,
            tenChu: gian.tenChu,
            soDienThoai: gian.soDienThoai,
            loaiGian: gian.loaiGian,
            moTa: gian.moTa,
            logo: gian.logo,
            createdAt: gian.createdAt,
        }
    })
}
