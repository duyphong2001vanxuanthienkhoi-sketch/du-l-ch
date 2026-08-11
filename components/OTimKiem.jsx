'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Store } from 'lucide-react'
import Anh from '@/components/Anh'
import { formatVND } from '@/lib/utils/currency'
import { boDau } from '@/lib/utils/chuoi'
import { useNgonNgu } from '@/lib/i18n'
import { taiSanPham } from '@/lib/utils/khoSanPham'

// Ô TÌM KIẾM CÓ GỢI Ý — dùng ở cả hai chỗ trong Navbar (hàng menu máy tính và hàng riêng
// của điện thoại/máy tính bảng).
//
// Trước đây app có HAI kiểu tìm khác nhau cho cùng một việc: ô ở Navbar phải bấm Enter rồi
// nhảy sang /shop, còn ô ở /shop lọc ngay khi gõ. Giờ gõ tới đâu gợi ý tới đó, bấm vào một
// gợi ý là vào thẳng sản phẩm/gian — vẫn Enter được để xem toàn bộ kết quả ở trang chợ.
//
// Dữ liệu lấy qua kho sản phẩm dùng chung (lib/utils/khoSanPham): cả hai ô tìm và các
// trang khác xài chung MỘT bản, và chỉ tải khi khách thật sự bấm vào ô — không tải sẵn
// cho mọi khách chỉ đi lướt.

const TOI_DA_SP = 5
const TOI_DA_GIAN = 3

