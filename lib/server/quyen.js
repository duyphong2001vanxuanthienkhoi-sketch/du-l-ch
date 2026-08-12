// Kiểm tra quyền phía server — dùng trong các API route.
// Đọc vai trò MỚI NHẤT từ CSDL thay vì tin vào JWT (JWT có thể chứa vai trò cũ).
//
// App du lịch guest-first: hầu hết API là công khai, không gọi tới đây.
// Chỉ khu quản trị nội dung và đánh giá mới cần danh tính.
import { layPhien } from './phien'
import { timTheoId } from './userDb'

export async function layNguoiDungHienTai() {
    const phien = await layPhien()
    if (!phien) return null
    return await timTheoId(phien.sub)
}

export async function yeuCauAdmin() {
    const user = await layNguoiDungHienTai()
    if (!user || user.role !== 'admin') return null
    return user
}
