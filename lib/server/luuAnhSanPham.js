// Đọc danh sách ảnh sản phẩm từ form — dùng chung cho API tạo & sửa.
// Form gửi lên:
//   thuTu:     JSON mảng, mỗi phần tử là 'cu:<đường-dẫn>' (giữ ảnh cũ) hoặc 'moi' (ảnh mới)
//   anhMoi:    các file ảnh mới (bản 1400px), theo đúng thứ tự các 'moi' trong thuTu
//   anhMoiNho: bản 400px TƯƠNG ỨNG từng ảnh mới (có thể thiếu — form cũ không gửi)
// Trả về { anhs, anhNho } (hai mảng CÙNG THỨ TỰ, cùng độ dài) hoặc { loi }.
//
// anhNho[i] có thể bằng chính anhs[i]: sản phẩm đăng từ trước khi có bản nhỏ, hoặc ảnh
// gốc vốn đã bé. Nhờ vậy phía hiển thị luôn có đủ hai mảng, không phải kiểm tra rỗng.
import { luuAnhUpload } from './luuAnh'

const TOI_DA = 6

export async function docAnhSanPham(form, spCu = null) {
    let thuTu
    try {
        thuTu = JSON.parse(form.get('thuTu') || '[]')
    } catch {
        return { loi: 'Danh sách ảnh không hợp lệ' }
    }
    if (!Array.isArray(thuTu)) return { loi: 'Danh sách ảnh không hợp lệ' }

    const fileMoi = form.getAll('anhMoi').filter(f => f && typeof f !== 'string')
    // KHÔNG lọc: mỗi ảnh mới luôn có đúng một ô ở đây, ảnh nào không có bản nhỏ thì ô đó
    // là chữ 'khong'. Lọc bỏ sẽ làm lệch chỉ số, ảnh này ăn nhầm bản nhỏ của ảnh khác.
    const fileMoiNho = form.getAll('anhMoiNho')

    // Chỉ cho giữ lại ảnh vốn thuộc về sản phẩm này (tránh chèn đường dẫn lạ)
    const anhCuDs = spCu ? (spCu.anhs?.length ? spCu.anhs : (spCu.anh ? [spCu.anh] : [])) : []
    const anhNhoCuDs = spCu?.anhNho?.length ? spCu.anhNho : []
    const anhCu = new Set(anhCuDs)

    const anhs = []
    const anhNho = []
    let iMoi = 0
    for (const muc of thuTu) {
        if (typeof muc === 'string' && muc.startsWith('cu:')) {
            const url = muc.slice(3)
            if (!anhCu.has(url)) continue
            anhs.push(url)
            // Bản nhỏ đi kèm nằm cùng vị trí trong mảng cũ; không có thì dùng lại bản lớn
            anhNho.push(anhNhoCuDs[anhCuDs.indexOf(url)] || url)
        } else if (muc === 'moi') {
            const f = fileMoi[iMoi]
            const fNho = fileMoiNho[iMoi]
            iMoi++
            if (!f) continue
            try {
                const url = await luuAnhUpload(f, 'sp')
                anhs.push(url)
                const coBanNho = fNho && typeof fNho !== 'string'
                anhNho.push(coBanNho ? await luuAnhUpload(fNho, 'spn') : url)
            } catch (e) {
                return { loi: e.message }
            }
        }
    }

    if (!anhs.length) return { loi: 'Vui lòng chọn ít nhất 1 ảnh sản phẩm' }
    if (anhs.length > TOI_DA) return { loi: `Tối đa ${TOI_DA} ảnh mỗi sản phẩm` }

    return { anhs, anhNho }
}
