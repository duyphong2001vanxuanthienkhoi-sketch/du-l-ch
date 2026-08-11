import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import { danhSachGian } from '@/lib/server/storeDb'
import { timTheoId } from '@/lib/server/userDb'

// GET /api/admin/stores?status=cho_duyet|da_duyet|tu_choi|all
// Chỉ admin — trả danh sách gian kèm email chủ tài khoản
export async function GET(request) {
    if (!await yeuCauAdmin()) {
        return NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })
    }

    const status = request.nextUrl.searchParams.get('status') || 'all'
    const gians = await danhSachGian(status === 'all' ? {} : { status })

    // ĐỌC users.json để gắn thêm email chủ gian cho admin đối chiếu
    const keTQua = await Promise.all(gians.map(async g => {
        const chu = await timTheoId(g.userId)
        return { ...g, emailChu: chu?.email || '(không rõ)' }
    }))

    return NextResponse.json({ stores: keTQua })
}
