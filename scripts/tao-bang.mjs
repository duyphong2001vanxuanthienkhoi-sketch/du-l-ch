// Tạo các bảng trong Postgres (Neon). Chạy MỘT LẦN (hoặc lại — an toàn nhờ IF NOT EXISTS).
// Cách chạy:  npm run tao-bang
//
// Mỗi bảng theo kiểu TÀI LIỆU: một cột khóa + cột data JSONB giữ nguyên object cũ.
// Có thêm vài chỉ mục trên trường JSON hay tra cứu để truy vấn nhanh.
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
    console.error('Thiếu DATABASE_URL. Chạy: npm run tao-bang  (đã tự nạp .env qua --env-file)')
    process.exit(1)
}
const sql = neon(process.env.DATABASE_URL)

const cauLenh = [
    `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, data JSONB NOT NULL)`,
    // Email là duy nhất (không phân biệt hoa/thường) — chặn trùng ngay ở tầng CSDL,
    // an toàn hơn khóa-ghi-file cũ khi có nhiều tiến trình serverless chạy song song.
    `CREATE UNIQUE INDEX IF NOT EXISTS users_email_uniq ON users (lower(data->>'email'))`,

    `CREATE TABLE IF NOT EXISTS stores (id TEXT PRIMARY KEY, data JSONB NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS stores_user_idx ON stores ((data->>'userId'))`,
    `CREATE INDEX IF NOT EXISTS stores_status_idx ON stores ((data->>'status'))`,

    `CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, data JSONB NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS products_store_idx ON products ((data->>'storeId'))`,

    `CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, data JSONB NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS orders_user_idx ON orders ((data->>'userId'))`,
    // Lọc nhanh đơn theo gian: item nào chứa storeId (dùng chỉ mục GIN cho toán tử @>)
    `CREATE INDEX IF NOT EXISTS orders_items_gin ON orders USING GIN ((data->'items'))`,

    `CREATE TABLE IF NOT EXISTS ratings (id TEXT PRIMARY KEY, data JSONB NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS ratings_product_idx ON ratings ((data->>'productId'))`,
    `CREATE INDEX IF NOT EXISTS ratings_store_idx ON ratings ((data->>'storeId'))`,

    `CREATE TABLE IF NOT EXISTS coupons (code TEXT PRIMARY KEY, data JSONB NOT NULL)`,

    `CREATE TABLE IF NOT EXISTS dia_diem_gian (dia_diem_id TEXT PRIMARY KEY, store_ids JSONB NOT NULL DEFAULT '[]'::jsonb)`,

    // Đồ Ăn Hồng Gai — module đặt món riêng: quán ăn (như "gian" nhưng cho ăn uống)
    `CREATE TABLE IF NOT EXISTS quan_an (id TEXT PRIMARY KEY, data JSONB NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS quan_an_user_idx ON quan_an ((data->>'userId'))`,
    `CREATE INDEX IF NOT EXISTS quan_an_status_idx ON quan_an ((data->>'status'))`,

    // Món ăn trong thực đơn của từng quán
    `CREATE TABLE IF NOT EXISTS mon_an (id TEXT PRIMARY KEY, data JSONB NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS mon_an_quan_idx ON mon_an ((data->>'quanAnId'))`,

    // Quán ăn gần đó theo địa điểm — admin gắn tay (song song với dia_diem_gian)
    `CREATE TABLE IF NOT EXISTS dia_diem_quan (dia_diem_id TEXT PRIMARY KEY, quan_ids JSONB NOT NULL DEFAULT '[]'::jsonb)`,

    // Đơn đặt món của khách — luồng đặt đồ ăn riêng (tách khỏi đơn hàng chợ)
    `CREATE TABLE IF NOT EXISTS don_do_an (id TEXT PRIMARY KEY, data JSONB NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS don_do_an_quan_idx ON don_do_an ((data->>'quanAnId'))`,
    `CREATE INDEX IF NOT EXISTS don_do_an_user_idx ON don_do_an ((data->>'userId'))`,

    // Chat KHÁCH ↔ QUÁN — mỗi cặp (khách, quán) một hội thoại (id tất định)
    `CREATE TABLE IF NOT EXISTS hoi_thoai (id TEXT PRIMARY KEY, data JSONB NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS hoi_thoai_user_idx ON hoi_thoai ((data->>'userId'))`,
    `CREATE INDEX IF NOT EXISTS hoi_thoai_quan_idx ON hoi_thoai ((data->>'quanAnId'))`,

    // Từng tin nhắn trong một hội thoại
    `CREATE TABLE IF NOT EXISTS tin_nhan (id TEXT PRIMARY KEY, data JSONB NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS tin_nhan_hoi_thoai_idx ON tin_nhan ((data->>'hoiThoaiId'))`,

    // Đăng ký Web Push của từng thiết bị (key = endpoint của trình duyệt), gắn theo userId
    `CREATE TABLE IF NOT EXISTS push_dang_ky (endpoint TEXT PRIMARY KEY, data JSONB NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS push_dang_ky_user_idx ON push_dang_ky ((data->>'userId'))`,
]

for (const c of cauLenh) {
    await sql.query(c)
    console.log('  ✓', c.replace(/\s+/g, ' ').slice(0, 70))
}
console.log('\nXong! Đã tạo đủ các bảng trong Neon.')
