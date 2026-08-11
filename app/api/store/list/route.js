import { NextResponse } from 'next/server'
import { danhSachGian } from '@/lib/server/storeDb'
import { thongKeTheoGian } from '@/lib/server/ratingDb'

// GET /api/store/list?loai=cho_tuoi|qua_quang_ninh
// API công khai cho khách — CHỈ trả gian 'da_duyet' (gian chờ duyệt/từ chối không bao giờ lộ ra đây)
export async function GET(request) {
    const loai = request.nextUrl.searchParams.get('loai')

    let gians = await danhSachGian({ status: 'da_duyet' })
    if (loai) gians = gians.filter(g => g.loaiGian === loai)

    // Sao trung bình từ đánh giá của khách để gắn lên thẻ gian
    const thongKe = await thongKeTheoGian()

    // Chỉ trả các trường cần cho hiển thị công khai
    const congKhai = gians.map(g => ({
        id: g.id,
        tenGian: g.tenGian,
        tenChu: g.tenChu,
        soDienThoai: g.soDienThoai,
        loaiGian: g.loaiGian,
        moTa: g.moTa,
        logo: g.logo,
        uuTien: typeof g.uuTien === 'number' ? g.uuTien : null, // admin ghim thứ tự (nhỏ = lên trước)
        trungBinhSao: thongKe[g.id]?.trungBinhSao || 0,
        soDanhGia: thongKe[g.id]?.soDanhGia || 0,
    }))

    // Sắp xếp: gian được admin GHIM thứ tự lên trước (theo uuTien tăng dần);
    // còn lại giữ nguyên CƠ CHẾ ĐÁNH GIÁ CAO — sao trung bình rồi số lượt đánh giá.
    const hang = (x) => (typeof x.uuTien === 'number' ? x.uuTien : Number.MAX_SAFE_INTEGER)
    congKhai.sort((a, b) => {
        if (hang(a) !== hang(b)) return hang(a) - hang(b)
        if (b.trungBinhSao !== a.trungBinhSao) return b.trungBinhSao - a.trungBinhSao
        return b.soDanhGia - a.soDanhGia
    })

    return NextResponse.json({ stores: congKhai })
}
