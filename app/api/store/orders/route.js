import { NextResponse } from 'next/server'
import { yeuCauTieuThuongDaDuyet } from '@/lib/server/quyen'
import { danhSachDonTheoGian, capNhatTrangThaiGianTrongDon, gianXuLyHoan } from '@/lib/server/orderDb'
import { baoDonChoCapNhat } from '@/lib/server/realtimeDon'
import { chuanTT, BUOC_GIAN } from '@/lib/trangThaiDon'

// GET /api/store/orders — đơn hàng CÓ SẢN PHẨM của gian mình.
// Chỉ trả về các item thuộc gian; status là trạng thái PHẦN CỦA GIAN; kèm yêu cầu hoàn (nếu có).
export async function GET() {
    const quyen = await yeuCauTieuThuongDaDuyet()
    if (!quyen) return NextResponse.json({ error: 'Chỉ tiểu thương có gian đã duyệt mới được truy cập' }, { status: 403 })

    const tatCa = await danhSachDonTheoGian(quyen.gian.id)
    const orders = tatCa.map(o => {
        const itemsCuaGian = o.items.filter(it => it.storeId === quyen.gian.id)
        return {
            id: o.id,
            ten: o.ten,
            soDienThoai: o.soDienThoai,
            diaChi: o.diaChi,
            hinhThucGiao: o.hinhThucGiao,
            status: chuanTT(o.statusTheoGian[quyen.gian.id]),
            hoanHang: o.hoanHangTheoGian?.[quyen.gian.id] || null,
            createdAt: o.createdAt,
            items: itemsCuaGian,
            tongTienCuaGian: itemsCuaGian.reduce((s, it) => s + it.gia * it.soLuong, 0),
        }
    })

    return NextResponse.json({ orders })
}

// PATCH /api/store/orders
//  - Đổi bước pipeline:  { orderId, status: 'cho_xac_nhan' | 'cho_lay_hang' | 'dang_giao' | 'da_giao' }
//  - Xử lý yêu cầu hoàn: { orderId, xuLyHoan: 'chap_nhan' | 'tu_choi' }
export async function PATCH(request) {
    const quyen = await yeuCauTieuThuongDaDuyet()
    if (!quyen) return NextResponse.json({ error: 'Chỉ tiểu thương có gian đã duyệt mới được truy cập' }, { status: 403 })

    const { orderId, status, xuLyHoan } = await request.json()

    // Đơn phải có sản phẩm của gian mình mới được cập nhật
    const donCuaGian = await danhSachDonTheoGian(quyen.gian.id)
    if (!donCuaGian.some(o => o.id === orderId)) {
        return NextResponse.json({ error: 'Không tìm thấy đơn này trong gian của bạn' }, { status: 404 })
    }

    // Xử lý yêu cầu hoàn hàng của khách (chấp nhận: giữ 'trả hàng'; từ chối: về 'đã giao')
    if (xuLyHoan) {
        if (!['chap_nhan', 'tu_choi'].includes(xuLyHoan)) {
            return NextResponse.json({ error: 'Lựa chọn không hợp lệ' }, { status: 400 })
        }
        const don = await gianXuLyHoan(orderId, quyen.gian.id, xuLyHoan === 'chap_nhan')
        await baoDonChoCapNhat(don, quyen.gian.id, don.statusTheoGian[quyen.gian.id])
        return NextResponse.json({ ok: true, status: don.statusTheoGian[quyen.gian.id] })
    }

    // Đổi bước pipeline (gian không tự hủy / không tự tạo yêu cầu trả)
    if (!BUOC_GIAN.includes(status)) {
        return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 })
    }
    const don = await capNhatTrangThaiGianTrongDon(orderId, quyen.gian.id, status)
    await baoDonChoCapNhat(don, quyen.gian.id, status)
    return NextResponse.json({ ok: true, status: don.statusTheoGian[quyen.gian.id] })
}
