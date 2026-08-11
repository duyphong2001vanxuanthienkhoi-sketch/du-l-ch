import { Phone } from 'lucide-react'

// Bộ nhận diện đối tác giao vận GREEN SM (trước đây tên "Xanh SM", đã đổi tên thành Green SM).
// Dùng ở trang chủ, trang giỏ/thanh toán, trang Đồ Ăn và xác nhận đơn.
// HIỆN TẠI là liên kết trưng bày: nút mở website Green SM. Sau này có thể nối API đặt xe/giao
// hàng thật (chỉ cần đổi LINK_GREEN_SM / gắn deep-link đặt chuyến).
export const GREEN_SM_TEAL = '#2DCCD3' // xanh ngọc thương hiệu (lấy từ logo)
export const GREEN_SM_VANG = '#FFCA00' // vàng thương hiệu (lấy từ logo)
const NEN_GREEN_SM = 'linear-gradient(120deg, #2DCCD3, #12B3A7)'
export const LINK_GREEN_SM = 'https://www.greensm.com.vn'
const LOGO_GREEN_SM = '/thuong-hieu/logo-greensm.png'

// Logo Green SM THẬT (ảnh vuông nền trắng) đặt trong ô bo tròn trắng để nổi bật trên mọi nền.
export function LogoGreenSM({ size = 44, className = '' }) {
    return (
        <span className={`inline-flex items-center justify-center rounded-xl bg-white shrink-0 ring-1 ring-black/5 ${className}`}
            style={{ width: size, height: size }}>
            <img src={LOGO_GREEN_SM} alt='Green SM' className='object-contain'
                style={{ width: size - 8, height: size - 8 }} />
        </span>
    )
}

// Nút "Đặt xe ngay" — mở website/app Green SM ở tab mới. Gọn, bo tròn, gradient xanh ngọc.
export function NutGoiGreenSM({ nhan = 'Đặt xe ngay', className = '' }) {
    return (
        <a href={LINK_GREEN_SM} target='_blank' rel='noopener noreferrer'
            className={`inline-flex items-center justify-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-full active:scale-95 transition shadow-sm ${className}`}
            style={{ background: NEN_GREEN_SM }}>
            <Phone size={14} /> {nhan}
        </a>
    )
}

// Banner đối tác GỌN (nền trắng) — dùng ở giỏ hàng & trang Đồ Ăn.
// Một hàng duy nhất, KHÔNG xuống dòng để không chiếm chỗ trên điện thoại.
export function BangDoiTacGreenSM({
    tieuDe = 'Giao hàng, đặt xe cùng Green SM',
    moTa = 'Xe điện — nhanh, xanh, thân thiện môi trường',
    nhanNut = 'Đặt xe ngay',
    className = '',
}) {
    return (
        <div className={`flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-2 pr-2.5 ${className}`}>
            <LogoGreenSM size={42} />
            <div className='min-w-0 flex-1'>
                <p className='text-nho font-semibold text-slate-800 leading-tight truncate'>{tieuDe}</p>
                <p className='text-ti text-slate-500 leading-tight truncate'>{moTa}</p>
            </div>
            <a href={LINK_GREEN_SM} target='_blank' rel='noopener noreferrer'
                className='inline-flex items-center gap-1 text-white text-xs font-semibold px-3 py-2 rounded-full active:scale-95 transition shrink-0'
                style={{ background: NEN_GREEN_SM }}>
                <Phone size={13} /> {nhanNut}
            </a>
        </div>
    )
}

// Banner NỔI BẬT (nền gradient xanh ngọc) — dùng ở trang chủ để giới thiệu đối tác giao vận.
export function BangGreenSMNoiBat({
    tieuDe = 'Giao hàng, đặt xe cùng Green SM',
    moTa = 'Đối tác xe điện — giao tận nơi trong ngày, xanh và thân thiện môi trường',
    nhanNut = 'Đặt xe ngay',
    className = '',
}) {
    return (
        <div className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 ${className}`}
            style={{ background: NEN_GREEN_SM }}>
            <span className='inline-flex items-center justify-center rounded-2xl bg-white shrink-0 ring-1 ring-black/10 size-[52px] sm:size-[72px]'>
                <img src={LOGO_GREEN_SM} alt='Green SM' className='object-contain size-10 sm:size-[58px]' />
            </span>
            <div className='min-w-0 flex-1 text-white'>
                <p className='text-sm sm:text-xl font-bold leading-tight line-clamp-2'>{tieuDe}</p>
                <p className='text-ti sm:text-sm text-white/90 mt-0.5 leading-snug line-clamp-1 sm:line-clamp-2'>{moTa}</p>
            </div>
            <a href={LINK_GREEN_SM} target='_blank' rel='noopener noreferrer'
                className='inline-flex items-center justify-center gap-1.5 bg-white text-nho sm:text-base font-semibold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full active:scale-95 transition shrink-0 shadow-sm'
                style={{ color: '#0E9E92' }}>
                <Phone size={15} /> <span className='max-sm:hidden'>{nhanNut}</span><span className='sm:hidden'>Đặt xe</span>
            </a>
        </div>
    )
}
