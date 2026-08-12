import { gocUngDung } from '@/lib/server/gocUngDung'
import { danhSachDiaDiem } from '@/lib/server/diaDiemDb'

// Sơ đồ trang (sitemap.xml) — báo cho Google biết có những trang nào để lập chỉ mục.
// CHỈ liệt kê nội dung công khai: các địa điểm ĐÃ DUYỆT.
// (Trang quản trị là riêng tư — không đưa vào, và bị chặn ở robots.js.)
export default async function sitemap() {
    const goc = gocUngDung()
    const luc = new Date()

    const trangTinh = ['', '/kham-pha', '/ban-do', '/lo-trinh', '/su-kien', '/hanh-trinh'].map(p => ({
        url: `${goc}${p}`,
        lastModified: luc,
        changeFrequency: p === '' ? 'daily' : 'weekly',
        priority: p === '' ? 1 : 0.8,
    }))

    try {
        const diaDiems = await danhSachDiaDiem({ status: 'da_duyet' })
        return [
            ...trangTinh,
            ...diaDiems.map(d => ({
                url: `${goc}/dia-diem/${d.id}`,
                lastModified: new Date(d.capNhatLuc || d.createdAt || luc),
                changeFrequency: 'weekly',
                priority: 0.7,
            })),
        ]
    } catch {
        // CSDL trục trặc thì vẫn trả các trang tĩnh, không để sitemap lỗi hẳn
        return trangTinh
    }
}
