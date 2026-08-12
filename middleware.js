// Chặn SỚM ở tầng middleware (chạy trước khi trang render) cho khu /admin và /store,
// nên khách chưa đăng nhập không thấy màn "đang tải" rồi mới bị chặn — hết nháy trang.
//
// Đây chỉ là lớp CHẮN GIAO DIỆN cho mượt. Bảo mật thật vẫn ở API (yeuCauAdmin /
// yeuCauTieuThuongDaDuyet đọc vai trò MỚI NHẤT từ kho). Vì vậy:
//  - /admin: chặn cứng theo vai trò trong token (đổi vai trò admin rất hiếm).
//  - /store: chỉ đòi ĐÃ đăng nhập; vai trò tiểu thương có thể vừa được cấp sau khi
//    đăng ký gian (token còn cũ) nên để StoreLayout kiểm vai trò + gian đã duyệt.
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// AUTH_SECRET — khóa ký phiên đăng nhập.
//
// KHÔNG được có chuỗi mặc định ghi cứng ở đây. Mã nguồn dự án này là công khai
// (github.com/duyphong2001vanxuanthienkhoi-sketch/du-l-ch), nên chuỗi mặc định nào
// nằm trong file cũng coi như ai cũng biết — quên khai biến là bất kỳ ai đọc repo
// cũng tự ký được một phiên admin hợp lệ và vào thẳng khu quản trị.
//
// Thiếu biến thì FAIL CLOSED: chặn hẳn khu /admin thay vì cho vào bằng khóa ai cũng đoán được.
// (middleware chỉ khớp /admin nên trang công khai vẫn chạy bình thường.)
const BI_MAT = process.env.AUTH_SECRET
    ? new TextEncoder().encode(process.env.AUTH_SECRET)
    : null

async function docPhien(req) {
    // Thiếu AUTH_SECRET -> coi như KHÔNG có phiên nào hợp lệ, đẩy hết về trang đăng nhập
    if (!BI_MAT) {
        console.error('[middleware] Thiếu AUTH_SECRET — khóa toàn bộ khu /admin. Khai biến này trên Vercel rồi deploy lại.')
        return null
    }
    const token = req.cookies.get('phien')?.value
    if (!token) return null
    try {
        const { payload } = await jwtVerify(token, BI_MAT)
        return payload // { sub, role }
    } catch {
        return null
    }
}

export async function middleware(req) {
    const { pathname } = req.nextUrl
    const phien = await docPhien(req)

    // Chưa đăng nhập -> ra trang đăng nhập, kèm ?ve= để quay lại đúng chỗ
    if (!phien) {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('ve', pathname)
        return NextResponse.redirect(url)
    }

    // Khu quản trị: chỉ admin
    if (pathname.startsWith('/admin') && phien.role !== 'admin') {
        const url = req.nextUrl.clone()
        url.pathname = '/'
        url.search = ''
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin', '/admin/:path*', '/store', '/store/:path*'],
}
