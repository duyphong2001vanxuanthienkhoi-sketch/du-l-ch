// Đọc & kiểm tra dữ liệu form sản phẩm — dùng chung cho API tạo và sửa.
import { DANH_MUC_SP_THEO_ID } from '@/lib/danhMucSanPham'

// Bỏ dấu + rút gọn để tạo id biến thể ổn định theo nội dung (size/màu)
function rutGon(s) {
    return String(s || '').toLowerCase().normalize('NFD')
        .replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '').slice(0, 12)
}

// id biến thể: bám theo size+màu (ổn định qua các lần sửa), thêm số nếu trùng. KHÔNG chứa '::'
function taoIdBienThe(size, mau, dungIds) {
    const base = 'v' + (rutGon(size) || 'x') + '_' + (rutGon(mau) || 'x')
    let id = base, n = 1
    while (dungIds.has(id)) { id = base + n; n++ }
    dungIds.add(id)
    return id
}

export function docFormSanPham(form, gian) {
    const ten = String(form.get('ten') || '').trim()
    const moTa = String(form.get('moTa') || '').trim()
    // Ô "gửi đi tỉnh khác" chỉ áp dụng cho gian Quà Quảng Ninh
    const guiDiTinh = gian.loaiGian === 'qua_quang_ninh' && form.get('guiDiTinh') === 'true'

    if (!ten) return { loi: 'Vui lòng nhập tên sản phẩm' }
    if (!moTa) return { loi: 'Vui lòng nhập mô tả sản phẩm' }

    // Danh mục con (tùy chọn) — phải thuộc đúng khu của gian, không thì bỏ qua
    let danhMuc = String(form.get('danhMuc') || '').trim()
    if (danhMuc) {
        const dm = DANH_MUC_SP_THEO_ID[danhMuc]
        if (!dm || dm.khu !== gian.loaiGian) danhMuc = ''
    }

    // Biến thể (size/màu) — tùy chọn. Nếu có: mỗi dòng cần (size hoặc màu) + giá + tồn kho.
    let bienThe = []
    const rawBienThe = form.get('bienThe')
    if (rawBienThe) {
        let arr
        try { arr = JSON.parse(rawBienThe) } catch { return { loi: 'Dữ liệu phân loại (size/màu) không hợp lệ' } }
        if (Array.isArray(arr) && arr.length) {
            const dungIds = new Set()
            for (const v of arr) {
                const size = String(v?.size || '').trim()
                const mau = String(v?.mau || '').trim()
                const gia = Number(v?.gia)
                const soLuong = Number(v?.soLuong)
                if (!size && !mau) return { loi: 'Mỗi phân loại cần ít nhất Size hoặc Màu' }
                if (!Number.isFinite(gia) || gia <= 0) return { loi: 'Giá của mỗi phân loại phải là số dương (VNĐ)' }
                if (!Number.isInteger(soLuong) || soLuong < 0) return { loi: 'Số lượng của mỗi phân loại phải là số nguyên không âm' }
                bienThe.push({ id: taoIdBienThe(size, mau, dungIds), size, mau, gia, soLuong })
            }
        }
    }

    // Giá & số lượng: có biến thể thì suy ra từ biến thể (giá thấp nhất + tổng tồn);
    // không có biến thể thì đọc trực tiếp từ 2 ô giá/số lượng như trước.
    let gia, soLuong
    if (bienThe.length) {
        gia = Math.min(...bienThe.map(v => v.gia))
        soLuong = bienThe.reduce((s, v) => s + v.soLuong, 0)
    } else {
        gia = Number(form.get('gia'))
        soLuong = Number(form.get('soLuong'))
        if (!Number.isFinite(gia) || gia <= 0) return { loi: 'Giá bán phải là số dương (VNĐ)' }
        if (!Number.isInteger(soLuong) || soLuong < 0) return { loi: 'Số lượng phải là số nguyên không âm' }
    }

    // Giá gốc (tùy chọn) — để hiện giá gạch ngang + badge "-x%" khi đang khuyến mãi.
    // Phải LỚN HƠN giá bán, không thì coi như không có khuyến mãi (giaGoc = 0).
    let giaGoc = Number(form.get('giaGoc'))
    if (!Number.isFinite(giaGoc) || giaGoc <= 0) giaGoc = 0
    if (giaGoc && giaGoc <= gia) {
        return { loi: 'Giá gốc phải lớn hơn giá bán (để tính được phần trăm giảm)' }
    }

    // Luôn trả về danhMuc và bienThe (kể cả rỗng) để lần SỬA có thể xóa danh mục/biến thể cũ
    return { duLieu: { ten, gia, giaGoc, moTa, soLuong, guiDiTinh, danhMuc, bienThe } }
}
