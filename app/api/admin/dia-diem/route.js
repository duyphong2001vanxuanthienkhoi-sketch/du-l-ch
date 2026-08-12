import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import {
    danhSachDiaDiem, timDiaDiemTheoId,
    taoDiaDiem, capNhatDiaDiem, xoaDiaDiem,
} from '@/lib/server/diaDiemDb'
import { LOAI_DIA_DIEM, MUC_GIA, TRANG_THAI } from '@/lib/diaDiemLoai'

// CRUD ĐỊA ĐIỂM cho biên tập viên / quản trị.
// Đây là thứ gỡ nút thắt lớn nhất của bản cũ: trước đây muốn thêm địa điểm phải
// sửa tay lib/diaDiem.js rồi deploy lại; nay thêm/sửa ngay trên web.

const KHONG_CO_QUYEN = () =>
    NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })

const CHUA_TAO_BANG = () =>
    NextResponse.json(
        { error: 'Chưa có bảng dia_diem. Chạy: npm run tao-bang-du-lich', chuaTaoBang: true },
        { status: 503 },
    )

// Neon báo bảng chưa tồn tại bằng mã 42P01 — phân biệt với lỗi thật để báo đúng việc cần làm.
const laLoiThieuBang = (e) =>
    e?.code === '42P01' || /relation .*dia_diem.* does not exist/i.test(e?.message || '')

// GET /api/admin/dia-diem — toàn bộ địa điểm, MỌI trạng thái (khác API công khai chỉ trả da_duyet)
export async function GET() {
    if (!await yeuCauAdmin()) return KHONG_CO_QUYEN()
    try {
        return NextResponse.json({ diaDiems: await danhSachDiaDiem() })
    } catch (e) {
        if (laLoiThieuBang(e)) return CHUA_TAO_BANG()
        return NextResponse.json({ error: 'Không tải được danh sách địa điểm' }, { status: 500 })
    }
}

// Kiểm tra dữ liệu gửi lên. Trả chuỗi lỗi, hoặc null nếu hợp lệ.
function kiemTra(d) {
    const tenVi = Array.isArray(d.ten) ? String(d.ten[0] || '').trim() : String(d.ten || '').trim()
    if (!tenVi) return 'Chưa nhập tên địa điểm (bản tiếng Việt)'
    if (!LOAI_DIA_DIEM.some(l => l.id === d.loai)) return 'Loại hình không hợp lệ'
    if (d.mucGia && !MUC_GIA.some(m => m.id === d.mucGia)) return 'Mức giá không hợp lệ'
    if (d.status && !TRANG_THAI.some(s => s.id === d.status)) return 'Trạng thái không hợp lệ'
    if (d.viTri != null && d.viTri !== '' && !Array.isArray(d.viTri)) return 'Toạ độ không hợp lệ'
    return null
}

// POST /api/admin/dia-diem — thêm địa điểm mới
export async function POST(request) {
    if (!await yeuCauAdmin()) return KHONG_CO_QUYEN()
    try {
        const body = await request.json()
        const loi = kiemTra(body)
        if (loi) return NextResponse.json({ error: loi }, { status: 400 })

        const diaDiem = await taoDiaDiem(body)
        return NextResponse.json({ diaDiem })
    } catch (e) {
        if (laLoiThieuBang(e)) return CHUA_TAO_BANG()
        // taoDiaDiem ném lỗi có câu chữ rõ ràng khi trùng mã — trả thẳng cho người dùng
        return NextResponse.json({ error: e?.message || 'Không thêm được địa điểm' }, { status: 400 })
    }
}

// PUT /api/admin/dia-diem — sửa địa điểm (body kèm id)
export async function PUT(request) {
    if (!await yeuCauAdmin()) return KHONG_CO_QUYEN()
    try {
        const body = await request.json()
        if (!body?.id) return NextResponse.json({ error: 'Thiếu mã địa điểm' }, { status: 400 })

        const loi = kiemTra(body)
        if (loi) return NextResponse.json({ error: loi }, { status: 400 })

        const diaDiem = await capNhatDiaDiem(body.id, body)
        if (!diaDiem) return NextResponse.json({ error: 'Không tìm thấy địa điểm' }, { status: 404 })
        return NextResponse.json({ diaDiem })
    } catch (e) {
        if (laLoiThieuBang(e)) return CHUA_TAO_BANG()
        return NextResponse.json({ error: 'Không lưu được địa điểm' }, { status: 500 })
    }
}

// DELETE /api/admin/dia-diem?id=<slug>
export async function DELETE(request) {
    if (!await yeuCauAdmin()) return KHONG_CO_QUYEN()
    try {
        const id = request.nextUrl.searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'Thiếu mã địa điểm' }, { status: 400 })

        const dd = await timDiaDiemTheoId(id)
        if (!dd) return NextResponse.json({ error: 'Không tìm thấy địa điểm' }, { status: 404 })

        await xoaDiaDiem(id)
        return NextResponse.json({ ok: true })
    } catch (e) {
        if (laLoiThieuBang(e)) return CHUA_TAO_BANG()
        return NextResponse.json({ error: 'Không xoá được địa điểm' }, { status: 500 })
    }
}
