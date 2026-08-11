import { NextResponse } from 'next/server'
import { timDonTraCuu } from '@/lib/server/orderDb'

// POST /api/tra-don  { ma, soDienThoai }
// Tra cứu đơn cho khách VÃNG LAI (không cần đăng nhập). Phải khớp cả mã đơn lẫn SĐT.
export async function POST(request) {
    try {
        const { ma, soDienThoai } = await request.json()
        const don = await timDonTraCuu(ma, soDienThoai)
        if (!don) {
            return NextResponse.json({ error: 'Không tìm thấy đơn khớp mã và số điện thoại. Vui lòng kiểm tra lại.' }, { status: 404 })
        }
        return NextResponse.json({ order: don })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
