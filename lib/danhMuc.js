// Danh mục nhanh của trang chủ — dùng chung cho:
//  - components/TrangChuApp.jsx (ô danh mục trên điện thoại)
//  - components/Hero.jsx        (ô danh mục nhanh trên máy tính)
// Ảnh minh họa (bộ nhận diện thương hiệu) đặt ở public/thuong-hieu/tile-*.webp,
// đã cắt bỏ chữ để app tự render nhãn bằng font thương hiệu cho nét.
// label/labelDai/mo là mảng [vi, en, zh] — dịch tại chỗ hiển thị bằng t(...).
export const DANH_MUC = [
    { href: '/shop?khu=cho_tuoi', label: ['Chợ Tươi', 'Fresh Market', '鲜市'], labelDai: ['Chợ Tươi', 'Fresh Market', '鲜市'], mo: ['Hải sản tươi trong ngày', 'Fresh seafood daily', '每日新鲜海鲜'], anh: '/thuong-hieu/tile-cho-tuoi.webp', nen: '#E1F5EE', mau: '#0F6E56' },
    { href: '/shop?khu=qua_quang_ninh', label: ['Quà QN', 'QN Gifts', '广宁礼品'], labelDai: ['Quà Quảng Ninh', 'Quang Ninh Gifts', '广宁礼品'], mo: ['Đặc sản, quà lưu niệm', 'Specialties & souvenirs', '特产与纪念品'], anh: '/thuong-hieu/tile-qua.webp', nen: '#FAEEDA', mau: '#854F0B' },
    { href: '/do-an', label: ['Đồ Ăn', 'Food', '美食'], labelDai: ['Đồ Ăn', 'Food', '美食'], mo: ['Món ngon giao tận nơi', 'Tasty dishes delivered', '美食送到家'], anh: '/thuong-hieu/tile-do-an.webp', nen: '#FDEBDD', mau: '#C2410C' },
    { href: '/kham-pha', label: ['Khám phá', 'Explore', '探索'], labelDai: ['Khám phá Hồng Gai', 'Explore Hong Gai', '探索鸿基'], mo: ['Điểm đến & đặc sản', 'Destinations & specialties', '景点与特产'], anh: '/thuong-hieu/tile-kham-pha.webp', nen: '#E6F1FB', mau: '#185FA5' },
]
