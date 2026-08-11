'use client'
import Link from "next/link"
import { useNgonNgu } from "@/lib/i18n"

const AdminNavbar = () => {
    const { t } = useNgonNgu()
    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="flex flex-col leading-tight">
                <span className="text-2xl font-bold text-green-600">Chợ Số</span>
                <span className="text-lg font-semibold text-slate-700 -mt-1">Hồng Gai</span>
            </Link>
            <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full text-white bg-green-500">{t('Quản Trị', 'Admin', '管理')}</span>
                <p className="text-slate-600">{t('Xin chào, Admin', 'Hello, Admin', '您好，管理员')}</p>
            </div>
        </div>
    )
}

export default AdminNavbar
