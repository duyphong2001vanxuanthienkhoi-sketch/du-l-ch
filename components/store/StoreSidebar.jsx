'use client'
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, MessageCircleIcon, SquarePenIcon, SquarePlusIcon, StoreIcon } from "lucide-react"
import Link from "next/link"
import Anh from "@/components/Anh"
import { useNgonNgu } from "@/lib/i18n"

const StoreSidebar = ({ storeInfo, soDonMoi = 0 }) => {

    const pathname = usePathname()
    const { t } = useNgonNgu()

    const sidebarLinks = [
        { name: t('Tổng quan', 'Overview', '概览'), href: '/store', icon: HomeIcon },
        { name: t('Thêm sản phẩm', 'Add product', '添加商品'), href: '/store/add-product', icon: SquarePlusIcon },
        { name: t('Quản lý SP', 'Manage products', '管理商品'), href: '/store/manage-product', icon: SquarePenIcon },
        { name: t('Đơn hàng', 'Orders', '订单'), href: '/store/orders', icon: LayoutListIcon, badge: soDonMoi },
        { name: t('Tin nhắn', 'Messages', '消息'), href: '/store/tin-nhan', icon: MessageCircleIcon },
        { name: t('Thông tin gian', 'Store info', '店铺信息'), href: '/store/thong-tin', icon: StoreIcon },
    ]

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                <Anh className="w-14 h-14 rounded-full shadow-md object-cover" src={storeInfo?.logo} alt="" />
                <p className="text-slate-700">{storeInfo?.name}</p>
            </div>

            <div className="max-sm:mt-6">
                {
                    sidebarLinks.map((link, index) => (
                        <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === link.href && 'bg-slate-100 sm:text-slate-600'}`}>
                            <div className="relative">
                                <link.icon size={18} className="sm:ml-5" />
                                {link.badge > 0 && (
                                    <span className="sm:hidden absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                        {link.badge}
                                    </span>
                                )}
                            </div>
                            <p className="max-sm:hidden flex items-center gap-2">
                                {link.name}
                                {link.badge > 0 && (
                                    <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-ti font-bold text-white bg-red-500 rounded-full">
                                        {link.badge}
                                    </span>
                                )}
                            </p>
                            {pathname === link.href && <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default StoreSidebar