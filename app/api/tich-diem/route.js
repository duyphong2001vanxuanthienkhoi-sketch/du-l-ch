import { NextResponse } from 'next/server'
import { layPhien } from '@/lib/server/phien'
import { danhSachDonTheoKhach } from '@/lib/server/orderDb'

// GET /api/tich-diem — tổng chi tiêu (cộng dồn mọi đơn) của khách đang đăng nhập.
// Giao diện tự suy ra bean + hạng bằng lib/utils/tichDiem để logic nằm một chỗ.
export async function GET() {
    const phien = await layPhien()
    if (!phien) return NextResponse.json({ tichDiem: null })

    const dons = await danhSachDonTheoKhach(phien.sub)
    const tongChiTieu = dons.reduce((s, d) => s + (Number(d.tongTien) || 0), 0)

    return NextResponse.json({ tichDiem: { tongChiTieu, soDon: dons.length } })
}
