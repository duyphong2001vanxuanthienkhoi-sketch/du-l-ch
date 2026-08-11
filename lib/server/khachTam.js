// Định danh KHÁCH VÃNG LAI (chưa đăng nhập) — chỉ dùng cho chat HỖ TRỢ với admin.
// Lưu một id ngẫu nhiên trong cookie HTTP-only: ai giữ cookie thì truy cập được đúng
// cuộc hỗ trợ của mình. Id ngẫu nhiên (uuid) đủ dài nên không đoán/dò được của người khác.
import { cookies } from 'next/headers'
import crypto from 'crypto'

const TEN_COOKIE = 'khach_tam'

// Chỉ ĐỌC id khách vãng lai (không tạo mới). Trả null nếu chưa có.
export async function layKhachTam() {
    const kho = await cookies()
    return kho.get(TEN_COOKIE)?.value || null
}

// Lấy id khách vãng lai; TẠO MỚI + đặt cookie nếu chưa có.
export async function layHoacTaoKhachTam() {
    const kho = await cookies()
    let id = kho.get(TEN_COOKIE)?.value
    if (!id) {
        id = 'g_' + crypto.randomUUID()
        kho.set(TEN_COOKIE, id, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 90, // giữ 90 ngày để khách quay lại thấy lịch sử
        })
    }
    return id
}
