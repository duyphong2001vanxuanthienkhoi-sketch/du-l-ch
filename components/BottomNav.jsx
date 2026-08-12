'use client'
import { Bookmark, Compass, Home, Map, Route } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNgonNgu } from '@/lib/i18n'
import { MAU } from '@/lib/thuongHieu'

// Thanh điều hướng dưới kiểu app — hiện trên điện thoại VÀ máy tính bảng (lg:hidden),
// máy tính (từ 1024px) mới dùng menu trên ở Navbar.
// LƯU Ý: mọi thanh DÍNH ĐÁY khác (bong bóng chat, nút lên đầu trang, khoảng chừa cuối
// trang trong app/(public)/layout.jsx) phải đổi mốc theo thanh này, nếu không chúng sẽ
// nằm đè lên nó ở khổ tablet.
//
// ĐÂY LÀ TẦNG ĐIỀU HƯỚNG — không chứa loại hình (ăn uống, tâm linh...).
// Loại hình là tầng LỌC, nằm ở ChipLoaiHinh dính dưới header. Xem THIET-KE-APP-DU-LICH.md
// mục 4: 10 loại không nhét vừa 5 ô, và nhét vào thì mất đường về Bản đồ với Lộ trình.
//
// Tab GIỮA (Bản đồ) nhô lên thành nút tròn nổi — bản đồ là trái tim của app du lịch.


const BottomNav = () => {
    const pathname = usePathname()
    const { t } = useNgonNgu()

    // ĐƠN SẮC, không phải ngũ sắc.
    // Bản trước mỗi tab một màu (xanh lá, xanh dương, tím, hồng...) — nhìn rối và rẻ tiền,
    // lại chẳng mang thông tin gì vì màu không nói lên tab đó là gì. Nay: đang chọn = ngọc
    // (màu chủ đạo thương hiệu), chưa chọn = xám. Chỉ nút BẢN ĐỒ nổi giữa giữ màu navy
    // đậm — nó là hành động chính nên đáng được nổi bật riêng.
    const tabs = [
        { href: '/', label: t('Trang chủ', 'Home', '首页'), Icon: Home, active: pathname === '/' },
        { href: '/kham-pha', label: t('Khám phá', 'Explore', '发现'), Icon: Compass, active: pathname.startsWith('/kham-pha') || pathname.startsWith('/dia-diem') },
        { href: '/ban-do', label: t('Bản đồ', 'Map', '地图'), Icon: Map, mau: MAU.haiDam, active: pathname.startsWith('/ban-do'), noi: true },
        // Giai đoạn 2 tab này là "Ăn uống" vì Lộ trình chưa có, để link chết thì tệ.
        // Nay Lộ trình đã chạy nên trả về đúng thiết kế: đây mới là thứ khác biệt so với
        // bản đồ thường. Ăn uống vẫn tới nhanh được qua chip đầu tiên ở mọi trang.
        { href: '/lo-trinh', label: t('Lộ trình', 'Routes', '行程'), Icon: Route, active: pathname.startsWith('/lo-trinh') },
        { href: '/hanh-trinh', label: t('Hành trình', 'Journey', '旅程'), Icon: Bookmark, active: pathname.startsWith('/hanh-trinh') },
    ]

    return (
        <nav className='lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-100 shadow-[0_-6px_24px_-12px_rgba(15,23,42,0.25)]'
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className='grid grid-cols-5'>
                {tabs.map(tab => tab.noi ? (
                    // Nút bản đồ nổi giữa — tròn, nhô lên khỏi thanh
                    <Link key={tab.href} href={tab.href} aria-label={tab.label}
                        aria-current={tab.active ? 'page' : undefined}
                        className='flex flex-col items-center active:scale-90 transition-transform'>
                        <span className='flex items-center justify-center size-14 rounded-full -mt-6 border-4 border-white transition-all'
                            style={{
                                backgroundColor: tab.mau,
                                boxShadow: `0 10px 22px -6px ${tab.mau}b3`,
                            }}>
                            <tab.Icon size={24} strokeWidth={2.2} color='#ffffff' />
                        </span>
                        <span className='text-[10px] leading-none mt-1 mb-2 font-bold' style={{ color: tab.mau }}>
                            {tab.label}
                        </span>
                    </Link>
                ) : (
                    <Link key={tab.href} href={tab.href} aria-label={tab.label}
                        aria-current={tab.active ? 'page' : undefined}
                        className='flex flex-col items-center gap-1 pt-2 pb-2 active:scale-90 transition-transform'>
                        <span className='flex items-center justify-center px-3.5 py-1.5 rounded-2xl transition-all duration-300'
                            style={{
                                backgroundColor: tab.active ? MAU.ngoc : 'transparent',
                                boxShadow: tab.active ? `0 6px 14px -4px ${MAU.ngoc}80` : 'none',
                            }}>
                            <tab.Icon size={20} strokeWidth={tab.active ? 2.4 : 2}
                                style={{ color: tab.active ? '#ffffff' : MAU.xam, transition: 'color .25s' }} />
                        </span>
                        <span className='text-[10px] leading-none transition-colors duration-300'
                            style={{ color: tab.active ? MAU.ngoc : MAU.xam, fontWeight: tab.active ? 700 : 500 }}>
                            {tab.label}
                        </span>
                    </Link>
                ))}
            </div>
        </nav>
    )
}

export default BottomNav
