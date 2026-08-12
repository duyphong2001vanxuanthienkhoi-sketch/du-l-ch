'use client'
import { useRef, useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { nenAnh } from "@/lib/utils/nenAnh"
import { useAuth } from "@/components/AuthProvider"
import { useNgonNgu } from "@/lib/i18n"
import Loading from "@/components/Loading"
import AnhDaiDien from "@/components/AnhDaiDien"
import {
    Bookmark, Camera, Check, ChevronRight, Compass, LayoutDashboard,
    LogOut, Pencil, Trash2, UserRound, X,
} from "lucide-react"

// TÀI KHOẢN — app guest-first nên trang này KHÔNG bắt buộc với ai.
// Du khách dùng được toàn bộ app mà không cần đăng nhập; tài khoản chỉ thêm
// khả năng đánh giá địa điểm và (với admin) quản lý nội dung.
export default function TaiKhoan() {
    const { user: nguoiDung, setUser } = useAuth() // undefined = đang tải; null = chưa đăng nhập
    const { t } = useNgonNgu()
    const [suaTen, setSuaTen] = useState(false)
    const [tenMoi, setTenMoi] = useState('')
    const [dangLuu, setDangLuu] = useState(false)
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
        window.location.href = '/'
    }

    if (nguoiDung === undefined) return <Loading />

    // Chưa đăng nhập — nói rõ là KHÔNG cần tài khoản để dùng app
    if (!nguoiDung) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
            <UserRound size={48} className="text-slate-300" />
            <h1 className="text-2xl font-semibold text-slate-700 mt-4">{t('Tài khoản', 'Account', '账户')}</h1>
            <p className="text-slate-500 text-sm mt-2 max-w-sm">
                {t('Bạn không cần tài khoản để dùng app — xem địa điểm, bản đồ và lưu chỗ yêu thích đều được. Đăng nhập chỉ để viết đánh giá.',
                    'You don\'t need an account to use the app — browsing, maps and saving places all work without one. Sign in only to write reviews.',
                    '使用本应用无需账户 —— 浏览地点、地图和收藏均可直接使用。登录仅用于撰写评价。')}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-6">
                <Link href="/login?ve=/tai-khoan" className="bg-ngoc-500 hover:bg-ngoc-600 transition text-white px-8 py-2.5 rounded-full text-sm font-medium">
                    {t('Đăng nhập', 'Sign in', '登录')}
                </Link>
                <Link href="/kham-pha" className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-8 py-2.5 rounded-full text-sm font-medium transition">
                    {t('Khám phá Hồng Gai', 'Explore Hong Gai', '探索鸿基')}
                </Link>
            </div>
        </div>
    )

    const muc = [
        { href: '/hanh-trinh', Icon: Bookmark, nhan: t('Hành trình của tôi', 'My journey', '我的旅程') },
        { href: '/kham-pha', Icon: Compass, nhan: t('Khám phá Hồng Gai', 'Explore Hong Gai', '探索鸿基') },
    ]
    if (nguoiDung.role === 'admin') {
        muc.unshift({ href: '/admin/dia-diem', Icon: LayoutDashboard, nhan: t('Quản lý địa điểm', 'Manage places', '管理地点') })
    }

    return (
        <div className="min-h-[70vh] mb-28 max-w-2xl mx-auto px-5 py-8">
            <h1 className="text-2xl font-semibold text-slate-800">{t('Tài khoản', 'Account', '账户')}</h1>

            {/* Thẻ hồ sơ */}
            <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 mt-5 shadow-sm">
                <div className="relative shrink-0">
                    <AnhDaiDien src={nguoiDung.avatar} ten={nguoiDung.name}
                        khung="size-16 rounded-full bg-ngoc-500" chu="text-white text-xl font-bold uppercase" />
                    <button onClick={() => fileAnhRef.current?.click()} disabled={dangTaiAnh}
                        aria-label={t('Đổi ảnh đại diện', 'Change avatar', '更换头像')}
                        className="absolute -bottom-1 -right-1 flex items-center justify-center size-7 rounded-full bg-slate-700 text-white border-2 border-white active:scale-90 transition disabled:opacity-60">
                        <Camera size={13} />
                    </button>
                    <input ref={fileAnhRef} type="file" accept="image/*" onChange={doiAnh} className="hidden" />
                </div>

                <div className="min-w-0 flex-1">
                    {suaTen ? (
                        <div className="flex items-center gap-2">
                            <input value={tenMoi} onChange={e => setTenMoi(e.target.value)} autoFocus
                                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-slate-400" />
                            <button onClick={luuTen} disabled={dangLuu} aria-label={t('Lưu', 'Save', '保存')}
                                className="flex items-center justify-center size-8 rounded-lg bg-green-600 text-white shrink-0 disabled:opacity-60">
                                <Check size={15} />
                            </button>
                            <button onClick={() => setSuaTen(false)} aria-label={t('Huỷ', 'Cancel', '取消')}
                                className="flex items-center justify-center size-8 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                                <X size={15} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-800 truncate">{nguoiDung.name}</p>
                            <button onClick={() => { setTenMoi(nguoiDung.name); setSuaTen(true) }}
                                aria-label={t('Sửa tên', 'Edit name', '修改姓名')}
                                className="text-slate-300 hover:text-slate-500 shrink-0">
                                <Pencil size={14} />
                            </button>
                        </div>
                    )}
                    <p className="text-sm text-slate-400 truncate mt-0.5">{nguoiDung.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                        {nguoiDung.role === 'admin' ? t('Quản trị viên', 'Administrator', '管理员') : t('Du khách', 'Traveller', '游客')}
                    </p>
                </div>

                {nguoiDung.avatar && (
                    <button onClick={xoaAnh} disabled={dangTaiAnh} aria-label={t('Xoá ảnh đại diện', 'Remove avatar', '删除头像')}
                        className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition shrink-0">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-2 mt-5">
                {muc.map(m => (
                    <Link key={m.href} href={m.href}
                        className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm hover:bg-slate-50 transition">
                        <m.Icon size={18} className="text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-700 flex-1">{m.nhan}</span>
                        <ChevronRight size={16} className="text-slate-300 shrink-0" />
                    </Link>
                ))}
            </div>

            <button onClick={dangXuat}
                className="flex items-center justify-center gap-2 w-full mt-5 px-5 py-3 rounded-2xl border border-red-100 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition">
                <LogOut size={16} /> {t('Đăng xuất', 'Sign out', '退出登录')}
            </button>
        </div>
    )
}
