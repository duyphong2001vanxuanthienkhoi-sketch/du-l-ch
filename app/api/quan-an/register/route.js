import { NextResponse } from 'next/server'
import { layNguoiDungHienTai } from '@/lib/server/quyen'
import { timQuanAnTheoUserId, taoQuanAn, capNhatQuanAn } from '@/lib/server/quanAnDb'
import { luuAnhUpload } from '@/lib/server/luuAnh'

const BUOI_HOP_LE = ['an_sang', 'an_trua', 'an_toi', 'an_vat']
const NHOM_HOP_LE = ['do_an_vat', 'bun', 'pho', 'com', 'chao', 'mien', 'hai_san']

// Đọc mảng từ form (JSON string) + lọc theo danh sách hợp lệ
function docMang(form, ten, hopLe) {
    try {
        const arr = JSON.parse(form.get(ten) || '[]')
        return Array.isArray(arr) ? [...new Set(arr)].filter(x => hopLe.includes(x)) : []
    } catch { return [] }
}

// POST /api/quan-an/register — đăng ký (hoặc nộp lại) một quán ăn.
// Mỗi tài khoản tối đa 1 quán; quán bị TỪ CHỐI được sửa & nộp lại.
// Quán mới -> 'cho_duyet', admin duyệt ở /admin/quan-an mới hoạt động (như gian hàng).
export async function POST(request) {
    try {
        const user = await layNguoiDungHienTai()
        if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập để mở quán ăn' }, { status: 401 })

        const quanCu = await timQuanAnTheoUserId(user.id)
        if (quanCu && quanCu.status !== 'tu_choi') {
            return NextResponse.json({ error: 'Tài khoản của bạn đã mở quán ăn rồi' }, { status: 409 })
        }

        const form = await request.formData()
        const ten = String(form.get('ten') || '').trim()
        const tenChu = String(form.get('tenChu') || '').trim()
        const soDienThoai = String(form.get('soDienThoai') || '').trim()
        const diaChi = String(form.get('diaChi') || '').trim()
        const moTa = String(form.get('moTa') || '').trim()
        const gioMoCua = String(form.get('gioMoCua') || '').trim()
        const gioDongCua = String(form.get('gioDongCua') || '').trim()
        const loai = docMang(form, 'loai', BUOI_HOP_LE)
        const nhom = docMang(form, 'nhom', NHOM_HOP_LE)
        const anh = form.get('logo')

        if (!ten) return NextResponse.json({ error: 'Vui lòng nhập tên quán' }, { status: 400 })
        if (!tenChu) return NextResponse.json({ error: 'Vui lòng nhập tên chủ quán' }, { status: 400 })
        if (!/^0\d{8,10}$/.test(soDienThoai.replace(/[\s.-]/g, ''))) {
            return NextResponse.json({ error: 'Số điện thoại không hợp lệ (VD: 0912345678)' }, { status: 400 })
        }
        if (!diaChi) return NextResponse.json({ error: 'Vui lòng nhập địa chỉ quán' }, { status: 400 })
        if (!moTa) return NextResponse.json({ error: 'Vui lòng nhập mô tả ngắn về quán' }, { status: 400 })
        if (!loai.length) return NextResponse.json({ error: 'Chọn ít nhất 1 buổi phục vụ' }, { status: 400 })
        if (!nhom.length) return NextResponse.json({ error: 'Chọn ít nhất 1 loại món' }, { status: 400 })

        const coAnhMoi = anh && typeof anh !== 'string'
        if (!coAnhMoi && !quanCu) return NextResponse.json({ error: 'Vui lòng chọn ảnh đại diện quán' }, { status: 400 })

        let logo = quanCu?.logo || ''
        if (coAnhMoi) {
            try { logo = await luuAnhUpload(anh, 'quan') }
            catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }) }
        }

        const quan = quanCu
            ? await capNhatQuanAn(quanCu.id, { ten, tenChu, soDienThoai, diaChi, moTa, gioMoCua, gioDongCua, loai, nhom, logo, status: 'cho_duyet', nopLaiLuc: new Date().toISOString() })
            : await taoQuanAn({ userId: user.id, ten, tenChu, soDienThoai, diaChi, moTa, gioMoCua, gioDongCua, loai, nhom, logo })

        return NextResponse.json({ quanAn: quan })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
