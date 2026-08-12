'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import {
    ArrowLeft, ArrowRight, Bus, CalendarDays, CheckCircle2, Clock, Compass, Globe,
    ImagePlus, Images, MapPin, MessageSquare, Navigation, Phone, Route, Send, Share2,
    Sparkles, Stamp, Star, Ticket, X,
} from 'lucide-react'
import Loading from '@/components/Loading'
import Anh from '@/components/Anh'
import AnhDiaDiem from '@/components/AnhDiaDiem'
import AnhDaiDien from '@/components/AnhDaiDien'
import Rating from '@/components/Rating'
import TheDiaDiem, { NutLuu } from '@/components/TheDiaDiem'
import { useAuth } from '@/components/AuthProvider'
import { useNgonNgu } from '@/lib/i18n'
import {
    mauDiaDiem, iconDiaDiem, timLoai, timMucGia,
    TIEN_ICH, khoangCachKm, linkChiDuong,
} from '@/lib/diaDiemLoai'
import { dangMoCua, taiDiaDiem } from '@/lib/utils/diaDiemClient'
import { nenAnh } from '@/lib/utils/nenAnh'
import { dongDau, useCheckIn, daCheckIn, BAN_KINH_M } from '@/lib/utils/hoChieu'
import { themVaoLichTrinh, useLichTrinh, trongLichTrinh } from '@/lib/utils/lichTrinh'

const BanDo = dynamic(() => import('@/components/BanDo'), {
    ssr: false,
    loading: () => <div className='w-full h-full bg-slate-100 animate-pulse' />,
})

