'use client'
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import { useAuth } from "../AuthProvider"
import { useNgonNgu } from "@/lib/i18n"

const StoreLayout = ({ children }) => {

    const { user } = useAuth()
    const { t } = useNgonNgu()
    const [gian, setGian] = useState(undefined) // undefined = đang tải /api/store/me; null = chưa có gian
    const [storeInfo, setStoreInfo] = useState(null)
    const [soDonMoi, setSoDonMoi] = useState(0)
    const soDonMoiTruoc = useRef(null)

    // Phiên (user) lấy từ AuthProvider dùng chung; chỉ còn phải hỏi riêng thông tin gian
    useEffect(() => {
        fetch('/api/store/me').then(r => r.json()).then(st => {
            setGian(st.store || null)
            // Tên + logo lấy từ gian thật
            setStoreInfo(st.store ? { name: st.store.tenGian, logo: st.store.logo } : null)
        }).catch(() => { setGian(null); setStoreInfo(null) })
    }, [])

    const loading = user === undefined || gian === undefined
    // Chỉ tiểu thương có gian ĐÃ DUYỆT mới vào được khu quản lý
    const isSeller = user?.role === 'tieu_thuong' && gian?.status === 'da_duyet'

    // Thông báo đơn mới: kiểm tra mỗi 20 giây, báo toast khi có đơn "mới" tăng lên
    useEffect(() => {
        if (!isSeller) return

        const kiemTraDonMoi = async () => {
            try {
                const res = await fetch('/api/store/orders')
                const data = await res.json()
                const dem = (data.orders || []).filter(o => o.status === 'moi').length
                if (soDonMoiTruoc.current !== null && dem > soDonMoiTruoc.current) {
                    toast(`🔔 ${t('Bạn có', 'You have', '您有')} ${dem - soDonMoiTruoc.current} ${t('đơn hàng mới!', 'new order(s)!', '个新订单！')}`, { duration: 6000 })
                }
                soDonMoiTruoc.current = dem
                setSoDonMoi(dem)
            } catch { }
        }

        kiemTraDonMoi()
        const timer = setInterval(kiemTraDonMoi, 20000)
        return () => clearInterval(timer)
    }, [isSeller])

    return loading ? (
        <Loading />
    ) : isSeller ? (
        <div className="flex flex-col h-screen">
            <SellerNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <SellerSidebar storeInfo={storeInfo} soDonMoi={soDonMoi} />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">{t('Bạn không có quyền truy cập trang này', 'You do not have access to this page', '您无权访问此页面')}</h1>
            <p className="text-slate-400 mt-3 text-sm">{t('Khu vực này chỉ dành cho tiểu thương có gian hàng đã được duyệt. Xem trạng thái gian của bạn tại', 'This area is only for merchants with an approved store. Check your store status at', '此区域仅供已通过审核的商户使用。在此查看店铺状态：')} <Link href="/create-store" className="underline">{t('Gian hàng của tôi', 'My store', '我的店铺')}</Link>.</p>
            <div className="flex items-center gap-3 mt-8">
                <Link href="/login?ve=/store" className="bg-green-500 text-white flex items-center gap-2 p-2 px-6 max-sm:text-sm rounded-full">
                    {t('Đăng nhập', 'Sign in', '登录')}
                </Link>
                <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 p-2 px-6 max-sm:text-sm rounded-full">
                    {t('Về trang chủ', 'Back to home', '返回首页')} <ArrowRightIcon size={18} />
                </Link>
            </div>
        </div>
    )
}

export default StoreLayout