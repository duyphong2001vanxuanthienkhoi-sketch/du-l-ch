import { NextResponse } from 'next/server'
import { goiYChoSanPham } from '@/lib/server/goiYSanPham'

// GET /api/products/lien-quan?id=<productId>&limit=8
// Gợi ý cho trang chi tiết sản phẩm: { sp, cungGian, muaKem, goiY }.
// Tách khỏi /api/products vì đây là phép TÍNH (chấm điểm + soi đơn hàng), không phải
// danh sách thô — và trang chi tiết gọi nó SAU khi đã vẽ xong phần mua hàng.
export async function GET(request) {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Thiếu id sản phẩm' }, { status: 400 })

    const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get('limit')) || 8, 2), 12)

    const ketQua = await goiYChoSanPham(id, { soLuong: limit })
    // Không tìm thấy / gian chưa duyệt: trả rỗng chứ không 404 — dải gợi ý chỉ là phần
    // phụ của trang, thiếu nó thì ẩn đi, không được làm hỏng trang sản phẩm.
    if (!ketQua) return NextResponse.json({ sp: null, cungGian: [], muaKem: [], goiY: [] })

    return NextResponse.json(ketQua)
}
