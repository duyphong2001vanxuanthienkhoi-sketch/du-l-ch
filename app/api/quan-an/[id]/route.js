import { NextResponse } from 'next/server'
import { timQuanAnTheoId } from '@/lib/server/quanAnDb'
import { monTheoQuan } from '@/lib/server/monAnDb'

// GET /api/quan-an/[id] — công khai: thông tin quán + thực đơn (chỉ quán 'da_duyet').
// Trả cả danh sách "phần" (nhóm món) theo thứ tự xuất hiện để trang gom nhóm.
export async function GET(_request, { params }) {
    try {
        const { id } = await params
        const quan = await timQuanAnTheoId(id)
        if (!quan || quan.status !== 'da_duyet') {
            return NextResponse.json({ quanAn: null, thucDon: [] }, { status: 404 })
        }

        const mon = await monTheoQuan(id)
        const thucDon = mon.map(m => ({
            id: m.id, ten: m.ten, moTa: m.moTa, gia: m.gia, phan: m.phan, anh: m.anh, con: m.con,
        }))

        return NextResponse.json({
            quanAn: {
                id: quan.id, ten: quan.ten, tenChu: quan.tenChu, soDienThoai: quan.soDienThoai,
                diaChi: quan.diaChi, moTa: quan.moTa, gioMoCua: quan.gioMoCua, gioDongCua: quan.gioDongCua, logo: quan.logo,
            },
            thucDon,
        })
    } catch {
        return NextResponse.json({ quanAn: null, thucDon: [] }, { status: 404 })
    }
}
