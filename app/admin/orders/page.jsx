'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import TheDonHang from "@/components/TheDonHang"
import { formatVND } from "@/lib/utils/currency"
import { useNgonNgu } from "@/lib/i18n"

export default function AdminOrders() {
    const { t } = useNgonNgu()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    // ĐỌC DB: TẤT CẢ đơn hàng toàn chợ
    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders')
            const data = await res.json()
            setOrders(data.orders || [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    const tongDoanhThu = orders.reduce((s, o) => s + o.tongTien, 0)

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">{t('Tất cả', 'All', '全部')} <span className="text-slate-800 font-medium">{t('Đơn Hàng', 'Orders', '订单')}</span></h1>
            <p className="text-sm mt-1 mb-6">{orders.length} {t('đơn · tổng giá trị', 'orders · total value', '单 · 总金额')} {formatVND(tongDoanhThu)}</p>

            {orders.length ? (
                <div className="flex flex-col gap-4">
                    {orders.map(don => (
                        <TheDonHang key={don.id} don={don} hienKhach hienGian tongTien={don.tongTien} />
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-72">
                    <p className="text-2xl text-slate-400 font-medium">{t('Chưa có đơn hàng nào', 'No orders yet', '暂无订单')}</p>
                </div>
            )}
        </div>
    )
}
