'use client'
import { ArrowRight, Phone, Star, Store } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Anh from '@/components/Anh'
import { useNgonNgu } from '@/lib/i18n'

// Dải gian hàng THẬT đã được admin duyệt, hiển thị cho khách theo từng khu.
// Dữ liệu lấy từ /api/store/list — API này chỉ trả gian 'da_duyet'.
const GianHangDaDuyet = ({ loai, accentColor = '#059669' }) => {
    const { t } = useNgonNgu()
    const [gians, setGians] = useState([])

    useEffect(() => {
        fetch(`/api/store/list?loai=${loai}`)
            .then(r => r.json())
            .then(data => setGians(data.stores || []))
            .catch(() => { })
    }, [loai])

    if (!gians.length) return null

    return (
        <section className='px-6 mb-16 max-w-6xl mx-auto' style={{ '--mau-khu': accentColor }}>
            <h3 className='flex items-center gap-2 text-lg font-semibold text-slate-700 mb-4'>
                <Store size={18} className='mau-khu' /> {t('Gian hàng trong khu', 'Stores in this zone', '本区店铺')}
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {gians.map(g => (
                    <Link key={g.id} href={`/gian/${g.id}`} className='flex gap-3.5 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group'>
                        <Anh src={g.logo} alt={g.tenGian} className='size-14 rounded-xl object-cover ring-1 ring-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-300' />
                        <div className='min-w-0 flex-1'>
                            <div className='flex items-center gap-2 flex-wrap'>
                                <p className='font-semibold text-slate-800 truncate'>{g.tenGian}</p>
                                {g.soDanhGia > 0 && (
                                    <span className='inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0'>
                                        <Star size={11} className='fill-amber-400 text-amber-400' />
                                        {g.trungBinhSao} <span className='font-normal text-amber-500/80'>({g.soDanhGia})</span>
                                    </span>
                                )}
                            </div>
                            <p className='text-xs text-slate-500 mt-0.5'>{t('Chủ gian:', 'Owner:', '店主：')} {g.tenChu}</p>
                            <p className='text-xs text-slate-600 mt-1.5 line-clamp-2'>{g.moTa}</p>
                            <span className='mau-khu inline-flex items-center gap-1.5 text-xs font-semibold mt-2 group-hover:gap-2.5 transition-all'>
                                <Phone size={12} /> {g.soDienThoai} · {t('Vào gian', 'Visit store', '进店')} <ArrowRight size={12} />
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}

export default GianHangDaDuyet
