import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import { taoDiaDiem, timDiaDiemTheoId } from '@/lib/server/diaDiemDb'
import { DIA_DIEM } from '@/lib/diaDiem'

// POST /api/admin/dia-diem/nap-mau
// Nạp bộ địa điểm biên tập sẵn từ lib/diaDiem.mjs vào bảng `dia_diem`.
//
// Đây là bản BẤM NÚT trong /admin/dia-diem. Bản dòng lệnh tương đương:
//     npm run nap-dia-diem     (scripts/nap-dia-diem.mjs)
// Giữ cả hai vì mỗi cái tiện một lúc: script chạy được khi CHƯA có tài khoản admin,
// nút bấm tiện khi đã vào trang quản trị. Cùng quy tắc bỏ qua bản đã có.
//
// AN TOÀN KHI CHẠY LẠI: địa điểm đã có thì BỎ QUA, không ghi đè — nội dung biên tập
// viên đã sửa trên web sẽ không bị bản hardcode cũ đè mất.

// Loại hình bản cũ chỉ là CHỮ tiếng Việt (['Di tích', 'Heritage site', '古迹']),
// không phải id — phải ánh xạ sang id chuẩn trong lib/diaDiemLoai.js.
const LOAI_CU_SANG_MOI = {
    'Di tích': 'di_tich',
    'Tâm linh': 'tam_linh',
    'Mua sắm': 'mua_sam',
    'Văn hóa': 'van_hoa',
    'Văn hoá': 'van_hoa',
    'Ngắm cảnh': 'ngam_canh',
    'Kỳ quan': 'ngam_canh',
}

// Suy mức giá từ CÂU CHỮ giá vé sẵn có. Chỉ nhận ra được "miễn phí / tự do";
// còn lại ('Tham khảo tại quầy'...) để trống — biên tập viên tự chọn sau.
// Cố tình KHÔNG đoán con số: thà thiếu còn hơn hiện sai giá.
const suyMucGia = (giaVeVi = '') =>
    /miễn phí|tự do/i.test(giaVeVi) ? 'mien_phi' : null

function chuyenDoi(d) {
    const loaiVi = Array.isArray(d.loai) ? d.loai[0] : d.loai
    return {
        id: d.id,
        loai: LOAI_CU_SANG_MOI[loaiVi] || 'ngam_canh',
        ten: d.ten,
        mota: d.mota,
        gioiThieu: d.gioiThieu,
        diemNoiBat: d.diemNoiBat,

        viTri: d.viTri || null,
        diaChi: '',

        // thongTin cũ tách thành 3 trường phẳng
        gioMoCuaMoTa: d.thongTin?.gioMoCua || ['', '', ''],
        giaVe: d.thongTin?.giaVe || ['', '', ''],
        diChuyen: d.thongTin?.diChuyen || ['', '', ''],
        mucGia: suyMucGia(d.thongTin?.giaVe?.[0] || ''),

        mau: d.mau || '',
        icon: d.icon || '',
        anhs: d.thuVienAnh || [],
        lanCan: d.lanCan || [],

        // Toạ độ trên bản đồ vẽ tay ở trang chủ — giữ để khối BanDoSo không vỡ
        x: d.x ?? null,
        y: d.y ?? null,
        nhanPhai: d.nhanPhai ?? false,

        nguon: 'bien_tap',
        status: 'da_duyet',
    }
}

export async function POST() {
    if (!await yeuCauAdmin()) {
        return NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })
    }

    let daThem = 0
    const boQua = []
    const loi = []

    try {
        for (const d of DIA_DIEM) {
            if (await timDiaDiemTheoId(d.id)) { boQua.push(d.id); continue }
            try {
                await taoDiaDiem(chuyenDoi(d))
                daThem++
            } catch (e) {
                loi.push(`${d.id}: ${e?.message || 'lỗi không rõ'}`)
            }
        }
    } catch (e) {
        if (e?.code === '42P01' || /relation .*dia_diem.* does not exist/i.test(e?.message || '')) {
            return NextResponse.json(
                { error: 'Chưa có bảng dia_diem. Chạy: npm run tao-bang-du-lich', chuaTaoBang: true },
                { status: 503 },
            )
        }
        return NextResponse.json({ error: 'Không nạp được dữ liệu mẫu' }, { status: 500 })
    }

    return NextResponse.json({ daThem, boQua, loi, tong: DIA_DIEM.length })
}
