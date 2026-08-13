'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Compass, Map as MapIcon, MapPin, Search } from 'lucide-react'
import TheDiaDiem from '@/components/TheDiaDiem'
import TheLoTrinh from '@/components/TheLoTrinh'
import ChipLoaiHinh from '@/components/ChipLoaiHinh'
import AnhDiaDiem from '@/components/AnhDiaDiem'
import Anh from '@/components/Anh'
import { LuoiDiaDiemSkeleton } from '@/components/Skeleton'
import { SongNgan } from '@/components/HoaTietSong'
import { useNgonNgu } from '@/lib/i18n'
import { LOAI_DIA_DIEM } from '@/lib/diaDiemLoai'
import { MAU } from '@/lib/thuongHieu'
import { useDiaDiem, dangMoCua } from '@/lib/utils/diaDiemClient'

// TRANG CHỦ app du lịch Hồng Gai.
// Trục: hỏi khách "đi đâu / ăn gì" ngay từ màn hình đầu, rồi mới tới nội dung.
// Không còn khu Chợ Tươi / Quà Quảng Ninh / giỏ hàng — app này không bán hàng.

// Một khu nội dung: tiêu đề + link xem tất cả + dải cuộn ngang
const Khu = ({ tieuDe, moTa, mau, href, nhanHet, children }) => (
    <section className='max-w-6xl mx-auto px-5 mt-12'>
        <div className='flex items-end justify-between gap-4 mb-4'>
            <div>
                <h2 className='text-xl sm:text-2xl font-bold text-slate-800'>{tieuDe}</h2>
                {moTa && <p className='text-sm text-slate-500 mt-1'>{moTa}</p>}
            </div>
            {href && (
                <Link href={href} className='flex items-center gap-1 text-sm font-semibold shrink-0 hover:gap-2 transition-all'
                    style={{ color: mau }}>
                    {nhanHet} <ArrowRight size={14} />
                </Link>
            )}
        </div>
        {children}
    </section>
)

