import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { timTheoEmail, capNhatNguoiDung } from '@/lib/server/userDb'
import { guiEmail, khungEmail } from '@/lib/server/guiEmail'

// Tìm địa chỉ gốc CÔNG KHAI của app để dựng link trong email.
// Thứ tự ưu tiên:
//   1) APP_URL trong .env  — dùng khi đã có tên miền cố định (chắc chắn đúng nhất)
//   2) header x-forwarded-* — proxy/Vercel gắn tên miền thật người dùng đang truy cập
//   3) origin của request  — đúng khi chạy localhost lúc dev
// Nhờ vậy link đặt lại mật khẩu luôn trỏ về đúng trang web, không còn trỏ về
// origin nội bộ/sai khi deploy sau proxy.
function locGocUngDung(request) {
    if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, '')
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
    const proto = request.headers.get('x-forwarded-proto') || 'https'
    if (host) return `${proto}://${host}`
    return new URL(request.url).origin
}

// Bước 1 của luồng quên mật khẩu: nhận email, tạo mã đặt lại rồi gửi link qua email.
// LUÔN trả lời thành công dù email có tồn tại hay không — tránh để lộ
// "email này đã đăng ký hay chưa" cho người dò tài khoản.
export async function POST(request) {
    try {
        const { email } = await request.json()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) {
            return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
        }

        const user = await timTheoEmail(email)
        if (user) {
            // Mã ngẫu nhiên gửi cho người dùng; CSDL chỉ lưu bản băm (lộ CSDL cũng không dùng được mã)
            const token = crypto.randomBytes(32).toString('hex')
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
            await capNhatNguoiDung(user.id, {
                datLai: {
                    tokenHash,
                    hetHan: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // hiệu lực 30 phút
                },
            })

            const goc = locGocUngDung(request)
            const link = `${goc}/dat-lai-mat-khau?email=${encodeURIComponent(user.email)}&token=${token}`

            await guiEmail({
                den: user.email,
                tieuDe: 'Đặt lại mật khẩu — Chợ Số Hồng Gai',
                html: khungEmail({
                    loiChao: `Chào ${user.name},`,
                    noiDung: 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Bấm nút bên dưới để tạo mật khẩu mới. Liên kết có hiệu lực trong <b>30 phút</b>.',
                    nutChu: 'Đặt lại mật khẩu',
                    nutLink: link,
                    ghiChu: 'Nếu bạn KHÔNG yêu cầu đặt lại mật khẩu, hãy bỏ qua email này — tài khoản của bạn vẫn an toàn.',
                }),
            })
        }

        return NextResponse.json({
            thongBao: 'Nếu email đã đăng ký, liên kết đặt lại mật khẩu sẽ được gửi tới hộp thư trong ít phút.',
        })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
