// Bỏ dấu tiếng Việt để tìm "ca song" vẫn ra "Cá Song", "banh dau" ra "Bánh Đậu".
// Dùng chung cho ô tìm ở Navbar và bộ lọc trang chợ — trước đây mỗi nơi chép một bản,
// sửa cách bỏ dấu ở một chỗ là chỗ kia lệch ngay.
export const boDau = (s) => String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
