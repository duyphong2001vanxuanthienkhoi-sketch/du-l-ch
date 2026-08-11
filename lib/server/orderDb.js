// "Bảng" đơn hàng — bảng `orders` trong Postgres (Neon), mỗi dòng (id, data JSONB).
// Một đơn có thể chứa sản phẩm từ NHIỀU gian; mỗi item lưu kèm storeId
// để tiểu thương lọc được phần đơn thuộc gian mình.
import { sql } from './db'
import crypto from 'crypto'
import { chuanTT, trangThaiChung } from '@/lib/trangThaiDon'
import { hoanTonKhoChoDon } from './productDb'

export async function taoDonHang({ userId, ten, soDienThoai, diaChi, hinhThucGiao, items, tongTienHang, maGiam = null, tienGiam = 0, tongTien }) {
    // Trạng thái giao lưu RIÊNG theo từng gian trong đơn
    const statusTheoGian = {}
    for (const it of items) statusTheoGian[it.storeId] = 'cho_xac_nhan'

    const don = {
        id: 'o_' + crypto.randomUUID(),
        userId, // null nếu khách vãng lai
        ten,
        soDienThoai,
        diaChi,
        hinhThucGiao, // 'giao_nhanh' | 'gui_xa'
        items,        // ảnh chụp sản phẩm tại thời điểm đặt: tên, giá, số lượng, gian
        tongTienHang, // tổng tiền hàng trước giảm
        maGiam,       // mã giảm giá đã áp (null nếu không dùng)
        tienGiam,     // số tiền được giảm (0 nếu không dùng)
        tongTien,     // số tiền khách phải trả = tongTienHang - tienGiam
        statusTheoGian, // { storeId: 'moi' | 'dang_giao' | 'da_giao' }
        createdAt: new Date().toISOString(),
    }
    await sql`INSERT INTO orders (id, data) VALUES (${don.id}, ${JSON.stringify(don)}::jsonb)`
    return chuanHoaDon(don)
}

// Chuẩn hoá trạng thái từng gian (đơn cũ 'moi' -> 'cho_xac_nhan', bổ sung gian còn thiếu)
// rồi suy ra trạng thái CHUNG của đơn (xem lib/trangThaiDon: trả hàng > đã hủy > đã giao > bước trễ nhất).
function chuanHoaDon(don) {
    const statusTheoGian = {}
    for (const [k, v] of Object.entries(don.statusTheoGian || {})) statusTheoGian[k] = chuanTT(v)
    for (const it of don.items) {
        if (!statusTheoGian[it.storeId]) statusTheoGian[it.storeId] = 'cho_xac_nhan'
    }
    return { ...don, statusTheoGian, status: trangThaiChung(statusTheoGian) }
}

// GHI DB: tiểu thương cập nhật trạng thái PHẦN CỦA GIAN MÌNH trong đơn.
// Đọc-sửa-ghi trong ứng dụng: mỗi gian chỉ tự đổi phần của mình nên gần như không đụng nhau.
export async function capNhatTrangThaiGianTrongDon(orderId, storeId, status) {
    const rows = await sql`SELECT data FROM orders WHERE id = ${orderId} LIMIT 1`
    const don = rows[0]?.data
    if (!don) return null
    don.statusTheoGian = { ...(don.statusTheoGian || {}), [storeId]: status }
    await sql`UPDATE orders SET data = ${JSON.stringify(don)}::jsonb WHERE id = ${orderId}`
    return chuanHoaDon(don)
}

// GHI DB: KHÁCH tự HỦY đơn — chỉ khi đơn còn 'chờ xác nhận' (chưa gian nào xác nhận) & đúng chủ đơn.
export async function khachHuyDon(orderId, userId) {
    const rows = await sql`SELECT data FROM orders WHERE id = ${orderId} LIMIT 1`
    const don = rows[0]?.data
    if (!don) return { error: 'Không tìm thấy đơn' }
    if (!userId || don.userId !== userId) return { error: 'Bạn không có quyền với đơn này' }
    if (trangThaiChung(don.statusTheoGian) !== 'cho_xac_nhan') {
        return { error: 'Chỉ hủy được đơn đang chờ xác nhận' }
    }
    const stt = {}
    for (const k of Object.keys(don.statusTheoGian || {})) stt[k] = 'da_huy'
    don.statusTheoGian = stt
    don.huyLuc = new Date().toISOString()
    await sql`UPDATE orders SET data = ${JSON.stringify(don)}::jsonb WHERE id = ${orderId}`
    // Đơn hủy khi còn 'chờ xác nhận' (chưa giao) -> hoàn lại tồn kho đã trừ lúc đặt
    try { await hoanTonKhoChoDon(don.items) } catch { /* hủy vẫn thành công dù hoàn kho gặp lỗi */ }
    return { don: chuanHoaDon(don) }
}

