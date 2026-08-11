'use client'
import { Car, MapPin, Phone, Truck, UserRound, Zap } from 'lucide-react'
import { formatVND } from '@/lib/utils/currency'
import { useNgonNgu } from '@/lib/i18n'
import Anh from '@/components/Anh'
import { TT_DON } from '@/lib/trangThaiDon'

const NHAN_GIAO = {
    giao_nhanh: { ten: 'Giao nhanh trong ngày', Icon: Zap, mau: '#059669', nen: '#d1fae5' },
    gui_xa: { ten: 'Gửi đi xa', Icon: Truck, mau: '#d97706', nen: '#fef3c7' },
    xanh_sm: { ten: 'Giao qua Green SM', Icon: Car, mau: '#0E9E92', nen: '#cdf5f0' },
}

// Giữ tên export cũ cho nơi khác import (nay trỏ về định nghĩa dùng chung ở lib/trangThaiDon)
export const NHAN_TRANG_THAI_DON = TT_DON

// Thẻ đơn hàng dùng chung cho khách / tiểu thương / admin.
// - hienKhach: hiện thông tin người nhận (dành cho tiểu thương & admin)
// - hienGian:  hiện tên gian cạnh từng sản phẩm (dành cho khách & admin)
// - tongTien:  số tiền hiển thị ở chân thẻ (admin/khách: cả đơn; tiểu thương: phần gian mình)
// children: khu vực tùy chọn ở cuối thẻ (ví dụ nút đổi trạng thái của tiểu thương)
// hanhDongItem: (item) => nút/nội dung gắn cạnh từng sản phẩm (ví dụ nút "Đánh giá" của khách)
// giamGia: { tongTienHang, tienGiam, maGiam } — tùy chọn, chỉ hiện khi tienGiam > 0
//          (dùng ở đơn của khách; tiểu thương xem phần gian mình nên không truyền)
const TheDonHang = ({ don, hienKhach = false, hienGian = false, tongTien, nhanTong, giamGia, hanhDongItem, children }) => {
    const { t } = useNgonNgu()
    const giao = NHAN_GIAO[don.hinhThucGiao] || NHAN_GIAO.giao_nhanh
    const tt = TT_DON[don.status] || TT_DON.cho_xac_nhan
    const GIAO_TEXT = { giao_nhanh: t('Giao nhanh trong ngày', 'Same-day delivery', '当日速送'), gui_xa: t('Gửi đi xa', 'Ship far', '远程寄送'), xanh_sm: t('Giao qua Green SM', 'Via Green SM', '通过 Green SM') }

    return (
        <div className='bg-white border border-slate-200 rounded-2xl shadow-sm p-5 max-w-4xl'>
            <div className='flex items-center gap-2 flex-wrap'>
                <span className='font-mono text-sm font-semibold text-slate-700'>#{don.id.slice(-8).toUpperCase()}</span>
                <span className='text-xs font-semibold px-2.5 py-0.5 rounded-full' style={{ color: tt.mau, backgroundColor: tt.nen }}>{t(tt.ten, tt.en, tt.zh)}</span>
                <span className='flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full' style={{ color: giao.mau, backgroundColor: giao.nen }}>
                    <giao.Icon size={11} /> {GIAO_TEXT[don.hinhThucGiao] || giao.ten}
                </span>
                <span className='text-xs text-slate-400 ml-auto'>{new Date(don.createdAt).toLocaleString(t('vi-VN', 'en-US', 'zh-CN'))}</span>
            </div>

            {hienKhach && (
                <div className='flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-slate-600 mt-3 bg-slate-50 rounded-xl px-3 py-2'>
                    <span className='flex items-center gap-1.5'><UserRound size={14} /> {don.ten}</span>
                    <span className='flex items-center gap-1.5'><Phone size={14} /> {don.soDienThoai}</span>
                    <span className='flex items-center gap-1.5'><MapPin size={14} /> {don.diaChi}</span>
                </div>
            )}

            <div className='mt-3 divide-y divide-slate-100'>
                {don.items.map((it, i) => (
                    <div key={i} className='flex items-center gap-3 py-2.5'>
                        <Anh src={it.anh} alt={it.ten} className='size-11 rounded-lg object-cover ring-1 ring-slate-100 shrink-0' />
                        <div className='min-w-0 flex-1'>
                            <p className='text-sm font-medium text-slate-700 truncate'>{it.ten}</p>
                            {it.bienTheNhan && (
                                <span className='inline-block text-ti font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full mt-0.5'>{it.bienTheNhan}</span>
                            )}
                            {hienGian && <p className='text-xs text-slate-400'>{it.tenGian}</p>}
                        </div>
                        <p className='text-sm text-slate-500 whitespace-nowrap so-tien'>{it.soLuong} × {formatVND(it.gia)}</p>
                        <p className='text-sm font-semibold text-slate-700 whitespace-nowrap w-24 text-right so-tien'>{formatVND(it.gia * it.soLuong)}</p>
                        {hanhDongItem && hanhDongItem(it)}
                    </div>
                ))}
            </div>

            <div className='border-t border-slate-100 pt-3 mt-1'>
                {giamGia && giamGia.tienGiam > 0 && (
                    <div className='space-y-1 text-sm mb-1.5'>
                        <div className='flex items-center justify-between text-slate-400'>
                            <span>{t('Tạm tính', 'Subtotal', '小计')}</span>
                            <span>{formatVND(giamGia.tongTienHang)}</span>
                        </div>
                        <div className='flex items-center justify-between text-green-600'>
                            <span>{t('Giảm', 'Discount', '优惠')} ({giamGia.maGiam})</span>
                            <span>-{formatVND(giamGia.tienGiam)}</span>
                        </div>
                    </div>
                )}
                <div className='flex items-center justify-between'>
                    <span className='text-sm text-slate-500'>{nhanTong || t('Tổng cộng', 'Total', '合计')}</span>
                    <span className='font-bold text-slate-800 so-tien'>{formatVND(tongTien)}</span>
                </div>
            </div>

            {children}
        </div>
    )
}

export default TheDonHang
