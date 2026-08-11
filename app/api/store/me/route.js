import { NextResponse } from 'next/server'
import { layPhien } from '@/lib/server/phien'
import { timGianTheoUserId } from '@/lib/server/storeDb'

// Trả về gian hàng của CHÍNH người đang đăng nhập (kèm trạng thái duyệt)
export async function GET() {
    const phien = await layPhien()
    if (!phien) return NextResponse.json({ store: null })

    const gian = await timGianTheoUserId(phien.sub)
    return NextResponse.json({ store: gian })
}
