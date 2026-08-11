'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowRight, Clock, MapPin, MessageCircle, UtensilsCrossed } from 'lucide-react'
import { LuoiQuanAnSkeleton } from '@/components/Skeleton'
import Anh from '@/components/Anh'
import { useAuth } from '@/components/AuthProvider'
import { useNgonNgu } from '@/lib/i18n'
import { formatVND } from '@/lib/utils/currency'
import { BangDoiTacGreenSM } from '@/components/GreenSM'
import { BUOI_DO_AN, NHOM_DO_AN } from '@/lib/doAn'
import TrangRong from '@/components/TrangRong'

const MAU = '#ea580c' // cam ẩm thực — màu nhận diện của module Đồ Ăn Hồng Gai

// Bỏ dấu tiếng Việt để so khớp tên món không phụ thuộc cách gõ dấu
const boDauMon = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')

// Tiêu đề dải "Món nổi bật" đổi theo buổi (server trả về theo giờ VN)
const TIEU_DE_BUOI = {
    an_sang: ['Gợi ý bữa sáng', 'Breakfast picks', '早餐推荐'],
    an_trua: ['Gợi ý bữa trưa', 'Lunch picks', '午餐推荐'],
    an_vat: ['Ăn vặt & giải khát', 'Snacks & drinks', '小吃与饮品'],
    an_toi: ['Gợi ý bữa tối', 'Dinner picks', '晚餐推荐'],
    an_dem: ['Gợi ý ăn đêm', 'Late-night bites', '夜宵推荐'],
}
const TIEU_DE_MAC_DINH = ['Món nổi bật', 'Featured dishes', '招牌菜']

// Hai chiều lọc quán: BUỔI phục vụ và LOẠI MÓN (config dùng chung ở lib/doAn), thêm mục "Tất cả".
const BUOI = [{ id: 'all', ten: ['Tất cả', 'All', '全部'], icon: '' }, ...BUOI_DO_AN]
const NHOM_MON = [{ id: 'all', ten: ['Tất cả', 'All', '全部'], icon: '' }, ...NHOM_DO_AN]
// id -> mục (để hiện chip có ICON ẢNH trên thẻ quán, thay cho emoji cũ)
const mapId = (ds) => Object.fromEntries(ds.filter(x => x.id !== 'all').map(x => [x.id, x]))
const BUOI_ID = mapId(BUOI)
const NHOM_ID = mapId(NHOM_MON)

// Chip nhỏ (icon ảnh + tên) hiển thị buổi/loại món trên thẻ quán. t: hàm dịch.
function ChipMon({ item, className = '', style, t }) {
    return (
        <span className={`inline-flex items-center gap-1 text-ti font-semibold pl-0.5 pr-2 py-0.5 rounded-full ${className}`} style={style}>
            <span className='flex items-center justify-center size-4 rounded-full bg-white shrink-0'>
                {item.anh ? <img src={item.anh} alt='' className='w-3 h-3 object-contain' /> : <span className='text-[9px]'>{item.icon}</span>}
            </span>
            {t(...item.ten)}
        </span>
    )
}

