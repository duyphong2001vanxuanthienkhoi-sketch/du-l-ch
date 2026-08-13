'use client'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LayoutGrid, LocateFixed, Map as MapIcon, MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import TheDiaDiem from '@/components/TheDiaDiem'
import ChipLoaiHinh from '@/components/ChipLoaiHinh'
import Loading from '@/components/Loading'
import TrangRong from '@/components/TrangRong'
import { useNgonNgu } from '@/lib/i18n'
import { MUC_GIA, khoangCachKm } from '@/lib/diaDiemLoai'
import { useDiaDiem, locDiaDiem, dangMoCua } from '@/lib/utils/diaDiemClient'

// Bản đồ nặng (Leaflet) nên tải LƯỜI, chỉ khi khách bật chế độ bản đồ.
const BanDo = dynamic(() => import('@/components/BanDo'), {
    ssr: false,
    loading: () => <div className='w-full h-full bg-slate-100 animate-pulse rounded-2xl' />,
})

// Trang KHÁM PHÁ — mục lục địa điểm cho du khách.
// Trên điện thoại, bản đồ và danh sách KHÔNG xếp chồng mà là nút CHUYỂN:
// xếp chồng thì khách phải cuộn hết bản đồ mới thấy danh sách, mất trọn màn hình đầu.

