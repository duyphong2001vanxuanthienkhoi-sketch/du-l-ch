// Kiểm tra quyền phía server — dùng trong các API route.
// Đọc vai trò MỚI NHẤT từ users.json thay vì tin vào JWT (JWT có thể chứa vai trò cũ).
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

// Tiểu thương có gian ĐÃ DUYỆT mới được quản lý sản phẩm.
// Trả về { user, gian } hoặc null nếu không đủ quyền.
export async function yeuCauTieuThuongDaDuyet() {
    const user = await layNguoiDungHienTai()
    if (!user || user.role !== 'tieu_thuong') return null

    const { timGianTheoUserId } = await import('./storeDb')
    const gian = await timGianTheoUserId(user.id)
    if (!gian || gian.status !== 'da_duyet') return null

    return { user, gian }
}

// Xác định vai trò của một người dùng TRONG một hội thoại chat.
// Trả về 'khach' (là khách của hội thoại), 'quan' (sở hữu quán của hội thoại), hoặc null.
// Dùng để chặn người ngoài đọc/gửi tin của hội thoại không phải của mình.
export async function vaiTroTrongHoiThoai(user, hoiThoai) {
    if (!user || !hoiThoai) return null
    if (hoiThoai.userId === user.id) return 'khach'
    // Hội thoại HỖ TRỢ (khách ↔ admin): bất kỳ admin nào cũng là bên "quán" (người hỗ trợ).
    if (hoiThoai.loaiDoiTac === 'admin') {
        return user.role === 'admin' ? 'quan' : null
    }
    // Bên "quán" của hội thoại có thể là gian hàng chợ (loaiDoiTac='gian') hoặc quán ăn.
    if (hoiThoai.loaiDoiTac === 'gian') {
        const { timGianTheoUserId } = await import('./storeDb')
        const gian = await timGianTheoUserId(user.id)
        if (gian && gian.id === hoiThoai.quanAnId) return 'quan'
    } else {
        const { timQuanAnTheoUserId } = await import('./quanAnDb')
        const quan = await timQuanAnTheoUserId(user.id)
        if (quan && quan.id === hoiThoai.quanAnId) return 'quan'
    }
    return null
}

// Chủ quán ăn có quán ĐÃ DUYỆT mới được quản lý thực đơn.
// Quán ăn TÁCH RIÊNG khỏi gian: chỉ cần đăng nhập + sở hữu quán da_duyet
// (không phụ thuộc role, một người có thể vừa có gian vừa có quán).
// Trả về { user, quan } hoặc null nếu không đủ quyền.
export async function yeuCauChuQuanDaDuyet() {
    const user = await layNguoiDungHienTai()
    if (!user) return null

    const { timQuanAnTheoUserId } = await import('./quanAnDb')
    const quan = await timQuanAnTheoUserId(user.id)
    if (!quan || quan.status !== 'da_duyet') return null

    return { user, quan }
}
