import { NextResponse } from 'next/server'
import { layNguoiDungHienTai } from '@/lib/server/quyen'
import { layPhien } from '@/lib/server/phien'
import { timDonTheoId, khachDaNhanSanPham, khachDaNhanTuGian } from '@/lib/server/orderDb'
import { timGianTheoId } from '@/lib/server/storeDb'
import { timSanPhamTheoId } from '@/lib/server/productDb'
import { timDiaDiem } from '@/lib/diaDiem'
import {
    taoDanhGia, daDanhGia, danhGiaTheoSanPham, danhGiaTheoGian,
    taoDanhGiaGian, daDanhGiaGian,
    taoDanhGiaSanPhamTrucTiep, daDanhGiaSanPhamTrucTiep,
    taoDanhGiaDiaDiem, daDanhGiaDiaDiem, danhGiaTheoDiaDiem,
} from '@/lib/server/ratingDb'

// GET /api/ratings?product=<id> | ?store=<id> | ?diaDiem=<id> — công khai.
//  - ?store=  : chỉ đánh giá về GIAN (bình luận sản phẩm nằm ở trang sản phẩm)
//  - ?product=: mọi đánh giá của sản phẩm; daMua = true nếu là đánh giá sau khi mua
//  - ?diaDiem=: đánh giá của du khách về địa điểm du lịch
// Nếu đang đăng nhập, trả thêm toiDaDanhGia (đã đánh giá TRỰC TIẾP mục này chưa)
// để giao diện ẩn form khỏi người đã gửi rồi.
export async function GET(request) {
    const product = request.nextUrl.searchParams.get('product')
    const store = request.nextUrl.searchParams.get('store')
    const diaDiem = request.nextUrl.searchParams.get('diaDiem')

    let ratings = []
    if (product) ratings = await danhGiaTheoSanPham(product)
    else if (store) ratings = await danhGiaTheoGian(store)
    else if (diaDiem) ratings = await danhGiaTheoDiaDiem(diaDiem)

    // toiDaDanhGia: đã gửi đánh giá trực tiếp mục này chưa (để ẩn form).
    // coTheDanhGia: có ĐỦ ĐIỀU KIỆN đánh giá không (sản phẩm/gian: phải đã mua & nhận hàng;
    //               địa điểm/Khám phá: chỉ cần đăng nhập) — để giao diện quyết định hiện form hay báo "cần mua".
    let toiDaDanhGia = false
    let coTheDanhGia = false
    const phien = await layPhien()
    if (phien) {
        if (store) {
            toiDaDanhGia = await daDanhGiaGian(store, phien.sub)
            coTheDanhGia = !toiDaDanhGia && await khachDaNhanTuGian(phien.sub, store)
        } else if (product) {
            toiDaDanhGia = await daDanhGiaSanPhamTrucTiep(product, phien.sub)
            if (!toiDaDanhGia) {
                const sp = await timSanPhamTheoId(product)
                coTheDanhGia = !!sp && await khachDaNhanSanPham(phien.sub, product, sp.storeId)
            }
        } else if (diaDiem) {
            toiDaDanhGia = await daDanhGiaDiaDiem(diaDiem, phien.sub)
            coTheDanhGia = !toiDaDanhGia // Khám phá: ai đăng nhập cũng đánh giá được
        }
    }

    // Không lộ userId/orderId ra công khai
    return NextResponse.json({
        ratings: ratings.map(r => ({
            id: r.id,
            ten: r.ten,
            anhNguoiDung: r.anhNguoiDung, // ảnh đại diện hiện tại của người bình luận (nếu có)
            sao: r.sao,
            binhLuan: r.binhLuan,
            tenSanPham: r.tenSanPham,
            anhSanPham: r.anhSanPham,
            daMua: !!r.orderId || r.daMua === true, // đánh giá sau khi mua hàng (đáng tin hơn)
            createdAt: r.createdAt,
        })),
        toiDaDanhGia,
        coTheDanhGia,
    })
}

