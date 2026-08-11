'use client'
import { ChevronDown, LayoutDashboard, LogOut, MessageCircle, PackageIcon, PackageSearch, ShoppingCart, Soup, Store, UserRound, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "@/lib/features/cart/cartSlice";
import { xoaGioHangLuu } from "@/lib/utils/gioHang";
import { useAuth } from "@/components/AuthProvider";
import { useNgonNgu } from "@/lib/i18n";
import LogoChoSo from "@/components/LogoChoSo";
import AnhDaiDien from "@/components/AnhDaiDien";
import DoiNgonNgu from "@/components/DoiNgonNgu";
import NutGiaoDien from "@/components/NutGiaoDien";
import OTimKiem from "@/components/OTimKiem";

// Nút giỏ hàng dạng icon — luôn hiện cạnh tài khoản trên mọi cỡ màn hình.
// Tách thành component riêng (đọc số lượng giỏ trực tiếp từ store) để không tạo lại mỗi lần Navbar render.
const NutGioHang = () => {
    const cartCount = useSelector(state => state.cart.total)
    return (
        <Link href="/cart" aria-label="Giỏ hàng"
            className="relative flex items-center justify-center size-9 sm:size-10 shrink-0 bg-slate-100 hover:bg-slate-200 transition rounded-full text-slate-600">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
                // key={cartCount}: đổi số -> React remount span -> chạy lại animation "nảy"
                <span key={cartCount} className="badge-pop absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-ngoc-500 rounded-full">
                    {cartCount}
                </span>
            )}
        </Link>
    )
}

