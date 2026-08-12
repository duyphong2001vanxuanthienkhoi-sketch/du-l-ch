// XUẤT DỮ LIỆU CỦA APP DU LỊCH RA FILE — bước 1 của việc TÁCH CSDL.
//
// Dự án này đang dùng chung CSDL Neon với Chợ Số Hồng Gai (vì .env được copy sang theo
// thư mục). Để tách ra CSDL riêng thì phải mang dữ liệu của mình đi theo:
//
//   1. npm run xuat-sao-luu                    ← (bước này) ghi ra sao-luu-du-lich/
//   2. Tạo CSDL riêng trên Neon, đổi DATABASE_URL trong .env của DỰ ÁN NÀY
//   3. npm run tao-bang-du-lich                ← dựng bảng trên CSDL mới
//   4. npm run nap-lai-sao-luu -- --tu sao-luu-du-lich --ghi
//
// Chỉ ĐỌC, không sửa gì trên CSDL.
import { neon } from '@neondatabase/serverless'
import { promises as fs } from 'fs'
import path from 'path'

if (!process.env.DATABASE_URL) {
    console.error('Thiếu DATABASE_URL trong .env')
    process.exit(1)
}
const sql = neon(process.env.DATABASE_URL)

// Các bảng app du lịch có đụng tới (xem lib/server/*.js). KHÔNG lấy bảng của chợ.
const BANG = ['users', 'dia_diem', 'lo_trinh', 'su_kien', 'ratings', 'push_dang_ky', 'hoi_thoai', 'tin_nhan']

const thuMuc = path.join(process.cwd(), 'sao-luu-du-lich')
await fs.mkdir(thuMuc, { recursive: true })
console.log(`Xuất ra: ${thuMuc}\n`)

let tong = 0
for (const ten of BANG) {
    const co = await sql`
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ${ten} LIMIT 1`
    if (!co.length) { console.log(`  –  ${ten.padEnd(14)} (không có bảng, bỏ qua)`); continue }

    const rows = await sql.query(`SELECT * FROM "${ten}"`)
    await fs.writeFile(path.join(thuMuc, `${ten}.json`), JSON.stringify(rows, null, 2), 'utf8')
    tong += rows.length
    console.log(`  ✓  ${ten.padEnd(14)} ${rows.length} dòng`)
}

console.log(`\nXong: ${tong} dòng. Giữ thư mục này cho tới khi CSDL mới chạy ổn.`)
