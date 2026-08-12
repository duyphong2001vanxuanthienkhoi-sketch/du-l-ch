'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, MapPin, Route } from 'lucide-react'
import TheLoTrinh from '@/components/TheLoTrinh'
import Loading from '@/components/Loading'
import TrangRong from '@/components/TrangRong'
import { useNgonNgu } from '@/lib/i18n'
import { useDiaDiem } from '@/lib/utils/diaDiemClient'

// LỘ TRÌNH GỢI Ý & BỘ SƯU TẬP — thứ Google Maps không có, và là lý do chính
// để du khách mở app này thay vì tra bản đồ.


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
                <TrangRong Icon={Route} mau='#B8923F'
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
                                {loTrinh.map(lt => <TheLoTrinh key={lt.id} lt={lt} ds={ds} />)}
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
                                {boSuuTap.map(lt => <TheLoTrinh key={lt.id} lt={lt} ds={ds} />)}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    )
}
