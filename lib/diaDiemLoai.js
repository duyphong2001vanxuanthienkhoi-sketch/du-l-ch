// Danh mục & thuộc tính chuẩn của ĐỊA ĐIỂM — nguồn DÙNG CHUNG cho:
//  - app/admin/dia-diem       (biên tập viên chọn khi thêm/sửa địa điểm)
//  - app/(public)/kham-pha    (thanh chip lọc theo loại hình)
//  - components thẻ & bản đồ  (màu ghim, icon dự phòng khi chưa có ảnh)
//
// Nhãn chữ theo đúng quy ước sẵn có của app: mảng [vi, en, zh] — hiển thị bằng t(...ten).
// Các trường KHÔNG dịch: id, mau, icon.
//
// GIÁ: app du lịch này KHÔNG có bảng giá chi tiết (xem THIET-KE-APP-DU-LICH.md mục 6.1).
// Chỉ có 2 thứ: `mucGia` (enum dưới đây — để LỌC và hiện ký hiệu ₫) và `giaVe`
// (câu chữ mềm [vi,en,zh] — để HIỂN THỊ, vd 'Miễn phí (tùy tâm công đức)').
// Viết câu mềm thay vì con số thì không bao giờ sai và tốn 0 công bảo trì.

export const LOAI_DIA_DIEM = [
    { id: 'an_uong', ten: ['Ăn uống', 'Food', '美食'], mau: '#ea580c', icon: '🍜' },
    { id: 'ca_phe', ten: ['Cà phê · Đồ uống', 'Cafés & Drinks', '咖啡饮品'], mau: '#b45309', icon: '☕' },
    { id: 'tam_linh', ten: ['Tâm linh', 'Spiritual', '灵修'], mau: '#d97706', icon: '🏯' },
    { id: 'di_tich', ten: ['Di tích · Lịch sử', 'Heritage', '古迹'], mau: '#059669', icon: '📜' },
    { id: 'van_hoa', ten: ['Văn hoá · Bảo tàng', 'Culture & Museums', '文化博物'], mau: '#334155', icon: '🏛️' },
    { id: 'ngam_canh', ten: ['Ngắm cảnh · Thiên nhiên', 'Scenic & Nature', '观景自然'], mau: '#0284c7', icon: '⛰️' },
    { id: 'vui_choi', ten: ['Vui chơi · Giải trí', 'Fun & Entertainment', '娱乐'], mau: '#7c3aed', icon: '🎡' },
    { id: 'mua_sam', ten: ['Mua sắm · Đặc sản', 'Shopping & Specialties', '购物特产'], mau: '#c026d3', icon: '🛍️' },
    { id: 'luu_tru', ten: ['Lưu trú', 'Stay', '住宿'], mau: '#0d9488', icon: '🏨' },
    { id: 'dich_vu', ten: ['Dịch vụ du lịch', 'Travel services', '旅游服务'], mau: '#475569', icon: '🚤' },
]

// Mức giá — CHỈ để lọc & hiện ký hiệu. Con số trong `goi` là mô tả tham khảo, không phải cam kết.
export const MUC_GIA = [
    { id: 'mien_phi', ten: ['Miễn phí', 'Free', '免费'], kyHieu: '', goi: ['Vào cửa tự do', 'Free entry', '免费入场'] },
    { id: 're', ten: ['Bình dân', 'Budget', '平价'], kyHieu: '₫', goi: ['Dưới 50k', 'Under 50k', '5万以下'] },
    { id: 'vua', ten: ['Tầm trung', 'Mid-range', '中档'], kyHieu: '₫₫', goi: ['50k – 150k', '50k – 150k', '5万 – 15万'] },
    { id: 'cao', ten: ['Cao cấp', 'Upscale', '高档'], kyHieu: '₫₫₫', goi: ['Trên 150k', 'Over 150k', '15万以上'] },
]

export const TIEN_ICH = [
    { id: 'bai_do_xe', ten: ['Bãi đỗ xe', 'Parking', '停车场'], icon: '🅿️' },
    { id: 'wifi', ten: ['Wifi miễn phí', 'Free wifi', '免费无线网'], icon: '📶' },
    { id: 'may_lanh', ten: ['Máy lạnh', 'Air-conditioned', '空调'], icon: '❄️' },
    { id: 'phu_hop_gia_dinh', ten: ['Phù hợp gia đình', 'Family friendly', '适合家庭'], icon: '👨‍👩‍👧' },
    { id: 'nhan_the', ten: ['Nhận thẻ', 'Card accepted', '可刷卡'], icon: '💳' },
    { id: 'co_view', ten: ['Có view đẹp', 'Great view', '景观佳'], icon: '🌅' },
    { id: 'ho_tro_xe_lan', ten: ['Hỗ trợ xe lăn', 'Wheelchair access', '无障碍通道'], icon: '♿' },
]

// Trạng thái duyệt — địa điểm do BIÊN TẬP nhập mặc định 'da_duyet';
// địa điểm do CHỦ CƠ SỞ đăng ký (giai đoạn sau) vào 'cho_duyet'.
export const TRANG_THAI = [
    { id: 'da_duyet', ten: ['Đã duyệt', 'Approved', '已审核'], mau: '#059669' },
    { id: 'cho_duyet', ten: ['Chờ duyệt', 'Pending', '待审核'], mau: '#d97706' },
    { id: 'tu_choi', ten: ['Từ chối', 'Rejected', '已拒绝'], mau: '#dc2626' },
]

// Nguồn nội dung — để biết ai chịu trách nhiệm cập nhật.
export const NGUON = [
    { id: 'bien_tap', ten: ['Biên tập', 'Editorial', '编辑'] },
    { id: 'chu_co_so', ten: ['Chủ cơ sở', 'Business owner', '商家'] },
]

export const timLoai = (id) => LOAI_DIA_DIEM.find(l => l.id === id) || null
export const timMucGia = (id) => MUC_GIA.find(m => m.id === id) || null
export const timTrangThai = (id) => TRANG_THAI.find(s => s.id === id) || null

// Màu của địa điểm: ưu tiên màu tự đặt, không có thì lấy theo loại, cuối cùng là màu biển mặc định.
export const mauDiaDiem = (d) => d?.mau || timLoai(d?.loai)?.mau || '#0284c7'
export const iconDiaDiem = (d) => d?.icon || timLoai(d?.loai)?.icon || '📍'

// Slug làm id địa điểm: bỏ dấu tiếng Việt, còn lại a-z 0-9 và gạch nối.
// vd 'Chùa Long Tiên' -> 'chua-long-tien'
export const taoSlug = (ten) => String(ten || '')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

// Khoảng cách 2 toạ độ [vĩ độ, kinh độ] theo km (công thức Haversine).
// Dùng cho "gần tôi" và khối "các điểm quanh đây" — thay cho việc admin gắn tay như bản cũ.
export const khoangCachKm = (a, b) => {
    if (!Array.isArray(a) || !Array.isArray(b)) return null
    const R = 6371
    const rad = (x) => x * Math.PI / 180
    const dLat = rad(b[0] - a[0])
    const dLng = rad(b[1] - a[1])
    const h = Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(h))
}

// Link chỉ đường Google Maps. `ten` có thể là mảng [vi,en,zh] — LUÔN dùng bản tiếng Việt
// để tra cho đúng chỗ (tên tiếng Anh/Trung thường không khớp dữ liệu bản đồ).
export const linkChiDuong = (ten) => {
    const s = Array.isArray(ten) ? ten[0] : ten
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s + ' Hạ Long Quảng Ninh')}`
}
