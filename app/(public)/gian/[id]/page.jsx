'use client'
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import Rating from "@/components/Rating"
import TheSanPham from "@/components/TheSanPham"
import Anh from "@/components/Anh"
import AnhDaiDien from "@/components/AnhDaiDien"
import { useAuth } from "@/components/AuthProvider"
import { useNgonNgu } from "@/lib/i18n"
import { tenDanhMuc } from "@/lib/danhMucSanPham"
import TrangRong from "@/components/TrangRong"
import { ArrowLeft, CheckCircle2, MessageCircle, MessageSquare, Phone, Send, ShoppingBasket, Star, StoreIcon, UserRound } from "lucide-react"

const NHAN_LOAI = {
    cho_tuoi: { ten: ['Chợ Tươi', 'Fresh Market', '鲜市'], anh: '/thuong-hieu/tile-cho-tuoi.webp', mau: '#059669', nen: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' },
    qua_quang_ninh: { ten: ['Quà Quảng Ninh', 'Quang Ninh Gifts', '广宁礼品'], anh: '/thuong-hieu/tile-qua.webp', mau: '#d97706', nen: 'linear-gradient(135deg, #fffbeb, #fef3c7)' },
}

export default function TrangGianHang() {

    const { id } = useParams()
    const router = useRouter()
    const { t } = useNgonNgu()
    const { user } = useAuth() // undefined = đang tải; null = chưa đăng nhập
    const [gian, setGian] = useState(null)
    const [sanPhams, setSanPhams] = useState([])
    const [danhGias, setDanhGias] = useState([])
    const [loading, setLoading] = useState(true)
    const [dangMoChat, setDangMoChat] = useState(false)
    const [dm, setDm] = useState('all') // lọc theo danh mục con của gian

    // Nhắn tin với gian: mở (hoặc tạo) hội thoại rồi vào trang chat
    const nhanTin = async () => {
        if (!user) { router.push(`/login?ve=/gian/${id}`); return }
        setDangMoChat(true)
        try {
            const res = await fetch('/api/tin-nhan/bat-dau', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gianId: id }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Không mở được cuộc trò chuyện', 'Could not start the conversation', '无法开始对话')); return }
            // Mở thẳng bong bóng chat tại chỗ (không rời trang gian)
            window.dispatchEvent(new CustomEvent('mo-hop-chat', { detail: { hoiThoai: data.hoiThoai } }))
        } finally { setDangMoChat(false) }
    }

    // Form đánh giá gian hàng — chỉ khách đã mua & nhận hàng ở gian mới được đánh giá
    const [toiDaDanhGia, setToiDaDanhGia] = useState(false)
    const [coTheDanhGia, setCoTheDanhGia] = useState(false) // đã mua & nhận hàng ở gian này, chưa đánh giá
    const [saoMoi, setSaoMoi] = useState(0)
    const [binhLuanMoi, setBinhLuanMoi] = useState('')
    const [dangGui, setDangGui] = useState(false)

    useEffect(() => {
        if (!id) return
        Promise.all([
            fetch(`/api/store/${id}`).then(r => r.ok ? r.json() : { store: null }),
            fetch(`/api/products?store=${id}`).then(r => r.json()),
            fetch(`/api/ratings?store=${id}`).then(r => r.json()),
        ]).then(([st, sp, dg]) => {
            setGian(st.store)
            setSanPhams(sp.products || [])
            setDanhGias(dg.ratings || [])
            setToiDaDanhGia(!!dg.toiDaDanhGia)
            setCoTheDanhGia(!!dg.coTheDanhGia)
        }).finally(() => setLoading(false))
    }, [id])

    const guiDanhGia = async () => {
        if (!saoMoi) return toast.error(t('Vui lòng chọn số sao', 'Please select a rating', '请选择评分'))
        setDangGui(true)
        try {
            const res = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId: id, sao: saoMoi, binhLuan: binhLuanMoi }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Không gửi được đánh giá', 'Could not submit review', '评价提交失败')); return }
            // Thêm ngay lên đầu danh sách, khỏi tải lại trang
            setDanhGias([{ id: data.rating.id, ten: data.rating.ten, sao: data.rating.sao, binhLuan: data.rating.binhLuan, createdAt: data.rating.createdAt }, ...danhGias])
            setToiDaDanhGia(true)
            setSaoMoi(0)
            setBinhLuanMoi('')
            toast.success(t('Cảm ơn bạn đã đánh giá!', 'Thanks for your review!', '感谢您的评价！'))
        } finally {
            setDangGui(false)
        }
    }

    if (loading) return <Loading />

    // Gian không tồn tại hoặc chưa được duyệt
    if (!gian) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
            <StoreIcon size={48} className="text-slate-300" />
            <h1 className="text-2xl font-semibold text-slate-700 mt-4">{t('Không tìm thấy gian hàng', 'Store not found', '未找到店铺')}</h1>
            <p className="text-slate-500 text-sm mt-2">{t('Gian này không tồn tại hoặc chưa được duyệt hoạt động.', 'This store does not exist or has not been approved.', '该店铺不存在或尚未通过审核。')}</p>
            <Link href="/shop" className="bg-ngoc-500 hover:bg-ngoc-600 transition text-white px-8 py-2.5 rounded-full mt-6 text-sm font-medium">
                {t('Xem chợ', 'Browse market', '逛市场')}
            </Link>
        </div>
    )

    const loai = NHAN_LOAI[gian.loaiGian] || NHAN_LOAI.cho_tuoi
    const trungBinhSao = danhGias.length
        ? Math.round(danhGias.reduce((s, d) => s + d.sao, 0) / danhGias.length * 10) / 10
        : 0
    // Danh mục con thực sự xuất hiện trong sản phẩm của gian (để làm bộ lọc)
    const danhMucCo = [...new Set(sanPhams.map(sp => sp.danhMuc).filter(Boolean))]
    const spHienThi = dm === 'all' ? sanPhams : sanPhams.filter(sp => sp.danhMuc === dm)

    return (
        <div className="min-h-[70vh] mx-6 my-10 mb-28">
            <div className="max-w-6xl mx-auto">

                <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5">
                    <ArrowLeft size={15} /> {t('Về trang chợ', 'Back to market', '返回市场')}
                </Link>

                {/* Đầu trang gian */}
                <div className="rounded-3xl px-6 py-7 sm:px-9 flex max-sm:flex-col sm:items-center gap-5"
                    style={{ background: loai.nen, borderLeft: `5px solid ${loai.mau}` }}>
                    <Anh src={gian.logo} alt={gian.tenGian} className="size-20 sm:size-24 rounded-2xl object-cover ring-2 ring-white shadow-md shrink-0" />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl font-bold text-slate-800">{gian.tenGian}</h1>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold pl-1 pr-3 py-1 rounded-full text-white" style={{ backgroundColor: loai.mau }}>
                                <span className="flex items-center justify-center size-5 rounded-full bg-white shrink-0">
                                    <img src={loai.anh} alt='' className="w-3.5 h-3.5 object-contain" />
                                </span>
                                {t(...loai.ten)}
                            </span>
                            {danhGias.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                    {trungBinhSao} ({danhGias.length})
                                </span>
                            )}
                        </div>
                        <p className="flex items-center gap-1.5 text-sm text-slate-600 mt-1.5"><UserRound size={14} /> {t('Chủ gian:', 'Owner:', '店主：')} {gian.tenChu}</p>
                        <p className="text-sm text-slate-600 mt-2 max-w-2xl">{gian.moTa}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 max-sm:w-full">
                        <button onClick={nhanTin} disabled={dangMoChat}
                            className="flex items-center justify-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full active:scale-95 transition disabled:opacity-60"
                            style={{ backgroundColor: loai.mau }}>
                            <MessageCircle size={15} /> {dangMoChat ? t('Đang mở...', 'Opening...', '打开中...') : t('Nhắn tin với gian', 'Message store', '联系店铺')}
                        </button>
                        <a href={`tel:${gian.soDienThoai}`}
                            className="flex items-center justify-center gap-2 text-sm font-semibold px-6 py-3 rounded-full active:scale-95 transition border"
                            style={{ color: loai.mau, borderColor: loai.mau + '55' }}>
                            <Phone size={15} /> {gian.soDienThoai}
                        </a>
                    </div>
                </div>

                {/* Sản phẩm của gian */}
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700 mt-10 mb-4">
                    <ShoppingBasket size={18} style={{ color: loai.mau }} /> {t('Sản phẩm của gian', 'Store products', '店铺商品')} ({sanPhams.length})
                </h2>

                {/* Lọc theo danh mục con (chỉ hiện khi gian có từ 2 danh mục trở lên) */}
                {danhMucCo.length > 1 && (
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                        <button onClick={() => setDm('all')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${dm === 'all' ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            style={dm === 'all' ? { backgroundColor: loai.mau } : {}}>
                            {t('Tất cả', 'All', '全部')}
                        </button>
                        {danhMucCo.map(id => (
                            <button key={id} onClick={() => setDm(id)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${dm === id ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                style={dm === id ? { backgroundColor: loai.mau } : {}}>
                                {t(...(tenDanhMuc(id) || ['Khác', 'Other', '其他']))}
                            </button>
                        ))}
                    </div>
                )}

                {spHienThi.length ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {spHienThi.map(sp => (
                            <TheSanPham key={sp.id} sp={sp} accentColor={loai.mau} hienGian={false} />
                        ))}
                    </div>
                ) : (
                    <TrangRong Icon={ShoppingBasket} mau={loai.mau}
                        tieuDe={sanPhams.length
                            ? t('Không có sản phẩm trong danh mục này', 'No products in this category', '此分类暂无商品')
                            : t('Gian chưa đăng sản phẩm nào', 'This store has no products yet', '该店铺尚未发布商品')}
                        moTa={sanPhams.length
                            ? t('Chọn danh mục khác để xem thêm hàng của gian.', 'Pick another category to see more from this store.', '选择其他分类查看该店铺更多商品。')
                            : t('Gian mới mở — ghé lại sau hoặc xem các gian khác trên Chợ Số nhé!', 'This store is new — check back later or browse other stores!', '该店铺刚开张 —— 稍后再来或看看其他店铺！')}
                        nutText={sanPhams.length ? undefined : t('Xem gian khác', 'Browse other stores', '看看其他店铺')}
                        nutHref={sanPhams.length ? undefined : '/shop'} />
                )}

                {/* Đánh giá & bình luận về gian */}
                <div className="flex items-center gap-3 flex-wrap mt-14 mb-5">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                        <MessageSquare size={18} style={{ color: loai.mau }} /> {t('Đánh giá & bình luận', 'Reviews & comments', '评价与评论')} ({danhGias.length})
                    </h2>
                    {danhGias.length > 0 && (
                        <span className="flex items-center gap-1 text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                            <Star size={13} className="fill-current" />
                            {trungBinhSao}/5
                        </span>
                    )}
                </div>

                {/* Form đánh giá gian — CHỈ khách đã mua & nhận hàng ở gian mới được đánh giá */}
                <div className="max-w-3xl mb-5">
                    {user === null ? (
                        <p className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                            <Link href={`/login?ve=/gian/${id}`} className="font-semibold underline" style={{ color: loai.mau }}>{t('Đăng nhập', 'Sign in', '登录')}</Link> {t('để đánh giá và bình luận về gian hàng này.', 'to review and comment on this store.', '以评价和评论该店铺。')}
                        </p>
                    ) : toiDaDanhGia ? (
                        <p className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
                            <CheckCircle2 size={16} /> {t('Bạn đã đánh giá gian hàng này — cảm ơn bạn!', 'You have reviewed this store — thank you!', '您已评价该店铺 —— 谢谢！')}
                        </p>
                    ) : coTheDanhGia ? (
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                            <p className="text-sm font-semibold text-slate-700 mb-2">{t('Chia sẻ cảm nhận của bạn', 'Share your thoughts', '分享您的感受')}</p>
                            <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button key={n} type="button" onClick={() => setSaoMoi(n)} aria-label={`${n} sao`}
                                        className="p-0.5 active:scale-90 transition">
                                        <Star size={26}
                                            className={n <= saoMoi ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                    </button>
                                ))}
                                {saoMoi > 0 && <span className="text-sm text-slate-500 ml-2">{saoMoi}/5 {t('sao', 'stars', '星')}</span>}
                            </div>
                            <textarea value={binhLuanMoi} onChange={e => setBinhLuanMoi(e.target.value)} rows={3} maxLength={500}
                                placeholder={t('Bình luận của bạn về gian hàng (không bắt buộc)...', 'Your comment about the store (optional)...', '您对店铺的评论（可选）...')}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-300 resize-none placeholder-slate-400" />
                            <button onClick={guiDanhGia} disabled={dangGui}
                                className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded-full mt-2 active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none"
                                style={{ backgroundColor: loai.mau }}>
                                <Send size={14} /> {dangGui ? t('Đang gửi...', 'Sending...', '提交中...') : t('Gửi đánh giá', 'Submit review', '提交评价')}
                            </button>
                        </div>
                    ) : user ? (
                        <p className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                            <ShoppingBasket size={16} /> {t('Chỉ khách đã mua và nhận hàng ở gian này mới có thể đánh giá.', 'Only customers who purchased and received an order from this store can review it.', '只有在本店购买并收到订单的顾客才能评价。')}
                        </p>
                    ) : null /* user === undefined: đang tải, chưa vẽ form */}
                </div>

                {danhGias.length ? (
                    <div className="flex flex-col gap-3 max-w-3xl">
                        {danhGias.map(dg => (
                            <div key={dg.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <AnhDaiDien src={dg.anhNguoiDung} ten={dg.ten}
                                        khung="size-9 rounded-full bg-slate-100"
                                        chu="text-slate-600 text-sm font-bold uppercase" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-700">{dg.ten}</p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Rating value={dg.sao} />
                                            <span className="text-xs text-slate-400 truncate">
                                                {dg.tenSanPham ? `${t('đã mua', 'bought', '已购买')} ${dg.tenSanPham}` : t('đánh giá gian hàng', 'rated the store', '评价了店铺')} · {new Date(dg.createdAt).toLocaleDateString(t('vi-VN', 'en-US', 'zh-CN'))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {dg.binhLuan && <p className="text-sm text-slate-600 mt-2.5 pl-12">{dg.binhLuan}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm">{t('Gian chưa có đánh giá nào — hãy là người đầu tiên chia sẻ cảm nhận nhé!', 'This store has no reviews yet — be the first to share your thoughts!', '该店铺暂无评价 —— 快来第一个分享感受吧！')}</p>
                )}
            </div>
        </div>
    )
}
