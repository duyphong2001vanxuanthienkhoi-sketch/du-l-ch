'use client'
import { useEffect, useRef, useState } from "react"
import Hero from "@/components/Hero"
import TrangChuApp from "@/components/TrangChuApp"
import SanPhamNoiBat from "@/components/SanPhamNoiBat"
import GianHang from "@/components/GianHang"
import BanDoSo from "@/components/BanDoSo"
import GianHangDaDuyet from "@/components/GianHangDaDuyet"
import LoiVaoQuanLy from "@/components/LoiVaoQuanLy"
import DiemDenNoiBat from "@/components/DiemDenNoiBat"
import OurSpecs from "@/components/OurSpec"
import Newsletter from "@/components/Newsletter"
import HienKhiCuon from "@/components/HienKhiCuon"
import { SongNgan } from "@/components/HoaTietSong"
import { BangGreenSMNoiBat } from "@/components/GreenSM"
import { useNgonNgu } from "@/lib/i18n"

// Các khu ở trang chủ — nay hiện CÙNG LÚC (không còn ẩn sau tab).
// Thanh trên chỉ để "nhảy nhanh" tới đúng khu khi bấm.
// Icon dùng ảnh thương hiệu (đã tách nền) — Bản Đồ Số mượn icon Khám phá (có ghim bản đồ)
const KHU = [
    { id: 'cho-tuoi', label: ['Chợ Tươi', 'Fresh Market', '鲜市'], icon: '/thuong-hieu/tile-cho-tuoi.webp', accent: '#059669' },
    { id: 'qua', label: ['Quà Quảng Ninh', 'Quang Ninh Gifts', '广宁礼品'], icon: '/thuong-hieu/tile-qua.webp', accent: '#d97706' },
    { id: 'ban-do', label: ['Bản Đồ Số', 'Digital Map', '数字地图'], icon: '/thuong-hieu/tile-kham-pha.webp', accent: '#0284c7' },
]

