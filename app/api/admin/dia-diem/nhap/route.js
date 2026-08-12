import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import { taoDiaDiem, capNhatDiaDiem, timDiaDiemTheoId } from '@/lib/server/diaDiemDb'
import { LOAI_DIA_DIEM } from '@/lib/diaDiemLoai'

// POST /api/admin/dia-diem/nhap   body: { diaDiems: [...], ghiDe }
// Nhập hàng loạt địa điểm từ Google Sheets.
//
// Nhận DANH SÁCH ĐÃ ĐỌC từ trang /admin/nhap chứ không nhận CSV thô: biên tập viên
// được sửa loại hình ngay trên bảng xem trước (máy đoán sai thì chữa tại chỗ), nếu
// server đọc lại CSV thì mọi chỉnh sửa đó mất sạch.
//
// ghiDe = false (mặc định): trùng mã thì BỎ QUA, không đè bản đã sửa tay trong admin.
export async function POST(request) {
    if (!await yeuCauAdmin()) {
        return NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })
    }

    try {
        const { diaDiems, ghiDe = false } = await request.json()
        if (!Array.isArray(diaDiems) || !diaDiems.length) {
            return NextResponse.json({ error: 'Không có địa điểm nào để nhập' }, { status: 400 })
        }
        if (diaDiems.length > 500) {
            return NextResponse.json({ error: 'Mỗi lần nhập tối đa 500 địa điểm' }, { status: 400 })
        }

        const idLoai = new Set(LOAI_DIA_DIEM.map(l => l.id))

        let daThem = 0, daCapNhat = 0
        const boQua = []
        const loiGhi = []

        for (const d of diaDiems) {
            // Kiểm lại ở server — không tin dữ liệu do trình duyệt gửi lên
            if (!d?.id || !d?.ten?.[0]) { loiGhi.push('Một dòng thiếu tên/mã, đã bỏ'); continue }
            if (!idLoai.has(d.loai)) { loiGhi.push(`${d.id}: loại hình không hợp lệ`); continue }

            try {
                const daCo = await timDiaDiemTheoId(d.id)
                if (daCo) {
                    if (!ghiDe) { boQua.push(d.id); continue }
                    await capNhatDiaDiem(d.id, d)
                    daCapNhat++
                } else {
                    await taoDiaDiem(d)
                    daThem++
                }
            } catch (e) {
                loiGhi.push(`${d.id}: ${e?.message || 'lỗi không rõ'}`)
            }
        }

        return NextResponse.json({ daThem, daCapNhat, boQua, loiGhi, tong: diaDiems.length })
    } catch (e) {
        if (e?.code === '42P01' || /relation .*dia_diem.* does not exist/i.test(e?.message || '')) {
            return NextResponse.json(
                { error: 'Chưa có bảng dia_diem. Chạy: npm run tao-bang-du-lich', chuaTaoBang: true },
                { status: 503 },
            )
        }
        return NextResponse.json({ error: 'Không nhập được dữ liệu' }, { status: 500 })
    }
}
