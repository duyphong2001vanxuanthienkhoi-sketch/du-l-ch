// Kết nối CSDL cho các script của app du lịch — KÈM CHỐT AN TOÀN.
//
// VÌ SAO CÓ FILE NÀY (sự cố 12/8/2026):
// Dự án du lịch được tạo bằng cách copy thư mục Chợ Số Hồng Gai, nên .env đi theo và
// DATABASE_URL trỏ vào ĐÚNG cơ sở dữ liệu mà chợ đang chạy thật. Script dọn bảng cũ
// chạy trúng đó và xoá mất sản phẩm, gian hàng, đơn hàng thật của chợ (may là có sao lưu).
//
// CHỐT: bảng `stores` CHỈ tồn tại trong CSDL của chợ — app du lịch không bao giờ tạo nó.
// Thấy `stores` nghĩa là đang đứng nhầm chỗ, và script sẽ DỪNG NGAY thay vì ghi vào.
//
// Muốn bỏ qua chốt này (chỉ khi bạn CHẮC CHẮN đang cố tình dùng chung): thêm
//     CHO_PHEP_CSDL_CHUNG=1
// vào .env.local.
import { neon } from '@neondatabase/serverless'

// Bảng chỉ có ở CSDL của chợ — dấu hiệu nhận biết đứng nhầm CSDL
const BANG_CUA_CHO = ['stores', 'products', 'orders']

export function moKetNoi() {
    if (!process.env.DATABASE_URL) {
        console.error(`
Thiếu DATABASE_URL.

Tạo file .env.local ở thư mục dự án và dán chuỗi kết nối CSDL RIÊNG của app du lịch:

    DATABASE_URL="postgresql://...@...neon.tech/...?sslmode=require"

.env.local được nạp SAU .env nên nó ghi đè chuỗi kết nối cũ copy từ Chợ Số Hồng Gai.
`)
        process.exit(1)
    }
    return neon(process.env.DATABASE_URL)
}

// Trả về mô tả ngắn CSDL đang kết nối, để in ra cho người chạy nhìn thấy mình đang ở đâu.
export function moTaCsdl() {
    try {
        const u = new URL(process.env.DATABASE_URL)
        return `${u.hostname}${u.pathname}`
    } catch {
        return '(không đọc được chuỗi kết nối)'
    }
}

/**
 * Dừng script nếu đang đứng trên CSDL của Chợ Số Hồng Gai.
 * Gọi ở đầu MỌI script ghi dữ liệu của app du lịch.
 */
export async function chanCsdlCuaCho(sql) {
    if (process.env.CHO_PHEP_CSDL_CHUNG === '1') {
        console.warn('⚠️  Bỏ qua chốt an toàn CSDL (CHO_PHEP_CSDL_CHUNG=1). Cẩn thận.\n')
        return
    }

    let coBang = []
    try {
        const rows = await sql`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = ANY(${BANG_CUA_CHO})`
        coBang = rows.map(r => r.table_name)
    } catch {
        return   // không kiểm được thì thôi, đừng chặn oan
    }

    if (!coBang.length) return

    console.error(`
⛔ DỪNG — đang kết nối vào CSDL CỦA CHỢ SỐ HỒNG GAI, không phải CSDL app du lịch.

   Đang trỏ tới : ${moTaCsdl()}
   Phát hiện bảng: ${coBang.join(', ')}   (chỉ chợ mới có những bảng này)

   Ghi vào đây là đụng vào dữ liệu thật của chợ. Ngày 12/8/2026 đã có lần chạy nhầm
   làm mất sản phẩm, gian hàng và đơn hàng thật — phải nạp lại từ thư mục sao-luu/.

   CÁCH SỬA:
   1. Vào Neon Console tạo PROJECT MỚI (đừng dùng branch — branch sao chép nguyên dữ liệu của chợ) cho app du lịch
   2. Tạo file .env.local ở thư mục này, dán chuỗi kết nối mới:
          DATABASE_URL="postgresql://...@...neon.tech/...?sslmode=require"
      (.env.local nạp SAU .env nên tự ghi đè chuỗi cũ, KHÔNG cần sửa .env)
   3. Chạy lại lệnh vừa rồi
`)
    process.exit(1)
}

// Tiện dụng: mở kết nối + kiểm tra an toàn trong một bước
export async function ketNoiAnToan() {
    const sql = moKetNoi()
    await chanCsdlCuaCho(sql)
    console.log(`CSDL: ${moTaCsdl()}\n`)
    return sql
}
