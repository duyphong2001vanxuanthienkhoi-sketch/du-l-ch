'use client'
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"
import { useAuth } from "../AuthProvider"
import { useNgonNgu } from "@/lib/i18n"

const AdminLayout = ({ children }) => {

    const { user } = useAuth()
    const { t } = useNgonNgu()
    const loading = user === undefined       // undefined = đang tải phiên
    const isAdmin = user?.role === 'admin'

    return loading ? (
        <Loading />
    ) : isAdmin ? (
        <div className="flex flex-col h-screen">
            <AdminNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <AdminSidebar />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">{t('Bạn không có quyền truy cập trang này', 'You do not have access to this page', '您无权访问此页面')}</h1>
            <p className="text-slate-400 mt-3 text-sm">{t('Khu vực này chỉ dành cho quản trị viên.', 'This area is for administrators only.', '此区域仅限管理员访问。')}</p>
            <div className="flex items-center gap-3 mt-8">
                <Link href="/login?ve=/admin" className="bg-green-500 text-white flex items-center gap-2 p-2 px-6 max-sm:text-sm rounded-full">
                    {t('Đăng nhập', 'Sign in', '登录')}
                </Link>
                <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 p-2 px-6 max-sm:text-sm rounded-full">
                    {t('Về trang chủ', 'Back to home', '返回首页')} <ArrowRightIcon size={18} />
                </Link>
            </div>
        </div>
    )
}

export default AdminLayout