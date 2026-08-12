'use client'
import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { LocateFixed, Navigation, X } from 'lucide-react'
import ChipLoaiHinh from '@/components/ChipLoaiHinh'
import TheDiaDiem from '@/components/TheDiaDiem'
import Loading from '@/components/Loading'
import { useNgonNgu } from '@/lib/i18n'
import { khoangCachKm, linkChiDuong } from '@/lib/diaDiemLoai'
import { useDiaDiem } from '@/lib/utils/diaDiemClient'

const BanDo = dynamic(() => import('@/components/BanDo'), {
    ssr: false,
    loading: () => <div className='w-full h-full bg-slate-100 animate-pulse' />,
})

// BẢN ĐỒ TOÀN MÀN HÌNH — trái tim của app du lịch.
// Bấm ghim -> thẻ trượt lên từ đáy (bottom sheet) với ảnh, tên, khoảng cách, nút chỉ đường.
export default function TrangBanDo() {
    const { t } = useNgonNgu()
    const { ds, dangTai } = useDiaDiem()
    const [loai, setLoai] = useState('')
    const [chon, setChon] = useState(null)
    const [viTriToi, setViTriToi] = useState(null)

    // Trang này chiếm trọn màn hình nên tạm giấu thanh cuộn của trang
    useEffect(() => {
        const cu = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = cu }
    }, [])

    // ĐO chiều cao thanh trên thay vì đoán bằng `top-16`: Navbar cao khác nhau tuỳ khổ máy
    // (điện thoại có thêm hàng ô tìm bên dưới nên cao ~127px, máy tính chỉ ~73px).
    // Đoán sai thì bản đồ chui lên dưới header hoặc chừa một dải trắng.
    const [caoDau, setCaoDau] = useState(64)
    useEffect(() => {
        const do_ = () => {
            const nav = document.querySelector('nav:not([class*="fixed"])')
            if (nav) setCaoDau(nav.getBoundingClientRect().height)
        }
        do_()
        window.addEventListener('resize', do_)
        return () => window.removeEventListener('resize', do_)
    }, [])

    const viTri = () => {
        if (!navigator.geolocation) return
        navigator.geolocation.getCurrentPosition(
            p => setViTriToi([p.coords.latitude, p.coords.longitude]),
            () => { /* khách từ chối thì thôi */ },
        )
    }

    const dem = useMemo(() => {
        const kq = {}
        for (const d of ds) kq[d.loai] = (kq[d.loai] || 0) + 1
        return kq
    }, [ds])

    const hien = useMemo(
        () => ds.filter(d => Array.isArray(d.viTri) && (!loai || d.loai === loai)),
        [ds, loai],
    )

    const dChon = hien.find(d => d.id === chon) || null
    const km = dChon && viTriToi ? khoangCachKm(viTriToi, dChon.viTri) : null

    if (dangTai) return <Loading />

    return (
        // Chừa chỗ cho thanh dưới (lg:hidden) — inset-0 sẽ bị thanh đó che mất mép dưới
        <div className='fixed inset-x-0 bottom-[68px] lg:bottom-0 z-0' style={{ top: caoDau }}>
            <BanDo ds={hien} chon={chon} onChon={setChon} viTriToi={viTriToi} cao='h-full' />

            {/* Chip loại hình nổi trên bản đồ */}
            <div className='absolute top-3 inset-x-0 px-3 z-[500]'>
                <ChipLoaiHinh chon={loai} onChon={(v) => { setLoai(v); setChon(null) }} dem={dem} />
            </div>

            {/* Nút về vị trí tôi */}
            <button onClick={viTri}
                className={`absolute right-3 bottom-3 z-[500] flex items-center justify-center size-12 rounded-full shadow-lg transition active:scale-90 ${viTriToi ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
                aria-label={t('Về vị trí của tôi', 'My location', '我的位置')}>
                <LocateFixed size={20} />
            </button>

            {/* Thẻ trượt lên từ đáy khi chọn một ghim */}
            {dChon && (
                <div className='absolute inset-x-0 bottom-0 z-[600] p-3 animate-in slide-in-from-bottom duration-300'>
                    <div className='relative max-w-lg mx-auto'>
                        <button onClick={() => setChon(null)} aria-label={t('Đóng', 'Close', '关闭')}
                            className='absolute -top-2 -right-2 z-10 flex items-center justify-center size-8 rounded-full bg-slate-800 text-white shadow-lg'>
                            <X size={16} />
                        </button>
                        <TheDiaDiem d={dChon} kieu='ngang' khoangCach={km} />
                        <a href={linkChiDuong(dChon.ten)} target='_blank' rel='noopener noreferrer'
                            className='flex items-center justify-center gap-2 w-full mt-2 py-3 rounded-2xl text-white text-sm font-semibold shadow-lg active:scale-95 transition'
                            style={{ backgroundColor: dChon.mau || '#0284c7' }}>
                            <Navigation size={15} /> {t('Chỉ đường', 'Directions', '路线')}
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
}
