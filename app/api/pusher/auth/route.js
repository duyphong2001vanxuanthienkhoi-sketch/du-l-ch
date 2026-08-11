import { NextResponse } from 'next/server'
import { layPusher } from '@/lib/server/pusher'
import { layNguoiDungHienTai, vaiTroTrongHoiThoai } from '@/lib/server/quyen'
import { layKhachTam } from '@/lib/server/khachTam'
import { timQuanAnTheoUserId } from '@/lib/server/quanAnDb'
import { timHoiThoaiTheoId } from '@/lib/server/tinNhanDb'

// POST /api/pusher/auth — Pusher gọi endpoint này để XIN PHÉP client vào một private channel.
// Thân request là form-encoded: socket_id + channel_name. Ta chỉ cấp phép nếu người dùng
// thực sự thuộc kênh đó (khách của mình / quán của mình / hội thoại của mình).
export async function POST(request) {
    const pusher = layPusher()
    if (!pusher) return NextResponse.json({ error: 'Realtime chưa cấu hình' }, { status: 500 })

    const user = await layNguoiDungHienTai()
    // Khách vãng lai (chưa đăng nhập) vẫn được vào kênh HỖ TRỢ của chính mình nhờ cookie khach_tam.
    const gid = user ? null : await layKhachTam()
    if (!user && !gid) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

    const form = await request.formData()
    const socketId = String(form.get('socket_id') || '')
    const channel = String(form.get('channel_name') || '')
    if (!socketId || !channel) return NextResponse.json({ error: 'Thiếu tham số' }, { status: 400 })

    const duocPhep = await kiemTraKenh(channel, user, gid)
    if (!duocPhep) return NextResponse.json({ error: 'Không có quyền vào kênh này' }, { status: 403 })

    const auth = pusher.authorizeChannel(socketId, channel)
    return NextResponse.json(auth)
}

// Kiểm tra người dùng (đăng nhập) hoặc khách vãng lai (gid) có thuộc kênh đang xin vào không.
async function kiemTraKenh(channel, user, gid) {
    // Hộp thư HỖ TRỢ dùng chung: private-admin → chỉ admin mới vào được
    if (channel === 'private-admin') {
        return user?.role === 'admin'
    }
    // Hộp thư của khách: private-khach-<id> → đúng id của mình (userId hoặc id khách vãng lai)
    if (channel.startsWith('private-khach-')) {
        return channel === `private-khach-${user ? user.id : gid}`
    }
    // Hộp thư của đối tác: private-quan-<id>  → phải là chủ quán ăn HOẶC chủ gian hàng có id đó
    if (channel.startsWith('private-quan-')) {
        if (!user) return false
        const doiTacId = channel.slice('private-quan-'.length)
        const quan = await timQuanAnTheoUserId(user.id)
        if (quan && quan.id === doiTacId) return true
        const { timGianTheoUserId } = await import('@/lib/server/storeDb')
        const gian = await timGianTheoUserId(user.id)
        return !!gian && gian.id === doiTacId
    }
    // Một hội thoại: private-ht-<hoiThoaiId> → khách/chủ quán/admin của hội thoại,
    // hoặc khách vãng lai đúng cuộc HỖ TRỢ của mình.
    if (channel.startsWith('private-ht-')) {
        const id = channel.slice('private-ht-'.length)
        const ht = await timHoiThoaiTheoId(id)
        if (user) return (await vaiTroTrongHoiThoai(user, ht)) !== null
        return !!gid && ht?.loaiDoiTac === 'admin' && ht.userId === gid
    }
    return false
}
