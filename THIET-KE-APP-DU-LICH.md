# Thiết kế lại: từ "Chợ Số Hồng Gai" → App Du Lịch Hồng Gai

> Bản thiết kế chuyển hướng sản phẩm. Mục tiêu: giữ tối đa hạ tầng đã có
> (auth, DB, bản đồ, chat, đánh giá, đa ngữ, admin), đổi **trục trung tâm**
> từ *bán hàng* sang *khám phá địa điểm*.

---

## 1. Định vị sản phẩm mới

**Tên đề xuất:** Khám Phá Hồng Gai — *Hong Gai Discovery* — *探索鸿基*

| | |
|---|---|
| **Là gì** | Cẩm nang du lịch số cho phường Hồng Gai: đi đâu, ăn gì, chơi gì, lễ chùa ở đâu |
| **Cho ai** | Du khách trong nước · khách quốc tế (Trung/Anh) · chính người dân Hồng Gai |
| **Khác gì Google Maps** | Nội dung biên tập bằng 3 thứ tiếng, lộ trình gợi ý theo giờ, lễ hội địa phương, chủ cơ sở tự cập nhật menu/ưu đãi |
| **Nguyên tắc thiết kế** | *Không bán hàng — chỉ giúp khách quyết định đi đâu.* Mọi màn hình phải trả lời được "đi thế nào, giờ nào, giá bao nhiêu" trong 1 lần cuộn |

---

## 2. Đổi trục: Địa điểm là thực thể trung tâm

Hiện tại app có **ba** hệ thống mô tả "chỗ" chồng chéo nhau:

```
DIA_DIEM (hardcode, 12 mục)  ─── giàu nội dung, đa ngữ, có toạ độ  ── nhưng KHÔNG sửa được từ giao diện
quan_an  (DB, chủ quán đăng) ─── có menu, giờ mở cửa, chat, đặt món ── nhưng KHÔNG có bài giới thiệu
stores   (DB, tiểu thương)   ─── có sản phẩm, giỏ hàng, đơn         ── không liên quan du lịch
```

Thiết kế mới **gộp cả ba vào một model duy nhất: `dia_diem`**, phân biệt bằng trường `loai`.
Trang chi tiết là *một* trang, tự bật/tắt các khối theo loại.

### Danh mục địa điểm (`loai`)

| id | Tên | Màu | Khối riêng ở trang chi tiết |
|---|---|---|---|
| `an_uong` | Ăn uống | `#ea580c` | Món đặc trưng, buổi phục vụ, mức giá `₫₫` |
| `ca_phe` | Cà phê · Đồ uống | `#b45309` | Khung giờ đẹp, có view không, mức giá |
| `tam_linh` | Tâm linh | `#d97706` | Lễ hội trong năm, lưu ý trang phục, lễ nghi |
| `di_tich` | Di tích · Lịch sử | `#059669` | Niên đại, câu chuyện, hiện vật |
| `van_hoa` | Văn hoá · Bảo tàng | `#334155` | Giờ mở cửa, giá vé, khu trưng bày |
| `ngam_canh` | Ngắm cảnh · Thiên nhiên | `#0284c7` | Giờ đẹp nhất, góc chụp ảnh, mùa nào đẹp |
| `vui_choi` | Vui chơi · Giải trí | `#7c3aed` | Độ tuổi phù hợp, mức giá |
| `mua_sam` | Mua sắm · Đặc sản | `#c026d3` | Bán gì, quà mang về, mức giá |
| `luu_tru` | Lưu trú *(mới)* | `#0d9488` | Loại phòng, mức giá, tiện nghi |
| `dich_vu` | Dịch vụ du lịch *(mới)* | `#475569` | Tàu tham quan, thuê xe, hướng dẫn viên |

### Model `dia_diem` (bảng JSONB, giữ đúng kiểu tài liệu như hiện tại)