// Thanh nút lọc dùng chung cho cả hai chiều. t: hàm dịch.
function HangLoc({ nhan: label, items, value, onPick, t }) {
    return (
        <div className='flex items-center gap-2 flex-wrap justify-center'>
            <span className='text-xs font-semibold text-slate-400 mr-0.5 w-16 text-right max-sm:w-full max-sm:text-center'>{label}</span>
            {items.map(l => (
                <button key={l.id} onClick={() => onPick(l.id)}
                    className={`flex items-center gap-1.5 rounded-full text-sm font-medium transition active:scale-95 ${l.anh ? 'pl-1.5 pr-3.5 py-1' : 'px-3.5 py-1.5'} ${value === l.id ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    style={value === l.id ? { backgroundColor: MAU } : {}}>
                    {l.anh ? (
                        <span className={`flex items-center justify-center size-6 rounded-full shrink-0 ${value === l.id ? 'bg-white/25' : 'bg-white'}`}>
                            <img src={l.anh} alt='' className='w-[18px] h-[18px] object-contain' />
                        </span>
                    ) : (l.icon ? <span>{l.icon}</span> : null)}
                    {t(...l.ten)}
                </button>
            ))}
        </div>
    )
}

// Trang Đồ Ăn Hồng Gai — danh sách quán ăn cho du khách chọn quán rồi xem thực đơn.
export default function TrangDoAn() {
    const router = useRouter()
    const { user } = useAuth()
    const { t } = useNgonNgu()
    const [quans, setQuans] = useState([])
    const [monNoiBat, setMonNoiBat] = useState([])
    const [buoiNoiBat, setBuoiNoiBat] = useState(null)
    const [loading, setLoading] = useState(true)
    const [locBuoi, setLocBuoi] = useState('all')
    const [locNhom, setLocNhom] = useState('all')
    const [dangMo, setDangMo] = useState(false)

    // Nhắn nhanh với quán ngay từ thẻ (không phải vào trang quán). Nút nằm trong <Link> nên chặn điều hướng.
    const nhanTin = async (e, quanId) => {
        e.preventDefault(); e.stopPropagation()
        if (!user) { router.push('/login?ve=/do-an'); return }
        setDangMo(true)
        try {
            const res = await fetch('/api/tin-nhan/bat-dau', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quanAnId: quanId }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Không mở được cuộc trò chuyện', 'Could not start the conversation', '无法开始对话')); return }
            router.push(`/tin-nhan/${data.hoiThoai.id}`)
        } finally { setDangMo(false) }
    }

    useEffect(() => {
        fetch('/api/quan-an')
            .then(r => r.json())
            .then(d => setQuans(d.quanAns || []))
            .catch(() => setQuans([]))
            .finally(() => setLoading(false))
    }, [])

    // Món nổi bật (có ảnh) từ các quán — dải kiểu video, bấm vào sang quán để đặt
    useEffect(() => {
        fetch('/api/quan-an/mon-noi-bat').then(r => r.json()).then(d => { setMonNoiBat(d.mon || []); setBuoiNoiBat(d.buoi || null) }).catch(() => { })
    }, [])

    // Ảnh nền hero: ƯU TIÊN "Bánh cuốn chả mực" — đặc sản gắn với Hạ Long/Hồng Gai nên đại diện
    // đúng nhất cho trang ẩm thực ở đây. Chọn theo thứ tự trong mảng là hên xui (từng vớ phải
    // cốc trà đá). Dự phòng khi quán gỡ món: lấy món ĐẮT NHẤT (proxy cho "món tủ" — hải sản,
    // món chính, ảnh thường hoành tráng nhất).
    const monCoAnh = monNoiBat.filter(m => m.anh)
    const anhHero = (
        monCoAnh.find(m => boDauMon(m.ten).includes('banh cuon cha muc'))
        || monCoAnh.reduce((tot, m) => (!tot || (m.gia || 0) > (tot.gia || 0) ? m : tot), null)
    )?.anh

    const ketQua = quans.filter(q =>
        (locBuoi === 'all' || (q.loai || []).includes(locBuoi)) &&
        (locNhom === 'all' || (q.nhom || []).includes(locNhom))
    )
    const nhanLoc = [
        locBuoi !== 'all' && BUOI.find(b => b.id === locBuoi)?.ten,
        locNhom !== 'all' && NHOM_MON.find(n => n.id === locNhom)?.ten,
    ].filter(Boolean).map(x => t(...x)).join(' · ')

    if (loading) return (
        <div className='min-h-[70vh] my-8 mb-28'>
            <div className='max-w-6xl mx-auto px-6'>
                <span className='skeleton block h-9 w-64 max-w-full mx-auto' />
                <span className='skeleton block h-4 w-96 max-w-full mx-auto mt-3' />
                <div className='mt-10'><LuoiQuanAnSkeleton soThe={6} /></div>
            </div>
        </div>
    )

    return (
        <div className='min-h-[70vh] mb-28'>
            <div className='max-w-6xl mx-auto px-6 pt-6'>
                {/* Đầu trang kiểu tạp chí ẩm thực — lấy ẢNH MÓN NỔI BẬT làm nền (trước đây chỉ
                    có chữ, phí bộ ảnh món rất đẹp sẵn có). Chưa tải kịp ảnh thì dùng nền cam. */}
                {/* Hero CHIA ĐÔI: chữ trên nền cam riêng, ảnh món để NGUYÊN không phủ gì.
                    Bản trước đè chữ lên ảnh + phủ nâu 42–92% làm món ăn xỉn như ảnh ố, lại cắt
                    cụt hai bên nên không rõ món gì. Ảnh đồ ăn cận cảnh phải giữ tươi & sáng
                    mới kích thích — nên tách hẳn khỏi vùng chữ (cách GrabFood/ShopeeFood làm). */}
                <div className='relative overflow-hidden rounded-3xl bong-mem mb-8 flex items-stretch'
                    style={{ background: `linear-gradient(135deg, ${MAU} 0%, #9a3412 100%)` }}>
                    <div className='relative z-10 flex-1 min-w-0 px-5 sm:px-9 py-7 sm:py-11'>
                        <span className='inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3.5 py-1.5 rounded-full' style={{ background: 'rgba(255,255,255,.22)' }}>
                            <UtensilsCrossed size={13} /> {t('Ăn gì ở Hồng Gai?', 'What to eat in Hong Gai?', '鸿基吃什么？')}
                        </span>
                        <h1 className='text-2xl sm:text-4xl chu-hien-thi text-white mt-3'>{t('Đồ Ăn Hồng Gai', 'Hong Gai Food', '鸿基美食')}</h1>
                        <p className='text-white/80 mt-2 leading-relaxed text-sm max-w-md'>
                            {t('Quán ngon phố biển — hải sản, món địa phương, đồ uống. Chọn một quán để xem thực đơn và đặt món.', 'Great seaside eateries — seafood, local dishes, drinks. Pick one to see the menu and order.', '海滨美食 —— 海鲜、地方菜、饮品。选一家查看菜单并点餐。')}
                        </p>
                    </div>

                    {/* Ảnh món — bo tròn, nghiêng nhẹ, KHÔNG phủ màu để giữ độ tươi */}
                    {anhHero && (
                        <div className='relative shrink-0 w-[36%] max-w-[260px] self-center pr-4 sm:pr-8' aria-hidden='true'>
                            <Anh src={anhHero} alt='' uuTien
                                className='w-full aspect-square object-cover rounded-2xl rotate-3 shadow-[0_14px_36px_-10px_rgba(0,0,0,.5)] ring-4 ring-white/20' />
                        </div>
                    )}
                </div>

                <div className='text-center max-w-2xl mx-auto'>
                    {/* Đối tác giao vận Green SM — gọi xe điện giao đồ ăn tận nơi */}
                    <div className='max-w-md mx-auto mt-5'>
                        <BangDoiTacGreenSM
                            tieuDe={t('Giao đồ ăn, đặt xe cùng Green SM', 'Food delivery & rides with Green SM', 'Green SM 送餐 · 叫车')}
                            moTa={t('Xe điện giao tận nơi — nhanh, nóng hổi, thân thiện môi trường', 'Electric delivery — fast, hot, eco-friendly', '电动车送餐 —— 快速、热腾腾、环保')}
                            nhanNut={t('Đặt xe ngay', 'Book a ride', '立即叫车')} />
                    </div>
                </div>

                {/* Món nổi bật — dải món kèm ảnh từ các quán (kiểu video); bấm vào để sang quán đặt */}
                {monNoiBat.length > 0 && (
                    <div className='mt-9'>
                        <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700 mb-4'>
                            {(() => {
                                const bcfg = BUOI_DO_AN.find(b => b.id === buoiNoiBat)
                                return (
                                    <>
                                        {bcfg?.anh && <img src={bcfg.anh} alt='' className='w-7 h-7 object-contain shrink-0' />}
                                        {t(...(TIEU_DE_BUOI[buoiNoiBat] || TIEU_DE_MAC_DINH))}
                                    </>
                                )
                            })()}
                        </h2>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {monNoiBat.map(m => (
                                <Link key={m.id} href={`/do-an/${m.quanAnId}`}
                                    className='group flex gap-3 bg-white border border-slate-100 rounded-2xl p-2.5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300'>
                                    <Anh src={m.anh} alt={m.ten} className='size-20 rounded-xl object-cover shrink-0 ring-1 ring-slate-100' />
                                    <div className='min-w-0 flex-1 flex flex-col'>
                                        <h3 className='font-semibold text-slate-800 text-sm leading-snug line-clamp-2'>{m.ten}</h3>
                                        <p className='flex items-center gap-1 text-xs text-slate-500 mt-0.5'>
                                            <UtensilsCrossed size={11} className='shrink-0' /> <span className='truncate'>{m.tenQuan}</span>
                                        </p>
                                        <div className='flex items-center justify-between gap-2 mt-auto pt-1.5'>
                                            <span className='font-bold text-sm' style={{ color: MAU }}>{formatVND(m.gia)}</span>
                                            <span className='inline-flex items-center gap-1 text-xs font-semibold text-white px-3 py-1.5 rounded-full group-hover:opacity-90 transition' style={{ backgroundColor: MAU }}>
                                                {t('Đặt món', 'Order', '点餐')}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bộ lọc: buổi + loại món */}
                <div className='flex flex-col gap-3 mt-7'>
                    <HangLoc nhan={t('Buổi', 'Meal', '餐段')} items={BUOI} value={locBuoi} onPick={setLocBuoi} t={t} />
                    <HangLoc nhan={t('Loại món', 'Cuisine', '菜类')} items={NHOM_MON} value={locNhom} onPick={setLocNhom} t={t} />
                </div>

                {/* Lưới quán ăn */}
                <h2 className='text-lg font-semibold text-slate-700 mt-8 mb-4'>
                    {nhanLoc || t('Tất cả quán', 'All eateries', '全部餐馆')} ({ketQua.length})
                </h2>
                {ketQua.length ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                        {ketQua.map(q => (
                            <Link key={q.id} href={`/do-an/${q.id}`}
                                className='group rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden'>
                                <div className='relative aspect-[16/9] bg-slate-50 overflow-hidden'>
                                    <Anh src={q.logo} alt={q.ten} className='w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300' />
                                    {(q.gioMoCua || q.gioDongCua) && (
                                        <span className='absolute top-3 left-3 flex items-center gap-1 text-ti font-semibold text-white px-2.5 py-1 rounded-full shadow' style={{ backgroundColor: MAU }}>
                                            <Clock size={11} /> {q.gioMoCua} - {q.gioDongCua}
                                        </span>
                                    )}
                                </div>
                                <div className='p-5'>
                                    <h3 className='font-bold text-slate-800 truncate'>{q.ten}</h3>
                                    {q.diaChi && (
                                        <p className='flex items-center gap-1.5 text-xs text-slate-500 mt-1.5'>
                                            <MapPin size={13} className='shrink-0' /> <span className='truncate'>{q.diaChi}</span>
                                        </p>
                                    )}
                                    <p className='text-sm text-slate-600 line-clamp-2 leading-relaxed mt-2'>{q.moTa}</p>
                                    {((q.nhom || []).length > 0 || (q.loai || []).length > 0) && (
                                        <div className='flex items-center gap-1.5 flex-wrap mt-2.5'>
                                            {(q.nhom || []).map(n => NHOM_ID[n] && (
                                                <ChipMon key={n} item={NHOM_ID[n]} style={{ backgroundColor: MAU + '1a', color: MAU }} t={t} />
                                            ))}
                                            {(q.loai || []).map(l => BUOI_ID[l] && (
                                                <ChipMon key={l} item={BUOI_ID[l]} className='bg-slate-100 text-slate-500' t={t} />
                                            ))}
                                        </div>
                                    )}
                                    <div className='flex items-center justify-between gap-2 mt-3'>
                                        <span className='inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all' style={{ color: MAU }}>
                                            {t('Xem thực đơn', 'View menu', '查看菜单')} <ArrowRight size={14} />
                                        </span>
                                        <button onClick={(e) => nhanTin(e, q.id)} disabled={dangMo}
                                            className='inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition disabled:opacity-60' style={{ backgroundColor: MAU + '1a', color: MAU }}>
                                            <MessageCircle size={13} /> {t('Nhắn', 'Chat', '聊天')}
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : quans.length ? (
                    <TrangRong Icon={UtensilsCrossed} mau={MAU}
                        tieuDe={t('Không có quán nào khớp bộ lọc', 'No eateries match the filter', '没有符合筛选的餐馆')}
                        moTa={`${nhanLoc} — ${t('thử bỏ bớt bộ lọc để xem thêm quán.', 'try removing some filters to see more.', '试试减少筛选条件以查看更多。')}`}
                        nutText={t('Xem tất cả quán', 'View all eateries', '查看全部餐馆')}
                        onNut={() => { setLocBuoi('all'); setLocNhom('all') }} />
                ) : (
                    <TrangRong Icon={UtensilsCrossed} mau={MAU}
                        tieuDe={t('Chưa có quán ăn nào', 'No eateries yet', '暂无餐馆')}
                        moTa={t('Mời các quán ở Hồng Gai mở quán trên Chợ Số để khách đặt món nhé!', 'Invite Hong Gai eateries to open a store on Cho So so customers can order!', '邀请鸿基的餐馆在数字市场开店，方便顾客点餐！')}
                        nutText={t('Mở quán trên Chợ Số', 'Open a store', '开店')} nutHref='/create-store' />
                )}
            </div>
        </div>
    )
}
