// GỢI Ý SẢN PHẨM cho trang chi tiết — trả 3 nhóm cho một sản phẩm đang xem:
//   cungGian : sản phẩm khác của CHÍNH gian đó (tín hiệu mạnh nhất ở chợ này — cùng gian
//              nghĩa là gom được vào một chuyến giao, khách nhận cùng lúc)
//   muaKem   : sản phẩm từng nằm CHUNG ĐƠN với nó (dữ liệu thật từ bảng orders)
//   goiY     : "có thể bạn cũng thích" — chấm điểm theo danh mục / khu / khoảng giá / sao
//
// Nguyên tắc: chấm điểm TẤT ĐỊNH (không random) để khách quay lại vẫn thấy thứ tự cũ —
// dải gợi ý nhảy loạn mỗi lần tải trông như lỗi. Sản phẩm hết hàng luôn bị đẩy xuống cuối.
import { sql } from './db'
import { danhSachTatCaSanPham, timSanPhamTheoId } from './productDb'
import { danhSachGian } from './storeDb'
import { thongKeTheoSanPham } from './ratingDb'
import { soDaBanTheoSanPham } from './orderDb'
import { sanPhamCongKhai } from './sanPhamCongKhai'
import { chuanTT } from '@/lib/trangThaiDon'

// Số lần chung đơn TỐI THIỂU để dám gắn nhãn "khách hay mua kèm". Một lần chung đơn chỉ
// là ngẫu nhiên — nói với khách rằng người ta "hay mua kèm" khi mới có đúng một đơn là
// nói quá. Chợ còn ít đơn thì nhóm này rỗng và trang tự lùi về gợi ý CÙNG GIAN (đã tính
// sẵn), nên không có chỗ nào trống. Muốn nhạy hơn khi chợ đông đơn thì giảm số này.
const TOI_THIEU_MUA_KEM = 2

// Điểm "giống" giữa sản phẩm đang xem (goc) và một ứng viên (ung).
function chamDiem(goc, ung) {
    let diem = 0
    if (ung.danhMuc && ung.danhMuc === (goc.danhMuc || '')) diem += 4 // cùng danh mục con: mạnh nhất
    if (ung.loaiGian === goc.loaiGian) diem += 2                      // cùng khu (Chợ Tươi / Quà Quảng Ninh)
    const giaGoc = Number(goc.gia) || 0
    if (giaGoc > 0 && Math.abs(ung.gia - giaGoc) <= giaGoc * 0.4) diem += 2 // cùng tầm tiền ±40%
    if (!!ung.guiDiTinh === !!goc.guiDiTinh) diem += 1                // hợp cùng một cách nhận hàng
    diem += (Number(ung.trungBinhSao) || 0) * 0.4                     // hàng được khen thì ưu tiên
    if ((ung.soLuong || 0) === 0) diem -= 100                         // hết hàng: luôn xuống cuối
    return diem
}

// Xếp hạng ổn định: điểm cao trước, hòa điểm thì hàng mới trước, rồi so id cho tất định.
const xepTheoDiem = (a, b) =>
    b.diem - a.diem ||
    String(b.sp.createdAt || '').localeCompare(String(a.sp.createdAt || '')) ||
    a.sp.id.localeCompare(b.sp.id)

const sapXep = (ds, goc) => ds
    .map(sp => ({ sp, diem: chamDiem(goc, sp) }))
    .sort(xepTheoDiem)
    .map(x => x.sp)

// Đếm số lần mỗi sản phẩm khác từng nằm CHUNG ĐƠN với sản phẩm này.
// Chỉ soi các đơn có chứa nó (JSONB containment) và bỏ phần đơn đã hủy — hàng bị hủy
// không phải là bằng chứng "mua kèm". Giới hạn số đơn để truy vấn luôn nhẹ.
async function demMuaKem(productId, { soDon = 300 } = {}) {
    const chua = JSON.stringify([{ productId }])
    let rows = []
    try {
        rows = await sql`
            SELECT data FROM orders
            WHERE data->'items' @> ${chua}::jsonb
            ORDER BY data->>'createdAt' DESC
            LIMIT ${soDon}`
    } catch {
        return {} // chợ chưa có đơn nào / DB trục trặc: coi như không có dữ liệu mua kèm
    }
    const dem = {}
    for (const { data: don } of rows) {
        const trangThai = don?.statusTheoGian || {}
        for (const it of don?.items || []) {
            if (!it?.productId || it.productId === productId) continue
            if (chuanTT(trangThai[it.storeId]) === 'da_huy') continue
            dem[it.productId] = (dem[it.productId] || 0) + 1
        }
    }
    return dem
}

// Trả null nếu sản phẩm không tồn tại hoặc gian của nó chưa được duyệt
// (khớp đúng quy tắc "chỉ lộ hàng của gian đã duyệt" của /api/products).
export async function goiYChoSanPham(productId, { soLuong = 8 } = {}) {
    const goc = await timSanPhamTheoId(productId)
    if (!goc) return null

    const gians = await danhSachGian({ status: 'da_duyet' })
    const gianTheoId = Object.fromEntries(gians.map(g => [g.id, g]))
    const gianGoc = gianTheoId[goc.storeId]
    if (!gianGoc) return null

    const [thongKeSao, tatCa, demKem, daBan] = await Promise.all([
        thongKeTheoSanPham(),
        danhSachTatCaSanPham(),
        demMuaKem(goc.id),
        soDaBanTheoSanPham(),
    ])

    const gocCongKhai = sanPhamCongKhai(goc, gianGoc, thongKeSao[goc.id], daBan[goc.id])
    const ungVien = tatCa
        .filter(p => p.id !== goc.id && gianTheoId[p.storeId])
        .map(p => sanPhamCongKhai(p, gianTheoId[p.storeId], thongKeSao[p.id], daBan[p.id]))

    // 1) Cùng gian — xếp theo độ giống với món đang xem
    const cungGian = sapXep(ungVien.filter(p => p.storeId === goc.storeId), gocCongKhai)
        .slice(0, soLuong)

    // 2) Hay mua kèm — theo số lần chung đơn, hòa thì lấy món giống hơn
    const muaKem = ungVien
        .filter(p => (demKem[p.id] || 0) >= TOI_THIEU_MUA_KEM && p.soLuong > 0)
        .map(sp => ({ sp, lan: demKem[sp.id], diem: chamDiem(gocCongKhai, sp) }))
        .sort((a, b) => b.lan - a.lan || xepTheoDiem(a, b))
        .slice(0, soLuong)
        .map(x => ({ ...x.sp, soLanMuaKem: x.lan }))

    // 3) Có thể bạn cũng thích — loại hết những gì ĐÃ hiện ở hai dải trên để trang
    //    không lặp lại cùng một sản phẩm hai lần (chợ nhỏ rất dễ bị trùng).
    const daHien = new Set([...cungGian, ...muaKem].map(p => p.id))
    const goiY = sapXep(ungVien.filter(p => !daHien.has(p.id)), gocCongKhai)
        .slice(0, soLuong)

    return {
        sp: { id: gocCongKhai.id, ten: gocCongKhai.ten, storeId: gocCongKhai.storeId, tenGian: gocCongKhai.tenGian, loaiGian: gocCongKhai.loaiGian },
        cungGian,
        muaKem,
        goiY,
    }
}
