// Trạng thái đơn đặt món — dùng chung cho trang khách (theo dõi) và trang chủ quán.
// Thứ tự trong mảng = thứ tự các bước trên thanh tiến trình.
export const CAC_BUOC = [
    { id: 'cho_nhan', ten: 'Chờ quán nhận', nhanNgan: 'Chưa nhận', mau: '#d97706' },
    { id: 'da_nhan', ten: 'Đã nhận đơn', nhanNgan: 'Đã nhận', mau: '#0284c7' },
    { id: 'dang_giao', ten: 'Đang giao', nhanNgan: 'Đang giao', mau: '#7c3aed' },
    { id: 'da_giao', ten: 'Đã giao', nhanNgan: 'Đã giao', mau: '#059669' },
]
export const HUY = { id: 'huy', ten: 'Đã hủy', nhanNgan: 'Đã hủy', mau: '#dc2626' }

export const TT = Object.fromEntries([...CAC_BUOC, HUY].map(t => [t.id, t]))

// Vị trí bước hiện tại (0..3); -1 nếu đã hủy / không xác định
export const viTriBuoc = (trangThai) => CAC_BUOC.findIndex(b => b.id === trangThai)
