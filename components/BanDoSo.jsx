'use client'
import { Compass, MapPin, Navigation, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { DIA_DIEM, linkChiDuong } from '@/lib/diaDiem'
import BanDoLeaflet from '@/components/BanDoLeaflet'
import AnhDiaDiem from '@/components/AnhDiaDiem'
import { useNgonNgu } from '@/lib/i18n'

// Bỏ dấu tiếng Việt để tìm kiếm không cần gõ dấu (vd "vinh ha long" khớp "Vịnh Hạ Long")
const boDau = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()

// Khối "Bản Đồ Số Hồng Gai" trên trang chủ:
// bản đồ THẬT (Leaflet + OpenStreetMap) bên trái, danh sách địa điểm bên phải.
// Bấm ghim trên bản đồ -> danh sách cuộn tới và mở thẻ tương ứng; bấm thẻ -> bản đồ bay tới ghim.

const BanDoSo = () => {
    const { t } = useNgonNgu()
    const [chon, setChon] = useState('nui-bai-tho')
    const [timKiem, setTimKiem] = useState('')
    const theRefs = useRef({})

    // Lọc danh sách theo ô tìm (khớp tên/loại, không cần gõ dấu). Bản đồ vẫn hiện đủ ghim.
    const tuKhoa = boDau(timKiem.trim())
    const ketQua = tuKhoa
        ? DIA_DIEM.filter(d => boDau([...d.ten, ...(d.loai || [])].join(' ')).includes(tuKhoa))
        : DIA_DIEM

    const chonDiaDiem = (id, cuon = false) => {
        setChon(id)
        if (cuon && theRefs.current[id]) {
            theRefs.current[id].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
    }

    return (
        <section className='px-6 my-16 max-w-6xl mx-auto'>
            {/* Header đồng bộ với các gian hàng — quầng sáng xanh toả từ góc thay viền sọc trái cũ */}
            <div
                className='hop-sang rounded-3xl px-6 py-5 mb-8 flex items-center justify-between'
                style={{ background: 'radial-gradient(120% 170% at 100% 0%, #0284c72b 0%, transparent 55%), linear-gradient(135deg, #f0f9ff, #dbeafe)', '--mau-khu': '#0284c7' }}
            >
                <div className='flex items-start gap-4'>
                    <img src='/thuong-hieu/tile-kham-pha.webp' alt={t('Khám phá', 'Explore', '探索')} className='size-12 rounded-xl object-cover shrink-0 shadow-sm mt-0.5' />
                    <div>
                        <div className='flex items-center gap-3 flex-wrap'>
                            <h2 className='text-2xl font-bold text-slate-800'>{t('Bản Đồ Số Hồng Gai', 'Hong Gai Digital Map', '鸿基数字地图')}</h2>
                            <span className='text-xs font-semibold px-3 py-1 rounded-full text-white bg-sky-600'>{t('Khám phá', 'Explore', '探索')}</span>
                        </div>
                        <p className='text-sm text-slate-500 mt-1'>{t('Các điểm tham quan nổi bật quanh phường Hồng Gai — chạm vào ghim để xem thông tin và chỉ đường', 'Notable sights around Hong Gai ward — tap a pin for details and directions', '鸿基坊周边的热门景点 —— 点击图钉查看信息和路线')}</p>
                    </div>
                </div>
            </div>

            {/* Ô tìm điểm đến — kiểu video quảng bá */}
            <div className='flex items-center gap-2.5 bg-white border border-slate-200 rounded-full px-5 py-3 mb-5 shadow-sm max-w-xl'>
                <Search size={18} className='text-slate-400 shrink-0' />
                <input value={timKiem} onChange={e => setTimKiem(e.target.value)}
                    placeholder={t('Tìm điểm đến ở Hồng Gai...', 'Find a place in Hong Gai...', '在鸿基寻找目的地...')}
                    className='w-full bg-transparent outline-none text-sm placeholder-slate-400' />
                {timKiem && (
                    <button onClick={() => setTimKiem('')} aria-label={t('Xóa', 'Clear', '清除')} className='text-slate-300 hover:text-slate-500 shrink-0'>
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className='grid lg:grid-cols-5 gap-6 items-start'>
                {/* Bản đồ thật OpenStreetMap */}
                <div className='lg:col-span-3'>
                    <BanDoLeaflet chon={chon} onChon={(id) => chonDiaDiem(id, true)} />
                </div>

                {/* Danh sách địa điểm */}
                <div className='lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 lg:max-h-[430px] lg:overflow-y-auto no-scrollbar lg:pr-1'>
                    {ketQua.map((d, i) => (
                        <div
                            key={d.id}
                            ref={el => theRefs.current[d.id] = el}
                            onClick={() => setChon(d.id)}
                            className={`cursor-pointer rounded-2xl p-4 border transition-all ${chon === d.id ? 'bg-white bong-theo-mau -translate-y-0.5' : 'bg-slate-50 border-slate-100 hover:bg-white hover:bong-mem'}`}
                            style={{ '--mau-bong': d.mau, ...(chon === d.id ? { borderColor: d.mau } : {}) }}
                        >
                            <div className='flex items-center gap-3'>
                                <span className='flex items-center justify-center size-9 shrink-0 rounded-full overflow-hidden border-2 bg-white' style={{ borderColor: d.mau }}>
                                    <AnhDiaDiem id={d.id} alt={t(...d.ten)} className='w-full h-full object-cover'
                                        fallback={<span className='flex items-center justify-center w-full h-full text-white text-xs font-bold' style={{ backgroundColor: d.mau }}>{i + 1}</span>} />
                                </span>
                                <h3 className='font-semibold text-slate-800 text-sm flex-1'>{t(...d.ten)}</h3>
                                <span className='text-ti font-semibold px-2.5 py-0.5 rounded-full shrink-0' style={{ backgroundColor: d.mau + '1a', color: d.mau }}>{t(...d.loai)}</span>
                            </div>
                            {chon === d.id && (
                                <div className='mt-3 pl-10'>
                                    <p className='text-xs text-slate-600 leading-relaxed'>{t(...d.mota)}</p>
                                    <div className='flex items-center gap-2 flex-wrap mt-3'>
                                        <Link
                                            href={`/dia-diem/${d.id}`}
                                            onClick={e => e.stopPropagation()}
                                            className='inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition'
                                            style={{ backgroundColor: d.mau }}
                                        >
                                            <Compass size={12} /> {t('Khám phá', 'Explore', '探索')}
                                        </Link>
                                        <a
                                            href={linkChiDuong(d.ten)}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            onClick={e => e.stopPropagation()}
                                            className='inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border hover:bg-white active:scale-95 transition'
                                            style={{ color: d.mau, borderColor: d.mau }}
                                        >
                                            <Navigation size={12} /> {t('Chỉ đường', 'Directions', '路线')}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {ketQua.length === 0 && (
                        <p className='text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-2xl sm:col-span-2 lg:col-span-1'>
                            {t('Không tìm thấy địa điểm phù hợp', 'No matching places found', '未找到匹配的地点')}
                        </p>
                    )}
                </div>
            </div>

            <p className='flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-6'>
                <MapPin size={13} /> {t('Bản đồ OpenStreetMap — bấm ghim để xem thông tin, bấm "Chỉ đường" để mở Google Maps', 'OpenStreetMap — tap a pin for details, tap "Directions" to open Google Maps', 'OpenStreetMap 地图 —— 点击图钉查看信息，点击"路线"打开 Google 地图')}
            </p>
            <div className='flex justify-center mt-4'>
                <Link href='/kham-pha'
                    className='inline-flex items-center gap-2 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-6 py-2.5 rounded-full transition active:scale-95'>
                    <Compass size={15} /> {t('Xem trang Khám phá Hồng Gai đầy đủ', 'See the full Explore Hong Gai page', '查看完整的探索鸿基页面')}
                </Link>
            </div>
        </section>
    )
}

export default BanDoSo
