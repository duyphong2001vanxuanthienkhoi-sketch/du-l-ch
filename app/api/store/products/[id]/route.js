import { NextResponse } from 'next/server'
import { yeuCauTieuThuongDaDuyet } from '@/lib/server/quyen'
import { timSanPhamTheoId, capNhatSanPham, xoaSanPham } from '@/lib/server/productDb'
import { docAnhSanPham } from '@/lib/server/luuAnhSanPham'
import { docFormSanPham } from '@/lib/server/formSanPham'

// Kiểm tra: sản phẩm tồn tại VÀ thuộc gian của người đang đăng nhập
async function laySanPhamCuaToi(id) {
    const quyen = await yeuCauTieuThuongDaDuyet()
    if (!quyen) return { loi: NextResponse.json({ error: 'Chỉ tiểu thương có gian đã duyệt mới được truy cập' }, { status: 403 }) }

    const sp = await timSanPhamTheoId(id)
    if (!sp) return { loi: NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 }) }
    if (sp.storeId !== quyen.gian.id) {
        return { loi: NextResponse.json({ error: 'Sản phẩm này không thuộc gian của bạn' }, { status: 403 }) }
    }
    return { sp, gian: quyen.gian }
}

// PUT /api/store/products/[id] — sửa sản phẩm (ảnh không bắt buộc, giữ ảnh cũ nếu không đổi)
export async function PUT(request, { params }) {
    try {
        const { id } = await params
        const kt = await laySanPhamCuaToi(id)
        if (kt.loi) return kt.loi

        const form = await request.formData()
        const kq = docFormSanPham(form, kt.gian)
        if (kq.loi) return NextResponse.json({ error: kq.loi }, { status: 400 })

        const kqAnh = await docAnhSanPham(form, kt.sp)
        if (kqAnh.loi) return NextResponse.json({ error: kqAnh.loi }, { status: 400 })

        const sp = await capNhatSanPham(id, { ...kq.duLieu, anhs: kqAnh.anhs, anh: kqAnh.anhs[0], anhNho: kqAnh.anhNho })
        return NextResponse.json({ product: sp })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}

// DELETE /api/store/products/[id] — xóa sản phẩm của mình
export async function DELETE(request, { params }) {
    const { id } = await params
    const kt = await laySanPhamCuaToi(id)
    if (kt.loi) return kt.loi

    await xoaSanPham(id)
    return NextResponse.json({ ok: true })
}
