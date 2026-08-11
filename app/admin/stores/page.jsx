'use client'
import Loading from "@/components/Loading"
import TheGianHang, { NHAN_TRANG_THAI } from "@/components/admin/TheGianHang"
import { useEffect, useState } from "react"
import { useNgonNgu } from "@/lib/i18n"

const BO_LOC = [
    { id: 'all', ten: ['Tất cả', 'All', '全部'] },
    { id: 'cho_duyet', ten: ['Chờ duyệt', 'Pending', '待审核'] },
    { id: 'da_duyet', ten: ['Đã duyệt', 'Approved', '已通过'] },
    { id: 'tu_choi', ten: ['Từ chối', 'Rejected', '已拒绝'] },
]

export default function AdminStores() {

    const { t } = useNgonNgu()
    const [gians, setGians] = useState([])
    const [loading, setLoading] = useState(true)
    const [loc, setLoc] = useState('all')

    // ĐỌC DB: toàn bộ gian, lọc theo trạng thái ở server
    const fetchGians = async (status) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/stores?status=${status}`)
            const data = await res.json()
            setGians(data.stores || [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGians(loc)
    }, [loc])

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">{t('Danh sách', 'List of', '列表')} <span className="text-slate-800 font-medium">{t('Gian Hàng', 'Stores', '店铺')}</span></h1>

            {/* Bộ lọc theo trạng thái */}
            <div className="flex gap-2 mt-4 flex-wrap">
                {BO_LOC.map(b => (
                    <button key={b.id} onClick={() => setLoc(b.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${loc === b.id ? 'bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        style={loc === b.id && b.id !== 'all' ? { backgroundColor: NHAN_TRANG_THAI[b.id]?.mau } : {}}>
                        {t(...b.ten)}
                    </button>
                ))}
            </div>

            {loading ? <Loading /> : gians.length ? (
                <div className="flex flex-col gap-4 mt-6">
                    {gians.map((gian) => (
                        <div key={gian.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 max-w-4xl">
                            <TheGianHang gian={gian} hienTrangThai />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-3xl text-slate-400 font-medium">{t('Không có gian hàng nào', 'No stores yet', '暂无店铺')}</h1>
                </div>
            )}
        </div>
    )
}