```js
{
  id: 'chua-long-tien',            // slug, dùng luôn làm URL
  loai: 'tam_linh',
  nhan: ['di_tich', 'mien_phi'],   // nhãn phụ để lọc chéo

  // NỘI DUNG ĐA NGỮ — giữ nguyên quy ước mảng [vi, en, zh] đang dùng ở lib/diaDiem.js
  ten:        ['Chùa Long Tiên', 'Long Tien Pagoda', '龙仙寺'],
  mota:       [...],               // 1–2 câu, hiện trên thẻ
  gioiThieu:  [[...], [...]],      // các đoạn bài viết
  diemNoiBat: [[...], [...]],      // gạch đầu dòng

  // THỰC TẾ
  viTri: [20.9527, 107.0731],
  diaChi: 'Phố Long Tiên, P. Hồng Gai',
  gioMoCua: '06:00', gioDongCua: '18:00',
  ngayNghi: [],                    // 0..6, rỗng = mở cả tuần

  // GIÁ — CHỈ HAI TRƯỜNG, KHÔNG CÓ BẢNG GIÁ CHI TIẾT (xem mục 6.1)
  mucGia: 'mien_phi',              // mien_phi | re | vua | cao  → dùng để LỌC, hiện ₫/₫₫/₫₫₫
  giaVe: [...],                    // CÂU CHỮ MỀM đa ngữ để HIỂN THỊ, không phải con số
                                   // vd 'Miễn phí (tùy tâm công đức)' / 'Tham khảo tại quầy'
  dienThoai, website, facebook,
  tienIch: ['bai_do_xe', 'wifi', 'phu_hop_gia_dinh', 'nhan_the'],

  // HÌNH ẢNH
  anhBia, anhs: [],                // Vercel Blob, thay cho cách quét public/dia-diem/ hiện tại
  mau: '#d97706', icon: '🏯',      // dự phòng khi chưa có ảnh

  // QUAN HỆ & QUẢN TRỊ
  lanCan: ['nui-bai-tho', ...],    // gợi ý thủ công; ngoài ra tự tính theo khoảng cách toạ độ
  nguon: 'bien_tap',               // bien_tap (BTV nhập) | chu_co_so (chủ đăng ký)
  userId: null,                    // có khi chủ cơ sở sở hữu
  status: 'da_duyet',              // cho_duyet | da_duyet | tu_choi
  noiBat: 0, luotXem: 0, diemTB: 4.6, soDanhGia: 23,
  createdAt
}
```

---

## 3. Bảng chuyển đổi tính năng cũ → mới

### GIỮ NGUYÊN — dùng lại gần như không sửa

| Đang có | Vai trò mới |
|---|---|
| `lib/i18n` (vi/en/zh) | **Quan trọng hơn bao giờ hết** — app du lịch bắt buộc đa ngữ |
| `BanDoLeaflet` + `BanDoSo` | Trở thành **trái tim app**, không còn là một khối phụ ở trang chủ |
| Đăng nhập / đăng ký / quên mật khẩu / phiên JWT (`jose`) | Y nguyên |
| `ratings` + `Rating` + `RatingModal` | Đánh giá cho **mọi** địa điểm (hiện chỉ có sản phẩm + địa điểm) |
| Chat Pusher (`hoi_thoai`, `tin_nhan`, `HopChat`, `BongBongChat`) | Khách ↔ chủ cơ sở: hỏi giờ mở cửa, đặt bàn |
| Web Push (`push_dang_ky`, `NutBatThongBao`) | Báo **lễ hội sắp diễn ra**, ưu đãi mới, sự kiện cuối tuần |
| Vercel Blob upload ảnh | Ảnh địa điểm + ảnh trong đánh giá của du khách |
| Admin layout, duyệt, sắp xếp, thống kê `recharts` | Duyệt địa điểm, sắp xếp nổi bật, thống kê lượt xem |
| `HienKhiCuon`, `HoaTietSong`, `CanhVinhHaLong`, `Skeleton`, `TrangRong`, `XemAnh` | Y nguyên — bộ nhận diện biển đảo rất hợp du lịch |

### ĐỔI VAI — cùng cơ chế, đổi ý nghĩa

| Cũ | Mới |
|---|---|
| Gian hàng (`stores`) + luồng đăng ký/duyệt | **Địa điểm do chủ cơ sở đăng ký** — quán ăn, cafe, homestay, khu vui chơi. Dùng lại y hệt luồng `create-store` → admin duyệt → khu quản lý |
| Sản phẩm (`products`) / Món ăn (`mon_an`) | **Bỏ.** Thay bằng `mucGia` + `giaVe` ngay trên địa điểm, và ảnh chụp tờ menu trong thư viện ảnh — xem mục 6.1 |
| Coupon (`coupons`) | **Ưu đãi** (`uu_dai`) — chủ cơ sở tự đăng, khách xem & xuất trình mã tại chỗ, có hạn dùng |
| Tích điểm (`tich-diem`) | **Hộ chiếu Hồng Gai** — check-in tại địa điểm (xác thực bằng toạ độ) → đóng dấu, sưu tầm huy hiệu |
| Đơn của tôi (`orders`, `don-do-an`) | **Hành trình của tôi** — địa điểm đã lưu, đã đi, lịch trình tự tạo |
| `dia_diem_gian` / `dia_diem_quan` (admin gắn tay) | **Bỏ** — thay bằng "gần đây" tự tính từ toạ độ (Haversine) + `lanCan` biên tập |
| `lib/doAn.js` (BUỔI + NHÓM món) | Giữ nguyên, thành bộ lọc của danh mục `an_uong` |
| Sản phẩm nổi bật / Gian hàng nổi bật ở trang chủ | **Điểm đến nổi bật / Quán ngon tuần này** |

