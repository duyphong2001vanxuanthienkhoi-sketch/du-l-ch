'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, X } from 'lucide-react'
import { useNgonNgu } from '@/lib/i18n'
import { useBuoi } from '@/components/CanhVinhHaLong'

// "Nhịp thuỷ triều": dải trên cùng đổi tông theo BUỔI trong ngày (useBuoi) —
// sáng ngọc tươi, chiều ngọc-xanh biển, hoàng hôn hổ phách, đêm navy.
// Cả app "thở" cùng vịnh Hạ Long thay vì một màu cố định quanh năm.
//
// NỘI DUNG: trước đây là mã giảm giá lấy từ /api/coupons — API đó đã xoá cùng phần
// thương mại ở giai đoạn 3, nên dải này luôn rỗng và không bao giờ hiện. Nay nó làm
// đúng việc của một app du lịch: đếm ngược tới LỄ HỘI gần nhất. Đây là thứ khiến
// khách đổi lịch đi chơi — đáng nằm ở dòng trên cùng.
const NEN_BUOI = {
    sang: { nen: 'linear-gradient(90deg, #0e7490, #00A8A8, #00A8A8)', chu: '#00838a' },
    chieu: { nen: 'linear-gradient(90deg, #007070, #008F8F, #00A8A8)', chu: '#007070' },
    hoangHon: { nen: 'linear-gradient(90deg, #9a3412, #b45309, #9f1239)', chu: '#9a3412' },
    toi: { nen: 'linear-gradient(90deg, #08243C, #0B2F4F, #134e4a)', chu: '#0B2F4F' },
}

// Số ngày tới lần diễn ra gần nhất. Lễ hội ÂM LỊCH trả null — app không tự quy đổi
// âm sang dương (quy đổi sai còn tệ hơn không có), nên không đếm ngược được.
function conBaoNhieuNgay(sk) {
    if (sk.amLich || !sk.batDau) return null
    const homNay = new Date()
    homNay.setHours(0, 0, 0, 0)

    const [y, m, d] = sk.batDau.split('-').map(Number)
    let moc = new Date(y, m - 1, d)
    if (sk.hangNam) {
        moc = new Date(homNay.getFullYear(), m - 1, d)
        const ket = sk.ketThuc ? Number(sk.ketThuc.split('-')[2]) : d
        if (new Date(homNay.getFullYear(), m - 1, ket) < homNay) {
            moc = new Date(homNay.getFullYear() + 1, m - 1, d)
        }
    }
    return Math.round((moc - homNay) / 86400000)
}

export default function Banner() {
    const { t } = useNgonNgu()
    const [dong, setDong] = useState(false)
    const [sk, setSk] = useState(null)
    const [con, setCon] = useState(null)
    const buoi = useBuoi()
    const tong = NEN_BUOI[buoi] || NEN_BUOI.chieu

    useEffect(() => {
        fetch('/api/su-kien')
            .then(r => r.json())
            .then(d => {
                // Lấy lễ hội dương lịch gần nhất còn chưa diễn ra
                const ds = (d.suKiens || [])
                    .map(x => ({ x, con: conBaoNhieuNgay(x) }))
                    .filter(o => o.con != null && o.con >= 0)
                    .sort((a, b) => a.con - b.con)
                if (ds.length) { setSk(ds[0].x); setCon(ds[0].con) }
            })
            .catch(() => { })
    }, [])

    if (dong || !sk) return null

    const nhan = con === 0
        ? t('Diễn ra hôm nay', 'Happening today', '今天举行')
        : con === 1
            ? t('Ngày mai', 'Tomorrow', '明天')
            : t(`Còn ${con} ngày`, `In ${con} days`, `还有 ${con} 天`)

    return (
        <div className='relative text-white text-sm' style={{ background: tong.nen }}>
            <div className='max-w-7xl mx-auto flex items-center justify-center gap-3 px-10 py-2'>
                <CalendarDays size={15} className='shrink-0 max-sm:hidden' />
                <p className='truncate'>
                    <span className='font-semibold'>{sk.icon} {t(...sk.ten)}</span>
                    <span className='text-white/70 max-sm:hidden'> · {t(...sk.ghiChuNgay)}</span>
                </p>
                {/* Nền TRẮNG đặt inline chứ không dùng class `bg-white`: ở chế độ tối,
                    remap đổi `bg-white` thành navy, thành ra chữ navy trên nền navy — mất chữ. */}
                <Link href='/su-kien'
                    className='shrink-0 whitespace-nowrap font-bold text-xs px-3 py-1 rounded-full hover:opacity-90 transition'
                    style={{ backgroundColor: '#ffffff', color: tong.chu }}>
                    {nhan}
                </Link>
            </div>
            <button onClick={() => setDong(true)} aria-label={t('Đóng', 'Close', '关闭')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition'>
                <X size={16} />
            </button>
        </div>
    )
}