// GHI DB: KHÁCH yêu cầu HOÀN HÀNG — chỉ khi đơn đã giao & đúng chủ đơn. Các phần 'đã giao' -> 'trả hàng',
// lưu lý do; gian sẽ duyệt (chấp nhận/từ chối).
export async function khachYeuCauHoan(orderId, userId, lyDo) {
    const rows = await sql`SELECT data FROM orders WHERE id = ${orderId} LIMIT 1`
    const don = rows[0]?.data
    if (!don) return { error: 'Không tìm thấy đơn' }
    if (!userId || don.userId !== userId) return { error: 'Bạn không có quyền với đơn này' }
    if (trangThaiChung(don.statusTheoGian) !== 'da_giao') {
        return { error: 'Chỉ yêu cầu hoàn với đơn đã giao' }
    }
    const stt = { ...don.statusTheoGian }
    const hoan = { ...(don.hoanHangTheoGian || {}) }
    const luc = new Date().toISOString()
    for (const [k, v] of Object.entries(stt)) {
        if (chuanTT(v) === 'da_giao') {
            stt[k] = 'tra_hang'
            hoan[k] = { lyDo: String(lyDo || '').trim().slice(0, 500), luc, ketQua: null }
        }
    }
    don.statusTheoGian = stt
    don.hoanHangTheoGian = hoan
    await sql`UPDATE orders SET data = ${JSON.stringify(don)}::jsonb WHERE id = ${orderId}`
    return { don: chuanHoaDon(don) }
}

// GHI DB: GIAN xử lý yêu cầu hoàn phần mình — chấp nhận (giữ 'trả hàng') hoặc từ chối (về 'đã giao').
export async function gianXuLyHoan(orderId, storeId, chapNhan) {
    const rows = await sql`SELECT data FROM orders WHERE id = ${orderId} LIMIT 1`
    const don = rows[0]?.data
    if (!don) return null
    const hoan = { ...(don.hoanHangTheoGian || {}) }
    don.statusTheoGian = { ...don.statusTheoGian, [storeId]: chapNhan ? 'tra_hang' : 'da_giao' }
    hoan[storeId] = { ...(hoan[storeId] || {}), ketQua: chapNhan ? 'chap_nhan' : 'tu_choi', xuLyLuc: new Date().toISOString() }
    don.hoanHangTheoGian = hoan
    await sql`UPDATE orders SET data = ${JSON.stringify(don)}::jsonb WHERE id = ${orderId}`
    return chuanHoaDon(don)
}

export async function timDonTheoId(id) {
    const rows = await sql`SELECT data FROM orders WHERE id = ${id} LIMIT 1`
    return rows[0]?.data ? chuanHoaDon(rows[0].data) : null
}

// Tra cứu đơn cho KHÁCH VÃNG LAI: phải khớp CẢ 8 ký tự cuối mã đơn LẪN số điện thoại
// (chỉ biết một trong hai thì không tra được — tránh dò đơn người khác).
export async function timDonTraCuu(ma, soDienThoai) {
    const maChuan = String(ma || '').trim().toUpperCase()
    const sdtChuan = String(soDienThoai || '').replace(/\D/g, '')
    if (maChuan.length < 4 || sdtChuan.length < 8) return null
    // So khớp 8 ký tự cuối mã (không phân biệt hoa/thường) + số điện thoại đã bỏ ký tự thừa.
    const rows = await sql`
        SELECT data FROM orders
        WHERE upper(right(id, 8)) = ${maChuan}
          AND regexp_replace(data->>'soDienThoai', '\D', '', 'g') = ${sdtChuan}
        LIMIT 1`
    return rows[0]?.data ? chuanHoaDon(rows[0].data) : null
}

