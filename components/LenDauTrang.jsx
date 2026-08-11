'use client'
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

// Thanh tiến trình cuộn ở mép trên + nút "↑ lên đầu trang" nổi.
// Điện thoại: xếp CHỒNG ngay trên bong bóng chat (góc phải) để thoát thanh nav dưới —
//   đặt bên trái sẽ đè tab "Trang chủ" (cả mép dưới là 6 tab kín từ trái sang phải).
// Máy tính: góc trái (không có thanh nav dưới nên không va chạm).
// Ẩn nút khi panel chat đang mở để không đè lên panel.
export default function LenDauTrang() {
    const [phanTram, setPhanTram] = useState(0)
    const [hien, setHien] = useState(false)
    const [chatMo, setChatMo] = useState(false)

    useEffect(() => {
        let cuonTruoc = window.scrollY
        const tinh = () => {
            const el = document.documentElement
            const cuon = el.scrollTop || document.body.scrollTop || 0
            const toiDa = (el.scrollHeight - el.clientHeight) || 1
            setPhanTram(Math.min(100, Math.max(0, (cuon / toiDa) * 100)))
            // Chỉ hiện khi người dùng cuộn NGƯỢC LÊN. Đang cuộn xuống là đang xem hàng —
            // lúc đó nút nổi hay đè lên nút hành động của thẻ (vd "Đặt món" ở /do-an),
            // che mất thao tác chính. Cuộn lên mới là lúc thật sự cần về đầu trang.
            const dangCuonLen = cuon < cuonTruoc - 4
            const dangCuonXuong = cuon > cuonTruoc + 4
            if (dangCuonXuong) setHien(false)
            else if (dangCuonLen && cuon > 400) setHien(true)
            if (cuon <= 400) setHien(false)
            cuonTruoc = cuon
        }
        tinh()
        window.addEventListener('scroll', tinh, { passive: true })
        window.addEventListener('resize', tinh)
        return () => {
            window.removeEventListener('scroll', tinh)
            window.removeEventListener('resize', tinh)
        }
    }, [])

    // Nghe trạng thái mở/đóng của bong bóng chat (BongBongChat phát sự kiện 'chat:mo')
    // để ẩn nút khi panel đang mở (tránh đè lên panel ở góc phải-dưới trên điện thoại).
    useEffect(() => {
        const nghe = (e) => setChatMo(!!e.detail?.mo)
        window.addEventListener('chat:mo', nghe)
        return () => window.removeEventListener('chat:mo', nghe)
    }, [])

    // Trang sản phẩm bật thanh mua dính đáy thì bong bóng chat tự nhấc lên 152px (9.5rem);
    // nút này đứng yên ở 160px nên lọt HẲN vào giữa bong bóng chat — hai nút chồng nhau.
    // Nghe cùng sự kiện 'thanh-mua:hien' mà chat đang nghe để nhấc lên theo.
    const [coThanhMua, setCoThanhMua] = useState(false)
    useEffect(() => {
        const nghe = (e) => setCoThanhMua(!!e.detail?.hien)
        window.addEventListener('thanh-mua:hien', nghe)
        return () => window.removeEventListener('thanh-mua:hien', nghe)
    }, [])

    const an = !hien || chatMo

    return (
        <>
            {/* Thanh tiến trình cuộn ở mép trên cùng */}
            <div className='fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none'>
                <div
                    className='h-full rounded-r-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 transition-[width] duration-150 ease-out'
                    style={{ width: `${phanTram}%` }}
                />
            </div>

            {/* Nút lên đầu trang — điện thoại & máy tính bảng: canh giữa NGAY TRÊN bong bóng chat
                (phải, nằm trên BottomNav); máy tính (lg): góc trái. right-[22px] để tâm nút thẳng
                tâm bong bóng chat (right-4, size-14). */}
            <button
                type='button'
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label='Lên đầu trang'
                className={`fixed z-40 right-[22px] ${coThanhMua ? 'bottom-[calc(14rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(10rem+env(safe-area-inset-bottom))]'} lg:right-auto lg:left-5 lg:bottom-6 flex items-center justify-center size-11 rounded-full bg-white text-slate-600 shadow-lg ring-1 ring-slate-200 hover:text-green-600 hover:ring-green-200 active:scale-90 transition-all duration-300 ${an ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'}`}
            >
                <ArrowUp size={20} />
            </button>
        </>
    )
}
