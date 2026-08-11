// Nén & thu nhỏ ảnh NGAY TRÊN TRÌNH DUYỆT trước khi tải lên.
// Ảnh điện thoại thường 3-8MB; sau khi thu về ~1400px + JPEG sẽ nhẹ dưới 2MB,
// nên tiểu thương cứ chọn ảnh gốc, không phải lo giới hạn dung lượng.
// Chỉ dùng ở client (cần DOM: Image, canvas).

function taiAnh(file) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = URL.createObjectURL(file)
    })
}

const doiTenJpg = (ten, hau = '') => (ten || 'anh').replace(/\.[^.]+$/, '') + hau + '.jpg'

// Vẽ ảnh đã tải sẵn ra canvas ở cỡ mong muốn -> File JPEG
async function veRaFile(img, { canhToiDa, chatLuong, ten }) {
    let w = img.naturalWidth, h = img.naturalHeight
    if (w > canhToiDa || h > canhToiDa) {
        const tyLe = Math.min(canhToiDa / w, canhToiDa / h)
        w = Math.round(w * tyLe)
        h = Math.round(h * tyLe)
    }
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(img, 0, 0, w, h)
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', chatLuong))
    return blob ? new File([blob], ten, { type: 'image/jpeg' }) : null
}

export async function nenAnh(file, { canhToiDa = 1400, chatLuong = 0.82 } = {}) {
    if (!file || !file.type?.startsWith('image/')) return file

    let img
    try { img = await taiAnh(file) } catch { return file }
    if (!img.naturalWidth || !img.naturalHeight) { URL.revokeObjectURL(img.src); return file }

    const ketQua = await veRaFile(img, { canhToiDa, chatLuong, ten: doiTenJpg(file.name) })
    URL.revokeObjectURL(img.src)
    if (!ketQua) return file

    // Nếu nén ra lại to hơn bản gốc (ảnh vốn đã nhỏ) thì giữ bản gốc
    return ketQua.size < file.size ? ketQua : file
}

// Nén ra HAI cỡ trong MỘT lần giải mã ảnh:
//   lon (1400px) — trang chi tiết & xem ảnh phóng to
//   nho (600px)  — thẻ sản phẩm trong lưới/dải
// Vì sao cần: thẻ sản phẩm chỉ rộng ~160px trên điện thoại nhưng trước đây vẫn tải
// nguyên ảnh 1400px — thừa gần 8 lần chiều ngang. Trang chợ ~15 thẻ (mỗi thẻ còn ảnh
// thứ 2 cho hiệu ứng rê chuột) nên khách đi 3G/4G phải tải vài MB chỉ để xem lướt.
//
// Vì sao 600 chứ không phải 400: trình duyệt chọn bản NHỎ NHẤT mà vẫn đủ nét, tính theo
// bề ngang khung NHÂN mật độ điểm ảnh màn hình. Máy Android phổ thông DPR 3, thẻ ~180px
// -> cần 540px; để bản nhỏ ở 400 thì nó bị loại và máy lại tải bản 1400 như cũ, tức tối
// ưu thành công cốc đúng trên nhóm máy cần nhất.
export async function nenNhieuCo(file, { coLon = 1400, coNho = 600 } = {}) {
    if (!file || !file.type?.startsWith('image/')) return { lon: file, nho: null }

    let img
    try { img = await taiAnh(file) } catch { return { lon: file, nho: null } }
    if (!img.naturalWidth || !img.naturalHeight) { URL.revokeObjectURL(img.src); return { lon: file, nho: null } }

    const lonMoi = await veRaFile(img, { canhToiDa: coLon, chatLuong: 0.82, ten: doiTenJpg(file.name) })
    // Bản nhỏ hạ chất lượng thêm chút: ở cỡ 400px mắt không thấy khác, mà nhẹ hơn nhiều
    const nhoMoi = await veRaFile(img, { canhToiDa: coNho, chatLuong: 0.72, ten: doiTenJpg(file.name, '-nho') })
    URL.revokeObjectURL(img.src)

    const lon = lonMoi && lonMoi.size < file.size ? lonMoi : file
    // Bản nhỏ chỉ dùng khi thật sự nhẹ hơn bản lớn (ảnh gốc vốn đã bé thì khỏi cần)
    const nho = nhoMoi && nhoMoi.size < lon.size ? nhoMoi : null
    return { lon, nho }
}
