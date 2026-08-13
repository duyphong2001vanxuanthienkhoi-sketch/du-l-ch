'use client'
import Link from 'next/link'
import { Bookmark, Clock, MapPin, Star } from 'lucide-react'
import Anh from '@/components/Anh'
import AnhDiaDiem from '@/components/AnhDiaDiem'
import { useNgonNgu } from '@/lib/i18n'
import { mauDiaDiem, iconDiaDiem, timLoai, timMucGia } from '@/lib/diaDiemLoai'
import { dangMoCua, useDaLuu } from '@/lib/utils/diaDiemClient'

// THẺ ĐỊA ĐIỂM — dùng chung cho lưới Khám phá, dải cuộn ngang trang chủ,
// thẻ trượt lên từ đáy ở trang Bản đồ, và trang Đã lưu.
// Thay cho TheSanPham / TheGianHang / thẻ viết inline rải rác trước đây.
//
// kieu:
//   'luoi'  — thẻ dọc trong lưới (mặc định)
//   'ngang' — thẻ ngang gọn, dùng cho danh sách & bottom sheet bản đồ
//   'dai'   — thẻ trong dải cuộn ngang ở trang chủ

// Ảnh bìa: ưu tiên ảnh nhập trong admin, không có thì rơi về quy ước cũ
// public/dia-diem/<id>.jpg, cuối cùng mới là khối gradient + emoji.
const Bia = ({ d, className }) => {
    const mau = mauDiaDiem(d)
    const nen = (
        <span className='flex items-center justify-center w-full h-full text-4xl'
            style={{ background: `linear-gradient(135deg, ${mau}22, ${mau}55)` }}>
            {iconDiaDiem(d)}
        </span>
    )
    if (d.anhBia) return <Anh src={d.anhBia} alt='' className={className} />
    return (
        <span className={`block overflow-hidden ${className}`}>
            <AnhDiaDiem id={d.id} alt='' className='w-full h-full object-cover' fallback={nen} />
        </span>
    )
}

// Nút tim lưu địa điểm — chạy hoàn toàn trên localStorage, KHÔNG cần đăng nhập.
export const NutLuu = ({ id, className = '' }) => {
    const { t } = useNgonNgu()
    const [daLuu, doi] = useDaLuu()
    const luu = daLuu.includes(id)
    return (
        <button type='button'
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); doi(id) }}
            aria-label={luu ? t('Bỏ lưu', 'Remove', '取消收藏') : t('Lưu địa điểm', 'Save place', '收藏地点')}
            aria-pressed={luu}
            className={`flex items-center justify-center size-9 rounded-full backdrop-blur transition active:scale-90 ${luu ? 'bg-rose-600 text-white' : 'bg-white/85 text-slate-500 hover:text-rose-600'} ${className}`}>
            <Bookmark size={16} className={luu ? 'fill-current' : ''} />
        </button>
    )
}

