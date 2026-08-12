// "Bảng" ĐỊA ĐIỂM — bảng `dia_diem` trong Postgres (Neon), mỗi dòng (id, data JSONB).
//
// Đây là THỰC THỂ TRUNG TÂM của app du lịch: mọi thứ đều là một địa điểm —
// quán ăn, cà phê, chùa, di tích, bảo tàng, điểm ngắm cảnh, khu vui chơi, chỗ lưu trú...
// Phân biệt bằng trường `loai` (xem LOAI_DIA_DIEM trong lib/diaDiemLoai.js).
//
// id là SLUG (vd 'chua-long-tien') nên dùng thẳng làm URL /dia-diem/<id>.
// Nội dung chữ theo quy ước sẵn có của app: mảng [vi, en, zh].
//
// LƯU Ý: mọi chỗ hiển thị công khai cho khách PHẢI gọi với { status: 'da_duyet' }.
import { sql } from './db'
import { taoSlug } from '@/lib/diaDiemLoai'

// Chuẩn hoá một trường chữ đa ngữ về đúng mảng 3 phần tử [vi, en, zh].
// Thiếu bản dịch nào thì để chuỗi rỗng — giao diện tự lùi về tiếng Việt qua t(...).
const ba = (v) => {
    if (!Array.isArray(v)) return [String(v ?? ''), '', '']
    return [0, 1, 2].map(i => String(v[i] ?? ''))
}

// Chuẩn hoá mảng-các-đoạn: [[vi,en,zh], [vi,en,zh], ...] — bỏ đoạn rỗng cả 3 thứ tiếng.
const baNhieu = (v) => (Array.isArray(v) ? v : [])
    .map(ba)
    .filter(d => d.some(s => s.trim()))

// Toạ độ [vĩ độ, kinh độ] — trả null nếu không hợp lệ (để bản đồ bỏ qua, không vẽ ghim sai chỗ).
const toaDo = (v) => {
    if (!Array.isArray(v) || v.length < 2) return null
    const lat = Number(v[0]), lng = Number(v[1])
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
    return [lat, lng]
}

// Dựng object địa điểm sạch từ dữ liệu form/API gửi lên.
// Chỉ nhận đúng các trường đã biết — không cho ghi bừa khoá lạ vào JSONB.
export function chuanHoaDiaDiem(d = {}, cu = null) {
    const ten = ba(d.ten)
    return {
        id: cu?.id || taoSlug(d.id || ten[0]),
        loai: d.loai || 'ngam_canh',
        nhan: Array.isArray(d.nhan) ? d.nhan.filter(Boolean) : [],

        ten,
        mota: ba(d.mota),
        gioiThieu: baNhieu(d.gioiThieu),
        diemNoiBat: baNhieu(d.diemNoiBat),

        // Không lùi về giá trị cũ ở đây: khi SỬA, capNhatDiaDiem đã trải {...cu, ...thayDoi}
        // nên trường không gửi lên vẫn còn nguyên. Nhờ vậy gửi rỗng/null = XOÁ được thật.
        viTri: toaDo(d.viTri),
        diaChi: String(d.diaChi ?? ''),
        gioMoCua: String(d.gioMoCua ?? ''),
        gioDongCua: String(d.gioDongCua ?? ''),
        ngayNghi: Array.isArray(d.ngayNghi) ? d.ngayNghi.map(Number).filter(n => n >= 0 && n <= 6) : [],

        // GIÁ: chỉ 2 trường, không có bảng giá chi tiết (THIET-KE-APP-DU-LICH.md mục 6.1)
        mucGia: d.mucGia || null,
        giaVe: ba(d.giaVe),

        // Thông tin tham quan còn lại — giữ đúng tên trường của bản hardcode cũ
        gioMoCuaMoTa: ba(d.gioMoCuaMoTa),
        diChuyen: ba(d.diChuyen),

        dienThoai: String(d.dienThoai ?? ''),
        website: String(d.website ?? ''),
        facebook: String(d.facebook ?? ''),
        tienIch: Array.isArray(d.tienIch) ? d.tienIch.filter(Boolean) : [],

        anhBia: String(d.anhBia ?? ''),
        anhs: Array.isArray(d.anhs) ? d.anhs.filter(Boolean) : [],
        mau: String(d.mau ?? ''),
        icon: String(d.icon ?? ''),

        lanCan: Array.isArray(d.lanCan) ? d.lanCan.filter(Boolean) : [],
        nguon: d.nguon || 'bien_tap',
        status: d.status || 'da_duyet',
        noiBat: Number(d.noiBat) || 0,

        // Toạ độ trên BẢN ĐỒ VẼ TAY ở trang chủ (BanDoSo) — khác viTri (bản đồ thật).
        // Giữ lại để khối bản đồ cách điệu hiện có không vỡ.
        x: d.x === '' || d.x == null || !Number.isFinite(Number(d.x)) ? null : Number(d.x),
        y: d.y === '' || d.y == null || !Number.isFinite(Number(d.y)) ? null : Number(d.y),
        nhanPhai: !!d.nhanPhai,

        // Trường KHÔNG do form sửa — luôn giữ theo bản cũ khi cập nhật
        userId: cu?.userId ?? d.userId ?? null,

        luotXem: cu?.luotXem ?? 0,
        createdAt: cu?.createdAt || new Date().toISOString(),
        capNhatLuc: new Date().toISOString(),
    }
}

