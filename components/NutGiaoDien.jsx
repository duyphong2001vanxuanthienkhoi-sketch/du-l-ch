'use client'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

// Nút bật/tắt CHỢ ĐÊM (giao diện tối) — thêm/bỏ class `dark` trên <html> và lưu
// lựa chọn vào localStorage 'giao-dien' ('toi' | 'sang'). Khi tải trang, script nhỏ
// trong app/layout.jsx áp lại lựa chọn TRƯỚC khi React chạy để không chớp trắng.
export default function NutGiaoDien() {
    // Đọc trạng thái thật sau khi mount (server không biết localStorage nên render
    // mặc định là "sáng" — tránh lệch hydration)
    const [toi, setToi] = useState(false)
    useEffect(() => { setToi(document.documentElement.classList.contains('dark')) }, [])

    const doi = () => {
        const moi = !toi
        setToi(moi)
        document.documentElement.classList.toggle('dark', moi)
        // Thanh trạng thái điện thoại (PWA) đổi màu theo — khớp nền Chợ Đêm/sáng
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', moi ? '#0a1626' : '#ffffff')
        try { localStorage.setItem('giao-dien', moi ? 'toi' : 'sang') } catch { /* chặn private mode */ }
    }

    return (
        <button onClick={doi} type='button'
            aria-label={toi ? 'Tắt Chợ Đêm' : 'Bật Chợ Đêm (giao diện tối)'}
            className='flex items-center justify-center size-9 sm:size-10 shrink-0 bg-slate-100 hover:bg-slate-200 transition rounded-full text-slate-600'>
            {toi ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    )
}
