'use client'
import Link from 'next/link'
import { ArrowRight, Compass } from 'lucide-react'
import AnhDiaDiem from '@/components/AnhDiaDiem'
import { DIA_DIEM } from '@/lib/diaDiem'
import { useNgonNgu } from '@/lib/i18n'

// Dải "Điểm đến nổi bật" ở trang chủ — lối vào nhanh cho du khách
// tới trang giới thiệu từng địa điểm (cuộn ngang trên màn hình nhỏ).
const DiemDenNoiBat = () => {
    const { t } = useNgonNgu()
    return (
    <section className='px-6 my-16 max-w-6xl mx-auto'>
        <div className='flex items-center justify-between gap-3 flex-wrap mb-5'>
            <div>
                <h2 className='flex items-center gap-2 text-xl font-bold text-slate-800'>
                    <span className='text-2xl'>🧭</span> {t('Điểm đến nổi bật quanh Hồng Gai', 'Featured destinations around Hong Gai', '鸿基周边热门景点')}
                </h2>
                <p className='text-sm text-slate-500 mt-1'>{t('Tham quan xong ghé gian hàng đặc sản gần đó — tiện cả đôi đường', 'After sightseeing, drop by a nearby specialty store — best of both', '游览后顺道逛逛附近的特产店 —— 一举两得')}</p>
            </div>
            <Link href='/kham-pha' className='inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:gap-2.5 transition-all'>
                <Compass size={15} /> {t('Xem tất cả', 'View all', '查看全部')} <ArrowRight size={14} />
            </Link>
        </div>

        <div className='flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-4'>
            {DIA_DIEM.map(d => (
                <Link key={d.id} href={`/dia-diem/${d.id}`}
                    className='group shrink-0 w-56 sm:w-auto rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition p-4'
                    style={{ background: `linear-gradient(160deg, #ffffff 55%, ${d.mau}14)` }}>
                    <div className='flex items-center gap-3'>
                        <AnhDiaDiem id={d.id} alt={t(...d.ten)}
                            className='size-11 rounded-xl object-cover ring-1 ring-slate-100 shrink-0'
                            fallback={<span className='flex items-center justify-center size-11 text-2xl rounded-xl shrink-0' style={{ backgroundColor: d.mau + '1a' }}>{d.icon}</span>} />
                        <div className='min-w-0'>
                            <p className='font-semibold text-slate-800 text-sm truncate'>{t(...d.ten)}</p>
                            <span className='text-ti font-semibold px-2 py-0.5 rounded-full' style={{ backgroundColor: d.mau + '1a', color: d.mau }}>{t(...d.loai)}</span>
                        </div>
                    </div>
                    <span className='flex items-center gap-1 text-xs font-semibold mt-3 group-hover:gap-2 transition-all' style={{ color: d.mau }}>
                        {t('Khám phá ngay', 'Explore now', '立即探索')} <ArrowRight size={12} />
                    </span>
                </Link>
            ))}
        </div>
    </section>
    )
}

export default DiemDenNoiBat
