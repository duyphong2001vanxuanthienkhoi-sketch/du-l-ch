'use client'
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import TheDonHang from "@/components/TheDonHang"
import { useNgonNgu } from "@/lib/i18n"
import { BUOC_GIAN, HANH_DONG_GIAN, TT_DON } from "@/lib/trangThaiDon"
import { Check, PackageCheck, Truck } from "lucide-react"

// Icon cho từng hành động của gian (khớp HANH_DONG_GIAN)
const ICON_HANH_DONG = { cho_xac_nhan: Check, cho_lay_hang: PackageCheck, dang_giao: Truck }

export default function StoreOrders() {
    const { t } = useNgonNgu()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [dangCapNhat, setDangCapNhat] = useState(null)
    const nhan = (id) => { const x = TT_DON[id]; return x ? t(x.ten, x.en, x.zh) : id }

    // ĐỌC DB: đơn có sản phẩm của gian mình (API chỉ trả item thuộc gian + yêu cầu hoàn nếu có)
    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/store/orders')
            const data = await res.json()
            setOrders(data.orders || [])
        } finally {
            setLoading(false)
        }
    }

    // GHI DB: đổi bước pipeline phần của gian mình trong đơn
    const doiTrangThai = async (orderId, status) => {
        setDangCapNhat(orderId)
        try {
            const res = await fetch('/api/store/orders', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了')); return }
            setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o))
            toast.success(`${t('Đã chuyển sang', 'Changed to', '已改为')} "${nhan(status)}"`)
        } finally { setDangCapNhat(null) }
    }

    // GHI DB: gian duyệt yêu cầu hoàn hàng (chấp nhận / từ chối) — refetch để thấy kết quả
    const xuLyHoan = async (orderId, lua) => {
        setDangCapNhat(orderId)
        try {
            const res = await fetch('/api/store/orders', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, xuLyHoan: lua }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了')); return }
            toast.success(lua === 'chap_nhan' ? t('Đã chấp nhận hoàn hàng', 'Return accepted', '已接受退货') : t('Đã từ chối hoàn hàng', 'Return rejected', '已拒绝退货'))
            fetchOrders()
        } finally { setDangCapNhat(null) }
    }

    useEffect(() => {
        fetchOrders()
        // Có đơn mới về gian → ThongBaoDon bắn 'don:refresh' → đơn tự hiện ngay (khỏi F5)
        const onRefresh = (e) => { if (e.detail?.scope === 'store-don') fetchOrders() }
        window.addEventListener('don:refresh', onRefresh)
        return () => window.removeEventListener('don:refresh', onRefresh)
    }, [])

    if (loading) return <Loading />

    return (
        <div className="mb-28">
            <h1 className="text-2xl text-slate-500 mb-1">{t('Đơn hàng', 'Orders', '订单')} <span className="text-slate-800 font-medium">{t('Của Gian', 'For Your Store', '本店')}</span></h1>
            <p className="text-sm text-slate-500 mb-6">{t('Chỉ hiển thị các sản phẩm thuộc gian của bạn trong mỗi đơn. Cập nhật trạng thái để khách theo dõi được đơn.', 'Only shows the products belonging to your store in each order. Update the status so customers can track their order.', '每笔订单仅显示属于您店铺的商品。更新状态以便顾客追踪订单。')}</p>

            {orders.length ? (
                <div className="flex flex-col gap-4">
                    {orders.map(don => (
                        <TheDonHang key={don.id} don={don} hienKhach tongTien={don.tongTienCuaGian} nhanTong={t("Phần của gian bạn", "Your store's portion", "本店部分")}>
                            <div className="border-t border-slate-100 pt-3 mt-3">
                                {don.status === 'tra_hang' ? (
                                    // Khách yêu cầu hoàn — gian duyệt
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: TT_DON.tra_hang.mau }}>{t('Khách yêu cầu trả hàng / hoàn', 'Customer requested a return', '顾客申请退货')}</p>
                                        {don.hoanHang?.lyDo && <p className="text-xs text-slate-500 mt-0.5">{t('Lý do:', 'Reason:', '原因：')} {don.hoanHang.lyDo}</p>}
                                        {don.hoanHang?.ketQua ? (
                                            <p className="text-xs font-semibold mt-1.5" style={{ color: don.hoanHang.ketQua === 'chap_nhan' ? TT_DON.tra_hang.mau : TT_DON.da_giao.mau }}>
                                                {don.hoanHang.ketQua === 'chap_nhan' ? t('✓ Bạn đã chấp nhận hoàn hàng', '✓ You accepted the return', '✓ 已接受退货') : t('✕ Bạn đã từ chối (đơn về Đã giao)', '✕ You rejected the return', '✕ 已拒绝退货')}
                                            </p>
                                        ) : (
                                            <div className="flex gap-2 mt-2">
                                                <button disabled={dangCapNhat === don.id} onClick={() => xuLyHoan(don.id, 'chap_nhan')}
                                                    className="text-xs font-semibold px-3.5 py-1.5 rounded-full text-white active:scale-95 transition disabled:opacity-50" style={{ backgroundColor: TT_DON.tra_hang.mau }}>
                                                    {t('Chấp nhận hoàn', 'Accept return', '接受退货')}
                                                </button>
                                                <button disabled={dangCapNhat === don.id} onClick={() => xuLyHoan(don.id, 'tu_choi')}
                                                    className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition disabled:opacity-50">
                                                    {t('Từ chối', 'Reject', '拒绝')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : don.status === 'da_huy' ? (
                                    <span className="text-sm font-medium" style={{ color: TT_DON.da_huy.mau }}>{t('Khách đã hủy đơn', 'Customer cancelled this order', '顾客已取消订单')}</span>
                                ) : (
                                    // Pipeline: gian bấm HÀNH ĐỘNG để tiến bước
                                    // (Xác nhận đơn → Đã lấy hàng → Đã giao hàng). Khách thấy trạng thái đổi ngay.
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-slate-400">{t('Đang ở:', 'Now:', '当前：')}</span>
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: TT_DON[don.status]?.mau, backgroundColor: TT_DON[don.status]?.nen }}>
                                            {nhan(don.status)}
                                        </span>

                                        {/* Nút hành động chính — tiến sang bước kế tiếp */}
                                        {HANH_DONG_GIAN[don.status] && (() => {
                                            const hd = HANH_DONG_GIAN[don.status]
                                            const Icon = ICON_HANH_DONG[don.status]
                                            return (
                                                <button disabled={dangCapNhat === don.id} onClick={() => doiTrangThai(don.id, hd.toi)}
                                                    className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-1.5 rounded-full active:scale-95 transition disabled:opacity-50 ml-auto"
                                                    style={{ backgroundColor: TT_DON[hd.toi].mau }}>
                                                    {Icon && <Icon size={15} />} {t(hd.ten, hd.en, hd.zh)}
                                                </button>
                                            )
                                        })()}

                                        {/* Sửa nếu bấm nhầm: quay về các bước khác */}
                                        <details className="w-full">
                                            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 list-none mt-1">{t('Đổi trạng thái khác', 'Set another status', '设为其他状态')}</summary>
                                            <div className="flex items-center gap-2 flex-wrap mt-2">
                                                {BUOC_GIAN.map(id => (
                                                    <button key={id} disabled={dangCapNhat === don.id || don.status === id} onClick={() => doiTrangThai(don.id, id)}
                                                        className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition active:scale-95 disabled:pointer-events-none ${don.status === id ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                        style={don.status === id ? { backgroundColor: TT_DON[id].mau } : {}}>
                                                        {nhan(id)}
                                                    </button>
                                                ))}
                                            </div>
                                        </details>
                                    </div>
                                )}
                            </div>
                        </TheDonHang>
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
