import { NextResponse } from 'next/server'
import { layNguoiDungHienTai } from '@/lib/server/quyen'
import { layPhien } from '@/lib/server/phien'
import { timDiaDiemTheoId } from '@/lib/server/diaDiemDb'
import { taoDanhGiaDiaDiem, daDanhGiaDiaDiem, danhGiaTheoDiaDiem } from '@/lib/server/ratingDb'
import { luuAnhUpload } from '@/lib/server/luuAnh'

// ĐÁNH GIÁ ĐỊA ĐIỂM.
// App du lịch không bán hàng nên chỉ còn MỘT kiểu đánh giá — về địa điểm.
// (Bản cũ có thêm đánh giá sản phẩm / gian hàng, đã bỏ cùng phần thương mại.)

// GET /api/ratings?diaDiem=<slug> — công khai.
// Đang đăng nhập thì trả thêm toiDaDanhGia để giao diện ẩn form khỏi người đã gửi.
export async function GET(request) {
    const diaDiem = request.nextUrl.searchParams.get('diaDiem')
    if (!diaDiem) return NextResponse.json({ error: 'Thiếu mã địa điểm' }, { status: 400 })

    const ratings = await danhGiaTheoDiaDiem(diaDiem)

    let toiDaDanhGia = false
    const phien = await layPhien()
    if (phien) toiDaDanhGia = await daDanhGiaDiaDiem(diaDiem, phien.sub)

    // Không lộ userId ra công khai
    return NextResponse.json({
        ratings: ratings.map(r => ({
            id: r.id,
            ten: r.ten,
            anhNguoiDung: r.anhNguoiDung,
            sao: r.sao,
            binhLuan: r.binhLuan,
            anhs: r.anhs || [],
            createdAt: r.createdAt,
        })),
        toiDaDanhGia,
        // Khám phá: ai đăng nhập cũng đánh giá được (không đòi từng mua hàng như bản cũ)
        coTheDanhGia: !!phien && !toiDaDanhGia,
    })
}

// POST /api/ratings — gửi bằng FormData (có thể kèm tối đa 4 ảnh):
//   diaDiemId, sao, binhLuan, anh (nhiều file)
// Mỗi người một lần cho mỗi địa điểm. Đây là chỗ DUY NHẤT trong app còn đòi đăng nhập
// — vì không có danh tính thì phần đánh giá thành bãi spam (THIET-KE-APP-DU-LICH.md mục 7).
export async function POST(request) {
    try {
        const user = await layNguoiDungHienTai()
        if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập để đánh giá' }, { status: 401 })

        const form = await request.formData()
        const diaDiemId = form.get('diaDiemId')
        const sao = form.get('sao')
        const binhLuan = form.get('binhLuan')
        const files = form.getAll('anh').filter(f => typeof f === 'object' && f.size > 0)

        if (!diaDiemId) return NextResponse.json({ error: 'Thiếu mã địa điểm' }, { status: 400 })
        if (files.length > 4) return NextResponse.json({ error: 'Tối đa 4 ảnh mỗi đánh giá' }, { status: 400 })

        const soSao = Number(sao)
        if (!Number.isInteger(soSao) || soSao < 1 || soSao > 5) {
            return NextResponse.json({ error: 'Vui lòng chọn từ 1 đến 5 sao' }, { status: 400 })
        }

        const dd = await timDiaDiemTheoId(String(diaDiemId))
        if (!dd || dd.status !== 'da_duyet') {
            return NextResponse.json({ error: 'Không tìm thấy địa điểm' }, { status: 404 })
        }
        if (await daDanhGiaDiaDiem(dd.id, user.id)) {
            return NextResponse.json({ error: 'Bạn đã đánh giá địa điểm này rồi' }, { status: 409 })
        }

        // Tải ảnh lên trước khi ghi đánh giá — ảnh hỏng thì báo lỗi rõ ràng,
        // không để lọt một đánh giá "cụt" mất ảnh mà khách tưởng đã đăng được.
        const anhs = []
        for (const f of files) {
            anhs.push(await luuAnhUpload(f, 'danhgia'))
        }

        const dg = await taoDanhGiaDiaDiem({
            diaDiemId: dd.id,
            userId: user.id,
            ten: user.name,
            sao: soSao,
            binhLuan: String(binhLuan || '').trim().slice(0, 500),
            anhs,
        })
        return NextResponse.json({ rating: { ...dg, anhNguoiDung: user.avatar || null } })
    } catch (e) {
        // luuAnhUpload ném lỗi có câu chữ tiếng Việt rõ ràng (sai định dạng, quá 5MB)
        return NextResponse.json({ error: e?.message || 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 400 })
    }
}