### BỎ (đã chốt)

App **thuần giới thiệu, không bán hàng**. Gỡ toàn bộ:

Giỏ hàng · thanh toán · vận chuyển · đơn hàng (`orders`, `don_do_an`) · trả đơn (`tra-don`) ·
`lib/trangThaiDon.js` · Redux `cartSlice` (bỏ luôn `@reduxjs/toolkit` + `react-redux` nếu không
còn chỗ dùng) · đối tác Green SM · Newsletter bán hàng · `MuaKemCungGian` · `DaiSanPham` ·
`TheDonHang` · `ThongBaoDon` · `Counter`.

**Đặt bàn / giữ chỗ: không làm luồng riêng.** Trang địa điểm chỉ có `[📞 Gọi]` (link `tel:`) và
`[💬 Nhắn tin]` — tái dùng nguyên chat Pusher đã chạy được. Đủ dùng cho quán nhỏ ở Hồng Gai và
tiết kiệm hẳn một bảng + một khu quản lý.

### THÊM MỚI — thuần du lịch

| Tính năng | Vì sao cần |
|---|---|
| **Lộ trình gợi ý** (`lo_trinh`) | "Hồng Gai 1 ngày", "Nửa ngày tâm linh", "Ăn sáng ngon Hồng Gai" — chuỗi địa điểm có thứ tự + thời lượng + bản đồ nối tuyến. Đây là thứ khách du lịch cần nhất mà Google Maps không có |
| **Sự kiện & Lễ hội** (`su_kien`) | Lễ hội đền Đức Ông 29–30/4, hội chùa Long Tiên 24/3 âm lịch… có lịch, đếm ngược, đẩy thông báo |
| **Bộ sưu tập theo chủ đề** (`bo_suu_tap`) | "Cà phê view vịnh", "Ăn hải sản ở đâu", "Check-in hoàng hôn" — dễ chia sẻ, tốt cho SEO |
| **Gần tôi** | Geolocation + toạ độ sẵn có → sắp xếp theo khoảng cách thực |
| **Lưu & Lịch trình cá nhân** | Ghim địa điểm → tự dựng thành lịch trình theo ngày |
| **Cẩm nang thực dụng** | Đi lại (taxi/bus/tàu), ATM, y tế, số khẩn cấp, thời tiết, lưu ý văn hoá khi vào chùa |
| **Đánh giá có ảnh** | Ảnh du khách chụp là nội dung sống động nhất của app du lịch |
| **Chia sẻ + mã QR địa điểm** | Dán QR tại điểm tham quan → quét ra bài giới thiệu 3 thứ tiếng. Rất hợp với đề tài "phường số hoá" |

---

## 4. Kiến trúc thông tin (routes)

```
/                          Trang chủ
/kham-pha                  Khám phá — bản đồ + lưới + bộ lọc  (đang có, nâng cấp)
/kham-pha?loai=an_uong     Ăn uống          ← thay /do-an
/kham-pha?loai=vui_choi    Vui chơi
/kham-pha?loai=tam_linh    Tâm linh
/dia-diem/[id]             Chi tiết địa điểm  (đang có, mở rộng)
/ban-do                    Bản đồ toàn màn hình + lọc + gần tôi     ★ mới
/lo-trinh                  Lộ trình gợi ý                            ★ mới
/lo-trinh/[id]             Chi tiết lộ trình (timeline + bản đồ)     ★ mới
/su-kien                   Sự kiện & lễ hội                          ★ mới
/bo-suu-tap/[slug]         Bộ sưu tập chủ đề                         ★ mới
/hanh-trinh                Hành trình của tôi: đã lưu · đã đi · huy hiệu   ★ mới
/cam-nang                  Cẩm nang thực dụng                        ★ mới
/tim-kiem                  Tìm kiếm toàn app
/tai-khoan                 Tài khoản              (đang có)
/tin-nhan, /tin-nhan/[id]  Nhắn tin chủ cơ sở     (đang có)
/dang-ky-dia-diem          Chủ cơ sở đăng ký      ← thay /create-store + /create-quan-an
/quan-ly                   Khu chủ cơ sở          ← thay /store/* + /quan-an/*
  /quan-ly/thong-tin         thông tin, giờ, toạ độ, mức giá, ảnh (kể cả ảnh tờ menu)
  /quan-ly/uu-dai            ưu đãi đang chạy
  /quan-ly/danh-gia          đánh giá & trả lời
  /quan-ly/tin-nhan          chat với khách
/admin                     Quản trị               (đang có)
  /admin/dia-diem            CRUD địa điểm — thay cho việc sửa tay lib/diaDiem.js   ★ quan trọng
  /admin/duyet               duyệt địa điểm chủ cơ sở gửi lên
  /admin/lo-trinh            biên tập lộ trình
  /admin/su-kien             biên tập sự kiện
  /admin/noi-bat             sắp xếp nổi bật trang chủ
  /admin/thong-ke            lượt xem, đánh giá, check-in
```

