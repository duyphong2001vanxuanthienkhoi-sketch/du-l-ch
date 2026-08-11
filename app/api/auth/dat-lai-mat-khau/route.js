import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { timTheoEmail, capNhatNguoiDung, anThongTinNhayCam } from '@/lib/server/userDb'
import { taoPhien } from '@/lib/server/phien'

// Bước 2 của luồng quên mật khẩu: kiểm tra mã trong link email rồi đổi mật khẩu mới.
// Đổi xong tự đăng nhập luôn cho tiện.
export async function POST(request) {
    try {
        const { email, token, password } = await request.json()

        if (!password || password.length < 6) {
            return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' }, { status: 400 })
        }

        const user = await timTheoEmail(email || '')
        const datLai = user?.datLai
        const tokenHash = crypto.createHash('sha256').update(String(token || '')).digest('hex')
        const hopLe = datLai?.tokenHash
            && crypto.timingSafeEqual(Buffer.from(datLai.tokenHash), Buffer.from(tokenHash))
            && new Date(datLai.hetHan) > new Date()

        if (!hopLe) {
            return NextResponse.json(
                { error: 'Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại email mới.' },
                { status: 400 }
            )
        }

        const passwordHash = await bcrypt.hash(password, 10)
        // Đổi mật khẩu và xóa mã đặt lại — mỗi link chỉ dùng được một lần
        const userMoi = await capNhatNguoiDung(user.id, { passwordHash, datLai: null })

        await taoPhien(userMoi)
        return NextResponse.json({ user: anThongTinNhayCam(userMoi) })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
