// Hiệu ứng "bay vào giỏ": nhân bản ảnh sản phẩm rồi cho bay theo VÒNG CUNG từ thẻ
// tới icon giỏ hàng trên header, thu nhỏ + xoay nhẹ rồi "rơi" gọn vào giỏ, kèm cú
// "nhún" ở icon giỏ khi tới nơi. Chỉ chạy ở client.
// Tôn trọng "giảm chuyển động" của hệ điều hành (bỏ qua nếu người dùng đã tắt hiệu ứng).
export function bayVaoGio(anhSrc, fromEl) {
    if (typeof window === 'undefined' || !anhSrc || !fromEl) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    // Icon giỏ hàng ĐANG hiển thị (bản desktop hoặc mobile của Navbar)
    const dich = [...document.querySelectorAll('[aria-label="Giỏ hàng"]')]
        .find(el => el.getBoundingClientRect().width > 0)
    if (!dich) return

    const from = fromEl.getBoundingClientRect()
    const to = dich.getBoundingClientRect()
    if (!from.width) return

    const bay = document.createElement('img')
    bay.src = anhSrc
    bay.setAttribute('aria-hidden', 'true')
    Object.assign(bay.style, {
        position: 'fixed',
        left: `${from.left}px`,
        top: `${from.top}px`,
        width: `${from.width}px`,
        height: `${from.height}px`,
        objectFit: 'cover',
        borderRadius: '16px',
        zIndex: '9999',
        pointerEvents: 'none',
        boxShadow: '0 12px 30px rgba(15,23,42,.28)',
        willChange: 'transform, opacity',
    })
    document.body.appendChild(bay)

    const dx = (to.left + to.width / 2) - (from.left + from.width / 2)
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2)

    // Vòng cung: điểm giữa nhô cao hơn đường thẳng ~70px cho giống cú "ném" tự nhiên;
    // ảnh giữ to rồi thu nhỏ + xoay dần, mờ đi rồi "rơi" gọn vào giỏ.
    // WAAPI tự lo việc khởi động transition nên không cần ép reflow như trước.
    const anim = bay.animate([
        { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1, offset: 0 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 70}px) scale(.6) rotate(-6deg)`, opacity: .95, offset: .55 },
        { transform: `translate(${dx}px, ${dy}px) scale(.1) rotate(-12deg)`, opacity: .2, offset: 1 },
    ], {
        duration: 720,
        easing: 'cubic-bezier(.5,0,.35,1)',
        fill: 'forwards',
    })

    let daXong = false
    const xong = () => {
        if (daXong) return
        daXong = true
        bay.remove()
        dich.classList.add('gio-nhun')
        setTimeout(() => dich.classList.remove('gio-nhun'), 450)
    }
    anim.onfinish = xong
    anim.oncancel = xong
    setTimeout(xong, 900) // phòng khi onfinish không bắn
}