// Danh sách địa điểm. Lọc theo trạng thái và/hoặc loại hình.
// Sắp xếp: nổi bật giảm dần, rồi theo tên tiếng Việt.
export async function danhSachDiaDiem({ status, loai } = {}) {
    let rows
    if (status && loai) {
        rows = await sql`SELECT data FROM dia_diem
            WHERE data->>'status' = ${status} AND data->>'loai' = ${loai}`
    } else if (status) {
        rows = await sql`SELECT data FROM dia_diem WHERE data->>'status' = ${status}`
    } else if (loai) {
        rows = await sql`SELECT data FROM dia_diem WHERE data->>'loai' = ${loai}`
    } else {
        rows = await sql`SELECT data FROM dia_diem`
    }
    return rows
        .map(r => r.data)
        .sort((a, b) => (b.noiBat || 0) - (a.noiBat || 0) ||
            String(a.ten?.[0] || '').localeCompare(String(b.ten?.[0] || ''), 'vi'))
}

export async function timDiaDiemTheoId(id) {
    const rows = await sql`SELECT data FROM dia_diem WHERE id = ${id} LIMIT 1`
    return rows[0]?.data || null
}

// Thêm địa điểm mới. Trùng id thì báo lỗi (không ghi đè ngầm lên bài viết của người khác).
export async function taoDiaDiem(d) {
    const dd = chuanHoaDiaDiem(d)
    if (!dd.id) throw new Error('Thiếu tên địa điểm để tạo mã')
    const daCo = await timDiaDiemTheoId(dd.id)
    if (daCo) throw new Error(`Mã "${dd.id}" đã tồn tại — đổi tên hoặc sửa địa điểm đang có`)
    await sql`INSERT INTO dia_diem (id, data) VALUES (${dd.id}, ${JSON.stringify(dd)}::jsonb)`
    return dd
}

// Sửa địa điểm: dựng lại object đầy đủ từ bản cũ + dữ liệu mới rồi ghi đè.
// Không dùng phép gộp `data || ...` vì các trường mảng (anhs, lanCan, tienIch) cần
// thay THẲNG chứ không gộp — bỏ một tiện ích thì nó phải biến mất thật.
export async function capNhatDiaDiem(id, thayDoi) {
    const cu = await timDiaDiemTheoId(id)
    if (!cu) return null
    const moi = chuanHoaDiaDiem({ ...cu, ...thayDoi }, cu)
    await sql`UPDATE dia_diem SET data = ${JSON.stringify(moi)}::jsonb WHERE id = ${id}`
    return moi
}

export async function xoaDiaDiem(id) {
    const rows = await sql`DELETE FROM dia_diem WHERE id = ${id} RETURNING id`
    return rows.length > 0
}

// Đếm lượt xem — gọi từ trang chi tiết. Lỗi thì bỏ qua, không chặn hiển thị trang.
export async function tangLuotXem(id) {
    try {
        await sql`UPDATE dia_diem
            SET data = jsonb_set(data, '{luotXem}',
                to_jsonb(COALESCE((data->>'luotXem')::int, 0) + 1))
            WHERE id = ${id}`
    } catch { /* bỏ qua */ }
}
