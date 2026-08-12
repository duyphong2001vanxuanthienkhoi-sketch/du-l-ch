// Logo "Khám Phá Hồng Gai" — dùng logo mark THẬT (núi đá + sóng Hạ Long + chữ G),
// file public/thuong-hieu/logo-mark.png (nền trong suốt). Dùng ở Navbar, Footer.
//  - size:  cạnh biểu tượng (px)
//  - anChu: chỉ hiện biểu tượng, ẩn phần chữ
//  - anChuKhiHep: máy RẤT hẹp (dưới 340px) thì bỏ chữ, chỉ để lại biểu tượng — dùng cho
//    Navbar, nơi hàng trên còn phải chứa 3 nút tròn và nút "Đăng nhập". Footer không cần
//    (xếp dọc, thừa chỗ) nên mặc định tắt.
//  - mauChu: 'sang' (chữ đậm trên nền sáng) | 'toi' (chữ trắng trên nền tối — footer)
export default function LogoChoSo({ size = 40, anChu = false, anChuKhiHep = false, mauChu = 'sang' }) {
    return (
        <span className='inline-flex items-center gap-2 sm:gap-2.5 select-none'>
            <img src='/thuong-hieu/logo-mark.png' alt='Khám Phá Hồng Gai'
                width={size} height={size} className='shrink-0 object-contain'
                style={{ width: size, height: size }} />
            {!anChu && (
                // Chữ nhỏ hơn một nấc trên điện thoại: hàng trên của Navbar chỉ vừa đủ chỗ cho
                // logo + 3 nút tròn + nút "Đăng nhập" (bản tiếng Việt dài) ở máy 360–375px.
                <span className={`flex flex-col leading-tight ${anChuKhiHep ? 'max-[339px]:hidden' : ''}`}>
                    <span className={`text-base sm:text-xl font-bold tracking-tight ${mauChu === 'toi' ? 'text-white' : 'text-ngoc-600'}`}>Khám Phá</span>
                    <span className={`text-ti sm:text-sm font-semibold -mt-0.5 ${mauChu === 'toi' ? 'text-slate-300' : 'text-hai-600'}`}>Hồng Gai</span>
                </span>
            )}
        </span>
    )
}
