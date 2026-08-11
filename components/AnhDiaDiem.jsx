'use client'
import { useEffect, useState } from 'react'

// Danh sách ảnh thật lấy từ /api/dia-diem/anh — cache chung cho mọi thẻ trên trang,
// cả trang chỉ gọi API đúng 1 lần.
let cacheAnh = null
const layDanhSachAnh = () => {
    if (!cacheAnh) {
        cacheAnh = fetch('/api/dia-diem/anh')
            .then(r => r.json())
            .then(d => d.anh || {})
            .catch(() => ({}))
    }
    return cacheAnh
}

// Ảnh thật của địa điểm — thả file vào public/dia-diem/ với tên = id địa điểm
// (vd: nui-bai-tho.jpg) là tự hiện. Chưa có ảnh thì render `fallback`
// (khối emoji như cũ) hoặc ẩn hẳn nếu không truyền fallback.
const AnhDiaDiem = ({ id, alt, className = '', fallback = null }) => {
    const [src, setSrc] = useState(null)
    const [daTai, setDaTai] = useState(false)

    useEffect(() => {
        let conHieuLuc = true
        setSrc(null)
        setDaTai(false)
        layDanhSachAnh().then(anh => { if (conHieuLuc) setSrc(anh[id] || null) })
        return () => { conHieuLuc = false }
    }, [id])

    if (!src) return fallback

    // Ảnh lấy từ cache trình duyệt có thể tải xong TRƯỚC khi React gắn onLoad,
    // nên kiểm tra thêm qua ref lúc phần tử gắn vào trang
    const kiemTra = (el) => {
        if (el && el.complete && el.naturalWidth > 0 && !daTai) setDaTai(true)
    }

    return (
        <>
            {/* Trong lúc ảnh đang tải vẫn hiện fallback để không bị khoảng trống */}
            {!daTai && fallback}
            <img
                ref={kiemTra}
                src={src}
                alt={alt}
                className={className}
                style={daTai ? undefined : { display: 'none' }}
                onLoad={() => setDaTai(true)}
                onError={() => setSrc(null)}
            />
        </>
    )
}

export default AnhDiaDiem
