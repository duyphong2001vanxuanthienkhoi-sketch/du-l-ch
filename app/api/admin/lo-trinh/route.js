import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import {
    danhSachLoTrinh, timLoTrinhTheoId,
    taoLoTrinh, capNhatLoTrinh, xoaLoTrinh,
} from '@/lib/server/loTrinhDb'

// CRUD LỘ TRÌNH & BỘ SƯU TẬP cho biên tập viên.
const CHUA_BANG = (e) =>
    e?.code === '42P01' || /relation .*lo_trinh.* does not exist/i.test(e?.message || '')

const BAO_CHUA_BANG = () => NextResponse.json(
    { error: 'Chưa có bảng lo_trinh. Chạy: npm run tao-bang-du-lich', chuaTaoBang: true },
    { status: 503 })

const CAM = () => NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })

export async function GET() {
    if (!await yeuCauAdmin()) return CAM()
    try {
        return NextResponse.json({ loTrinhs: await danhSachLoTrinh() })
    } catch (e) {
        if (CHUA_BANG(e)) return BAO_CHUA_BANG()
        return NextResponse.json({ error: 'Không tải được danh sách' }, { status: 500 })
    }
}

function kiemTra(d) {
    const ten = Array.isArray(d.ten) ? String(d.ten[0] || '').trim() : ''
    if (!ten) return 'Chưa nhập tên (bản tiếng Việt)'
    if (!Array.isArray(d.diem) || !d.diem.length) return 'Cần chọn ít nhất một địa điểm'
    return null
}

export async function POST(request) {
    if (!await yeuCauAdmin()) return CAM()
    try {
        const body = await request.json()
        const loi = kiemTra(body)
        if (loi) return NextResponse.json({ error: loi }, { status: 400 })
        return NextResponse.json({ loTrinh: await taoLoTrinh(body) })
    } catch (e) {
        if (CHUA_BANG(e)) return BAO_CHUA_BANG()
        return NextResponse.json({ error: e?.message || 'Không thêm được' }, { status: 400 })
    }
}

export async function PUT(request) {
    if (!await yeuCauAdmin()) return CAM()
    try {
        const body = await request.json()
        if (!body?.id) return NextResponse.json({ error: 'Thiếu mã lộ trình' }, { status: 400 })
        const loi = kiemTra(body)
        if (loi) return NextResponse.json({ error: loi }, { status: 400 })

        const lt = await capNhatLoTrinh(body.id, body)
        if (!lt) return NextResponse.json({ error: 'Không tìm thấy lộ trình' }, { status: 404 })
        return NextResponse.json({ loTrinh: lt })
    } catch (e) {
        if (CHUA_BANG(e)) return BAO_CHUA_BANG()
        return NextResponse.json({ error: 'Không lưu được' }, { status: 500 })
    }
}

export async function DELETE(request) {
    if (!await yeuCauAdmin()) return CAM()
    try {
        const id = request.nextUrl.searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'Thiếu mã lộ trình' }, { status: 400 })
        if (!await timLoTrinhTheoId(id)) {
            return NextResponse.json({ error: 'Không tìm thấy lộ trình' }, { status: 404 })
        }
        await xoaLoTrinh(id)
        return NextResponse.json({ ok: true })
    } catch (e) {
        if (CHUA_BANG(e)) return BAO_CHUA_BANG()
        return NextResponse.json({ error: 'Không xoá được' }, { status: 500 })
    }
}