### Điều hướng: HAI TẦNG, không trộn vào nhau

Nguyên tắc: **thanh dưới là ĐIỀU HƯỚNG, chip loại hình là BỘ LỌC.** Trộn hai thứ vào một
chỗ thì khách bấm xong không biết mình đang ở đâu, và 10 loại hình cũng không nhét vừa 5 ô.

**Tầng 1 — thanh dưới (mobile), 5 tab, nút bản đồ nổi giữa:**

```
 Trang chủ    Khám phá    ( 🗺 Bản đồ )    Lộ trình    Đã lưu
   Home        Compass      nút tròn nổi     Route      Bookmark
  #0d9488      #0284c7        #0369a1       #7c3aed     #e11d48
```

Không có tab "Tài khoản" — xem mục 7 (guest-first).
Giữ đúng cơ chế `BottomNav.jsx` hiện tại (pill đặc màu + icon trắng khi active), chỉ đổi
tab và cho tab giữa nhô lên.

**Tầng 2 — thanh chip loại hình (dính dưới header, cuộn ngang):**

```
[Tất cả] [🍜 Ăn uống] [☕ Cà phê] [🏯 Tâm linh] [⛰️ Ngắm cảnh] [🎡 Vui chơi] [🛍️ Mua sắm] ...
```

- Có mặt ở **Trang chủ · Khám phá · Bản đồ**.
- Bấm → lọc **tại chỗ**, đổi `?loai=an_uong`, KHÔNG nhảy trang.
- Dùng lại bộ icon `/thuong-hieu/tile-*.webp` sẵn có.
- `scroll-snap-type: x proximity` + `overscroll-behavior-x: contain` — dừng đúng chip,
  không kéo lây cả trang.

Menu trên (`Navbar`) bỏ giỏ hàng, thêm ô tìm kiếm to + nút đổi ngôn ngữ nổi bật,
nút "Đăng nhập" để nhỏ ở góc.

---

## 5. Thiết kế các màn hình chính

### 5.1 Trang chủ

```
┌────────────────────────────────────────────┐
│ HERO: ảnh vịnh/núi Bài Thơ toàn khung      │
│  "Khám phá Hồng Gai"                       │
│  [ 🔍 Tìm địa điểm, món ăn, lễ hội... ]    │
│  chip: Ăn uống · Tâm linh · Ngắm cảnh...   │
└────────────────────────────────────────────┘
   ↓  (giữ hoạ tiết sóng SongNgan đang có)
┌ Hôm nay ở Hồng Gai ─────────────────────────┐
│ thời tiết · đang mở cửa · sự kiện gần nhất  │
└─────────────────────────────────────────────┘
┌ Bản đồ số ──────────────────────────────────┐
│ BanDoSo hiện tại — thêm nút "Xem toàn màn"  │
└─────────────────────────────────────────────┘
┌ Đi đâu hôm nay? ────────────────────────────┐
│ 3 thẻ lộ trình lớn: 1 ngày · nửa ngày tâm   │
│ linh · food tour buổi tối                   │
└─────────────────────────────────────────────┘
┌ Ăn gì ở Hồng Gai ───────────────────────────┐
│ cuộn ngang các quán — chip buổi (sáng/trưa/ │
│ tối/ăn vặt/ăn đêm) tái dùng lib/doAn.js     │
└─────────────────────────────────────────────┘
┌ Điểm đến nổi bật ── ┐  ┌ Lễ hội sắp tới ──┐
│ lưới thẻ địa điểm   │  │ đếm ngược ngày   │
└─────────────────────┘  └──────────────────┘
┌ Bộ sưu tập chủ đề ──────────────────────────┐
│ Cà phê view vịnh · Hải sản ngon · Hoàng hôn │
└─────────────────────────────────────────────┘
```

Bỏ hẳn thanh nhảy nhanh "Chợ Tươi / Quà QN / Bản Đồ Số" hiện tại.

### 5.2 Khám phá `/kham-pha`

- Trên cùng: **bản đồ thu gọn** (bấm → toàn màn hình).
- **Thanh lọc dính** (sticky): danh mục · khoảng giá · đang mở cửa · có bãi đỗ xe · đánh giá ≥ 4★ · khoảng cách từ tôi.
- **Sắp xếp**: gần tôi · đánh giá cao · nổi bật · mới cập nhật.
- Lưới thẻ địa điểm — tái dùng gần nguyên thẻ ở `/kham-pha` hiện tại, thêm: ⭐ điểm, khoảng cách, badge "Đang mở cửa".