export async function danhSachTatCaDon() {
    const rows = await sql`SELECT data FROM orders ORDER BY data->>'createdAt' DESC`
    return rows.map(r => chuanHoaDon(r.data))
}

export async function danhSachDonTheoKhach(userId) {
    const rows = await sql`SELECT data FROM orders WHERE data->>'userId' = ${userId} ORDER BY data->>'createdAt' DESC`
    return rows.map(r => chuanHoaDon(r.data))
}

// Đơn có chứa ít nhất 1 sản phẩm của gian (item nào có storeId = gian này)
export async function danhSachDonTheoGian(storeId) {
    const chua = JSON.stringify([{ storeId }])
    const rows = await sql`
        SELECT data FROM orders
        WHERE data->'items' @> ${chua}::jsonb
        ORDER BY data->>'createdAt' DESC`
    return rows.map(r => chuanHoaDon(r.data))
}

// Khách đã MUA & NHẬN (phần gian trong đơn = 'da_giao') một sản phẩm cụ thể chưa?
// Dùng để chặn đánh giá sản phẩm khi chưa từng mua & nhận hàng.
export async function khachDaNhanSanPham(userId, productId, storeId) {
    if (!userId || !productId || !storeId) return false
    const chua = JSON.stringify([{ productId }])
    const rows = await sql`
        SELECT 1 FROM orders
        WHERE data->>'userId' = ${userId}
          AND data->'items' @> ${chua}::jsonb
          AND data->'statusTheoGian'->>${storeId} = 'da_giao'
        LIMIT 1`
    return rows.length > 0
}

// Khách đã MUA & NHẬN hàng từ một gian chưa (bất kỳ sản phẩm nào của gian, phần gian = 'da_giao')?
// Dùng để chặn đánh giá gian hàng khi chưa từng mua & nhận hàng ở gian đó.
export async function khachDaNhanTuGian(userId, storeId) {
    if (!userId || !storeId) return false
    const chua = JSON.stringify([{ storeId }])
    const rows = await sql`
        SELECT 1 FROM orders
        WHERE data->>'userId' = ${userId}
          AND data->'items' @> ${chua}::jsonb
          AND data->'statusTheoGian'->>${storeId} = 'da_giao'
        LIMIT 1`
    return rows.length > 0
}

// SỐ ĐÃ BÁN của từng sản phẩm — { productId: soLuong }.
// Tín hiệu tin cậy mạnh nhất với khách mua chợ mạng ("đã bán 47" nói nhiều hơn mọi lời
// quảng cáo), mà dữ liệu vốn đã nằm sẵn trong đơn nên không phải ghi thêm bảng nào.
//
// Đếm theo SỐ LƯỢNG món trong đơn, và chỉ tính phần gian KHÔNG bị hủy — hàng bị hủy hoặc
// trả lại thì chưa từng bán được. Không đòi 'da_giao' vì đơn đang giao cũng là đã bán,
// bắt chờ giao xong mới đếm sẽ làm con số trông èo uột so với thực tế.
// GỘP NGAY TRONG SQL thay vì kéo cả bảng đơn về rồi cộng bằng JS: /api/products gọi hàm
// này ở MỌI lần tải trang, mà `SELECT data FROM orders` là chuyển toàn bộ JSON đơn hàng
// qua mạng — Neon đã báo "too many database connection attempts" khi trang chủ bắn vài
// lệnh gọi cùng lúc. Truy vấn dưới đây chỉ trả về một dòng cho mỗi sản phẩm.
export async function soDaBanTheoSanPham() {
    let rows = []
    try {
        rows = await sql`
            SELECT it->>'productId' AS id,
                   SUM(COALESCE((it->>'soLuong')::numeric, 0)) AS n
            FROM orders o, jsonb_array_elements(o.data->'items') it
            WHERE it->>'productId' IS NOT NULL
              AND COALESCE(o.data->'statusTheoGian'->>(it->>'storeId'), 'cho_xac_nhan')
                  NOT IN ('da_huy', 'tra_hang')
            GROUP BY 1`
    } catch {
        return {} // chợ chưa có đơn / DB trục trặc: coi như chưa bán được món nào
    }
    return Object.fromEntries(rows.map(r => [r.id, Number(r.n) || 0]))
}
