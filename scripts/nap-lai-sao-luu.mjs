// NẠP LẠI DỮ LIỆU TỪ THƯ MỤC SAO LƯU
//
// Dùng khi bảng bị xoá nhầm và còn bản sao lưu dạng <ten-bang>.json (mỗi file là mảng các
// dòng y như `SELECT * FROM <bảng>`). Script tự đọc tên cột từ chính dữ liệu nên dùng được
// cho mọi bảng, kể cả bảng khoá chính không phải `id` (coupons dùng `code`,
// dia_diem_gian/dia_diem_quan dùng `dia_diem_id`).
//
//   npm run nap-lai-sao-luu -- --tu "<đường-dẫn-thư-mục>"          (xem trước, không ghi)
//   npm run nap-lai-sao-luu -- --tu "<đường-dẫn-thư-mục>" --ghi    (ghi thật)
//
// CHẠY `npm run tao-bang` TRƯỚC để bảng và chỉ mục tồn tại đúng như thiết kế.
//
// An toàn: dùng ON CONFLICT DO NOTHING — dòng nào đã có thì bỏ qua, KHÔNG đè lên dữ liệu
// mới hơn. Chạy lại nhiều lần vô hại.
import { neon } from '@neondatabase/serverless'
import { promises as fs } from 'fs'
import path from 'path'

if (!process.env.DATABASE_URL) {
    console.error('Thiếu DATABASE_URL trong .env')
    process.exit(1)
}
const sql = neon(process.env.DATABASE_URL)

const i = process.argv.indexOf('--tu')
const thuMuc = i > -1 ? process.argv[i + 1] : null
const GHI_THAT = process.argv.includes('--ghi')

if (!thuMuc) {
    console.error('Thiếu --tu <đường dẫn thư mục sao lưu>')
    process.exit(1)
}

const tep = (await fs.readdir(thuMuc)).filter(f => f.endsWith('.json')).sort()
if (!tep.length) {
    console.error('Thư mục không có file .json nào:', thuMuc)
    process.exit(1)
}

console.log(`Nguồn: ${thuMuc}`)
console.log(GHI_THAT ? '→ GHI THẬT\n' : '→ XEM TRƯỚC (không ghi gì). Thêm --ghi để nạp thật.\n')

let tongThem = 0, tongBoQua = 0

for (const f of tep) {
    const bang = path.basename(f, '.json')
    const rows = JSON.parse(await fs.readFile(path.join(thuMuc, f), 'utf8'))
    if (!Array.isArray(rows) || !rows.length) {
        console.log(`  –  ${bang.padEnd(16)} (file rỗng, bỏ qua)`)
        continue
    }

    // Bảng phải có sẵn (chạy tao-bang trước) — nạp vào bảng không tồn tại là hỏng giữa chừng
    const co = await sql`
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ${bang} LIMIT 1`
    if (!co.length) {
        console.log(`  ✗  ${bang.padEnd(16)} CHƯA CÓ BẢNG — chạy "npm run tao-bang" trước`)
        continue
    }

    const cot = Object.keys(rows[0])
    const khoa = cot[0] // cột đầu chính là khoá chính trong mọi bảng của app
    let them = 0, boQua = 0

    if (!GHI_THAT) {
        const dangCo = await sql.query(`SELECT COUNT(*)::int AS n FROM "${bang}"`)
        console.log(`  •  ${bang.padEnd(16)} ${rows.length} dòng trong sao lưu, bảng đang có ${dangCo[0].n}`)
        continue
    }

    for (const dong of rows) {
        const oCho = cot.map((_, k) => `$${k + 1}`).join(', ')
        const giaTri = cot.map(c => (typeof dong[c] === 'object' && dong[c] !== null ? JSON.stringify(dong[c]) : dong[c]))
        const kq = await sql.query(
            `INSERT INTO "${bang}" (${cot.map(c => `"${c}"`).join(', ')}) VALUES (${oCho})
             ON CONFLICT ("${khoa}") DO NOTHING RETURNING "${khoa}"`,
            giaTri
        )
        if (kq.length) them++; else boQua++
    }
    tongThem += them; tongBoQua += boQua
    console.log(`  ✓  ${bang.padEnd(16)} thêm ${them}${boQua ? `, bỏ qua ${boQua} (đã có)` : ''}`)
}

console.log(GHI_THAT
    ? `\nXong. Thêm ${tongThem} dòng${tongBoQua ? `, bỏ qua ${tongBoQua} dòng đã có` : ''}.`
    : '\nMới là xem trước — thêm --ghi để nạp thật.')