### 5.3 Chi tiết địa điểm `/dia-diem/[id]` (nâng cấp trang đang có)

```
Ảnh bìa lớn + thư viện ảnh
Tên · danh mục · ⭐4.6 (23) · Đang mở cửa · ₫₫ · 1,2 km từ bạn
[Chỉ đường] [Lưu] [Chia sẻ] [Check-in]      ← thanh hành động dính
─────────────────────────────────────────────
Giới thiệu  |  Điểm nổi bật                  ← ĐÃ CÓ, giữ nguyên
Thông tin tham quan (giờ, vé, đi lại)        ← ĐÃ CÓ
★ Ưu đãi đang có           (nếu có)
★ Lễ hội / sự kiện tại đây (nếu loai = tâm linh, di tích)
★ Nằm trong lộ trình        "Điểm thứ 2 của: Hồng Gai nửa ngày tâm linh"
Hình ảnh (thư viện + ảnh du khách)           ← ĐÃ CÓ, mở rộng
★ Bản đồ nhỏ + các điểm quanh đây < 1 km     (tự tính, thay dia_diem_gian)
Gần đó còn gì hay?                           ← ĐÃ CÓ
Du khách nói gì (đánh giá + ảnh)             ← ĐÃ CÓ, thêm ảnh
[📞 Gọi] [💬 Nhắn tin chủ cơ sở]              (nếu là cơ sở kinh doanh)
```

### 5.4 Bản đồ toàn màn hình `/ban-do` ★ mới

Leaflet full-screen · ghim theo màu danh mục · lọc nổi phía trên · nút "về vị trí tôi" ·
bấm ghim → thẻ trượt lên từ đáy (ảnh, tên, ⭐, khoảng cách, nút Chỉ đường / Xem chi tiết).

### 5.5 Lộ trình `/lo-trinh/[id]` ★ mới

Timeline dọc: **08:00 Chùa Long Tiên (45′)** → *đi bộ 5′* → **09:00 Núi Bài Thơ (90′)** → …
Bên cạnh là bản đồ nối tuyến. Nút "Dùng lộ trình này" → sao vào Hành trình của tôi để sửa.

### 5.6 Hành trình của tôi `/hanh-trinh` ★ mới

3 tab: **Đã lưu** · **Lịch trình** (kéo thả sắp xếp theo ngày) · **Hộ chiếu** (dấu check-in + huy hiệu:
"Người hành hương" – đủ 4 điểm tâm linh, "Thổ địa ẩm thực" – 10 quán, "Chinh phục Bài Thơ"…).

Tất cả chạy trên `localStorage`, **không cần đăng nhập**.

### 5.7 Chiến lược bản đồ — một component dùng chung

Gom về **một** `<BanDo>` nhận `diem` / `chon` / `onChon` / `cheDo`, thay cho việc mỗi trang
một bản như hiện nay. Leaflet đã lazy sẵn (`import('leaflet')` trong `useEffect`) — giữ nguyên
cách đó, và chỉ mount khi cuộn tới (tái dùng `HienKhiCuon`).

| Trang | Kiểu bản đồ |
|---|---|
| Trang chủ | khối gọn, xem trước → bấm mở toàn màn hình |
| `/ban-do` | toàn màn hình + thẻ trượt lên từ đáy khi bấm ghim |
| `/kham-pha` | **nút chuyển Danh sách ⇄ Bản đồ** — KHÔNG xếp chồng |
| `/dia-diem/[id]` | map nhỏ: 1 ghim + các điểm < 1 km (tự tính Haversine) |
| `/lo-trinh/[id]` | map có đường nối tuyến (polyline) theo thứ tự điểm |
| `/su-kien` | chỉ khi sự kiện có toạ độ |
| `/cam-nang`, `/hanh-trinh` | không cần |

> **Vì sao Khám phá phải là toggle:** trên điện thoại, map + danh sách xếp chồng nghĩa là
> khách phải cuộn hết map mới thấy danh sách — mất trọn màn hình đầu, đúng chỗ quý nhất.

---

## 6. Thay đổi cơ sở dữ liệu

```sql
-- ĐÃ TẠO
dia_diem      (id TEXT PK, data JSONB)   -- + idx loai, status, userId
lo_trinh      (id TEXT PK, data JSONB)   -- + idx kieu, status
                                         --   kieu = 'lo_trinh' | 'bo_suu_tap'
                                         --   -> KHÔNG cần bảng bo_suu_tap riêng: hai thứ
                                         --      cùng hình dạng (danh sách địa điểm có thứ tự)
su_kien       (id TEXT PK, data JSONB)   -- + idx status, diaDiemId

-- CÒN LẠI (giai đoạn sau)
uu_dai        (id TEXT PK, data JSONB)   -- + idx diaDiemId    ← từ coupons
check_in      (id TEXT PK, data JSONB)   -- + idx userId, diaDiemId

-- KHÔNG cần bảng: địa điểm đã lưu + lịch trình cá nhân chạy trên localStorage (mục 7)

-- GIỮ
users · ratings (thêm diaDiemId + anhs) · hoi_thoai · tin_nhan · push_dang_ky

-- XOÁ (đã chốt: làm sạch, không chuyển đổi)
stores · products · orders · coupons · quan_an · mon_an · don_do_an
dia_diem_gian · dia_diem_quan
```

