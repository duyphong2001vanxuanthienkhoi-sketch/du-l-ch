'use client'
import { useEffect, useRef, useState } from 'react'

// Ảnh có ẢNH DỰ PHÒNG khi tải lỗi (link hỏng, ảnh đã bị xóa, mạng chập chờn) —
// thay cho icon "ảnh vỡ" xấu xí của trình duyệt. Dùng y như <img> thường.
// Ảnh dự phòng: con cua 🦀 trên nền kem — hợp chất chợ hải sản, che chỗ trống cho đỡ trơ.
// Khi có ảnh thật tải xong, con cua tự biến mất (component đổi src sang ảnh thật).
const ANH_DU_PHONG =
    'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
        '<rect width="64" height="64" fill="#fff3e0"/>' +
        '<text x="32" y="34" font-size="34" text-anchor="middle" dominant-baseline="central" ' +
        'font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">🦀</text>' +
        '</svg>'
    )

// uuTien: ảnh nằm ngay đầu trang (ảnh chính sản phẩm, logo...) — tải NGAY để trang hiện nhanh.
// Mặc định các ảnh còn lại tải LƯỜI (chỉ tải khi cuộn tới): trang chợ có ~25 thẻ × 2 ảnh,
// nếu tải hết cùng lúc sẽ rất nặng với mạng 3G/4G.
//
// nho + coHienThi: ảnh có SẴN bản 600px thì để trình duyệt tự chọn bản nhẹ khi khung
// hiển thị nhỏ (thẻ sản phẩm rộng ~160px trên điện thoại mà tải ảnh 1400px là thừa gần
// 8 lần chiều ngang). coHienThi là gợi ý bề rộng khung theo cú pháp `sizes` của HTML —
// mặc định hợp với thẻ trong lưới/dải; chỗ nào khung khác hẳn (ảnh to trang chi tiết,
// ảnh vuông 44-72px) thì truyền giá trị riêng, nếu không trình duyệt đoán sai và tải thừa.
export default function Anh({ src, nho, coHienThi = '(max-width: 640px) 45vw, 220px', alt = '', className, fade = true, uuTien = false, style, ...rest }) {
    const [loi, setLoi] = useState(false)
    const [taiXong, setTaiXong] = useState(false)
    const ref = useRef(null)

    // Ảnh có sẵn trong cache: sự kiện load có thể đã bắn TRƯỚC khi React gắn onLoad,
    // nên kiểm tra .complete ngay khi mount để ảnh không bị kẹt opacity:0 (tàng hình).
    useEffect(() => {
        if (ref.current?.complete) setTaiXong(true)
    }, [])

    // `anh-fade`: opacity chuyển mượt 0 -> 1 ĐÚNG lúc ảnh tải xong (onLoad), thay vì fade
    // cứng ngay khi gắn vào trang. fade={false} khi ảnh TỰ điều khiển opacity (vd ảnh thứ 2
    // chỉ hiện lúc rê chuột: opacity-0 group-hover:opacity-100).
    // Chỉ đặt srcSet khi có bản nhỏ THẬT và ảnh chưa lỗi (ảnh dự phòng là SVG, không có bản nhỏ)
    const dungSrcSet = !loi && src && nho && nho !== src

    return (
        <img
            ref={ref}
            src={loi || !src ? ANH_DU_PHONG : src}
            srcSet={dungSrcSet ? `${nho} 600w, ${src} 1400w` : undefined}
            sizes={dungSrcSet ? coHienThi : undefined}
            alt={alt}
            className={`${fade ? 'anh-fade ' : ''}${className || ''}`}
            style={fade ? { ...style, opacity: taiXong ? 1 : 0 } : style}
            loading={uuTien ? 'eager' : 'lazy'}
            decoding='async'
            fetchPriority={uuTien ? 'high' : undefined}
            onLoad={() => setTaiXong(true)}
            onError={() => { setLoi(true); setTaiXong(true) }}
            {...rest}
        />
    )
}
