'use client'
import Loading from "@/components/Loading"
import { formatVND } from "@/lib/utils/currency"
import { CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, TagsIcon, TruckIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Anh from "@/components/Anh"
import AnhDaiDien from "@/components/AnhDaiDien"
import { useNgonNgu } from "@/lib/i18n"

export default function Dashboard() {

    const router = useRouter()
    const { t } = useNgonNgu()

    const [loading, setLoading] = useState(true)
    const [tk, setTk] = useState({ tongSanPham: 0, tongDon: 0, donDaGiao: 0, doanhThu: 0, danhGia: [] })

    useEffect(() => {
        fetch('/api/store/thong-ke')
            .then(r => r.json())
            .then(data => { if (!data.error) setTk(data) })
            .finally(() => setLoading(false))
    }, [])

    const cards = [
        { title: t('Tổng Sản Phẩm', 'Total Products', '商品总数'), value: tk.tongSanPham, icon: ShoppingBasketIcon },
        { title: t('Tổng Doanh Thu', 'Total Revenue', '总营收'), value: formatVND(tk.doanhThu), icon: CircleDollarSignIcon },
        { title: t('Tổng Đơn Hàng', 'Total Orders', '订单总数'), value: tk.tongDon, icon: TagsIcon },
        { title: t('Đơn Đã Giao', 'Delivered Orders', '已送达订单'), value: tk.donDaGiao, icon: TruckIcon },
    ]

    if (loading) return <Loading />

    return (
        <div className=" text-slate-500 mb-28">
            <h1 className="text-2xl">{t('Tổng quan', 'Overview', '概览')} <span className="text-slate-800 font-medium">{t('Gian Hàng', 'Store', '店铺')}</span></h1>

            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {cards.map((card, index) => (
                    <div key={index} className="flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg">
                        <div className="flex flex-col gap-3 text-xs">
                            <p>{card.title}</p>
                            <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                        </div>
                        <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                    </div>
                ))}
            </div>

            <h2 className="flex items-center gap-2">{t('Đánh Giá Sản Phẩm', 'Product Reviews', '商品评价')}
                <span className="text-xs font-medium text-slate-400">({tk.danhGia.length})</span>
            </h2>

            {tk.danhGia.length === 0 ? (
                <p className="text-sm text-slate-400 mt-4">{t('Gian của bạn chưa có đánh giá nào. Khách sẽ đánh giá sau khi nhận hàng.', 'Your store has no reviews yet. Customers will review after receiving their orders.', '您的店铺暂无评价。顾客收货后会进行评价。')}</p>
            ) : (
                <div className="mt-5">
                    {tk.danhGia.map((dg) => (
                        <div key={dg.id} className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-6 border-b border-slate-200 text-sm text-slate-600 max-w-4xl">
                            <div>
                                <div className="flex gap-3">
                                    <AnhDaiDien src={dg.anhNguoiDung} ten={dg.ten}
                                        khung="size-10 rounded-full bg-green-500"
                                        chu="text-white font-bold" />
                                    <div>
                                        <p className="font-medium">{dg.ten}</p>
                                        <p className="font-light text-slate-500">{new Date(dg.createdAt).toLocaleDateString(t('vi-VN', 'en-US', 'zh-CN'))}</p>
                                    </div>
                                </div>
                                <p className="mt-3 text-slate-500 max-w-xs leading-6">{dg.binhLuan}</p>
                            </div>
                            <div className="flex flex-col justify-between gap-6 sm:items-end">
                                <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                                    {dg.anhSanPham && <Anh src={dg.anhSanPham} alt={dg.tenSanPham} className="size-10 rounded object-cover ring-1 ring-slate-100" />}
                                    <p className="font-medium">{dg.tenSanPham}</p>
                                    <div className='flex items-center'>
                                        {Array(5).fill('').map((_, i) => (
                                            <StarIcon key={i} size={17} className='text-transparent mt-0.5' fill={dg.sao >= i + 1 ? "#00C950" : "#D1D5DB"} />
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => router.push(`/product/${dg.productId}`)} className="bg-slate-100 px-5 py-2 hover:bg-slate-200 rounded transition-all">{t('Xem Sản Phẩm', 'View Product', '查看商品')}</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
