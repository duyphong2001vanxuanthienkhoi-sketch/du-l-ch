'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// Nguồn phiên đăng nhập DÙNG CHUNG cho toàn app.
// Trước đây mỗi thành phần (Navbar, đầu trang chủ, giỏ hàng, trang tài khoản,
// khu admin/gian hàng) tự gọi /api/auth/me → một lần mở trang gọi 2-3 lần trùng
// nhau, lại hay nháy trạng thái đăng nhập. Giờ chỉ gọi MỘT lần ở đây rồi chia sẻ.
//
// user: undefined = đang tải · null = chưa đăng nhập · object = đã đăng nhập
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(undefined)

    const taiLai = useCallback(async () => {
        try {
            const r = await fetch('/api/auth/me')
            const d = await r.json()
            setUser(d.user ?? null)
            return d.user ?? null
        } catch {
            setUser(null)
            return null
        }
    }, [])

    useEffect(() => { taiLai() }, [taiLai])

    return (
        <AuthContext.Provider value={{ user, setUser, taiLai }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    // Phòng khi dùng ngoài provider: trả mặc định an toàn (coi như đang tải)
    return useContext(AuthContext) || { user: undefined, setUser: () => { }, taiLai: async () => null }
}
