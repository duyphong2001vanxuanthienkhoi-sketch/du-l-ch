// "Bảng" đánh giá sản phẩm — bảng `ratings` trong Postgres (Neon), mỗi dòng (id, data JSONB).
// Chỉ khách ĐÃ NHẬN HÀNG (phần gian trong đơn 'da_giao') mới được đánh giá,
// mỗi sản phẩm trong mỗi đơn đánh giá đúng 1 lần.
import { sql } from './db'
import crypto from 'crypto'

export async function daDanhGia(orderId, productId, userId) {
    const rows = await sql`
        SELECT 1 FROM ratings
        WHERE data->>'orderId' = ${orderId}
          AND data->>'productId' = ${productId}
          AND data->>'userId' = ${userId}
        LIMIT 1`
    return rows.length > 0
}

export async function taoDanhGia({ orderId, productId, storeId, userId, ten, sao, binhLuan, tenSanPham, anhSanPham }) {
    const dg = {
        id: 'r_' + crypto.randomUUID(),
        orderId,
        productId,
        storeId,      // để trang gian gom được đánh giá của cả gian
        userId,
        ten,          // tên người đánh giá (chụp lại lúc gửi)
        sao,          // 1..5
        binhLuan,
        tenSanPham,   // chụp lại — vẫn hiển thị được nếu sản phẩm bị xóa
        anhSanPham,
        createdAt: new Date().toISOString(),
    }
    await sql`INSERT INTO ratings (id, data) VALUES (${dg.id}, ${JSON.stringify(dg)}::jsonb)`
    return dg
}

// ---- Đánh giá TRỰC TIẾP (không cần mua) --------------------------------
// Bốn loại bản ghi trong bảng ratings, nhận diện theo trường có mặt:
//  - Mua rồi đánh giá sản phẩm: có orderId + productId  (kiểm soát theo đơn)
//  - Đánh giá thẳng sản phẩm:   có productId, KHÔNG orderId (mỗi người 1 lần/sản phẩm)
//  - Đánh giá thẳng gian hàng:  có storeId,  KHÔNG productId (mỗi người 1 lần/gian)
//  - Đánh giá địa điểm du lịch: có diaDiemId (mỗi người 1 lần/địa điểm)

export async function daDanhGiaGian(storeId, userId) {
    const rows = await sql`
        SELECT 1 FROM ratings
        WHERE data->>'storeId' = ${storeId}
          AND data->>'userId' = ${userId}
          AND data->>'productId' IS NULL
        LIMIT 1`
    return rows.length > 0
}

export async function taoDanhGiaGian({ storeId, userId, ten, sao, binhLuan }) {
    const dg = {
        id: 'r_' + crypto.randomUUID(),
        storeId,
        userId,
        ten,
        sao,
        binhLuan,
        createdAt: new Date().toISOString(),
    }
    await sql`INSERT INTO ratings (id, data) VALUES (${dg.id}, ${JSON.stringify(dg)}::jsonb)`
    return dg
}

export async function daDanhGiaDiaDiem(diaDiemId, userId) {
    const rows = await sql`
        SELECT 1 FROM ratings
        WHERE data->>'diaDiemId' = ${diaDiemId}
          AND data->>'userId' = ${userId}
        LIMIT 1`
    return rows.length > 0
}

export async function taoDanhGiaDiaDiem({ diaDiemId, userId, ten, sao, binhLuan, anhs = [] }) {
    const dg = {
        id: 'r_' + crypto.randomUUID(),
        diaDiemId,
        userId,
        ten,
        sao,
        binhLuan,
        // Ảnh du khách tự chụp — nội dung sống động nhất của app du lịch,
        // và là thứ ảnh biên tập không thay thế được.
        anhs: Array.isArray(anhs) ? anhs.filter(Boolean).slice(0, 4) : [],
        createdAt: new Date().toISOString(),
    }
    await sql`INSERT INTO ratings (id, data) VALUES (${dg.id}, ${JSON.stringify(dg)}::jsonb)`
    return dg
}

