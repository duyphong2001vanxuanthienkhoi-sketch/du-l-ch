import { NextResponse } from 'next/server'
import { danhSachLoTrinh, timLoTrinhTheoId } from '@/lib/server/loTrinhDb'

// API CÔNG KHAI của lộ trình & bộ sưu tập — không cần đăng nhập.
//
// GET /api/lo-trinh                -> { loTrinhs }  (lọc ?kieu=lo_trinh|bo_suu_tap)
// GET /api/lo-trinh?id=<slug>      -> { loTrinh }
export async function GET(request) {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
        const kieu = request.nextUrl.searchParams.get('kieu') || undefined
        try {
            return NextResponse.json({ loTrinhs: await danhSachLoTrinh({ status: 'da_duyet', kieu }) })
        } catch {
            // Chưa chạy `npm run tao-bang-du-lich` thì chưa có bảng — trả rỗng thay vì lỗi 500
            return NextResponse.json({ loTrinhs: [] })
        }
    }

    try {
        const loTrinh = await timLoTrinhTheoId(id)
        if (!loTrinh || loTrinh.status !== 'da_duyet') {
            return NextResponse.json({ error: 'Không tìm thấy lộ trình' }, { status: 404 })
        }
        return NextResponse.json({ loTrinh })
    } catch {
        return NextResponse.json({ error: 'Không tải được lộ trình' }, { status: 500 })
    }
}
