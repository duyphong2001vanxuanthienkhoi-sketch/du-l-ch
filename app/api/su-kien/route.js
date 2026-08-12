import { NextResponse } from 'next/server'
import { danhSachSuKien, timSuKienTheoId } from '@/lib/server/suKienDb'

// API CÔNG KHAI của sự kiện & lễ hội — không cần đăng nhập.
//
// GET /api/su-kien             -> { suKiens }
// GET /api/su-kien?id=<slug>   -> { suKien }
export async function GET(request) {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
        try {
            return NextResponse.json({ suKiens: await danhSachSuKien({ status: 'da_duyet' }) })
        } catch {
            return NextResponse.json({ suKiens: [] })
        }
    }

    try {
        const suKien = await timSuKienTheoId(id)
        if (!suKien || suKien.status !== 'da_duyet') {
            return NextResponse.json({ error: 'Không tìm thấy sự kiện' }, { status: 404 })
        }
        return NextResponse.json({ suKien })
    } catch {
        return NextResponse.json({ error: 'Không tải được sự kiện' }, { status: 500 })
    }
}
