import { NextResponse } from 'next/server'
import { layNguoiDungHienTai } from '@/lib/server/quyen'
import { hoiThoaiCuaKhach } from '@/lib/server/tinNhanDb'

// GET /api/tin-nhan — danh sách hội thoại của KHÁCH đang đăng nhập (hộp thư khách).
export async function GET() {
    const user = await layNguoiDungHienTai()
    if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 })
    const hoiThoais = await hoiThoaiCuaKhach(user.id)
    return NextResponse.json({ hoiThoais })
}
