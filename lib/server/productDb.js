// "Bảng" sản phẩm — bảng `products` trong Postgres (Neon), mỗi dòng (id, data JSONB).
// Mỗi sản phẩm thuộc về 1 gian (storeId); chỉ tiểu thương có gian ĐÃ DUYỆT mới tạo được.
import { sql } from './db'
import crypto from 'crypto'

export async function timSanPhamTheoId(id) {
    const rows = await sql`SELECT data FROM products WHERE id = ${id} LIMIT 1`
    return rows[0]?.data || null
}

export async function danhSachSanPhamTheoGian(storeId) {
    const rows = await sql`SELECT data FROM products WHERE data->>'storeId' = ${storeId}`
    return rows.map(r => r.data)
}

export async function danhSachTatCaSanPham() {
    const rows = await sql`SELECT data FROM products`
    return rows.map(r => r.data)
}

export async function taoSanPham({ storeId, ten, gia, giaGoc = 0, moTa, soLuong, anhs, anhNho = [], guiDiTinh, danhMuc = '', bienThe = [] }) {
    const luc = new Date().toISOString()
    const sp = {
        id: 'p_' + crypto.randomUUID(),
        storeId,
        ten,
        gia,          // VNĐ — nếu có biến thể: đây là giá thấp nhất (để hiển thị "từ ...")
        giaGoc,       // giá trước khuyến mãi (0 = không khuyến mãi) — để gạch ngang + badge "-x%"
        moTa,
        soLuong,      // nếu có biến thể: tổng tồn của các biến thể
        anhs,         // mảng đường dẫn ảnh bản LỚN 1400px (ảnh đầu là ảnh chính)
        anhNho,       // bản 400px TƯƠNG ỨNG từng ảnh — thẻ sản phẩm dùng bản này cho nhẹ
        anh: anhs[0], // ảnh chính — giữ để tương thích thẻ sản phẩm, giỏ hàng, đơn cũ
        guiDiTinh,    // chỉ có ý nghĩa với gian 'qua_quang_ninh'
        danhMuc,      // danh mục con (id trong lib/danhMucSanPham) — '' nếu chưa phân loại
        bienThe,      // [{ id, size, mau, gia, soLuong }] — [] nếu sản phẩm không có phân loại
        createdAt: luc,
        updatedAt: luc,
    }
    await sql`INSERT INTO products (id, data) VALUES (${sp.id}, ${JSON.stringify(sp)}::jsonb)`
    return sp
}

export async function capNhatSanPham(id, thayDoi) {
    const gop = { ...thayDoi, updatedAt: new Date().toISOString() }
    const rows = await sql`UPDATE products SET data = data || ${JSON.stringify(gop)}::jsonb WHERE id = ${id} RETURNING data`
    return rows[0]?.data || null
}

export async function xoaSanPham(id) {
    const rows = await sql`DELETE FROM products WHERE id = ${id} RETURNING id`
    return rows.length > 0
}

const nhanBienThe = (bt) => [bt.size, bt.mau].filter(Boolean).join(' · ')

