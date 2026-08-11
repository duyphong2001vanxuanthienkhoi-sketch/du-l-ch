// Tích điểm thật cho thành viên Chợ Số.
// - Hạng thành viên xét theo TỔNG CHI TIÊU (cộng dồn mọi đơn của khách).
// - Bean tích theo tổng chi tiêu, NHÂN hệ số của hạng đang đạt (hạng cao tích nhanh hơn).
// Tất cả suy ra từ lịch sử đơn — không lưu riêng, nên luôn khớp thực tế mua hàng.
// File thuần (không phụ thuộc React) để dùng chung cả phía máy chủ lẫn giao diện.

// Tỉ lệ gốc: cứ 1.000đ chi tiêu được 1 bean (trước khi nhân hệ số hạng).
const DONG_MOI_BEAN = 1000

// Các hạng từ thấp đến cao.
//  - nguong: tổng chi tiêu tối thiểu (đ) để đạt hạng
//  - heSo:   nhân điểm bean khi đã ở hạng này
//  - mau:    màu nhấn cho biểu tượng hạng
// ten: [vi, en, zh] — hiển thị bằng t(...ten). Logic chỉ dùng nguong/heSo/mau/ma.
export const HANG_THANH_VIEN = [
    { ma: 'dong', ten: ['Đồng', 'Bronze', '铜'], nguong: 0, heSo: 1, mau: '#C88A3C' },
    { ma: 'bac', ten: ['Bạc', 'Silver', '银'], nguong: 1_000_000, heSo: 1.15, mau: '#B8C0CC' },
    { ma: 'vang', ten: ['Vàng', 'Gold', '金'], nguong: 3_000_000, heSo: 1.3, mau: '#EAC24A' },
    { ma: 'kim_cuong', ten: ['Kim Cương', 'Diamond', '钻石'], nguong: 8_000_000, heSo: 1.5, mau: '#5FD0E8' },
]

// Suy ra toàn bộ thông tin tích điểm từ tổng chi tiêu.
// Trả về: { tongChiTieu, bean, hang, hangKe, phanTram, conThieu }
export function tinhTichDiem(tongChiTieu = 0) {
    const chi = Math.max(0, Number(tongChiTieu) || 0)

    // Hạng hiện tại = hạng cao nhất mà tổng chi tiêu đã vượt ngưỡng.
    let i = 0
    while (i + 1 < HANG_THANH_VIEN.length && chi >= HANG_THANH_VIEN[i + 1].nguong) i++
    const hang = HANG_THANH_VIEN[i]
    const hangKe = HANG_THANH_VIEN[i + 1] || null

    const bean = Math.floor((chi / DONG_MOI_BEAN) * hang.heSo)

    // Tiến độ lên hạng kế tiếp (nếu còn hạng để lên).
    let phanTram = 100
    let conThieu = 0
    if (hangKe) {
        const doanDuong = hangKe.nguong - hang.nguong
        phanTram = Math.min(100, Math.max(0, Math.round(((chi - hang.nguong) / doanDuong) * 100)))
        conThieu = Math.max(0, hangKe.nguong - chi)
    }

    return { tongChiTieu: chi, bean, hang, hangKe, phanTram, conThieu }
}
