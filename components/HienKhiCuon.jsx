'use client'
import { useEffect, useRef } from 'react'

// Khối hiện dần khi người dùng cuộn tới (IntersectionObserver, chỉ chạy 1 lần).
// CSS ở globals.css: .hien-cuon (ẩn) -> .da-hien (hiện); tự tắt khi người dùng
// bật "giảm chuyển động" trong hệ điều hành.
export default function HienKhiCuon({ children, className = '', tre = 0 }) {
    const ref = useRef(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                el.classList.add('da-hien')
                io.disconnect()
            }
        }, { threshold: 0.12 })
        io.observe(el)
        return () => io.disconnect()
    }, [])

    return (
        <div ref={ref} className={`hien-cuon ${className}`} style={tre ? { transitionDelay: `${tre}ms` } : undefined}>
            {children}
        </div>
    )
}
