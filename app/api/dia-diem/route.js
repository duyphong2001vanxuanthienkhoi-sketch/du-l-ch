import { NextResponse } from 'next/server'
import { layGianCuaDiaDiem, layQuanCuaDiaDiem } from '@/lib/server/diaDiemDb'
import { danhSachGian } from '@/lib/server/storeDb'
import { danhSachQuanAn } from '@/lib/server/quanAnDb'

// GET /api/dia-diem?id=<diaDiemId>
// API công khai — trả các GIAN HÀNG và QUÁN ĂN gần đó mà admin đã gắn cho địa điểm.
// Chỉ trả mục 'da_duyet' (bị gỡ duyệt sau khi gắn sẽ tự biến mất khỏi đây).
export async function GET(request) {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Thiếu id địa điểm' }, { status: 400 })

    const storeIds = await layGianCuaDiaDiem(id)
    const daDuyet = await danhSachGian({ status: 'da_duyet' })
    const gianTheoId = Object.fromEntries(daDuyet.map(g => [g.id, g]))

    // Giữ đúng thứ tự admin đã gắn, chỉ trả trường công khai
    const stores = storeIds
        .map(sid => gianTheoId[sid])
        .filter(Boolean)
        .map(g => ({
            id: g.id,
            tenGian: g.tenGian,
            tenChu: g.tenChu,
            soDienThoai: g.soDienThoai,
            loaiGian: g.loaiGian,
            moTa: g.moTa,
            logo: g.logo,
        }))

    // Quán ăn gần đó — bọc riêng để khi chưa có bảng quán vẫn trả gian bình thường
    let quanAns = []
    try {
        const quanIds = await layQuanCuaDiaDiem(id)
        const quanDaDuyet = await danhSachQuanAn({ status: 'da_duyet' })
        const quanTheoId = Object.fromEntries(quanDaDuyet.map(q => [q.id, q]))
        quanAns = quanIds
            .map(qid => quanTheoId[qid])
            .filter(Boolean)
            .map(q => ({
                id: q.id,
                ten: q.ten,
                moTa: q.moTa,
                diaChi: q.diaChi,
                gioMoCua: q.gioMoCua,
                gioDongCua: q.gioDongCua,
                logo: q.logo,
            }))
    } catch { quanAns = [] }

    return NextResponse.json({ stores, quanAns })
}
