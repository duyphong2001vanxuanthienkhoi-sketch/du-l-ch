import { timSanPhamTheoId } from '@/lib/server/productDb'
import { timGianTheoId } from '@/lib/server/storeDb'
import { formatVND } from '@/lib/utils/currency'
import ChiTietSanPham from './ChiTietSanPham'

// Trang chi tiết sản phẩm được tách làm 2 lớp:
//  - page.jsx (SERVER, file này): sinh thẻ tiêu đề/mô tả/ảnh chia sẻ RIÊNG cho từng sản phẩm.
//    Trước đây cả trang là 'use client' nên Next không cho export metadata → mọi sản phẩm
//    dùng chung tiêu đề trang chủ: Google không xếp hạng được, dán link Zalo/Facebook
//    cũng không hiện tên hay ảnh.
//  - ChiTietSanPham.jsx (CLIENT): toàn bộ phần tương tác (chọn phân loại, giỏ, đánh giá, lightbox).
export async function generateMetadata({ params }) {
    const { productId } = await params
    try {
        const sp = await timSanPhamTheoId(productId)
        if (!sp) return { title: 'Không tìm thấy sản phẩm' }

        // Chỉ lộ thông tin của gian ĐÃ DUYỆT (khớp quy tắc của /api/products)
        const gian = await timGianTheoId(sp.storeId)
        if (!gian || gian.status !== 'da_duyet') return { title: 'Không tìm thấy sản phẩm' }

        const tieuDe = `${sp.ten} - ${formatVND(sp.gia)}`
        const moTa = (sp.moTa || '').replace(/\s+/g, ' ').trim().slice(0, 160)
            || `${sp.ten} bán tại ${gian.tenGian} trên Chợ Số Hồng Gai.`
        const anh = sp.anh || sp.anhs?.[0]

        return {
            title: tieuDe,
            description: moTa,
            alternates: { canonical: `/product/${sp.id}` },
            openGraph: {
                type: 'website',
                title: tieuDe,
                description: moTa,
                url: `/product/${sp.id}`,
                images: anh ? [{ url: anh, alt: sp.ten }] : undefined,
            },
            twitter: {
                card: 'summary_large_image',
                title: tieuDe,
                description: moTa,
                images: anh ? [anh] : undefined,
            },
        }
    } catch {
        return {} // CSDL trục trặc thì dùng metadata mặc định của layout, không làm vỡ trang
    }
}

export default function Page() {
    return <ChiTietSanPham />
}
