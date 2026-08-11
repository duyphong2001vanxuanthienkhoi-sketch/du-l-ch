import { NextResponse } from 'next/server'
import { yeuCauTieuThuongDaDuyet } from '@/lib/server/quyen'
import { danhSachDonTheoGian } from '@/lib/server/orderDb'
import { danhSachSanPhamTheoGian } from '@/lib/server/productDb'
import { danhGiaTheoGian } from '@/lib/server/ratingDb'

// GET /api/store/thong-ke — số liệu THẬT cho trang tổng quan gian hàng
// (thay cho dữ liệu demo): tổng sản phẩm, tổng đơn, doanh thu phần của gian, đánh giá.
export async function GET() {
    const quyen = await yeuCauTieuThuongDaDuyet()
    if (!quyen) return NextResponse.json({ error: 'Chỉ tiểu thương có gian đã duyệt mới được truy cập' }, { status: 403 })

    const storeId = quyen.gian.id
    const [dons, sanPhams, danhGia] = await Promise.all([
        danhSachDonTheoGian(storeId),
        danhSachSanPhamTheoGian(storeId),
        danhGiaTheoGian(storeId),
    ])

    // Doanh thu = tổng phần HÀNG CỦA GIAN trong mọi đơn (chỉ tính item thuộc gian này).
    let doanhThu = 0
    let daGiao = 0
    for (const o of dons) {
        for (const it of o.items) {
            if (it.storeId === storeId) doanhThu += it.gia * it.soLuong
        }
        if (o.statusTheoGian[storeId] === 'da_giao') daGiao++
    }

    return NextResponse.json({
        tongSanPham: sanPhams.length,
        tongDon: dons.length,
        donDaGiao: daGiao,
        doanhThu,
        danhGia: danhGia.map(d => ({
            id: d.id,
            ten: d.ten,
            anhNguoiDung: d.anhNguoiDung,
            sao: d.sao,
            binhLuan: d.binhLuan,
            tenSanPham: d.tenSanPham,
            anhSanPham: d.anhSanPham,
            productId: d.productId,
            createdAt: d.createdAt,
        })),
    })
}
