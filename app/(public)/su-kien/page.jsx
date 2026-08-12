'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarDays, MapPin, PartyPopper } from 'lucide-react'
import Anh from '@/components/Anh'
import AnhDiaDiem from '@/components/AnhDiaDiem'
import Loading from '@/components/Loading'
import TrangRong from '@/components/TrangRong'
import { useNgonNgu } from '@/lib/i18n'
import { taiDiaDiem } from '@/lib/utils/diaDiemClient'

// SỰ KIỆN & LỄ HỘI — thông tin du khách không tra được ở đâu khác.
//
// ĐẾM NGƯỢC chỉ áp dụng cho lễ hội theo DƯƠNG LỊCH. Lễ hội âm lịch (vd hội chùa
// Long Tiên 24/3 âm lịch) thì app KHÔNG tự quy đổi — quy đổi sai còn tệ hơn không có —
// mà hiện đúng câu chữ đã ghi ở `ghiChuNgay`.

// Số ngày còn lại tới lần diễn ra gần nhất. Sự kiện hằng năm đã qua thì nhảy sang năm sau.
function conBaoNhieuNgay(sk) {
    if (sk.amLich || !sk.batDau) return null
    const homNay = new Date()
    homNay.setHours(0, 0, 0, 0)

    const [y, m, d] = sk.batDau.split('-').map(Number)
    let moc = new Date(y, m - 1, d)

    if (sk.hangNam) {
        moc = new Date(homNay.getFullYear(), m - 1, d)
        // Đã qua ngày kết thúc năm nay -> tính sang năm sau
        const ket = sk.ketThuc ? Number(sk.ketThuc.split('-')[2]) : d
        const mocKet = new Date(homNay.getFullYear(), m - 1, ket)
        if (mocKet < homNay) moc = new Date(homNay.getFullYear() + 1, m - 1, d)
    }

    return Math.round((moc - homNay) / 86400000)
}

export default function TrangSuKien() {
    const { t } = useNgonNgu()
    const [sks, setSks] = useState([])
    const [ds, setDs] = useState([])
    const [dangTai, setDangTai] = useState(true)

    useEffect(() => {
        Promise.all([
            fetch('/api/su-kien').then(r => r.json()).catch(() => ({})),
            taiDiaDiem(),
        ]).then(([kq, tatCa]) => {
            setSks(kq.suKiens || [])
            setDs(tatCa || [])
        }).finally(() => setDangTai(false))
    }, [])

    if (dangTai) return <Loading />

    return (
        <div className='min-h-[70vh] mb-28 max-w-5xl mx-auto px-5 pt-6'>
            <h1 className='text-3xl sm:text-4xl chu-hien-thi text-slate-800'>
                {t('Sự kiện & lễ hội', 'Events & festivals', '活动与庙会')}
            </h1>
            <p className='text-slate-500 mt-1.5 text-sm sm:text-base max-w-2xl'>
                {t('Lễ hội của riêng Hồng Gai — canh đúng dịp thì chuyến đi khác hẳn.',
                    'Festivals unique to Hong Gai — timing your trip right changes everything.',
                    '鸿基特有的庙会 —— 赶上日子，旅程大不相同。')}
            </p>

            {!sks.length ? (
                <TrangRong Icon={PartyPopper} mau='#dc2626'
                    tieuDe={t('Chưa có sự kiện nào', 'No events yet', '还没有活动')}
                    moTa={t('Quản trị viên chạy: npm run nap-lo-trinh', 'An administrator can seed them.', '管理员可载入数据。')}
                    nutText={t('Khám phá địa điểm', 'Explore places', '探索地点')} nutHref='/kham-pha' />
            ) : (
                <div className='flex flex-col gap-5 mt-8'>
                    {sks.map(sk => {
                        const mau = sk.mau || '#dc2626'
                        const noi = ds.find(x => x.id === sk.diaDiemId)
                        const con = conBaoNhieuNgay(sk)

                        return (
                            <article key={sk.id} className='the-dd bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm'>
                                <div className='flex max-sm:flex-col'>
                                    {/* Ảnh: mượn ảnh của địa điểm diễn ra nếu sự kiện chưa có ảnh riêng */}
                                    <div className='sm:w-56 shrink-0'>
                                        {sk.anhBia
                                            ? <Anh src={sk.anhBia} alt='' className='w-full h-full max-sm:aspect-[16/9] object-cover' />
                                            : noi
                                                ? <AnhDiaDiem id={noi.id} alt='' className='w-full h-full max-sm:aspect-[16/9] object-cover'
                                                    fallback={<span className='flex items-center justify-center w-full h-full max-sm:aspect-[16/9] text-5xl'
                                                        style={{ background: `linear-gradient(135deg, ${mau}22, ${mau}55)` }}>{sk.icon || '🎏'}</span>} />
                                                : <span className='flex items-center justify-center w-full h-full max-sm:aspect-[16/9] text-5xl'
                                                    style={{ background: `linear-gradient(135deg, ${mau}22, ${mau}55)` }}>{sk.icon || '🎏'}</span>}
                                    </div>

                                    <div className='p-5 flex-1 min-w-0'>
                                        <div className='flex items-start gap-2 flex-wrap'>
                                            <h2 className='text-lg font-bold text-slate-800 can-dong flex-1 min-w-0'>{t(...sk.ten)}</h2>
                                            {con != null && con >= 0 && (
                                                <span className='text-xs font-bold px-3 py-1 rounded-full text-white shrink-0' style={{ backgroundColor: mau }}>
                                                    {con === 0
                                                        ? t('Hôm nay!', 'Today!', '就在今天！')
                                                        : t(`Còn ${con} ngày`, `In ${con} days`, `还有 ${con} 天`)}
                                                </span>
                                            )}
                                        </div>

                                        <p className='flex items-center gap-1.5 text-sm font-semibold mt-2' style={{ color: mau }}>
                                            <CalendarDays size={14} /> {t(...sk.ghiChuNgay)}
                                        </p>
                                        {sk.amLich && (
                                            <p className='text-[11px] text-slate-400 mt-0.5 pl-5'>
                                                {t('Theo âm lịch nên ngày dương thay đổi từng năm',
                                                    'Lunar date — the Gregorian date shifts each year',
                                                    '农历日期 —— 每年对应的公历日期不同')}
                                            </p>
                                        )}

                                        {noi && (
                                            <Link href={`/dia-diem/${noi.id}`}
                                                className='inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mt-1.5'>
                                                <MapPin size={13} /> {t(...noi.ten)} <ArrowRight size={12} />
                                            </Link>
                                        )}

                                        <p className='text-sm text-slate-600 mt-2.5 leading-relaxed'>{t(...sk.mota)}</p>

                                        {sk.noiDung?.length > 0 && (
                                            <div className='flex flex-col gap-2.5 mt-3'>
                                                {sk.noiDung.map((doan, i) => (
                                                    <p key={i} className='text-sm text-slate-500 leading-relaxed'>{t(...doan)}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
