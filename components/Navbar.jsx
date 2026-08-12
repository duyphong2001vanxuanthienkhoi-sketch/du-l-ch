'use client'
import { ChevronDown, LayoutDashboard, LogOut, MapPin, Search, UserRound } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/components/AuthProvider"
import { useNgonNgu } from "@/lib/i18n"
import LogoChoSo from "@/components/LogoChoSo"
import AnhDaiDien from "@/components/AnhDaiDien"
import DoiNgonNgu from "@/components/DoiNgonNgu"
import NutGiaoDien from "@/components/NutGiaoDien"

// Thanh trên của app du lịch.
// GUEST-FIRST (THIET-KE-APP-DU-LICH.md mục 7): không có giỏ hàng, không có tường đăng nhập,
// nút "Đăng nhập" để nhỏ ở góc. Du khách dùng được toàn bộ app mà không cần tài khoản —
// lưu địa điểm chạy trên localStorage.

const MenuTaiKhoan = ({ nguoiDung, onDangXuat }) => {
    const [moMenu, setMoMenu] = useState(false)
    const menuRef = useRef(null)
    const { t } = useNgonNgu()

    // Đóng menu khi bấm ra ngoài — Navbar render component này 2 lần (desktop + mobile)
    // nên MỖI bản phải tự giữ state và ref riêng, dùng chung sẽ trỏ nhầm sang bản kia.
    useEffect(() => {
        const dong = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMoMenu(false)
        }
        document.addEventListener('mousedown', dong)
        return () => document.removeEventListener('mousedown', dong)
    }, [])

    return (
        <div ref={menuRef} className="relative min-w-0">
            <button onClick={() => setMoMenu(!moMenu)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 transition text-slate-700 rounded-full text-sm font-medium min-w-0 max-w-full">
                <AnhDaiDien src={nguoiDung?.avatar} ten={nguoiDung?.name}
                    khung="size-6 shrink-0 bg-ngoc-500 rounded-full"
                    chu="text-white text-xs font-bold uppercase" />
                <span className="truncate min-w-0 max-sm:hidden">{nguoiDung?.name}</span>
                <ChevronDown size={15} className={`shrink-0 transition-transform ${moMenu ? 'rotate-180' : ''}`} />
            </button>
            {moMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 text-sm text-slate-600">
                    <p className="px-4 py-2 text-xs text-slate-400 border-b border-slate-100">
                        {nguoiDung.role === 'admin' ? t('Quản trị viên', 'Administrator', '管理员') : t('Du khách', 'Traveller', '游客')}
                    </p>
                    <Link href="/tai-khoan" onClick={() => setMoMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50">
                        <UserRound size={16} /> {t('Trang cá nhân', 'My profile', '个人主页')}
                    </Link>
                    {nguoiDung.role === 'admin' && (
                        <Link href="/admin/dia-diem" onClick={() => setMoMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50">
                            <LayoutDashboard size={16} /> {t('Quản lý địa điểm', 'Manage places', '管理地点')}
                        </Link>
                    )}
                    <button onClick={onDangXuat} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 text-red-500 w-full">
                        <LogOut size={16} /> {t('Đăng xuất', 'Sign out', '退出登录')}
                    </button>
                </div>
            )}
        </div>
    )
}

// Ô tìm dẫn thẳng sang trang Khám phá — nơi có đủ bộ lọc
const OTimDiaDiem = ({ lopNgoai = '', lopO = 'px-4 py-2.5' }) => {
    const { t } = useNgonNgu()
    const router = useRouter()
    const [q, setQ] = useState('')
    return (
        <form className={lopNgoai}
            onSubmit={(e) => { e.preventDefault(); router.push(q.trim() ? `/kham-pha?q=${encodeURIComponent(q.trim())}` : '/kham-pha') }}>
            <div className={`flex items-center gap-2.5 bg-slate-100 rounded-full ${lopO}`}>
                <Search size={17} className="text-slate-400 shrink-0" />
                <input value={q} onChange={e => setQ(e.target.value)}
                    placeholder={t('Tìm địa điểm, quán ăn...', 'Search places, food...', '搜索地点、美食…')}
                    className="w-full bg-transparent outline-none text-sm placeholder-slate-400" />
            </div>
        </form>
    )
}

const Navbar = () => {
    const { user: nguoiDung } = useAuth()
    const { t } = useNgonNgu()
    // Trang chủ (ô tìm to trong hero) và Khám phá (ô tìm + bộ lọc riêng) đã có ô tìm
    // nổi bật của chính nó. Hiện thêm ô của Navbar nữa là hai thanh tìm kiếm nằm cách
    // nhau vài chục pixel — thừa và luộm thuộm.
    const duong = usePathname()
    const coOTimRieng = duong === '/' || duong.startsWith('/kham-pha')

    const dangXuat = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        window.location.href = '/'
    }

    const lienKet = [
        { href: '/kham-pha', nhan: t('Khám phá', 'Explore', '发现') },
        { href: '/kham-pha?loai=an_uong', nhan: t('Ăn uống', 'Food', '美食') },
        { href: '/lo-trinh', nhan: t('Lộ trình', 'Itineraries', '行程') },
        { href: '/su-kien', nhan: t('Lễ hội', 'Festivals', '庙会') },
        { href: '/ban-do', nhan: t('Bản đồ', 'Map', '地图') },
        { href: '/hanh-trinh', nhan: t('Hành trình', 'My journey', '我的旅程') },
    ]

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between gap-x-2 sm:gap-x-6 max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" aria-label={t('Về trang chủ', 'Back to home', '返回首页')} className="flex items-center gap-2 shrink-0">
                        <LogoChoSo size={42} anChuKhiHep />
                    </Link>

                    {/* Menu MÁY TÍNH — chỉ từ 1024px (lg); dưới mốc đó dùng thanh dưới kiểu app */}
                    <div className="hidden lg:flex items-center gap-4 lg:gap-6 text-slate-600 min-w-0">
                        {lienKet.map(l => (
                            <Link key={l.href} href={l.href} className="shrink-0 hover:text-ngoc-600 transition-colors">{l.nhan}</Link>
                        ))}

                        <OTimDiaDiem lopNgoai="hidden xl:block flex-1 min-w-0 max-w-xs" lopO="px-4 py-3" />

                        <NutGiaoDien />
                        <DoiNgonNgu />

                        {nguoiDung ? <MenuTaiKhoan nguoiDung={nguoiDung} onDangXuat={dangXuat} /> : (
                            <Link href="/login"
                                className="flex items-center gap-2 px-5 py-2 border border-slate-200 hover:bg-slate-50 transition text-slate-600 rounded-full whitespace-nowrap text-sm">
                                <UserRound size={16} /> {t('Đăng nhập', 'Sign in', '登录')}
                            </Link>
                        )}
                    </div>

                    {/* Điện thoại + máy tính bảng */}
                    <div className="lg:hidden flex items-center gap-1 sm:gap-2 max-[380px]:gap-0.5 min-w-0">
                        <NutGiaoDien />
                        <DoiNgonNgu />
                        {nguoiDung ? <MenuTaiKhoan nguoiDung={nguoiDung} onDangXuat={dangXuat} /> : (
                            <Link href="/login" aria-label={t('Đăng nhập', 'Sign in', '登录')}
                                className="flex items-center justify-center size-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition shrink-0">
                                <UserRound size={17} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Ô tìm cho điện thoại + máy tính bảng (màn ≥1280px dùng ô tìm trên thanh menu).
                    Ẩn ở những trang đã có ô tìm riêng — xem `coOTimRieng` bên trên. */}
                {!coOTimRieng && (
                    <div className="xl:hidden max-w-7xl mx-auto pb-3">
                        <OTimDiaDiem />
                    </div>
                )}
            </div>
            <hr className="border-slate-200" />
        </nav>
    )
}

export default Navbar
