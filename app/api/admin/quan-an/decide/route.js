import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import { timQuanAnTheoId, capNhatQuanAn } from '@/lib/server/quanAnDb'

// POST /api/admin/quan-an/decide  { quanAnId, quyetDinh: 'da_duyet' | 'tu_choi' }
// Chỉ admin — duyệt hoặc từ chối một quán ăn.
export async function POST(request) {
    const admin = await yeuCauAdmin()
    if (!admin) return NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })

    const { quanAnId, quyetDinh } = await request.json()
    if (!['da_duyet', 'tu_choi'].includes(quyetDinh)) {
        return NextResponse.json({ error: 'Quyết định không hợp lệ' }, { status: 400 })
    }

    const quan = await timQuanAnTheoId(quanAnId)
    if (!quan) return NextResponse.json({ error: 'Không tìm thấy quán ăn' }, { status: 404 })

    const daCapNhat = await capNhatQuanAn(quanAnId, {
        status: quyetDinh,
        quyetDinhLuc: new Date().toISOString(),
        quyetDinhBoi: admin.email,
    })
    return NextResponse.json({ quanAn: daCapNhat })
}
