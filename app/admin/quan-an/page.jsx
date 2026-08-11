'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import Anh from '@/components/Anh'
import { Check, Clock, MapPin, Phone, X } from 'lucide-react'
import { useNgonNgu } from '@/lib/i18n'

// ten: [vi, en, zh] — dịch tại chỗ hiển thị bằng t(...)
const BO_LOC = [
    { id: 'cho_duyet', ten: ['Chờ duyệt', 'Pending', '待审核'] },
    { id: 'da_duyet', ten: ['Đã duyệt', 'Approved', '已通过'] },
    { id: 'tu_choi', ten: ['Từ chối', 'Rejected', '已拒绝'] },
    { id: 'all', ten: ['Tất cả', 'All', '全部'] },
]
const TT = {
    cho_duyet: { ten: ['Chờ duyệt', 'Pending', '待审核'], mau: '#d97706' },
    da_duyet: { ten: ['Đã duyệt', 'Approved', '已通过'], mau: '#059669' },
    tu_choi: { ten: ['Từ chối', 'Rejected', '已拒绝'], mau: '#dc2626' },
}
const NHAN_BUOI = { an_sang: ['Sáng', 'Breakfast', '早餐'], an_trua: ['Trưa', 'Lunch', '午餐'], an_toi: ['Tối', 'Dinner', '晚餐'], an_vat: ['Vặt', 'Snacks', '小吃'], an_dem: ['Đêm', 'Late night', '夜宵'] }
const NHAN_NHOM = { do_an_vat: ['Đồ ăn vặt', 'Snacks', '小吃'], bun: ['Bún', 'Rice noodles', '米粉'], pho: ['Phở', 'Pho', '河粉'], com: ['Cơm', 'Rice', '米饭'], chao: ['Cháo', 'Congee', '粥'], mien: ['Miến', 'Glass noodles', '粉丝'], hai_san: ['Hải sản', 'Seafood', '海鲜'] }

