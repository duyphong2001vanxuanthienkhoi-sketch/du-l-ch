import { NextResponse } from 'next/server'
import { yeuCauChuQuanDaDuyet } from '@/lib/server/quyen'
import { capNhatQuanAn } from '@/lib/server/quanAnDb'
import { luuAnhUpload } from '@/lib/server/luuAnh'

const BUOI_HOP_LE = ['an_sang', 'an_trua', 'an_toi', 'an_vat']
const NHOM_HOP_LE = ['do_an_vat', 'bun', 'pho', 'com', 'chao', 'mien', 'hai_san']

function docMang(form, ten, hopLe) {
    try {
        const arr = JSON.parse(form.get(ten) || '[]')
        return Array.isArray(arr) ? [...new Set(arr)].filter(x => hopLe.includes(x)) : []
    } catch { return [] }
}

// POST /api/quan-an/cap-nhat — chủ quán tự sửa thông tin quán ĐÃ DUYỆT:
// tên, chủ quán, SĐT, địa chỉ, mô tả, giờ mở/đóng, buổi phục vụ, loại món và ẢNH ĐẠI DIỆN (logo).
// Giữ nguyên trạng thái duyệt (không phải nộp lại như quán bị từ chối).
export async function POST(request) {
    try {
        const quyen = await yeuCauChuQuanDaDuyet()
        if (!quyen) return NextResponse.json({ error: 'Chỉ chủ quán đã duyệt mới được sửa thông tin quán' }, { status: 403 })

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

        const thayDoi = { ten, tenChu, soDienThoai, diaChi, moTa, gioMoCua, gioDongCua, loai, nhom }
        // Đổi ảnh là tùy chọn — không gửi ảnh mới thì giữ logo cũ
        if (anh && typeof anh !== 'string') {
            try { thayDoi.logo = await luuAnhUpload(anh, 'quan') }
            catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }) }
        }

        const quan = await capNhatQuanAn(quyen.quan.id, thayDoi)
        return NextResponse.json({ quanAn: quan })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
