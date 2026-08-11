'use client'
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { formatVND } from "@/lib/utils/currency"
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useNgonNgu } from "@/lib/i18n"

export default function AdminDashboard() {

    const { t } = useNgonNgu()
    const [loading, setLoading] = useState(true)
    const [tk, setTk] = useState({ tongSanPham: 0, doanhThu: 0, tongDon: 0, tongGian: 0, ngayTaoDon: [] })

    // Số liệu thật từ /api/admin/thong-ke (trước đây là dữ liệu demo của template)
    useEffect(() => {
        fetch('/api/admin/thong-ke')
            .then(r => r.json())
            .then(data => { if (!data.error) setTk(data) })
            .finally(() => setLoading(false))
    }, [])

    const dashboardCardsData = [
        { title: t('Tổng Sản Phẩm', 'Total Products', '商品总数'), value: tk.tongSanPham, icon: ShoppingBasketIcon },
        { title: t('Tổng Doanh Thu', 'Total Revenue', '总营收'), value: formatVND(tk.doanhThu), icon: CircleDollarSignIcon },
        { title: t('Tổng Đơn Hàng', 'Total Orders', '订单总数'), value: tk.tongDon, icon: TagsIcon },
        { title: t('Gian Đã Duyệt', 'Approved Stores', '已通过店铺'), value: tk.tongGian, icon: StoreIcon },
    ]

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-20">
            <h1 className="text-2xl">{t('Tổng quan', 'Overview', '概览')} <span className="text-slate-800 font-medium">{t('Quản Trị', 'Admin', '管理')}</span></h1>

            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            <OrdersAreaChart allOrders={tk.ngayTaoDon.map(d => ({ createdAt: d }))} />
        </div>
    )
}