**Khởi tạo dữ liệu** (đã chốt: *làm sạch, bắt đầu lại*):

- `scripts/tao-bang.mjs` — viết lại chỉ với bộ bảng mới ở trên.
- `scripts/nap-dia-diem.mjs` — nạp 12 mục trong `lib/diaDiem.js` vào bảng `dia_diem`
  (`nguon: 'bien_tap'`, `status: 'da_duyet'`), ánh xạ trường `loai` chữ hiện tại
  ("Di tích" → `di_tich`, "Tâm linh" → `tam_linh`, "Mua sắm" → `mua_sam`,
  "Văn hóa" → `van_hoa`, "Ngắm cảnh"/"Kỳ quan" → `ngam_canh`).
- `scripts/xoa-bang-cu.mjs` — `DROP TABLE` các bảng thương mại. **Chạy sau cùng**, khi
  giao diện mới đã ổn, để còn đường lùi.
- Tài khoản (`users`) giữ nguyên — không ai phải đăng ký lại.

Sau bước nạp, **admin sửa địa điểm ngay trên web** thay vì sửa tay file `lib/diaDiem.js` — đây là
nút thắt lớn nhất của bản hiện tại. File `lib/diaDiem.js` từ đó chỉ còn vai trò *dữ liệu mồi*.

### 6.1 Giá: BỎ bảng giá chi tiết, GIỮ khoảng giá *(đã chốt)*

Không có bảng `muc_gia`, không có thực đơn từng món, không có giá từng phòng.

**Vì sao bỏ bảng giá chi tiết:**

1. **Hỏng nhanh nhất trong app.** Quán tăng giá, app vẫn hiện giá cũ → khách đến bực,
   quán cũng bực. App du lịch mà sai giá thì mất uy tín ngay.
2. **Không ai cập nhật.** Giai đoạn đầu chưa có chủ quán nào tham gia, mà biên tập viên
   không thể đi cập nhật giá từng món của hàng chục quán.
3. Bỏ nó là bỏ luôn một bảng, một khu quản lý, và chỗ đến của `products` / `mon_an`.

**Vì sao vẫn phải giữ khoảng giá:** "bao nhiêu tiền" là một trong ba câu hỏi lớn nhất của
khách — *đi thế nào, giờ nào, giá bao nhiêu*. Với chùa / bảo tàng / vịnh thì giá vé là
thông tin cốt lõi.

**Hai trường thay cho cả một bảng:**

| Trường | Kiểu | Dùng để | Ví dụ |
|---|---|---|---|
| `mucGia` | enum | **LỌC** + hiện ký hiệu | `mien_phi` · `re` ₫ (<50k) · `vua` ₫₫ (50–150k) · `cao` ₫₫₫ (>150k) |
| `giaVe` | `[vi, en, zh]` | **HIỂN THỊ** | "Miễn phí (tùy tâm công đức)" · "Tham khảo tại quầy (trẻ em được giảm)" |

> **`lib/diaDiem.js` hiện tại đã làm đúng cách này rồi.** Trường `thongTin.giaVe` đang được
> viết bằng **câu chữ mềm 3 thứ tiếng** chứ không phải con số — "Miễn phí (tùy tâm công đức)",
> "Vé tham quan theo tuyến (tuyến 1, 2, 3...) — tham khảo tại bến tàu". Cách viết này
> **không bao giờ sai**, vẫn trả lời đúng câu hỏi của khách, và tốn 0 công bảo trì.
> Đây là mẫu để nhân rộng cho cả quán ăn, chứ không phải chỗ cần "nâng cấp" thành bảng giá.

**Ai muốn xem menu chi tiết?** Chủ quán **chụp tờ menu tải lên thư viện ảnh**. Không phải dữ
liệu có cấu trúc, không phải cam kết giá, khách vẫn xem được — công bảo trì bằng không.

---

## 7. Tài khoản: GUEST-FIRST — giữ auth nhưng giấu đi

**Không bỏ hệ thống tài khoản, nhưng du khách gần như không bao giờ gặp nó.**

Lý do không bỏ: có đúng 3 việc bắt buộc cần danh tính, và **không việc nào là của du khách** —
(1) admin/biên tập sửa nội dung trên web, (2) chủ cơ sở tự cập nhật quán, (3) đánh giá (không
có danh tính thì thành bãi spam). Gỡ auth đồng nghĩa mất luôn (1), tức là quay về sửa tay
`lib/diaDiem.js` rồi deploy — đúng cái nút thắt đang muốn gỡ.

