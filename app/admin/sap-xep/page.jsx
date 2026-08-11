'use client'
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import Anh from "@/components/Anh"
import { NHAN_LOAI } from "@/components/admin/TheGianHang"
import { ArrowDown, ArrowUp, Star } from "lucide-react"
import { useNgonNgu } from "@/lib/i18n"

const KHU = ['cho_tuoi', 'qua_quang_ninh']

// Sắp xếp hiển thị hiện tại: gian đã ghim (uuTien số) lên trước theo uuTien tăng,
// gian chưa ghim xếp sau theo ngày tạo — khớp với thứ tự khách nhìn thấy.
const xepBanDau = (ds) => ds.slice().sort((a, b) => {
    const ua = typeof a.uuTien === 'number' ? a.uuTien : Number.MAX_SAFE_INTEGER
    const ub = typeof b.uuTien === 'number' ? b.uuTien : Number.MAX_SAFE_INTEGER
    if (ua !== ub) return ua - ub
    return String(a.createdAt).localeCompare(String(b.createdAt))
})

export default function AdminSapXep() {
    const { t } = useNgonNgu()
    const [theoKhu, setTheoKhu] = useState({ cho_tuoi: [], qua_quang_ninh: [] })
    const [loading, setLoading] = useState(true)
    const [dangLuu, setDangLuu] = useState(false)

    useEffect(() => {
        fetch('/api/admin/stores?status=da_duyet')
            .then(r => r.json())
            .then(data => {
                const gians = data.stores || []
                setTheoKhu({
                    cho_tuoi: xepBanDau(gians.filter(g => g.loaiGian === 'cho_tuoi')),
                    qua_quang_ninh: xepBanDau(gians.filter(g => g.loaiGian === 'qua_quang_ninh')),
                })
            })
            .finally(() => setLoading(false))
    }, [])

    // Đổi chỗ 2 gian trong 1 khu rồi lưu ngay thứ tự mới của khu đó
    const doiCho = async (khu, i, j) => {
        const ds = theoKhu[khu].slice()
        if (j < 0 || j >= ds.length) return
        ;[ds[i], ds[j]] = [ds[j], ds[i]]
        setTheoKhu({ ...theoKhu, [khu]: ds })

        setDangLuu(true)
        try {
            const res = await fetch('/api/admin/stores/sap-xep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ thuTu: ds.map(g => g.id) }),
            })
            if (!res.ok) { toast.error(t('Không lưu được thứ tự', 'Could not save order', '无法保存顺序')); return }
            toast.success(t('Đã lưu thứ tự', 'Order saved', '已保存顺序'), { id: 'saXep' })
        } finally {
            setDangLuu(false)
        }
    }

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">{t('Sắp xếp', 'Arrange', '排序')} <span className="text-slate-800 font-medium">{t('Gian Hàng Ở Trang Chủ', 'Stores On Home Page', '首页店铺')}</span></h1>
            <p className="text-sm mt-2 max-w-2xl">
                {t('Dùng nút', 'Use the', '使用')} <ArrowUp size={13} className="inline" /> / <ArrowDown size={13} className="inline" /> {t('để đưa gian lên/xuống trong mỗi khu.', 'buttons to move a store up/down within each zone.', '按钮在每个区内上移/下移店铺。')}
                {' '}{t('Gian được đưa lên sẽ', 'A store moved up gets', '上移的店铺会被')} <b>{t('ghim', 'pinned', '固定')}</b> {t('vị trí đó ở trang chủ. Những gian chưa ghim vẫn tự xếp theo', 'to that position on the home page. Unpinned stores are still ordered by', '在首页的该位置。未固定的店铺仍按')} <b>{t('đánh giá cao', 'top ratings', '高评分')}</b>.
            </p>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
                {KHU.map(khu => {
                    const nhan = NHAN_LOAI[khu]
                    const ds = theoKhu[khu]
                    return (
                        <div key={khu} className="bg-white border border-slate-200 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="flex items-center justify-center size-8 rounded-lg" style={{ backgroundColor: nhan.nen }}>
                                    <img src={nhan.anh} alt="" className="w-5 h-5 object-contain" />
                                </span>
                                <h2 className="font-semibold text-slate-800">{t(...nhan.ten)}</h2>
                                <span className="text-xs text-slate-400">({ds.length} {t('gian', 'stores', '店铺')})</span>
                            </div>

                            {ds.length ? (
                                <div className="flex flex-col gap-2">
                                    {ds.map((g, i) => (
                                        <div key={g.id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                                            <span className="flex items-center justify-center size-6 rounded-full bg-white text-xs font-bold text-slate-500 shrink-0 ring-1 ring-slate-200">{i + 1}</span>
                                            <Anh src={g.logo} alt={g.tenGian} className="size-10 rounded-lg object-cover ring-1 ring-slate-200 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-slate-700 truncate">{g.tenGian}</p>
                                                <p className="text-xs text-slate-400 truncate">{t('Chủ gian:', 'Owner:', '店主：')} {g.tenChu}</p>
                                            </div>
                                            <div className="flex flex-col gap-1 shrink-0">
                                                <button onClick={() => doiCho(khu, i, i - 1)} disabled={i === 0 || dangLuu}
                                                    aria-label={t('Đưa lên', 'Move up', '上移')} className="p-1 rounded-md bg-white ring-1 ring-slate-200 hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:pointer-events-none transition">
                                                    <ArrowUp size={14} />
                                                </button>
                                                <button onClick={() => doiCho(khu, i, i + 1)} disabled={i === ds.length - 1 || dangLuu}
                                                    aria-label={t('Đưa xuống', 'Move down', '下移')} className="p-1 rounded-md bg-white ring-1 ring-slate-200 hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:pointer-events-none transition">
                                                    <ArrowDown size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-slate-400 py-8 justify-center">
                                    <Star size={16} /> {t('Khu này chưa có gian đã duyệt', 'No approved stores in this zone yet', '该区暂无已通过的店铺')}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
