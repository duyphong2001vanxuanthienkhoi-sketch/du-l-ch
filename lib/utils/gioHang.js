// Giỏ hàng lưu ở localStorage của TRÌNH DUYỆT (chung cho cả thiết bị), không theo tài khoản.
// Vì vậy khi ĐĂNG XUẤT phải xóa bản lưu — nếu không, giỏ của người trước sẽ lộ sang
// người dùng hoặc khách vãng lai tiếp theo dùng chung máy ("giỏ hàng ảo").
export const KHOA_GIO = 'gioHangHongGai'

export function xoaGioHangLuu() {
    try { localStorage.removeItem(KHOA_GIO) } catch { }
}

// KHÓA GIỎ theo dòng hàng: sản phẩm thường dùng chính productId; sản phẩm có phân loại
// (size/màu) dùng "productId::bienTheId" để mỗi phân loại là một dòng riêng trong giỏ.
// (productId dạng 'p_<uuid>' và bienTheId không chứa '::' nên tách lại luôn đúng.)
export function taoKhoaGio(productId, bienTheId) {
    return bienTheId ? `${productId}::${bienTheId}` : String(productId)
}

export function phanTichKhoaGio(khoa) {
    const i = String(khoa).indexOf('::')
    if (i === -1) return { productId: String(khoa), bienTheId: null }
    return { productId: khoa.slice(0, i), bienTheId: khoa.slice(i + 2) }
}
