import { NextResponse } from 'next/server'
import { yeuCauChuQuanDaDuyet } from '@/lib/server/quyen'
import { timMonTheoId, capNhatMon, xoaMon } from '@/lib/server/monAnDb'
import { luuAnhUpload } from '@/lib/server/luuAnh'

// Đảm bảo món thuộc quán của người đang đăng nhập
async function monCuaToi(id) {
    const quyen = await yeuCauChuQuanDaDuyet()
    if (!quyen) return { loi: 'Chỉ chủ quán đã duyệt mới được sửa món', status: 403 }
    const mon = await timMonTheoId(id)
    if (!mon || mon.quanAnId !== quyen.quan.id) return { loi: 'Không tìm thấy món', status: 404 }
    return { mon }
}

// PUT /api/quan-an/mon/[id] — sửa món (tên, mô tả, giá, phần, còn/hết, ảnh)
export async function PUT(request, { params }) {
    try {
        const { id } = await params
        const kt = await monCuaToi(id)
        if (kt.loi) return NextResponse.json({ error: kt.loi }, { status: kt.status })

        const form = await request.formData()
        const thayDoi = {}
        if (form.has('ten')) {
            const ten = String(form.get('ten')).trim()
            if (!ten) return NextResponse.json({ error: 'Tên món không được trống' }, { status: 400 })
            thayDoi.ten = ten
        }
        if (form.has('moTa')) thayDoi.moTa = String(form.get('moTa')).trim()
        if (form.has('phan')) thayDoi.phan = String(form.get('phan')).trim() || 'Món khác'
        if (form.has('gia')) {
            const gia = Number(form.get('gia'))
            if (!Number.isFinite(gia) || gia <= 0) return NextResponse.json({ error: 'Giá món phải là số dương' }, { status: 400 })
            thayDoi.gia = gia
        }
        if (form.has('con')) thayDoi.con = form.get('con') === 'true'
        const anhFile = form.get('anh')
        if (anhFile && typeof anhFile !== 'string') {
            try { thayDoi.anh = await luuAnhUpload(anhFile, 'mon') }
            catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }) }
        }

        const mon = await capNhatMon(id, thayDoi)
        return NextResponse.json({ mon })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}

// DELETE /api/quan-an/mon/[id] — xóa món khỏi thực đơn
export async function DELETE(_request, { params }) {
    try {
        const { id } = await params
        const kt = await monCuaToi(id)
        if (kt.loi) return NextResponse.json({ error: kt.loi }, { status: kt.status })
        await xoaMon(id)
        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
