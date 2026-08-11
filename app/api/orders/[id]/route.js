import { NextResponse } from 'next/server'
import { layPhien } from '@/lib/server/phien'
import { khachHuyDon, khachYeuCauHoan } from '@/lib/server/orderDb'

// PATCH /api/orders/[id] — hành động của KHÁCH trên đơn của mình:
//  { hanhDong: 'huy' }                 — hủy đơn (chỉ khi còn 'chờ xác nhận')
//  { hanhDong: 'yeu_cau_hoan', lyDo }  — yêu cầu hoàn hàng (chỉ khi 'đã giao')
export async function PATCH(request, { params }) {
    const phien = await layPhien()
    if (!phien) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 })

    const { id } = await params
    const { hanhDong, lyDo } = await request.json()

    let kq
    if (hanhDong === 'huy') kq = await khachHuyDon(id, phien.sub)
    else if (hanhDong === 'yeu_cau_hoan') kq = await khachYeuCauHoan(id, phien.sub, lyDo)
    else return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 })

    if (kq?.error) return NextResponse.json({ error: kq.error }, { status: 400 })
    return NextResponse.json({ ok: true, don: kq.don })
}
