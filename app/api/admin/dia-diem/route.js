import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import {
    layTatCaGianTheoDiaDiem, ganGianChoDiaDiem,
    layTatCaQuanTheoDiaDiem, ganQuanChoDiaDiem,
} from '@/lib/server/diaDiemDb'
import { danhSachGian } from '@/lib/server/storeDb'
import { danhSachQuanAn } from '@/lib/server/quanAnDb'
import { DIA_DIEM } from '@/lib/diaDiem'

// GET /api/admin/dia-diem
// Chỉ admin — trả mapping địa điểm -> gian & quán đã gắn, kèm danh sách gian/quán đã duyệt để chọn.
// Phần quán bọc try/catch để nếu chưa chạy `npm run tao-bang` (chưa có bảng quán) vẫn dùng được phần gian.
export async function GET() {
    if (!await yeuCauAdmin()) {
        return NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })
    }

    const gianTheoDiaDiem = await layTatCaGianTheoDiaDiem()
    const gians = await danhSachGian({ status: 'da_duyet' })

    let quanTheoDiaDiem = {}
    let quanAns = []
    try {
        quanTheoDiaDiem = await layTatCaQuanTheoDiaDiem()
        quanAns = (await danhSachQuanAn({ status: 'da_duyet' })).map(q => ({
            id: q.id, ten: q.ten, tenChu: q.tenChu, logo: q.logo,
        }))
    } catch { quanTheoDiaDiem = {}; quanAns = [] }

    return NextResponse.json({
        gianTheoDiaDiem,
        stores: gians.map(g => ({
            id: g.id, tenGian: g.tenGian, tenChu: g.tenChu, loaiGian: g.loaiGian, logo: g.logo,
        })),
        quanTheoDiaDiem,
        quanAns,
    })
}

// POST /api/admin/dia-diem  body: { diaDiemId, storeIds?, quanIds? }
// Chỉ admin — ghi đè danh sách gian và/hoặc quán ăn gần đó của 1 địa điểm.
export async function POST(request) {
    if (!await yeuCauAdmin()) {
        return NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })
    }

    try {
        const { diaDiemId, storeIds, quanIds } = await request.json()

        if (!DIA_DIEM.some(d => d.id === diaDiemId)) {
            return NextResponse.json({ error: 'Địa điểm không hợp lệ' }, { status: 400 })
        }

        const kq = {}

        // Gắn gian (nếu gửi lên)
        if (Array.isArray(storeIds)) {
            const gianDaDuyet = new Set((await danhSachGian({ status: 'da_duyet' })).map(g => g.id))
            const hopLe = [...new Set(storeIds)].filter(id => gianDaDuyet.has(id))
            kq.storeIds = await ganGianChoDiaDiem(diaDiemId, hopLe)
        }

        // Gắn quán ăn (nếu gửi lên)
        if (Array.isArray(quanIds)) {
            const quanDaDuyet = new Set((await danhSachQuanAn({ status: 'da_duyet' })).map(q => q.id))
            const hopLe = [...new Set(quanIds)].filter(id => quanDaDuyet.has(id))
            kq.quanIds = await ganQuanChoDiaDiem(diaDiemId, hopLe)
        }

        return NextResponse.json(kq)
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
