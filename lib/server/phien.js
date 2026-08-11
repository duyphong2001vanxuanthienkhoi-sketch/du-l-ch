// Phiên đăng nhập: JWT ký bằng HS256, lưu trong cookie HTTP-only
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const TEN_COOKIE = 'phien'
const BI_MAT = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'chosohonggai-demo-secret-hay-doi-khi-len-that'
)

export async function taoPhien(user) {
    const token = await new SignJWT({ sub: user.id, role: user.role })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(BI_MAT)

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
        const { payload } = await jwtVerify(token, BI_MAT)
        return payload // { sub: userId, role }
    } catch {
        return null
    }
}

export async function xoaPhien() {
    const khoCookie = await cookies()
    khoCookie.delete(TEN_COOKIE)
}
