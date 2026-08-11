// Tạo (hoặc nâng cấp) tài khoản quản trị viên — ghi vào Postgres (Neon).
// Cách dùng:  npm run tao-admin -- <email> <mat-khau> [ten-hien-thi]
// Ví dụ:      npm run tao-admin -- admin@chosohonggai.vn admin123 "Quản Trị Viên"
import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const [email, matKhau, ten] = process.argv.slice(2)

if (!email || !matKhau) {
    console.log('Cách dùng: npm run tao-admin -- <email> <mat-khau> [ten-hien-thi]')
    console.log('Ví dụ:     npm run tao-admin -- admin@chosohonggai.vn admin123 "Quản Trị Viên"')
    process.exit(1)
}
if (matKhau.length < 6) {
    console.error('Mật khẩu phải có ít nhất 6 ký tự.')
    process.exit(1)
}
if (!process.env.DATABASE_URL) {
    console.error('Thiếu DATABASE_URL. Chạy qua: npm run tao-admin -- ... (đã tự nạp .env)')
    process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)
const passwordHash = await bcrypt.hash(matKhau, 10)
const emailChuan = email.toLowerCase()

const daCo = (await sql`SELECT data FROM users WHERE lower(data->>'email') = ${emailChuan} LIMIT 1`)[0]?.data

if (daCo) {
    const thayDoi = { role: 'admin', passwordHash }
    if (ten) thayDoi.name = ten
    await sql`UPDATE users SET data = data || ${JSON.stringify(thayDoi)}::jsonb WHERE id = ${daCo.id}`
    console.log(`Đã nâng cấp tài khoản "${emailChuan}" thành quản trị viên (và đặt lại mật khẩu).`)
} else {
    const user = {
        id: 'u_' + crypto.randomUUID(),
        name: ten || 'Quản Trị Viên',
        email: emailChuan,
        passwordHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
    }
    await sql`INSERT INTO users (id, data) VALUES (${user.id}, ${JSON.stringify(user)}::jsonb)`
    console.log(`Đã tạo tài khoản quản trị viên: ${emailChuan}`)
}

console.log('Xong! Đăng nhập tại /login với email và mật khẩu vừa đặt.')
