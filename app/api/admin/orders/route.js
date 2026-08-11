import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import { danhSachTatCaDon } from '@/lib/server/orderDb'

// GET /api/admin/orders — admin xem TẤT CẢ đơn hàng toàn chợ
export async function GET() {
    if (!await yeuCauAdmin()) {
        return NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })
    }

    const orders = await danhSachTatCaDon()
    return NextResponse.json({ orders })
}
