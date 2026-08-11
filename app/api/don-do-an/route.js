import { NextResponse } from 'next/server'
import { layNguoiDungHienTai } from '@/lib/server/quyen'
import { timQuanAnTheoId } from '@/lib/server/quanAnDb'
import { timMonTheoId } from '@/lib/server/monAnDb'
import { taoDonDoAn } from '@/lib/server/donDoAnDb'
import { baoDonDoAnMoi } from '@/lib/server/realtimeDon'

// POST /api/don-do-an — khách đặt món ở một quán (cần đăng nhập để theo dõi đơn).
// Body: { quanAnId, items:[{monId, soLuong}], tenKhach, soDienThoai, diaChi, ghiChu }
// Giá LẤY TỪ SERVER theo thực đơn (không tin giá client gửi lên).
export async function POST(request) {
    try {
        const user = await layNguoiDungHienTai()
        if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập để đặt món' }, { status: 401 })

        const body = await request.json()
        const quanAnId = String(body.quanAnId || '')
        const tenKhach = String(body.tenKhach || '').trim() || user.name
        const soDienThoai = String(body.soDienThoai || '').trim()
        const diaChi = String(body.diaChi || '').trim()
        const ghiChu = String(body.ghiChu || '').trim().slice(0, 300)

        // Vị trí GPS khách chia sẻ (tùy chọn) — chỉ nhận cặp lat/lng hợp lệ
        let viTri = null
        const lat = Number(body.viTri?.lat), lng = Number(body.viTri?.lng)
        if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
            viTri = { lat, lng }
        }

        const quan = await timQuanAnTheoId(quanAnId)
        if (!quan || quan.status !== 'da_duyet') return NextResponse.json({ error: 'Quán không tồn tại hoặc ngừng hoạt động' }, { status: 404 })
        if (!/^0\d{8,10}$/.test(soDienThoai.replace(/[\s.-]/g, ''))) return NextResponse.json({ error: 'Số điện thoại nhận hàng không hợp lệ' }, { status: 400 })
        if (!diaChi) return NextResponse.json({ error: 'Vui lòng nhập địa chỉ nhận đồ' }, { status: 400 })

        const dsGui = Array.isArray(body.items) ? body.items : []
        const items = []
        let tongTien = 0
        for (const it of dsGui) {
            const soLuong = Math.floor(Number(it.soLuong))
            if (!Number.isFinite(soLuong) || soLuong <= 0) continue
            const mon = await timMonTheoId(String(it.monId || ''))
            if (!mon || mon.quanAnId !== quanAnId || mon.con === false) continue
            items.push({ monId: mon.id, ten: mon.ten, gia: mon.gia, soLuong })
            tongTien += mon.gia * soLuong
        }
        if (!items.length) return NextResponse.json({ error: 'Chưa chọn món nào (hoặc món đã hết)' }, { status: 400 })

        const don = await taoDonDoAn({
            userId: user.id, quanAnId, tenQuan: quan.ten,
            items, tongTien, tenKhach, soDienThoai, diaChi, viTri, ghiChu,
        })
        // Báo chủ quán ngay (toast + chuông + thông báo đẩy) mà không cần chờ họ F5/poll
        await baoDonDoAnMoi(don, quan.userId)
        return NextResponse.json({ don })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