export async function danhGiaTheoDiaDiem(diaDiemId) {
    const rows = await sql`
        SELECT r.data AS data, u.data->>'avatar' AS avatar
        FROM ratings r
        LEFT JOIN users u ON u.data->>'id' = r.data->>'userId'
        WHERE r.data->>'diaDiemId' = ${diaDiemId}
        ORDER BY r.data->>'createdAt' DESC`
    return rows.map(r => ({ ...r.data, anhNguoiDung: r.avatar || null }))
}

export async function daDanhGiaSanPhamTrucTiep(productId, userId) {
    const rows = await sql`
        SELECT 1 FROM ratings
        WHERE data->>'productId' = ${productId}
          AND data->>'userId' = ${userId}
          AND data->>'orderId' IS NULL
        LIMIT 1`
    return rows.length > 0
}

export async function taoDanhGiaSanPhamTrucTiep({ productId, storeId, userId, ten, sao, binhLuan }) {
    const dg = {
        id: 'r_' + crypto.randomUUID(),
        productId,
        storeId, // giữ để sau này cần gom theo gian vẫn tra được
        userId,
        ten,
        sao,
        binhLuan,
        daMua: true, // API chỉ cho tạo khi khách đã mua & nhận sản phẩm → gắn nhãn "đã mua hàng"
        createdAt: new Date().toISOString(),
    }
    await sql`INSERT INTO ratings (id, data) VALUES (${dg.id}, ${JSON.stringify(dg)}::jsonb)`
    return dg
}

export async function danhGiaTheoSanPham(productId) {
    const rows = await sql`
        SELECT r.data AS data, u.data->>'avatar' AS avatar
        FROM ratings r
        LEFT JOIN users u ON u.data->>'id' = r.data->>'userId'
        WHERE r.data->>'productId' = ${productId}
        ORDER BY r.data->>'createdAt' DESC`
    return rows.map(r => ({ ...r.data, anhNguoiDung: r.avatar || null }))
}

// Trang gian CHỈ hiện đánh giá về GIAN (không lẫn bình luận sản phẩm —
// bình luận sản phẩm nằm ở trang từng sản phẩm).
export async function danhGiaTheoGian(storeId) {
    const rows = await sql`
        SELECT r.data AS data, u.data->>'avatar' AS avatar
        FROM ratings r
        LEFT JOIN users u ON u.data->>'id' = r.data->>'userId'
        WHERE r.data->>'storeId' = ${storeId}
          AND r.data->>'productId' IS NULL
        ORDER BY r.data->>'createdAt' DESC`
    return rows.map(r => ({ ...r.data, anhNguoiDung: r.avatar || null }))
}

// { [productId]: { trungBinhSao, soDanhGia } } — để gắn sao lên thẻ sản phẩm
export async function thongKeTheoSanPham() {
    const rows = await sql`
        SELECT data->>'productId' AS pid,
               round(avg((data->>'sao')::numeric), 1) AS tb,
               count(*) AS n
        FROM ratings
        WHERE data->>'productId' IS NOT NULL
        GROUP BY data->>'productId'`
    const kq = {}
    for (const r of rows) {
        kq[r.pid] = { trungBinhSao: Number(r.tb), soDanhGia: Number(r.n) }
    }
    return kq
}

// { [storeId]: { trungBinhSao, soDanhGia } } — sao trung bình đánh giá TRỰC TIẾP gian,
// khớp với danhGiaTheoGian ở trang gian (KHÔNG gộp đánh giá sản phẩm) để con số ở thẻ
// gian trùng với con số trong trang gian. Dùng gắn sao lên thẻ gian ở trang chợ/trang chủ.
export async function thongKeTheoGian() {
    const rows = await sql`
        SELECT data->>'storeId' AS sid,
               round(avg((data->>'sao')::numeric), 1) AS tb,
               count(*) AS n
        FROM ratings
        WHERE data->>'storeId' IS NOT NULL
          AND data->>'productId' IS NULL
        GROUP BY data->>'storeId'`
    const kq = {}
    for (const r of rows) {
        kq[r.sid] = { trungBinhSao: Number(r.tb), soDanhGia: Number(r.n) }
    }
    return kq
}
