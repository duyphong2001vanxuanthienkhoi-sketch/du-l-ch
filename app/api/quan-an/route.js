import { NextResponse } from 'next/server'
import { danhSachQuanAn } from '@/lib/server/quanAnDb'

// GET /api/quan-an — công khai cho khách. CHỈ trả quán 'da_duyet'.
// Bọc try/catch để nếu chưa chạy `npm run tao-bang` (bảng chưa có) thì trả rỗng
// thay vì lỗi 500 — trang Đồ Ăn vẫn hiện trạng thái "chưa có quán".
export async function GET() {
    try {
        const quans = await danhSachQuanAn({ status: 'da_duyet' })
        const congKhai = quans.map(q => ({
            id: q.id,
            ten: q.ten,
            moTa: q.moTa,
            diaChi: q.diaChi,
            gioMoCua: q.gioMoCua,
            gioDongCua: q.gioDongCua,
            loai: q.loai || [],
            nhom: q.nhom || [],
            logo: q.logo,
        }))
        return NextResponse.json({ quanAns: congKhai })
    } catch {
        return NextResponse.json({ quanAns: [] })
    }
}
