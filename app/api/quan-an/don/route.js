import { NextResponse } from 'next/server'
import { yeuCauChuQuanDaDuyet } from '@/lib/server/quyen'
import { donTheoQuan } from '@/lib/server/donDoAnDb'

// GET /api/quan-an/don — đơn đặt món gửi tới quán của mình (chủ quán).
// Trang quản lý đơn poll API này để hiện đơn mới + kêu chuông.
export async function GET() {
    const quyen = await yeuCauChuQuanDaDuyet()
    if (!quyen) return NextResponse.json({ error: 'Chỉ chủ quán đã duyệt mới được xem đơn' }, { status: 403 })
    const dons = await donTheoQuan(quyen.quan.id)
    return NextResponse.json({ dons })
}
