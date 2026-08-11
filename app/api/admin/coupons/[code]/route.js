import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import { xoaMa } from '@/lib/server/couponDb'

// DELETE /api/admin/coupons/[code] — chỉ admin, xóa 1 mã giảm giá
export async function DELETE(request, { params }) {
    if (!await yeuCauAdmin()) {
        return NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })
    }

    const { code } = await params
    const ok = await xoaMa(code)
    if (!ok) return NextResponse.json({ error: 'Không tìm thấy mã giảm giá' }, { status: 404 })

    return NextResponse.json({ ok: true })
}
