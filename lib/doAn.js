// Cấu hình BUỔI phục vụ & LOẠI MÓN của module Đồ Ăn — DÙNG CHUNG cho:
//  - app/(public)/do-an/page.jsx        (bộ lọc + chip trên thẻ quán)
//  - app/(public)/create-quan-an/page.jsx (chọn khi đăng ký quán)
//  - app/(public)/quan-an/thong-tin/page.jsx (chọn khi sửa thông tin quán)
// Mỗi mục có: id (lưu DB), ten (nhãn [vi,en,zh] — hiển thị bằng t(...ten)),
// icon (emoji dự phòng), anh (icon ảnh thương hiệu).
// Muốn đổi icon: sửa đường dẫn 'anh' ở đây là đổi cho tất cả các nơi.
export const BUOI_DO_AN = [
    { id: 'an_sang', ten: ['Ăn sáng', 'Breakfast', '早餐'], icon: '🌅', anh: '/thuong-hieu/mon-an-sang.webp' },
    { id: 'an_trua', ten: ['Ăn trưa', 'Lunch', '午餐'], icon: '🍚', anh: '/thuong-hieu/mon-an-trua.webp' },
    { id: 'an_toi', ten: ['Ăn tối', 'Dinner', '晚餐'], icon: '🌙', anh: '/thuong-hieu/mon-an-toi.webp' },
    // Ăn vặt dùng chung icon với loại món "Đồ ăn vặt"
    { id: 'an_vat', ten: ['Ăn vặt', 'Snacks', '小吃'], icon: '🍢', anh: '/thuong-hieu/mon-do-an-vat.webp' },
    // Ăn đêm (22h–4h)
    { id: 'an_dem', ten: ['Ăn đêm', 'Late night', '夜宵'], icon: '🌃', anh: '/thuong-hieu/mon-an-dem.jpg' },
]

export const NHOM_DO_AN = [
    { id: 'do_an_vat', ten: ['Đồ ăn vặt', 'Snacks', '小吃'], icon: '🍢', anh: '/thuong-hieu/mon-do-an-vat.webp' },
    { id: 'bun', ten: ['Bún', 'Rice noodles', '米粉'], icon: '🍜', anh: '/thuong-hieu/mon-bun.webp' },
    { id: 'pho', ten: ['Phở', 'Pho', '河粉'], icon: '🍲', anh: '/thuong-hieu/mon-pho.webp' },
    { id: 'com', ten: ['Cơm', 'Rice', '米饭'], icon: '🍚', anh: '/thuong-hieu/mon-com.webp' },
    { id: 'chao', ten: ['Cháo', 'Congee', '粥'], icon: '🥣', anh: '/thuong-hieu/mon-chao.webp' },
    { id: 'mien', ten: ['Miến', 'Glass noodles', '粉丝'], icon: '🍝', anh: '/thuong-hieu/mon-mien.webp' },
    { id: 'hai_san', ten: ['Hải sản', 'Seafood', '海鲜'], icon: '🦐', anh: '/thuong-hieu/mon-hai-san.webp' },
]
