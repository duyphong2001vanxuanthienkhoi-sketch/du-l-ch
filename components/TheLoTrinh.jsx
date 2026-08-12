'use client'
import Link from 'next/link'
import { ArrowRight, Clock, MapPin } from 'lucide-react'
import Anh from '@/components/Anh'
import AnhDiaDiem from '@/components/AnhDiaDiem'
import { useNgonNgu } from '@/lib/i18n'

// THẺ LỘ TRÌNH / BỘ SƯU TẬP — dùng chung cho trang chủ và trang /lo-trinh.
//
// Trước đây trang chủ có thẻ riêng chỉ emoji trên nền pastel, còn /lo-trinh mới có ảnh.
// Hai kiểu khác nhau cho cùng một thứ trông thiếu chỉn chu, mà bản chỉ-emoji nằm ngay
// trên lưới ảnh thật ở trang chủ nên càng lộ. Nay dùng chung một thẻ, đều có ảnh.

// Ảnh bìa: ưu tiên ảnh tự đặt; chưa có thì MƯỢN ảnh của điểm dừng ĐẦU TIÊN —
// lộ trình nào cũng có ít nhất một điểm, nên gần như luôn có ảnh thật để hiện.
const Bia = ({ lt, diemDau, className }) => {
    const mau = lt.mau || '#7c3aed'
    const nen = (
        <span className='flex items-center justify-center w-full h-full text-5xl'
            style={{ background: `linear-gradient(135deg, ${mau}22, ${mau}66)` }}>
            {lt.icon || '🗺️'}
        </span>
    )
    if (lt.anhBia) return <Anh src={lt.anhBia} alt='' className={className} />
    if (diemDau) {
        return (
            <span className={`block overflow-hidden ${className}`}>
                <AnhDiaDiem id={diemDau.id} alt='' className='w-full h-full object-cover' fallback={nen} />
            </span>
        )
    }
    return <span className={`block overflow-hidden ${className}`}>{nen}</span>
}

export default function TheLoTrinh({ lt, ds = [], kieu = 'luoi' }) {
    const { t } = useNgonNgu()
    const mau = lt.mau || '#7c3aed'
    const diemDau = ds.find(x => x.id === lt.diem?.[0]?.diaDiemId) || null
    const soDiem = lt.diem?.length || 0

    return (
        // 'dai' = thẻ trong dải cuộn ngang (điện thoại). lg:w-auto để khi bố cục đổi
        // sang lưới ở khổ máy tính thì thẻ giãn vừa ô, không bị ghim cứng 288px.
        <Link href={`/lo-trinh/${lt.id}`}
            className={`the-dd group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${kieu === 'dai' ? 'w-72 shrink-0 lg:w-auto' : ''}`}>
            <div className='relative'>
                <Bia lt={lt} diemDau={diemDau}
                    className='w-full aspect-[16/9] object-cover group-hover:scale-[1.03] transition-transform duration-500' />
                <span className='absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1 rounded-full text-white backdrop-blur-sm'
                    style={{ backgroundColor: mau + 'e6' }}>
                    {lt.icon} {lt.kieu === 'bo_suu_tap'
                        ? t('Bộ sưu tập', 'Collection', '专题')
                        : t('Lộ trình', 'Itinerary', '行程')}
                </span>
            </div>
            <div className='p-4 flex flex-col flex-1'>
                <h3 className='font-bold text-slate-800 can-dong'>{t(...lt.ten)}</h3>
                <div className='flex items-center gap-x-3 gap-y-1 flex-wrap text-xs text-slate-500 mt-1.5'>
                    <span className='flex items-center gap-1'>
                        <MapPin size={12} /> {t(`${soDiem} điểm`, `${soDiem} stops`, `${soDiem} 站`)}
                    </span>
                    {t(...(lt.thoiLuong || [])) && (
                        <span className='flex items-center gap-1'><Clock size={12} /> {t(...lt.thoiLuong)}</span>
                    )}
                </div>
                <p className='text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed'>{t(...lt.mota)}</p>
                <span className='inline-flex items-center gap-1.5 text-sm font-semibold mt-3 group-hover:gap-2.5 transition-all' style={{ color: mau }}>
                    {t('Xem chi tiết', 'View details', '查看详情')} <ArrowRight size={14} />
                </span>
            </div>
        </Link>
    )
}
