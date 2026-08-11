// Danh mục con (cấp SẢN PHẨM) nằm trong mỗi khu gian hàng.
//  - Tiểu thương chọn danh mục khi đăng/sửa sản phẩm ở gian.
//  - Khách lọc theo danh mục ở trang chợ (/shop) và trang gian (/gian/[id]).
// Muốn thêm / bớt / đổi tên danh mục: chỉ cần sửa mảng DANH_MUC_SP dưới đây.
//   khu: 'cho_tuoi' | 'qua_quang_ninh' — danh mục chỉ hiện trong đúng khu của gian.
// ten: [vi, en, zh] — hiển thị bằng t(...ten). Logic chỉ dùng id/khu.
export const DANH_MUC_SP = [
    // Khu Chợ Tươi
    { id: 'hai_san_tuoi', ten: ['Hải sản tươi', 'Fresh seafood', '鲜活海鲜'], khu: 'cho_tuoi' },
    { id: 'thuc_pham_tuoi', ten: ['Thực phẩm tươi', 'Fresh food', '新鲜食品'], khu: 'cho_tuoi' },

    // Khu Quà Quảng Ninh
    { id: 'hai_san_kho', ten: ['Hải sản khô', 'Dried seafood', '海鲜干货'], khu: 'qua_quang_ninh' },
    { id: 'dac_san', ten: ['Đặc sản', 'Specialties', '特产'], khu: 'qua_quang_ninh' },
    { id: 'qua_luu_niem', ten: ['Quà lưu niệm', 'Souvenirs', '纪念品'], khu: 'qua_quang_ninh' },
    { id: 'quan_ao', ten: ['Quần áo', 'Clothing', '服饰'], khu: 'qua_quang_ninh' },
    { id: 'do_luu_niem_khac', ten: ['Đồ lưu niệm khác', 'Other souvenirs', '其他纪念品'], khu: 'qua_quang_ninh' },
]

// Tra cứu nhanh theo id
export const DANH_MUC_SP_THEO_ID = Object.fromEntries(DANH_MUC_SP.map(d => [d.id, d]))

// Các danh mục thuộc một khu (dùng cho ô chọn trong form đăng sản phẩm)
export const danhMucTheoKhu = (khu) => DANH_MUC_SP.filter(d => d.khu === khu)

// Tên hiển thị của một danh mục (null nếu id rỗng / không hợp lệ)
export const tenDanhMuc = (id) => DANH_MUC_SP_THEO_ID[id]?.ten || null

// Danh sách id hợp lệ (để kiểm tra phía server)
export const DANH_MUC_SP_IDS = DANH_MUC_SP.map(d => d.id)
