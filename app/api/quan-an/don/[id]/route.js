import { NextResponse } from 'next/server'
import { yeuCauChuQuanDaDuyet } from '@/lib/server/quyen'
import { timDonDoAnTheoId, capNhatTrangThaiDon } from '@/lib/server/donDoAnDb'
import { baoDonDoAnCapNhat } from '@/lib/server/realtimeDon'

// Bước tiến hợp lệ của trạng thái đơn (chủ quán bấm tới bước kế tiếp), + hủy từ khi chưa giao xong.
const BUOC_KE = { cho_nhan: 'da_nhan', da_nhan: 'dang_giao', dang_giao: 'da_giao' }

// POST /api/quan-an/don/[id]  body: { trangThai }
// Chủ quán cập nhật trạng thái đơn của quán mình. Chỉ cho tiến đúng 1 bước, hoặc 'huy'.
export async function POST(request, { params }) {
    try {
        const quyen = await yeuCauChuQuanDaDuyet()
        if (!quyen) return NextResponse.json({ error: 'Chỉ chủ quán đã duyệt mới được cập nhật đơn' }, { status: 403 })

        const { id } = await params
        const don = await timDonDoAnTheoId(id)
        if (!don || don.quanAnId !== quyen.quan.id) return NextResponse.json({ error: 'Không tìm thấy đơn' }, { status: 404 })

        const { trangThai } = await request.json()
        const hopLe = trangThai === BUOC_KE[don.trangThai] || (trangThai === 'huy' && don.trangThai !== 'da_giao' && don.trangThai !== 'huy')
        if (!hopLe) return NextResponse.json({ error: 'Bước cập nhật không hợp lệ' }, { status: 400 })

        const daCapNhat = await capNhatTrangThaiDon(id, trangThai)
        // Báo khách trạng thái mới ngay (đơn nhảy trạng thái không cần F5)
        await baoDonDoAnCapNhat(daCapNhat)
        return NextResponse.json({ don: daCapNhat })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
