// Ảnh đại diện dùng chung (người dùng, người bình luận, quán trong tin nhắn...).
// Có ảnh (src) thì hiện ảnh; chưa có thì hiện chữ cái đầu của tên.
//  - khung: class cho KHUNG (kích thước, bo góc, nền khi chưa có ảnh)
//  - chu:   class cho CHỮ cái đầu khi chưa có ảnh (cỡ chữ, màu)
//  - mau:   (tùy chọn) màu nền vòng chữ cái khi CHƯA có ảnh — dùng khi màu là mã hex,
//           không tiện đặt qua class Tailwind. Có ảnh thì bỏ qua.
// Không dùng hook nên chạy được ở cả server & client component.
export default function AnhDaiDien({ src, ten, khung = '', chu = '', mau }) {
    return (
        <span
            className={`inline-flex items-center justify-center overflow-hidden shrink-0 ${khung}`}
            style={!src && mau ? { backgroundColor: mau } : undefined}>
            {src
                ? <img src={src} alt={ten || 'Ảnh đại diện'} className='w-full h-full object-cover' />
                : <span className={chu}>{ten?.[0]?.toUpperCase() || '?'}</span>}
        </span>
    )
}
