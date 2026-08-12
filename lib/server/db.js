// Kết nối Postgres (Neon) — dùng driver serverless chạy tốt trên Vercel.
//
// `sql` vừa là tagged-template (sql`SELECT ...`) vừa có sql.query(text, params).
// Mỗi truy vấn là một request HTTP không trạng thái nên KHÔNG cần quản lý pool —
// hợp với môi trường serverless (mỗi lần gọi hàm là một tiến trình ngắn).
//
// Mọi "bảng" ở đây theo kiểu TÀI LIỆU: mỗi dòng là (khóa, data JSONB).
//
// ---------------------------------------------------------------------------
// CHƯA CÓ DATABASE_URL THÌ BÁO LÚC TRUY VẤN, KHÔNG PHẢI LÚC NẠP MODULE
// ---------------------------------------------------------------------------
// Bản trước ném lỗi ngay ở cấp module. Hậu quả: thiếu DATABASE_URL là MỌI route
// chạm tới CSDL đều đổ 500 ngay khi import — kể cả những route đã có sẵn try/catch
// để trả danh sách rỗng, vì lỗi xảy ra TRƯỚC khi vào được hàm xử lý.
//
// Nay lỗi chỉ bật ra khi thực sự chạy truy vấn, nên phần bắt lỗi sẵn có ở các API
// hoạt động đúng: app vẫn mở được và hiện "chưa có địa điểm nào" thay vì màn hình vỡ.
// Việc này quan trọng đúng lúc này: dự án đang chờ chuỗi kết nối của CSDL RIÊNG
// (dán vào .env.local) sau sự cố dùng chung CSDL với Chợ Số Hồng Gai.
import { neon } from '@neondatabase/serverless'

const THIEU_URL =
    'Chưa có DATABASE_URL. Dán chuỗi kết nối CSDL riêng của app du lịch vào .env.local ' +
    '(xem hướng dẫn ngay trong file đó), rồi chạy: npm run tao-bang-du-lich'

let _sql = null

function laySql() {
    if (_sql) return _sql
    if (!process.env.DATABASE_URL) throw new Error(THIEU_URL)
    _sql = neon(process.env.DATABASE_URL)
    return _sql
}

// Giữ nguyên cách dùng cũ ở toàn bộ dự án: vừa gọi được kiểu sql`...`,
// vừa gọi được sql.query(text, params) — chỉ khác là nối kết nối lúc gọi thay vì lúc import.
export const sql = Object.assign(
    (...args) => laySql()(...args),
    { query: (...args) => laySql().query(...args) },
)
