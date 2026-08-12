// Phiên đăng nhập: JWT ký bằng HS256, lưu trong cookie HTTP-only
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const TEN_COOKIE = 'phien'

// AUTH_SECRET — khóa ký phiên. KHÔNG có chuỗi mặc định ghi cứng: mã nguồn dự án này
// công khai trên GitHub, nên mặc định nào nằm trong file cũng coi như ai cũng biết,
// và quên khai biến là bất kỳ ai cũng tự ký được phiên admin hợp lệ.
//
// Thiếu biến thì báo lỗi NGAY khi cần dùng (đăng nhập / đọc phiên) thay vì chạy tiếp
// bằng khóa ai cũng đoán được.
function layBiMat() {
    const s = process.env.AUTH_SECRET
    if (!s) {
        throw new Error(
            'Thiếu AUTH_SECRET. Sinh chuỗi ngẫu nhiên rồi khai vào .env.local (chạy máy) ' +
            'hoặc Environment Variables trên Vercel (khi triển khai):\n' +
            '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"',
        )
    }
    return new TextEncoder().encode(s)
}

export async function taoPhien(user) {
    const token = await new SignJWT({ sub: user.id, role: user.role })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(layBiMat())

    const khoCookie = await cookies()
    khoCookie.set(TEN_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    })
}

export async function layPhien() {
    const khoCookie = await cookies()
    const token = khoCookie.get(TEN_COOKIE)?.value
    if (!token) return null
    try {
        const { payload } = await jwtVerify(token, layBiMat())
        return payload // { sub: userId, role }
    } catch {
        return null
    }
}

export async function xoaPhien() {
    const khoCookie = await cookies()
    khoCookie.delete(TEN_COOKIE)
}
