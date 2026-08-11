import { NextResponse } from 'next/server'
import { sql } from '@/lib/server/db'

const MOI_QUAN_TOI_DA = 3  // mỗi quán góp tối đa bấy nhiêu món vào dải nổi bật
const TONG_TOI_DA = 12     // tổng số món hiển thị

// PRNG có hạt giống (mulberry32) — dãy "ngẫu nhiên" nhưng ổn định theo hạt giống,
// nhờ vậy cùng một ngày mọi người thấy cùng thứ tự (không nhảy khi F5), qua ngày mới đổi.
function taoPrng(seed) {
    let s = seed | 0
    return function () {
        s = (s + 0x6D2B79F5) | 0
        let t = Math.imul(s ^ (s >>> 15), 1 | s)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

// Xáo trộn Fisher–Yates dùng hàm ngẫu nhiên truyền vào (để xáo ổn định theo ngày)
function xao(a, rnd) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

// Hạt giống theo NGÀY (giờ Việt Nam, UTC+7) — đổi lúc nửa đêm VN
function hatGiongTheoNgay(vnNow) {
    const ngay = vnNow.toISOString().slice(0, 10) // 'YYYY-MM-DD'
    let h = 0
    for (let i = 0; i < ngay.length; i++) h = (Math.imul(h, 31) + ngay.charCodeAt(i)) | 0
    return h
}

// Buổi hiện tại theo giờ VN → khớp id buổi của quán (lib/doAn: an_sang/an_trua/an_toi/an_vat)
function buoiTheoGio(gioVN) {
    if (gioVN >= 4 && gioVN < 10) return 'an_sang'
    if (gioVN >= 10 && gioVN < 14) return 'an_trua'
    if (gioVN >= 14 && gioVN < 17) return 'an_vat'
    if (gioVN >= 17 && gioVN < 22) return 'an_toi'
    return 'an_dem' // 22h–4h: ăn đêm
}

// GET /api/quan-an/mon-noi-bat — dải "Món nổi bật" CÔNG BẰNG + THEO BUỔI cho trang Đồ ăn.
// Lấy món CÓ ẢNH, còn phục vụ, từ các quán ĐÃ DUYỆT; rồi:
//   - gom theo quán, xáo trộn ổn định theo NGÀY (F5 không nhảy, qua ngày mới xoay lượt),
//   - ƯU TIÊN MỀM: quán phục vụ buổi hiện tại (sáng/trưa/tối) xếp lên trước — nhưng VẪN
//     hiện đủ mọi quán (round-robin), không lọc cứng nên không quán nào bị ẩn.
// Trả kèm `buoi` để trang đổi tiêu đề động ("Gợi ý bữa sáng/trưa/tối").
export async function GET() {
    try {
        const vnNow = new Date(Date.now() + 7 * 3600 * 1000)
        const buoi = buoiTheoGio(vnNow.getUTCHours())

        const rows = await sql`
            SELECT m.data AS mon, m.data->>'quanAnId' AS quan_id,
                   q.data->>'ten' AS ten_quan, q.data->'loai' AS loai
            FROM mon_an m
            JOIN quan_an q ON q.id = m.data->>'quanAnId'
            WHERE q.data->>'status' = 'da_duyet'
              AND m.data->>'anh' IS NOT NULL AND m.data->>'anh' <> ''
              AND COALESCE((m.data->>'con')::boolean, true) = true`

        // Gom món theo quán, nhớ buổi mà quán phục vụ
        const theoQuan = new Map()
        for (const r of rows) {
            if (!theoQuan.has(r.quan_id)) theoQuan.set(r.quan_id, { loai: Array.isArray(r.loai) ? r.loai : [], mon: [] })
            theoQuan.get(r.quan_id).mon.push({
                id: r.mon.id,
                quanAnId: r.mon.quanAnId,
                tenQuan: r.ten_quan,
                ten: r.mon.ten,
                gia: r.mon.gia,
                anh: r.mon.anh,
            })
        }

        const rnd = taoPrng(hatGiongTheoNgay(vnNow))
        // Xáo trộn món trong từng quán (ổn định theo ngày)
        const dsQuan = [...theoQuan.values()].map(q => ({ ...q, mon: xao(q.mon, rnd) }))
        // Ưu tiên MỀM: tách quán phục vụ buổi hiện tại lên trước, mỗi nhóm tự xáo theo ngày
        const phucVuBuoi = xao(dsQuan.filter(q => q.loai.includes(buoi)), rnd)
        const conLai = xao(dsQuan.filter(q => !q.loai.includes(buoi)), rnd)
        const thuTuQuan = [...phucVuBuoi, ...conLai]

        // Round-robin: mỗi vòng lấy 1 món của mỗi quán → công bằng, quán buổi này lên trước
        const ketQua = []
        for (let vong = 0; vong < MOI_QUAN_TOI_DA && ketQua.length < TONG_TOI_DA; vong++) {
            for (const q of thuTuQuan) {
                if (q.mon[vong] && ketQua.length < TONG_TOI_DA) ketQua.push(q.mon[vong])
            }
        }

        return NextResponse.json({ mon: ketQua, buoi })
    } catch {
        return NextResponse.json({ mon: [], buoi: null })
    }
}
