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

// ĐỘ NỔI BẬT — quyết định thứ tự hiển thị ở mọi nơi: ảnh nền đầu trang, thẻ LỚN của
// khối bento, thứ tự trong danh sách. Trước đây tất cả đều là 0 nên thứ tự rơi về
// xếp theo bảng chữ cái, và "Bảo tàng Quảng Ninh" tình cờ đứng đầu — không sai, nhưng
// biểu tượng của phường Hồng Gai phải là NÚI BÀI THƠ (chính phần giới thiệu trong
// lib/diaDiem.mjs cũng mở đầu bằng "Biểu tượng của Hồng Gai").
//
// Đặt bằng DỮ LIỆU chứ không gắn cứng id vào giao diện: sau này biên tập viên đổi
// thứ hạng ngay trong /admin/dia-diem là xong, không phải sửa code.
const NOI_BAT = {
    'nui-bai-tho': 100,                  // biểu tượng của phường
    'vinh-ha-long': 90,                  // kỳ quan thế giới
    'chua-long-tien': 80,
    'den-duc-ong': 70,
    'bao-tang-qn': 60,
    'cau-bai-chay': 50,
    'cho-ha-long-1': 40,
    'chua-bao-hai-linh-thong-tu': 35,
    'nha-bia-tho-co': 25,
    'den-ba-chua': 20,
    'vincom-hong-gai': 10,
}

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
        noiBat: NOI_BAT[d.id] ?? 0,

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

// Cập nhật ĐỘ NỔI BẬT cho những dòng ĐÃ CÓ.
// Phần trên cố tình không đè lên bản đã có (giữ nội dung biên tập viên đã sửa), nhưng
// riêng `noiBat` thì phải cập nhật được — nếu không, các bản nạp trước vẫn nằm nguyên
// ở 0 và thứ tự hiển thị lại rơi về xếp theo bảng chữ cái.
// jsonb_set chỉ chạm ĐÚNG một khoá, mọi trường khác giữ nguyên.
let daXepHang = 0
for (const [id, diem] of Object.entries(NOI_BAT)) {
    const rows = await sql`
        UPDATE dia_diem
        SET data = jsonb_set(data, '{noiBat}', ${String(diem)}::jsonb)
        WHERE id = ${id} AND COALESCE((data->>'noiBat')::int, 0) <> ${diem}
        RETURNING id`
    if (rows.length) daXepHang++
}

const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM dia_diem`
console.log(`\nĐã thêm ${daThem} địa điểm.` + (boQua.length ? ` Bỏ qua ${boQua.length} đã có: ${boQua.join(', ')}` : ''))
if (daXepHang) console.log(`Đã cập nhật độ nổi bật cho ${daXepHang} địa điểm.`)
console.log(`Bảng dia_diem hiện có ${count} địa điểm.`)

const [{ dau }] = await sql`
    SELECT data->>'ten' AS dau FROM dia_diem
    WHERE data->>'status' = 'da_duyet'
    ORDER BY COALESCE((data->>'noiBat')::int, 0) DESC LIMIT 1`
console.log(`Nổi bật nhất (ảnh nền trang chủ): ${JSON.parse(dau)[0]}`)
