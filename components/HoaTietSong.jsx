// Bộ họa tiết sóng biển dùng chung toàn app — thuần SVG, không cần ảnh.
//  - SongNgan:     dải sóng ngăn cách giữa các khối trang (đặt trên/dưới một band màu)
//  - SongChim:     vân sóng trắng mờ lót đáy các thẻ nền đậm (thẻ thành viên, thẻ đăng nhập)
//  - GachChanSong: nét sóng nhỏ gạch chân tiêu đề khối

// Dải sóng full-width. `mau` = màu của band phía dưới sóng; `lat` = úp ngược (đặt cuối band).
export function SongNgan({ mau = '#f0f9ff', lat = false, className = '' }) {
    return (
        <div aria-hidden='true' className={`w-full overflow-hidden leading-none ${className}`}>
            <svg viewBox='0 0 1440 44' preserveAspectRatio='none'
                className={`w-full h-[26px] sm:h-[40px] block ${lat ? 'rotate-180' : ''}`}>
                <path d='M0 24 C180 46 360 2 560 20 C760 38 900 6 1100 18 C1260 28 1360 12 1440 22 L1440 44 L0 44 Z' fill={mau} />
            </svg>
        </div>
    )
}

// Vân sóng chìm cho thẻ nền đậm — thẻ cha cần `relative overflow-hidden`.
export function SongChim() {
    return (
        <svg aria-hidden='true' viewBox='0 0 400 48' preserveAspectRatio='none'
            className='absolute inset-x-0 bottom-0 w-full h-10 pointer-events-none'>
            <path d='M0 26 q25 -11 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 L400 48 L0 48 Z' fill='#ffffff' opacity='.05' />
            <path d='M0 36 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 L400 48 L0 48 Z' fill='#ffffff' opacity='.07' />
        </svg>
    )
}

// Nét sóng gạch chân tiêu đề (thay đường kẻ thẳng khô khan)
export function GachChanSong({ mau = '#10b981', className = '' }) {
    return (
        <svg aria-hidden='true' width='76' height='9' viewBox='0 0 76 9' className={className}>
            <path d='M3 5.5 q6.5 -5 13 0 t13 0 t13 0 t13 0 t13 0'
                stroke={mau} strokeWidth='2.6' fill='none' strokeLinecap='round' />
        </svg>
    )
}
