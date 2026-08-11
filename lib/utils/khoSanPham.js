// KHO SẢN PHẨM phía trình duyệt — một bản dùng chung cho mọi component trong cùng phiên.
//
// Vì sao cần: /api/products trả TOÀN BỘ sản phẩm của chợ, mà trang chủ gọi nó tận 2 lần
// (TrangChuApp cho điện thoại + SanPhamNoiBat cho máy tính — cả hai luôn được gắn vào
// trang, chỉ ẩn/hiện bằng CSS), rồi sang /shop, /cart, ô tìm kiếm lại gọi tiếp. Khách đi
// 3G/4G phải tải cùng một danh sách nhiều lần cho mỗi lần đổi trang.
//
// Có HẠN 60 giây: đủ để một lượt xem trang không gọi lại, nhưng vẫn đủ tươi cho giá và
// tồn kho. (Tồn kho vẫn được server kiểm lại lúc đặt đơn nên bản cũ không gây bán quá hàng.)
let cache = null
let lucTai = 0
let dangTai = null
const HAN = 60 * 1000

export function taiSanPham({ moi = false } = {}) {
    if (!moi && cache && Date.now() - lucTai < HAN) return Promise.resolve(cache)
    if (!dangTai) {
        dangTai = fetch('/api/products')
            .then(r => r.json())
            .then(d => {
                cache = d.products || []
                lucTai = Date.now()
                dangTai = null
                return cache
            })
            .catch(() => {
                dangTai = null
                return cache || [] // mạng lỗi: dùng tạm bản cũ còn hơn để trang trống
            })
    }
    return dangTai
}

// Gọi khi biết dữ liệu vừa đổi (đặt đơn xong, tiểu thương sửa hàng) để lần sau tải lại
export function xoaKhoSanPham() {
    cache = null
    lucTai = 0
}
