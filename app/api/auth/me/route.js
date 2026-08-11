import { NextResponse } from 'next/server'
import { layPhien } from '@/lib/server/phien'
import { timTheoId, capNhatNguoiDung, anThongTinNhayCam } from '@/lib/server/userDb'

export async function GET() {
    const phien = await layPhien()
    if (!phien) return NextResponse.json({ user: null })

    // Đọc lại từ kho để vai trò luôn mới nhất (kể cả khi đổi sau lúc đăng nhập)
    const user = await timTheoId(phien.sub)
    return NextResponse.json({ user: anThongTinNhayCam(user) })
}

// PATCH /api/auth/me — khách tự sửa thông tin cá nhân (hiện chỉ đổi tên hiển thị)
export async function PATCH(request) {
    const phien = await layPhien()
    if (!phien) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 })

    try {
        const { name } = await request.json()
        const ten = String(name || '').trim()
        if (!ten) return NextResponse.json({ error: 'Vui lòng nhập họ tên' }, { status: 400 })
        if (ten.length > 60) return NextResponse.json({ error: 'Họ tên tối đa 60 ký tự' }, { status: 400 })

        const user = await capNhatNguoiDung(phien.sub, { name: ten })
        if (!user) return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 })

        return NextResponse.json({ user: anThongTinNhayCam(user) })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
