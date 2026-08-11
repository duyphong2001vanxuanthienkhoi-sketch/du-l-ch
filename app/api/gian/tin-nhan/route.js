import { NextResponse } from 'next/server'
import { yeuCauTieuThuongDaDuyet } from '@/lib/server/quyen'
import { hoiThoaiCuaQuan } from '@/lib/server/tinNhanDb'

// GET /api/gian/tin-nhan — danh sách hội thoại khách gửi tới GIAN HÀNG của mình (hộp thư chủ gian).
// Dùng chung hoiThoaiCuaQuan vì hội thoại của gian cũng lưu id gian ở trường quanAnId.
export async function GET() {
    const quyen = await yeuCauTieuThuongDaDuyet()
    if (!quyen) return NextResponse.json({ error: 'Chỉ chủ gian đã duyệt mới xem được' }, { status: 403 })
    const hoiThoais = await hoiThoaiCuaQuan(quyen.gian.id)
    return NextResponse.json({ hoiThoais, gianId: quyen.gian.id })
}
