import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { timTheoEmail, anThongTinNhayCam } from '@/lib/server/userDb'
import { taoPhien } from '@/lib/server/phien'

export async function POST(request) {
    try {
        const { email, password } = await request.json()

        const user = await timTheoEmail(email)
        const hopLe = user && await bcrypt.compare(password || '', user.passwordHash)
        if (!hopLe) {
            return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng' }, { status: 401 })
        }

        await taoPhien(user)
        return NextResponse.json({ user: anThongTinNhayCam(user) })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
