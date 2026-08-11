'use client'
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import TheDonHang from "@/components/TheDonHang"
import RatingModal from "@/components/RatingModal"
import TrangRong from "@/components/TrangRong"
import { useNgonNgu } from "@/lib/i18n"
import { BUOC_DON, TRA_HANG, HUY_DON } from "@/lib/trangThaiDon"
import { CheckCircle2, PackageIcon, RotateCcw, Star, XCircle } from "lucide-react"

// Tab lọc theo trạng thái (kiểu Shopee): Tất cả + pipeline + Trả hàng + Đã hủy
const CAC_TAB = [{ id: 'all', ten: 'Tất cả', en: 'All', zh: '全部' }, ...BUOC_DON, TRA_HANG, HUY_DON]

export default function MyOrders() {
    const { t } = useNgonNgu()
    const [orders, setOrders] = useState(null)
    const [loading, setLoading] = useState(true)
    const [ratingModal, setRatingModal] = useState(null) // { orderId, productId, tenSanPham }
    const [tab, setTab] = useState('all')
    const [dangXuLy, setDangXuLy] = useState(null)  // orderId đang hủy / gửi hoàn
    const [hoanDon, setHoanDon] = useState(null)    // orderId đang nhập lý do hoàn
    const [lyDoHoan, setLyDoHoan] = useState('')

    const taiDon = () => {
        fetch('/api/orders/me')
            .then(r => r.json())
            .then(data => setOrders(data.orders)) // null nếu chưa đăng nhập
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        taiDon()
        // Gian đổi trạng thái phần đơn của mình → ThongBaoDon bắn 'don:refresh' → tải lại ngay (khỏi F5)
        const onRefresh = (e) => { if (e.detail?.scope === 'khach-cho') taiDon() }
        window.addEventListener('don:refresh', onRefresh)
        return () => window.removeEventListener('don:refresh', onRefresh)
    }, [])

    // Khách HỦY đơn (chỉ khi 'chờ xác nhận')
    const huyDon = async (id) => {
        if (!confirm(t('Hủy đơn này? Thao tác không thể hoàn tác.', 'Cancel this order? This cannot be undone.', '取消此订单？此操作无法撤销。'))) return
        setDangXuLy(id)
        try {
            const res = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hanhDong: 'huy' }) })
            const d = await res.json()
            if (!res.ok) { toast.error(d.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了')); return }
            toast.success(t('Đã hủy đơn', 'Order cancelled', '订单已取消'))
            taiDon()
        } finally { setDangXuLy(null) }
    }

    // Khách gửi YÊU CẦU HOÀN HÀNG (chỉ khi 'đã giao') kèm lý do
    const guiHoan = async (id) => {
        if (!lyDoHoan.trim()) return toast.error(t('Vui lòng nhập lý do hoàn hàng', 'Please enter a return reason', '请填写退货原因'))
        setDangXuLy(id)
        try {
            const res = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hanhDong: 'yeu_cau_hoan', lyDo: lyDoHoan }) })
            const d = await res.json()
            if (!res.ok) { toast.error(d.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了')); return }
            toast.success(t('Đã gửi yêu cầu hoàn hàng', 'Return request sent', '退货申请已发送'))
            setHoanDon(null); setLyDoHoan(''); taiDon()
        } finally { setDangXuLy(null) }
    }

    const nhanTT = (b) => t(b.ten, b.en, b.zh)
    const dem = (id) => (orders || []).filter(o => id === 'all' ? true : o.status === id).length
    const hienThi = useMemo(() => (orders || []).filter(o => tab === 'all' ? true : o.status === tab), [orders, tab])

    if (loading) return <Loading />

    // Chưa đăng nhập
    if (orders === null) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
            <PackageIcon size={48} className="text-slate-300" />
            <h1 className="text-2xl font-semibold text-slate-700 mt-4">{t('Đơn hàng của tôi', 'My orders', '我的订单')}</h1>
            <p className="text-slate-500 text-sm mt-2 max-w-md">{t('Đăng nhập để xem lại các đơn bạn đã đặt. Đặt khi chưa đăng nhập? Vẫn tra được bằng mã đơn và số điện thoại.', 'Sign in to review your orders. Ordered without an account? You can still look it up with the order code and phone number.', '登录以查看您的订单。未登录下单？仍可用订单号和手机号查询。')}</p>
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-6">
                <Link href="/login?ve=/orders" className="bg-ngoc-500 hover:bg-ngoc-600 transition text-white px-8 py-2.5 rounded-full text-sm font-medium">{t('Đăng nhập', 'Sign in', '登录')}</Link>
                <Link href="/tra-don" className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-8 py-2.5 rounded-full text-sm font-medium transition">{t('Tra đơn không cần đăng nhập', 'Track without signing in', '免登录查询订单')}</Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-[60vh] mx-6 my-12 mb-24">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl text-slate-500 mb-5">{t('Đơn hàng', 'Orders', '订单')} <span className="text-slate-800 font-medium">{t('Của Tôi', 'Mine', '我的')}</span></h1>

                {/* Tab trạng thái — cuộn ngang trên điện thoại */}
                {orders.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
                        {CAC_TAB.map(tb => {
                            const active = tab === tb.id
                            const n = dem(tb.id)
                            return (
                                <button key={tb.id} onClick={() => setTab(tb.id)}
                                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition ${active ? 'bg-ngoc-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                    {nhanTT(tb)}{n > 0 && <span className={active ? 'ml-1 opacity-90' : 'ml-1 text-slate-400'}>({n})</span>}
                                </button>
                            )
                        })}
                    </div>
                )}

                {hienThi.length ? (
                    <div className="flex flex-col gap-4">
                        {hienThi.map(don => (
                            <TheDonHang key={don.id} don={don} hienGian tongTien={don.tongTien}
                                giamGia={{ tongTienHang: don.tongTienHang, tienGiam: don.tienGiam, maGiam: don.maGiam }}
                                hanhDongItem={(it) => it.daGiao && (
                                    it.daDanhGia ? (
                                        <span className="flex items-center gap-1 text-xs text-green-600 whitespace-nowrap">
                                            <CheckCircle2 size={13} /> {t('Đã đánh giá', 'Reviewed', '已评价')}
                                        </span>
                                    ) : (
                                        <button onClick={() => setRatingModal({ orderId: don.id, productId: it.productId, tenSanPham: it.ten })}
                                            className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full whitespace-nowrap transition active:scale-95">
                                            <Star size={13} /> {t('Đánh giá', 'Review', '评价')}
                                        </button>
                                    )
                                )}>
                                {/* Hành động của khách theo trạng thái CHUNG của đơn */}
                                {don.status === 'cho_xac_nhan' && (
                                    <div className="border-t border-slate-100 pt-3 mt-3 flex justify-end">
                                        <button onClick={() => huyDon(don.id)} disabled={dangXuLy === don.id}
                                            className="flex items-center gap-1.5 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 px-4 py-1.5 rounded-full transition active:scale-95 disabled:opacity-50">
                                            <XCircle size={15} /> {t('Hủy đơn', 'Cancel order', '取消订单')}
                                        </button>
                                    </div>
                                )}
                                {don.status === 'da_giao' && (
                                    hoanDon === don.id ? (
                                        <div className="border-t border-slate-100 pt-3 mt-3">
                                            <p className="text-sm font-medium text-slate-600 mb-1.5">{t('Lý do hoàn hàng', 'Return reason', '退货原因')}</p>
                                            <textarea value={lyDoHoan} onChange={e => setLyDoHoan(e.target.value)} rows={2} maxLength={500}
                                                placeholder={t('VD: Hàng bị hỏng / không đúng mô tả...', 'e.g. Item damaged / not as described...', '如：商品损坏／与描述不符…')}
                                                className="w-full bg-slate-100 rounded-xl px-3 py-2 text-sm outline-none placeholder-slate-400 resize-none" />
                                            <div className="flex gap-2 mt-2 justify-end">
                                                <button onClick={() => { setHoanDon(null); setLyDoHoan('') }} className="text-sm font-medium text-slate-500 px-4 py-1.5 rounded-full hover:bg-slate-100 transition">{t('Bỏ', 'Cancel', '取消')}</button>
                                                <button onClick={() => guiHoan(don.id)} disabled={dangXuLy === don.id}
                                                    className="text-sm font-semibold text-white px-5 py-1.5 rounded-full active:scale-95 transition disabled:opacity-50" style={{ backgroundColor: TRA_HANG.mau }}>
                                                    {t('Gửi yêu cầu', 'Send request', '提交申请')}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border-t border-slate-100 pt-3 mt-3 flex justify-end">
                                            <button onClick={() => { setHoanDon(don.id); setLyDoHoan('') }}
                                                className="flex items-center gap-1.5 text-sm font-medium border px-4 py-1.5 rounded-full transition active:scale-95" style={{ color: TRA_HANG.mau, borderColor: TRA_HANG.mau + '55' }}>
                                                <RotateCcw size={15} /> {t('Yêu cầu hoàn hàng', 'Request a return', '申请退货')}
                                            </button>
                                        </div>
                                    )
                                )}
                                {don.status === 'tra_hang' && (
                                    <div className="border-t border-slate-100 pt-3 mt-3">
                                        <p className="text-sm font-medium flex items-center gap-1.5" style={{ color: TRA_HANG.mau }}>
                                            <RotateCcw size={15} /> {t('Đã gửi yêu cầu hoàn hàng — đang chờ gian xử lý.', 'Return requested — waiting for the store to process.', '退货申请已发送 —— 等待店铺处理。')}
                                        </p>
                                    </div>
                                )}
                            </TheDonHang>
                        ))}
                    </div>
                ) : (
                    <TrangRong Icon={PackageIcon}
                        tieuDe={orders.length ? t('Không có đơn ở mục này', 'No orders in this tab', '此分类暂无订单') : t('Bạn chưa có đơn hàng nào', 'You have no orders yet', '您还没有订单')}
                        moTa={orders.length ? t('Chọn tab khác để xem các đơn còn lại.', 'Pick another tab to see other orders.', '选择其他分类查看订单。') : t('Khi bạn đặt đơn, đơn sẽ hiện ở đây để theo dõi trạng thái giao hàng.', 'Once you place an order, it will appear here so you can track delivery.', '下单后，订单会显示在这里以便跟踪配送。')}
                        nutText={orders.length ? undefined : t('Mua sắm ngay', 'Shop now', '立即购物')} nutHref={orders.length ? undefined : "/"} />
                )}
            </div>

            {ratingModal && (
                <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} onDone={taiDon} />
            )}
        </div>
    )
}
