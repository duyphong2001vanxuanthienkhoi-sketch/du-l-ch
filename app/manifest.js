// Web App Manifest (Next tự phục vụ tại /manifest.webmanifest) —
// để "Thêm vào Màn hình chính" trên Android/Chrome hiện logo + chạy toàn màn hình.
// iOS dùng thêm app/apple-icon.png + thẻ appleWebApp trong layout.
export default function manifest() {
    return {
        name: 'Khám Phá Hồng Gai',
        short_name: 'Khám Phá Hồng Gai',
        description: 'Chợ trực tuyến phường Hồng Gai, Quảng Ninh — hải sản tươi, đặc sản biển và quà lưu niệm.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        lang: 'vi',
        icons: [
            { src: '/thuong-hieu/app-icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/thuong-hieu/app-icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/thuong-hieu/app-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
    }
}
