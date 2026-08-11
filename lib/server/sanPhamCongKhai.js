// Hình dạng CÔNG KHAI của một sản phẩm (những gì khách được thấy) — dùng chung cho
// /api/products và /api/products/lien-quan. Trước đây phép ánh xạ này viết thẳng trong
// route sản phẩm; tách ra để hai API không lệch nhau khi thêm/bớt field (thẻ sản phẩm,
// giỏ hàng, dải gợi ý... đều đọc đúng một hình dạng).
//   p    : bản ghi thô trong bảng products
//   gian : gian ĐÃ DUYỆT sở hữu sản phẩm (bắt buộc — không có gian thì không được lộ)
//   sao  : { trungBinhSao, soDanhGia } từ thongKeTheoSanPham(), có thể thiếu
//   daBan: số đã bán từ soDaBanTheoSanPham(), có thể thiếu (0)
export function sanPhamCongKhai(p, gian, sao, daBan = 0) {
    return {
        storeId: p.storeId,
        id: p.id,
        ten: p.ten,
        gia: p.gia,
        giaGoc: p.giaGoc || 0, // giá trước khuyến mãi (0 = không giảm) — để hiện gạch ngang + nhãn -x%
        moTa: p.moTa,
        soLuong: p.soLuong,
        anh: p.anh,
        anhs: p.anhs?.length ? p.anhs : (p.anh ? [p.anh] : []),
        // Bản 400px cho thẻ sản phẩm. Sản phẩm đăng trước khi có bản nhỏ thì mảng này
        // rỗng — phía hiển thị tự lùi về bản lớn, không cần xử lý riêng.
        anhNho: p.anhNho?.length ? p.anhNho : [],
        guiDiTinh: p.guiDiTinh,
        danhMuc: p.danhMuc || '',
        bienThe: Array.isArray(p.bienThe) ? p.bienThe : [],
        createdAt: p.createdAt || null, // để xếp "hàng mới về" khi chấm điểm gợi ý
        tenGian: gian.tenGian,
        loaiGian: gian.loaiGian,
        trungBinhSao: sao?.trungBinhSao || 0,
        soDanhGia: sao?.soDanhGia || 0,
        daBan: daBan || 0,
    }
}
