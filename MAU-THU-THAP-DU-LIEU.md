# Thu thập dữ liệu địa điểm — ghi chú cho đội

> **Sheet hiện tại dùng được luôn, không phải sửa cấu trúc.** Trình nhập của app đã được
> viết theo đúng định dạng sheet đang có. Tài liệu này chỉ nói 3 điều cần lưu ý khi điền.

---

## App tự hiểu được những gì

Trình nhập đọc thẳng file CSV xuất từ sheet và tự nhận ra:

| Trong sheet | App hiểu thành |
|---|---|
| Dòng mục có emoji (`☕ 1. CAFE & ĐỒ UỐNG…`) | Loại hình cho toàn bộ dòng bên dưới — **không cần thêm cột "loại"** |
| Hàng tiêu đề cột lặp lại sau mỗi mục | Tự bỏ qua |
| `Giờ mở cửa` = `07:00 - 23:00` | Tách thành giờ mở / giờ đóng. Quán đêm cứ ghi `18:00 - 02:00` |
| `Mức giá tham khảo` = `35.000 - 70.000` | Tự xếp ₫ / ₫₫ / ₫₫₫ để lọc, **đồng thời giữ nguyên câu chữ** để hiển thị |
| `Mức giá` = `Miễn phí` | Xếp vào nhóm miễn phí |
| `Điểm nổi bật / Đánh giá` | Mô tả ngắn hiện trên thẻ |
| `Số điện thoại` | Nút gọi trực tiếp |
| `Link ảnh / Hình ảnh` | Ảnh bìa |
| Dòng mẫu `[Nhập thêm quán cafe...]` | Tự bỏ qua, không nhập vào app |
| `Ghi chú / Người đóng góp` | Bỏ qua — cột nội bộ của đội, cứ dùng thoải mái |

---

## ⚠️ 1. Việc quan trọng nhất: điền cột Link Google Map

Hiện **toàn bộ các dòng đang để trống cột `Địa chỉ chi tiết ( Link Google Map )`.**

Thiếu link này thì địa điểm:

- ❌ không hiện trên bản đồ
- ❌ không có trong "Gần tôi"
- ❌ không đưa vào lộ trình được
- ❌ không hiện ở mục "Gần đây còn gì hay?" của địa điểm khác

Tức là mất gần hết giá trị của app. **Địa điểm không toạ độ chỉ còn là một dòng chữ.**

### Cách lấy (30 giây mỗi địa điểm)

**Trên điện thoại:** mở Google Maps → tìm địa điểm → **Chia sẻ → Sao chép liên kết** → dán vào ô.

**Trên máy tính:** mở Google Maps → tìm địa điểm → link trên thanh địa chỉ đã chứa toạ độ
(đoạn `@20.9527,107.0731`) → chép cả link dán vào ô.

Cũng được nếu dán thẳng toạ độ: `20.9527, 107.0731`

> Ô này chứa cả địa chỉ chữ lẫn link đều được — app tự tách link ra khỏi câu chữ.

---

## 2. Mục 3 gộp nhiều loại — app đoán, người rà lại

Mục `🏛️ 3. DU LỊCH, THAM QUAN & MUA SẮM` gộp chùa, bảo tàng, núi, chợ, trung tâm thương mại
vào một chỗ. Du khách bấm một chip mà ra cả chùa lẫn Vincom thì chip đó vô dụng, nên app
**tự đoán loại chi tiết theo tên** rồi tô màu tím ở bảng xem trước để người nhập rà lại.

Kết quả đoán trên dữ liệu hiện tại:

| Tên | App đoán |
|---|---|
| Núi Bài Thơ | Ngắm cảnh ✅ |
| Nhà thờ Hòn Gai | Tâm linh ✅ |
| Chợ Hạ Long 1 | Mua sắm ✅ |
| Phố đi bộ Bài Thơ | Vui chơi ✅ |

Đoán sai thì **sửa ngay trong bảng xem trước** ở `/admin/nhap`, không cần sửa lại sheet.

---

## 3. "Ăn đêm" — đừng làm thành mục riêng

Ăn đêm là **giờ giấc**, không phải loại quán. Tách ra thành mục riêng thì quán bún mở
6h–2h sáng phải nằm hai chỗ, mà vẫn không trả lời được câu hỏi thật của khách:
*"bây giờ 23h, còn chỗ nào mở?"*

Chỉ cần điền đúng `Giờ mở cửa`, kể cả khi vắt qua nửa đêm (`18:00 - 02:00`).
App tự tính "Đang mở cửa" theo giờ thật và lọc ra được danh sách ăn đêm.

---

## Mẹo khi điền giá

Cột `Mức giá tham khảo` nên viết **khoảng giá hoặc câu chữ mềm**, đừng ghi một con số cứng:

| Nên | Đừng |
|---|---|
| `35.000 - 70.000` | `50.000` |
| `Miễn phí` | |
| `Tùy dịch vụ` | |
| `350.000 - 450.000/kg` | |

Lý do: quán đổi giá là chuyện thường. Khoảng giá và câu chữ mềm thì vẫn đúng, còn con số
cứng thì app hiện sai — khách đến bực, quán cũng bực.

---

## Nhập vào app

1. Trong Sheets: **Tệp → Tải xuống → Giá trị được phân tách bằng dấu phẩy (.csv)**
2. Vào `/admin/nhap`, chọn file (hoặc dán nội dung)
3. Xem bảng đối chiếu — đếm số thiếu toạ độ, rà lại các loại hình tô tím
4. Bấm nhập

Nhập lại cùng file **không nhân đôi**: trùng tên thì bỏ qua. Muốn cập nhật bản đã có thì
tích ô *"Ghi đè địa điểm đã có"*.
