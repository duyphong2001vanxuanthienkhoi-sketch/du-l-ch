import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import {
    danhSachSuKien, timSuKienTheoId,
    taoSuKien, capNhatSuKien, xoaSuKien,
} from '@/lib/server/suKienDb'

// CRUD SỰ KIỆN & LỄ HỘI cho biên tập viên.
const CHUA_BANG = (e) =>
    e?.code === '42P01' || /relation .*su_kien.* does not exist/i.test(e?.message || '')

const BAO_CHUA_BANG = () => NextResponse.json(
    { error: 'Chưa có bảng su_kien. Chạy: npm run tao-bang-du-lich', chuaTaoBang: true },
    { status: 503 })

const CAM = () => NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })

export async function GET() {
    if (!await yeuCauAdmin()) return CAM()
    try {
        return NextResponse.json({ suKiens: await danhSachSuKien() })
    } catch (e) {
        if (CHUA_BANG(e)) return BAO_CHUA_BANG()
        return NextResponse.json({ error: 'Không tải được danh sách' }, { status: 500 })
    }
}

function kiemTra(d) {
    const ten = Array.isArray(d.ten) ? String(d.ten[0] || '').trim() : ''
    if (!ten) return 'Chưa nhập tên lễ hội (bản tiếng Việt)'
    // Lễ hội âm lịch KHÔNG cần ngày dương; nhưng lễ dương lịch mà thiếu ngày thì
    // không đếm ngược được, và mất luôn ý nghĩa "canh đúng dịp".
    if (!d.amLich && !d.batDau && !(Array.isArray(d.ghiChuNgay) && d.ghiChuNgay[0]?.trim())) {
        return 'Cần nhập ngày bắt đầu, hoặc ghi chú thời điểm bằng chữ'
    }
    return null
}

export async function POST(request) {
    if (!await yeuCauAdmin()) return CAM()
    try {
        const body = await request.json()
        const loi = kiemTra(body)
        if (loi) return NextResponse.json({ error: loi }, { status: 400 })
        return NextResponse.json({ suKien: await taoSuKien(body) })
    } catch (e) {
        if (CHUA_BANG(e)) return BAO_CHUA_BANG()
        return NextResponse.json({ error: e?.message || 'Không thêm được' }, { status: 400 })
    }
}

export async function PUT(request) {
    if (!await yeuCauAdmin()) return CAM()
    try {
        const body = await request.json()
        if (!body?.id) return NextResponse.json({ error: 'Thiếu mã sự kiện' }, { status: 400 })
        const loi = kiemTra(body)
        if (loi) return NextResponse.json({ error: loi }, { status: 400 })

        const sk = await capNhatSuKien(body.id, body)
        if (!sk) return NextResponse.json({ error: 'Không tìm thấy sự kiện' }, { status: 404 })
        return NextResponse.json({ suKien: sk })
    } catch (e) {
        if (CHUA_BANG(e)) return BAO_CHUA_BANG()
        return NextResponse.json({ error: 'Không lưu được' }, { status: 500 })
    }
}

export async function DELETE(request) {
    if (!await yeuCauAdmin()) return CAM()
    try {
        const id = request.nextUrl.searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'Thiếu mã sự kiện' }, { status: 400 })
        if (!await timSuKienTheoId(id)) {
            return NextResponse.json({ error: 'Không tìm thấy sự kiện' }, { status: 404 })
        }
        await xoaSuKien(id)
        return NextResponse.json({ ok: true })
    } catch (e) {
        if (CHUA_BANG(e)) return BAO_CHUA_BANG()
        return NextResponse.json({ error: 'Không xoá được' }, { status: 500 })
    }
}
