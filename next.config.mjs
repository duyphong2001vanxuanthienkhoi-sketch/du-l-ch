/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true
    },
    // Route /api/dia-diem/anh đọc thư mục public/dia-diem lúc chạy. Vercel không tự
    // đóng gói public/ vào hàm serverless, nên gom kèm để fs.readdir thấy được ảnh.
    outputFileTracingIncludes: {
        '/api/dia-diem/anh': ['./public/dia-diem/**'],
    },
};

export default nextConfig;
