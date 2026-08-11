'use client'
// Đa ngôn ngữ NHẸ cho toàn app (Việt / Anh / Trung) — không cần thư viện ngoài.
// Cách dùng trong component:
//     const { t, lang, doiNgonNgu } = useNgonNgu()
//     <span>{t('Trang chủ', 'Home', '首页')}</span>   // t(bản Việt, bản Anh, bản Trung)
// App vốn viết tiếng Việt nên để tiếng Việt làm MẶC ĐỊNH (đối số 1). Chỗ nào đã dịch thì
// truyền thêm bản Anh (đối số 2) và/hoặc Trung (đối số 3); thiếu bản nào thì tự lùi về tiếng Việt
// (không vỡ giao diện).
//
// Lưu ý hydration: server + LẦN render đầu ở client luôn dùng 'vi' để khớp HTML prerender,
// sau khi mount mới đọc lựa chọn đã lưu và đổi — tránh lỗi "text content mismatch" trên Vercel.
import { createContext, useContext, useEffect, useState } from 'react'

const KEY = 'ngon-ngu'
const HOP_LE = ['vi', 'en', 'zh']
const NgonNguContext = createContext({ lang: 'vi', doiNgonNgu: () => {}, t: (vi) => vi })

export function NgonNguProvider({ children }) {
    const [lang, setLang] = useState('vi')

    // Sau mount: đọc lựa chọn đã lưu (localStorage) rồi áp dụng
    useEffect(() => {
        try {
            const luu = localStorage.getItem(KEY)
            if (HOP_LE.includes(luu)) {
                setLang(luu)
                document.documentElement.lang = luu
            }
        } catch { /* bỏ qua */ }
    }, [])

    const doiNgonNgu = (ngn) => {
        const v = HOP_LE.includes(ngn) ? ngn : 'vi'
        setLang(v)
        try { localStorage.setItem(KEY, v) } catch { /* bỏ qua */ }
        try { document.cookie = `${KEY}=${v}; path=/; max-age=31536000; samesite=lax` } catch { /* bỏ qua */ }
        try { document.documentElement.lang = v } catch { /* bỏ qua */ }
    }

    // t(vi, en, zh): trả bản đúng ngôn ngữ đang chọn; thiếu bản nào thì lùi về tiếng Việt.
    const t = (vi, en, zh) => {
        if (lang === 'en') return en != null ? en : vi
        if (lang === 'zh') return zh != null ? zh : vi
        return vi
    }

    return <NgonNguContext.Provider value={{ lang, doiNgonNgu, t }}>{children}</NgonNguContext.Provider>
}

export function useNgonNgu() {
    return useContext(NgonNguContext)
}
