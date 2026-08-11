'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, ChevronRight, Moon, Star, Sun, Sunrise, ThumbsUp, TicketPercent, Truck } from 'lucide-react'
import { formatVND } from '@/lib/utils/currency'
import { DANH_MUC } from '@/lib/danhMuc'
import TheThanhVien from '@/components/TheThanhVien'
import LoiVaoQuanLy from '@/components/LoiVaoQuanLy'
import { SongChim } from '@/components/HoaTietSong'
import { useAuth } from '@/components/AuthProvider'
import { useNgonNgu } from '@/lib/i18n'
import { taiSanPham } from '@/lib/utils/khoSanPham'
import { BangGreenSMNoiBat } from '@/components/GreenSM'
import Anh from '@/components/Anh'
import CanhVinhHaLong, { BANG_MAU_VINH, useBuoi } from '@/components/CanhVinhHaLong'

// Đầu trang chủ kiểu app — CHỈ hiện trên điện thoại (khớp với thanh điều hướng dưới).
// Máy tính vẫn dùng Hero web. Lời chào + thẻ thành viên (tích điểm thật) + ô danh mục + banner mã giảm giá.

// Trả MÃ buổi trong ngày (dịch ở render để đổi ngôn ngữ được)
function buoiTrongNgay() {
    const h = new Date().getHours()
    if (h < 11) return 'sang'
    if (h < 14) return 'trua'
    if (h < 18) return 'chieu'
    return 'toi'
}

