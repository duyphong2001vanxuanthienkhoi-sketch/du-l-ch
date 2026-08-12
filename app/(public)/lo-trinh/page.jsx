'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, MapPin, Route } from 'lucide-react'
import Anh from '@/components/Anh'
import AnhDiaDiem from '@/components/AnhDiaDiem'
import Loading from '@/components/Loading'
import TrangRong from '@/components/TrangRong'
import { useNgonNgu } from '@/lib/i18n'
import { useDiaDiem } from '@/lib/utils/diaDiemClient'

// LỘ TRÌNH GỢI Ý & BỘ SƯU TẬP — thứ Google Maps không có, và là lý do chính
// để du khách mở app này thay vì tra bản đồ.

// Ảnh bìa lộ trình: ưu tiên ảnh tự đặt, không có thì mượn ảnh của điểm ĐẦU TIÊN
const BiaLoTrinh = ({ lt, diemDau, className }) => {
    const mau = lt.mau || '#0284c7'
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

const The = ({ lt, ds }) => {
    const { t } = useNgonNgu()
    const mau = lt.mau || '#0284c7'
    const diemDau = ds.find(x => x.id === lt.diem?.[0]?.diaDiemId) || null

    return (
        <Link href={`/lo-trinh/${lt.id}`}
            className='the-dd group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300'>
            <div className='relative'>
                <BiaLoTrinh lt={lt} diemDau={diemDau}
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
                        <MapPin size={12} /> {t(`${lt.diem?.length || 0} điểm`, `${lt.diem?.length || 0} stops`, `${lt.diem?.length || 0} 站`)}
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

export default function TrangLoTrinh() {
    const { t } = useNgonNgu()
    const { ds } = useDiaDiem()
    const [lts, setLts] = useState([])
    const [dangTai, setDangTai] = useState(true)

    useEffect(() => {
        fetch('/api/lo-trinh')
            .then(r => r.json())
            .then(d => setLts(d.loTrinhs || []))
            .catch(() => { })
            .finally(() => setDangTai(false))
    }, [])

    if (dangTai) return <Loading />

    const loTrinh = lts.filter(x => x.kieu !== 'bo_suu_tap')
    const boSuuTap = lts.filter(x => x.kieu === 'bo_suu_tap')

    return (
        <div className='min-h-[70vh] mb-28 max-w-6xl mx-auto px-5 pt-6'>
            <h1 className='text-3xl sm:text-4xl chu-hien-thi text-slate-800'>
                {t('Đi đâu, theo thứ tự nào', 'Where to go, in what order', '去哪儿、按什么顺序')}
            </h1>
            <p className='text-slate-500 mt-1.5 text-sm sm:text-base max-w-2xl'>
                {t('Lộ trình gợi ý theo giờ và bộ sưu tập theo chủ đề — dựng sẵn để bạn khỏi phải tự sắp.',
                    'Hour-by-hour itineraries and themed collections — planned so you don\'t have to.',
                    '按时段编排的行程与主题专题 —— 已为你安排妥当。')}
            </p>

            {!lts.length ? (
                <TrangRong Icon={Route} mau='#7c3aed'
                    tieuDe={t('Chưa có lộ trình nào', 'No itineraries yet', '还没有行程')}
                    moTa={t('Quản trị viên chạy: npm run nap-lo-trinh', 'An administrator can seed them.', '管理员可载入数据。')}
                    nutText={t('Khám phá địa điểm', 'Explore places', '探索地点')} nutHref='/kham-pha' />
            ) : (
                <>
                    {loTrinh.length > 0 && (
                        <section className='mt-8'>
                            <h2 className='text-xl font-bold text-slate-800 mb-4'>
                                {t('Lộ trình gợi ý', 'Suggested itineraries', '推荐行程')}
                            </h2>
                            <div className='luoi-dd grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                                {loTrinh.map(lt => <The key={lt.id} lt={lt} ds={ds} />)}
                            </div>
                        </section>
                    )}

                    {boSuuTap.length > 0 && (
                        <section className='mt-12'>
                            <h2 className='text-xl font-bold text-slate-800 mb-1'>
                                {t('Bộ sưu tập theo chủ đề', 'Themed collections', '主题专题')}
                            </h2>
                            <p className='text-sm text-slate-500 mb-4'>
                                {t('Không theo giờ giấc — chỉ là những nơi hợp nhau một chủ đề.',
                                    'No schedule — just places that go together.',
                                    '不按时间 —— 只是同一主题下的地点。')}
                            </p>
                            <div className='luoi-dd grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                                {boSuuTap.map(lt => <The key={lt.id} lt={lt} ds={ds} />)}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    )
}
