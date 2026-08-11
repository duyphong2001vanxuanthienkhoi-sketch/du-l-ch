import { NextResponse } from 'next/server'
import { layPhien } from '@/lib/server/phien'
import { danhSachDonTheoKhach } from '@/lib/server/orderDb'
import { daDanhGia } from '@/lib/server/ratingDb'

// GET /api/orders/me — đơn hàng của khách đang đăng nhập.
// Mỗi item được gắn thêm:
//  - daGiao:    phần gian chứa item đã giao chưa (đủ điều kiện đánh giá)
//  - daDanhGia: khách đã đánh giá item này trong đơn chưa
export async function GET() {
    const phien = await layPhien()
    if (!phien) return NextResponse.json({ orders: null })

    const dons = await danhSachDonTheoKhach(phien.sub)
    const orders = await Promise.all(dons.map(async don => ({
        ...don,
        items: await Promise.all(don.items.map(async it => ({
            ...it,
            daGiao: don.statusTheoGian[it.storeId] === 'da_giao',
            daDanhGia: await daDanhGia(don.id, it.productId, phien.sub),
        }))),
    })))

    return NextResponse.json({ orders })
}
