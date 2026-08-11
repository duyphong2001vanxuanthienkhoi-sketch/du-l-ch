import { NextResponse } from 'next/server'
import { layPhien } from '@/lib/server/phien'
import { timSanPhamTheoId, truTonKhoChoDon } from '@/lib/server/productDb'
import { timGianTheoId } from '@/lib/server/storeDb'
import { taoDonHang } from '@/lib/server/orderDb'
import { kiemTraMa } from '@/lib/server/couponDb'
import { baoDonChoMoi } from '@/lib/server/realtimeDon'

// 'xanh_sm' = giao nội thành qua đối tác Green SM (tên cũ Xanh SM; xử lý như giao nhanh trong ngày)
const HINH_THUC_GIAO = ['giao_nhanh', 'gui_xa', 'xanh_sm']

// POST /api/orders — khách đặt đơn (không bắt buộc đăng nhập)
export async function POST(request) {
    try {
        const { ten, soDienThoai, diaChi, hinhThucGiao, items, maGiam } = await request.json()

        // 1. Kiểm tra thông tin người nhận
        if (!ten?.trim()) return NextResponse.json({ error: 'Vui lòng nhập tên người nhận' }, { status: 400 })
        if (!/^0\d{8,10}$/.test(String(soDienThoai || '').replace(/[\s.-]/g, ''))) {
            return NextResponse.json({ error: 'Số điện thoại không hợp lệ (VD: 0912345678)' }, { status: 400 })
        }
        if (!diaChi?.trim()) return NextResponse.json({ error: 'Vui lòng nhập địa chỉ nhận hàng' }, { status: 400 })
        if (!HINH_THUC_GIAO.includes(hinhThucGiao)) {
            return NextResponse.json({ error: 'Vui lòng chọn hình thức giao hàng' }, { status: 400 })
        }
        if (!Array.isArray(items) || !items.length) {
            return NextResponse.json({ error: 'Giỏ hàng trống' }, { status: 400 })
        }

        // 2. ĐỌC DB: đối chiếu từng sản phẩm — tồn tại, gian đã duyệt, đủ hàng.
        //    Giá lấy từ server, không tin giá client gửi lên.
        const itemsDaXacThuc = []
        const chuGian = new Map() // storeId -> { userId, tenGian } để báo realtime + push cho chủ gian
        for (const it of items) {
            const soLuong = Number(it.soLuong)
            if (!Number.isInteger(soLuong) || soLuong < 1) {
                return NextResponse.json({ error: 'Số lượng sản phẩm không hợp lệ' }, { status: 400 })
            }

            const sp = await timSanPhamTheoId(String(it.productId))
            if (!sp) return NextResponse.json({ error: 'Có sản phẩm không còn tồn tại, vui lòng tải lại giỏ hàng' }, { status: 400 })

            const gian = await timGianTheoId(sp.storeId)
            if (!gian || gian.status !== 'da_duyet') {
                return NextResponse.json({ error: `Gian bán "${sp.ten}" hiện không hoạt động` }, { status: 400 })
            }
            chuGian.set(gian.id, { userId: gian.userId, tenGian: gian.tenGian })
            // Tồn kho được kiểm + trừ ở bước 5 (truTonKhoChoDon), không kiểm lẻ ở đây

            // Phân loại (size/màu): nếu sản phẩm có biến thể thì bắt buộc chọn đúng một biến thể;
            // giá lấy theo biến thể (không tin giá client gửi lên).
            let gia = sp.gia
            let bienTheId = null, bienTheSnap = null, bienTheNhan = ''
            if (Array.isArray(sp.bienThe) && sp.bienThe.length > 0) {
                if (!it.bienTheId) return NextResponse.json({ error: `Vui lòng chọn phân loại cho "${sp.ten}"` }, { status: 400 })
                const bt = sp.bienThe.find(v => v.id === it.bienTheId)
                if (!bt) return NextResponse.json({ error: `Phân loại của "${sp.ten}" không còn, vui lòng chọn lại` }, { status: 400 })
                gia = bt.gia
                bienTheId = bt.id
                bienTheSnap = { size: bt.size, mau: bt.mau }
                bienTheNhan = [bt.size, bt.mau].filter(Boolean).join(' · ')
            }

            itemsDaXacThuc.push({
                productId: sp.id,
                ten: sp.ten,
                gia,
                soLuong,
                anh: sp.anh,
                guiDiTinh: !!sp.guiDiTinh,
                storeId: gian.id,
                tenGian: gian.tenGian,
                bienTheId,          // null nếu sản phẩm không có phân loại
                bienThe: bienTheSnap, // ảnh chụp { size, mau } tại thời điểm đặt
                bienTheNhan,        // nhãn hiển thị, VD "M · Đỏ"
            })
        }

        // 3. "Gửi đi xa" chỉ dành cho sản phẩm gửi tỉnh được (đồ tươi phải giao nhanh)
        if (hinhThucGiao === 'gui_xa') {
            const khongGuiDuoc = itemsDaXacThuc.filter(it => !it.guiDiTinh).map(it => `"${it.ten}"`)
            if (khongGuiDuoc.length) {
                return NextResponse.json({ error: `${khongGuiDuoc.join(', ')} là đồ tươi/không gửi tỉnh được — vui lòng chọn "Giao nhanh trong ngày"` }, { status: 400 })
            }
        }

        const tongTienHang = itemsDaXacThuc.reduce((s, it) => s + it.gia * it.soLuong, 0)

        // 4. Nếu có mã giảm giá: KIỂM LẠI ở server (không tin mức giảm client gửi lên)
        let maGiamHopLe = null
        let tienGiam = 0
        if (maGiam) {
            const kq = await kiemTraMa(maGiam, tongTienHang)
            if (!kq.ok) return NextResponse.json({ error: kq.error }, { status: 400 })
            maGiamHopLe = kq.ma.code
            tienGiam = kq.tienGiam
        }
        const tongTien = tongTienHang - tienGiam

        // 5. GHI DB (products.json): kiểm tồn + trừ tồn ATOMIC — hai đơn cùng lúc
        //    giành sản phẩm cuối sẽ không bán vượt (chỉ một đơn trừ được).
        const ketQuaTon = await truTonKhoChoDon(
            itemsDaXacThuc.map(it => ({ productId: it.productId, bienTheId: it.bienTheId, soLuong: it.soLuong }))
        )
        if (!ketQuaTon.ok) {
            return NextResponse.json({ error: ketQuaTon.error }, { status: 400 })
        }

        // 6. GHI DB (orders.json): lưu đơn — gắn userId nếu khách có đăng nhập
        const phien = await layPhien()
        const don = await taoDonHang({
            userId: phien?.sub || null,
            ten: ten.trim(),
            soDienThoai: String(soDienThoai).trim(),
            diaChi: diaChi.trim(),
            hinhThucGiao,
            items: itemsDaXacThuc,
            tongTienHang,
            maGiam: maGiamHopLe,
            tienGiam,
            tongTien,
        })

        // Báo các gian có sản phẩm trong đơn (toast + chuông + push) ngay lập tức
        await baoDonChoMoi(don, chuGian)

        return NextResponse.json({ order: don })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
