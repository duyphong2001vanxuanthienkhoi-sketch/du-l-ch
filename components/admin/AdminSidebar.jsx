'use client'

import { usePathname } from "next/navigation"
import { CalendarDaysIcon, HomeIcon, MapPinIcon, RouteIcon, UploadIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { assets } from "@/assets/assets"
import { useNgonNgu } from "@/lib/i18n"

const AdminSidebar = () => {

    const pathname = usePathname()
    const { t } = useNgonNgu()

    const sidebarLinks = [
        { name: t('Tổng quan', 'Overview', '概览'), href: '/admin', icon: HomeIcon },
        { name: t('Địa điểm', 'Places', '地点'), href: '/admin/dia-diem', icon: MapPinIcon },
        { name: t('Nhập từ Sheets', 'Import from Sheets', '从表格导入'), href: '/admin/nhap', icon: UploadIcon },
        { name: t('Lộ trình', 'Itineraries', '行程'), href: '/admin/lo-trinh', icon: RouteIcon },
        { name: t('Sự kiện', 'Events', '活动'), href: '/admin/su-kien', icon: CalendarDaysIcon },
    ]

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                <Image className="w-14 h-14 rounded-full" src={assets.gs_logo} alt="" width={80} height={80} />
                <p className="text-slate-700">{t('Quản Trị Viên', 'Administrator', '管理员')}</p>
            </div>

            <div className="max-sm:mt-6">
                {
                    sidebarLinks.map((link, index) => (
                        <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === link.href && 'bg-slate-100 sm:text-slate-600'}`}>
                            <link.icon size={18} className="sm:ml-5" />
                            <p className="max-sm:hidden">{link.name}</p>
                            {pathname === link.href && <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default AdminSidebar