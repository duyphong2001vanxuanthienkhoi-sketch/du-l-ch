'use client'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { PackagePlus, ShoppingCart } from 'lucide-react'
import Anh from './Anh'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { taoKhoaGio } from '@/lib/utils/gioHang'
import { formatVND } from '@/lib/utils/currency'
import { useNgonNgu } from '@/lib/i18n'

// Ô "MUA KÈM CÙNG GIAN" — tick vài món của CHÍNH gian đang xem rồi thêm cả cụm vào giỏ
// bằng một nút. Giá trị thật ở chợ này: cùng gian = gom được vào một chuyến giao, khách
// nhận cùng lúc (app không thu phí giao nên KHÔNG hứa "tiết kiệm ship" — nói đúng cái có).
//
// Chỉ nhận món ĐƠN GIẢN (không có size/màu) và CÒN HÀNG: món có phân loại phải vào trang
// riêng chọn size/màu, tick ở đây sẽ thêm sai hàng vào giỏ.
//
// Mặc định chỉ tick sẵn sản phẩm đang xem + MỘT món kèm đầu tiên — không tick sẵn tất cả
// để tổng tiền hiện ra là con số khách thật sự định trả.
export default function MuaKemCungGian({ spGoc, ungVien = [], mau = '#059669' }) {
    const dispatch = useDispatch()
    const { t } = useNgonNgu()

    const coBienThe = spGoc.bienThe?.length > 0
    // Sản phẩm đang xem chỉ vào được cụm khi nó không có phân loại và còn hàng
    const themDuocGoc = !coBienThe && spGoc.soLuong > 0
    const mon = [
        ...(themDuocGoc ? [{ ...spGoc, laGoc: true }] : []),
        ...ungVien.slice(0, 3),
    ]

    const [chon, setChon] = useState(() => new Set(
        [themDuocGoc ? spGoc.id : null, ungVien[0]?.id].filter(Boolean)
    ))
    const [dangThem, setDangThem] = useState(false)

    if (mon.length < 2) return null // một mình sản phẩm đang xem thì không thành "cụm"

    const doi = (id) => setChon(cu => {
        const moi = new Set(cu)
        moi.has(id) ? moi.delete(id) : moi.add(id)
        return moi
    })

    const daChon = mon.filter(m => chon.has(m.id))
    const tong = daChon.reduce((s, m) => s + (Number(m.gia) || 0), 0)

    const themCaCum = () => {
        if (!daChon.length) return
        setDangThem(true)
        try {
            daChon.forEach(m => dispatch(addToCart({ khoa: taoKhoaGio(m.id) })))
            toast.success(`${t('Đã thêm', 'Added', '已添加')} ${daChon.length} ${t('món vào giỏ', 'items to cart', '件商品到购物车')}`)
        } finally {
            setDangThem(false)
        }
    }

    return (
        <section className='mt-12 max-w-3xl'>
            <div className='bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm' style={{ '--mau-nut': mau, '--mau-khu': mau }}>
                <h2 className='flex items-center gap-2 text-base font-semibold text-slate-700'>
                    <PackagePlus size={18} className='mau-khu shrink-0' />
                    {t('Mua kèm cùng gian', 'Add from the same stall', '同店搭配')}
                </h2>
                <p className='text-xs text-slate-500 mt-0.5'>
                    {t(`Cùng ${spGoc.tenGian} — gom vào một đơn, giao chung một chuyến và nhận cùng lúc.`,
                        `All from ${spGoc.tenGian} — one order, one delivery trip, arrives together.`,
                        `均来自 ${spGoc.tenGian} —— 合并成一单，一趟送达。`)}
                </p>

                <div className='divide-y divide-slate-100 mt-3'>
                    {mon.map(m => {
                        const daTick = chon.has(m.id)
                        return (
                            <label key={m.id} className='flex items-center gap-3 py-2.5 cursor-pointer group'>
                                <input type='checkbox' checked={daTick} onChange={() => doi(m.id)}
                                    className='size-4 shrink-0 rounded cursor-pointer' style={{ accentColor: mau }} />
                                <Anh src={m.anh} nho={m.anhNho?.[0]} coHienThi="48px" alt={m.ten} fade={false}
                                    className={`size-12 rounded-xl object-cover ring-1 ring-slate-100 shrink-0 transition ${daTick ? '' : 'opacity-50 grayscale'}`} />
                                <div className='min-w-0 flex-1'>
                                    <p className={`text-sm line-clamp-1 transition ${daTick ? 'text-slate-700' : 'text-slate-400'}`}>{m.ten}</p>
                                    {m.laGoc ? (
                                        <span className='inline-block text-ti font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-0.5'>
                                            {t('Sản phẩm này', 'This item', '当前商品')}
                                        </span>
                                    ) : m.soLanMuaKem > 0 ? (
                                        <span className='nhan-mau-khu inline-block text-ti font-medium px-2 py-0.5 rounded-full mt-0.5'>
                                            {t('khách hay mua kèm', 'often bought together', '常一起购买')}
                                        </span>
                                    ) : null}
                                </div>
                                <p className={`so-tien font-semibold text-sm shrink-0 transition ${daTick ? 'text-slate-700' : 'text-slate-400'}`}>{formatVND(m.gia)}</p>
                            </label>
                        )
                    })}
                </div>

                {/* Trên điện thoại XẾP DỌC: để cùng hàng thì nút ("Thêm 3 món vào giỏ" tiếng Việt
                    ~200px) cộng số tổng (~100px) vượt quá bề ngang ô (~287px ở máy 375px) — nút
                    có nền đặc nên vẽ ĐÈ lên số tiền, đọc ra "800.0000". Từ sm mới xếp ngang. */}
                <div className='flex max-sm:flex-col max-sm:items-stretch items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100'>
                    <div className='min-w-0'>
                        <p className='text-xs text-slate-500'>
                            {daChon.length > 0
                                ? `${t('Tổng', 'Total for', '合计')} ${daChon.length} ${t('món', 'items', '件')}`
                                : t('Chưa chọn món nào', 'Nothing selected', '未选择商品')}
                        </p>
                        <p className='mau-khu text-xl font-bold so-tien'>{formatVND(tong)}</p>
                    </div>
                    <button onClick={themCaCum} disabled={!daChon.length || dangThem}
                        className='nut-chinh flex items-center justify-center gap-2 text-white text-sm font-semibold px-5 py-3 rounded-full active:scale-95 transition shrink-0 disabled:opacity-40 disabled:pointer-events-none'>
                        <ShoppingCart size={16} className='relative z-10' />
                        <span className='relative z-10'>
                            {daChon.length > 1
                                ? `${t('Thêm', 'Add', '添加')} ${daChon.length} ${t('món vào giỏ', 'items to cart', '件到购物车')}`
                                : t('Thêm vào giỏ', 'Add to cart', '加入购物车')}
                        </span>
                    </button>
                </div>
            </div>
        </section>
    )
}
