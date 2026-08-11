'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Coins, Crown } from 'lucide-react'
import { formatVND } from '@/lib/utils/currency'
import { tinhTichDiem } from '@/lib/utils/tichDiem'
import { SongChim } from '@/components/HoaTietSong'
import AnhDaiDien from '@/components/AnhDaiDien'
import { useNgonNgu } from '@/lib/i18n'

// Thẻ thành viên — tích điểm THẬT (bean theo tổng chi tiêu + hạng thành viên).
// Dùng chung cho đầu trang chủ (app) và trang tài khoản.
//  - user:      người dùng ĐÃ đăng nhập (bên gọi tự lo trạng thái tải/khách vãng lai)
//  - subtitle:  dòng phụ dưới tên (ví dụ vai trò, hoặc "Thành viên Chợ Số")
//  - size:      'md' (trang chủ) | 'lg' (trang tài khoản)
//  - badgeHref: nếu có, thẻ hạng là liên kết (trang chủ dẫn sang /tai-khoan)
export default function TheThanhVien({ user, subtitle, size = 'md', badgeHref }) {
    const { t } = useNgonNgu()
    const [td, setTd] = useState(null) // { tongChiTieu, soDon } | null (đang tải)

    useEffect(() => {
        let huy = false
        fetch('/api/tich-diem')
            .then(r => r.json())
            .then(d => { if (!huy) setTd(d.tichDiem || { tongChiTieu: 0, soDon: 0 }) })
            .catch(() => { if (!huy) setTd({ tongChiTieu: 0, soDon: 0 }) })
        return () => { huy = true }
    }, [])

    const dangTai = !td
    const { bean, hang, hangKe, phanTram, conThieu, tongChiTieu } = tinhTichDiem(td?.tongChiTieu || 0)

    const lg = size === 'lg'
    const nhat = '#9FE1CB' // xanh nhạt cho chữ phụ trên nền xanh đậm

    const theHang = (
        <span className='flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0'
            style={{ background: 'rgba(255,255,255,.15)' }}>
            {dangTai
                ? <span className='inline-block w-14 h-3 rounded-full animate-pulse' style={{ background: 'rgba(255,255,255,.25)' }} />
                : <><Crown size={13} style={{ color: hang.mau }} /> {t('Hạng ', '', '')}{t(...hang.ten)}{t('', ' tier', '级')}</>}
        </span>
    )

    return (
        <div className='relative overflow-hidden rounded-3xl p-5 text-white' style={{ background: '#085041' }}>
            <SongChim />
            <div className='flex items-center gap-4'>
                <AnhDaiDien src={user.avatar} ten={user.name}
                    khung={`${lg ? 'size-14' : 'size-12'} rounded-2xl bg-white/15`}
                    chu={`${lg ? 'text-2xl' : 'text-xl'} font-bold`} />
                <div className='min-w-0 flex-1'>
                    <p className={`${lg ? 'text-lg ' : ''}font-semibold truncate`}>{user.name}</p>
                    <p className='text-sm truncate' style={{ color: nhat }}>{subtitle}</p>
                </div>
                {badgeHref ? <Link href={badgeHref} className='shrink-0'>{theHang}</Link> : theHang}
            </div>

            {/* Bean tích được */}
            <div className='flex items-center gap-2 mt-4'>
                <Coins size={lg ? 22 : 20} style={{ color: '#F5C543' }} className='shrink-0' />
                {dangTai ? (
                    <span className='inline-block w-28 h-6 rounded-lg animate-pulse' style={{ background: 'rgba(255,255,255,.16)' }} />
                ) : (
                    <p className={`${lg ? 'text-2xl' : 'text-xl'} font-bold leading-none`}>
                        {bean.toLocaleString('vi-VN')}
                        <span className='text-sm font-semibold ml-1' style={{ color: nhat }}>bean</span>
                    </p>
                )}
            </div>
            {!dangTai && (
                <p className='text-xs mt-1.5' style={{ color: nhat }}>{t('Tổng chi tiêu', 'Total spent', '累计消费')} {formatVND(tongChiTieu)}</p>
            )}

            {/* Tiến độ lên hạng */}
            <div className='mt-3'>
                <div className='h-1.5 rounded-full overflow-hidden' style={{ background: 'rgba(255,255,255,.16)' }}>
                    <div className='h-full rounded-full transition-all duration-500'
                        style={{ width: `${dangTai ? 0 : phanTram}%`, background: '#5DCAA5' }} />
                </div>
                <p className='text-xs mt-1.5' style={{ color: nhat }}>
                    {dangTai
                        ? t('Đang tính điểm của bạn…', 'Calculating your points…', '正在计算您的积分…')
                        : hangKe
                            ? <>{t('Còn', 'Spend', '还差')} <span className='font-semibold text-white'>{formatVND(conThieu)}</span> {t('để lên hạng ', 'to reach ', '升到')}{t(...hangKe.ten)}{t('', ' tier', '级')}</>
                            : t('Bạn đang ở hạng cao nhất 🎉', "You're at the highest tier 🎉", '您已是最高等级 🎉')}
                </p>
            </div>
        </div>
    )
}