export default function TheDiaDiem({ d, kieu = 'luoi', khoangCach = null, onChon = null }) {
    const { t } = useNgonNgu()
    const mau = mauDiaDiem(d)
    const loai = timLoai(d.loai)
    const gia = timMucGia(d.mucGia)
    const mo = dangMoCua(d)

    const ten = t(...(d.ten || []))
    const mota = t(...(d.mota || []))

    // Dải nhãn phụ dưới tên — dùng chung cho mọi kiểu thẻ
    const NhanPhu = () => (
        <div className='flex items-center gap-x-2.5 gap-y-1 flex-wrap text-xs text-slate-500 mt-1.5'>
            {d.diemTB > 0 && (
                <span className='flex items-center gap-1 font-semibold text-amber-600'>
                    <Star size={12} className='fill-current' />{d.diemTB}
                </span>
            )}
            {mo !== null && (
                <span className={`flex items-center gap-1 font-semibold ${mo ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <Clock size={12} />{mo ? t('Đang mở', 'Open', '营业中') : t('Đã đóng', 'Closed', '已打烊')}
                </span>
            )}
            {gia && <span className='font-semibold text-slate-500'>{gia.kyHieu || t(...gia.ten)}</span>}
            {khoangCach != null && (
                <span className='flex items-center gap-1'>
                    <MapPin size={12} />{khoangCach < 1 ? `${Math.round(khoangCach * 1000)} m` : `${khoangCach.toFixed(1)} km`}
                </span>
            )}
        </div>
    )

    // --- Kiểu NGANG: dùng cho danh sách dọc & thẻ trượt lên ở trang Bản đồ ---
    if (kieu === 'ngang') {
        return (
            <Link href={`/dia-diem/${d.id}`} onClick={onChon ? (e) => onChon(e, d) : undefined}
                className='the-dd group flex gap-3.5 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-md transition'
                style={{ '--mau': mau }}>
                <Bia d={d} className='size-20 rounded-xl object-cover shrink-0' />
                <div className='min-w-0 flex-1'>
                    <div className='flex items-start justify-between gap-2'>
                        <h3 className='font-bold text-slate-800 truncate'>{ten}</h3>
                        <NutLuu id={d.id} className='!size-8 shrink-0 -mt-0.5' />
                    </div>
                    <span className='inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1'
                        style={{ backgroundColor: mau + '1a', color: mau }}>
                        {loai ? t(...loai.ten) : d.loai}
                    </span>
                    <NhanPhu />
                </div>
            </Link>
        )
    }

    // --- Kiểu LỚN: thẻ chủ đạo của khối bento, ảnh tràn cả thẻ, chữ đè lên ảnh ---
    // Mọi thẻ cùng một cỡ thì trang phẳng lì, mắt không có chỗ dừng. Thẻ lớn tạo
    // điểm neo thị giác cho cả khối.
    if (kieu === 'lon') {
        return (
            <Link href={`/dia-diem/${d.id}`} onClick={onChon ? (e) => onChon(e, d) : undefined}
                className='the-dd group relative flex flex-col justify-end min-h-[260px] lg:min-h-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300'
                style={{ '--mau': mau }}>
                <Bia d={d} className='absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700' />
                {/* Lớp phủ chỉ đậm ở đáy — ảnh vẫn "thở" ở phần trên */}
                <span aria-hidden='true' className='absolute inset-0'
                    style={{ background: 'linear-gradient(180deg, rgba(8,36,60,0) 30%, rgba(8,36,60,.55) 62%, rgba(8,36,60,.92) 100%)' }} />

                <span className='absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full text-white backdrop-blur-sm'
                    style={{ backgroundColor: mau + 'e6' }}>
                    {loai ? t(...loai.ten) : d.loai}
                </span>
                <NutLuu id={d.id} className='absolute top-2.5 right-2.5' />

                <div className='relative p-5'>
                    <h3 className='text-xl sm:text-2xl font-bold text-white can-dong'>{ten}</h3>
                    <div className='flex items-center gap-x-3 gap-y-1 flex-wrap text-xs text-white/80 mt-2'>
                        {d.diemTB > 0 && (
                            <span className='flex items-center gap-1 font-semibold'>
                                <Star size={12} className='fill-current' />{d.diemTB}
                            </span>
                        )}
                        {mo !== null && (
                            <span className='font-semibold'>{mo ? t('Đang mở', 'Open', '营业中') : t('Đã đóng', 'Closed', '已打烊')}</span>
                        )}
                        {gia && <span className='font-semibold'>{gia.kyHieu || t(...gia.ten)}</span>}
                        {khoangCach != null && (
                            <span>{khoangCach < 1 ? `${Math.round(khoangCach * 1000)} m` : `${khoangCach.toFixed(1)} km`}</span>
                        )}
                    </div>
                    {mota && <p className='text-sm text-white/75 mt-2 line-clamp-2 leading-relaxed max-w-md'>{mota}</p>}
                </div>
            </Link>
        )
    }

    // --- Kiểu LƯỚI (mặc định) và DẢI cuộn ngang ---
    // 'dai': rộng cố định để vuốt ngang trên điện thoại; lg:w-auto để khi khổ máy tính
    // đổi bố cục sang lưới thì thẻ giãn vừa ô thay vì bị ghim cứng 256px.
    const rongDai = kieu === 'dai' ? 'w-64 shrink-0 lg:w-auto' : ''
    return (
        <Link href={`/dia-diem/${d.id}`} onClick={onChon ? (e) => onChon(e, d) : undefined}
            className={`the-dd group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${rongDai}`}
            style={{ '--mau': mau }}>
            <div className='relative'>
                <Bia d={d} className='w-full aspect-[16/10] object-cover group-hover:scale-[1.03] transition-transform duration-500' />
                <span className='absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1 rounded-full text-white backdrop-blur-sm'
                    style={{ backgroundColor: mau + 'e6' }}>
                    {loai ? t(...loai.ten) : d.loai}
                </span>
                <NutLuu id={d.id} className='absolute top-2 right-2' />
            </div>
            <div className='p-4 flex flex-col flex-1'>
                <h3 className='font-bold text-slate-800 can-dong'>{ten}</h3>
                <NhanPhu />
                {mota && <p className='text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed'>{mota}</p>}
            </div>
        </Link>
    )
}
