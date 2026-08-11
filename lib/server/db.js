// Kết nối Postgres (Neon) — dùng driver serverless chạy tốt trên Vercel.
//
// `sql` vừa là tagged-template (sql`SELECT ...`) vừa có sql.query(text, params).
// Mỗi truy vấn là một request HTTP không trạng thái nên KHÔNG cần quản lý pool —
// hợp với môi trường serverless (mỗi lần gọi hàm là một tiến trình ngắn).
//
// Mọi "bảng" ở đây theo kiểu TÀI LIỆU: mỗi dòng là (khóa, data JSONB) giữ nguyên
// hình dạng object như bản lưu file JSON cũ, nên phần còn lại của app không đổi.
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
    throw new Error(
        'Thiếu DATABASE_URL. Đặt chuỗi kết nối Neon trong file .env (khi chạy máy) ' +
        'hoặc trong Environment Variables của Vercel (khi triển khai).'
    )
}

export const sql = neon(process.env.DATABASE_URL)