// Menu tài khoản (nút tên người dùng + thả xuống).
// LƯU Ý: Navbar render component này 2 lần (bản desktop + bản mobile). Vì vậy MỖI bản
// phải tự giữ state mở/đóng và ref của riêng mình — nếu dùng chung một ref/state như trước,
// ref sẽ trỏ nhầm sang bản mobile khiến menu desktop bị đóng ngay khi bấm (không dùng được).
const MenuTaiKhoan = ({ nguoiDung, onDangXuat }) => {
    const [moMenu, setMoMenu] = useState(false)
    const menuRef = useRef(null)
    const { t } = useNgonNgu()

    // Đóng menu khi bấm ra ngoài — mỗi bản kiểm tra đúng ref của chính nó
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
                <span className="truncate min-w-0">{nguoiDung?.name}</span>
                <ChevronDown size={15} className={`shrink-0 transition-transform ${moMenu ? 'rotate-180' : ''}`} />
            </button>
            {moMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 text-sm text-slate-600">
                    <p className="px-4 py-2 text-xs text-slate-400 border-b border-slate-100">
                        {nguoiDung.role === 'admin' ? t('Quản trị viên', 'Administrator', '管理员') : nguoiDung.role === 'tieu_thuong' ? t('Tiểu thương', 'Merchant', '商户') : t('Khách mua hàng', 'Customer', '顾客')}
                    </p>
                    <Link href="/tai-khoan" onClick={() => setMoMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50">
                        <UserRound size={16} /> {t('Trang cá nhân', 'My profile', '个人主页')}
                    </Link>
                    {nguoiDung.role === 'admin' && (
                        <Link href="/admin" onClick={() => setMoMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50">
                            <LayoutDashboard size={16} /> {t('Trang quản trị', 'Admin panel', '管理面板')}
                        </Link>
                    )}
                    {nguoiDung.role === 'tieu_thuong' && (
                        <Link href="/create-store" onClick={() => setMoMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50">
                            <Store size={16} /> {t('Gian hàng của tôi', 'My store', '我的店铺')}
                        </Link>
                    )}
                    {nguoiDung.role === 'khach' && (
                        <Link href="/create-store" onClick={() => setMoMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50">
                            <Store size={16} /> {t('Mở gian hàng', 'Open a store', '开店')}
                        </Link>
                    )}
                    <Link href="/create-quan-an" onClick={() => setMoMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50">
                        <UtensilsCrossed size={16} /> {t('Quán ăn của tôi', 'My eatery', '我的餐馆')}
                    </Link>
                    <Link href="/tin-nhan" onClick={() => setMoMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50">
                        <MessageCircle size={16} /> {t('Tin nhắn', 'Messages', '消息')}
                    </Link>
                    <Link href="/orders" onClick={() => setMoMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50">
                        <PackageIcon size={16} /> {t('Đơn hàng của tôi', 'My orders', '我的订单')}
                    </Link>
                    <Link href="/don-do-an" onClick={() => setMoMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50">
                        <Soup size={16} /> {t('Đơn đồ ăn của tôi', 'My food orders', '我的餐饮订单')}
                    </Link>
                    <Link href="/tra-don" onClick={() => setMoMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50">
                        <PackageSearch size={16} /> {t('Tra cứu đơn hàng', 'Track an order', '查询订单')}
                    </Link>
                    <button onClick={onDangXuat} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 text-red-500 w-full">
                        <LogOut size={16} /> {t('Đăng xuất', 'Sign out', '退出登录')}
                    </button>
                </div>
            )}
        </div>
    )
}

const Navbar = () => {

    // Trang /shop đã có ô tìm RIÊNG (lọc ngay khi gõ, không cần Enter) nên ẩn ô tìm của
    // Navbar ở đó — trước đây điện thoại hiện 2 ô y hệt nhau chồng lên nhau, vừa rối
    // vừa đẩy hàng hoá xuống dưới màn hình.
    const pathname = usePathname()
    const anOTim = pathname === '/shop'
    const dispatch = useDispatch()

    const { user: nguoiDung } = useAuth()
    const { t } = useNgonNgu()

    const dangXuat = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        dispatch(clearCart())   // dọn giỏ trên giao diện
        xoaGioHangLuu()         // và xóa bản lưu để không lộ giỏ sang người dùng sau
        window.location.href = '/'
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between gap-x-2 sm:gap-x-6 max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" aria-label="Về trang chủ Chợ Số Hồng Gai" className="shrink-0">
                        <LogoChoSo size={42} anChuKhiHep />
                    </Link>

                    {/* Menu MÁY TÍNH — chỉ từ 1024px (lg). Trước đây bật ra từ 640px (sm) nhưng
                        cả cụm 5 link + 3 nút + "Đăng nhập" cần ~780px, trong khi khổ tablet dọc
                        (vd iPad 820px) chỉ còn ~610px chỗ → tràn ngang 142px, kéo lệch cả trang.
                        Từ 640-1023px giờ dùng bố cục kiểu app: hàng nút gọn ở trên + BottomNav. */}
                    <div className="hidden lg:flex items-center gap-4 lg:gap-6 text-slate-600 min-w-0">
                        <Link href="/" className="shrink-0 hover:text-ngoc-600 transition-colors">{t('Trang chủ', 'Home', '首页')}</Link>
                        <Link href="/shop" className="shrink-0 hover:text-ngoc-600 transition-colors">{t('Gian hàng', 'Stores', '店铺')}</Link>
                        <Link href="/do-an" className="shrink-0 hover:text-ngoc-600 transition-colors">{t('Đồ Ăn', 'Food', '美食')}</Link>
                        <Link href="/kham-pha" className="shrink-0 hover:text-ngoc-600 transition-colors">{t('Khám phá', 'Explore', '发现')}</Link>
                        <Link href="/tra-don" className="shrink-0 hover:text-ngoc-600 transition-colors">{t('Tra đơn', 'Track order', '查询订单')}</Link>

                        <OTimKiem lopNgoai={`${anOTim ? 'hidden' : 'hidden xl:block'} flex-1 min-w-0 max-w-xs`}
                            lopO="px-4 py-3" goiY={t('Tìm kiếm sản phẩm...', 'Search products...', '搜索商品...')} />

                        <NutGiaoDien />
                        <DoiNgonNgu />
                        <NutGioHang />

                        {nguoiDung ? <MenuTaiKhoan nguoiDung={nguoiDung} onDangXuat={dangXuat} /> : (
                            <Link href="/login" className="flex items-center gap-2 px-8 py-2 bg-ngoc-500 hover:bg-ngoc-600 transition text-white rounded-full whitespace-nowrap">
                                <UserRound size={16} /> {t('Đăng nhập', 'Sign in', '登录')}
                            </Link>
                        )}
                    </div>

                    {/* Điện thoại + máy tính bảng: đổi giao diện + ngôn ngữ + giỏ hàng + tài khoản.
                        Hàng này CHẬT trên điện thoại: máy 375px chỉ còn 207px cho 4 thứ, mà riêng
                        nút "Đăng nhập" tiếng Việt đã 107px (bản "Sign in" ngắn hơn nên lỗi chỉ lộ
                        khi xem tiếng Việt) → cả trang bị kéo ngang. Nên dưới sm mọi thứ thu gọn
                        một nấc (nút tròn size-9, khe gap-1, chữ 13px); từ sm trở lên rộng rãi lại. */}
                    <div className="lg:hidden flex items-center gap-1 sm:gap-2 max-[380px]:gap-0.5 min-w-0">
                        <NutGiaoDien />
                        <DoiNgonNgu />
                        <NutGioHang />
                        {nguoiDung ? <MenuTaiKhoan nguoiDung={nguoiDung} onDangXuat={dangXuat} /> : (
                            // Máy hẹp (360px kiểu Galaxy S) thu thêm một nấc nữa, không thì nút
                            // dí sát mép phải trong khi logo vẫn cách mép trái 24px — lệch hẳn.
                            <Link href="/login" className="inline-block px-3.5 sm:px-5 py-1.5 sm:py-2 max-[380px]:px-2.5 bg-ngoc-500 hover:bg-ngoc-600 text-nho sm:text-sm max-[380px]:text-xs transition text-white rounded-full whitespace-nowrap shrink-0">
                                {t('Đăng nhập', 'Sign in', '登录')}
                            </Link>
                        )}
                    </div>
                </div>

                {/* Thanh tìm kiếm cho điện thoại + máy tính bảng (màn ≥1280px dùng ô tìm trên thanh menu).
                    Ẩn ở /shop vì trang đó đã có ô tìm riêng lọc ngay khi gõ. */}
                <div className={`${anOTim ? 'hidden' : 'xl:hidden'} max-w-7xl mx-auto pb-3`}>
                    <OTimKiem lopO="px-4 py-2.5" />
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar
