// KHUNG TRANG dùng chung — chốt lề ngang và bề ngang tối đa cho phần nội dung.
//
// Vì sao cần: mỗi trang trước đây tự chọn một kiểu — chỗ `mx-6` chỗ `px-6`, bề ngang thì
// lẫn lộn max-w-4xl / 5xl / 6xl / 7xl. Hậu quả: mép nội dung nhảy vị trí khi khách đi từ
// trang này sang trang kia, và các dải cuộn ngang (dùng mẹo `-mx-6 px-6` để tràn đúng ra
// mép) phụ thuộc vào việc cha có đúng lề 24px hay không — sai lề là dải lệch.
//
// rong: 'hep'  (max-w-4xl) — trang giấy tờ, form dài, nội dung đọc
//       'vua'  (max-w-5xl) — trang chi tiết một đối tượng (sản phẩm, địa điểm)
//       'rong' (max-w-6xl) — trang danh sách/lưới (mặc định)
//       'toiDa'(max-w-7xl) — trang cần tận dụng hết bề ngang (giỏ hàng 2 cột)
//
// Lề ngang LUÔN là 24px (px-6) ở mọi cỡ máy — đây là con số mà các dải cuộn ngang bám theo.
const BE_RONG = {
    hep: 'max-w-4xl',
    vua: 'max-w-5xl',
    rong: 'max-w-6xl',
    toiDa: 'max-w-7xl',
}

export default function KhungTrang({ rong = 'rong', className = '', style, children }) {
    return (
        <div className={`px-6 ${className}`} style={style}>
            <div className={`${BE_RONG[rong] || BE_RONG.rong} mx-auto`}>
                {children}
            </div>
        </div>
    )
}
