import { NextResponse } from 'next/server'
import { layNguoiDungHienTai } from '@/lib/server/quyen'
import { timQuanAnTheoUserId } from '@/lib/server/quanAnDb'

// GET /api/quan-an/me — quán ăn của chính người đang đăng nhập (mọi trạng thái).
// Chưa có quán -> { quanAn: null }. Chưa đăng nhập -> 401.
export async function GET() {
    try {
        const user = await layNguoiDungHienTai()
        if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 })
        const quan = await timQuanAnTheoUserId(user.id)
        return NextResponse.json({ quanAn: quan || null })
    } catch {
        return NextResponse.json({ quanAn: null })
    }
}
