import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import { hoiThoaiHoTro } from '@/lib/server/tinNhanDb'

// GET /api/admin/tin-nhan — hộp thư HỖ TRỢ của admin: danh sách khách đã nhắn tới.
export async function GET() {
    const admin = await yeuCauAdmin()
    if (!admin) return NextResponse.json({ error: 'Chỉ dành cho quản trị viên' }, { status: 403 })

    const hoiThoais = await hoiThoaiHoTro()
    return NextResponse.json({ hoiThoais })
}
