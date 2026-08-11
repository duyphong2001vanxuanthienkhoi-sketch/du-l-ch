// Nạp dữ liệu hiện có từ các file data/*.json lên Postgres (Neon).
// Chạy MỘT LẦN sau khi đã tạo bảng:  npm run nap-du-lieu
// An toàn khi chạy lại: dùng UPSERT (trùng khóa thì ghi đè), không nhân đôi dữ liệu.
import { neon } from '@neondatabase/serverless'
import { promises as fs } from 'fs'
import path from 'path'

if (!process.env.DATABASE_URL) {
    console.error('Thiếu DATABASE_URL. Chạy: npm run nap-du-lieu')
    process.exit(1)
}
const sql = neon(process.env.DATABASE_URL)

async function docJson(ten, mac) {
    try {
        return JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', ten), 'utf8'))
    } catch {
        return mac
    }
}

// Nạp một "bảng tài liệu": mỗi phần tử -> (khóa, data JSONB), trùng khóa thì ghi đè.
async function napBang(bang, cotKhoa, ds, layKhoa) {
    let n = 0
    for (const item of ds) {
        const khoa = layKhoa(item)
        await sql.query(
            `INSERT INTO ${bang} (${cotKhoa}, data) VALUES ($1, $2::jsonb)
             ON CONFLICT (${cotKhoa}) DO UPDATE SET data = EXCLUDED.data`,
            [khoa, JSON.stringify(item)]
        )
        n++
    }
    console.log(`  ✓ ${bang}: ${n} dòng`)
}

const users = (await docJson('users.json', { users: [] })).users || []
const stores = (await docJson('stores.json', { stores: [] })).stores || []
const products = (await docJson('products.json', { products: [] })).products || []
const orders = (await docJson('orders.json', { orders: [] })).orders || []
const ratings = (await docJson('ratings.json', { ratings: [] })).ratings || []
const coupons = (await docJson('coupons.json', { coupons: [] })).coupons || []
const diadiem = (await docJson('diadiem.json', { gianTheoDiaDiem: {} })).gianTheoDiaDiem || {}

await napBang('users', 'id', users, u => u.id)
await napBang('stores', 'id', stores, s => s.id)
await napBang('products', 'id', products, p => p.id)
await napBang('orders', 'id', orders, o => o.id)
await napBang('ratings', 'id', ratings, r => r.id)
await napBang('coupons', 'code', coupons, c => c.code)

let nDD = 0
for (const [diaDiemId, storeIds] of Object.entries(diadiem)) {
    await sql.query(
        `INSERT INTO dia_diem_gian (dia_diem_id, store_ids) VALUES ($1, $2::jsonb)
         ON CONFLICT (dia_diem_id) DO UPDATE SET store_ids = EXCLUDED.store_ids`,
        [diaDiemId, JSON.stringify(storeIds)]
    )
    nDD++
}
console.log(`  ✓ dia_diem_gian: ${nDD} dòng`)

console.log('\nXong! Đã nạp toàn bộ dữ liệu demo lên Neon.')
