'use client'
import { useEffect, useState } from 'react'

// Cảnh vịnh Hạ Long vẽ thuần SVG (không cần ảnh) — dùng CHUNG cho Hero (máy tính)
// và banner đầu trang chủ (điện thoại). Núi đá vôi 2 lớp, chim biển, sóng trôi chậm;
// nền trời đổi màu theo buổi trong ngày (sáng / trưa-chiều / hoàng hôn / tối).

// Bảng màu cảnh vịnh theo giờ — nền đủ đậm để chữ trắng luôn dễ đọc
export const BANG_MAU_VINH = {
    sang: { nen: 'linear-gradient(180deg, #0e7490 0%, #047857 55%, #065f46 100%)', vatTroi: 'sun', mauVatTroi: '#fde68a' },
    chieu: { nen: 'linear-gradient(180deg, #0369a1 0%, #0b7a68 60%, #065f46 100%)', vatTroi: 'sun', mauVatTroi: '#fef3c7' },
    hoangHon: { nen: 'linear-gradient(180deg, #b45309 0%, #92400e 40%, #14532d 100%)', vatTroi: 'sun', mauVatTroi: '#fdba74' },
    toi: { nen: 'linear-gradient(180deg, #0c4a6e 0%, #134e4a 60%, #052e2b 100%)', vatTroi: 'moon', mauVatTroi: '#e2e8f0' },
}

export function buoiHienTai() {
    const h = new Date().getHours()
    if (h >= 5 && h < 11) return 'sang'
    if (h >= 11 && h < 17) return 'chieu'
    if (h >= 17 && h < 19) return 'hoangHon'
    return 'toi'
}

// Hook: buổi trong ngày tính theo giờ CLIENT. Mặc định 'chieu' khi render lần đầu để
// giờ máy chủ khác múi giờ người xem không gây lệch nội dung (hydration mismatch).
export function useBuoi() {
    const [buoi, setBuoi] = useState('chieu')
    useEffect(() => setBuoi(buoiHienTai()), [])
    return buoi
}

// Lớp trang trí đáy panel (SVG absolute, không chặn chuột).
// cao: chiều cao lớp cảnh so với panel (bản mobile gọn hơn nên để cao hơn %).
export default function CanhVinhHaLong({ buoi = 'chieu', cao = '72%' }) {
    const b = BANG_MAU_VINH[buoi] || BANG_MAU_VINH.chieu
    return (
        <svg aria-hidden='true' viewBox='0 0 800 260' preserveAspectRatio='xMidYMax slice'
            className='absolute inset-x-0 bottom-0 w-full pointer-events-none' style={{ height: cao }}>
            {/* Mặt trời / trăng */}
            {b.vatTroi === 'sun' ? (
                <g>
                    <circle cx='636' cy='64' r='46' fill={b.mauVatTroi} opacity='.14' />
                    <circle cx='636' cy='64' r='27' fill={b.mauVatTroi} opacity='.9' />
                </g>
            ) : (
                <g>
                    <circle cx='636' cy='60' r='24' fill={b.mauVatTroi} opacity='.9' />
                    <circle cx='646' cy='53' r='20' fill='#0c4a6e' />
                    {/* Vài ngôi sao đêm */}
                    <circle cx='520' cy='38' r='1.8' fill='#e2e8f0' opacity='.8' />
                    <circle cx='568' cy='84' r='1.4' fill='#e2e8f0' opacity='.6' />
                    <circle cx='710' cy='40' r='1.6' fill='#e2e8f0' opacity='.7' />
                    <circle cx='748' cy='96' r='1.3' fill='#e2e8f0' opacity='.55' />
                    <circle cx='476' cy='70' r='1.3' fill='#e2e8f0' opacity='.5' />
                </g>
            )}

            {/* Núi đá vôi — lớp xa mờ, lớp gần đậm (bóng đen mờ nên hợp mọi nền) */}
            <path d='M-20 210 C30 120 90 118 130 200 C162 140 212 134 246 205 C276 152 332 148 366 208 C402 128 472 124 506 205 C540 158 592 156 626 210 C656 168 702 166 736 212 C762 184 792 182 820 212 L820 260 L-20 260 Z'
                fill='#000000' opacity='.16' />
            <path d='M-20 236 C42 168 112 166 162 232 C202 184 262 181 306 235 C352 190 422 187 466 236 C506 199 572 197 616 238 C656 204 722 201 766 240 L820 244 L820 260 L-20 260 Z'
                fill='#000000' opacity='.26' />

            {/* Chim biển thấp thoáng */}
            <g className='hero-thuyen' stroke='#ffffff' strokeWidth='2' fill='none' strokeLinecap='round' opacity='.5'>
                <path d='M392 150 q7 -6 14 0 q7 -6 14 0' />
                <path d='M430 138 q5 -4 10 0 q5 -4 10 0' />
            </g>

            {/* Sóng trôi chậm 2 lớp (vẽ dư bề ngang để lặp liền mạch) */}
            <g className='hero-song'>
                <path d='M-140 226 q30 -9 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0'
                    stroke='#ffffff' strokeWidth='3' fill='none' strokeLinecap='round' opacity='.13' />
            </g>
            <g className='hero-song-cham'>
                <path d='M-140 243 q30 -7 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0'
                    stroke='#ffffff' strokeWidth='3' fill='none' strokeLinecap='round' opacity='.2' />
            </g>
        </svg>
    )
}