export default function AdminQuanAn() {
    const { t } = useNgonNgu()
    const [quans, setQuans] = useState([])
    const [loading, setLoading] = useState(true)
    const [loc, setLoc] = useState('cho_duyet')

    const tai = async (status) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/quan-an?status=${status}`)
            const data = await res.json()
            setQuans(data.quanAns || [])
        } finally { setLoading(false) }
    }
    useEffect(() => { tai(loc) }, [loc])

    const quyetDinh = async (quanAnId, qd) => {
        const res = await fetch('/api/admin/quan-an/decide', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quanAnId, quyetDinh: qd }),
        })
        const data = await res.json()
        if (!res.ok) { toast.error(data.error || t('Thất bại', 'Failed', '操作失败')); return }
        toast.success(qd === 'da_duyet' ? t('Đã duyệt quán', 'Eatery approved', '已通过餐馆') : t('Đã từ chối quán', 'Eatery rejected', '已拒绝餐馆'))
        // Bỏ khỏi danh sách nếu đang lọc trạng thái khác kết quả, hoặc cập nhật tại chỗ
        setQuans(prev => loc === 'all' ? prev.map(q => q.id === quanAnId ? data.quanAn : q) : prev.filter(q => q.id !== quanAnId))
    }

    return (
        <div className='text-slate-500 mb-28'>
            <h1 className='text-2xl'>{t('Duyệt', 'Approve', '审核')} <span className='text-slate-800 font-medium'>{t('Quán Ăn', 'Eateries', '餐馆')}</span></h1>
            <p className='text-sm mt-2 max-w-2xl'>{t('Xét duyệt quán ăn do người dùng đăng ký. Chỉ quán "Đã duyệt" mới hiện cho khách và nhận đơn.', 'Review eateries registered by users. Only "Approved" eateries are shown to customers and can receive orders.', '审核用户注册的餐馆。只有"已通过"的餐馆才会向顾客展示并可接单。')}</p>

            <div className='flex gap-2 mt-4 flex-wrap'>
                {BO_LOC.map(b => (
                    <button key={b.id} onClick={() => setLoc(b.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${loc === b.id ? 'bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        style={loc === b.id && TT[b.id] ? { backgroundColor: TT[b.id].mau } : {}}>
                        {t(...b.ten)}
                    </button>
                ))}
            </div>

            {loading ? <Loading /> : quans.length ? (
                <div className='flex flex-col gap-4 mt-6 max-w-4xl'>
                    {quans.map(q => {
                        const tt = TT[q.status] || TT.cho_duyet
                        return (
                            <div key={q.id} className='bg-white border border-slate-200 rounded-2xl shadow-sm p-5'>
                                <div className='flex items-start gap-4'>
                                    <Anh src={q.logo} alt={q.ten} className='size-16 rounded-2xl object-cover ring-1 ring-slate-100 shrink-0' />
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center gap-2 flex-wrap'>
                                            <h2 className='font-semibold text-slate-800'>{q.ten}</h2>
                                            <span className='text-ti font-semibold px-2 py-0.5 rounded-full text-white' style={{ backgroundColor: tt.mau }}>{t(...tt.ten)}</span>
                                        </div>
                                        <p className='text-sm text-slate-500 mt-0.5'>{t('Chủ:', 'Owner:', '店主：')} {q.tenChu} · {q.emailChu}</p>
                                        <p className='text-sm text-slate-600 mt-1'>{q.moTa}</p>
                                        <div className='flex items-center gap-3 flex-wrap text-xs text-slate-500 mt-2'>
                                            <span className='flex items-center gap-1'><Clock size={12} /> {q.gioMoCua}-{q.gioDongCua}</span>
                                            <span className='flex items-center gap-1'><MapPin size={12} /> {q.diaChi}</span>
                                            <span className='flex items-center gap-1'><Phone size={12} /> {q.soDienThoai}</span>
                                        </div>
                                        <div className='flex items-center gap-1.5 flex-wrap mt-2'>
                                            {(q.nhom || []).map(n => <span key={n} className='text-ti px-2 py-0.5 rounded-full bg-orange-50 text-orange-600'>{t(...(NHAN_NHOM[n] || [n]))}</span>)}
                                            {(q.loai || []).map(l => <span key={l} className='text-ti px-2 py-0.5 rounded-full bg-slate-100 text-slate-500'>{t(...(NHAN_BUOI[l] || [l]))}</span>)}
                                        </div>
                                    </div>
                                </div>
                                {q.status !== 'da_duyet' && (
                                    <div className='flex items-center gap-2 mt-4'>
                                        <button onClick={() => quyetDinh(q.id, 'da_duyet')} className='flex items-center gap-1.5 text-sm font-semibold text-white px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 transition active:scale-95'><Check size={15} /> {t('Duyệt', 'Approve', '通过')}</button>
                                        <button onClick={() => quyetDinh(q.id, 'tu_choi')} className='flex items-center gap-1.5 text-sm font-semibold text-red-500 px-5 py-2 rounded-full border border-red-200 hover:bg-red-50 transition active:scale-95'><X size={15} /> {t('Từ chối', 'Reject', '拒绝')}</button>
                                    </div>
                                )}
                                {q.status === 'da_duyet' && (
                                    <div className='flex items-center gap-2 mt-4'>
                                        <button onClick={() => quyetDinh(q.id, 'tu_choi')} className='flex items-center gap-1.5 text-sm font-semibold text-red-500 px-5 py-2 rounded-full border border-red-200 hover:bg-red-50 transition active:scale-95'><X size={15} /> {t('Gỡ duyệt', 'Unapprove', '取消通过')}</button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className='flex items-center justify-center h-72'>
                    <h1 className='text-2xl text-slate-400 font-medium'>{t('Không có quán ăn nào', 'No eateries yet', '暂无餐馆')}</h1>
                </div>
            )}
        </div>
    )
}
