'use client'
import Loading from "@/components/Loading"
import Anh from "@/components/Anh"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Save, Store, UtensilsCrossed } from "lucide-react"
import { DIA_DIEM } from "@/lib/diaDiem"
import { useNgonNgu } from "@/lib/i18n"

const NHAN_LOAI_GIAN = {
    cho_tuoi: { ten: ['Chợ Tươi', 'Fresh Market', '鲜市'], mau: '#059669' },
    qua_quang_ninh: { ten: ['Quà Quảng Ninh', 'Quang Ninh Gifts', '广宁礼品'], mau: '#d97706' },
}

// Admin gắn tay "gian hàng đáng chú ý" VÀ "quán ăn gần đó" cho từng địa điểm.
// Gắn xong sẽ hiện trên trang /dia-diem/[id] cho du khách.
export default function AdminDiaDiem() {

    const { t } = useNgonNgu()
    const [stores, setStores] = useState([])
    const [quanAns, setQuanAns] = useState([])
    const [chon, setChon] = useState({})           // { [diaDiemId]: [storeId] } gian đang chỉnh
    const [chonQuan, setChonQuan] = useState({})    // { [diaDiemId]: [quanId] } quán đang chỉnh
    const [daLuu, setDaLuu] = useState({})          // gian đã lưu trên server
    const [daLuuQuan, setDaLuuQuan] = useState({})  // quán đã lưu trên server
    const [loading, setLoading] = useState(true)
    const [dangLuu, setDangLuu] = useState(null)

    useEffect(() => {
        fetch('/api/admin/dia-diem')
            .then(r => r.json())
            .then(data => {
                setStores(data.stores || [])
                setQuanAns(data.quanAns || [])
                const mGian = {}, mQuan = {}
                for (const d of DIA_DIEM) {
                    mGian[d.id] = data.gianTheoDiaDiem?.[d.id] || []
                    mQuan[d.id] = data.quanTheoDiaDiem?.[d.id] || []
                }
                setChon(mGian); setDaLuu(mGian)
                setChonQuan(mQuan); setDaLuuQuan(mQuan)
            })
            .catch(() => toast.error(t('Không tải được dữ liệu', 'Could not load data', '无法加载数据')))
            .finally(() => setLoading(false))
    }, [])

    // Bật/tắt một item trong danh sách đang chỉnh (dùng chung cho gian & quán)
    const batTat = (setter) => (diaDiemId, itemId) => {
        setter(truoc => {
            const hienTai = truoc[diaDiemId] || []
            return {
                ...truoc,
                [diaDiemId]: hienTai.includes(itemId)
                    ? hienTai.filter(id => id !== itemId)
                    : [...hienTai, itemId],
            }
        })
    }
    const batTatGian = batTat(setChon)
    const batTatQuan = batTat(setChonQuan)

    const khac = (a, b) => JSON.stringify([...(a || [])].sort()) !== JSON.stringify([...(b || [])].sort())
    const coThayDoi = (diaDiemId) =>
        khac(chon[diaDiemId], daLuu[diaDiemId]) || khac(chonQuan[diaDiemId], daLuuQuan[diaDiemId])

    const luu = async (diaDiemId) => {
        setDangLuu(diaDiemId)
        try {
            const res = await fetch('/api/admin/dia-diem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diaDiemId, storeIds: chon[diaDiemId] || [], quanIds: chonQuan[diaDiemId] || [] }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            if (data.storeIds) { setDaLuu(prev => ({ ...prev, [diaDiemId]: data.storeIds })); setChon(prev => ({ ...prev, [diaDiemId]: data.storeIds })) }
            if (data.quanIds) { setDaLuuQuan(prev => ({ ...prev, [diaDiemId]: data.quanIds })); setChonQuan(prev => ({ ...prev, [diaDiemId]: data.quanIds })) }
            toast.success(t('Đã lưu cho địa điểm', 'Saved for this place', '已为该地点保存'))
        } catch (e) {
            toast.error(e.message || t('Lưu thất bại, thử lại nhé', 'Save failed, please try again', '保存失败，请重试'))
        } finally {
            setDangLuu(null)
        }
    }

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">{t('Bản đồ số —', 'Digital map —', '数字地图 —')} <span className="text-slate-800 font-medium">{t('Gian Hàng & Quán Ăn Gần Đó', 'Nearby Stores & Eateries', '附近店铺与餐馆')}</span></h1>
            <p className="text-sm mt-2 max-w-2xl">
                {t('Chọn gian hàng tiêu biểu và quán ăn gần cho từng địa điểm. Mục đã gắn sẽ hiện trong "Gian hàng đáng chú ý" và "Quán ăn gần đó" trên trang giới thiệu địa điểm cho du khách.',
                   'Pick featured stores and nearby eateries for each place. Assigned items appear under "Featured stores" and "Nearby eateries" on the place page shown to visitors.',
                   '为每个地点挑选精选店铺和附近餐馆。已关联的项目会显示在面向游客的地点介绍页的"精选店铺"和"附近餐馆"中。')}
            </p>

            {!stores.length && !quanAns.length && (
                <p className="mt-6 text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-3 max-w-2xl">
                    {t('Chưa có gian hàng hay quán ăn nào được duyệt — duyệt trước rồi quay lại gắn nhé.',
                       'No approved stores or eateries yet — approve some first, then come back to assign them.',
                       '尚无已通过的店铺或餐馆 — 请先审核通过，再回来关联。')}
                </p>
            )}

            <div className="flex flex-col gap-5 mt-6 max-w-4xl">
                {DIA_DIEM.map(d => (
                    <div key={d.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="flex items-center justify-center size-10 text-xl rounded-xl shrink-0" style={{ backgroundColor: d.mau + '1a' }}>{d.icon}</span>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-semibold text-slate-800">{t(...d.ten)}</h2>
                                <span className="text-ti font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: d.mau + '1a', color: d.mau }}>{t(...d.loai)}</span>
                            </div>
                            <span className="text-xs text-slate-400 flex items-center gap-2">
                                <span><Store size={12} className="inline -mt-0.5" /> {(chon[d.id] || []).length}</span>
                                <span><UtensilsCrossed size={12} className="inline -mt-0.5" /> {(chonQuan[d.id] || []).length}</span>
                            </span>
                            <button
                                onClick={() => luu(d.id)}
                                disabled={!coThayDoi(d.id) || dangLuu === d.id}
                                className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none">
                                <Save size={13} /> {dangLuu === d.id ? t('Đang lưu...', 'Saving...', '保存中…') : t('Lưu', 'Save', '保存')}
                            </button>
                        </div>

                        {/* Gian hàng đáng chú ý */}
                        {stores.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5"><Store size={13} /> {t('Gian hàng đáng chú ý', 'Featured stores', '精选店铺')}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {stores.map(g => {
                                        const daChon = (chon[d.id] || []).includes(g.id)
                                        const loai = NHAN_LOAI_GIAN[g.loaiGian]
                                        return (
                                            <label key={g.id}
                                                className={`flex items-center gap-3 rounded-xl border p-2.5 cursor-pointer transition ${daChon ? 'border-green-400 bg-green-50/60' : 'border-slate-100 hover:bg-slate-50'}`}>
                                                <input type="checkbox" checked={daChon} onChange={() => batTatGian(d.id, g.id)}
                                                    className="accent-green-500 size-4 shrink-0" />
                                                <Anh src={g.logo} alt={g.tenGian} className="size-9 rounded-lg object-cover ring-1 ring-slate-100 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-700 truncate">{g.tenGian}</p>
                                                    <p className="text-ti" style={{ color: loai?.mau }}>{loai ? t(...loai.ten) : ''} · {g.tenChu}</p>
                                                </div>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quán ăn gần đó */}
                        {quanAns.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5"><UtensilsCrossed size={13} /> {t('Quán ăn gần đó', 'Nearby eateries', '附近餐馆')}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {quanAns.map(q => {
                                        const daChon = (chonQuan[d.id] || []).includes(q.id)
                                        return (
                                            <label key={q.id}
                                                className={`flex items-center gap-3 rounded-xl border p-2.5 cursor-pointer transition ${daChon ? 'border-orange-400 bg-orange-50/60' : 'border-slate-100 hover:bg-slate-50'}`}>
                                                <input type="checkbox" checked={daChon} onChange={() => batTatQuan(d.id, q.id)}
                                                    className="accent-orange-500 size-4 shrink-0" />
                                                <Anh src={q.logo} alt={q.ten} className="size-9 rounded-lg object-cover ring-1 ring-slate-100 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-700 truncate">{q.ten}</p>
                                                    <p className="text-ti text-orange-600">{t('Quán ăn', 'Eatery', '餐馆')} · {q.tenChu}</p>
                                                </div>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
