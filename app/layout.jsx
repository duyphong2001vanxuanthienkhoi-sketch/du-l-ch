import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/AuthProvider";
import { NgonNguProvider } from "@/lib/i18n";
import { gocUngDung } from "@/lib/server/gocUngDung";
import "./fonts.css";
import "./globals.css";

// Font: Be Vietnam Pro tự host trong public/fonts (khai báo ở app/fonts.css).
// Thiết kế riêng cho tiếng Việt — dấu thanh đặt chuẩn, không bị trộn font hệ thống
// như Outfit cũ (Outfit không có glyph tiếng Việt).

const TIEU_DE = "Khám Phá Hồng Gai — Cẩm nang du lịch phường Hồng Gai, Quảng Ninh";
const MO_TA = "Cẩm nang du lịch Hồng Gai: địa điểm ăn uống, vui chơi, tâm linh, di tích và ngắm cảnh quanh vịnh Hạ Long.";

export const metadata = {
    // metadataBase: gốc để Next dựng link tuyệt đối cho ảnh chia sẻ & thẻ canonical
    metadataBase: new URL(gocUngDung()),
    title: {
        default: TIEU_DE,
        // Trang con chỉ cần đặt title ngắn, tự nối đuôi thương hiệu
        template: "%s · Khám Phá Hồng Gai",
    },
    description: MO_TA,
    // Thẻ chia sẻ (Zalo/Facebook/Messenger) — trước đây không có nên dán link ra
    // chỉ hiện URL trơ, không có tên hay ảnh.
    openGraph: {
        type: "website",
        siteName: "Khám Phá Hồng Gai",
        locale: "vi_VN",
        title: TIEU_DE,
        description: MO_TA,
    },
    twitter: { card: "summary_large_image", title: TIEU_DE, description: MO_TA },
    // Mở kiểu ứng dụng toàn màn hình khi thêm vào Màn hình chính trên iPhone/iPad
    appleWebApp: { capable: true, statusBarStyle: "default", title: "Khám Phá Hồng Gai" },
};

// Khoá zoom để dùng như một app (thêm vào màn hình chính):
//  - maximumScale 1 + userScalable false: chặn pinch-zoom lỡ tay VÀ tự-zoom khi bấm vào ô nhập
//  - viewportFit 'cover': tràn viền, đẹp trên máy có tai thỏ
export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
    return (
        // suppressHydrationWarning: script Chợ Đêm bên dưới có thể thêm class `dark` vào <html>
        // TRƯỚC khi React so khớp — không cảnh báo lệch hydration vì đây là chủ ý.
        <html lang="vi" suppressHydrationWarning>
            <body className="antialiased">
                {/* Áp lại lựa chọn CHỢ ĐÊM ngay lập tức (trước khi React chạy) để không chớp trắng */}
                <script dangerouslySetInnerHTML={{
                    __html: `try{if(localStorage.getItem('giao-dien')==='toi'){document.documentElement.classList.add('dark');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#0a1626')}}catch(e){}`,
                }} />
                <AuthProvider>
                    <NgonNguProvider>
                        {/* Thông báo nổi — tạo kiểu theo thương hiệu thay vì hộp trắng mặc định
                            của thư viện. */}
                        <Toaster
                            position="top-center"
                            toastOptions={{
                                duration: 3000,
                                style: {
                                    borderRadius: "14px",
                                    // Đổi màu theo giao diện sáng/tối — biến khai báo ở globals.css
                                    background: "var(--nen-toast)",
                                    color: "var(--chu-toast)",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    padding: "12px 16px",
                                    maxWidth: "92vw",
                                    // Bóng nhuốm navy + viền mảnh: nổi khỏi nền mà không bị "đục"
                                    boxShadow: "0 10px 34px -10px rgba(11,47,79,.28), 0 0 0 1px rgba(11,47,79,.06)",
                                },
                                success: { iconTheme: { primary: "#00A8A8", secondary: "#ffffff" } },
                                error: { iconTheme: { primary: "#e11d48", secondary: "#ffffff" } },
                            }}
                        />
                        {children}
                    </NgonNguProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
