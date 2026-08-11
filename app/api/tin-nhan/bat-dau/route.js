import { NextResponse } from 'next/server'
import { layNguoiDungHienTai } from '@/lib/server/quyen'
import { layHoacTaoKhachTam } from '@/lib/server/khachTam'
import { timQuanAnTheoId } from '@/lib/server/quanAnDb'
import { timGianTheoId } from '@/lib/server/storeDb'
import { timHoacTaoHoiThoai } from '@/lib/server/tinNhanDb'

// POST /api/tin-nhan/bat-dau  body: { quanAnId } HOẶC { gianId }
// Khách bấm "Nhắn tin" ở một quán ăn (quanAnId) hoặc một gian hàng chợ (gianId)
// → mở (hoặc tạo) hội thoại, trả về id để vào trang chat.
export async function POST(request) {
    try {
        const user = await layNguoiDungHienTai()
        const { quanAnId, gianId, hoTro } = await request.json()

        // Kênh HỖ TRỢ: ai cũng nhắn cho admin được — kể cả khách CHƯA đăng nhập (dùng id khách vãng lai).
        if (hoTro) {
            const userId = user ? user.id : await layHoacTaoKhachTam()
            const tenKhach = user ? user.name : 'Khách vãng lai'
            const hoiThoai = await timHoacTaoHoiThoai({
                userId, quanAnId: 'admin', loaiDoiTac: 'admin',
                tenQuan: 'Hỗ trợ Chợ Số', tenKhach,
            })
            return NextResponse.json({ hoiThoai })
        }

        // Các chat khác (với quán ăn / gian hàng) vẫn cần đăng nhập
        if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập để nhắn tin' }, { status: 401 })

        // Xác định đối tác: gian hàng chợ hay quán ăn
        let doiTacId, loaiDoiTac, tenDoiTac, logoDoiTac
        if (gianId) {
            const gian = await timGianTheoId(String(gianId))
            if (!gian || gian.status !== 'da_duyet') return NextResponse.json({ error: 'Gian hàng không tồn tại hoặc ngừng hoạt động' }, { status: 404 })
            if (gian.userId === user.id) return NextResponse.json({ error: 'Đây là gian hàng của bạn' }, { status: 400 })
            doiTacId = gian.id; loaiDoiTac = 'gian'; tenDoiTac = gian.tenGian; logoDoiTac = gian.logo
        } else {
            const quan = await timQuanAnTheoId(String(quanAnId || ''))
            if (!quan || quan.status !== 'da_duyet') return NextResponse.json({ error: 'Quán không tồn tại hoặc ngừng hoạt động' }, { status: 404 })
            // Chủ quán không tự chat với quán của chính mình
            if (quan.userId === user.id) return NextResponse.json({ error: 'Đây là quán của bạn' }, { status: 400 })
            doiTacId = quan.id; loaiDoiTac = 'quan'; tenDoiTac = quan.ten; logoDoiTac = quan.logo
        }

        const hoiThoai = await timHoacTaoHoiThoai({
            userId: user.id, quanAnId: doiTacId, loaiDoiTac, tenQuan: tenDoiTac, tenKhach: user.name, logoQuan: logoDoiTac,
        })
        return NextResponse.json({ hoiThoai })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
