'use client'
import { ShoppingCart, Star, Store, Truck, Zap } from 'lucide-react'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { formatVND, formatSoGon } from '@/lib/utils/currency'
import { useNgonNgu } from '@/lib/i18n'
import { bayVaoGio } from '@/lib/utils/bayVaoGio'
import Anh from '@/components/Anh'

// Thẻ sản phẩm thật (của tiểu thương) — dùng ở trang chủ, /shop và trang gian hàng.
// hienGian: hiện tên gian (link sang trang gian) dưới tên sản phẩm — kiểu Shopee.
const TheSanPham = ({ sp, accentColor = '#059669', hienGian = true }) => {
    const dispatch = useDispatch()
    const { t } = useNgonNgu()

    const coBienThe = sp.bienThe?.length > 0
    // Khuyến mãi: có giá gốc lớn hơn giá bán → hiện nhãn "-x%" + giá cũ gạch ngang
    const giamPhanTram = sp.giaGoc > sp.gia ? Math.round((1 - sp.gia / sp.giaGoc) * 100) : 0

    const themVaoGio = (e) => {
        dispatch(addToCart({ khoa: sp.id }))
        // Lấy khối ảnh của chính thẻ này để cho "bay vào giỏ"
        const anhEl = e?.currentTarget?.closest('.group')?.querySelector('a[href^="/product/"]')
        bayVaoGio(sp.anh, anhEl)
        toast.success(`${t('Đã thêm', 'Added', '已添加')} "${sp.ten}" ${t('vào giỏ', 'to cart', '到购物车')}`)
    }

    return (
        // Bóng nhuốm màu khu (--mau-bong) thay bóng xám mặc định → nổi khối, "long lanh" hơn
        <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden bong-mem hover:bong-theo-mau hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group'
            style={{ '--mau-bong': accentColor, '--mau-khu': accentColor }}>
            <Link href={`/product/${sp.id}`} className='block relative aspect-square bg-slate-50 overflow-hidden'>
                <Anh src={sp.anh} nho={sp.anhNho?.[0]} alt={sp.ten} className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out' />
                {sp.anhs?.length > 1 && (
                    <Anh src={sp.anhs[1]} nho={sp.anhNho?.[1]} alt='' aria-hidden='true' fade={false}
                        className='absolute inset-0 w-full h-full object-cover opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-110 transition-[opacity,transform] duration-500 ease-out' />
                )}
                {/* Cách nhận hàng — lợi thế lớn nhất của chợ này (giao nhanh nội thành Hạ Long)
                    trước đây chỉ hiện ở trang giỏ, khách lướt chợ không hề thấy. Dùng luôn ô nhãn
                    góc trái vốn đang bỏ trống với hàng tươi, không làm thẻ cao thêm dòng nào. */}
                {sp.guiDiTinh ? (
                    <span className='absolute top-2 left-2 flex items-center gap-1 text-ti font-semibold text-white bg-amber-500 px-2 py-0.5 rounded-full'>
                        <Truck size={11} /> {t('Gửi đi tỉnh', 'Ships nationwide', '可寄外省')}
                    </span>
                ) : (
                    <span className='absolute top-2 left-2 flex items-center gap-1 text-ti font-semibold text-white bg-emerald-600 px-2 py-0.5 rounded-full'>
                        <Zap size={11} /> {t('Giao trong ngày', 'Same-day', '当日达')}
                    </span>
                )}
                {giamPhanTram > 0 && sp.soLuong > 0 && (
                    <span className='absolute top-2 right-2 text-ti font-bold text-white bg-rose-500 px-2 py-0.5 rounded-full so-tien shadow-sm'>
                        -{giamPhanTram}%
                    </span>
                )}
                {sp.soLuong === 0 && (
                    <span className='absolute inset-0 flex items-center justify-center bg-slate-900/50 text-white text-sm font-semibold'>
                        {t('Hết hàng', 'Out of stock', '已售罄')}
                    </span>
                )}
            </Link>
            <div className='p-3'>
                <Link href={`/product/${sp.id}`} className='font-medium text-slate-800 text-sm leading-5 line-clamp-2 min-h-[2.5rem] hover:text-slate-900'>{sp.ten}</Link>

                {(sp.soDanhGia > 0 || sp.daBan > 0) && (
                    <span className='flex items-center gap-1 text-xs text-slate-600 mt-0.5'>
                        {sp.soDanhGia > 0 && (
                            <>
                                <Star size={12} className='fill-amber-400 text-amber-400 shrink-0' />
                                {sp.trungBinhSao} ({sp.soDanhGia})
                            </>
                        )}
                        {sp.soDanhGia > 0 && sp.daBan > 0 && <span className='text-slate-300'>·</span>}
                        {sp.daBan > 0 && (
                            <span className='truncate'>{t('Đã bán', 'Sold', '已售')} {formatSoGon(sp.daBan)}</span>
                        )}
                    </span>
                )}

                {hienGian && (
                    <Link href={sp.storeId ? `/gian/${sp.storeId}` : '/shop'}
                        className='flex items-center gap-1 text-xs text-slate-500 truncate mt-0.5 hover:text-slate-700 hover:underline'>
                        <Store size={11} className='shrink-0' /> {sp.tenGian}
                    </Link>
                )}

                <div className='flex items-center justify-between gap-2 mt-1.5'>
                    <div className='min-w-0'>
                        <p className='mau-khu font-semibold so-tien'>{coBienThe && t('từ ', 'from ', '起 ')}{formatVND(sp.gia)}</p>
                        {giamPhanTram > 0 && (
                            <p className='text-xs text-slate-400 line-through so-tien'>{formatVND(sp.giaGoc)}</p>
                        )}
                    </div>
                    {coBienThe ? (
                        // Có phân loại: phải vào trang chi tiết để chọn size/màu
                        <Link href={`/product/${sp.id}`} aria-label={`Chọn phân loại ${sp.ten}`}
                            className='flex items-center justify-center size-8 rounded-full text-white hover:scale-110 hover:shadow-md active:scale-90 transition'
                            style={{ backgroundColor: accentColor }}>
                            <ShoppingCart size={14} />
                        </Link>
                    ) : (
                        <button
                            onClick={themVaoGio}
                            disabled={sp.soLuong === 0}
                            aria-label={`Thêm ${sp.ten} vào giỏ`}
                            className='flex items-center justify-center size-8 rounded-full text-white hover:scale-110 hover:shadow-md active:scale-90 transition disabled:opacity-40 disabled:pointer-events-none'
                            style={{ backgroundColor: accentColor }}>
                            <ShoppingCart size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TheSanPham
