'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { ArrowLeft, ArrowRight, Clock, MapPin, Navigation, Plus, Route } from 'lucide-react'
import Loading from '@/components/Loading'
import Anh from '@/components/Anh'
import AnhDiaDiem from '@/components/AnhDiaDiem'
import { NutLuu } from '@/components/TheDiaDiem'
import { useNgonNgu } from '@/lib/i18n'
import { mauDiaDiem, iconDiaDiem, timLoai, linkChiDuong, khoangCachKm } from '@/lib/diaDiemLoai'
import { taiDiaDiem } from '@/lib/utils/diaDiemClient'
import { napTuLoTrinh } from '@/lib/utils/lichTrinh'

const BanDo = dynamic(() => import('@/components/BanDo'), {
    ssr: false,
    loading: () => <div className='w-full h-full bg-slate-100 animate-pulse' />,
})

// CHI TIẾT LỘ TRÌNH — dòng thời gian dọc bên trái, bản đồ nối tuyến bên phải.
// Bộ sưu tập dùng chung trang này, chỉ khác là không hiện giờ giấc.

// Ước lượng thời gian đi bộ giữa hai chặng — 4,5 km/h là tốc độ đi bộ thong thả.
// Chỉ là con số THAM KHẢO theo đường chim bay, không phải chỉ đường thật.
const uocTinhDiBo = (km) => {
    if (km == null) return null
    const phut = Math.round((km / 4.5) * 60)
    return phut < 1 ? 1 : phut
}

