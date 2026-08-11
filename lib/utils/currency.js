export function formatVND(amount) {
    const num = Math.round(Number(amount) || 0);
    return num.toLocaleString('vi-VN') + 'đ';
}

// Rút gọn số lượng cho nhãn "đã bán": 1.2k thay vì 1200 — thẻ sản phẩm rất hẹp
// (~160px trên điện thoại), số dài làm dòng sao/đã-bán bị đẩy xuống hàng.
export function formatSoGon(n) {
    const num = Math.round(Number(n) || 0);
    if (num < 1000) return String(num);
    const nghin = num / 1000;
    // 1000 -> "1k", 1200 -> "1,2k" (dấu phẩy thập phân kiểu Việt)
    return (nghin < 10 ? nghin.toFixed(1).replace(/\.0$/, '').replace('.', ',') : Math.round(nghin)) + 'k';
}
