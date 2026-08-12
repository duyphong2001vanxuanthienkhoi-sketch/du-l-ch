// MÀU THƯƠNG HIỆU — một nguồn sự thật cho toàn app du lịch.
//
// Bảng màu này đã có sẵn trong app/globals.css (@theme) từ trước, dựng theo chính
// vùng đất Hồng Gai. Nhưng code du lịch trước đó không dùng dòng nào — thay vào đó
// hardcode màu mặc định của Tailwind rải khắp nơi (#0284c7 sky ở 13 chỗ, #7c3aed
// violet ở 13 chỗ...). Đó là lý do giao diện "đẹp mà nhạt": nó không mang màu của
// nơi nó nói về.
//
// Mọi chỗ cần màu CHUNG của app phải lấy từ đây. Riêng màu của TỪNG DANH MỤC địa điểm
// vẫn nằm ở LOAI_DIA_DIEM (lib/diaDiemLoai.js) — chúng khác nhau là có chủ đích,
// giúp phân biệt chùa với quán ăn ngay từ màu badge.

export const MAU = {
    // Ngọc — sóng biển. Màu CHỦ ĐẠO: nút chính, link, tab đang chọn, nhấn của khu nội dung.
    ngoc: '#00A8A8',
    ngocDam: '#008F8F',
    ngocNhat: '#E9F7F7',

    // Hải — núi đá. Dùng cho nền sâu: đầu trang, nút bản đồ, chữ đậm.
    hai: '#14486E',
    haiDam: '#0B2F4F',
    haiSau: '#08243C',

    // Vàng đồng — mái ngói. Điểm nhấn: lộ trình, huy hiệu, nhãn nổi bật.
    vang: '#D6B15A',
    vangDam: '#B8923F',
    vangNhat: '#F7EED9',

    // Trung tính
    xam: '#94a3b8',      // slate-400 — biểu tượng chưa chọn
    xamDam: '#475569',   // slate-600
}

// Nền đầu trang — dải navy núi đá, dùng khi chưa có ảnh hoặc làm lớp phủ trên ảnh.
export const NEN_DAU_TRANG = `linear-gradient(135deg, ${MAU.hai}, ${MAU.haiSau})`

// Lớp phủ trên ảnh đầu trang: nhạt ở trên cho ảnh "thở", đậm dần xuống đáy nơi đặt chữ.
// Dùng đúng tông navy của thương hiệu thay vì đen trung tính — ảnh vẫn giữ được sắc biển.
export const PHU_ANH_DAU_TRANG =
    'linear-gradient(180deg, rgba(11,47,79,.42) 0%, rgba(11,47,79,.58) 45%, rgba(8,36,60,.90) 100%)'