export default function Home() {
    const { t } = useNgonNgu()
    const [khuHienTai, setKhuHienTai] = useState('cho-tuoi')
    const boQuaSpy = useRef(false) // khi bấm nút nhảy, tạm khóa scroll-spy cho khỏi nhấp nháy

    // Nhảy tới khu khi bấm nút (chừa chỗ cho thanh nhảy nhanh dính trên)
    const nhayToi = (id) => {
        const el = document.getElementById(`khu-${id}`)
        if (!el) return
        setKhuHienTai(id)
        boQuaSpy.current = true
        const top = el.getBoundingClientRect().top + window.scrollY - 64
        window.scrollTo({ top, behavior: 'smooth' })
        setTimeout(() => { boQuaSpy.current = false }, 700)
    }

    // Tự sáng nút của khu đang xem khi cuộn
    useEffect(() => {
        const obs = new IntersectionObserver((entries) => {
            if (boQuaSpy.current) return
            for (const e of entries) {
                if (e.isIntersecting) setKhuHienTai(e.target.id.replace('khu-', ''))
            }
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 })

        KHU.forEach(k => {
            const el = document.getElementById(`khu-${k.id}`)
            if (el) obs.observe(el)
        })
        return () => obs.disconnect()
    }, [])

    return (
        <div>
            {/* Điện thoại: đầu trang kiểu app. Máy tính: Hero web */}
            <TrangChuApp />
            <div className="hidden sm:block">
                <Hero />
            </div>

            {/* Lối vào khu quản lý — hiện riêng theo vai trò (admin / tiểu thương / chủ quán).
                Bản mobile nằm trong TrangChuApp (ngay dưới ô danh mục) cho dễ thấy. */}
            <div className='hidden sm:block'>
                <LoiVaoQuanLy />
            </div>

            {/* Sản phẩm nổi bật — hiện ngay cho khách trên máy tính */}
            <SanPhamNoiBat />

            {/* Đối tác giao vận Green SM (máy tính) — bản mobile gọn nằm trong TrangChuApp */}
            <div className='hidden sm:block max-w-6xl mx-auto px-6 mt-10'>
                <BangGreenSMNoiBat
                    tieuDe={t('Giao hàng, đặt xe cùng Green SM', 'Delivery & rides with Green SM', 'Green SM 送货 · 叫车')}
                    moTa={t('Đối tác xe điện — giao hàng & đặt xe tận nơi tại Hồng Gai, xanh và thân thiện môi trường', 'Electric-vehicle partner — delivery & ride-hailing in Hong Gai, green and eco-friendly', '电动车合作伙伴 —— 鸿基送货与叫车，绿色环保')}
                    nhanNut={t('Đặt xe ngay', 'Book a ride', '立即叫车')} />
            </div>

            {/* Thanh nhảy nhanh tới từng khu (các khu đều hiện sẵn bên dưới) */}
            <div className='sticky top-0 z-30 bg-white/85 backdrop-blur-md border-y border-slate-100 shadow-sm'>
                <div className='max-w-6xl mx-auto px-4 sm:px-6 flex items-center sm:justify-center gap-2 sm:gap-3 py-3 overflow-x-auto no-scrollbar'>
                    {KHU.map(k => (
                        <button
                            key={k.id}
                            onClick={() => nhayToi(k.id)}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-full pl-2.5 pr-4 sm:pr-6 py-1.5 text-sm font-semibold transition-all active:scale-95 ${khuHienTai === k.id ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            style={khuHienTai === k.id ? { backgroundColor: k.accent, boxShadow: `0 8px 20px -6px ${k.accent}aa` } : {}}
                        >
                            <span className={`flex items-center justify-center size-7 rounded-full shrink-0 ${khuHienTai === k.id ? 'bg-white/20' : 'bg-white'}`}>
                                <img src={k.icon} alt='' className='w-5 h-5 object-contain' />
                            </span>
                            {t(...k.label)}
                        </button>
                    ))}
                </div>
            </div>

            {/* KHU CHỢ TƯƠI */}
            <div id='khu-cho-tuoi' className='scroll-mt-16'>
                <HienKhiCuon>
                <GianHang
                    title={t("Chợ Tươi", "Fresh Market", "鲜市")}
                    subtitle={t("Hải sản đánh bắt hằng ngày từ vịnh Hạ Long — giao tận nơi trong ngày tại Hồng Gai và lân cận", "Seafood caught daily from Ha Long Bay — same-day delivery in Hong Gai and nearby", "每日从下龙湾捕捞的海鲜 —— 鸿基及周边当日送达")}
                    icon="/thuong-hieu/tile-cho-tuoi.webp"
                    badge={t("Giao hôm nay", "Delivered today", "今日送达")}
                    accentColor="#059669"
                    bgColor="linear-gradient(135deg, #ecfdf5, #d1fae5)"
                    loai="cho_tuoi"
                />
                <GianHangDaDuyet loai="cho_tuoi" accentColor="#059669" />
                </HienKhiCuon>
            </div>

            {/* KHU QUÀ QUẢNG NINH */}
            <div id='khu-qua' className='scroll-mt-16'>
                <HienKhiCuon>
                <GianHang
                    title={t("Quà Quảng Ninh", "Quang Ninh Gifts", "广宁礼品")}
                    subtitle={t("Đặc sản, hải sản khô, quà lưu niệm chính gốc — đóng gói đẹp, gửi đi khắp mọi miền", "Specialties, dried seafood, authentic souvenirs — nicely packed, shipped nationwide", "特产、海鲜干货、正宗纪念品 —— 精美包装，全国寄送")}
                    icon="/thuong-hieu/tile-qua.webp"
                    badge={t("Đặc sản", "Specialty", "特产")}
                    accentColor="#d97706"
                    bgColor="linear-gradient(135deg, #fffbeb, #fef3c7)"
                    loai="qua_quang_ninh"
                />
                <GianHangDaDuyet loai="qua_quang_ninh" accentColor="#d97706" />
                </HienKhiCuon>
            </div>

            {/* KHU BẢN ĐỒ SỐ */}
            <div id='khu-ban-do' className='scroll-mt-16'>
                <BanDoSo />
            </div>

            {/* Khối gợi ý điểm đến — nằm trên "mặt vịnh" xanh nhạt, sóng lượn hai đầu */}
            <HienKhiCuon>
                <SongNgan mau='#f0f9ff' className='mt-10' />
                <div className='py-1' style={{ background: '#f0f9ff' }}>
                    <DiemDenNoiBat />
                </div>
                <SongNgan mau='#f0f9ff' lat />
            </HienKhiCuon>

            <HienKhiCuon><OurSpecs /></HienKhiCuon>
            <HienKhiCuon><Newsletter /></HienKhiCuon>
        </div>
    )
}
