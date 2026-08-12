// Nạp bộ địa điểm biên tập sẵn (11 mục) (lib/diaDiem.mjs) vào bảng `dia_diem`.
// Chạy:  npm run nap-dia-diem      (cần chạy `npm run tao-bang-du-lich` trước)
//
// AN TOÀN KHI CHẠY LẠI: địa điểm đã có thì BỎ QUA, không ghi đè — nội dung biên tập viên
// đã sửa trên web sẽ không bị bản mồi đè mất.
//
// Cùng logic với API /api/admin/dia-diem/nap-mau (nút bấm trong trang quản trị);
// script này để dựng dữ liệu lần đầu mà chưa cần có tài khoản admin.
import { ketNoiAnToan } from './_csdl.mjs'
import { DIA_DIEM } from '../lib/diaDiem.mjs'

const sql = await ketNoiAnToan()

// Loại hình bản mồi chỉ là CHỮ tiếng Việt (['Di tích', ...]) chứ không phải id —
// phải ánh xạ sang id chuẩn trong lib/diaDiemLoai.js.
const LOAI_CU_SANG_MOI = {
    'Di tích': 'di_tich',
    'Tâm linh': 'tam_linh',
    'Mua sắm': 'mua_sam',
    'Văn hóa': 'van_hoa',
    'Văn hoá': 'van_hoa',
    'Ngắm cảnh': 'ngam_canh',
    'Kỳ quan': 'ngam_canh',
}

// Suy mức giá từ CÂU CHỮ giá vé. Chỉ nhận ra "miễn phí / tự do"; còn lại để trống
// cho biên tập viên tự chọn. Cố tình KHÔNG đoán con số — thà thiếu còn hơn hiện sai giá.
const suyMucGia = (giaVeVi = '') => (/miễn phí|tự do/i.test(giaVeVi) ? 'mien_phi' : null)

const ba = (v) => (Array.isArray(v) ? [0, 1, 2].map(i => String(v[i] ?? '')) : ['', '', ''])

function chuyenDoi(d) {
    const loaiVi = Array.isArray(d.loai) ? d.loai[0] : d.loai
    const luc = new Date().toISOString()
    return {
        id: d.id,
        loai: LOAI_CU_SANG_MOI[loaiVi] || 'ngam_canh',
        nhan: [],

        ten: ba(d.ten),
        mota: ba(d.mota),
        gioiThieu: (d.gioiThieu || []).map(ba),
        diemNoiBat: (d.diemNoiBat || []).map(ba),

        viTri: Array.isArray(d.viTri) ? [Number(d.viTri[0]), Number(d.viTri[1])] : null,
        diaChi: '',
        gioMoCua: '', gioDongCua: '', ngayNghi: [],

        // GIÁ: chỉ 2 trường, không có bảng giá chi tiết
        mucGia: suyMucGia(d.thongTin?.giaVe?.[0] || ''),
        giaVe: ba(d.thongTin?.giaVe),

        gioMoCuaMoTa: ba(d.thongTin?.gioMoCua),
        diChuyen: ba(d.thongTin?.diChuyen),

        dienThoai: '', website: '', facebook: '', tienIch: [],

        anhBia: '',
        anhs: d.thuVienAnh || [],
        mau: d.mau || '',
        icon: d.icon || '',

        lanCan: d.lanCan || [],
        nguon: 'bien_tap',
        userId: null,
        status: 'da_duyet',
        noiBat: 0,

        // Toạ độ trên bản đồ vẽ tay (khác viTri của bản đồ thật)
        x: d.x ?? null, y: d.y ?? null, nhanPhai: d.nhanPhai ?? false,

        luotXem: 0,
        createdAt: luc,
        capNhatLuc: luc,
    }
}

let daThem = 0
const boQua = []

for (const d of DIA_DIEM) {
    const dd = chuyenDoi(d)
    // ON CONFLICT DO NOTHING: chạy lại không nhân đôi, cũng không đè bản đã sửa
    const rows = await sql`
        INSERT INTO dia_diem (id, data) VALUES (${dd.id}, ${JSON.stringify(dd)}::jsonb)
        ON CONFLICT (id) DO NOTHING
        RETURNING id`
    if (rows.length) { daThem++; console.log('  + ', dd.id, '—', dd.loai) }
    else boQua.push(dd.id)
}

const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM dia_diem`
console.log(`\nĐã thêm ${daThem} địa điểm.` + (boQua.length ? ` Bỏ qua ${boQua.length} đã có: ${boQua.join(', ')}` : ''))
console.log(`Bảng dia_diem hiện có ${count} địa điểm.`)
