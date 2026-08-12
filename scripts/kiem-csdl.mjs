// Xem nhanh trạng thái CSDL du lịch — CHỈ ĐỌC, không ghi/sửa/xoá gì.
// Chạy:  npm run kiem-csdl
//
// Dùng để trả lời nhanh: đang nối vào CSDL nào, đã có dữ liệu chưa, có tài khoản
// admin chưa, và quan trọng nhất — có đang đứng nhầm trên CSDL của Chợ Số Hồng Gai không.
import { moKetNoi, moTaCsdl } from './_csdl.mjs'

const sql = moKetNoi()
console.log('CSDL:', moTaCsdl(), '\n')

const dem = async (bang) => {
    try {
        const r = await sql.query(`SELECT COUNT(*)::int AS n FROM "${bang}"`)
        return String(r[0].n)
    } catch {
        return '— chưa có bảng'
    }
}

console.log('Bảng của app du lịch:')
for (const b of ['dia_diem', 'lo_trinh', 'su_kien', 'users', 'ratings', 'push_dang_ky']) {
    console.log(`  ${b.padEnd(14)} ${await dem(b)}`)
}

console.log('\nTài khoản:')
try {
    const rows = await sql`
        SELECT data->>'email' AS email, data->>'role' AS role, data->>'name' AS ten
        FROM users ORDER BY data->>'createdAt'`
    if (!rows.length) {
        console.log('  (chưa có tài khoản nào)')
        console.log('  Tạo admin:  npm run tao-admin -- <email> <mat-khau> "Quản Trị Viên"')
    }
    for (const r of rows) console.log(`  - ${r.email}  [${r.role}]  ${r.ten}`)
} catch (e) {
    console.log('  không đọc được:', e.message)
}

// Bảng của chợ KHÔNG được tồn tại ở đây. Còn thấy nghĩa là .env.local đang trỏ nhầm.
console.log('\nChốt an toàn — bảng của chợ (phải "chưa có bảng" hết):')
let nham = false
for (const b of ['stores', 'products', 'orders']) {
    const n = await dem(b)
    if (!n.startsWith('—')) nham = true
    console.log(`  ${b.padEnd(14)} ${n}`)
}
console.log(nham
    ? '\n⛔ ĐANG ĐỨNG TRÊN CSDL CỦA CHỢ. Sửa DATABASE_URL trong .env.local.'
    : '\n✅ Đúng CSDL riêng của app du lịch.')
