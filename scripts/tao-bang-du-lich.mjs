// Tạo bảng cho APP DU LỊCH (giai đoạn 1) trong Postgres (Neon).
// Chạy:  npm run tao-bang-du-lich      (an toàn khi chạy lại nhờ IF NOT EXISTS)
//
// Bảng trung tâm: `dia_diem`. Giai đoạn 4 thêm `lo_trinh` và `su_kien`.
// Các bảng uu_dai / check_in thuộc giai đoạn sau, chưa tạo ở đây.
//
// KHÔNG có bảng bảng-giá: giá chỉ là 2 trường `mucGia` + `giaVe` ngay trong địa điểm (mục 6.1).
// KHÔNG có bảng riêng cho bộ sưu tập: bộ sưu tập và lộ trình CÙNG hình dạng
// (danh sách địa điểm có thứ tự) nên dùng chung bảng `lo_trinh`, phân biệt bằng `kieu`.
//
// Sau khi chạy xong, vào /admin/dia-diem bấm "Nạp địa điểm mẫu" để có dữ liệu đầu tiên.
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
    console.error('Thiếu DATABASE_URL. Chạy: npm run tao-bang-du-lich  (đã tự nạp .env qua --env-file)')
    process.exit(1)
}
const sql = neon(process.env.DATABASE_URL)

const cauLenh = [
    // Mỗi dòng: id là SLUG (vd 'chua-long-tien'), data giữ nguyên object địa điểm.
    `CREATE TABLE IF NOT EXISTS dia_diem (id TEXT PRIMARY KEY, data JSONB NOT NULL)`,

    // Lọc theo loại hình — dùng cho thanh chip ở Khám phá / Bản đồ
    `CREATE INDEX IF NOT EXISTS dia_diem_loai_idx ON dia_diem ((data->>'loai'))`,
    // Lọc theo trạng thái — mọi trang công khai đều lọc status = 'da_duyet'
    `CREATE INDEX IF NOT EXISTS dia_diem_status_idx ON dia_diem ((data->>'status'))`,
    // Địa điểm do chủ cơ sở sở hữu (giai đoạn 6) — tra theo tài khoản
    `CREATE INDEX IF NOT EXISTS dia_diem_user_idx ON dia_diem ((data->>'userId'))`,

    // LỘ TRÌNH & BỘ SƯU TẬP — dùng chung bảng, phân biệt bằng data->>'kieu'
    // ('lo_trinh' = có giờ giấc theo từng chặng | 'bo_suu_tap' = chỉ là danh sách theo chủ đề)
    `CREATE TABLE IF NOT EXISTS lo_trinh (id TEXT PRIMARY KEY, data JSONB NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS lo_trinh_kieu_idx ON lo_trinh ((data->>'kieu'))`,
    `CREATE INDEX IF NOT EXISTS lo_trinh_status_idx ON lo_trinh ((data->>'status'))`,

    // SỰ KIỆN & LỄ HỘI
    `CREATE TABLE IF NOT EXISTS su_kien (id TEXT PRIMARY KEY, data JSONB NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS su_kien_status_idx ON su_kien ((data->>'status'))`,
    `CREATE INDEX IF NOT EXISTS su_kien_diadiem_idx ON su_kien ((data->>'diaDiemId'))`,
]

for (const c of cauLenh) {
    await sql.query(c)
    console.log('  ✓', c.replace(/\s+/g, ' ').slice(0, 72))
}

const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM dia_diem`
const [{ n_lt }] = await sql`SELECT COUNT(*)::int AS n_lt FROM lo_trinh`
const [{ n_sk }] = await sql`SELECT COUNT(*)::int AS n_sk FROM su_kien`
console.log(`\nXong! dia_diem: ${count} · lo_trinh: ${n_lt} · su_kien: ${n_sk}`)
if (count === 0) console.log('Bước tiếp:  npm run nap-dia-diem')
if (n_lt === 0 || n_sk === 0) console.log('Rồi:        npm run nap-lo-trinh')
