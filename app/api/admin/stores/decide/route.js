import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import { timGianTheoId, capNhatGianHang } from '@/lib/server/storeDb'

// POST /api/admin/stores/decide  { storeId, quyetDinh: 'da_duyet' | 'tu_choi' }
// Chỉ admin — GHI stores.json: đổi trạng thái gian
export async function POST(request) {
    const admin = await yeuCauAdmin()
    if (!admin) {
        return NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })
    }

    const { storeId, quyetDinh } = await request.json()
    if (!['da_duyet', 'tu_choi'].includes(quyetDinh)) {
        return NextResponse.json({ error: 'Quyết định không hợp lệ' }, { status: 400 })
    }

    const gian = await timGianTheoId(storeId)
    if (!gian) return NextResponse.json({ error: 'Không tìm thấy gian hàng' }, { status: 404 })

    const daCapNhat = await capNhatGianHang(storeId, {
        status: quyetDinh,
        quyetDinhLuc: new Date().toISOString(),
        quyetDinhBoi: admin.email,
    })

    return NextResponse.json({ store: daCapNhat })
}