// Trừ tồn kho cho MỘT loạt item, all-or-nothing: chỉ ghi DB khi TẤT CẢ còn đủ hàng.
// Hỗ trợ cả sản phẩm thường (trừ tồn ở cấp sản phẩm) lẫn sản phẩm có biến thể
// (trừ tồn ở đúng biến thể, rồi đồng bộ lại tổng tồn của sản phẩm).
//  items: [{ productId, bienTheId?, soLuong }]
//  Trả về { ok: true } hoặc { ok: false, error }
// Lưu ý: đây là đọc-sửa-ghi ở tầng ứng dụng (không khóa hàng). Với quy mô chợ địa
// phương thì đủ an toàn; các phép trừ chỉ áp vào bộ nhớ, chỉ GHI khi mọi món đều đủ.
export async function truTonKhoChoDon(items) {
    const idSanPham = [...new Set(items.map(it => String(it.productId)))]

    // Đọc mỗi sản phẩm liên quan đúng 1 lần
    const spMap = {}
    for (const id of idSanPham) {
        const sp = await timSanPhamTheoId(id)
        if (!sp) return { ok: false, error: 'Có sản phẩm không còn tồn tại, vui lòng tải lại giỏ hàng' }
        spMap[id] = sp
    }

    // Kiểm + trừ trên BỘ NHỚ (chưa ghi). Nhiều dòng cùng 1 biến thể sẽ cộng dồn đúng
    // vì tồn được giảm dần ngay trong vòng lặp. Gặp món thiếu -> thoát, KHÔNG ghi gì.
    for (const it of items) {
        const sp = spMap[String(it.productId)]
        const soLuong = Number(it.soLuong)
        const coBienThe = Array.isArray(sp.bienThe) && sp.bienThe.length > 0

        if (it.bienTheId && coBienThe) {
            const bt = sp.bienThe.find(v => v.id === it.bienTheId)
            if (!bt) return { ok: false, error: `Phân loại của "${sp.ten}" không còn, vui lòng chọn lại` }
            const ton = Number(bt.soLuong) || 0
            if (ton < soLuong) return { ok: false, error: `"${sp.ten}" (${nhanBienThe(bt)}) chỉ còn ${ton} sản phẩm` }
            bt.soLuong = ton - soLuong
        } else {
            const ton = Number(sp.soLuong) || 0
            if (ton < soLuong) return { ok: false, error: `"${sp.ten}" chỉ còn ${ton} sản phẩm` }
            sp.soLuong = ton - soLuong
        }
    }

    // Mọi món đều đủ -> GHI. Sản phẩm có biến thể: đồng bộ tổng tồn = tổng tồn các biến thể.
    const luc = new Date().toISOString()
    for (const id of idSanPham) {
        const sp = spMap[id]
        if (Array.isArray(sp.bienThe) && sp.bienThe.length > 0) {
            sp.soLuong = sp.bienThe.reduce((s, v) => s + (Number(v.soLuong) || 0), 0)
        }
        sp.updatedAt = luc
        await sql`UPDATE products SET data = ${JSON.stringify(sp)}::jsonb WHERE id = ${id}`
    }

    return { ok: true }
}

// Hoàn (cộng lại) tồn kho khi đơn bị HỦY — ngược với truTonKhoChoDon.
// items: [{ productId, bienTheId?, soLuong }]. Sản phẩm đã bị xóa thì bỏ qua (không lỗi).
export async function hoanTonKhoChoDon(items) {
    const idSanPham = [...new Set((items || []).map(it => String(it.productId)))]
    const spMap = {}
    for (const id of idSanPham) {
        const sp = await timSanPhamTheoId(id)
        if (sp) spMap[id] = sp // chỉ hoàn cho sản phẩm còn tồn tại
    }
    for (const it of items || []) {
        const sp = spMap[String(it.productId)]
        if (!sp) continue
        const soLuong = Number(it.soLuong) || 0
        const coBienThe = Array.isArray(sp.bienThe) && sp.bienThe.length > 0
        if (it.bienTheId && coBienThe) {
            const bt = sp.bienThe.find(v => v.id === it.bienTheId)
            if (bt) bt.soLuong = (Number(bt.soLuong) || 0) + soLuong
        } else {
            sp.soLuong = (Number(sp.soLuong) || 0) + soLuong
        }
    }
    const luc = new Date().toISOString()
    for (const id of Object.keys(spMap)) {
        const sp = spMap[id]
        if (Array.isArray(sp.bienThe) && sp.bienThe.length > 0) {
            sp.soLuong = sp.bienThe.reduce((s, v) => s + (Number(v.soLuong) || 0), 0)
        }
        sp.updatedAt = luc
        await sql`UPDATE products SET data = ${JSON.stringify(sp)}::jsonb WHERE id = ${id}`
    }
    return { ok: true }
}