export default function TrangDiaDiem() {
    const { id } = useParams()
    const { t } = useNgonNgu()
    const { user } = useAuth()   // undefined = đang tải; null = chưa đăng nhập

    const [d, setD] = useState(null)
    const [tatCa, setTatCa] = useState([])
    const [thuVien, setThuVien] = useState([])
    const [danhGias, setDanhGias] = useState([])
    const [toiDaDanhGia, setToiDaDanhGia] = useState(false)
    const [loading, setLoading] = useState(true)
    const [anhPhongTo, setAnhPhongTo] = useState(null)

    const [saoMoi, setSaoMoi] = useState(0)
    const [binhLuanMoi, setBinhLuanMoi] = useState('')
    const [anhMoi, setAnhMoi] = useState([])   // [{ file, xem }] — xem là blob URL để hiện trước
    const [dangGui, setDangGui] = useState(false)
    const fileRef = useRef(null)

    const [suKiens, setSuKiens] = useState([])
    const [dangDong, setDangDong] = useState(false)

    // Hộ chiếu & lịch trình cá nhân — đều chạy trên localStorage, không cần đăng nhập
    const checkIns = useCheckIn()
    const lichTrinh = useLichTrinh()
    const daDong = daCheckIn(id, checkIns)
    const trongLT = trongLichTrinh(id, lichTrinh)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        Promise.all([
            fetch(`/api/dia-diem?id=${encodeURIComponent(id)}`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
            taiDiaDiem(),
            fetch('/api/dia-diem/anh').then(r => r.json()).catch(() => ({})),
            fetch(`/api/ratings?diaDiem=${encodeURIComponent(id)}`).then(r => r.json()).catch(() => ({})),
            fetch('/api/su-kien').then(r => r.json()).catch(() => ({})),
        ]).then(([ct, ds, anhData, dg, sk]) => {
            setD(ct.diaDiem || null)
            setTatCa(ds || [])
            setThuVien(anhData.thuVien?.[id] || [])
            setDanhGias(dg.ratings || [])
            setToiDaDanhGia(!!dg.toiDaDanhGia)
            setSuKiens((sk.suKiens || []).filter(x => x.diaDiemId === id))
        }).finally(() => setLoading(false))
    }, [id])

    // Điểm quanh đây: TỰ TÍNH theo toạ độ (< 1,5 km) rồi bù thêm các điểm biên tập chọn tay.
    // Bản cũ phải để admin gắn tay từng cặp trong /admin/dia-diem — nay không cần nữa.
    const quanhDay = useMemo(() => {
        if (!d) return []
        const gan = d.viTri
            ? tatCa
                .filter(x => x.id !== d.id && Array.isArray(x.viTri))
                .map(x => ({ x, km: khoangCachKm(d.viTri, x.viTri) }))
                .filter(o => o.km != null && o.km <= 1.5)
                .sort((a, b) => a.km - b.km)
            : []
        const daCo = new Set(gan.map(o => o.x.id))
        const tay = (d.lanCan || [])
            .filter(lid => !daCo.has(lid))
            .map(lid => tatCa.find(x => x.id === lid))
            .filter(Boolean)
            .map(x => ({ x, km: d.viTri && x.viTri ? khoangCachKm(d.viTri, x.viTri) : null }))
        return [...gan, ...tay].slice(0, 6)
    }, [d, tatCa])

    // Chọn ảnh kèm đánh giá — nén ngay trên máy khách trước khi gửi (mạng 3G/4G ở
    // điểm tham quan thường yếu, ảnh gốc điện thoại 4-8MB sẽ treo cả phút).
    const chonAnh = async (e) => {
        const files = [...(e.target.files || [])]
        e.target.value = ''
        if (!files.length) return
        const conLai = 4 - anhMoi.length
        if (conLai <= 0) return toast.error(t('Tối đa 4 ảnh', 'Up to 4 photos', '最多4张照片'))

        const them = []
        for (const f of files.slice(0, conLai)) {
            try {
                const nen = await nenAnh(f, { canhToiDa: 1600, chatLuong: 0.82 })
                them.push({ file: nen, xem: URL.createObjectURL(nen) })
            } catch {
                toast.error(t('Không đọc được một ảnh', 'Could not read a photo', '无法读取某张照片'))
            }
        }
        setAnhMoi(a => [...a, ...them])
    }

    const boAnh = (i) => setAnhMoi(a => {
        URL.revokeObjectURL(a[i].xem)
        return a.filter((_, k) => k !== i)
    })

    const guiDanhGia = async () => {
        if (!saoMoi) return toast.error(t('Vui lòng chọn số sao', 'Please choose a star rating', '请选择星级'))
        setDangGui(true)
        try {
            const fd = new FormData()
            fd.append('diaDiemId', d.id)
            fd.append('sao', String(saoMoi))
            fd.append('binhLuan', binhLuanMoi)
            for (const a of anhMoi) fd.append('anh', a.file)

            const res = await fetch('/api/ratings', { method: 'POST', body: fd })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Không gửi được đánh giá', 'Could not submit review', '无法提交评价')); return }
            setDanhGias([data.rating, ...danhGias])
            setToiDaDanhGia(true)
            setSaoMoi(0); setBinhLuanMoi('')
            anhMoi.forEach(a => URL.revokeObjectURL(a.xem))
            setAnhMoi([])
            toast.success(t('Cảm ơn bạn đã chia sẻ!', 'Thanks for sharing!', '感谢您的分享！'))
        } finally {
            setDangGui(false)
        }
    }

    // --- Hộ chiếu: đóng dấu tại chỗ (xác thực bằng vị trí thật) ---
    const dongDauTaiDay = async () => {
        setDangDong(true)
        try {
            const kq = await dongDau(d)
            if (kq.ok) {
                toast.success(t('Đã đóng dấu vào hộ chiếu!', 'Stamped into your passport!', '已盖入护照！'))
                return
            }
            const loi = {
                'tu-choi-vi-tri': t('Cần cho phép truy cập vị trí thì mới đóng dấu được',
                    'Location access is required to check in', '需允许定位才能打卡'),
                'khong-lay-duoc-vi-tri': t('Không lấy được vị trí — thử lại ở nơi thoáng hơn',
                    'Could not get your location — try again in the open', '无法获取位置 —— 请到开阔处重试'),
                'khong-ho-tro': t('Trình duyệt này không hỗ trợ định vị',
                    'This browser does not support geolocation', '此浏览器不支持定位'),
                'thieu-toa-do': t('Địa điểm này chưa có toạ độ nên chưa đóng dấu được',
                    'This place has no coordinates yet', '此地点尚无坐标'),
                'da-check-in': t('Bạn đã đóng dấu nơi này rồi', 'Already stamped', '已经打过卡了'),
                'qua-xa': t(
                    `Bạn đang cách đây khoảng ${kq.khoangCachM}m — cần tới gần hơn (trong ${BAN_KINH_M}m) để đóng dấu`,
                    `You are about ${kq.khoangCachM}m away — get within ${BAN_KINH_M}m to check in`,
                    `你距此约${kq.khoangCachM}米 —— 需进入${BAN_KINH_M}米范围内才能打卡`),
            }[kq.loi]
            toast.error(loi || t('Chưa đóng dấu được', 'Could not check in', '无法打卡'))
        } finally {
            setDangDong(false)
        }
    }

    const themLichTrinh = () => {
        if (trongLT) return toast(t('Đã có trong lịch trình rồi', 'Already in your plan', '已在行程中'))
        themVaoLichTrinh(d.id)
        toast.success(t('Đã thêm vào lịch trình của bạn', 'Added to your plan', '已加入你的行程'))
    }

    const chiaSe = async () => {
        const url = window.location.href
        try {
            if (navigator.share) await navigator.share({ title: t(...d.ten), url })
            else { await navigator.clipboard.writeText(url); toast.success(t('Đã chép liên kết', 'Link copied', '已复制链接')) }
        } catch { /* khách huỷ chia sẻ thì thôi */ }
    }

    if (loading) return <Loading />

    if (!d) return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-6'>
            <MapPin size={48} className='text-slate-300' />
            <h1 className='text-2xl font-semibold text-slate-700 mt-4'>{t('Không tìm thấy địa điểm', 'Place not found', '未找到地点')}</h1>
            <Link href='/kham-pha' className='bg-sky-600 hover:bg-sky-700 transition text-white px-8 py-2.5 rounded-full mt-6 text-sm font-medium'>
                {t('Về trang Khám phá', 'Back to Explore', '返回探索')}
            </Link>
        </div>
    )

    const mau = mauDiaDiem(d)
    const loai = timLoai(d.loai)
    const gia = timMucGia(d.mucGia)
    const mo = dangMoCua(d)
    const anhThem = [...thuVien.slice(1), ...(d.anhs || [])]
    const diemTB = danhGias.length
        ? Math.round(danhGias.reduce((s, x) => s + x.sao, 0) / danhGias.length * 10) / 10
        : null

    return (
        <div className='min-h-[70vh] mb-28'>
            <div className='max-w-5xl mx-auto px-5 py-6'>
                <Link href='/kham-pha' className='inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4'>
                    <ArrowLeft size={15} /> {t('Về trang Khám phá', 'Back to Explore', '返回探索')}
                </Link>

                {/* Ảnh bìa */}
                <div className='relative rounded-3xl overflow-hidden ring-1 ring-slate-100 shadow-sm'>
                    {d.anhBia
                        ? <Anh src={d.anhBia} alt={t(...d.ten)} uuTien className='w-full aspect-[16/7] max-sm:aspect-[4/3] object-cover' />
                        : <AnhDiaDiem id={d.id} alt={t(...d.ten)} className='w-full aspect-[16/7] max-sm:aspect-[4/3] object-cover'
                            fallback={<span className='flex items-center justify-center w-full aspect-[16/7] max-sm:aspect-[4/3] text-7xl'
                                style={{ background: `linear-gradient(135deg, ${mau}22, ${mau}55)` }}>{iconDiaDiem(d)}</span>} />}
                    <NutLuu id={d.id} className='absolute top-3 right-3 !size-11 shadow-lg' />
                </div>

                {/* Tên + nhãn */}
                <div className='mt-5'>
                    <div className='flex items-center gap-2.5 flex-wrap'>
                        <h1 className='text-2xl sm:text-4xl font-bold text-slate-800 can-dong'>{t(...d.ten)}</h1>
                        <span className='text-xs font-semibold px-3 py-1 rounded-full text-white' style={{ backgroundColor: mau }}>
                            {loai ? t(...loai.ten) : d.loai}
                        </span>
                    </div>
                    <div className='flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-slate-500 mt-2'>
                        {diemTB && (
                            <span className='flex items-center gap-1 font-semibold text-amber-600'>
                                <Star size={14} className='fill-current' />{diemTB} ({danhGias.length})
                            </span>
                        )}
                        {mo !== null && (
                            <span className={`flex items-center gap-1 font-semibold ${mo ? 'text-emerald-600' : 'text-slate-400'}`}>
                                <Clock size={14} />{mo ? t('Đang mở cửa', 'Open now', '正在营业') : t('Đã đóng cửa', 'Closed', '已打烊')}
                                {d.gioMoCua && d.gioDongCua && <span className='font-normal text-slate-400'> · {d.gioMoCua}–{d.gioDongCua}</span>}
                            </span>
                        )}
                        {gia && <span className='font-semibold'>{gia.kyHieu || ''} {t(...gia.ten)}</span>}
                        <span className='flex items-center gap-1'>
                            <MapPin size={14} /> {d.diaChi || t('Phường Hồng Gai, Quảng Ninh', 'Hong Gai Ward, Quang Ninh', '鸿基坊，广宁')}
                        </span>
                    </div>
                    {t(...d.mota) && <p className='text-slate-600 mt-3 leading-relaxed'>{t(...d.mota)}</p>}
                </div>

                {/* Thanh hành động */}
                <div className='flex items-center gap-2 flex-wrap mt-5'>
                    <a href={linkChiDuong(d.ten)} target='_blank' rel='noopener noreferrer'
                        className='flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full active:scale-95 transition'
                        style={{ backgroundColor: mau }}>
                        <Navigation size={15} /> {t('Chỉ đường', 'Directions', '路线')}
                    </a>
                    {d.dienThoai && (
                        <a href={`tel:${d.dienThoai}`}
                            className='flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition active:scale-95'>
                            <Phone size={15} /> {t('Gọi', 'Call', '致电')}
                        </a>
                    )}
                    {d.website && (
                        <a href={d.website} target='_blank' rel='noopener noreferrer'
                            className='flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition active:scale-95'>
                            <Globe size={15} /> {t('Website', 'Website', '网站')}
                        </a>
                    )}
                    <button onClick={chiaSe}
                        className='flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition active:scale-95'>
                        <Share2 size={15} /> {t('Chia sẻ', 'Share', '分享')}
                    </button>

                    {/* Thêm vào lịch trình cá nhân — localStorage, không cần đăng nhập */}
                    <button onClick={themLichTrinh}
                        className={`flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-full border transition active:scale-95 ${trongLT ? 'bg-violet-50 border-violet-200 text-violet-700' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                        <Route size={15} /> {trongLT
                            ? t('Đã có trong lịch trình', 'In your plan', '已在行程中')
                            : t('Thêm vào lịch trình', 'Add to plan', '加入行程')}
                    </button>
                </div>

                {/* ĐÓNG DẤU — xác thực bằng vị trí thật, nên huy hiệu mới có ý nghĩa */}
                {d.viTri && (
                    <div className={`flex items-center gap-3.5 rounded-2xl p-4 mt-4 border ${daDong ? 'bg-sky-50 border-sky-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <span className='flex items-center justify-center size-11 rounded-xl shrink-0 text-2xl'
                            style={{ backgroundColor: daDong ? '#0284c71a' : '#f1f5f9' }}>
                            {daDong ? '🎫' : '📍'}
                        </span>
                        <div className='min-w-0 flex-1'>
                            {daDong ? (
                                <>
                                    <p className='font-semibold text-sky-800 text-sm'>{t('Đã đóng dấu nơi này', 'Stamped', '已在此打卡')}</p>
                                    <Link href='/hanh-trinh' className='text-xs text-sky-700 underline'>
                                        {t('Xem hộ chiếu Hồng Gai', 'View your Hong Gai passport', '查看鸿基护照')}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <p className='font-semibold text-slate-800 text-sm'>{t('Bạn đang ở đây?', 'Are you here?', '你在这里吗？')}</p>
                                    <p className='text-xs text-slate-500 mt-0.5'>
                                        {t('Đóng dấu vào hộ chiếu để sưu tầm huy hiệu — cần bật vị trí.',
                                            'Stamp your passport to collect badges — location required.',
                                            '打卡集章 —— 需开启定位。')}
                                    </p>
                                </>
                            )}
                        </div>
                        {!daDong && (
                            <button onClick={dongDauTaiDay} disabled={dangDong}
                                className='flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-full shrink-0 active:scale-95 transition disabled:opacity-60'
                                style={{ backgroundColor: '#0284c7' }}>
                                <Stamp size={15} /> {dangDong ? t('Đang kiểm…', 'Checking…', '核验中…') : t('Đóng dấu', 'Check in', '打卡')}
                            </button>
                        )}
                    </div>
                )}

                <div className='grid lg:grid-cols-3 gap-8 mt-10 items-start'>
                    {/* Bài giới thiệu */}
                    <div className='lg:col-span-2'>
                        {d.gioiThieu?.length > 0 && (
                            <>
                                <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700 mb-4'>
                                    <Compass size={18} style={{ color: mau }} /> {t('Giới thiệu', 'Introduction', '简介')}
                                </h2>
                                <div className='flex flex-col gap-4'>
                                    {d.gioiThieu.map((doan, i) => (
                                        <p key={i} className='text-[15px] text-slate-600 leading-relaxed'>{t(...doan)}</p>
                                    ))}
                                </div>
                            </>
                        )}

                        {d.diemNoiBat?.length > 0 && (
                            <>
                                <h3 className='flex items-center gap-2 text-base font-semibold text-slate-700 mt-8 mb-3'>
                                    <Sparkles size={16} style={{ color: mau }} /> {t('Điểm nổi bật', 'Highlights', '亮点')}
                                </h3>
                                <ul className='flex flex-col gap-2.5'>
                                    {d.diemNoiBat.map((diem, i) => (
                                        <li key={i} className='flex items-start gap-3 text-sm text-slate-600'>
                                            <span className='flex items-center justify-center size-5 shrink-0 rounded-full text-white text-[10px] font-bold mt-0.5'
                                                style={{ backgroundColor: mau }}>{i + 1}</span>
                                            {t(...diem)}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {d.tienIch?.length > 0 && (
                            <div className='flex flex-wrap gap-2 mt-8'>
                                {d.tienIch.map(tid => {
                                    const ti = TIEN_ICH.find(x => x.id === tid)
                                    if (!ti) return null
                                    return (
                                        <span key={tid} className='flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full'>
                                            {ti.icon} {t(...ti.ten)}
                                        </span>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Thông tin tham quan */}
                    <div className='bg-slate-50 border border-slate-100 rounded-3xl p-6'>
                        <h2 className='text-base font-semibold text-slate-700 mb-5'>{t('Thông tin tham quan', 'Visitor information', '参观信息')}</h2>
                        <div className='flex flex-col gap-5 text-sm'>
                            {[
                                { Icon: Clock, nhan: t('Giờ mở cửa', 'Opening hours', '开放时间'), giaTri: t(...(d.gioMoCuaMoTa || [])) || (d.gioMoCua && d.gioDongCua ? `${d.gioMoCua} – ${d.gioDongCua}` : '') },
                                { Icon: Ticket, nhan: t('Giá vé', 'Ticket price', '门票'), giaTri: t(...(d.giaVe || [])) },
                                { Icon: Bus, nhan: t('Cách di chuyển', 'Getting there', '交通方式'), giaTri: t(...(d.diChuyen || [])) },
                            ].filter(x => x.giaTri).map(x => (
                                <div key={x.nhan} className='flex items-start gap-3'>
                                    <span className='flex items-center justify-center size-9 shrink-0 rounded-xl bg-white shadow-sm' style={{ color: mau }}>
                                        <x.Icon size={16} />
                                    </span>
                                    <div>
                                        <p className='font-semibold text-slate-700'>{x.nhan}</p>
                                        <p className='text-slate-500 mt-0.5'>{x.giaTri}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bản đồ nhỏ */}
                        {d.viTri && (
                            <div className='mt-5 rounded-2xl overflow-hidden ring-1 ring-slate-200'>
                                <BanDo ds={[d, ...quanhDay.map(o => o.x)]} chon={d.id} cao='h-52' />
                            </div>
                        )}
                    </div>
                </div>

                {/* Lễ hội diễn ra tại đây */}
                {suKiens.length > 0 && (
                    <>
                        <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700 mt-14 mb-4'>
                            <CalendarDays size={18} style={{ color: mau }} /> {t('Lễ hội tại đây', 'Festivals here', '此地庙会')}
                        </h2>
                        <div className='flex flex-col gap-3'>
                            {suKiens.map(sk => (
                                <Link key={sk.id} href='/su-kien'
                                    className='flex items-start gap-3.5 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition group'>
                                    <span className='flex items-center justify-center size-11 rounded-xl shrink-0 text-2xl'
                                        style={{ backgroundColor: (sk.mau || mau) + '1a' }}>{sk.icon || '🎏'}</span>
                                    <div className='min-w-0'>
                                        <p className='font-semibold text-slate-800'>{t(...sk.ten)}</p>
                                        <p className='text-sm font-semibold mt-0.5' style={{ color: sk.mau || mau }}>{t(...sk.ghiChuNgay)}</p>
                                        <p className='text-sm text-slate-500 mt-1 line-clamp-2'>{t(...sk.mota)}</p>
                                    </div>
                                    <ArrowRight size={16} className='text-slate-300 shrink-0 ml-auto group-hover:translate-x-1 transition-transform' />
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                {/* Hình ảnh */}
                {anhThem.length > 0 && (
                    <>
                        <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700 mt-14 mb-4'>
                            <Images size={18} style={{ color: mau }} /> {t('Hình ảnh', 'Photos', '图片')}
                        </h2>
                        <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                            {anhThem.map(a => (
                                <button key={a} type='button' onClick={() => setAnhPhongTo(a)}
                                    className='group relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-100 cursor-zoom-in'>
                                    <Anh src={a} alt={t(...d.ten)} className='w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-300' />
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Quanh đây */}
                {quanhDay.length > 0 && (
                    <>
                        <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700 mt-14 mb-4'>
                            <MapPin size={18} style={{ color: mau }} /> {t('Gần đây còn gì hay?', 'What else is nearby?', '附近还有什么？')}
                        </h2>
                        <div className='luoi-dd grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {quanhDay.map(({ x, km }) => <TheDiaDiem key={x.id} d={x} khoangCach={km} />)}
                        </div>
                    </>
                )}

                {/* Đánh giá */}
                <div className='flex items-center gap-3 flex-wrap mt-14 mb-5'>
                    <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700'>
                        <MessageSquare size={18} style={{ color: mau }} /> {t('Du khách nói gì?', 'What visitors say', '游客怎么说')} ({danhGias.length})
                    </h2>
                    {diemTB && (
                        <span className='flex items-center gap-1 text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full'>
                            <Star size={13} className='fill-current' />{diemTB}/5
                        </span>
                    )}
                </div>

                <div className='max-w-3xl mb-5'>
                    {user === null ? (
                        <p className='text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3'>
                            <Link href={`/login?ve=/dia-diem/${d.id}`} className='font-semibold underline' style={{ color: mau }}>
                                {t('Đăng nhập', 'Sign in', '登录')}
                            </Link>
                            {t(' để chia sẻ cảm nhận của bạn. Mọi thứ khác trong app đều dùng được mà không cần tài khoản.',
                                ' to share your thoughts. Everything else works without an account.',
                                ' 后分享您的感受。应用的其他功能无需账户即可使用。')}
                        </p>
                    ) : toiDaDanhGia ? (
                        <p className='flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-2xl px-4 py-3'>
                            <CheckCircle2 size={16} /> {t('Bạn đã đánh giá địa điểm này — cảm ơn bạn!', 'You have already reviewed this place — thank you!', '您已评价过此地点 — 谢谢您！')}
                        </p>
                    ) : user ? (
                        <div className='bg-white border border-slate-100 rounded-2xl p-4 shadow-sm'>
                            <p className='text-sm font-semibold text-slate-700 mb-2'>
                                {t('Bạn đã ghé', 'Have you visited', '您去过')} {t(...d.ten)}{t('? Chia sẻ cảm nhận nhé', '? Share your thoughts', '吗？分享您的感受吧')}
                            </p>
                            <div className='flex items-center gap-1 mb-3'>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button key={n} type='button' onClick={() => setSaoMoi(n)} aria-label={`${n}`}
                                        className='p-0.5 active:scale-90 transition'>
                                        <Star size={26} className={n <= saoMoi ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                    </button>
                                ))}
                            </div>
                            <textarea value={binhLuanMoi} onChange={e => setBinhLuanMoi(e.target.value)} rows={3} maxLength={500}
                                placeholder={t('Cảnh đẹp không, nên đi giờ nào, có gì đáng thử... (không bắt buộc)',
                                    'Is it scenic, best time to go, what to try... (optional)',
                                    '风景如何、几点去合适、有什么值得一试……（选填）')}
                                className='w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-300 resize-none placeholder-slate-400' />

                            {/* Ảnh kèm theo — ảnh du khách chụp là nội dung sống động nhất */}
                            <div className='flex items-center gap-2 flex-wrap mt-2.5'>
                                {anhMoi.map((a, i) => (
                                    <span key={a.xem} className='relative'>
                                        <img src={a.xem} alt='' className='size-16 rounded-xl object-cover ring-1 ring-slate-200' />
                                        <button type='button' onClick={() => boAnh(i)}
                                            aria-label={t('Bỏ ảnh', 'Remove photo', '移除照片')}
                                            className='absolute -top-1.5 -right-1.5 flex items-center justify-center size-5 rounded-full bg-slate-800 text-white'>
                                            <X size={11} />
                                        </button>
                                    </span>
                                ))}
                                {anhMoi.length < 4 && (
                                    <button type='button' onClick={() => fileRef.current?.click()}
                                        className='flex flex-col items-center justify-center gap-0.5 size-16 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition'>
                                        <ImagePlus size={17} />
                                        <span className='text-[9px] font-semibold'>{anhMoi.length}/4</span>
                                    </button>
                                )}
                                <input ref={fileRef} type='file' accept='image/*' multiple onChange={chonAnh} className='hidden' />
                            </div>

                            <button onClick={guiDanhGia} disabled={dangGui}
                                className='flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded-full mt-3 active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none'
                                style={{ backgroundColor: mau }}>
                                <Send size={14} /> {dangGui ? t('Đang gửi...', 'Sending...', '提交中…') : t('Gửi đánh giá', 'Submit review', '提交评价')}
                            </button>
                        </div>
                    ) : null}
                </div>

                {danhGias.length ? (
                    <div className='flex flex-col gap-3 max-w-3xl'>
                        {danhGias.map(dg => (
                            <div key={dg.id} className='bg-white border border-slate-100 rounded-2xl p-4 shadow-sm'>
                                <div className='flex items-center gap-3'>
                                    <AnhDaiDien src={dg.anhNguoiDung} ten={dg.ten}
                                        khung='size-9 rounded-full bg-slate-100' chu='text-slate-600 text-sm font-bold uppercase' />
                                    <div className='min-w-0'>
                                        <p className='text-sm font-semibold text-slate-700'>{dg.ten}</p>
                                        <div className='flex items-center gap-2 flex-wrap'>
                                            <Rating value={dg.sao} />
                                            <span className='text-xs text-slate-400'>{new Date(dg.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </div>
                                {dg.binhLuan && <p className='text-sm text-slate-600 mt-2.5 pl-12'>{dg.binhLuan}</p>}
                                {dg.anhs?.length > 0 && (
                                    <div className='flex gap-2 flex-wrap mt-2.5 pl-12'>
                                        {dg.anhs.map(a => (
                                            <button key={a} type='button' onClick={() => setAnhPhongTo(a)}
                                                className='cursor-zoom-in'>
                                                <Anh src={a} alt='' className='size-20 rounded-xl object-cover ring-1 ring-slate-200 hover:opacity-90 transition' />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='text-slate-400 text-sm'>
                        {t('Chưa có đánh giá nào — bạn là du khách đầu tiên chia sẻ cảm nhận nhé!',
                            'No reviews yet — be the first visitor to share!', '还没有评价 — 来当第一个分享的游客吧！')}
                    </p>
                )}
            </div>

            {/* Xem ảnh to */}
            {anhPhongTo && (
                <div onClick={() => setAnhPhongTo(null)}
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'>
                    <button type='button' onClick={() => setAnhPhongTo(null)} aria-label={t('Đóng', 'Close', '关闭')}
                        className='absolute top-4 right-4 flex items-center justify-center size-11 rounded-full bg-white/15 hover:bg-white/25 text-white transition'>
                        <X size={22} />
                    </button>
                    <img src={anhPhongTo} alt={t(...d.ten)} onClick={e => e.stopPropagation()}
                        className='max-w-full max-h-[88vh] object-contain rounded-2xl shadow-2xl' />
                </div>
            )}
        </div>
    )
}
