// Nạp dữ liệu MẪU cho module Đồ Ăn Hồng Gai (vài quán + thực đơn) để xem giao diện.
// Chạy:  npm run seed-do-an   (cần đã chạy `npm run tao-bang` trước để có bảng)
//
// An toàn khi chạy lại: dùng id cố định + ON CONFLICT DO NOTHING nên không nhân đôi.
// Muốn xóa dữ liệu mẫu: xóa các dòng có id bắt đầu bằng 'q_seed' / 'm_seed' trong Neon.
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
    console.error('Thiếu DATABASE_URL. Chạy: npm run seed-do-an')
    process.exit(1)
}
const sql = neon(process.env.DATABASE_URL)
const now = new Date().toISOString()

const quans = [
    {
        id: 'q_seed_haisan_cotu', userId: 'seed', ten: 'Hải Sản Cô Tư', tenChu: 'Cô Tư',
        soDienThoai: '0912000111', diaChi: 'Đường bao biển Trần Quốc Nghiễn, Hồng Gai',
        moTa: 'Hải sản tươi bến Hòn Gai, chế biến tại chỗ — ghẹ, tôm, mực, cá song.',
        gioMoCua: '10:00', gioDongCua: '22:00', loai: ['an_trua', 'an_toi'], nhom: ['hai_san', 'com'], logo: '', status: 'da_duyet', createdAt: now,
    },
    {
        id: 'q_seed_bun_bebe', userId: 'seed', ten: 'Bún Bề Bề Hồng Gai', tenChu: 'Chú Hải',
        soDienThoai: '0912000222', diaChi: 'Gần chợ Hạ Long I, Hồng Gai',
        moTa: 'Bún bề bề, bánh cuốn chả mực — món sáng đặc trưng phố mỏ.',
        gioMoCua: '06:00', gioDongCua: '14:00', loai: ['an_sang', 'an_trua'], nhom: ['bun', 'chao'], logo: '', status: 'da_duyet', createdAt: now,
    },
]

const mons = [
    { id: 'm_seed_1', quanAnId: 'q_seed_haisan_cotu', ten: 'Ghẹ hấp', moTa: 'Ghẹ xanh hấp bia, chấm muối tiêu chanh', gia: 250000, phan: 'Món chính' },
    { id: 'm_seed_2', quanAnId: 'q_seed_haisan_cotu', ten: 'Tôm nướng', moTa: 'Tôm sú nướng muối ớt', gia: 220000, phan: 'Món chính' },
    { id: 'm_seed_3', quanAnId: 'q_seed_haisan_cotu', ten: 'Mực chiên giòn', moTa: 'Mực tươi tẩm bột chiên giòn', gia: 150000, phan: 'Món chính' },
    { id: 'm_seed_4', quanAnId: 'q_seed_haisan_cotu', ten: 'Bia Hạ Long', moTa: '', gia: 20000, phan: 'Đồ uống' },
    { id: 'm_seed_5', quanAnId: 'q_seed_haisan_cotu', ten: 'Nước sâm', moTa: 'Mát lạnh, giải nhiệt', gia: 15000, phan: 'Đồ uống' },
    { id: 'm_seed_6', quanAnId: 'q_seed_bun_bebe', ten: 'Bún bề bề', moTa: 'Bề bề (tôm tít) tươi, nước dùng ngọt thanh', gia: 45000, phan: 'Món chính' },
    { id: 'm_seed_7', quanAnId: 'q_seed_bun_bebe', ten: 'Bánh cuốn chả mực', moTa: 'Bánh cuốn nóng ăn kèm chả mực giã tay', gia: 40000, phan: 'Món chính' },
    { id: 'm_seed_8', quanAnId: 'q_seed_bun_bebe', ten: 'Trà đá', moTa: '', gia: 5000, phan: 'Đồ uống' },
]

for (const q of quans) {
    await sql`INSERT INTO quan_an (id, data) VALUES (${q.id}, ${JSON.stringify(q)}::jsonb) ON CONFLICT (id) DO NOTHING`
    console.log('  ✓ quán', q.ten)
}
for (const m of mons) {
    const mon = { ...m, anh: '', con: true, createdAt: now }
    await sql`INSERT INTO mon_an (id, data) VALUES (${m.id}, ${JSON.stringify(mon)}::jsonb) ON CONFLICT (id) DO NOTHING`
}
console.log(`  ✓ ${mons.length} món ăn`)
console.log('\nXong! Vào /do-an để xem.')
