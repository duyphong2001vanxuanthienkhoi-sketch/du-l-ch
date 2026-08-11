import { NextResponse } from 'next/server'
import { yeuCauTieuThuongDaDuyet } from '@/lib/server/quyen'
import { danhSachSanPhamTheoGian, taoSanPham } from '@/lib/server/productDb'
import { docAnhSanPham } from '@/lib/server/luuAnhSanPham'
import { docFormSanPham } from '@/lib/server/formSanPham'

// GET /api/store/products — danh sách sản phẩm của gian mình
export async function GET() {
    const quyen = await yeuCauTieuThuongDaDuyet()
    if (!quyen) return NextResponse.json({ error: 'Chỉ tiểu thương có gian đã duyệt mới được truy cập' }, { status: 403 })

    const products = await danhSachSanPhamTheoGian(quyen.gian.id)
    return NextResponse.json({ products })
}

// POST /api/store/products — thêm sản phẩm mới (GHI products.json)
export async function POST(request) {
    try {
        const quyen = await yeuCauTieuThuongDaDuyet()
        if (!quyen) return NextResponse.json({ error: 'Chỉ tiểu thương có gian đã duyệt mới được đăng sản phẩm' }, { status: 403 })

        const form = await request.formData()
        const kq = docFormSanPham(form, quyen.gian)
        if (kq.loi) return NextResponse.json({ error: kq.loi }, { status: 400 })

        const kqAnh = await docAnhSanPham(form, null)
        if (kqAnh.loi) return NextResponse.json({ error: kqAnh.loi }, { status: 400 })

        const sp = await taoSanPham({ storeId: quyen.gian.id, ...kq.duLieu, anhs: kqAnh.anhs, anhNho: kqAnh.anhNho })
        return NextResponse.json({ product: sp })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