// POST /api/ratings — bốn kiểu, phân biệt theo nội dung gửi lên:
//  1. { orderId, productId, sao, binhLuan } — đánh giá SẢN PHẨM ĐÃ MUA:
//     chỉ khi đơn của chính mình + phần gian chứa sản phẩm ĐÃ GIAO + chưa đánh giá lần nào.
//  2. { productId, sao, binhLuan }          — đánh giá SẢN PHẨM trực tiếp (không cần mua):
//     chỉ cần đăng nhập; mỗi người 1 lần mỗi sản phẩm; chủ gian không tự đánh giá hàng mình.
//  3. { storeId, sao, binhLuan }            — đánh giá GIAN HÀNG trực tiếp:
//     chỉ cần đăng nhập; mỗi người 1 lần mỗi gian; chủ gian không tự đánh giá gian mình.
//  4. { diaDiemId, sao, binhLuan }          — đánh giá ĐỊA ĐIỂM du lịch:
//     chỉ cần đăng nhập; mỗi người 1 lần mỗi địa điểm.
export async function POST(request) {
    try {
        const user = await layNguoiDungHienTai()
        if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập để đánh giá' }, { status: 401 })

        const { orderId, productId, storeId, diaDiemId, sao, binhLuan } = await request.json()

        const soSao = Number(sao)
        if (!Number.isInteger(soSao) || soSao < 1 || soSao > 5) {
            return NextResponse.json({ error: 'Vui lòng chọn từ 1 đến 5 sao' }, { status: 400 })
        }
        const loiBinh = String(binhLuan || '').trim().slice(0, 500)

        // ---- Kiểu 4: đánh giá địa điểm du lịch ----
        if (diaDiemId) {
            const dd = timDiaDiem(String(diaDiemId))
            if (!dd) return NextResponse.json({ error: 'Không tìm thấy địa điểm' }, { status: 404 })
            if (await daDanhGiaDiaDiem(dd.id, user.id)) {
                return NextResponse.json({ error: 'Bạn đã đánh giá địa điểm này rồi' }, { status: 409 })
            }
            const dg = await taoDanhGiaDiaDiem({
                diaDiemId: dd.id,
                userId: user.id,
                ten: user.name,
                sao: soSao,
                binhLuan: loiBinh,
            })
            return NextResponse.json({ rating: dg })
        }

        // ---- Kiểu 3: đánh giá trực tiếp gian hàng ----
        if (storeId && !orderId && !productId) {
            const gian = await timGianTheoId(String(storeId))
            if (!gian || gian.status !== 'da_duyet') {
                return NextResponse.json({ error: 'Không tìm thấy gian hàng' }, { status: 404 })
            }
            if (gian.userId === user.id) {
                return NextResponse.json({ error: 'Bạn không thể tự đánh giá gian hàng của mình' }, { status: 400 })
            }
            if (await daDanhGiaGian(gian.id, user.id)) {
                return NextResponse.json({ error: 'Bạn đã đánh giá gian hàng này rồi' }, { status: 409 })
            }
            // Chỉ khách ĐÃ MUA & NHẬN hàng ở gian này mới được đánh giá gian
            if (!(await khachDaNhanTuGian(user.id, gian.id))) {
                return NextResponse.json({ error: 'Bạn cần mua và nhận hàng ở gian này rồi mới đánh giá được' }, { status: 403 })
            }
            const dg = await taoDanhGiaGian({
                storeId: gian.id,
                userId: user.id,
                ten: user.name,
                sao: soSao,
                binhLuan: loiBinh,
            })
            return NextResponse.json({ rating: dg })
        }

        // ---- Kiểu 2: đánh giá trực tiếp sản phẩm (không cần mua) ----
        if (productId && !orderId) {
            const sp = await timSanPhamTheoId(String(productId))
            if (!sp) return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 })

            const gian = await timGianTheoId(sp.storeId)
            if (!gian || gian.status !== 'da_duyet') {
                return NextResponse.json({ error: 'Gian bán sản phẩm này hiện không hoạt động' }, { status: 404 })
            }
            if (gian.userId === user.id) {
                return NextResponse.json({ error: 'Bạn không thể tự đánh giá sản phẩm của gian mình' }, { status: 400 })
            }
            if (await daDanhGiaSanPhamTrucTiep(sp.id, user.id)) {
                return NextResponse.json({ error: 'Bạn đã đánh giá sản phẩm này rồi' }, { status: 409 })
            }
            // Chỉ khách ĐÃ MUA & NHẬN sản phẩm này mới được đánh giá
            if (!(await khachDaNhanSanPham(user.id, sp.id, gian.id))) {
                return NextResponse.json({ error: 'Bạn cần mua và nhận sản phẩm này rồi mới đánh giá được' }, { status: 403 })
            }
            const dg = await taoDanhGiaSanPhamTrucTiep({
                productId: sp.id,
                storeId: gian.id,
                userId: user.id,
                ten: user.name,
                sao: soSao,
                binhLuan: loiBinh,
            })
            return NextResponse.json({ rating: dg })
        }

        // ---- Kiểu 1: đánh giá sản phẩm đã mua (như cũ) ----
        const don = await timDonTheoId(String(orderId))
        if (!don || don.userId !== user.id) {
            return NextResponse.json({ error: 'Không tìm thấy đơn hàng của bạn' }, { status: 404 })
        }

        const item = don.items.find(it => it.productId === productId)
        if (!item) return NextResponse.json({ error: 'Sản phẩm không có trong đơn này' }, { status: 400 })

        if (don.statusTheoGian[item.storeId] !== 'da_giao') {
            return NextResponse.json({ error: 'Chỉ đánh giá được sau khi đã nhận hàng' }, { status: 400 })
        }

        if (await daDanhGia(don.id, productId, user.id)) {
            return NextResponse.json({ error: 'Bạn đã đánh giá sản phẩm này rồi' }, { status: 409 })
        }

        const dg = await taoDanhGia({
            orderId: don.id,
            productId,
            storeId: item.storeId,
            userId: user.id,
            ten: user.name,
            sao: soSao,
            binhLuan: loiBinh,
            tenSanPham: item.ten,
            anhSanPham: item.anh,
        })

        return NextResponse.json({ rating: dg })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
