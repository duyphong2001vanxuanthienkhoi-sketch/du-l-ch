'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import TheSanPham from './TheSanPham'
import { useNgonNgu } from '@/lib/i18n'
import { taiSanPham } from '@/lib/utils/khoSanPham'

// Dải "Sản phẩm nổi bật" cho MÁY TÍNH — cho khách thấy hàng ngay trên trang chủ
// (điện thoại đã có dải "đặc sản nên thử" trong TrangChuApp). Xếp theo đánh giá cao nhất.
const SanPhamNoiBat = () => {
    const { t } = useNgonNgu()
    const [sps, setSps] = useState([])

    useEffect(() => {
        taiSanPham().then(sps => {
            const ds = sps.slice().sort((a, b) => {
                const ca = a.soDanhGia > 0, cb = b.soDanhGia > 0
                if (ca !== cb) return ca ? -1 : 1
                if (b.trungBinhSao !== a.trungBinhSao) return b.trungBinhSao - a.trungBinhSao
                return b.soDanhGia - a.soDanhGia
            })
            setSps(ds.slice(0, 10))
        }).catch(() => { })
    }, [])

    if (!sps.length) return null

    return (
        <section className='hidden sm:block px-6 my-14 max-w-7xl mx-auto'>
            <div className='flex items-end justify-between gap-3 mb-6'>
                <div>
                    <h2 className='flex items-center gap-2 text-2xl font-bold text-slate-800'>
                        <Sparkles size={22} className='text-amber-500' /> {t('Sản phẩm nổi bật', 'Featured products', '精选商品')}
                    </h2>
                    <p className='text-sm text-slate-500 mt-1'>{t('Được khách đánh giá cao nhất trên Chợ Số Hồng Gai', 'Top-rated by customers on Cho So Hong Gai', '鸿基数字市场顾客评分最高')}</p>
                </div>
                <Link href='/shop' className='inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:gap-2.5 transition-all shrink-0'>
                    {t('Xem tất cả', 'View all', '查看全部')} <ArrowRight size={15} />
                </Link>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
                {sps.map(sp => (
                    <TheSanPham key={sp.id} sp={sp} accentColor={sp.loaiGian === 'qua_quang_ninh' ? '#d97706' : '#059669'} />
                ))}
            </div>
        </section>
    )
}

export default SanPhamNoiBat