**Quy tắc guest-first:**

- **Không có tường đăng nhập ở bất kỳ đâu.** Toàn bộ nội dung du lịch xem được ngay.
- **Không có tab "Tài khoản"** ở thanh dưới. Nút "Đăng nhập" để nhỏ ở góc Navbar.
- **Lưu địa điểm + lịch trình + đã xem → `localStorage`, KHÔNG cần tài khoản.**
  Khách mở web giữa đường bằng điện thoại mà bắt đăng ký là mất khách ngay.
  Tái dùng cách làm sẵn có ở `lib/utils/gioHang.js` và `BanVuaXem`.
- Hộp đăng nhập chỉ bật lên **đúng lúc** bấm "Viết đánh giá" hoặc "Nhắn tin chủ quán",
  kèm câu giải thích tại sao cần.
- Đã đăng nhập thì dữ liệu `localStorage` được **đồng bộ lên tài khoản** (để đổi máy vẫn còn).

| Vai trò | Làm được gì |
|---|---|
| **Khách vãng lai** (không đăng nhập) | Xem tất cả · bản đồ · lọc · lộ trình · **lưu địa điểm** · **tạo lịch trình** · check-in. Đây là 95% người dùng |
| **Du khách** (đăng nhập) | Thêm: đánh giá + đăng ảnh · nhắn tin chủ quán · đồng bộ dữ liệu đa thiết bị · nhận thông báo lễ hội |
| **Chủ cơ sở** | Đăng ký địa điểm → chờ duyệt → quản lý thông tin/bảng giá/ảnh/ưu đãi, trả lời đánh giá & tin nhắn |
| **Biên tập viên** *(vai trò mới, tách từ admin)* | Viết bài địa điểm 3 thứ tiếng, dựng lộ trình, đăng sự kiện — **không** đụng tài khoản/hệ thống |
| **Quản trị** | Duyệt địa điểm, phân quyền, sắp xếp nổi bật, xem thống kê |

---

## 8. Quyết định đã chốt

| Câu hỏi | Chốt |
|---|---|
| Còn bán hàng không? | **Bỏ hẳn.** App thuần giới thiệu du lịch |
| Đặt bàn / giữ chỗ? | **Không làm luồng riêng** — chỉ nút Gọi (`tel:`) + nhắn tin qua chat có sẵn |
| Dữ liệu cũ? | **Làm sạch, bắt đầu lại** — chỉ nạp 11 địa điểm biên tập; giữ lại `users` |
| Bảng giá / thực đơn? | **Bỏ.** Chỉ giữ `mucGia` (₫/₫₫/₫₫₫, để lọc) + `giaVe` (câu chữ mềm đa ngữ). Xem mục 6.1 |
| Tài khoản? | **Giữ auth nhưng guest-first** — không tường đăng nhập, lưu/lịch trình chạy localStorage. Xem mục 7 |
| Loại hình ở thanh dưới? | **Không** — thanh dưới là điều hướng, loại hình là chip lọc dính dưới header. Xem mục 4 |

---

## 9. Lộ trình triển khai

| Giai đoạn | Nội dung | Kết quả nhìn thấy |
|---|---|---|
| ~~**1. Nền**~~ ✅ | Bảng `dia_diem`, script nạp 11 địa điểm, API CRUD, trang `/admin/dia-diem` | Sửa được địa điểm trên web, không cần đụng code |
| ~~**2. Trục du lịch**~~ ✅ | Trang chủ mới · `/kham-pha` có bộ lọc + toggle Danh sách/Bản đồ · `/dia-diem/[id]` đọc từ CSDL · `/ban-do` toàn màn hình · `/luu` · BottomNav 5 tab · `<TheDiaDiem>` + `<BanDo>` + `<ChipLoaiHinh>` dùng chung | App đã "ra dáng" du lịch |
| ~~**3. Dọn dẹp thương mại**~~ ✅ | Gỡ giỏ hàng, đơn hàng, Redux, `/shop` `/cart` `/orders` `/product` `/store/*` `/quan-an/*` `/do-an/*` `/gian/*` `/tra-don` + API và bảng liên quan; đổi thương hiệu sang "Khám Phá Hồng Gai" | Codebase sạch, hết code chết |
| ~~**4. Chiều sâu**~~ ✅ | Lộ trình (timeline + bản đồ nối tuyến) · Bộ sưu tập · Sự kiện & lễ hội (đếm ngược, có xử lý âm lịch) · Gần tôi · đánh giá kèm ảnh | Nội dung khác biệt so với Google Maps |
| **5. Cá nhân hoá** | Lưu · Lịch trình của tôi · Check-in & huy hiệu · thông báo lễ hội | Lý do để khách quay lại |
| **6. Chủ cơ sở** | Đăng ký địa điểm · khu `/quan-ly` · ưu đãi | Nội dung tự cập nhật, không phải BTV làm hết |
| **7. Thương hiệu** | Đổi tên, logo, favicon, ảnh mở đầu, README | Sản phẩm mới hoàn chỉnh |

