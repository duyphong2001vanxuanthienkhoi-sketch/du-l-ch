'use client'

// Chuyển cảnh khi ĐỔI TRANG: Next.js remount template này ở mỗi lần điều hướng,
// nên chỉ cần một animation "hiện vào" là mọi trang công khai đều chuyển mượt
// thay vì nhảy phựt. (Dùng template thay cho View Transitions API vì API đó ở
// Next 15 còn là cờ thử nghiệm.) Animation tôn trọng "giảm chuyển động" — xem globals.css.
export default function Template({ children }) {
    return <div className='vao-trang'>{children}</div>
}
