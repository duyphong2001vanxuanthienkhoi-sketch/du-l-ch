import { NextResponse } from 'next/server'
import { layNguoiDungHienTai, vaiTroTrongHoiThoai } from '@/lib/server/quyen'
import { layKhachTam } from '@/lib/server/khachTam'
import { timHoiThoaiTheoId, tinNhanTheoHoiThoai, luuTinNhan, danhDauDaDoc, BEN } from '@/lib/server/tinNhanDb'
import { ban, kenh } from '@/lib/server/pusher'
import { timQuanAnTheoId } from '@/lib/server/quanAnDb'
import { timGianTheoId } from '@/lib/server/storeDb'
import { danhSachTheoRole } from '@/lib/server/userDb'
import { guiPushToiUser } from '@/lib/server/webPush'

// Vai trò người gọi trong hội thoại: khách đã đăng nhập / chủ quán / admin, HOẶC khách vãng lai
// (khách vãng lai chỉ được vào ĐÚNG cuộc HỖ TRỢ của chính mình — khớp id trong cookie khach_tam).
async function xacDinhBen(ht) {
    const user = await layNguoiDungHienTai()
    if (user) return await vaiTroTrongHoiThoai(user, ht)
    const gid = await layKhachTam()
    if (gid && ht?.loaiDoiTac === 'admin' && ht.userId === gid) return 'khach'
    return null
}

// GET /api/tin-nhan/[id] — mở một hội thoại: trả tin nhắn + vai trò người xem, và ĐÁNH DẤU ĐÃ ĐỌC.
export async function GET(request, { params }) {
    const { id } = await params
    const ht = await timHoiThoaiTheoId(id)
    const ben = await xacDinhBen(ht)
    if (!ben) return NextResponse.json({ error: 'Không tìm thấy hội thoại' }, { status: 404 })

    const tinNhan = await tinNhanTheoHoiThoai(id)
    const hoiThoai = await danhDauDaDoc(id, ben) // mở ra xem = đã đọc
    return NextResponse.json({ hoiThoai, tinNhan, ben })
}

// POST /api/tin-nhan/[id]  body: { noiDung } — gửi một tin (khách hoặc chủ quán).
export async function POST(request, { params }) {
    try {
        const { id } = await params
        const ht = await timHoiThoaiTheoId(id)
        const ben = await xacDinhBen(ht)
        if (!ben) return NextResponse.json({ error: 'Không tìm thấy hội thoại' }, { status: 404 })

        const { noiDung } = await request.json()
        const noiDungSach = String(noiDung || '').trim().slice(0, 1000)
        if (!noiDungSach) return NextResponse.json({ error: 'Tin nhắn trống' }, { status: 400 })

        const { tinNhan, hoiThoai } = await luuTinNhan({ hoiThoaiId: id, ben, noiDung: noiDungSach })

        const laHoTro = hoiThoai.loaiDoiTac === 'admin'

        // Realtime: đẩy tin vào kênh hội thoại (cả 2 phía đang mở sẽ thấy ngay)
        await ban(kenh.hoiThoai(id), 'tin-moi', { tinNhan })
        // Cập nhật hộp thư 2 bên (đổi thứ tự + chấm chưa đọc)
        await ban(kenh.khach(hoiThoai.userId), 'co-tin', { hoiThoai })
        // Bên "quán": hỗ trợ → kênh admin dùng chung; còn lại → kênh của quán/gian
        await ban(laHoTro ? kenh.admin() : kenh.quan(hoiThoai.quanAnId), 'co-tin', { hoiThoai })

        // Web Push tới NGƯỜI NHẬN (báo cả khi họ đã đóng app)
        if (ben === BEN.KHACH) {
            if (laHoTro) {
                // Khách nhắn hỗ trợ → báo TẤT CẢ admin
                const admins = await danhSachTheoRole('admin')
                for (const ad of admins) {
                    await guiPushToiUser(ad.id, {
                        tieuDe: `🆘 ${hoiThoai.tenKhach}`,
                        noiDung: noiDungSach,
                        url: '/admin/ho-tro',
                        tag: id,
                    })
                }
            } else {
                // Khách gửi → báo chủ đối tác (chủ gian hàng hoặc chủ quán ăn, tùy loaiDoiTac)
                const laGian = hoiThoai.loaiDoiTac === 'gian'
                const doiTac = laGian ? await timGianTheoId(hoiThoai.quanAnId) : await timQuanAnTheoId(hoiThoai.quanAnId)
                if (doiTac?.userId) {
                    await guiPushToiUser(doiTac.userId, {
                        tieuDe: `💬 ${hoiThoai.tenKhach}`,
                        noiDung: noiDungSach,
                        // Gian hàng chưa có trang hộp thư riêng → mở trang chủ, bong bóng chat sẽ hiện tin.
                        url: laGian ? '/' : '/quan-an/tin-nhan',
                        tag: id,
                    })
                }
            }
        } else {
            // Quán trả lời → báo khách
            await guiPushToiUser(hoiThoai.userId, {
                tieuDe: `💬 ${hoiThoai.tenQuan}`,
                noiDung: noiDungSach,
                url: `/tin-nhan/${id}`,
                tag: id,
            })
        }

        return NextResponse.json({ tinNhan, hoiThoai })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
