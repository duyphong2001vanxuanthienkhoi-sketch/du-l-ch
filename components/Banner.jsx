'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { TicketPercent, X } from 'lucide-react'
import { useNgonNgu } from '@/lib/i18n'
import { useBuoi } from '@/components/CanhVinhHaLong'

// "Nhịp thuỷ triều": dải trên cùng đổi tông theo BUỔI trong ngày, cùng đồng hồ với
// cảnh vịnh ở hero (useBuoi) — sáng ngọc tươi, chiều ngọc-xanh biển, hoàng hôn hổ phách,
// đêm navy. Cả app "thở" cùng vịnh Hạ Long thay vì một màu cố định quanh năm.
// Chữ luôn trắng nên mọi tông đều giữ nền đủ đậm để đọc rõ.
const NEN_BUOI = {
    sang: { nen: 'linear-gradient(90deg, #0e7490, #00A8A8, #0284c7)', chu: '#00838a' },
    chieu: { nen: 'linear-gradient(90deg, #007070, #008F8F, #0284c7)', chu: '#007070' },
    hoangHon: { nen: 'linear-gradient(90deg, #9a3412, #b45309, #9f1239)', chu: '#9a3412' },
    toi: { nen: 'linear-gradient(90deg, #0c4a6e, #0B2F4F, #134e4a)', chu: '#0B2F4F' },
}

// Dải ưu đãi trên cùng — lấy MÃ THẬT đang hiệu lực từ /api/coupons
// (trước đây hard-code "NEW20" của template, mã đó không tồn tại trong CSDL).
// Không có mã nào đang chạy thì ẩn hẳn dải, không chiếm chỗ.
export default function Banner() {
    const { t } = useNgonNgu()
    const [dong, setDong] = useState(false)
    const [ma, setMa] = useState(null)
    const buoi = useBuoi()
    const tong = NEN_BUOI[buoi] || NEN_BUOI.chieu

    useEffect(() => {
        fetch('/api/coupons').then(r => r.json()).then(d => setMa((d.coupons || [])[0] || null)).catch(() => { })
    }, [])

    const saoChep = () => {
        navigator.clipboard.writeText(ma.code)
        toast.success(`${t('Đã sao chép mã', 'Copied code', '已复制优惠码')} ${ma.code}!`)
        setDong(true)
    }

    if (dong || !ma) return null

    return (
        <div className="w-full px-6 py-1 font-medium text-sm text-white text-center"
            style={{ background: tong.nen, transition: 'background 1s ease' }}>
            <div className='flex items-center justify-between gap-3 max-w-7xl mx-auto'>
                <p className='flex items-center gap-2 min-w-0 truncate'>
                    <TicketPercent size={16} className='shrink-0' />
                    <span className='truncate'>{ma.moTa} — {t('nhập mã', 'use code', '使用码')} <b>{ma.code}</b></span>
                </p>
                <div className="flex items-center gap-4 shrink-0">
                    <button onClick={saoChep} type="button"
                        className="font-semibold bg-white px-5 py-1.5 my-1 rounded-full text-xs hover:bg-white/90 active:scale-95 transition max-sm:hidden"
                        style={{ color: tong.chu }}>
                        {t('Sao chép mã', 'Copy code', '复制优惠码')}
                    </button>
                    <button onClick={() => setDong(true)} type="button" aria-label={t('Đóng', 'Close', '关闭')} className="p-1.5 rounded-full hover:bg-white/15 transition">
                        <X size={15} />
                    </button>
                </div>
            </div>
        </div>
    )
}
