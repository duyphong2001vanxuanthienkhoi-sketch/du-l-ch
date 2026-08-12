'use client'
import { useNgonNgu } from '@/lib/i18n'
import { LOAI_DIA_DIEM } from '@/lib/diaDiemLoai'

// THANH CHIP LOẠI HÌNH — tầng LỌC (khác thanh dưới là tầng ĐIỀU HƯỚNG).
// Xem THIET-KE-APP-DU-LICH.md mục 4: cố tình KHÔNG nhét loại hình vào thanh dưới
// vì có 10 loại mà thanh dưới chỉ chứa được 5, và nhét vào thì mất đường về
// Bản đồ với Lộ trình — hai thứ giá trị nhất.
//
// Bấm chip là lọc TẠI CHỖ, không nhảy trang.
export default function ChipLoaiHinh({ chon, onChon, dem = null, className = '' }) {
    const { t } = useNgonNgu()

    const muc = [
        { id: '', ten: ['Tất cả', 'All', '全部'], icon: '✨', mau: '#00A8A8' },
        ...LOAI_DIA_DIEM,
    ]

    return (
        <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar cuon-chip ${className}`}>
            {muc.map(l => {
                const dangChon = chon === l.id
                const soLuong = l.id && dem ? dem[l.id] : null
                // Loại không có địa điểm nào thì ẩn đi cho đỡ rối — trừ loại đang chọn
                if (l.id && dem && !soLuong && !dangChon) return null
                return (
                    <button key={l.id || 'tat-ca'} type='button' onClick={() => onChon(l.id)}
                        aria-pressed={dangChon}
                        className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 shrink-0 ${dangChon ? 'text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                        style={dangChon ? { backgroundColor: l.mau, boxShadow: `0 8px 18px -8px ${l.mau}` } : undefined}>
                        <span aria-hidden='true'>{l.icon}</span>
                        {t(...l.ten)}
                        {soLuong != null && (
                            <span className={`text-[11px] font-bold ${dangChon ? 'text-white/70' : 'text-slate-400'}`}>
                                {soLuong}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
