'use client'
import { useEffect, useState } from 'react'
import { taiSanPham } from '@/lib/utils/khoSanPham'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import TheSanPham from '@/components/TheSanPham'
import BiaDiaDiem from '@/components/BiaDiaDiem'
import AnhDiaDiem from '@/components/AnhDiaDiem'
import AnhDaiDien from '@/components/AnhDaiDien'
import Anh from '@/components/Anh'
import Rating from '@/components/Rating'
import TrangRong from '@/components/TrangRong'
import { useAuth } from '@/components/AuthProvider'
import { ArrowLeft, ArrowRight, Bus, CheckCircle2, Clock, Compass, Images, MapPin, MessageSquare, Navigation, Phone, Send, ShoppingBasket, Sparkles, Star, Store, Ticket, UtensilsCrossed, X } from 'lucide-react'
import { timDiaDiem, linkChiDuong, DIA_DIEM } from '@/lib/diaDiem'
import { useNgonNgu } from '@/lib/i18n'

// Trang giới thiệu 1 địa điểm cho du khách: bài giới thiệu, thông tin tham quan,
// thư viện ảnh, gian hàng đáng chú ý (admin gắn) + đặc sản nổi bật, điểm lân cận,
// và đánh giá + bình luận của du khách.
export default function TrangDiaDiem() {

    const { id } = useParams()
    const { t } = useNgonNgu()
    const diaDiem = timDiaDiem(id)
    const { user } = useAuth() // undefined = đang tải; null = chưa đăng nhập

    const [gians, setGians] = useState([])
    const [quanGanDo, setQuanGanDo] = useState([]) // quán ăn gần đó (admin gắn)
    const [sanPhams, setSanPhams] = useState([])
    const [thuVien, setThuVien] = useState([]) // ảnh quét từ public/dia-diem (bìa + ảnh thêm)
    const [danhGias, setDanhGias] = useState([])
    const [loading, setLoading] = useState(true)
    const [anhPhongTo, setAnhPhongTo] = useState(null) // ảnh đang xem to trong lightbox

    // Form đánh giá địa điểm
    const [toiDaDanhGia, setToiDaDanhGia] = useState(false)
    const [saoMoi, setSaoMoi] = useState(0)
    const [binhLuanMoi, setBinhLuanMoi] = useState('')
    const [dangGui, setDangGui] = useState(false)

    useEffect(() => {
        if (!diaDiem) { setLoading(false); return }
        Promise.all([
            fetch(`/api/dia-diem?id=${diaDiem.id}`).then(r => r.json()).catch(() => ({})),
            fetch('/api/dia-diem/anh').then(r => r.json()).catch(() => ({})),
            fetch(`/api/ratings?diaDiem=${diaDiem.id}`).then(r => r.json()).catch(() => ({})),
        ]).then(async ([data, anhData, dg]) => {
            setThuVien(anhData.thuVien?.[diaDiem.id] || [])
            setDanhGias(dg.ratings || [])
            setToiDaDanhGia(!!dg.toiDaDanhGia)

            setQuanGanDo(data.quanAns || [])
            const stores = data.stores || []
            setGians(stores)
            if (!stores.length) return
            // Đặc sản nổi bật = sản phẩm của các gian đã gắn (tối đa 8)
            const idGian = new Set(stores.map(g => g.id))
            const sp = await taiSanPham()
            setSanPhams(sp.filter(p => idGian.has(p.storeId)).slice(0, 8))
        }).finally(() => setLoading(false))
    }, [id])

    const guiDanhGia = async () => {
        if (!saoMoi) return toast.error(t('Vui lòng chọn số sao', 'Please choose a star rating', '请选择星级'))
        setDangGui(true)
        try {
            const res = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diaDiemId: diaDiem.id, sao: saoMoi, binhLuan: binhLuanMoi }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Không gửi được đánh giá', 'Could not submit review', '无法提交评价')); return }
            setDanhGias([{ id: data.rating.id, ten: data.rating.ten, sao: data.rating.sao, binhLuan: data.rating.binhLuan, createdAt: data.rating.createdAt }, ...danhGias])
            setToiDaDanhGia(true)
            setSaoMoi(0)
            setBinhLuanMoi('')
            toast.success(t('Cảm ơn bạn đã chia sẻ!', 'Thanks for sharing!', '感谢您的分享！'))
        } finally {
            setDangGui(false)
        }
    }

    if (loading) return <Loading />

    if (!diaDiem) return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-6'>
            <MapPin size={48} className='text-slate-300' />
            <h1 className='text-2xl font-semibold text-slate-700 mt-4'>{t('Không tìm thấy địa điểm', 'Place not found', '未找到地点')}</h1>
            <p className='text-slate-500 text-sm mt-2'>{t('Địa điểm này không có trên Bản Đồ Số Hồng Gai.', 'This place is not on the Hong Gai Digital Map.', '此地点不在鸿街数字地图上。')}</p>
            <Link href='/kham-pha' className='bg-sky-600 hover:bg-sky-700 transition text-white px-8 py-2.5 rounded-full mt-6 text-sm font-medium'>
                {t('Về trang Khám phá', 'Back to Explore', '返回探索')}
            </Link>
        </div>
    )

    const d = diaDiem
    const lanCan = (d.lanCan || []).map(timDiaDiem).filter(Boolean)

    return (
        <div className='min-h-[70vh] mx-6 my-10 mb-28'>
            <div className='max-w-6xl mx-auto'>

                <Link href='/kham-pha' className='inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5'>
                    <ArrowLeft size={15} /> {t('Về trang Khám phá', 'Back to Explore', '返回探索')}
                </Link>

                {/* Ảnh bìa: có file thật thì hiện ảnh, chưa có thì hiện khối gradient + emoji */}
                <BiaDiaDiem d={d}
                    className='w-full aspect-[16/6] max-sm:aspect-video rounded-3xl shadow-sm ring-1 ring-slate-100 mb-5' />

                {/* Đầu trang địa điểm */}
                <div className='hop-sang rounded-3xl px-6 py-8 sm:px-9 flex max-sm:flex-col sm:items-center gap-5'
                    style={{ background: `radial-gradient(120% 170% at 100% 0%, ${d.mau}30 0%, transparent 55%), linear-gradient(135deg, ${d.mau}12, ${d.mau}26)`, '--mau-khu': d.mau }}>
                    <span className='flex items-center justify-center size-20 sm:size-24 overflow-hidden bg-white rounded-2xl shadow-md ring-2 ring-white shrink-0'>
                        <AnhDiaDiem id={d.id} alt={t(...d.ten)} className='w-full h-full object-cover'
                            fallback={<span className='flex items-center justify-center w-full h-full text-5xl sm:text-6xl'>{d.icon}</span>} />
                    </span>
                    <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2.5 flex-wrap'>
                            <h1 className='text-2xl sm:text-3xl font-bold text-slate-800'>{t(...d.ten)}</h1>
                            <span className='text-xs font-semibold px-3 py-1 rounded-full text-white' style={{ backgroundColor: d.mau }}>
                                {t(...d.loai)}
                            </span>
                        </div>
                        <p className='flex items-center gap-1.5 text-sm text-slate-500 mt-1.5'><MapPin size={14} /> {t('Phường Hồng Gai, TP. Hạ Long (cũ)', 'Hong Gai Ward, Ha Long City (former)', '鸿街坊，下龙市（原）')}</p>
                        <p className='text-sm text-slate-600 mt-2 max-w-2xl'>{t(...d.mota)}</p>
                    </div>
                    <a href={linkChiDuong(d.ten)} target='_blank' rel='noopener noreferrer'
                        className='flex items-center justify-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full active:scale-95 transition shrink-0'
                        style={{ backgroundColor: d.mau }}>
                        <Navigation size={15} /> {t('Chỉ đường', 'Directions', '路线')}
                    </a>
                </div>

                <div className='grid lg:grid-cols-3 gap-8 mt-10 items-start'>
                    {/* Bài giới thiệu + điểm nổi bật */}
                    <div className='lg:col-span-2'>
                        <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700 mb-4'>
                            <Compass size={18} style={{ color: d.mau }} /> {t('Giới thiệu', 'Introduction', '简介')}
                        </h2>
                        <div className='flex flex-col gap-4'>
                            {d.gioiThieu.map((doan, i) => (
                                <p key={i} className='text-[15px] text-slate-600 leading-relaxed'>{t(...doan)}</p>
                            ))}
                        </div>

                        <h3 className='flex items-center gap-2 text-base font-semibold text-slate-700 mt-8 mb-3'>
                            <Sparkles size={16} style={{ color: d.mau }} /> {t('Điểm nổi bật', 'Highlights', '亮点')}
                        </h3>
                        <ul className='flex flex-col gap-2.5'>
                            {d.diemNoiBat.map((diem, i) => (
                                <li key={i} className='flex items-start gap-3 text-sm text-slate-600'>
                                    <span className='flex items-center justify-center size-5 shrink-0 rounded-full text-white text-[10px] font-bold mt-0.5' style={{ backgroundColor: d.mau }}>{i + 1}</span>
                                    {t(...diem)}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Thông tin tham quan */}
                    <div className='bg-slate-50 border border-slate-100 rounded-3xl p-6'>
                        <h2 className='text-base font-semibold text-slate-700 mb-5'>{t('Thông tin tham quan', 'Visitor information', '参观信息')}</h2>
                        <div className='flex flex-col gap-5 text-sm'>
                            <div className='flex items-start gap-3'>
                                <span className='flex items-center justify-center size-9 shrink-0 rounded-xl bg-white shadow-sm' style={{ color: d.mau }}><Clock size={16} /></span>
                                <div>
                                    <p className='font-semibold text-slate-700'>{t('Giờ mở cửa', 'Opening hours', '开放时间')}</p>
                                    <p className='text-slate-500 mt-0.5'>{t(...d.thongTin.gioMoCua)}</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='flex items-center justify-center size-9 shrink-0 rounded-xl bg-white shadow-sm' style={{ color: d.mau }}><Ticket size={16} /></span>
                                <div>
                                    <p className='font-semibold text-slate-700'>{t('Giá vé', 'Ticket price', '门票')}</p>
                                    <p className='text-slate-500 mt-0.5'>{t(...d.thongTin.giaVe)}</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='flex items-center justify-center size-9 shrink-0 rounded-xl bg-white shadow-sm' style={{ color: d.mau }}><Bus size={16} /></span>
                                <div>
                                    <p className='font-semibold text-slate-700'>{t('Cách di chuyển', 'Getting there', '交通方式')}</p>
                                    <p className='text-slate-500 mt-0.5'>{t(...d.thongTin.diChuyen)}</p>
                                </div>
                            </div>
                        </div>
                        <a href={linkChiDuong(d.ten)} target='_blank' rel='noopener noreferrer'
                            className='flex items-center justify-center gap-2 w-full text-sm font-semibold px-4 py-2.5 rounded-full border mt-6 hover:bg-white transition active:scale-95'
                            style={{ color: d.mau, borderColor: d.mau }}>
                            <Navigation size={14} /> {t('Mở trên Google Maps', 'Open in Google Maps', '在 Google 地图打开')}
                        </a>
                    </div>
                </div>

                {/* Bộ sưu tập ảnh — TỰ NHẬN file public/dia-diem/<id>-2.jpg, -3.jpg...
                    (ảnh bìa <id>.jpg đã hiện to trên đầu trang nên không lặp lại ở đây) */}
                {(() => {
                    const anhThem = [...thuVien.slice(1), ...(d.thuVienAnh || [])]
                    return anhThem.length > 0 && (
                        <>
                            <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700 mt-14 mb-4'>
                                <Images size={18} style={{ color: d.mau }} /> {t('Hình ảnh', 'Photos', '图片')}
                            </h2>
                            <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                                {anhThem.map(a => (
                                    <button key={a} type='button' onClick={() => setAnhPhongTo(a)}
                                        className='group relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-100 cursor-zoom-in'>
                                        <Anh src={a} alt={t(...d.ten)}
                                            className='w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-300' />
                                    </button>
                                ))}
                            </div>
                        </>
                    )
                })()}

                {/* Gian hàng đáng chú ý (admin gắn) */}
                <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700 mt-14 mb-4'>
                    <Store size={18} style={{ color: d.mau }} /> {t('Gian hàng đáng chú ý gần đây', 'Featured stores nearby', '附近精选店铺')}
                </h2>
                {gians.length ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {gians.map(g => (
                            <Link key={g.id} href={`/gian/${g.id}`} className='flex gap-3.5 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition group'>
                                <Anh src={g.logo} alt={g.tenGian} className='size-14 rounded-xl object-cover ring-1 ring-slate-100 shrink-0' />
                                <div className='min-w-0 flex-1'>
                                    <p className='font-semibold text-slate-800 truncate'>{g.tenGian}</p>
                                    <p className='text-xs text-slate-500 mt-0.5'>{t('Chủ gian:', 'Owner:', '店主：')} {g.tenChu}</p>
                                    <p className='text-xs text-slate-600 mt-1.5 line-clamp-2'>{g.moTa}</p>
                                    <span className='inline-flex items-center gap-1.5 text-xs font-semibold mt-2 group-hover:gap-2.5 transition-all' style={{ color: d.mau }}>
                                        <Phone size={12} /> {g.soDienThoai} · {t('Vào gian', 'Visit store', '进店')} <ArrowRight size={12} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <TrangRong Icon={Store} mau={d.mau}
                        tieuDe={t('Chưa có gian hàng nào gần đây', 'No stores linked here yet', '尚无关联店铺')}
                        moTa={t('Chưa có gian hàng nào được gắn với địa điểm này — ghé trang chợ để xem tất cả gian hàng nhé.', 'No stores are linked to this place yet — visit the marketplace to see all stores.', '尚无店铺关联此地点 —— 前往市集页查看所有店铺。')}
                        nutText={t('Xem tất cả gian hàng', 'Browse all stores', '查看全部店铺')} nutHref='/shop' />
                )}

                {/* Quán ăn gần đó (admin gắn) — chỉ hiện khi có quán được gắn */}
                {quanGanDo.length > 0 && (
                    <>
                        <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700 mt-14 mb-4'>
                            <UtensilsCrossed size={18} style={{ color: '#ea580c' }} /> {t('Quán ăn gần đó', 'Nearby eateries', '附近餐馆')}
                        </h2>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {quanGanDo.map(q => (
                                <Link key={q.id} href={`/do-an/${q.id}`} className='flex gap-3.5 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition group'>
                                    <Anh src={q.logo} alt={q.ten} className='size-14 rounded-xl object-cover ring-1 ring-slate-100 shrink-0' />
                                    <div className='min-w-0 flex-1'>
                                        <p className='font-semibold text-slate-800 truncate'>{q.ten}</p>
                                        {(q.gioMoCua || q.gioDongCua) && (
                                            <p className='flex items-center gap-1 text-xs text-slate-500 mt-0.5'><Clock size={11} /> {q.gioMoCua} - {q.gioDongCua}</p>
                                        )}
                                        <p className='text-xs text-slate-600 mt-1.5 line-clamp-2'>{q.moTa}</p>
                                        <span className='inline-flex items-center gap-1.5 text-xs font-semibold mt-2 group-hover:gap-2.5 transition-all' style={{ color: '#ea580c' }}>
                                            <UtensilsCrossed size={12} /> {t('Xem thực đơn', 'View menu', '查看菜单')} <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                {/* Đặc sản nổi bật từ các gian đã gắn */}
                {sanPhams.length > 0 && (
                    <>
                        <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700 mt-12 mb-4'>
                            <ShoppingBasket size={18} style={{ color: d.mau }} /> {t('Đặc sản nổi bật', 'Featured specialties', '特色好物')}
                        </h2>
                        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
                            {sanPhams.map(sp => (
                                <TheSanPham key={sp.id} sp={sp} accentColor={d.mau} />
                            ))}
                        </div>
                    </>
                )}

                {/* Gợi ý điểm lân cận */}
                {lanCan.length > 0 && (
                    <>
                        <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700 mt-14 mb-4'>
                            <MapPin size={18} style={{ color: d.mau }} /> {t('Gần đó còn gì hay?', 'What else is nearby?', '附近还有什么？')}
                        </h2>
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                            {lanCan.map(lc => (
                                <Link key={lc.id} href={`/dia-diem/${lc.id}`}
                                    className='flex items-center gap-4 rounded-2xl p-4 border border-slate-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition group'>
                                    <span className='flex items-center justify-center size-12 overflow-hidden rounded-xl shrink-0' style={{ backgroundColor: lc.mau + '1a' }}>
                                        <AnhDiaDiem id={lc.id} alt={t(...lc.ten)} className='w-full h-full object-cover'
                                            fallback={<span className='flex items-center justify-center w-full h-full text-2xl'>{lc.icon}</span>} />
                                    </span>
                                    <div className='min-w-0'>
                                        <p className='font-semibold text-slate-800 text-sm truncate'>{t(...lc.ten)}</p>
                                        <span className='text-ti font-semibold px-2 py-0.5 rounded-full' style={{ backgroundColor: lc.mau + '1a', color: lc.mau }}>{t(...lc.loai)}</span>
                                        <span className='flex items-center gap-1 text-xs font-semibold mt-1.5 group-hover:gap-2 transition-all' style={{ color: lc.mau }}>
                                            {t('Khám phá', 'Explore', '探索')} <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                {/* Đánh giá & bình luận của du khách */}
                <div className='flex items-center gap-3 flex-wrap mt-14 mb-5'>
                    <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700'>
                        <MessageSquare size={18} style={{ color: d.mau }} /> {t('Du khách nói gì?', 'What visitors say', '游客怎么说')} ({danhGias.length})
                    </h2>
                    {danhGias.length > 0 && (
                        <span className='flex items-center gap-1 text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full'>
                            <Star size={13} className='fill-current' />
                            {Math.round(danhGias.reduce((s, x) => s + x.sao, 0) / danhGias.length * 10) / 10}/5
                        </span>
                    )}
                </div>

                {/* Form đánh giá — chỉ cần đăng nhập, mỗi người 1 lần */}
                <div className='max-w-3xl mb-5'>
                    {user === null ? (
                        <p className='text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3'>
                            <Link href={`/login?ve=/dia-diem/${d.id}`} className='font-semibold underline' style={{ color: d.mau }}>{t('Đăng nhập', 'Sign in', '登录')}</Link>{t(' để chia sẻ cảm nhận của bạn về ', ' to share your thoughts about ', '后分享您对')}{t(...d.ten)}{t('.', '.', '的感受。')}
                        </p>
                    ) : toiDaDanhGia ? (
                        <p className='flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-2xl px-4 py-3'>
                            <CheckCircle2 size={16} /> {t('Bạn đã đánh giá địa điểm này — cảm ơn bạn!', 'You have already reviewed this place — thank you!', '您已评价过此地点 — 谢谢您！')}
                        </p>
                    ) : user ? (
                        <div className='bg-white border border-slate-100 rounded-2xl p-4 shadow-sm'>
                            <p className='text-sm font-semibold text-slate-700 mb-2'>{t('Bạn đã ghé', 'Have you visited', '您去过')} {t(...d.ten)}{t('? Chia sẻ cảm nhận nhé', '? Share your thoughts', '吗？分享您的感受吧')}</p>
                            <div className='flex items-center gap-1 mb-3'>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button key={n} type='button' onClick={() => setSaoMoi(n)} aria-label={t(`${n} sao`, `${n} stars`, `${n} 星`)}
                                        className='p-0.5 active:scale-90 transition'>
                                        <Star size={26}
                                            className={n <= saoMoi ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                    </button>
                                ))}
                                {saoMoi > 0 && <span className='text-sm text-slate-500 ml-2'>{t(`${saoMoi}/5 sao`, `${saoMoi}/5 stars`, `${saoMoi}/5 星`)}</span>}
                            </div>
                            <textarea value={binhLuanMoi} onChange={e => setBinhLuanMoi(e.target.value)} rows={3} maxLength={500}
                                placeholder={t('Cảnh đẹp không, nên đi giờ nào, có gì đáng thử... (không bắt buộc)', 'Is it scenic, best time to go, what to try... (optional)', '风景如何、几点去合适、有什么值得一试……（选填）')}
                                className='w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-300 resize-none placeholder-slate-400' />
                            <button onClick={guiDanhGia} disabled={dangGui}
                                className='flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded-full mt-2 active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none'
                                style={{ backgroundColor: d.mau }}>
                                <Send size={14} /> {dangGui ? t('Đang gửi...', 'Sending...', '提交中…') : t('Gửi đánh giá', 'Submit review', '提交评价')}
                            </button>
                        </div>
                    ) : null /* user === undefined: đang tải, chưa vẽ form */}
                </div>

                {danhGias.length ? (
                    <div className='flex flex-col gap-3 max-w-3xl'>
                        {danhGias.map(dg => (
                            <div key={dg.id} className='bg-white border border-slate-100 rounded-2xl p-4 shadow-sm'>
                                <div className='flex items-center gap-3'>
                                    <AnhDaiDien src={dg.anhNguoiDung} ten={dg.ten}
                                        khung='size-9 rounded-full bg-slate-100'
                                        chu='text-slate-600 text-sm font-bold uppercase' />
                                    <div className='min-w-0'>
                                        <p className='text-sm font-semibold text-slate-700'>{dg.ten}</p>
                                        <div className='flex items-center gap-2 flex-wrap'>
                                            <Rating value={dg.sao} />
                                            <span className='text-xs text-slate-400'>{new Date(dg.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </div>
                                {dg.binhLuan && <p className='text-sm text-slate-600 mt-2.5 pl-12'>{dg.binhLuan}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='text-slate-400 text-sm'>{t('Chưa có đánh giá nào — bạn là du khách đầu tiên chia sẻ cảm nhận nhé!', 'No reviews yet — be the first visitor to share your thoughts!', '还没有评价 — 来当第一个分享感受的游客吧！')}</p>
                )}
            </div>

            {/* Lightbox xem ảnh to — bấm ảnh trong "Hình ảnh" để mở, bấm nền hoặc nút X để đóng */}
            {anhPhongTo && (
                <div onClick={() => setAnhPhongTo(null)}
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in'>
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
