import { NextResponse } from 'next/server'
import { yeuCauChuQuanDaDuyet } from '@/lib/server/quyen'
import { hoiThoaiCuaQuan } from '@/lib/server/tinNhanDb'

// GET /api/quan-an/tin-nhan — danh sách hội thoại gửi tới quán của mình (hộp thư chủ quán).
export async function GET() {
    const quyen = await yeuCauChuQuanDaDuyet()
    if (!quyen) return NextResponse.json({ error: 'Chỉ chủ quán đã duyệt mới xem được' }, { status: 403 })
    const hoiThoais = await hoiThoaiCuaQuan(quyen.quan.id)
    return NextResponse.json({ hoiThoais, quanAnId: quyen.quan.id })
}
