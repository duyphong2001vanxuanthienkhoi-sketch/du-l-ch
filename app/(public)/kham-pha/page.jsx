'use client'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import BanDoSo from '@/components/BanDoSo'
import BiaDiaDiem from '@/components/BiaDiaDiem'
import AnhDiaDiem from '@/components/AnhDiaDiem'
import { DIA_DIEM } from '@/lib/diaDiem'
import { useNgonNgu } from '@/lib/i18n'

// Trang Khám phá Hồng Gai — mục lục các địa điểm cho du khách:
// bản đồ số ở trên, dưới là lưới thẻ dẫn vào trang giới thiệu từng địa điểm.
export default function TrangKhamPha() {
    const { t } = useNgonNgu()
    return (
        <div className='min-h-[70vh] mb-28'>
            {/* Đầu trang kiểu tạp chí du lịch — dùng CHÍNH ảnh thật của các địa điểm làm nền
                (trước đây chỉ có chữ, phí bộ ảnh đẹp sẵn có), phủ lớp tối để chữ luôn đọc rõ. */}
            <div className='max-w-6xl mx-auto px-6 mt-6'>
                <div className='relative overflow-hidden rounded-3xl bong-mem min-h-[300px] sm:min-h-[380px] flex items-end'>
                    {/* MỘT ảnh lớn làm nền (ảnh ghép nhiều tấm bị lộ đường nối, trông như collage
                        chứ không sang). Lấy địa điểm biểu tượng đầu danh sách — núi Bài Thơ. */}
                    <div className='absolute inset-0' aria-hidden='true'>
                        <AnhDiaDiem id={DIA_DIEM[0].id} alt='' className='w-full h-full object-cover'
                            fallback={<span className='block w-full h-full' style={{ background: `linear-gradient(135deg, ${DIA_DIEM[0].mau}66, ${DIA_DIEM[0].mau}cc)` }} />} />
                    </div>
                    {/* Lớp phủ chuyển dần: trong ở trên cho ảnh "thở", đậm dần xuống đáy nơi đặt chữ */}
                    <div className='absolute inset-0' aria-hidden='true'
                        style={{ background: 'linear-gradient(180deg, rgba(11,47,79,.10) 0%, rgba(11,47,79,.55) 55%, rgba(11,47,79,.88) 100%)' }} />

                    <div className='relative w-full px-6 sm:px-10 pb-8 sm:pb-10 pt-24 max-w-3xl'>
                        <span className='inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3.5 py-1.5 rounded-full backdrop-blur-sm' style={{ background: 'rgba(255,255,255,.20)' }}>
                            <MapPin size={13} /> {t('Cẩm nang du lịch Hồng Gai', 'Hong Gai travel guide', '鸿基旅游指南')}
                        </span>
                        <h1 className='text-3xl sm:text-5xl chu-hien-thi text-white mt-3'>{t('Khám phá Hồng Gai', 'Explore Hong Gai', '探索鸿基')}</h1>
                        <p className='text-white/75 mt-2.5 leading-relaxed text-sm sm:text-base'>
                            {t('Núi thiêng, chùa cổ, chợ biển và kỳ quan thế giới — tất cả trong bán kính vài cây số. Chọn một địa điểm để xem giới thiệu, cách đi và những gian hàng đặc sản đáng ghé gần đó.', 'Sacred mountains, ancient temples, sea markets and a world wonder — all within a few kilometers. Pick a place to see its intro, how to get there and nearby specialty stores worth a visit.', '灵山、古寺、海市与世界奇观 —— 皆在数公里之内。选一个地点查看介绍、路线和附近值得一逛的特产店。')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bản đồ số quen thuộc */}
            <BanDoSo />

            {/* Lưới thẻ địa điểm */}
            <div className='max-w-6xl mx-auto px-6'>
                <h2 className='text-lg font-semibold text-slate-700 mb-4'>{t('Tất cả địa điểm', 'All destinations', '所有景点')} ({DIA_DIEM.length})</h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                    {DIA_DIEM.map(d => (
                        <Link key={d.id} href={`/dia-diem/${d.id}`}
                            style={{ '--mau-bong': d.mau }}
                            className='group rounded-3xl border border-slate-100 bg-white bong-mem hover:bong-theo-mau hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden'>
                            {/* Ảnh thật trên đầu thẻ; chưa có file ảnh thì hiện khối gradient + emoji cho đẹp */}
                            <BiaDiaDiem d={d}
                                className='w-full aspect-[16/8] group-hover:scale-[1.02] transition-transform' />
                            <div className='flex items-center gap-4 px-5 py-5'
                                style={{ background: `linear-gradient(135deg, ${d.mau}10, ${d.mau}24)` }}>
                                <span className='flex items-center justify-center size-14 shrink-0 rounded-2xl overflow-hidden bg-white shadow-sm'>
                                    <AnhDiaDiem id={d.id} alt={t(...d.ten)} className='w-full h-full object-cover'
                                        fallback={<span className='flex items-center justify-center w-full h-full text-3xl'>{d.icon}</span>} />
                                </span>
                                <div className='min-w-0'>
                                    <h3 className='font-bold text-slate-800 truncate'>{t(...d.ten)}</h3>
                                    <span className='inline-block text-ti font-semibold px-2.5 py-0.5 rounded-full mt-1' style={{ backgroundColor: d.mau + '1a', color: d.mau }}>{t(...d.loai)}</span>
                                </div>
                            </div>
                            <div className='px-5 py-4'>
                                <p className='text-sm text-slate-600 line-clamp-3 leading-relaxed'>{t(...d.mota)}</p>
                                <span className='inline-flex items-center gap-1.5 text-sm font-semibold mt-3 group-hover:gap-2.5 transition-all' style={{ color: d.mau }}>
                                    {t('Xem giới thiệu & gian hàng gần đó', 'View intro & nearby stores', '查看介绍及附近店铺')} <ArrowRight size={14} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
