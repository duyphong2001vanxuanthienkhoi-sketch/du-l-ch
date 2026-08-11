import { NextResponse } from 'next/server'
import { yeuCauTieuThuongDaDuyet } from '@/lib/server/quyen'
import { capNhatGianHang } from '@/lib/server/storeDb'
import { luuAnhUpload } from '@/lib/server/luuAnh'

// POST /api/store/cap-nhat — tiểu thương tự sửa thông tin gian ĐÃ DUYỆT:
// tên gian, số điện thoại, mô tả và ẢNH ĐẠI DIỆN (logo). Không đổi loại khu, giữ nguyên trạng thái duyệt.
export async function POST(request) {
    try {
        const quyen = await yeuCauTieuThuongDaDuyet()
        if (!quyen) return NextResponse.json({ error: 'Chỉ tiểu thương có gian đã duyệt mới được sửa thông tin gian' }, { status: 403 })

        const form = await request.formData()
        const tenGian = String(form.get('tenGian') || '').trim()
        const soDienThoai = String(form.get('soDienThoai') || '').trim()
        const moTa = String(form.get('moTa') || '').trim()
        const anh = form.get('logo')

        if (!tenGian) return NextResponse.json({ error: 'Vui lòng nhập tên gian hàng' }, { status: 400 })
        if (!/^0\d{8,10}$/.test(soDienThoai.replace(/[\s.-]/g, ''))) {
            return NextResponse.json({ error: 'Số điện thoại không hợp lệ (VD: 0912345678)' }, { status: 400 })
        }
        if (!moTa) return NextResponse.json({ error: 'Vui lòng nhập mô tả ngắn về gian hàng' }, { status: 400 })

        // Đổi ảnh là tùy chọn — không gửi ảnh mới thì giữ logo cũ
        const thayDoi = { tenGian, soDienThoai, moTa }
        if (anh && typeof anh !== 'string') {
            try {
                thayDoi.logo = await luuAnhUpload(anh, 'gian')
            } catch (e) {
                return NextResponse.json({ error: e.message }, { status: 400 })
            }
        }

        const gian = await capNhatGianHang(quyen.gian.id, thayDoi)
        return NextResponse.json({ store: gian })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
