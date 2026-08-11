'use client'
import Loading from "@/components/Loading"
import TheGianHang from "@/components/admin/TheGianHang"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNgonNgu } from "@/lib/i18n"

export default function AdminApprove() {

    const { t } = useNgonNgu()
    const [gians, setGians] = useState([])
    const [loading, setLoading] = useState(true)
    const [dangXuLy, setDangXuLy] = useState(null) // id gian đang gửi quyết định

    // ĐỌC DB: các gian đang chờ duyệt
    const fetchGians = async () => {
        try {
            const res = await fetch('/api/admin/stores?status=cho_duyet')
            const data = await res.json()
            setGians(data.stores || [])
        } finally {
            setLoading(false)
        }
    }

    // GHI DB: admin ra quyết định
    const quyetDinh = async (storeId, quyetDinh) => {
        setDangXuLy(storeId)
        try {
            const res = await fetch('/api/admin/stores/decide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, quyetDinh }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了'))
                return
            }
            toast.success(quyetDinh === 'da_duyet' ? t('Đã duyệt gian hàng!', 'Store approved!', '已通过店铺！') : t('Đã từ chối gian hàng', 'Store rejected', '已拒绝店铺'))
            setGians(gians.filter(g => g.id !== storeId))
        } finally {
            setDangXuLy(null)
        }
    }

    useEffect(() => {
        fetchGians()
    }, [])

    return !loading ? (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">{t('Duyệt', 'Approve', '审核')} <span className="text-slate-800 font-medium">{t('Gian Hàng', 'Stores', '店铺')}</span></h1>
            <p className="text-sm mt-1">{t('Gian hàng chỉ hiển thị cho khách sau khi được duyệt.', 'Stores are shown to customers only after approval.', '店铺通过审核后才会向顾客展示。')}</p>

            {gians.length ? (
                <div className="flex flex-col gap-4 mt-6">
                    {gians.map((gian) => (
                        <div key={gian.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex max-md:flex-col gap-4 md:items-center max-w-4xl">
                            <TheGianHang gian={gian} />

                            <div className="flex gap-3 pt-2 flex-wrap shrink-0">
                                <button
                                    disabled={dangXuLy === gian.id}
                                    onClick={() => quyetDinh(gian.id, 'da_duyet')}
                                    className="px-5 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 text-sm font-medium active:scale-95 transition disabled:opacity-50">
                                    {t('Duyệt', 'Approve', '通过')}
                                </button>
                                <button
                                    disabled={dangXuLy === gian.id}
                                    onClick={() => quyetDinh(gian.id, 'tu_choi')}
                                    className="px-5 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm font-medium active:scale-95 transition disabled:opacity-50">
                                    {t('Từ chối', 'Reject', '拒绝')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-3xl text-slate-400 font-medium">{t('Không có yêu cầu nào đang chờ', 'No pending requests', '暂无待审核申请')}</h1>
                </div>
            )}
        </div>
    ) : <Loading />
}
