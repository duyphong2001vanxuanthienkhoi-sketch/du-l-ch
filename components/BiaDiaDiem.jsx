'use client'
import AnhDiaDiem from '@/components/AnhDiaDiem'
import { useNgonNgu } from '@/lib/i18n'

// Ảnh bìa của một địa điểm dùng chung cho trang Khám phá và trang chi tiết.
// Có file ảnh thật (public/dia-diem/<id>.jpg) thì hiện ảnh; CHƯA có ảnh thì
// hiện khối gradient + emoji + nhãn loại cho đẹp và đồng đều, thay vì để trống.
// `className` truyền cả kích thước lẫn bo góc — áp cho cả ảnh thật lẫn khối dự phòng.
export default function BiaDiaDiem({ d, className = '' }) {
    const { t } = useNgonNgu()
    return (
        <AnhDiaDiem
            id={d.id}
            alt={t(...d.ten)}
            className={`object-cover ${className}`}
            fallback={
                <div
                    className={`flex flex-col items-center justify-center gap-2.5 ${className}`}
                    style={{ background: `linear-gradient(135deg, ${d.mau}18, ${d.mau}3a)` }}
                >
                    <span className='text-5xl sm:text-6xl drop-shadow-sm'>{d.icon}</span>
                    <span className='text-ti font-semibold px-3 py-1 rounded-full text-white shadow-sm' style={{ backgroundColor: d.mau }}>
                        {t(...d.loai)}
                    </span>
                </div>
            }
        />
    )
}
