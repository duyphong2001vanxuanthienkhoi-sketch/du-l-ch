// Địa chỉ gốc CÔNG KHAI của app — dùng cho sitemap, thẻ chia sẻ (Open Graph), link trong email.
// Thứ tự ưu tiên:
//   1) APP_URL trong .env — tên miền cố định, chắc chắn đúng nhất
//   2) VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL — Vercel tự cấp khi deploy
//   3) localhost khi chạy máy
export function gocUngDung() {
    if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, '')
    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
    if (vercel) return `https://${vercel.replace(/\/+$/, '')}`
    return 'http://localhost:3000'
}