export default function OTimKiem({ lopNgoai = '', lopO = '', goiY = '', tuDong = false }) {
    const router = useRouter()
    const { t } = useNgonNgu()

    const [tu, setTu] = useState('')
    const [sanPhams, setSanPhams] = useState([])
    const [mo, setMo] = useState(false)
    const [chon, setChon] = useState(-1) // chỉ số đang chọn bằng phím mũi tên (-1 = chưa chọn)
    const boc = useRef(null)

    // Bấm ra ngoài thì đóng bảng gợi ý
    useEffect(() => {
        const dong = (e) => { if (boc.current && !boc.current.contains(e.target)) setMo(false) }
        document.addEventListener('mousedown', dong)
        return () => document.removeEventListener('mousedown', dong)
    }, [])

    const nhanO = () => { taiSanPham().then(setSanPhams) }

    const q = boDau(tu.trim())
    const spHop = q ? sanPhams.filter(sp => boDau(`${sp.ten} ${sp.tenGian}`).includes(q)) : []
    const dsSp = spHop.slice(0, TOI_DA_SP)

    // Gian hàng suy ra từ chính danh sách sản phẩm (khỏi gọi thêm API): mỗi gian một dòng,
    // chỉ lấy gian có TÊN khớp từ khoá — gian khớp nhờ tên sản phẩm thì đã hiện ở trên rồi.
    const dsGian = []
    if (q) {
        const daCo = new Set()
        for (const sp of sanPhams) {
            if (daCo.has(sp.storeId) || !boDau(sp.tenGian).includes(q)) continue
            daCo.add(sp.storeId)
            dsGian.push({ id: sp.storeId, ten: sp.tenGian, loaiGian: sp.loaiGian })
            if (dsGian.length >= TOI_DA_GIAN) break
        }
    }

    const muc = [
        ...dsSp.map(sp => ({ loai: 'sp', sp, href: `/product/${sp.id}` })),
        ...dsGian.map(g => ({ loai: 'gian', g, href: `/gian/${g.id}` })),
    ]
    const hienBang = mo && q.length > 0

    const diToiChoTim = () => {
        if (!tu.trim()) return
        setMo(false)
        router.push(`/shop?search=${encodeURIComponent(tu.trim())}`)
    }

    const bamPhim = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setChon(i => Math.min(i + 1, muc.length - 1)); return }
        if (e.key === 'ArrowUp') { e.preventDefault(); setChon(i => Math.max(i - 1, -1)); return }
        if (e.key === 'Escape') { setMo(false); return }
        if (e.key === 'Enter') {
            e.preventDefault()
            // Đang trỏ vào một gợi ý thì vào thẳng nó; không thì xem toàn bộ kết quả ở trang chợ
            if (chon >= 0 && muc[chon]) { setMo(false); router.push(muc[chon].href) }
            else diToiChoTim()
        }
    }

    return (
        <div ref={boc} className={`relative ${lopNgoai}`}>
            <form onSubmit={(e) => { e.preventDefault(); diToiChoTim() }}
                className={`flex items-center gap-2 bg-slate-100 rounded-full ${lopO}`}>
                <Search size={18} className='text-slate-500 shrink-0' />
                <input
                    value={tu}
                    autoFocus={tuDong}
                    // Gọi nhanO ở CẢ onChange: có bàn phím ảo/trình duyệt tự điền không bắn
                    // focus như mong đợi, gõ rồi mà chưa có dữ liệu thì bảng hiện "không có
                    // gợi ý" dù thực ra chỉ là chưa tải.
                    onChange={(e) => { nhanO(); setTu(e.target.value); setMo(true); setChon(-1) }}
                    onFocus={() => { nhanO(); setMo(true) }}
                    onKeyDown={bamPhim}
                    placeholder={goiY || t('Tìm sản phẩm, gian hàng...', 'Search products, stores...', '搜索商品、店铺...')}
                    className='w-full bg-transparent outline-none text-sm placeholder-slate-500'
                    aria-label={t('Tìm kiếm', 'Search', '搜索')}
                    aria-expanded={hienBang}
                />
            </form>

            {hienBang && (
                <div className='absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 z-50 overflow-hidden'>
                    {muc.length === 0 ? (
                        <p className='px-4 py-3 text-sm text-slate-400'>
                            {t('Không có gợi ý nào', 'No suggestions', '没有建议')}
                        </p>
                    ) : (
                        <>
                            {dsSp.map((sp, i) => (
                                <button key={sp.id} type='button'
                                    onMouseEnter={() => setChon(i)}
                                    onClick={() => { setMo(false); router.push(`/product/${sp.id}`) }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-left ${chon === i ? 'bg-slate-50' : ''}`}>
                                    <Anh src={sp.anh} nho={sp.anhNho?.[0]} coHienThi='40px' alt=''
                                        className='size-10 rounded-lg object-cover shrink-0 ring-1 ring-slate-100' />
                                    <span className='min-w-0 flex-1'>
                                        <span className='block text-sm text-slate-700 truncate'>{sp.ten}</span>
                                        <span className='block text-xs text-slate-400 truncate'>{sp.tenGian}</span>
                                    </span>
                                    <span className='so-tien text-sm font-semibold text-slate-700 shrink-0'>{formatVND(sp.gia)}</span>
                                </button>
                            ))}
                            {dsGian.map((g, j) => {
                                const i = dsSp.length + j
                                return (
                                    <button key={g.id} type='button'
                                        onMouseEnter={() => setChon(i)}
                                        onClick={() => { setMo(false); router.push(`/gian/${g.id}`) }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-left ${chon === i ? 'bg-slate-50' : ''}`}>
                                        <span className='flex items-center justify-center size-10 rounded-lg bg-slate-100 text-slate-500 shrink-0'>
                                            <Store size={16} />
                                        </span>
                                        <span className='min-w-0 flex-1'>
                                            <span className='block text-sm text-slate-700 truncate'>{g.ten}</span>
                                            <span className='block text-xs text-slate-400'>{t('Gian hàng', 'Store', '店铺')}</span>
                                        </span>
                                    </button>
                                )
                            })}
                            <button type='button' onClick={diToiChoTim}
                                className='w-full text-left px-4 py-2.5 mt-1 border-t border-slate-100 text-sm font-semibold text-ngoc-600 hover:bg-slate-50'>
                                {t('Xem tất cả kết quả cho', 'See all results for', '查看全部结果')} "{tu.trim()}"
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
