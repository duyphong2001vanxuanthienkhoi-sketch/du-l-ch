// "Bạn vừa xem" — lưu id các sản phẩm khách vừa mở, ở localStorage của TRÌNH DUYỆT
// (giống giỏ hàng: theo máy, không theo tài khoản). Chỉ lưu ID, dữ liệu thật lấy lại
// qua /api/products?ids=... để không bao giờ hiện giá/tên cũ đã lỗi thời.
export const KHOA_VUA_XEM = 'vuaXemHongGai'
const TOI_DA = 12

export function docVuaXem() {
    try {
        const luu = JSON.parse(localStorage.getItem(KHOA_VUA_XEM) || '[]')
        return Array.isArray(luu) ? luu.filter(x => typeof x === 'string') : []
    } catch {
        return [] // hỏng dữ liệu / chế độ riêng tư chặn localStorage
    }
}

// Ghi id lên ĐẦU danh sách (mới nhất trước), bỏ trùng, cắt còn TOI_DA
export function ghiVuaXem(id) {
    if (!id) return
    try {
        const ds = [String(id), ...docVuaXem().filter(x => x !== String(id))].slice(0, TOI_DA)
        localStorage.setItem(KHOA_VUA_XEM, JSON.stringify(ds))
    } catch { /* bỏ qua */ }
}

export function xoaVuaXem() {
    try { localStorage.removeItem(KHOA_VUA_XEM) } catch { /* bỏ qua */ }
}
