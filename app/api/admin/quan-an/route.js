import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import { danhSachQuanAn } from '@/lib/server/quanAnDb'
import { timTheoId } from '@/lib/server/userDb'

// GET /api/admin/quan-an?status=cho_duyet|da_duyet|tu_choi|all
// Chỉ admin — danh sách quán ăn kèm email chủ tài khoản để đối chiếu.
export async function GET(request) {
    if (!await yeuCauAdmin()) {
        return NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })
    }
    const status = request.nextUrl.searchParams.get('status') || 'all'
    const quans = await danhSachQuanAn(status === 'all' ? {} : { status })
    const kq = await Promise.all(quans.map(async q => {
        const chu = await timTheoId(q.userId)
        return { ...q, emailChu: chu?.email || '(không rõ)' }
    }))
    return NextResponse.json({ quanAns: kq })
}
