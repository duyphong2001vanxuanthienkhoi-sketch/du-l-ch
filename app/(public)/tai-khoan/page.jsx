'use client'
import { useRef, useState } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import toast from "react-hot-toast"
import { clearCart } from "@/lib/features/cart/cartSlice"
import { xoaGioHangLuu } from "@/lib/utils/gioHang"
import { nenAnh } from "@/lib/utils/nenAnh"
import { useAuth } from "@/components/AuthProvider"
import { useNgonNgu } from "@/lib/i18n"
import Loading from "@/components/Loading"
import TheThanhVien from "@/components/TheThanhVien"
import AnhDaiDien from "@/components/AnhDaiDien"
import {
    Camera, Check, ChevronRight, LayoutDashboard, LogOut, MessageCircle, PackageIcon,
    PackageSearch, Pencil, ShoppingCart, Soup, Store, Trash2, UserRound, UtensilsCrossed, X,
} from "lucide-react"

const NHAN_VAI_TRO = {
    admin: ['Quản trị viên', 'Administrator', '管理员'],
    tieu_thuong: ['Tiểu thương', 'Merchant', '商户'],
    khach: ['Khách mua hàng', 'Customer', '顾客'],
}

export default function TaiKhoan() {
    const { user: nguoiDung, setUser } = useAuth() // undefined = đang tải; null = chưa đăng nhập
    const { t } = useNgonNgu()
    const [suaTen, setSuaTen] = useState(false)
    const [tenMoi, setTenMoi] = useState('')
    const [dangLuu, setDangLuu] = useState(false)
    const cartCount = useSelector(state => state.cart.total)
    const dispatch = useDispatch()
    const fileAnhRef = useRef(null)
    const [dangTaiAnh, setDangTaiAnh] = useState(false)

    const doiAnh = async (e) => {
        const file = e.target.files?.[0]
        e.target.value = '' // cho phép chọn lại đúng file đó nếu cần
        if (!file) return
        setDangTaiAnh(true)
        try {
            const nen = await nenAnh(file, { canhToiDa: 512, chatLuong: 0.85 })
            const fd = new FormData()
            fd.append('anh', nen)
            const res = await fetch('/api/auth/avatar', { method: 'POST', body: fd })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Không tải được ảnh', 'Could not upload image', '图片上传失败')); return }
            setUser(data.user)
            toast.success(t('Đã cập nhật ảnh đại diện', 'Avatar updated', '头像已更新'))
        } finally {
            setDangTaiAnh(false)
        }
    }

    const xoaAnh = async () => {
        setDangTaiAnh(true)
        try {
            const res = await fetch('/api/auth/avatar', { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Không xóa được ảnh', 'Could not remove image', '图片删除失败')); return }
            setUser(data.user)
            toast.success(t('Đã xóa ảnh đại diện', 'Avatar removed', '头像已删除'))
        } finally {
            setDangTaiAnh(false)
        }
    }

    const luuTen = async () => {
        const ten = tenMoi.trim()
        if (!ten) return toast.error(t('Vui lòng nhập họ tên', 'Please enter your name', '请输入姓名'))
        setDangLuu(true)
        try {
            const res = await fetch('/api/auth/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: ten }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Không lưu được', 'Could not save', '保存失败')); return }
            setUser(data.user)
            setSuaTen(false)
            toast.success(t('Đã cập nhật thông tin', 'Profile updated', '信息已更新'))
        } finally {
            setDangLuu(false)
        }
    }

    const dangXuat = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        dispatch(clearCart())   // dọn giỏ trên giao diện
        xoaGioHangLuu()         // và xóa bản lưu để không lộ giỏ sang người dùng sau
        window.location.href = '/'
    }

    if (nguoiDung === undefined) return <Loading />

    // Chưa đăng nhập
    if (!nguoiDung) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
            <UserRound size={48} className="text-slate-300" />
            <h1 className="text-2xl font-semibold text-slate-700 mt-4">{t('Tài khoản', 'Account', '账户')}</h1>
            <p className="text-slate-500 text-sm mt-2 max-w-xs">{t('Đăng nhập để xem thông tin, đơn hàng và quản lý gian hàng của bạn.', 'Sign in to view your profile, orders, and manage your store.', '登录以查看信息、订单并管理您的店铺。')}</p>
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-6">
                <Link href="/login?ve=/tai-khoan" className="bg-ngoc-500 hover:bg-ngoc-600 transition text-white px-8 py-2.5 rounded-full text-sm font-medium">
                    {t('Đăng nhập', 'Sign in', '登录')}
                </Link>
                <Link href="/tra-don" className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-8 py-2.5 rounded-full text-sm font-medium transition">
                    {t('Tra đơn không cần đăng nhập', 'Track without signing in', '免登录查询订单')}
                </Link>
            </div>
        </div>
    )

    const lienKet = [
        { href: '/cart', label: t('Giỏ hàng', 'Cart', '购物车'), Icon: ShoppingCart, badge: cartCount > 0 ? cartCount : null },
        { href: '/orders', label: t('Đơn hàng của tôi', 'My orders', '我的订单'), Icon: PackageIcon },
        { href: '/don-do-an', label: t('Đơn đồ ăn của tôi', 'My food orders', '我的餐饮订单'), Icon: Soup },
        { href: '/tin-nhan', label: t('Tin nhắn', 'Messages', '消息'), Icon: MessageCircle },
        { href: '/tra-don', label: t('Tra cứu đơn hàng', 'Track an order', '查询订单'), Icon: PackageSearch },
        nguoiDung.role === 'admin' && { href: '/admin', label: t('Trang quản trị', 'Admin panel', '管理面板'), Icon: LayoutDashboard },
        nguoiDung.role === 'tieu_thuong' && { href: '/create-store', label: t('Gian hàng của tôi', 'My store', '我的店铺'), Icon: Store },
        nguoiDung.role === 'khach' && { href: '/create-store', label: t('Mở gian hàng', 'Open a store', '开店'), Icon: Store },
        { href: '/create-quan-an', label: t('Quán ăn của tôi', 'My eatery', '我的餐馆'), Icon: UtensilsCrossed },
    ].filter(Boolean)

    return (
        <div className="min-h-[70vh] mx-auto max-w-lg px-5 my-8">
            {/* Thẻ thành viên (tích điểm thật) */}
            <TheThanhVien user={nguoiDung} subtitle={NHAN_VAI_TRO[nguoiDung.role] ? t(...NHAN_VAI_TRO[nguoiDung.role]) : t('Thành viên', 'Member', '会员')} size="lg" />

            {/* Ảnh đại diện */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 mt-5 shadow-sm">
                <h2 className="font-semibold text-slate-700 mb-4">{t('Ảnh đại diện', 'Avatar', '头像')}</h2>
                <div className="flex items-center gap-4">
                    <AnhDaiDien src={nguoiDung.avatar} ten={nguoiDung.name}
                        khung="size-20 rounded-full ring-2 ring-slate-100 bg-ngoc-500"
                        chu="text-white text-2xl font-bold uppercase" />
                    <div className="flex flex-col items-start gap-1.5">
                        <button onClick={() => fileAnhRef.current?.click()} disabled={dangTaiAnh}
                            className="flex items-center gap-2 bg-ngoc-500 hover:bg-ngoc-600 text-white text-sm font-medium px-5 py-2 rounded-full active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none">
                            <Camera size={15} /> {dangTaiAnh ? t('Đang tải...', 'Uploading...', '上传中...') : nguoiDung.avatar ? t('Đổi ảnh', 'Change photo', '更换图片') : t('Tải ảnh lên', 'Upload photo', '上传图片')}
                        </button>
                        {nguoiDung.avatar && (
                            <button onClick={xoaAnh} disabled={dangTaiAnh}
                                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 px-2 py-1 transition disabled:opacity-60 disabled:pointer-events-none">
                                <Trash2 size={13} /> {t('Xóa ảnh', 'Remove photo', '删除图片')}
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-3">{t('PNG, JPG hoặc WebP — ảnh sẽ tự nén nhẹ trước khi tải lên.', 'PNG, JPG or WebP — the image will be lightly compressed before upload.', 'PNG、JPG 或 WebP —— 上传前图片将被轻度压缩。')}</p>
                <input ref={fileAnhRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={doiAnh} />
            </div>

            {/* Thông tin cá nhân */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 mt-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-slate-700">{t('Thông tin cá nhân', 'Personal information', '个人信息')}</h2>
                    {!suaTen && (
                        <button onClick={() => { setTenMoi(nguoiDung.name); setSuaTen(true) }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">
                            <Pencil size={13} /> {t('Sửa', 'Edit', '编辑')}
                        </button>
                    )}
                </div>

                {suaTen ? (
                    <div className="mt-3">
                        <label className="text-xs text-slate-500">{t('Họ tên', 'Full name', '姓名')}</label>
                        <input value={tenMoi} onChange={e => setTenMoi(e.target.value)} maxLength={60} autoFocus
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 mt-1 outline-none focus:border-ngoc-400" />
                        <div className="flex gap-2 mt-3">
                            <button onClick={luuTen} disabled={dangLuu}
                                className="flex items-center gap-1.5 bg-ngoc-500 hover:bg-ngoc-600 text-white text-sm font-medium px-5 py-2 rounded-full active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none">
                                <Check size={15} /> {dangLuu ? t('Đang lưu...', 'Saving...', '保存中...') : t('Lưu', 'Save', '保存')}
                            </button>
                            <button onClick={() => setSuaTen(false)}
                                className="flex items-center gap-1.5 text-slate-500 hover:bg-slate-100 text-sm font-medium px-4 py-2 rounded-full transition">
                                <X size={15} /> {t('Hủy', 'Cancel', '取消')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-3 text-sm space-y-2">
                        <div className="flex justify-between"><span className="text-slate-400">{t('Họ tên', 'Full name', '姓名')}</span><span className="text-slate-700 font-medium">{nguoiDung.name}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="text-slate-700">{nguoiDung.email}</span></div>
                    </div>
                )}
            </div>

            {/* Liên kết nhanh */}
            <div className="bg-white border border-slate-100 rounded-2xl mt-5 shadow-sm overflow-hidden">
                {lienKet.map((lk, i) => (
                    <Link key={lk.href + i} href={lk.href}
                        className={`flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                        <lk.Icon size={18} className="text-slate-500 shrink-0" />
                        <span className="flex-1 text-sm text-slate-700">{lk.label}</span>
                        {lk.badge && (
                            <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-ti font-bold text-white bg-ngoc-500 rounded-full">{lk.badge}</span>
                        )}
                        <ChevronRight size={17} className="text-slate-300" />
                    </Link>
                ))}
            </div>

            {/* Đăng xuất */}
            <button onClick={dangXuat}
                className="flex items-center justify-center gap-2 w-full mt-5 bg-white border border-slate-100 text-red-500 hover:bg-red-50 font-medium py-3 rounded-2xl shadow-sm transition active:scale-95">
                <LogOut size={17} /> {t('Đăng xuất', 'Sign out', '退出登录')}
            </button>
        </div>
    )
}
