'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Compass, TicketPercent, Truck } from 'lucide-react'
import { DANH_MUC } from '@/lib/danhMuc'
import { useNgonNgu } from '@/lib/i18n'
import CanhVinhHaLong, { BANG_MAU_VINH, useBuoi } from '@/components/CanhVinhHaLong'

// Hero cho MÁY TÍNH — cảnh vịnh Hạ Long (components/CanhVinhHaLong, dùng chung với
// banner đầu trang chủ trên điện thoại).

const Hero = () => {
    const { t } = useNgonNgu()
    const [ma, setMa] = useState(null)
    const buoi = useBuoi()

    useEffect(() => {
        fetch('/api/coupons').then(r => r.json()).then(d => setMa((d.coupons || [])[0] || null)).catch(() => { })
    }, [])

    return (
        <div className='mx-6'>
            <div className='flex max-lg:flex-col gap-6 max-w-7xl mx-auto my-10'>
                {/* Panel chính — cảnh vịnh Hạ Long */}
                <div className='relative overflow-hidden flex-1 rounded-3xl p-8 lg:p-12 flex flex-col justify-center min-h-[340px]'
                    style={{ background: BANG_MAU_VINH[buoi].nen, transition: 'background 1s ease' }}>
                    <CanhVinhHaLong buoi={buoi} />

                    <div className='relative'>
                        <span className='inline-flex items-center gap-2 self-start text-xs font-semibold text-white px-3 py-1.5 rounded-full' style={{ background: 'rgba(255,255,255,.15)' }}>
                            <Truck size={14} /> {t('Miễn phí vận chuyển đơn từ 200.000đ', 'Free shipping on orders from 200,000đ', '订单满200,000đ免运费')}
                        </span>
                        <h1 className='text-4xl lg:text-5xl chu-hien-thi text-white mt-5 max-w-lg'>
                            {t('Đặc sản Hồng Gai.', 'Hong Gai specialties.', '鸿基特产。')}<br />{t('Tươi ngon mỗi ngày.', 'Fresh every day.', '每日新鲜。')}
                        </h1>
                        <p className='mt-4 max-w-md text-white/75'>
                            {t('Hải sản đánh bắt trong ngày, quà đặc sản chính gốc — từ chợ Hồng Gai tới tận tay bạn.', 'Same-day caught seafood and authentic specialty gifts — from Hong Gai market to your door.', '当日捕捞的海鲜、正宗特产礼品 —— 从鸿基市场直达您手中。')}
                        </p>
                        <div className='flex items-center gap-5 mt-8 flex-wrap'>
                            <Link href='/shop' className='inline-flex items-center gap-2 bg-white font-semibold px-7 py-3 rounded-full hover:bg-emerald-50 active:scale-95 transition text-emerald-900'>
                                {t('Mua sắm ngay', 'Shop now', '立即购物')} <ArrowRight size={17} />
                            </Link>
                            <span className='text-sm text-white/75'>{t('Bắt đầu từ', 'Starting from', '起价')} <span className='text-white text-lg font-semibold'>75.000đ</span></span>
                        </div>
                    </div>
                </div>

                {/* Cột phải: mã giảm giá + khám phá */}
                <div className='w-full lg:max-w-xs flex flex-col gap-6'>
                    <Link href='/shop' className='flex-1 rounded-3xl p-6 flex flex-col justify-between hover:-translate-y-0.5 transition' style={{ background: '#fef3c7' }}>
                        <TicketPercent size={30} style={{ color: '#BA7517' }} />
                        <div className='mt-6'>
                            <p className='text-lg font-semibold' style={{ color: '#633806' }}>{ma ? ma.moTa : t('Ưu đãi cho bạn', 'Offers for you', '为您准备的优惠')}</p>
                            <p className='text-sm mt-1 flex items-center gap-1.5' style={{ color: '#854F0B' }}>
                                {ma ? <>{t('Nhập mã', 'Use code', '使用码')} <span className='font-semibold'>{ma.code}</span></> : t('Xem ưu đãi', 'View offers', '查看优惠')} <ArrowRight size={15} />
                            </p>
                        </div>
                    </Link>
                    <Link href='/kham-pha' className='flex-1 rounded-3xl p-6 flex flex-col justify-between hover:-translate-y-0.5 transition' style={{ background: '#dbeafe' }}>
                        <Compass size={30} style={{ color: '#185FA5' }} />
                        <div className='mt-6'>
                            <p className='text-lg font-semibold' style={{ color: '#0C447C' }}>{t('Khám phá Hồng Gai', 'Explore Hong Gai', '探索鸿基')}</p>
                            <p className='text-sm mt-1 flex items-center gap-1.5' style={{ color: '#185FA5' }}>{t('Điểm đến & đặc sản', 'Destinations & specialties', '景点与特产')} <ArrowRight size={15} /></p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Ô danh mục nhanh — ảnh minh họa bộ nhận diện thương hiệu */}
            <div className='max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5'>
                {DANH_MUC.map(d => (
                    <Link key={d.href} href={d.href}
                        className='flex items-center gap-3.5 bg-white border border-slate-100 rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition group'>
                        <span className='flex items-center justify-center size-14 rounded-2xl shrink-0 p-2.5' style={{ background: d.nen }}>
                            <img src={d.anh} alt={t(...d.labelDai)} className='w-full h-full object-contain drop-shadow-sm' />
                        </span>
                        <div className='min-w-0'>
                            <p className='font-semibold text-slate-800 leading-tight'>{t(...d.labelDai)}</p>
                            <p className='text-xs text-slate-500 mt-0.5'>{t(...d.mo)}</p>
                        </div>
                        <ArrowRight size={17} className='text-slate-300 ml-auto shrink-0 group-hover:translate-x-1 transition' />
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Hero
