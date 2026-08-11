'use client'
import { ArrowRight, Store } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import TheSanPham from './TheSanPham'
import { useNgonNgu } from '@/lib/i18n'
import { taiSanPham } from '@/lib/utils/khoSanPham'

// Khu hàng chính trên trang chủ (Chợ Tươi / Quà Quảng Ninh).
// Hiển thị sản phẩm THẬT do tiểu thương đăng — thẻ có tên shop phía dưới (kiểu Shopee).
const GianHang = ({ title, subtitle, icon, badge, accentColor, bgColor, loai }) => {
    const { t } = useNgonNgu()
    const [sanPhams, setSanPhams] = useState([])
    const [loading, setLoading] = useState(true)

    // Lấy từ kho dùng chung rồi lọc khu TẠI CHỖ, thay vì gọi ?loai= riêng cho từng khu.
    // Trang chủ có 2 khu nên trước đây một lần vào trang là 3 lệnh gọi cùng lúc tới
    // /api/products (bản đầy đủ + 2 bản lọc) — cùng một dữ liệu, tải 3 lần, và đủ để Neon
    // kêu "quá nhiều kết nối cùng lúc".
    useEffect(() => {
        taiSanPham()
            .then(ds => setSanPhams(ds.filter(sp => sp.loaiGian === loai)))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [loai])

    return (
        <section className='px-6 my-16 max-w-6xl mx-auto' style={{ '--mau-khu': accentColor }}>
            {/* Section header banner — quầng sáng màu khu toả từ góc phải thay cho viền sọc
                trái 5px kiểu cũ (mẫu dùng chung với Bản Đồ Số & đầu trang địa điểm) */}
            <div
                className='hop-sang rounded-3xl px-6 py-5 mb-8 flex items-center justify-between'
                style={{ background: `radial-gradient(120% 170% at 100% 0%, ${accentColor}2b 0%, transparent 55%), ${bgColor}`, '--mau-khu': accentColor }}
            >
                <div className='flex items-start gap-4'>
                    {icon?.startsWith('/') ? (
                        <span className='flex items-center justify-center size-14 rounded-2xl bg-white shadow-sm shrink-0 p-1.5'>
                            <img src={icon} alt='' className='w-full h-full object-contain' />
                        </span>
                    ) : (
                        <span className='text-4xl leading-none mt-0.5'>{icon}</span>
                    )}
                    <div>
                        <div className='flex items-center gap-3 flex-wrap'>
                            <h2 className='text-2xl font-bold text-slate-800'>{title}</h2>
                            <span
                                className='text-xs font-semibold px-3 py-1 rounded-full text-white'
                                style={{ backgroundColor: accentColor }}
                            >
                                {badge}
                            </span>
                        </div>
                        <p className='text-sm text-slate-500 mt-1'>{subtitle}</p>
                    </div>
                </div>
                <Link
                    href='/shop'
                    className='mau-khu hidden sm:flex items-center gap-1 text-sm font-semibold whitespace-nowrap'
                >
                    {t('Xem tất cả', 'View all', '查看全部')} <ArrowRight size={15} />
                </Link>
            </div>

            {/* Sản phẩm thật của tiểu thương trong khu */}
            {!loading && (sanPhams.length ? (
                <div className='luoi-vao grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {sanPhams.map(sp => (
                        <TheSanPham key={sp.id} sp={sp} accentColor={accentColor} />
                    ))}
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center py-14 text-slate-400 gap-3 bg-slate-50 rounded-2xl'>
                    <Store size={32} />
                    <p className='text-sm'>{t('Khu này chưa có sản phẩm — mời bà con tiểu thương', 'No products in this zone yet — invite local merchants to', '此区暂无商品 —— 邀请商户')} <Link href='/create-store' className='mau-khu underline font-medium' style={{ '--mau-khu': accentColor }}>{t('mở gian hàng', 'open a store', '开店')}</Link>!</p>
                </div>
            ))}

            {/* Mobile "xem tất cả" */}
            {sanPhams.length > 0 && (
                <div className='flex justify-center mt-8 sm:hidden'>
                    <Link
                        href='/shop'
                        className='mau-khu vien-mau-khu flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full border-2'
                    >
                        {t('Xem tất cả', 'View all', '查看全部')} {title} <ArrowRight size={15} />
                    </Link>
                </div>
            )}
        </section>
    )
}

export default GianHang
