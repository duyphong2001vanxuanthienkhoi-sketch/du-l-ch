import { NextResponse } from 'next/server'
import { danhSachTatCaSanPham } from '@/lib/server/productDb'
import { danhSachGian } from '@/lib/server/storeDb'
import { thongKeTheoSanPham } from '@/lib/server/ratingDb'
import { soDaBanTheoSanPham } from '@/lib/server/orderDb'
import { sanPhamCongKhai } from '@/lib/server/sanPhamCongKhai'

// GET /api/products?loai=cho_tuoi|qua_quang_ninh&store=<storeId>&id=<productId>&ids=<id1,id2,...>
// API công khai cho khách — CHỈ trả sản phẩm của gian ĐÃ DUYỆT (gian chờ duyệt/từ chối không lộ sản phẩm)
//   ids= : lấy đúng vài sản phẩm theo danh sách id (dùng cho dải "Bạn vừa xem" — khỏi tải cả chợ về máy)
export async function GET(request) {
    const loai = request.nextUrl.searchParams.get('loai')
    const store = request.nextUrl.searchParams.get('store')
    const id = request.nextUrl.searchParams.get('id')
    const ids = request.nextUrl.searchParams.get('ids')

    // Chặn trên 50 id để một URL dài bất thường không bắt server lọc cả chợ nhiều lần
    const boId = ids
        ? new Set(ids.split(',').map(s => s.trim()).filter(Boolean).slice(0, 50))
        : null

    let gians = await danhSachGian({ status: 'da_duyet' })
    if (loai) gians = gians.filter(g => g.loaiGian === loai)
    if (store) gians = gians.filter(g => g.id === store)
    const gianTheoId = Object.fromEntries(gians.map(g => [g.id, g]))

    // Điểm đánh giá trung bình + số đã bán của từng sản phẩm
    const [thongKeSao, daBan, tatCa] = await Promise.all([
        thongKeTheoSanPham(),
        soDaBanTheoSanPham(),
        danhSachTatCaSanPham(),
    ])
    const products = tatCa
        .filter(p => gianTheoId[p.storeId] && (!id || p.id === id) && (!boId || boId.has(p.id)))
        .map(p => sanPhamCongKhai(p, gianTheoId[p.storeId], thongKeSao[p.id], daBan[p.id]))

    return NextResponse.json({ products })
}
