import { NextResponse } from 'next/server'
import { layNguoiDungHienTai } from '@/lib/server/quyen'
import { luuDangKy, xoaDangKy } from '@/lib/server/pushDb'

// POST /api/push/dang-ky  body: { subscription } — lưu đăng ký nhận thông báo đẩy cho thiết bị này.
export async function POST(request) {
    const user = await layNguoiDungHienTai()
    if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 })
    try {
        const { subscription } = await request.json()
        if (!subscription?.endpoint) return NextResponse.json({ error: 'Thiếu subscription' }, { status: 400 })
        await luuDangKy(user.id, subscription)
        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}

// DELETE /api/push/dang-ky  body: { endpoint } — tắt thông báo trên thiết bị này.
export async function DELETE(request) {
    try {
        const { endpoint } = await request.json()
        await xoaDangKy(endpoint)
        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}
