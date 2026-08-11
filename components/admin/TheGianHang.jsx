'use client'
import { CalendarDays, Mail, Phone, UserRound } from 'lucide-react'
import Anh from '@/components/Anh'
import { useNgonNgu } from '@/lib/i18n'

// ten: [vi, en, zh] — dịch tại chỗ hiển thị bằng t(...ten)
export const NHAN_LOAI = {
    cho_tuoi: { ten: ['Chợ Tươi', 'Fresh Market', '鲜市'], anh: '/thuong-hieu/tile-cho-tuoi.webp', mau: '#059669', nen: '#d1fae5' },
    qua_quang_ninh: { ten: ['Quà Quảng Ninh', 'Quang Ninh Gifts', '广宁礼品'], anh: '/thuong-hieu/tile-qua.webp', mau: '#d97706', nen: '#fef3c7' },
}

export const NHAN_TRANG_THAI = {
    cho_duyet: { ten: ['Chờ duyệt', 'Pending', '待审核'], mau: '#d97706', nen: '#fef3c7' },
    da_duyet: { ten: ['Đã duyệt', 'Approved', '已通过'], mau: '#059669', nen: '#d1fae5' },
    tu_choi: { ten: ['Từ chối', 'Rejected', '已拒绝'], mau: '#dc2626', nen: '#fee2e2' },
}

// Thẻ thông tin gian hàng dùng chung cho các trang quản trị
const TheGianHang = ({ gian, hienTrangThai = false }) => {
    const { t } = useNgonNgu()
    const loai = NHAN_LOAI[gian.loaiGian] || NHAN_LOAI.cho_tuoi
    const tt = NHAN_TRANG_THAI[gian.status] || NHAN_TRANG_THAI.cho_duyet

    return (
        <div className='flex-1 flex max-sm:flex-col gap-4'>
            <Anh src={gian.logo} alt={gian.tenGian} className='size-20 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0' />
            <div className='min-w-0'>
                <div className='flex items-center gap-2 flex-wrap'>
                    <h2 className='text-lg font-semibold text-slate-800'>{gian.tenGian}</h2>
                    <span className='inline-flex items-center gap-1 text-xs font-semibold pl-0.5 pr-2.5 py-0.5 rounded-full' style={{ color: loai.mau, backgroundColor: loai.nen }}>
                        <img src={loai.anh} alt='' className='w-4 h-4 object-contain' /> {t(...loai.ten)}
                    </span>
                    {hienTrangThai && (
                        <span className='text-xs font-semibold px-2.5 py-0.5 rounded-full' style={{ color: tt.mau, backgroundColor: tt.nen }}>
                            {t(...tt.ten)}
                        </span>
                    )}
                </div>
                <div className='flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-slate-500 mt-1.5'>
                    <span className='flex items-center gap-1.5'><UserRound size={14} /> {gian.tenChu}</span>
                    <span className='flex items-center gap-1.5'><Phone size={14} /> {gian.soDienThoai}</span>
                    {gian.emailChu && <span className='flex items-center gap-1.5'><Mail size={14} /> {gian.emailChu}</span>}
                    <span className='flex items-center gap-1.5'><CalendarDays size={14} /> {new Date(gian.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <p className='text-sm text-slate-600 mt-2'>{gian.moTa}</p>
            </div>
        </div>
    )
}

export default TheGianHang
