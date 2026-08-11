// "Bảng" tin nhắn — chat KHÁCH ↔ QUÁN (không có khách↔khách).
//  - hoi_thoai: mỗi (khách, quán) một cuộc hội thoại duy nhất (id tất định để find-or-create).
//  - tin_nhan : từng tin trong hội thoại.
// Mỗi dòng theo kiểu TÀI LIỆU: (id, data JSONB) — giống các bảng khác trong dự án.
import { sql } from './db'
import crypto from 'crypto'

// 'khach' = tin do khách gửi · 'quan' = tin do chủ quán/hỗ trợ gửi
export const BEN = { KHACH: 'khach', QUAN: 'quan' }

// Id "đối tác" tất định của kênh HỖ TRỢ (chat khách ↔ admin). Không phải quán/gian thật.
export const ID_HO_TRO = 'admin'

// Id hội thoại TẤT ĐỊNH theo cặp (khách, quán) → mở lại đúng 1 cuộc, không tạo trùng.
export const idHoiThoai = (userId, quanAnId) => `ht_${userId}__${quanAnId}`

export async function timHoiThoaiTheoId(id) {
    const rows = await sql`SELECT data FROM hoi_thoai WHERE id = ${id} LIMIT 1`
    return rows[0]?.data || null
}

// Mở (hoặc tạo mới) hội thoại giữa một khách và một ĐỐI TÁC (quán ăn HOẶC gian hàng chợ).
// - quanAnId: id đối tác — là id quán ăn (q_...) hoặc id gian hàng (s_...). Vì hai bảng dùng
//   tiền tố id khác nhau nên vẫn duy nhất, giữ tên trường cũ để khỏi đổi chỉ mục/dữ liệu.
// - loaiDoiTac: 'quan' (quán ăn, mặc định) | 'gian' (gian hàng chợ) — dùng để biết tra bảng nào.
// Khách bấm "Nhắn tin" là gọi hàm này.
export async function timHoacTaoHoiThoai({ userId, quanAnId, loaiDoiTac = 'quan', tenQuan, tenKhach, logoQuan = '' }) {
    const id = idHoiThoai(userId, quanAnId)
    const now = new Date().toISOString()
    const moi = {
        id, userId, quanAnId, loaiDoiTac,
        tenQuan: tenQuan || (loaiDoiTac === 'gian' ? 'Gian hàng' : 'Quán ăn'),
        tenKhach: tenKhach || 'Khách',
        logoQuan: logoQuan || '', // logo quán/gian để hiện avatar phía khách (rỗng → dùng chữ cái)
        tinCuoi: '',
        tinCuoiBen: null,
        capNhatLuc: now,
        taoLuc: now,
        chuaDocKhach: 0,
        chuaDocQuan: 0,
    }
    // Đã có thì giữ nguyên (DO NOTHING), chưa có thì tạo.
    await sql`INSERT INTO hoi_thoai (id, data) VALUES (${id}, ${JSON.stringify(moi)}::jsonb) ON CONFLICT (id) DO NOTHING`
    const ht = await timHoiThoaiTheoId(id)
    // Backfill: hội thoại cũ chưa có logo, hoặc quán đã đổi logo → cập nhật lại cho khớp.
    if (ht && logoQuan && ht.logoQuan !== logoQuan) {
        const rows = await sql`UPDATE hoi_thoai SET data = data || ${JSON.stringify({ logoQuan })}::jsonb WHERE id = ${id} RETURNING data`
        return rows[0]?.data || ht
    }
    return ht
}

// Danh sách hội thoại của một KHÁCH (mới cập nhật lên đầu).
export async function hoiThoaiCuaKhach(userId) {
    const rows = await sql`SELECT data FROM hoi_thoai WHERE data->>'userId' = ${userId} ORDER BY data->>'capNhatLuc' DESC`
    return rows.map(r => r.data)
}

// Danh sách hội thoại của một QUÁN (mới cập nhật lên đầu).
export async function hoiThoaiCuaQuan(quanAnId) {
    const rows = await sql`SELECT data FROM hoi_thoai WHERE data->>'quanAnId' = ${quanAnId} ORDER BY data->>'capNhatLuc' DESC`
    return rows.map(r => r.data)
}

// Danh sách hội thoại HỖ TRỢ (khách ↔ admin) — cho hộp thư admin (mới cập nhật lên đầu).
export async function hoiThoaiHoTro() {
    const rows = await sql`SELECT data FROM hoi_thoai WHERE data->>'loaiDoiTac' = 'admin' ORDER BY data->>'capNhatLuc' DESC`
    return rows.map(r => r.data)
}

// Các tin trong một hội thoại (cũ → mới), giới hạn để không tải quá nhiều.
export async function tinNhanTheoHoiThoai(hoiThoaiId, gioiHan = 200) {
    const rows = await sql`
        SELECT data FROM tin_nhan
        WHERE data->>'hoiThoaiId' = ${hoiThoaiId}
        ORDER BY data->>'taoLuc' ASC
        LIMIT ${gioiHan}`
    return rows.map(r => r.data)
}

// Lưu một tin + cập nhật tóm tắt hội thoại (tin cuối, thời gian, số chưa đọc của BÊN KIA).
// Trả về { tinNhan, hoiThoai } đã cập nhật.
export async function luuTinNhan({ hoiThoaiId, ben, noiDung }) {
    const now = new Date().toISOString()
    const tin = {
        id: 'tn_' + crypto.randomUUID(),
        hoiThoaiId,
        ben,               // 'khach' | 'quan'
        noiDung,
        taoLuc: now,
    }
    await sql`INSERT INTO tin_nhan (id, data) VALUES (${tin.id}, ${JSON.stringify(tin)}::jsonb)`

    const ht = await timHoiThoaiTheoId(hoiThoaiId)
    const thayDoi = {
        tinCuoi: noiDung.slice(0, 120),
        tinCuoiBen: ben,
        capNhatLuc: now,
        // Khách gửi → quán có thêm 1 tin chưa đọc, và ngược lại.
        chuaDocKhach: (ht?.chuaDocKhach || 0) + (ben === BEN.QUAN ? 1 : 0),
        chuaDocQuan: (ht?.chuaDocQuan || 0) + (ben === BEN.KHACH ? 1 : 0),
    }
    const rows = await sql`UPDATE hoi_thoai SET data = data || ${JSON.stringify(thayDoi)}::jsonb WHERE id = ${hoiThoaiId} RETURNING data`
    return { tinNhan: tin, hoiThoai: rows[0]?.data || ht }
}

// Đánh dấu ĐÃ ĐỌC cho một bên (mở hội thoại ra xem thì về 0).
export async function danhDauDaDoc(hoiThoaiId, ben) {
    const thayDoi = ben === BEN.KHACH ? { chuaDocKhach: 0 } : { chuaDocQuan: 0 }
    const rows = await sql`UPDATE hoi_thoai SET data = data || ${JSON.stringify(thayDoi)}::jsonb WHERE id = ${hoiThoaiId} RETURNING data`
    return rows[0]?.data || null
}