export default function TrangChiTietLoTrinh() {
    const { id } = useParams()
    const { t } = useNgonNgu()

    const [lt, setLt] = useState(null)
    const [ds, setDs] = useState([])
    const [loading, setLoading] = useState(true)
    const [chon, setChon] = useState(null)

    useEffect(() => {
        if (!id) return
        Promise.all([
            fetch(`/api/lo-trinh?id=${encodeURIComponent(id)}`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
            taiDiaDiem(),
        ]).then(([kq, tatCa]) => {
            setLt(kq.loTrinh || null)
            setDs(tatCa || [])
        }).finally(() => setLoading(false))
    }, [id])

    // Ghép chặng với dữ liệu địa điểm, bỏ chặng trỏ tới địa điểm đã bị xoá
    const chang = useMemo(() => {
        if (!lt) return []
        return (lt.diem || [])
            .map(c => ({ ...c, d: ds.find(x => x.id === c.diaDiemId) }))
            .filter(c => c.d)
    }, [lt, ds])

    if (loading) return <Loading />

    if (!lt) return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-6'>
            <Route size={48} className='text-slate-300' />
            <h1 className='text-2xl font-semibold text-slate-700 mt-4'>{t('Không tìm thấy lộ trình', 'Itinerary not found', '未找到行程')}</h1>
            <Link href='/lo-trinh' className='bg-violet-600 hover:bg-violet-700 transition text-white px-8 py-2.5 rounded-full mt-6 text-sm font-medium'>
                {t('Về danh sách lộ trình', 'Back to itineraries', '返回行程列表')}
            </Link>
        </div>
    )

    const mau = lt.mau || '#7c3aed'
    const laBoSuuTap = lt.kieu === 'bo_suu_tap'

    const dungLoTrinhNay = () => {
        const them = napTuLoTrinh(lt)
        if (them) {
            toast.success(t(`Đã thêm ${them} điểm vào hành trình của bạn`,
                `Added ${them} stops to your journey`, `已将${them}个站点加入你的旅程`))
        } else {
            toast(t('Các điểm này đã có trong hành trình của bạn',
                'These stops are already in your journey', '这些站点已在你的旅程中'))
        }
    }

    return (
        <div className='min-h-[70vh] mb-28 max-w-6xl mx-auto px-5 py-6'>
            <Link href='/lo-trinh' className='inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4'>
                <ArrowLeft size={15} /> {t('Về danh sách', 'Back to list', '返回列表')}
            </Link>

            {/* Đầu trang */}
            <div className='rounded-3xl px-6 py-7 sm:px-9'
                style={{ background: `radial-gradient(120% 170% at 100% 0%, ${mau}30 0%, transparent 55%), linear-gradient(135deg, ${mau}12, ${mau}26)` }}>
                <span className='inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full text-white' style={{ backgroundColor: mau }}>
                    {lt.icon} {laBoSuuTap ? t('Bộ sưu tập', 'Collection', '专题') : t('Lộ trình gợi ý', 'Suggested itinerary', '推荐行程')}
                </span>
                <h1 className='text-2xl sm:text-4xl font-bold text-slate-800 mt-3 can-dong'>{t(...lt.ten)}</h1>
                <div className='flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-slate-600 mt-2'>
                    <span className='flex items-center gap-1.5'>
                        <MapPin size={14} /> {t(`${chang.length} điểm dừng`, `${chang.length} stops`, `${chang.length} 个站点`)}
                    </span>
                    {t(...(lt.thoiLuong || [])) && (
                        <span className='flex items-center gap-1.5'><Clock size={14} /> {t(...lt.thoiLuong)}</span>
                    )}
                </div>
                <p className='text-slate-600 mt-3 max-w-2xl leading-relaxed'>{t(...lt.mota)}</p>

                {/* Nối nội dung biên tập sang kế hoạch cá nhân — chép các chặng vào
                    "Hành trình của tôi" để khách sửa lại theo ý mình (localStorage) */}
                <button onClick={dungLoTrinhNay}
                    className='flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full mt-4 active:scale-95 transition'
                    style={{ backgroundColor: mau }}>
                    <Plus size={15} /> {t('Dùng lộ trình này', 'Use this itinerary', '采用此行程')}
                </button>
            </div>

            <div className='grid lg:grid-cols-5 gap-6 mt-8 items-start'>
                {/* Dòng thời gian */}
                <div className='lg:col-span-3'>
                    <div className='flex flex-col'>
                        {chang.map((c, i) => {
                            const d = c.d
                            const mauD = mauDiaDiem(d)
                            const loai = timLoai(d.loai)
                            const truoc = chang[i - 1]
                            const km = truoc?.d?.viTri && d.viTri ? khoangCachKm(truoc.d.viTri, d.viTri) : null
                            const phutDiBo = uocTinhDiBo(km)

                            return (
                                <div key={`${c.diaDiemId}-${i}`}>
                                    {/* Khoảng cách từ chặng trước */}
                                    {i > 0 && km != null && (
                                        <div className='flex items-center gap-3 pl-[19px] py-2'>
                                            <span className='w-0.5 h-8 bg-slate-200 shrink-0' />
                                            <span className='text-xs text-slate-400'>
                                                {km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`}
                                                {phutDiBo != null && phutDiBo <= 25 &&
                                                    ` · ${t(`đi bộ ~${phutDiBo} phút`, `~${phutDiBo} min walk`, `步行约${phutDiBo}分钟`)}`}
                                            </span>
                                        </div>
                                    )}

                                    <div onMouseEnter={() => setChon(d.id)}
                                        className='flex gap-4 group'>
                                        {/* Cột số thứ tự */}
                                        <div className='flex flex-col items-center shrink-0'>
                                            <span className='flex items-center justify-center size-10 rounded-full text-white font-bold shadow-sm'
                                                style={{ backgroundColor: mau }}>
                                                {i + 1}
                                            </span>
                                        </div>

                                        {/* Thẻ chặng */}
                                        <div className='flex-1 min-w-0 pb-2'>
                                            {!laBoSuuTap && (c.gio || c.phut > 0) && (
                                                <p className='flex items-center gap-2 text-sm font-bold mb-1.5' style={{ color: mau }}>
                                                    {c.gio && <span>{c.gio}</span>}
                                                    {c.phut > 0 && (
                                                        <span className='font-medium text-slate-400'>
                                                            · {t(`nên dành ~${c.phut} phút`, `~${c.phut} min here`, `建议停留约${c.phut}分钟`)}
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                            <div className='flex gap-3.5 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm group-hover:shadow-md transition'>
                                                <Link href={`/dia-diem/${d.id}`} className='shrink-0'>
                                                    {d.anhBia
                                                        ? <Anh src={d.anhBia} alt='' className='size-20 rounded-xl object-cover' />
                                                        : <span className='block size-20 rounded-xl overflow-hidden'>
                                                            <AnhDiaDiem id={d.id} alt='' className='w-full h-full object-cover'
                                                                fallback={<span className='flex items-center justify-center w-full h-full text-3xl'
                                                                    style={{ background: `linear-gradient(135deg, ${mauD}22, ${mauD}55)` }}>{iconDiaDiem(d)}</span>} />
                                                        </span>}
                                                </Link>
                                                <div className='min-w-0 flex-1'>
                                                    <div className='flex items-start justify-between gap-2'>
                                                        <Link href={`/dia-diem/${d.id}`} className='font-bold text-slate-800 truncate hover:underline'>
                                                            {t(...d.ten)}
                                                        </Link>
                                                        <NutLuu id={d.id} className='!size-8 shrink-0 -mt-0.5' />
                                                    </div>
                                                    <span className='inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1'
                                                        style={{ backgroundColor: mauD + '1a', color: mauD }}>
                                                        {loai ? t(...loai.ten) : d.loai}
                                                    </span>
                                                    {t(...(c.ghiChu || [])) && (
                                                        <p className='text-xs text-slate-500 mt-1.5 italic'>“{t(...c.ghiChu)}”</p>
                                                    )}
                                                    <div className='flex items-center gap-3 mt-2'>
                                                        <a href={linkChiDuong(d.ten)} target='_blank' rel='noopener noreferrer'
                                                            className='inline-flex items-center gap-1 text-xs font-semibold' style={{ color: mauD }}>
                                                            <Navigation size={11} /> {t('Chỉ đường', 'Directions', '路线')}
                                                        </a>
                                                        <Link href={`/dia-diem/${d.id}`}
                                                            className='inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600'>
                                                            {t('Chi tiết', 'Details', '详情')} <ArrowRight size={11} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Bản đồ nối tuyến — dính khi cuộn để luôn nhìn được */}
                <div className='lg:col-span-2 lg:sticky lg:top-4'>
                    <div className='rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-sm'>
                        <BanDo ds={chang.map(c => c.d)} chon={chon} onChon={setChon}
                            noiTuyen={!laBoSuuTap} soThuTu
                            cao='h-[50vh] min-h-[340px]' />
                    </div>
                    {!laBoSuuTap && (
                        <p className='text-[11px] text-slate-400 mt-2 px-1'>
                            {t('Đường nối là hình dáng hành trình giữa các chặng, không phải chỉ đường theo đường phố.',
                                'The line shows the shape of the route between stops, not street-level directions.',
                                '连线显示各站之间的行程走向，并非街道级导航路线。')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
