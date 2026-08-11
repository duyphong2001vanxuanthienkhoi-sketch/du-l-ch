import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import { sql } from '@/lib/server/db'
import { danhSachTatCaDon } from '@/lib/server/orderDb'

// GET /api/admin/thong-ke — số liệu THẬT cho trang tổng quan quản trị
// (thay cho dữ liệu demo của template cũ): tổng sản phẩm, gian đã duyệt,
// tổng đơn, doanh thu toàn chợ và danh sách ngày tạo đơn cho biểu đồ.
export async function GET() {
    if (!await yeuCauAdmin()) {
        return NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })
    }

    const [dons, demSanPham, demGian] = await Promise.all([
        danhSachTatCaDon(),
        sql`SELECT count(*)::int AS n FROM products`,
        sql`SELECT count(*)::int AS n FROM stores WHERE data->>'status' = 'da_duyet'`,
    ])

    // Doanh thu toàn chợ = tổng tiền khách phải trả của mọi đơn (đã trừ mã giảm)
    const doanhThu = dons.reduce((s, o) => s + (o.tongTien || 0), 0)

    return NextResponse.json({
        tongSanPham: demSanPham[0].n,
        tongGian: demGian[0].n,
        tongDon: dons.length,
        doanhThu,
        // Chỉ cần ngày tạo cho biểu đồ đơn/ngày — không gửi cả đơn (gọn và kín thông tin)
        ngayTaoDon: dons.map(o => o.createdAt),
    })
}