> Giai đoạn 3 đẩy lên sớm (thay vì để cuối) vì đã chốt bỏ hẳn bán hàng — dọn sạch trước
> giúp các giai đoạn sau không phải né code chết.

---

## 10. Những gì dùng lại được nguyên vẹn

`BanDoLeaflet` · `BanDoSo` · `AnhDiaDiem` · `BiaDiaDiem` · `Anh` · `AnhDaiDien` · `XemAnh` ·
`Rating` · `RatingModal` · `HopChat` · `BongBongChat` · `NutBatThongBao` · `DoiNgonNgu` ·
`NutGiaoDien` · `OTimKiem` · `HienKhiCuon` · `HoaTietSong` · `CanhVinhHaLong` · `KhungTrang` ·
`PageTitle` · `LenDauTrang` · `Loading` · `Skeleton` · `TrangRong` · `BanVuaXem` · `Footer` ·
toàn bộ `components/admin/*` · `lib/i18n` · `lib/server/{phien,quyen,luuAnh,pusher,pushDb,guiEmail}.js`

Ước lượng: **~70% hạ tầng và ~40% giao diện giữ lại được.** Phần viết mới chủ yếu là
lộ trình, sự kiện, bản đồ toàn màn hình và trang quản trị nội dung.

---

## 11. Kỹ thuật giao diện cho thẻ & danh sách địa điểm

Nền tảng sẵn có: **Next 15.5 · React 19.2 · Tailwind 4.1 · Leaflet 1.9**.
`globals.css` đã dùng `@theme`, `@custom-variant dark`, `color-mix()` — đủ mới để dùng thẳng
những thứ dưới đây. Xếp theo tỉ lệ *đẹp / công sức*:

| Kỹ thuật | Được gì | Ghi chú |
|---|---|---|
| **View Transitions API** | Bấm thẻ → ảnh bìa "bay" thành ảnh bìa trang chi tiết. Thứ tạo cảm giác app native rõ nhất | `experimental.viewTransition` trong `next.config.mjs`; đặt `view-transition-name` theo `dia-diem-{id}` |
| **Scroll-driven animation** `animation-timeline: view()` | Thẻ tự fade + trượt lên khi cuộn vào | **Thay hẳn `HienKhiCuon`** — bỏ được JS IntersectionObserver, chạy trên compositor nên mượt hơn |
| **Container queries** `@container` | Cùng một `<TheDiaDiem>` dùng được ở lưới 3 cột, dải cuộn ngang, bottom sheet — tự đổi layout theo **khung chứa** | Tailwind 4 có sẵn `@container` / `@sm:` — bỏ được prop `size`/`variant` |
| **Scroll snap** + `overscroll-behavior: contain` | Dải cuộn ngang dừng đúng thẻ, không kéo lây trang | Cho chip loại hình + dải "Ăn gì hôm nay" |
| **`content-visibility: auto`** | Danh sách 100+ địa điểm vẫn cuộn mượt | Kèm `contain-intrinsic-size` để thanh cuộn không nhảy |
| **`<dialog>` + Popover API** | Bottom sheet khi bấm ghim, dropdown bộ lọc | Có sẵn khoá focus + phím Esc + lớp phủ — không cần thư viện |
| **`useOptimistic`** (React 19) | Bấm tim "Lưu" đổi ngay, không chờ mạng | |
| **`text-wrap: balance` / `pretty`** | Tiêu đề thẻ hết cảnh rơi 1 chữ xuống dòng | |
| **`color-mix()` mở rộng** | Thẻ tự sinh nền/viền/chữ từ `--mau` danh mục | Dọn được hardcode `${d.mau}1a`, `${d.mau}24`, `${d.mau}66` rải khắp code hiện tại |

**Thoái lui an toàn:** View Transitions còn là cờ experimental trong Next, và scroll-driven
animation chưa phủ hết trình duyệt. Cả hai đều degrade sạch — trình duyệt không hỗ trợ thì thẻ
vẫn hiện và bấm được bình thường, chỉ mất hiệu ứng. Không chặn ai cả, nên cứ dùng.

**Một component thẻ duy nhất** — `<TheDiaDiem>` thay cho `TheSanPham` / `TheGianHang` /
thẻ inline ở `/kham-pha` hiện tại. Nhờ container query nên một bản dùng cho mọi ngữ cảnh.