function NoiDungKhamPha() {
    const { t } = useNgonNgu()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { ds, dangTai } = useDiaDiem()

    const [loai, setLoai] = useState('')
    const [tuKhoa, setTuKhoa] = useState('')
    const [mucGia, setMucGia] = useState('')
    const [dangMo, setDangMo] = useState(false)
    const [moLoc, setMoLoc] = useState(false)
    const [cheDo, setCheDo] = useState('danh-sach')  // 'danh-sach' | 'ban-do'
    const [chon, setChon] = useState(null)
    const [viTriToi, setViTriToi] = useState(null)

    // Nhận ?loai= và ?q= từ URL.
    // ?loai= : tab Ăn uống ở thanh dưới, chip ở trang chủ.
    // ?q=    : ô tìm ở hero trang chủ và ô tìm trên Navbar đều đẩy sang đây.
    //          Bản trước CHỈ đọc `loai` nên `q` bị bỏ qua im lặng — gõ gì cũng ra
    //          nguyên danh sách, trông như ô tìm hỏng.
    useEffect(() => {
        setLoai(searchParams.get('loai') || '')
        setTuKhoa(searchParams.get('q') || '')
    }, [searchParams])

    // Ghi bộ lọc vào URL để chia sẻ được và tab dưới sáng đúng — không tải lại trang.
    // Giữ CẢ HAI tham số, nếu không thì đổi loại sẽ xoá mất từ khoá đang tìm (và ngược lại).
    const capNhatUrl = (loaiMoi, tuKhoaMoi) => {
        const p = new URLSearchParams()
        if (loaiMoi) p.set('loai', loaiMoi)
        if (tuKhoaMoi?.trim()) p.set('q', tuKhoaMoi.trim())
        const s = p.toString()
        router.replace(s ? `/kham-pha?${s}` : '/kham-pha', { scroll: false })
    }

    const doiLoai = (id) => {
        setLoai(id)
        capNhatUrl(id, tuKhoa)
    }

    const doiTuKhoa = (v) => {
        setTuKhoa(v)
        capNhatUrl(loai, v)
    }

    const viTri = () => {
        if (!navigator.geolocation) return
        navigator.geolocation.getCurrentPosition(
            p => setViTriToi([p.coords.latitude, p.coords.longitude]),
            () => { /* khách từ chối thì thôi, không báo lỗi phiền */ },
        )
    }

    // Đếm số địa điểm theo loại — để thanh chip ẩn loại chưa có gì và hiện số
    const dem = useMemo(() => {
        const kq = {}
        for (const d of ds) kq[d.loai] = (kq[d.loai] || 0) + 1
        return kq
    }, [ds])

    const ketQua = useMemo(() => {
        const loc = locDiaDiem(ds, { tuKhoa, loai, mucGia, dangMo })
        if (!viTriToi) return loc.map(d => ({ d, km: null }))
        // Có vị trí khách -> kèm khoảng cách và xếp gần trước
        return loc
            .map(d => ({ d, km: d.viTri ? khoangCachKm(viTriToi, d.viTri) : null }))
            .sort((a, b) => (a.km ?? 1e9) - (b.km ?? 1e9))
    }, [ds, tuKhoa, loai, mucGia, dangMo, viTriToi])

    const soLocDangBat = (mucGia ? 1 : 0) + (dangMo ? 1 : 0)

    if (dangTai) return <Loading />

    return (
        <div className='min-h-[70vh] mb-28'>
            {/* Đầu trang */}
            <div className='max-w-6xl mx-auto px-5 pt-6'>
                <h1 className='text-3xl sm:text-4xl chu-hien-thi text-slate-800'>
                    {t('Khám phá Hồng Gai', 'Explore Hong Gai', '探索鸿基')}
                </h1>
                <p className='text-slate-500 mt-1.5 text-sm sm:text-base max-w-2xl'>
                    {t('Núi thiêng, chùa cổ, chợ biển, quán ngon và kỳ quan thế giới — tất cả trong bán kính vài cây số.',
                        'Sacred mountains, ancient pagodas, sea markets, good food and a world wonder — all within a few kilometres.',
                        '灵山、古寺、海市、美食与世界奇观 —— 皆在数公里之内。')}
                </p>

                {/* Ô tìm kiếm */}
                <div className='flex items-center gap-2.5 bg-white border border-slate-200 rounded-full px-5 py-3 mt-5 shadow-sm max-w-xl'>
                    <Search size={18} className='text-slate-400 shrink-0' />
                    <input value={tuKhoa} onChange={e => doiTuKhoa(e.target.value)}
                        placeholder={t('Tìm địa điểm, quán ăn...', 'Search places, eateries...', '搜索地点、餐馆…')}
                        className='w-full bg-transparent outline-none text-sm placeholder-slate-400' />
                    {tuKhoa && (
                        <button onClick={() => doiTuKhoa('')} aria-label={t('Xoá', 'Clear', '清除')}
                            className='text-slate-300 hover:text-slate-500 shrink-0'><X size={16} /></button>
                    )}
                </div>
            </div>

            {/* Thanh chip loại hình + công cụ — DÍNH dưới đầu trang */}
            <div className='sticky top-0 z-30 bg-white/90 backdrop-blur-md border-y border-slate-100 mt-5'>
                <div className='max-w-6xl mx-auto px-5 py-3'>
                    <ChipLoaiHinh chon={loai} onChon={doiLoai} dem={dem} />

                    <div className='flex items-center gap-2 mt-2.5 flex-wrap'>
                        {/* Chuyển Danh sách <-> Bản đồ */}
                        <div className='flex bg-slate-100 rounded-full p-1'>
                            {[
                                { id: 'danh-sach', nhan: t('Danh sách', 'List', '列表'), Icon: LayoutGrid },
                                { id: 'ban-do', nhan: t('Bản đồ', 'Map', '地图'), Icon: MapIcon },
                            ].map(m => (
                                <button key={m.id} onClick={() => setCheDo(m.id)}
                                    aria-pressed={cheDo === m.id}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${cheDo === m.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                                    <m.Icon size={14} /> {m.nhan}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => setMoLoc(v => !v)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition ${soLocDangBat ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}>
                            <SlidersHorizontal size={14} /> {t('Bộ lọc', 'Filters', '筛选')}
                            {soLocDangBat > 0 && <span className='bg-white/25 rounded-full px-1.5'>{soLocDangBat}</span>}
                        </button>

                        <button onClick={viTri}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition ${viTriToi ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200'}`}>
                            <LocateFixed size={14} /> {viTriToi ? t('Đang xếp theo gần nhất', 'Sorted by distance', '按距离排序') : t('Gần tôi', 'Near me', '附近')}
                        </button>

                        <span className='text-xs text-slate-400 ml-auto'>
                            {t(`${ketQua.length} địa điểm`, `${ketQua.length} places`, `${ketQua.length} 个地点`)}
                        </span>
                    </div>

                    {/* Bảng lọc mở rộng */}
                    {moLoc && (
                        <div className='flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100'>
                            <span className='text-xs font-semibold text-slate-500'>{t('Mức giá', 'Price', '价位')}:</span>
                            {MUC_GIA.map(m => (
                                <button key={m.id} onClick={() => setMucGia(mucGia === m.id ? '' : m.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${mucGia === m.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}>
                                    {m.kyHieu ? `${m.kyHieu} · ` : ''}{t(...m.ten)}
                                </button>
                            ))}
                            <button onClick={() => setDangMo(v => !v)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ml-2 ${dangMo ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                                {t('Đang mở cửa', 'Open now', '正在营业')}
                            </button>
                            {soLocDangBat > 0 && (
                                <button onClick={() => { setMucGia(''); setDangMo(false) }}
                                    className='text-xs text-slate-400 underline ml-1'>
                                    {t('Xoá lọc', 'Clear', '清除')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Nội dung */}
            <div className='max-w-6xl mx-auto px-5 mt-6'>
                {!ds.length ? (
                    <TrangRong Icon={MapPin} mau='#00A8A8'
                        tieuDe={t('Chưa có địa điểm nào', 'No places yet', '还没有地点')}
                        moTa={t('Quản trị viên chưa nạp dữ liệu địa điểm. Vào /admin/dia-diem để thêm.',
                            'No place data has been loaded yet.', '尚未载入地点数据。')} />
                ) : !ketQua.length ? (
                    <TrangRong Icon={Search} mau='#00A8A8'
                        tieuDe={t('Không tìm thấy địa điểm nào', 'No places found', '未找到地点')}
                        moTa={t('Thử bỏ bớt bộ lọc hoặc tìm bằng từ khoá khác.',
                            'Try removing some filters or searching differently.', '试试减少筛选条件或换个关键词。')} />
                ) : cheDo === 'ban-do' ? (
                    <div className='grid lg:grid-cols-5 gap-5 items-start'>
                        <div className='lg:col-span-3 rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-sm'>
                            <BanDo ds={ketQua.map(x => x.d)} chon={chon} onChon={setChon}
                                viTriToi={viTriToi} cao='h-[60vh] min-h-[420px]' />
                        </div>
                        <div className='lg:col-span-2 flex flex-col gap-2.5 lg:max-h-[60vh] lg:overflow-y-auto lg:pr-1'>
                            {ketQua.map(({ d, km }) => (
                                <div key={d.id} onMouseEnter={() => setChon(d.id)}>
                                    <TheDiaDiem d={d} kieu='ngang' khoangCach={km} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className='luoi-dd grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                        {ketQua.map(({ d, km }) => <TheDiaDiem key={d.id} d={d} khoangCach={km} />)}
                    </div>
                )}
            </div>
        </div>
    )
}

// useSearchParams cần bọc Suspense để trang vẫn dựng sẵn được (Next 15)
export default function TrangKhamPha() {
    return (
        <Suspense fallback={<Loading />}>
            <NoiDungKhamPha />
        </Suspense>
    )
}
