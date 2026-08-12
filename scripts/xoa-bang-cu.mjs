// ⛔ SCRIPT NÀY ĐÃ BỊ VÔ HIỆU HOÁ — ĐỪNG BẬT LẠI KHI CÒN DÙNG CHUNG CSDL.
//
// CHUYỆN ĐÃ XẢY RA (12/8/2026):
// Dự án này được tạo bằng cách COPY thư mục của Chợ Số Hồng Gai, nên file .env đi theo —
// tức là DATABASE_URL ở đây trỏ vào ĐÚNG cơ sở dữ liệu Neon mà chợ đang chạy thật.
// Bản gốc nằm ở:  D:\New folder (3)\go cart\gocart-main
//
// Script này chạy `DROP TABLE` 9 bảng mà app du lịch "không dùng tới":
//     products, stores, orders, coupons, mon_an, quan_an, don_do_an,
//     dia_diem_gian, dia_diem_quan
// Với app du lịch thì chúng đúng là thừa. Nhưng vì hai dự án dùng CHUNG một CSDL, nó đã
// xoá luôn toàn bộ sản phẩm, gian hàng, ĐƠN HÀNG THẬT và mã giảm giá của chợ.
//
// May là script có sao lưu trước khi xoá, nên đã nạp lại được đầy đủ từ thư mục sao-luu/
// (94 dòng: 15 sản phẩm, 15 đơn, 5 gian, 3 mã giảm giá, 23 món ăn, 4 quán, 7 đơn đồ ăn,
// 22 dòng bảng gắn địa điểm).
//
// TRƯỚC KHI CẦN XOÁ BẢNG CŨ LẦN NỮA, PHẢI LÀM XONG VIỆC NÀY:
//   1. Tạo một cơ sở dữ liệu RIÊNG cho dự án du lịch (Neon Console → project mới, hoặc
//      branch mới trong project hiện tại).
//   2. Đổi DATABASE_URL trong .env của RIÊNG dự án này sang chuỗi kết nối mới đó.
//   3. Dựng lại dữ liệu du lịch trên CSDL mới:
//         npm run tao-bang-du-lich
//         npm run nap-dia-diem
//         npm run nap-lo-trinh
//         npm run tao-admin
//   4. Kiểm chắc chắn: `SELECT COUNT(*) FROM products` phải báo LỖI "không có bảng" —
//      nghĩa là đã đứng trên CSDL riêng, không còn đụng vào chợ nữa.
// Xong bước 4 rồi thì bảng cũ trên CSDL mới vốn đã không tồn tại, cũng chẳng cần xoá gì.
//
// Bản gốc của script (có kèm sao lưu) nằm trong lịch sử git của dự án này nếu cần xem lại.

console.error(`
⛔ Script "xoa-bang-cu" đã bị vô hiệu hoá.

   Dự án này đang DÙNG CHUNG cơ sở dữ liệu với Chợ Số Hồng Gai
   (D:\\New folder (3)\\go cart\\gocart-main) vì .env được copy sang theo thư mục.

   Chạy nó sẽ xoá sản phẩm, gian hàng và ĐƠN HÀNG THẬT của chợ — đúng chuyện đã xảy ra
   ngày 12/8/2026 và phải nạp lại từ sao lưu.

   Muốn tách hẳn: tạo CSDL riêng cho dự án du lịch, đổi DATABASE_URL trong .env của
   riêng nó, rồi chạy tao-bang-du-lich / nap-dia-diem / nap-lo-trinh.
   Chi tiết ghi trong phần chú thích đầu file này.
`)
process.exit(1)
