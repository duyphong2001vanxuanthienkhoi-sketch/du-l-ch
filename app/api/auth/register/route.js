import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { taoNguoiDung, timTheoEmail, anThongTinNhayCam } from '@/lib/server/userDb'
import { taoPhien } from '@/lib/server/phien'

export async function POST(request) {
    try {
        const { name, email, password } = await request.json()

        if (!name?.trim()) return NextResponse.json({ error: 'Vui lòng nhập họ tên' }, { status: 400 })
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
        if (!password || password.length < 6) return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 })

        if (await timTheoEmail(email)) {
            return NextResponse.json({ error: 'Email này đã được đăng ký' }, { status: 409 })
        }

        const passwordHash = await bcrypt.hash(password, 10)
        // Người mới đăng ký mặc định là khách mua hàng.
        // taoNguoiDung kiểm trùng email lần cuối bên trong khóa ghi (chống đăng ký trùng lúc)
        const kq = await taoNguoiDung({ name: name.trim(), email, passwordHash, role: 'khach' })
        if (kq.trungEmail) {
            return NextResponse.json({ error: 'Email này đã được đăng ký' }, { status: 409 })
        }
        await taoPhien(kq.user)

        return NextResponse.json({ user: anThongTinNhayCam(kq.user) })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
