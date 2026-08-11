// "Bảng" gian hàng đáng chú ý theo địa điểm — bảng `dia_diem_gian` trong Postgres (Neon).
// Do ADMIN gắn tay trong /admin/dia-diem. Mỗi dòng: (dia_diem_id, store_ids JSONB = mảng storeId).
import { sql } from './db'

// Danh sách storeId đã gắn cho 1 địa điểm
export async function layGianCuaDiaDiem(diaDiemId) {
    const rows = await sql`SELECT store_ids FROM dia_diem_gian WHERE dia_diem_id = ${diaDiemId} LIMIT 1`
    return rows[0]?.store_ids || []
}

// Toàn bộ mapping — dùng cho trang admin: { [diaDiemId]: [storeId, ...] }
export async function layTatCaGianTheoDiaDiem() {
    const rows = await sql`SELECT dia_diem_id, store_ids FROM dia_diem_gian`
    const kq = {}
    for (const r of rows) kq[r.dia_diem_id] = r.store_ids || []
    return kq
}

// Admin ghi đè danh sách gian của 1 địa điểm
export async function ganGianChoDiaDiem(diaDiemId, storeIds) {
    const rows = await sql`
        INSERT INTO dia_diem_gian (dia_diem_id, store_ids)
        VALUES (${diaDiemId}, ${JSON.stringify(storeIds)}::jsonb)
        ON CONFLICT (dia_diem_id) DO UPDATE SET store_ids = EXCLUDED.store_ids
        RETURNING store_ids`
    return rows[0]?.store_ids || []
}

// ---- Quán ăn gần đó theo địa điểm — bảng `dia_diem_quan` (song song với gian) ----

// Danh sách quanAnId đã gắn cho 1 địa điểm
export async function layQuanCuaDiaDiem(diaDiemId) {
    const rows = await sql`SELECT quan_ids FROM dia_diem_quan WHERE dia_diem_id = ${diaDiemId} LIMIT 1`
    return rows[0]?.quan_ids || []
}

// Toàn bộ mapping — dùng cho trang admin: { [diaDiemId]: [quanAnId, ...] }
export async function layTatCaQuanTheoDiaDiem() {
    const rows = await sql`SELECT dia_diem_id, quan_ids FROM dia_diem_quan`
    const kq = {}
    for (const r of rows) kq[r.dia_diem_id] = r.quan_ids || []
    return kq
}

// Admin ghi đè danh sách quán ăn gần của 1 địa điểm
export async function ganQuanChoDiaDiem(diaDiemId, quanIds) {
    const rows = await sql`
        INSERT INTO dia_diem_quan (dia_diem_id, quan_ids)
        VALUES (${diaDiemId}, ${JSON.stringify(quanIds)}::jsonb)
        ON CONFLICT (dia_diem_id) DO UPDATE SET quan_ids = EXCLUDED.quan_ids
        RETURNING quan_ids`
    return rows[0]?.quan_ids || []
}