export default function TrangChu() {
    const { t } = useNgonNgu()
    const router = useRouter()
    const { ds, dangTai } = useDiaDiem()
    const [tuKhoa, setTuKhoa] = useState('')
    const [lts, setLts] = useState([])
    const [sks, setSks] = useState([])

    useEffect(() => {
        fetch('/api/lo-trinh').then(r => r.json()).then(d => setLts(d.loTrinhs || [])).catch(() => { })
        fetch('/api/su-kien').then(r => r.json()).then(d => setSks(d.suKiens || [])).catch(() => { })
    }, [])

    const timKiem = (e) => {
        e.preventDefault()
        router.push(tuKhoa.trim() ? `/kham-pha?q=${encodeURIComponent(tuKhoa.trim())}` : '/kham-pha')
    }

    const dem = useMemo(() => {
        const kq = {}
        for (const d of ds) kq[d.loai] = (kq[d.loai] || 0) + 1
        return kq
    }, [ds])

    // Xếp theo ĐỘ NỔI BẬT — dùng cho cả ảnh nền đầu trang lẫn thẻ lớn của khối bento.
    const theoNoiBat = useMemo(
        () => [...ds].sort((a, b) => (b.noiBat || 0) - (a.noiBat || 0)),
        [ds],
    )

    // Ảnh nền đầu trang = địa điểm NỔI BẬT NHẤT (núi Bài Thơ — biểu tượng của phường).
    // Bản trước lấy `ds.find(có anhBia) || ds[0]`: chưa địa điểm nào có anhBia nên luôn
    // rơi vào ds[0], mà mọi noiBat đều bằng 0 nên thứ tự lại là bảng chữ cái — hoá ra
    // ảnh đại diện cho cả app do chữ B của "Bảo tàng" quyết định, chứ không do ai chọn.
    const anhNen = theoNoiBat[0] || null

    const anUong = ds.filter(d => d.loai === 'an_uong' || d.loai === 'ca_phe')
    const noiBat = theoNoiBat.slice(0, 6)
    const tamLinh = ds.filter(d => d.loai === 'tam_linh' || d.loai === 'di_tich')
    const dangMoGio = ds.filter(d => dangMoCua(d) === true).slice(0, 8)

    return (
        <div className='mb-28'>
            {/* ---------- ĐẦU TRANG ---------- */}
            <section className='relative'>
                <div className='absolute inset-0' aria-hidden='true'>
                    {anhNen ? (
                        anhNen.anhBia
                            ? <Anh src={anhNen.anhBia} alt='' className='w-full h-full object-cover' uuTien />
                            : <AnhDiaDiem id={anhNen.id} alt='' className='w-full h-full object-cover'
                                fallback={<span className='block w-full h-full' style={{ background: 'linear-gradient(135deg,#14486E,#08243C)' }} />} />
                    ) : (
                        <span className='block w-full h-full' style={{ background: 'linear-gradient(135deg,#14486E,#08243C)' }} />
                    )}
                </div>
                {/* Lớp phủ NHẸ ở trên, đậm dần xuống đáy nơi đặt chữ — để ảnh còn "thở".
                    Bản trước phủ .55 ngay từ đỉnh nên ảnh nào cũng thành một mảng tối
                    đều đều, mất hết cảnh; mà cảnh chính là thứ bán được chuyến đi. */}
                <div className='absolute inset-0' aria-hidden='true'
                    style={{ background: 'linear-gradient(180deg, rgba(8,36,60,.22) 0%, rgba(8,36,60,.48) 45%, rgba(8,36,60,.90) 100%)' }} />
                {/* Lớp che PHÍA CHỮ (bên trái) thay vì tối cả ảnh.
                    Ảnh núi Bài Thơ có vùng nước rất sáng, chữ trắng đè lên bị chìm. Nhưng
                    phủ đậm toàn khung thì mất luôn cảnh — thứ đáng giá nhất của đầu trang.
                    Chỉ tối bên trái nơi đặt chữ, nửa phải giữ nguyên cảnh vịnh. */}
                <div className='absolute inset-0 hidden lg:block' aria-hidden='true'
                    style={{ background: 'linear-gradient(90deg, rgba(8,36,60,.62) 0%, rgba(8,36,60,.34) 38%, transparent 68%)' }} />

                {/* Trên máy tính hero phải CAO hẳn: ở khổ rộng, hero thấp làm ảnh nền bị
                    cắt thành một dải hẹp, mất hết cảnh — với app du lịch thì đó là hỏng
                    đúng thứ quan trọng nhất. min-h theo dvh để không phụ thuộc chiều ảnh. */}
                <div className='relative max-w-6xl mx-auto px-5 pt-14 pb-10 sm:pt-20 sm:pb-14 lg:pt-28 lg:pb-20 lg:min-h-[62vh] flex flex-col justify-center'>
                    <span className='inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3.5 py-1.5 rounded-full backdrop-blur-sm'
                        style={{ background: 'rgba(255,255,255,.18)' }}>
                        <MapPin size={13} /> {t('Phường Hồng Gai · Quảng Ninh', 'Hong Gai Ward · Quang Ninh', '鸿基坊 · 广宁')}
                    </span>
                    <h1 className='text-4xl sm:text-6xl chu-hien-thi text-white mt-3 can-dong'>
                        {t('Khám phá Hồng Gai', 'Explore Hong Gai', '探索鸿基')}
                    </h1>
                    <p className='text-white/80 mt-3 leading-relaxed text-sm sm:text-lg max-w-2xl'>
                        {t('Ăn gì, chơi đâu, lễ chùa nào — cẩm nang du lịch cho vùng đất bên vịnh Hạ Long.',
                            'What to eat, where to go, which pagoda to visit — a travel guide to the land beside Ha Long Bay.',
                            '吃什么、去哪儿、拜哪座寺 —— 下龙湾畔这片土地的旅游指南。')}
                    </p>

                    <form onSubmit={timKiem}
                        className='flex items-center gap-2.5 bg-white rounded-full px-5 py-3.5 mt-6 shadow-xl max-w-xl'>
                        <Search size={19} className='text-slate-400 shrink-0' />
                        <input value={tuKhoa} onChange={e => setTuKhoa(e.target.value)}
                            placeholder={t('Tìm địa điểm, quán ăn, chùa...', 'Search places, food, pagodas...', '搜索地点、美食、寺庙…')}
                            className='w-full bg-transparent outline-none text-sm placeholder-slate-400' />
                        <button type='submit'
                            className='text-white text-sm font-semibold px-5 py-2 rounded-full active:scale-95 transition shrink-0 hover:opacity-90'
                            style={{ backgroundColor: MAU.ngoc }}>
                            {t('Tìm', 'Search', '搜索')}
                        </button>
                    </form>

                    {/* Dòng trạng thái SỐNG — cho thấy app biết chuyện gì đang diễn ra
                        ngay lúc này, thay vì chỉ là một trang giới thiệu tĩnh. */}
                    {ds.length > 0 && (
                        <p className='flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-white/70 mt-4'>
                            <span>{t(`${ds.length} địa điểm`, `${ds.length} places`, `${ds.length} 个地点`)}</span>
                            {dangMoGio.length > 0 && (
                                <span className='flex items-center gap-1.5'>
                                    <span className='size-1.5 rounded-full bg-emerald-400' aria-hidden='true' />
                                    {t(`${dangMoGio.length} nơi đang mở cửa`, `${dangMoGio.length} open now`, `${dangMoGio.length} 处正在营业`)}
                                </span>
                            )}
                            {lts.length > 0 && (
                                <span>{t(`${lts.length} lộ trình gợi ý`, `${lts.length} itineraries`, `${lts.length} 条推荐行程`)}</span>
                            )}
                        </p>
                    )}

                    <div className='flex flex-wrap gap-2 mt-4'>
                        {LOAI_DIA_DIEM.slice(0, 6).map(l => (
                            <Link key={l.id} href={`/kham-pha?loai=${l.id}`}
                                className='flex items-center gap-1.5 text-xs font-semibold text-white px-3.5 py-2 rounded-full backdrop-blur-sm transition hover:bg-white/30'
                                style={{ background: 'rgba(255,255,255,.16)' }}>
                                <span aria-hidden='true'>{l.icon}</span> {t(...l.ten)}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- BẢN ĐỒ ---------- */}
            <section className='max-w-6xl mx-auto px-5 mt-8'>
                {/* `hop-sang`: nền pastel đặt bằng inline style thì remap của chế độ tối không
                    với tới, trong khi chữ slate bên trong ĐÃ bị remap sáng — thành sáng-trên-sáng,
                    mất chữ. Class này override hẳn nền khi tối. */}
                <Link href='/ban-do'
                    className='hop-sang group flex items-center gap-4 rounded-2xl p-5 border border-sky-100 shadow-sm hover:shadow-md transition'
                    style={{ background: 'linear-gradient(135deg,#f0f9ff,#dbeafe)', '--mau-khu': MAU.ngoc }}>
                    <span className='flex items-center justify-center size-14 rounded-2xl bg-white shadow-sm shrink-0 text-sky-600'>
                        <MapIcon size={26} />
                    </span>
                    <div className='min-w-0 flex-1'>
                        <h2 className='font-bold text-slate-800'>{t('Bản đồ Hồng Gai', 'Hong Gai map', '鸿基地图')}</h2>
                        <p className='text-sm text-slate-500 mt-0.5'>
                            {t('Xem tất cả địa điểm trên bản đồ, lọc theo loại hình và tìm chỗ gần bạn.',
                                'See every place on the map, filter by type and find what is near you.',
                                '在地图上查看所有地点，按类型筛选并查找附近。')}
                        </p>
                    </div>
                    <ArrowRight size={20} className='text-sky-600 shrink-0 group-hover:translate-x-1 transition-transform' />
                </Link>
            </section>

            {/* ---------- THANH LOẠI HÌNH ---------- */}
            {!dangTai && ds.length > 0 && (
                <section className='max-w-6xl mx-auto px-5 mt-8'>
                    <h2 className='text-xl font-bold text-slate-800 mb-3'>{t('Bạn muốn đi đâu?', 'What are you looking for?', '你想去哪儿？')}</h2>
                    <ChipLoaiHinh chon='' dem={dem}
                        onChon={(id) => router.push(id ? `/kham-pha?loai=${id}` : '/kham-pha')} />
                </section>
            )}

            {/* ---------- ĐANG TẢI ---------- */}
            {dangTai && (
                <div className='max-w-6xl mx-auto px-5 mt-10'>
                    <LuoiDiaDiemSkeleton soThe={3} />
                </div>
            )}

            {/* ---------- LỘ TRÌNH GỢI Ý ---------- */}
            {lts.length > 0 && (
                <Khu tieuDe={t('Đi đâu hôm nay?', 'Where to today?', '今天去哪儿？')}
                    moTa={t('Lộ trình dựng sẵn theo giờ — khỏi phải tự sắp',
                        'Hour-by-hour itineraries — no planning needed',
                        '按时段编排好的行程 —— 无需自己安排')}
                    mau='#B8923F' href='/lo-trinh' nhanHet={t('Xem tất cả', 'See all', '查看全部')}>
                    {/* Máy tính: lưới 3 cột cho gọn gàng. Điện thoại: cuộn ngang.
                        Trước đây desktop cũng cuộn ngang nên thẻ thứ 4 bị cắt cụt ở mép phải —
                        trên điện thoại thẻ ló ra là tín hiệu "vuốt đi", còn trên máy tính
                        nó chỉ trông như bố cục hỏng. */}
                    <div className='flex gap-4 overflow-x-auto no-scrollbar cuon-chip pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible'>
                        {lts.slice(0, 6).map((lt, i) => (
                            <div key={lt.id} className={i >= 3 ? 'lg:hidden' : ''}>
                                <TheLoTrinh lt={lt} ds={ds} kieu='dai' />
                            </div>
                        ))}
                    </div>
                </Khu>
            )}

            {/* ---------- LỄ HỘI SẮP TỚI ---------- */}
            {sks.length > 0 && (
                <Khu tieuDe={t('Lễ hội ở Hồng Gai', 'Festivals in Hong Gai', '鸿基庙会')}
                    moTa={t('Canh đúng dịp thì chuyến đi khác hẳn', 'Timing your trip right changes everything', '赶上日子，旅程大不相同')}
                    mau='#dc2626' href='/su-kien' nhanHet={t('Xem tất cả', 'See all', '查看全部')}>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                        {sks.slice(0, 3).map(sk => {
                            const mau = sk.mau || '#dc2626'
                            return (
                                <Link key={sk.id} href='/su-kien'
                                    className='the-dd group flex items-start gap-3.5 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition'>
                                    <span className='flex items-center justify-center size-11 rounded-xl shrink-0 text-2xl'
                                        style={{ backgroundColor: mau + '1a' }}>{sk.icon || '🎏'}</span>
                                    <div className='min-w-0'>
                                        <p className='font-semibold text-slate-800 can-dong'>{t(...sk.ten)}</p>
                                        <p className='text-xs font-semibold mt-1' style={{ color: mau }}>{t(...sk.ghiChuNgay)}</p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </Khu>
            )}

            {/* ---------- ĐANG MỞ CỬA ---------- */}
            {dangMoGio.length > 0 && (
                <Khu tieuDe={t('Đang mở cửa lúc này', 'Open right now', '现在营业中')}
                    moTa={t('Ghé được ngay bây giờ', 'You can go right now', '现在就能去')}
                    mau='#059669' href='/kham-pha' nhanHet={t('Xem tất cả', 'See all', '查看全部')}>
                    <div className='flex gap-4 overflow-x-auto no-scrollbar cuon-chip pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible'>
                        {dangMoGio.map(d => <TheDiaDiem key={d.id} d={d} kieu='dai' />)}
                    </div>
                </Khu>
            )}

            {/* ---------- ĂN UỐNG ---------- */}
            {anUong.length > 0 && (
                <Khu tieuDe={t('Ăn gì ở Hồng Gai', 'What to eat in Hong Gai', '鸿基吃什么')}
                    moTa={t('Hải sản bến Hòn Gai, bún bề bề, chả mực và cà phê view vịnh',
                        'Hon Gai seafood, mantis shrimp noodles, squid cake and bay-view cafés',
                        '鸿街海鲜、虾蛄米粉、墨鱼饼与海景咖啡')}
                    mau='#ea580c' href='/kham-pha?loai=an_uong' nhanHet={t('Xem tất cả', 'See all', '查看全部')}>
                    <div className='flex gap-4 overflow-x-auto no-scrollbar cuon-chip pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible'>
                        {anUong.map(d => <TheDiaDiem key={d.id} d={d} kieu='dai' />)}
                    </div>
                </Khu>
            )}

            {/* ---------- ĐIỂM ĐẾN NỔI BẬT ---------- */}
            {noiBat.length > 0 && (
                <>
                    <SongNgan mau='#f0f9ff' className='mt-12' />
                    <div style={{ background: '#f0f9ff' }} className='py-2'>
                        <Khu tieuDe={t('Điểm đến nổi bật', 'Featured destinations', '热门景点')}
                            moTa={t('Những nơi không nên bỏ lỡ khi đến Hồng Gai', 'Not to be missed in Hong Gai', '来鸿基不容错过')}
                            mau='#00A8A8' href='/kham-pha' nhanHet={t('Xem tất cả', 'See all', '查看全部')}>
                            {/* BENTO: một thẻ LỚN neo mắt + bốn thẻ nhỏ quanh nó.
                                Trước đây cả trang chỉ toàn thẻ cùng cỡ nên nhịp phẳng lì,
                                mắt lướt qua mà không dừng ở đâu. Điện thoại vẫn xếp thường
                                — màn hẹp thì thẻ lớn chiếm hết chỗ, phản tác dụng. */}
                            <div className='luoi-dd grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4 lg:grid-rows-2 lg:auto-rows-fr'>
                                {noiBat.slice(0, 5).map((d, i) => (
                                    <div key={d.id}
                                        className={`h-full ${i === 0 ? 'lg:col-span-2 lg:row-span-2 sm:col-span-2 lg:col-start-1' : ''}`}>
                                        <TheDiaDiem d={d} kieu={i === 0 ? 'lon' : 'luoi'} />
                                    </div>
                                ))}
                            </div>
                        </Khu>
                    </div>
                    <SongNgan mau='#f0f9ff' lat />
                </>
            )}

            {/* ---------- TÂM LINH & DI TÍCH ---------- */}
            {tamLinh.length > 0 && (
                <Khu tieuDe={t('Tâm linh & di tích', 'Temples & heritage', '灵修与古迹')}
                    moTa={t('Chùa Long Tiên, đền Đức Ông, bút tích thơ cổ trên vách núi Bài Thơ',
                        'Long Tien Pagoda, Duc Ong Temple, ancient poems carved on Bai Tho Mountain',
                        '龙仙寺、德翁庙、诗山崖壁上的古诗题刻')}
                    mau='#d97706' href='/kham-pha?loai=tam_linh' nhanHet={t('Xem tất cả', 'See all', '查看全部')}>
                    <div className='flex gap-4 overflow-x-auto no-scrollbar cuon-chip pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible'>
                        {tamLinh.map(d => <TheDiaDiem key={d.id} d={d} kieu='dai' />)}
                    </div>
                </Khu>
            )}

            {/* ---------- CHƯA CÓ DỮ LIỆU ---------- */}
            {!dangTai && !ds.length && (
                <section className='max-w-2xl mx-auto px-5 mt-12 text-center'>
                    <Compass size={40} className='mx-auto text-slate-300' />
                    <h2 className='text-lg font-semibold text-slate-700 mt-4'>
                        {t('Chưa có địa điểm nào', 'No places yet', '还没有地点')}
                    </h2>
                    <p className='text-sm text-slate-400 mt-1.5'>
                        {t('Quản trị viên vào /admin/dia-diem để nạp dữ liệu địa điểm.',
                            'An administrator can load place data at /admin/dia-diem.',
                            '管理员可在 /admin/dia-diem 载入地点数据。')}
                    </p>
                </section>
            )}
        </div>
    )
}
