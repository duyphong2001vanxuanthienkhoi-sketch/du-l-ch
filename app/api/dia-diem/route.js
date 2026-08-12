import { NextResponse } from 'next/server'
import { danhSachDiaDiem, timDiaDiemTheoId, tangLuotXem } from '@/lib/server/diaDiemDb'

// API CÔNG KHAI của địa điểm — không cần đăng nhập (guest-first).
//
// GET /api/dia-diem              -> { diaDiems }  danh sách ĐÃ DUYỆT, lọc ?loai=
// GET /api/dia-diem?id=<slug>    -> { diaDiem }   chi tiết một địa điểm
//
// Chưa chạy `npm run tao-bang-du-lich` thì trả rỗng thay vì lỗi 500, để giao diện
// hiện trạng thái "chưa có địa điểm nào" thay vì màn hình vỡ.
export async function GET(request) {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
        const loai = request.nextUrl.searchParams.get('loai') || undefined
        try {
            return NextResponse.json({ diaDiems: await danhSachDiaDiem({ status: 'da_duyet', loai }) })
        } catch {
            return NextResponse.json({ diaDiems: [] })
        }
    }

    try {
        const diaDiem = await timDiaDiemTheoId(id)
        if (!diaDiem || diaDiem.status !== 'da_duyet') {
            return NextResponse.json({ error: 'Không tìm thấy địa điểm' }, { status: 404 })
        }
        // Đếm lượt xem — hàm tự nuốt lỗi, không chặn trả kết quả
        tangLuotXem(id)
        return NextResponse.json({ diaDiem })
    } catch {
        return NextResponse.json({ error: 'Không tải được địa điểm' }, { status: 500 })
    }
}
