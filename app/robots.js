import { gocUngDung } from '@/lib/server/gocUngDung'

// robots.txt — cho phép Google đọc nội dung công khai, CHẶN khu riêng tư
// (quản trị, trang quản lý gian/quán, giỏ hàng, đơn hàng, tài khoản, API).
export default function robots() {
    const goc = gocUngDung()
    return {
        rules: [{
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/api', '/tai-khoan', '/login', '/dat-lai-mat-khau', '/quen-mat-khau'],
        }],
        sitemap: `${goc}/sitemap.xml`,
    }
}
