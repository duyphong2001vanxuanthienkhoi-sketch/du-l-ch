import { gocUngDung } from '@/lib/server/gocUngDung'
import { danhSachGian } from '@/lib/server/storeDb'
import { danhSachTatCaSanPham } from '@/lib/server/productDb'
import { danhSachQuanAn } from '@/lib/server/quanAnDb'

// Sơ đồ trang (sitemap.xml) — báo cho Google biết có những trang nào để lập chỉ mục.
// CHỈ liệt kê nội dung công khai: gian ĐÃ DUYỆT, sản phẩm của gian đã duyệt, quán ăn đã duyệt.
// (Trang quản trị/gian/đơn hàng là riêng tư — không đưa vào, và bị chặn ở robots.js.)
export default async function sitemap() {
    const goc = gocUngDung()
    const luc = new Date()

    const trangTinh = ['', '/shop', '/do-an', '/kham-pha', '/tra-don', '/create-store'].map(p => ({
        url: `${goc}${p}`,
        lastModified: luc,
        changeFrequency: p === '' ? 'daily' : 'weekly',
        priority: p === '' ? 1 : 0.8,
    }))

    try {
        const gians = await danhSachGian({ status: 'da_duyet' })
        const idGianDuyet = new Set(gians.map(g => g.id))

        const sanPhams = (await danhSachTatCaSanPham()).filter(p => idGianDuyet.has(p.storeId))
        const quanAns = (await danhSachQuanAn?.({ status: 'da_duyet' })) || []

        return [
            ...trangTinh,
            ...gians.map(g => ({ url: `${goc}/gian/${g.id}`, lastModified: new Date(g.quyetDinhLuc || g.createdAt || luc), changeFrequency: 'weekly', priority: 0.7 })),
            ...sanPhams.map(p => ({ url: `${goc}/product/${p.id}`, lastModified: new Date(p.updatedAt || p.createdAt || luc), changeFrequency: 'weekly', priority: 0.6 })),
            ...quanAns.map(q => ({ url: `${goc}/do-an/${q.id}`, lastModified: new Date(q.createdAt || luc), changeFrequency: 'weekly', priority: 0.6 })),
        ]
    } catch {
        // CSDL trục trặc thì vẫn trả về các trang tĩnh, không để sitemap lỗi hẳn
        return trangTinh
    }
}
