import { NextResponse } from 'next/server'
import { layNguoiDungHienTai } from '@/lib/server/quyen'
import { donTheoKhach } from '@/lib/server/donDoAnDb'

// GET /api/don-do-an/me — các đơn đặt món của khách đang đăng nhập (để theo dõi trạng thái)
export async function GET() {
    try {
        const user = await layNguoiDungHienTai()
        if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 })
        const dons = await donTheoKhach(user.id)
        return NextResponse.json({ dons })
    } catch {
        return NextResponse.json({ dons: [] })
    }
}
