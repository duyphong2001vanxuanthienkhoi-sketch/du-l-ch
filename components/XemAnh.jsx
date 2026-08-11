'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from 'lucide-react'
import Anh from '@/components/Anh'

// Lightbox xem ảnh toàn màn hình (kiểu Shopee).
// LƯU Ý QUAN TRỌNG: app khoá pinch-zoom của trình duyệt (app/layout.jsx đặt
// userScalable:false để dùng như app native). Vì vậy phải TỰ làm phóng to & kéo ảnh
// bằng JS, không thể trông chờ zoom sẵn của trình duyệt.
//  - Điện thoại: chụm 2 ngón để phóng, 1 ngón kéo ảnh khi đang phóng, chạm 2 lần để phóng nhanh
//  - Máy tính: nút +/−, lăn chuột để phóng, kéo chuột để di ảnh
//  - Chưa phóng thì vuốt ngang = chuyển ảnh; đang phóng thì vuốt = kéo ảnh (không nhảy ảnh)
//  - Đóng: nút ✕, phím Esc, bấm ra nền (chỉ khi chưa phóng)

const PHONG_TOI_DA = 4
const PHONG_TOI_THIEU = 1

export default function XemAnh({ anhs = [], chiSo = 0, ten = '', onDong }) {
    const [i, setI] = useState(chiSo)
    const [phong, setPhong] = useState(1)          // mức phóng hiện tại
    const [dich, setDich] = useState({ x: 0, y: 0 }) // độ dịch ảnh khi kéo
    const khungRef = useRef(null)
    const keo = useRef(null)      // trạng thái đang kéo (chuột/1 ngón)
    const chum = useRef(null)     // trạng thái đang chụm 2 ngón
    const chamCuoi = useRef(0)    // mốc thời gian để nhận "chạm 2 lần"

    const nhieuAnh = anhs.length > 1
    const dangPhong = phong > 1

    // Đưa ảnh về mặc định (dùng khi đổi ảnh hoặc bấm nút hoàn tác)
    const datLai = useCallback(() => { setPhong(1); setDich({ x: 0, y: 0 }) }, [])

    const truoc = useCallback(() => { setI(v => (v - 1 + anhs.length) % anhs.length); datLai() }, [anhs.length, datLai])
    const sau = useCallback(() => { setI(v => (v + 1) % anhs.length); datLai() }, [anhs.length, datLai])

    // Giới hạn độ dịch để ảnh không bị kéo văng ra ngoài khung
    const gioiHan = useCallback((d, mucPhong) => {
        const k = khungRef.current?.getBoundingClientRect()
        if (!k) return d
        const toiDaX = (k.width * (mucPhong - 1)) / 2
        const toiDaY = (k.height * (mucPhong - 1)) / 2
        return {
            x: Math.max(-toiDaX, Math.min(toiDaX, d.x)),
            y: Math.max(-toiDaY, Math.min(toiDaY, d.y)),
        }
    }, [])

    const doiPhong = useCallback((mucMoi) => {
        const m = Math.max(PHONG_TOI_THIEU, Math.min(PHONG_TOI_DA, mucMoi))
        setPhong(m)
        if (m === 1) setDich({ x: 0, y: 0 })
        else setDich(d => gioiHan(d, m))
    }, [gioiHan])

    // Phím tắt: Esc đóng, ←/→ chuyển ảnh, +/− phóng
    useEffect(() => {
        const phim = (e) => {
            if (e.key === 'Escape') onDong?.()
            else if (e.key === 'ArrowLeft' && nhieuAnh) truoc()
            else if (e.key === 'ArrowRight' && nhieuAnh) sau()
            else if (e.key === '+' || e.key === '=') doiPhong(phong + .5)
            else if (e.key === '-') doiPhong(phong - .5)
        }
        window.addEventListener('keydown', phim)
        return () => window.removeEventListener('keydown', phim)
    }, [onDong, truoc, sau, nhieuAnh, doiPhong, phong])

    // Khóa cuộn trang nền khi lightbox đang mở
    useEffect(() => {
        const cu = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = cu }
    }, [])

    const khoangCach = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)

    const batDauCham = (e) => {
        if (e.touches.length === 2) {
            // Chụm 2 ngón — ghi lại khoảng cách & mức phóng lúc bắt đầu
            chum.current = { d0: khoangCach(e.touches), phong0: phong }
            keo.current = null
        } else if (e.touches.length === 1) {
            const t = e.touches[0]
            keo.current = { x0: t.clientX, y0: t.clientY, dich0: { ...dich }, daDi: false }
            // Chạm 2 lần nhanh (dưới 300ms) = phóng nhanh / thu về
            const gio = Date.now()
            if (gio - chamCuoi.current < 300) doiPhong(dangPhong ? 1 : 2.5)
            chamCuoi.current = gio
        }
    }

    const dangCham = (e) => {
        if (chum.current && e.touches.length === 2) {
            const ti = khoangCach(e.touches) / chum.current.d0
            doiPhong(chum.current.phong0 * ti)
        } else if (keo.current && e.touches.length === 1 && dangPhong) {
            // Đang phóng → 1 ngón để KÉO ảnh (không chuyển ảnh)
            const t = e.touches[0]
            const dx = t.clientX - keo.current.x0
            const dy = t.clientY - keo.current.y0
            keo.current.daDi = true
            setDich(gioiHan({ x: keo.current.dich0.x + dx, y: keo.current.dich0.y + dy }, phong))
        }
    }

    const ketThucCham = (e) => {
        // Chưa phóng + vuốt ngang đủ mạnh → chuyển ảnh
        if (!dangPhong && keo.current && nhieuAnh && e.changedTouches.length) {
            const dx = e.changedTouches[0].clientX - keo.current.x0
            if (dx > 50) truoc()
            else if (dx < -50) sau()
        }
        chum.current = null
        keo.current = null
    }

    // Máy tính: kéo chuột để di ảnh khi đang phóng
    const batDauChuot = (e) => {
        if (!dangPhong) return
        e.preventDefault()
        keo.current = { x0: e.clientX, y0: e.clientY, dich0: { ...dich } }
    }
    const diChuot = (e) => {
        if (!keo.current || !dangPhong) return
        setDich(gioiHan({ x: keo.current.dich0.x + (e.clientX - keo.current.x0), y: keo.current.dich0.y + (e.clientY - keo.current.y0) }, phong))
    }
    const thaChuot = () => { keo.current = null }

    // Lăn chuột để phóng (giữ nguyên hành vi quen thuộc trên máy tính)
    const lanChuot = (e) => { e.preventDefault(); doiPhong(phong + (e.deltaY < 0 ? .3 : -.3)) }

    return (
        <div role='dialog' aria-modal='true' aria-label={ten}
            onClick={() => { if (!dangPhong) onDong?.() }}
            className='fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4'>

            {/* Nút đóng */}
            <button onClick={onDong} aria-label='Đóng'
                className='absolute top-4 right-4 z-20 flex items-center justify-center size-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition'>
                <X size={20} />
            </button>

            {/* Số thứ tự ảnh */}
            {nhieuAnh && (
                <span className='absolute top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-white/70 so-tien'>
                    {i + 1} / {anhs.length}
                </span>
            )}

            {/* Khung ảnh — nơi bắt cử chỉ chụm/kéo */}
            <div ref={khungRef}
                className='relative flex items-center justify-center max-w-5xl w-full flex-1 overflow-hidden touch-none select-none'
                onClick={e => e.stopPropagation()}
                onTouchStart={batDauCham} onTouchMove={dangCham} onTouchEnd={ketThucCham}
                onMouseDown={batDauChuot} onMouseMove={diChuot} onMouseUp={thaChuot} onMouseLeave={thaChuot}
                onWheel={lanChuot}
                style={{ cursor: dangPhong ? 'grab' : 'zoom-in' }}>

                {nhieuAnh && !dangPhong && (
                    <button onClick={truoc} aria-label='Ảnh trước'
                        className='absolute left-0 sm:-left-14 z-10 flex items-center justify-center size-11 rounded-full bg-white/10 hover:bg-white/20 text-white transition'>
                        <ChevronLeft size={22} />
                    </button>
                )}

                <Anh src={anhs[i]} alt={`${ten} ${i + 1}`} fade={false} uuTien
                    draggable={false}
                    className='max-h-[72vh] max-w-full w-auto object-contain rounded-2xl select-none'
                    style={{
                        transform: `translate(${dich.x}px, ${dich.y}px) scale(${phong})`,
                        transition: keo.current || chum.current ? 'none' : 'transform .18s ease-out',
                    }} />

                {nhieuAnh && !dangPhong && (
                    <button onClick={sau} aria-label='Ảnh sau'
                        className='absolute right-0 sm:-right-14 z-10 flex items-center justify-center size-11 rounded-full bg-white/10 hover:bg-white/20 text-white transition'>
                        <ChevronRight size={22} />
                    </button>
                )}
            </div>

            {/* Thanh điều khiển phóng to */}
            <div className='flex items-center gap-2 mt-3 shrink-0' onClick={e => e.stopPropagation()}>
                <button onClick={() => doiPhong(phong - .5)} disabled={phong <= PHONG_TOI_THIEU} aria-label='Thu nhỏ'
                    className='flex items-center justify-center size-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-30'>
                    <Minus size={18} />
                </button>
                <span className='text-xs font-medium text-white/70 w-12 text-center so-tien'>{Math.round(phong * 100)}%</span>
                <button onClick={() => doiPhong(phong + .5)} disabled={phong >= PHONG_TOI_DA} aria-label='Phóng to'
                    className='flex items-center justify-center size-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-30'>
                    <Plus size={18} />
                </button>
                {dangPhong && (
                    <button onClick={datLai} aria-label='Về mặc định'
                        className='flex items-center justify-center size-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition'>
                        <RotateCcw size={16} />
                    </button>
                )}
            </div>

            {/* Gợi ý thao tác (chỉ hiện khi chưa phóng) */}
            {!dangPhong && (
                <p className='text-ti text-white/45 mt-2 text-center shrink-0'>
                    <span className='sm:hidden'>Chụm 2 ngón hoặc chạm 2 lần để phóng to{nhieuAnh ? ' · vuốt ngang để đổi ảnh' : ''}</span>
                    <span className='max-sm:hidden'>Lăn chuột hoặc bấm + để phóng to{nhieuAnh ? ' · dùng phím ← → để đổi ảnh' : ''}</span>
                </p>
            )}

            {/* Dải ảnh nhỏ — ẩn khi đang phóng cho đỡ vướng */}
            {nhieuAnh && !dangPhong && (
                <div className='flex gap-2 mt-3 flex-wrap justify-center shrink-0' onClick={e => e.stopPropagation()}>
                    {anhs.map((a, k) => (
                        <button key={k} onClick={() => { setI(k); datLai() }} aria-label={`Xem ảnh ${k + 1}`}
                            className={`size-14 rounded-lg overflow-hidden transition ${k === i ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-90'}`}>
                            <Anh src={a} alt='' fade={false} className='w-full h-full object-cover' />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