const TrangChuApp = () => {
    const { user } = useAuth() // undefined = đang tải; null = khách vãng lai
    const { t } = useNgonNgu()
    const [ma, setMa] = useState(null)
    const [goiY, setGoiY] = useState([])
    // Buổi tính theo GIỜ CLIENT — chỉ đặt sau khi mount để server & client khớp
    // (nếu tính ngay trong render sẽ lệch múi giờ giữa máy chủ và trình duyệt → lỗi hydration)
    const [buoi, setBuoi] = useState(null)
    const buoiVinh = useBuoi() // buổi cho banner cảnh vịnh (mặc định 'chieu' để khớp server)

    useEffect(() => {
        setBuoi(buoiTrongNgay())
        fetch('/api/coupons').then(r => r.json()).then(d => setMa((d.coupons || [])[0] || null)).catch(() => { })
        // Đặc sản nên thử: ưu tiên đánh giá cao (sao rồi số lượt), thiếu thì lấp bằng hàng còn lại
        taiSanPham().then(ds => {
            const dsSanPham = ds.slice().sort((a, b) => {
                const coA = a.soDanhGia > 0, coB = b.soDanhGia > 0
                if (coA !== coB) return coA ? -1 : 1
                if (b.trungBinhSao !== a.trungBinhSao) return b.trungBinhSao - a.trungBinhSao
                return b.soDanhGia - a.soDanhGia
            })
            setGoiY(dsSanPham.slice(0, 4))
        }).catch(() => { })
    }, [])

    const tenGoi = user?.name ? user.name.trim().split(/\s+/).pop() : null
    const chao = !buoi ? t('Chào bạn', 'Hi there', '你好')
        : buoi === 'sang' ? t('Chào buổi sáng', 'Good morning', '早上好')
            : buoi === 'trua' ? t('Chào buổi trưa', 'Good afternoon', '中午好')
                : buoi === 'chieu' ? t('Chào buổi chiều', 'Good afternoon', '下午好')
                    : t('Chào buổi tối', 'Good evening', '晚上好')

    return (
        <div className='sm:hidden px-5 pt-4 pb-1'>
            {/* Lời chào */}
            <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2 min-w-0'>
                    {/* Icon lời chào theo buổi — cùng nhịp với cảnh vịnh & dải banner */}
                    {buoi === 'sang' ? <Sunrise size={20} className='text-amber-500 shrink-0' />
                        : buoi === 'toi' ? <Moon size={20} className='text-indigo-400 shrink-0' />
                            : <Sun size={20} className='text-amber-500 shrink-0' />}
                    <span className='text-[15px] text-slate-700 truncate'>{chao}{user ? `, ${user.name}` : ''}</span>
                </div>
                <Link href='/orders' aria-label={t('Đơn hàng của tôi', 'My orders', '我的订单')}
                    className='flex items-center justify-center size-9 bg-slate-100 rounded-full text-slate-500 shrink-0'>
                    <Bell size={17} />
                </Link>
            </div>

            {/* Banner cảnh vịnh Hạ Long — bản gọn của Hero máy tính, để KHÁCH DÙNG ĐIỆN THOẠI
                cũng thấy được hình ảnh thương hiệu (trước đây Hero chỉ hiện trên máy tính) */}
            <Link href='/shop' className='relative overflow-hidden block rounded-3xl px-5 py-4 mb-4 min-h-[132px] flex flex-col justify-center active:scale-[.99] transition'
                style={{ background: BANG_MAU_VINH[buoiVinh].nen, transition: 'background 1s ease' }}>
                <CanhVinhHaLong buoi={buoiVinh} cao='78%' />
                <div className='relative'>
                    <span className='inline-flex items-center gap-1.5 text-[10px] font-semibold text-white px-2 py-1 rounded-full' style={{ background: 'rgba(255,255,255,.18)' }}>
                        <Truck size={11} /> {t('Miễn phí ship từ 200.000đ', 'Free ship from 200,000đ', '满200,000đ免运费')}
                    </span>
                    <p className='text-[22px] chu-hien-thi text-white mt-2'>
                        {t('Đặc sản Hồng Gai.', 'Hong Gai specialties.', '鸿基特产。')}<br />{t('Tươi ngon mỗi ngày.', 'Fresh every day.', '每日新鲜。')}
                    </p>
                    <span className='inline-flex items-center gap-1 text-xs font-semibold text-white/90 mt-2'>
                        {t('Mua sắm ngay', 'Shop now', '立即购物')} <ChevronRight size={14} />
                    </span>
                </div>
            </Link>

            {/* Thẻ thành viên (tích điểm thật) hoặc mời đăng nhập */}
            {user === undefined ? (
                <div className='rounded-3xl h-36 animate-pulse' style={{ background: '#e2e8f0' }} />
            ) : user ? (
                <TheThanhVien user={user} subtitle={t('Thành viên Chợ Số', 'Cho So member', '数字市场会员')} badgeHref='/tai-khoan' />
            ) : (
                <Link href='/login?ve=/' className='relative overflow-hidden flex items-center justify-between rounded-3xl p-5 text-white' style={{ background: '#085041' }}>
                    <SongChim />
                    <div className='min-w-0'>
                        <p className='font-semibold'>{t('Đăng nhập Chợ Số Hồng Gai', 'Sign in to Cho So Hong Gai', '登录鸿基数字市场')}</p>
                        <p className='text-sm truncate' style={{ color: '#9FE1CB' }}>{t('Theo dõi đơn & tích bean đổi ưu đãi', 'Track orders & earn beans for rewards', '追踪订单，赚取积分兑换优惠')}</p>
                    </div>
                    <ChevronRight size={20} className='shrink-0' />
                </Link>
            )}

            {/* Ô danh mục — dùng ảnh minh họa bộ nhận diện thương hiệu */}
            <div className='grid grid-cols-4 gap-2.5 mt-4'>
                {DANH_MUC.map(o => (
                    <Link key={o.href} href={o.href} className='text-center active:scale-95 transition'>
                        <div className='aspect-square rounded-2xl flex items-center justify-center p-2.5 shadow-sm ring-1 ring-black/5' style={{ background: o.nen }}>
                            <img src={o.anh} alt={t(...o.label)} className='w-full h-full object-contain drop-shadow-sm' loading='lazy' />
                        </div>
                        <p className='mt-1.5 text-xs font-medium text-slate-700'>{t(...o.label)}</p>
                    </Link>
                ))}
            </div>

            {/* Khu quản lý theo vai trò — tiểu thương/chủ quán/admin thấy ngay lối vào của mình */}
            <LoiVaoQuanLy className='mt-5' />

            {/* Banner mã giảm giá (lấy mã thật đang hiệu lực) */}
            {ma && (
                <Link href='/shop' className='flex items-center gap-3 rounded-2xl p-4 mt-4' style={{ background: '#FAEEDA' }}>
                    <div className='flex-1 min-w-0'>
                        <p className='font-semibold' style={{ color: '#633806' }}>{ma.moTa}</p>
                        <p className='text-xs mt-0.5' style={{ color: '#854F0B' }}>{t('Nhập mã', 'Use code', '使用码')} <span className='font-semibold'>{ma.code}</span> · {t('giảm', 'off', '减')} {ma.phanTramGiam}%</p>
                    </div>
                    <TicketPercent size={36} style={{ color: '#EF9F27' }} className='shrink-0' />
                </Link>
            )}

            {/* Đối tác giao vận Green SM — banner nổi bật (to, xứng tầm đối tác) */}
            <div className='mt-4'>
                <BangGreenSMNoiBat
                    tieuDe={t('Giao hàng, đặt xe cùng Green SM', 'Delivery & rides with Green SM', 'Green SM 送货 · 叫车')}
                    moTa={t('Đối tác xe điện — giao hàng & đặt xe tận nơi tại Hồng Gai, xanh và thân thiện môi trường', 'Electric-vehicle partner — delivery & ride-hailing in Hong Gai, green and eco-friendly', '电动车合作伙伴 —— 鸿基送货与叫车，绿色环保')}
                    nhanNut={t('Đặt xe ngay', 'Book a ride', '立即叫车')} />
            </div>

            {/* Đặc sản nên thử — app tự đề xuất theo đánh giá cao nhất */}
            {goiY.length > 0 && (
                <div className='mt-6'>
                    <p className='font-semibold text-slate-800 mb-2'>{tenGoi ? `${tenGoi}, ${t('đặc sản nên thử', 'specialties to try', '值得一试的特产')}` : t('Đặc sản nên thử', 'Specialties to try', '值得一试的特产')}</p>
                    <div className='bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 overflow-hidden'>
                        {goiY.map(sp => (
                            <Link key={sp.id} href={`/product/${sp.id}`} className='flex items-center gap-3 p-3 active:bg-slate-50 transition'>
                                <Anh src={sp.anh} alt={sp.ten} className='size-14 rounded-xl object-cover ring-1 ring-slate-100 shrink-0' />
                                <div className='min-w-0 flex-1'>
                                    {sp.soDanhGia > 0 ? (
                                        <p className='flex items-center gap-1 text-xs font-semibold text-amber-600'>
                                            <Star size={12} className='fill-amber-400 text-amber-400' /> {sp.trungBinhSao} · {sp.soDanhGia} {t('đánh giá', 'reviews', '条评价')}
                                        </p>
                                    ) : (
                                        <p className='flex items-center gap-1 text-xs font-semibold text-green-600'>
                                            <ThumbsUp size={12} /> {t('Phải thử', 'Must try', '必试')}
                                        </p>
                                    )}
                                    <p className='text-sm text-slate-800 truncate mt-0.5'>{sp.ten}</p>
                                    <p className='text-xs text-slate-400 truncate'>{sp.tenGian}</p>
                                </div>
                                <span className='text-sm font-semibold text-white px-3 py-1.5 rounded-full shrink-0' style={{ background: '#059669' }}>{formatVND(sp.gia)}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default TrangChuApp
