'use client'
import { Compass, Fish, Gift, Home, Soup, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useNgonNgu } from '@/lib/i18n'

// Thanh điều hướng dưới kiểu app — hiện trên điện thoại VÀ máy tính bảng (lg:hidden),
// máy tính (từ 1024px) mới dùng menu trên ở Navbar. Mốc lg thay vì sm: menu trên cần
// ~780px mới đủ chỗ, bật nó ra từ 640px làm tràn ngang cả trang ở khổ tablet dọc.
// LƯU Ý: mọi thanh DÍNH ĐÁY khác (thanh mua, thanh đặt món, bong bóng chat, nút lên đầu
// trang, khoảng chừa cuối trang trong app/(public)/layout.jsx) phải đổi mốc theo thanh này,
// nếu không chúng sẽ nằm đè lên nó ở khổ tablet.
// Tab đang chọn nổi bật bằng VIÊN PILL ĐẶC màu khu + icon TRẮNG + quầng sáng cùng màu;
// tab thường để icon outline xám nhạt. Mỗi tab một màu riêng theo khu.
const INACTIVE = '#94a3b8' // slate-400

const BottomNav = () => {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { t: tr } = useNgonNgu() // 't' đã dùng cho biến map bên dưới → đặt tên tr
    // Chỉ dùng ?khu= SAU khi mount: bản HTML prerender (production) không có query,
    // nếu render active theo khu ngay từ server sẽ lệch với client → lỗi hydration.
    // Sau mount thì searchParams vẫn phản ứng khi khách đổi khu (Chợ Tươi ↔ Quà QN).
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    const khu = mounted ? searchParams.get('khu') : null

    const tabs = [
        { href: '/', label: tr('Trang chủ', 'Home', '首页'), Icon: Home, mau: '#0d9488', active: pathname === '/' },
        { href: '/shop?khu=cho_tuoi', label: tr('Chợ Tươi', 'Fresh', '鲜市'), Icon: Fish, mau: '#059669', active: pathname === '/shop' && khu === 'cho_tuoi' },
        { href: '/shop?khu=qua_quang_ninh', label: tr('Quà QN', 'Gifts', '礼品'), Icon: Gift, mau: '#d97706', active: pathname === '/shop' && khu === 'qua_quang_ninh' },
        { href: '/do-an', label: tr('Đồ Ăn', 'Food', '美食'), Icon: Soup, mau: '#ea580c', active: pathname.startsWith('/do-an') },
        { href: '/kham-pha', label: tr('Khám phá', 'Explore', '发现'), Icon: Compass, mau: '#0284c7', active: pathname.startsWith('/kham-pha') || pathname.startsWith('/dia-diem') },
        { href: '/tai-khoan', label: tr('Tài khoản', 'Account', '账户'), Icon: User, mau: '#7c3aed', active: pathname === '/tai-khoan' },
    ]

    return (
        <nav className='lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-100 shadow-[0_-6px_24px_-12px_rgba(15,23,42,0.25)]'
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className='grid grid-cols-6'>
                {tabs.map(t => (
                    <Link key={t.href} href={t.href} aria-label={t.label} aria-current={t.active ? 'page' : undefined}
                        className='flex flex-col items-center gap-1 pt-2 pb-2 active:scale-90 transition-transform'>
                        {/* Viên pill: ĐẶC màu khu + icon trắng khi được chọn; trong suốt + icon xám khi không */}
                        <span className='flex items-center justify-center px-3.5 py-1.5 rounded-2xl transition-all duration-300'
                            style={{
                                backgroundColor: t.active ? t.mau : 'transparent',
                                boxShadow: t.active ? `0 6px 14px -4px ${t.mau}80` : 'none',
                            }}>
                            <t.Icon size={20} strokeWidth={t.active ? 2.4 : 2}
                                style={{ color: t.active ? '#ffffff' : INACTIVE, transition: 'color .25s' }} />
                        </span>
                        <span className='text-[10px] leading-none transition-colors duration-300'
                            style={{ color: t.active ? t.mau : INACTIVE, fontWeight: t.active ? 700 : 500 }}>
                            {t.label}
                        </span>
                    </Link>
                ))}
            </div>
        </nav>
    )
}

export default BottomNav
