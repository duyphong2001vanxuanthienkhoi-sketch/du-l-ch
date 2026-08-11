import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { DIA_DIEM } from '@/lib/diaDiem'

const DUOI_ANH = ['.jpg', '.jpeg', '.png', '.webp']

// GET /api/dia-diem/anh
// Quét ảnh thật trong public/dia-diem/ theo quy ước tên file:
//   <id>.jpg      -> ảnh bìa      (vd: nui-bai-tho.jpg)
//   <id>-2.jpg    -> ảnh thêm số 2 (vd: nui-bai-tho-2.jpg, -3, -4...)
// Trả về:
//   anh:     { 'nui-bai-tho': '/dia-diem/nui-bai-tho.jpg', ... }        (ảnh bìa — như cũ)
//   thuVien: { 'nui-bai-tho': ['/dia-diem/nui-bai-tho.jpg', '...-2.jpg', ...] } (đủ bộ, theo thứ tự)
// Tên file khớp với id THẬT trong DIA_DIEM (id có thể chứa số, vd cho-ha-long-1,
// nên phải đối chiếu danh sách id chứ không tách theo dấu gạch).
export async function GET() {
    try {
        const thuMuc = path.join(process.cwd(), 'public', 'dia-diem')
        const files = await fs.readdir(thuMuc)
        // Id dài xét trước để 'cho-ha-long-1' không bị nhầm là ảnh số 1 của 'cho-ha-long'
        const ids = DIA_DIEM.map(d => d.id).sort((a, b) => b.length - a.length)

        // slots[id][thuTu] = đường dẫn ảnh; thuTu 1 = ảnh bìa
        const slots = {}
        for (const f of files) {
            const duoi = path.extname(f).toLowerCase()
            if (!DUOI_ANH.includes(duoi)) continue
            const ten = path.basename(f, duoi)

            let id = null
            let thuTu = 1
            for (const d of ids) {
                if (ten === d) { id = d; break }
                if (ten.startsWith(d + '-')) {
                    const so = ten.slice(d.length + 1)
                    if (/^\d+$/.test(so)) { id = d; thuTu = Number(so); break }
                }
            }
            if (!id) continue

            if (!slots[id]) slots[id] = {}
            const cu = slots[id][thuTu]
            // Cùng một vị trí có nhiều đuôi file -> ưu tiên đuôi đứng trước trong DUOI_ANH
            if (!cu || DUOI_ANH.indexOf(duoi) < DUOI_ANH.indexOf(path.extname(cu).toLowerCase())) {
                slots[id][thuTu] = `/dia-diem/${f}`
            }
        }

        const anh = {}
        const thuVien = {}
        for (const [id, s] of Object.entries(slots)) {
            const thuTus = Object.keys(s).map(Number).sort((a, b) => a - b)
            thuVien[id] = thuTus.map(t => s[t])
            anh[id] = s[1] || thuVien[id][0]
        }
        return NextResponse.json({ anh, thuVien })
    } catch {
        return NextResponse.json({ anh: {}, thuVien: {} })
    }
}
