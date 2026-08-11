// Trạng thái đơn hàng CHỢ (lưu theo TỪNG GIAN trong `statusTheoGian`) — dùng chung cho
// trang khách, trang gian và admin. Pipeline tiến:
//   chờ xác nhận → chờ lấy hàng → chờ giao hàng (đang giao) → đã giao
// Nhánh: đã hủy (khách hủy khi còn chờ xác nhận), trả hàng (khách yêu cầu hoàn sau khi đã giao).
// Thứ tự trong BUOC_DON = rank để suy trạng thái CHUNG của đơn nhiều gian (lấy bước TRỄ NHẤT).

export const BUOC_DON = [
    { id: 'cho_xac_nhan', ten: 'Chờ xác nhận', en: 'To confirm', zh: '待确认', mau: '#0284c7', nen: '#e0f2fe' },
    { id: 'cho_lay_hang', ten: 'Chờ lấy hàng', en: 'To ship', zh: '待取货', mau: '#7c3aed', nen: '#ede9fe' },
    { id: 'dang_giao', ten: 'Chờ giao hàng', en: 'Shipping', zh: '待收货', mau: '#d97706', nen: '#fef3c7' },
    { id: 'da_giao', ten: 'Đã giao', en: 'Delivered', zh: '已送达', mau: '#059669', nen: '#d1fae5' },
]
export const HUY_DON = { id: 'da_huy', ten: 'Đã hủy', en: 'Cancelled', zh: '已取消', mau: '#dc2626', nen: '#fee2e2' }
export const TRA_HANG = { id: 'tra_hang', ten: 'Trả hàng', en: 'Return', zh: '退货', mau: '#ea580c', nen: '#ffedd5' }

// Tra cứu định nghĩa theo id (gồm cả nhánh hủy/trả)
export const TT_DON = Object.fromEntries([...BUOC_DON, HUY_DON, TRA_HANG].map(t => [t.id, t]))

// Đơn cũ dùng 'moi' → coi như 'chờ xác nhận' (tương thích ngược, không cần migrate DB)
export const chuanTT = (s) => (s === 'moi' ? 'cho_xac_nhan' : (s || 'cho_xac_nhan'))

const RANK = Object.fromEntries(BUOC_DON.map((b, i) => [b.id, i]))

// Suy trạng thái CHUNG của đơn (đơn có thể gồm nhiều gian, mỗi gian một trạng thái):
//  - có phần nào đang 'trả hàng'  → trả hàng
//  - tất cả các phần đã hủy        → đã hủy
//  - các phần chưa hủy đều đã giao → đã giao
//  - còn lại                        → bước TRỄ NHẤT trong các phần chưa hủy
export function trangThaiChung(statusTheoGian) {
    const cac = Object.values(statusTheoGian || {}).map(chuanTT)
    if (!cac.length) return 'cho_xac_nhan'
    if (cac.some(s => s === 'tra_hang')) return 'tra_hang'
    const conLai = cac.filter(s => s !== 'da_huy')
    if (!conLai.length) return 'da_huy'
    if (conLai.every(s => s === 'da_giao')) return 'da_giao'
    const minRank = Math.min(...conLai.map(s => RANK[s] ?? 0))
    return BUOC_DON[minRank].id
}

// Các bước GIAN được phép tự chuyển (pipeline tiến; gian không tự hủy/không tự tạo yêu cầu trả)
export const BUOC_GIAN = ['cho_xac_nhan', 'cho_lay_hang', 'dang_giao', 'da_giao']

// Hành động của GIAN để tiến sang bước kế — nhãn kiểu "làm gì" (rõ ràng hơn tên trạng thái).
// Gian bấm: Xác nhận đơn -> Đã lấy hàng -> Đã giao hàng. Bước 'da_giao' là cuối (không có hành động).
export const HANH_DONG_GIAN = {
    cho_xac_nhan: { toi: 'cho_lay_hang', ten: 'Xác nhận đơn', en: 'Confirm order', zh: '确认订单' },
    cho_lay_hang: { toi: 'dang_giao', ten: 'Đã lấy hàng', en: 'Picked up', zh: '已取货' },
    dang_giao: { toi: 'da_giao', ten: 'Đã giao hàng', en: 'Mark delivered', zh: '标记已送达' },
}
