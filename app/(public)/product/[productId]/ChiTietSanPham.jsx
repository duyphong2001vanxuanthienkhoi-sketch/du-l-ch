'use client'
import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useDispatch } from "react-redux"
import toast from "react-hot-toast"
import { ChiTietSanPhamSkeleton } from "@/components/Skeleton"
import Rating from "@/components/Rating"
import Anh from "@/components/Anh"
import AnhDaiDien from "@/components/AnhDaiDien"
import { useAuth } from "@/components/AuthProvider"
import { addToCart } from "@/lib/features/cart/cartSlice"
import { taoKhoaGio } from "@/lib/utils/gioHang"
import { ghiVuaXem } from "@/lib/utils/vuaXem"
import { taiSanPham } from "@/lib/utils/khoSanPham"
import { formatVND, formatSoGon } from "@/lib/utils/currency"
import { useNgonNgu } from "@/lib/i18n"
import { ArrowLeft, BadgeCheck, CheckCircle2, FileText, Maximize2, MessageSquare, PackageIcon, PackageSearch, Send, ShoppingCart, Sparkles, Star, Store, Truck, Users, Zap } from "lucide-react"
import XemAnh from "@/components/XemAnh"
import KhungTrang from "@/components/KhungTrang"
import DaiSanPham from "@/components/DaiSanPham"
import BanVuaXem from "@/components/BanVuaXem"
import MuaKemCungGian from "@/components/MuaKemCungGian"

export default function ChiTietSanPham() {

    const { productId } = useParams()
    const dispatch = useDispatch()
    const router = useRouter()
    const { t } = useNgonNgu()
    const { user } = useAuth() // undefined = đang tải; null = chưa đăng nhập

    const [sp, setSp] = useState(null)
    const [danhGias, setDanhGias] = useState([])
    const [loading, setLoading] = useState(true)
    // Gợi ý (cùng gian / hay mua kèm / có thể bạn cũng thích) — tải RIÊNG, không chặn trang
    const [lienQuan, setLienQuan] = useState({ cungGian: [], muaKem: [], goiY: [] })
    const [dangTaiLienQuan, setDangTaiLienQuan] = useState(true)
    const [spKhamPha, setSpKhamPha] = useState([]) // hàng cho khách khi vào link sản phẩm đã gỡ
    const [anhChon, setAnhChon] = useState(0)
    const [bienTheChon, setBienTheChon] = useState(null) // id phân loại khách đang chọn
    const [moXemAnh, setMoXemAnh] = useState(false)      // lightbox ảnh toàn màn hình
    const nutMuaRef = useRef(null)                        // hàng nút Mua ngay/Thêm giỏ chính
    const [hienThanhMua, setHienThanhMua] = useState(false) // thanh mua thu gọn dính đáy

    // Thanh mua DÍNH ĐÁY: hiện khi hàng nút mua chính đã TRÔI HẲN LÊN TRÊN màn hình
    // (khách đang đọc mô tả/đánh giá — vẫn mua được ngay, khỏi cuộn ngược lên).
    // Dùng scroll listener thay IntersectionObserver: observer bỏ sót khi trang NHẢY
    // thẳng (vd bấm "lên đầu trang") làm nút đi từ trên viewport xuống dưới viewport
    // mà không hề đi qua màn hình -> không có sự kiện giao cắt -> thanh kẹt lại.
    useEffect(() => {
        const tinh = () => {
            const el = nutMuaRef.current
            if (el) setHienThanhMua(el.getBoundingClientRect().bottom < 0)
        }
        tinh()
        window.addEventListener('scroll', tinh, { passive: true })
        window.addEventListener('resize', tinh)
        return () => { window.removeEventListener('scroll', tinh); window.removeEventListener('resize', tinh) }
    }, [sp]) // ref chỉ có sau khi sản phẩm tải xong (trước đó trang còn ở màn Loading)

    // Báo cho bong bóng chat biết thanh mua đang chiếm góc phải-dưới để nó nhường chỗ —
    // hai cái cùng nằm một góc, chat che đúng lên nút "Mua ngay" (đo được: chat 303–359px
    // đè lên nút 235–355px). Mua hàng là việc chính nên chat lùi.
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('thanh-mua:hien', { detail: { hien: hienThanhMua } }))
        return () => window.dispatchEvent(new CustomEvent('thanh-mua:hien', { detail: { hien: false } }))
    }, [hienThanhMua])
    const [dangLup, setDangLup] = useState(false)        // đang rê chuột = bật kính lúp
    const [tamLup, setTamLup] = useState({ x: 50, y: 50 }) // tâm phóng to theo con trỏ (%)

    // Form đánh giá sản phẩm — chỉ khách đã mua & nhận hàng mới được đánh giá
    const [toiDaDanhGia, setToiDaDanhGia] = useState(false)
    const [coTheDanhGia, setCoTheDanhGia] = useState(false) // đã mua & nhận sản phẩm này, chưa đánh giá
    const [saoMoi, setSaoMoi] = useState(0)
    const [binhLuanMoi, setBinhLuanMoi] = useState('')
    const [dangGui, setDangGui] = useState(false)

    useEffect(() => {
        if (!productId) return
        window.scrollTo(0, 0)
        setAnhChon(0)
        setBienTheChon(null)
        Promise.all([
            fetch(`/api/products?id=${productId}`).then(r => r.json()),
            fetch(`/api/ratings?product=${productId}`).then(r => r.json()),
        ]).then(([p, r]) => {
            setSp(p.products?.[0] || null)
            setDanhGias(r.ratings || [])
            setToiDaDanhGia(!!r.toiDaDanhGia)
            setCoTheDanhGia(!!r.coTheDanhGia)
        }).finally(() => setLoading(false))
    }, [productId])

    // Gợi ý tải tách khỏi Promise.all ở trên: khối kia đang giữ màn Loading của CẢ trang,
    // nhét thêm một lượt tính điểm vào đó là bắt khách chờ mới thấy được nút mua.
    useEffect(() => {
        if (!productId) return
        setDangTaiLienQuan(true)
        setLienQuan({ cungGian: [], muaKem: [], goiY: [] })
        fetch(`/api/products/lien-quan?id=${productId}`)
            .then(r => r.json())
            .then(d => setLienQuan({ cungGian: d.cungGian || [], muaKem: d.muaKem || [], goiY: d.goiY || [] }))
            .catch(() => { })
            .finally(() => setDangTaiLienQuan(false))
    }, [productId])

    // Ghi vào "Bạn vừa xem" — chỉ khi sản phẩm CÓ THẬT (link hỏng không làm bẩn danh sách)
    useEffect(() => {
        if (sp?.id) ghiVuaXem(sp.id)
    }, [sp?.id])

    // Vào nhầm link sản phẩm đã gỡ: lấy sẵn ít hàng được khen nhất để trang trống có lối đi tiếp
    useEffect(() => {
        if (loading || sp) return
        taiSanPham()
            .then(sps => {
                const ds = sps
                    .filter(p => p.soLuong > 0)
                    .sort((a, b) => b.trungBinhSao - a.trungBinhSao || b.soDanhGia - a.soDanhGia)
                setSpKhamPha(ds.slice(0, 8))
            })
            .catch(() => { })
    }, [loading, sp])

    const guiDanhGia = async () => {
        if (!saoMoi) return toast.error(t('Vui lòng chọn số sao', 'Please select a rating', '请选择评分'))
        setDangGui(true)
        try {
            const res = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, sao: saoMoi, binhLuan: binhLuanMoi }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Không gửi được đánh giá', 'Could not submit review', '评价提交失败')); return }
            setDanhGias([{ id: data.rating.id, ten: data.rating.ten, sao: data.rating.sao, binhLuan: data.rating.binhLuan, daMua: true, createdAt: data.rating.createdAt }, ...danhGias])
            setToiDaDanhGia(true)
            setSaoMoi(0)
            setBinhLuanMoi('')
            toast.success(t('Cảm ơn bạn đã đánh giá!', 'Thanks for your review!', '感谢您的评价！'))
        } finally {
            setDangGui(false)
        }
    }

    if (loading) return <ChiTietSanPhamSkeleton />

    // Link hỏng/sản phẩm đã gỡ: trước đây là ngõ cụt với đúng một nút "Xem chợ" —
    // giờ mời khách đi tiếp bằng hàng được khen nhất + những món chính họ vừa xem.
    if (!sp) return (
        <KhungTrang rong="vua" className="min-h-[60vh] my-10 mb-28">
            <>
                <div className="flex flex-col items-center justify-center text-center py-10">
                    <PackageIcon size={48} className="text-slate-300" />
                    <h1 className="text-2xl font-semibold text-slate-700 mt-4">{t('Không tìm thấy sản phẩm', 'Product not found', '未找到商品')}</h1>
                    <p className="text-slate-500 text-sm mt-2">{t('Sản phẩm không tồn tại hoặc gian bán đã ngừng hoạt động.', 'This product does not exist or the store has stopped operating.', '该商品不存在或店铺已停止营业。')}</p>
                    <Link href="/shop" className="bg-ngoc-500 hover:bg-ngoc-600 transition text-white px-8 py-2.5 rounded-full mt-6 text-sm font-medium">
                        {t('Xem chợ', 'Browse market', '逛市场')}
                    </Link>
                </div>

                <BanVuaXem className="mt-10" />

                <DaiSanPham
                    tieuDe={t('Đang được khách khen nhiều', 'Loved by our customers', '顾客好评推荐')}
                    moTa={t('Vẫn còn hàng trong chợ hôm nay', 'Still available in the market today', '今日市场仍有货')}
                    Icon={Sparkles} mau="#059669" sps={spKhamPha} kieu="luoi"
                    href="/shop" hrefText={t('Xem tất cả', 'View all', '查看全部')}
                    className="mt-12" />
            </>
        </KhungTrang>
    )

    const mau = sp.loaiGian === 'qua_quang_ninh' ? '#d97706' : '#059669'
    const anhs = sp.anhs?.length ? sp.anhs : (sp.anh ? [sp.anh] : [])
    const coBienThe = Array.isArray(sp.bienThe) && sp.bienThe.length > 0
    const btChon = coBienThe ? sp.bienThe.find(v => v.id === bienTheChon) : null
    const giaHienThi = btChon ? btChon.gia : sp.gia
    const tonHienThi = btChon ? btChon.soLuong : sp.soLuong
    const nhanBienThe = (v) => [v.size, v.mau].filter(Boolean).join(' · ')

    const themVaoGio = () => {
        if (coBienThe && !btChon) return toast.error(t('Vui lòng chọn phân loại (size/màu)', 'Please choose a variant (size/color)', '请选择规格（尺寸/颜色）'))
        if (tonHienThi === 0) return
        dispatch(addToCart({ khoa: taoKhoaGio(sp.id, btChon?.id) }))
        toast.success(`${t('Đã thêm', 'Added', '已添加')} "${sp.ten}${btChon ? ' — ' + nhanBienThe(btChon) : ''}" ${t('vào giỏ', 'to cart', '到购物车')}`)
    }

    // Mua ngay: thêm vào giỏ rồi sang thẳng trang giỏ để đặt (khách & khách vãng lai đều dùng được)
    const muaNgay = () => {
        if (coBienThe && !btChon) return toast.error(t('Vui lòng chọn phân loại (size/màu)', 'Please choose a variant (size/color)', '请选择规格（尺寸/颜色）'))
        if (tonHienThi === 0) return
        dispatch(addToCart({ khoa: taoKhoaGio(sp.id, btChon?.id) }))
        router.push('/cart')
    }

    const hetHang = coBienThe ? (sp.soLuong === 0 || (btChon && tonHienThi === 0)) : sp.soLuong === 0
    // Hết hàng TOÀN BỘ sản phẩm (khác với chỉ một phân loại hết) — mới cần mời hàng thay thế
    const hetSach = sp.soLuong === 0

    // ── Các dải gợi ý ────────────────────────────────────────────────────────────────
    // Ứng viên cho ô "mua kèm": ưu tiên món khách hay mua chung đơn, sau đó là món cùng
    // gian giống nhất. BẮT BUỘC cùng gian — ô đó hứa "giao chung một chuyến", món của gian
    // khác lọt vào là hứa sai. Chỉ nhận món CÒN HÀNG và KHÔNG có phân loại (món có size/màu
    // phải vào trang riêng chọn, tick nhanh ở đây sẽ thêm sai hàng vào giỏ).
    const ungVienMuaKem = [...lienQuan.muaKem, ...lienQuan.cungGian]
        .filter((p, i, ds) => p.storeId === sp.storeId && p.soLuong > 0 && !p.bienThe?.length
            && ds.findIndex(x => x.id === p.id) === i)
        .slice(0, 3)
    const idTrongCum = new Set(ungVienMuaKem.map(p => p.id))
    // Dải "cùng gian" bỏ những món đã nằm trong ô mua kèm ngay phía trên cho khỏi lặp
    const dsCungGian = lienQuan.cungGian.filter(p => !idTrongCum.has(p.id))
    // Món hay mua kèm ở GIAN KHÁC — không gộp được vào một chuyến giao nên đứng riêng thành dải
    const dsMuaKemKhac = lienQuan.muaKem.filter(p => !idTrongCum.has(p.id))
    // Món thay thế khi hết hàng: gộp cả hai nguồn, chỉ lấy hàng còn bán
    const dsThayThe = [...lienQuan.goiY, ...lienQuan.cungGian]
        .filter((p, i, ds) => p.soLuong > 0 && ds.findIndex(x => x.id === p.id) === i)
        .slice(0, 8)

    return (
        <KhungTrang rong="vua" className="min-h-[70vh] my-10 mb-28" style={{ '--mau-khu': mau }}>
            <div style={{ '--mau-khu': mau }}>

                <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
                    <ArrowLeft size={15} /> {t('Về trang chợ', 'Back to market', '返回市场')}
                </Link>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Ảnh */}
                    <div>
                        {/* Rê chuột = kính lúp phóng to tại chỗ (máy tính); bấm = mở lightbox toàn màn hình */}
                        <button type="button" onClick={() => setMoXemAnh(true)}
                            onMouseMove={e => {
                                const r = e.currentTarget.getBoundingClientRect()
                                setTamLup({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
                            }}
                            onMouseEnter={() => setDangLup(true)}
                            onMouseLeave={() => setDangLup(false)}
                            aria-label={t('Phóng to ảnh', 'Zoom image', '放大图片')}
                            className="relative block w-full rounded-3xl overflow-hidden bg-slate-50 aspect-square ring-1 ring-slate-100 cursor-zoom-in">
                            <Anh src={anhs[anhChon] || sp.anh} nho={sp.anhNho?.[anhChon]} alt={sp.ten} uuTien
                                coHienThi="(max-width: 768px) 100vw, 480px"
                                className="w-full h-full object-cover transition-transform duration-200"
                                style={dangLup ? { transform: 'scale(2)', transformOrigin: `${tamLup.x}% ${tamLup.y}%` } : undefined} />
                            {sp.guiDiTinh ? (
                                <span className="absolute top-3 left-3 flex items-center gap-1 text-xs font-semibold text-white bg-amber-500 px-2.5 py-1 rounded-full">
                                    <Truck size={12} /> {t('Gửi đi tỉnh được', 'Ships nationwide', '可寄外省')}
                                </span>
                            ) : (
                                <span className="absolute top-3 left-3 flex items-center gap-1 text-xs font-semibold text-white bg-emerald-600 px-2.5 py-1 rounded-full">
                                    <Zap size={12} /> {t('Giao trong ngày', 'Same-day delivery', '当日送达')}
                                </span>
                            )}
                            {/* Gợi ý bấm để xem ảnh lớn (ẩn khi đang rê kính lúp cho đỡ vướng) */}
                            {!dangLup && (
                                <span className="absolute bottom-3 right-3 flex items-center gap-1 text-ti font-medium text-white bg-slate-900/45 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                    <Maximize2 size={11} /> {t('Bấm để phóng to', 'Tap to zoom', '点击放大')}
                                </span>
                            )}
                        </button>
                        {anhs.length > 1 && (
                            <div className="flex gap-2.5 mt-3 flex-wrap">
                                {anhs.map((a, i) => (
                                    <button key={i} onClick={() => setAnhChon(i)} type="button"
                                        className={`size-16 rounded-xl overflow-hidden ring-2 transition ${i === anhChon ? '' : 'ring-transparent opacity-70 hover:opacity-100'}`}
                                        style={i === anhChon ? { boxShadow: `0 0 0 2px ${mau}` } : {}}>
                                        <Anh src={a} nho={sp.anhNho?.[i]} coHienThi="64px" alt={`${sp.ten} ${i + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Thông tin */}
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{sp.ten}</h1>

                        <div className="flex items-center gap-2 mt-2">
                            <Rating value={Math.round(sp.trungBinhSao)} />
                            <span className="text-sm text-slate-500">
                                {sp.soDanhGia > 0 ? `${sp.trungBinhSao}/5 (${sp.soDanhGia} ${t('đánh giá', 'reviews', '条评价')})` : t('Chưa có đánh giá', 'No reviews yet', '暂无评价')}
                                {sp.daBan > 0 && ` · ${t('Đã bán', 'Sold', '已售')} ${formatSoGon(sp.daBan)}`}
                            </span>
                        </div>

                        <Link href={`/gian/${sp.storeId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 hover:underline mt-2">
                            <Store size={14} /> {sp.tenGian}
                        </Link>

                        <div className="flex items-end gap-3 flex-wrap mt-4">
                            <p className="mau-khu text-3xl font-bold so-tien">
                                {coBienThe && !btChon ? `${t('từ', 'from', '起')} ${formatVND(sp.gia)}` : formatVND(giaHienThi)}
                            </p>
                            {/* Khuyến mãi: giá gốc gạch ngang + nhãn giảm % */}
                            {sp.giaGoc > sp.gia && (
                                <>
                                    <span className="text-lg text-slate-400 line-through so-tien">{formatVND(sp.giaGoc)}</span>
                                    <span className="text-xs font-bold text-white bg-rose-500 px-2 py-1 rounded-full so-tien">
                                        -{Math.round((1 - sp.gia / sp.giaGoc) * 100)}%
                                    </span>
                                </>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            {coBienThe && !btChon
                                ? (sp.soLuong > 0 ? t('Chọn phân loại bên dưới để đặt mua', 'Choose a variant below to order', '请在下方选择规格下单') : t('Đã hết hàng', 'Out of stock', '已售罄'))
                                : (tonHienThi > 0 ? `${t('Còn', 'In stock:', '库存')} ${tonHienThi} ${t('sản phẩm', 'left', '件')}` : t('Đã hết hàng', 'Out of stock', '已售罄'))}
                        </p>

                        {/* Chọn phân loại (size/màu) */}
                        {coBienThe && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-slate-600 mb-2">{t('Chọn phân loại', 'Choose a variant', '选择规格')}</p>
                                <div className="flex flex-wrap gap-2">
                                    {sp.bienThe.map(v => {
                                        const chon = v.id === bienTheChon
                                        const het = (v.soLuong || 0) === 0
                                        return (
                                            <button key={v.id} type="button" disabled={het}
                                                onClick={() => setBienTheChon(v.id)}
                                                className={`px-3.5 py-2 rounded-xl text-sm border-2 transition text-left ${chon ? 'text-white' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'} ${het ? 'opacity-40 line-through pointer-events-none' : ''}`}
                                                style={chon ? { backgroundColor: mau, borderColor: mau } : {}}>
                                                <span className="font-medium">{nhanBienThe(v)}</span>
                                                <span className={`block text-xs ${chon ? 'text-white/85' : 'text-slate-400'}`}>{formatVND(v.gia)}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Nút hành động — điện thoại & tablet chia đôi hàng cho dễ bấm bằng ngón cái.
                            Chỉ từ lg mới để nút co về đúng bề ngang chữ: trước đây mốc là sm nên ở
                            khổ 640–1023px hai nút giữ nguyên bề ngang thật (~400px) trong khi cột
                            chỉ rộng ~350px → thò ra ngoài, kéo ngang cả trang 33px. */}
                        <div ref={nutMuaRef} className="flex items-stretch gap-3 mt-7" style={{ '--mau-nut': mau }}>
                            <button
                                onClick={muaNgay}
                                disabled={hetHang}
                                className="nut-chinh group flex-1 lg:flex-none flex items-center justify-center gap-2 text-white font-semibold px-6 lg:px-10 py-3.5 rounded-full sm:whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0 active:scale-[.97] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none">
                                <Zap size={17} className="relative z-10 transition-transform group-hover:scale-110" />
                                <span className="relative z-10">{t('Mua ngay', 'Buy now', '立即购买')}</span>
                            </button>
                            <button
                                onClick={themVaoGio}
                                disabled={hetHang}
                                className="nut-vien mau-khu vien-mau-khu group flex-1 lg:flex-none flex items-center justify-center gap-2 font-semibold px-6 lg:px-8 py-3.5 rounded-full border-2 sm:whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0 active:scale-[.97] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none">
                                <ShoppingCart size={17} className="transition-transform group-hover:scale-110" />
                                {t('Thêm vào giỏ', 'Add to cart', '加入购物车')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hết hàng thì trang này là ngõ cụt (hai nút mua đều mờ) — mời ngay hàng
                    tương tự CÒN BÁN, đặt sát dưới khối mua cho khách khỏi phải cuộn tìm. */}
                {hetSach && (
                    <DaiSanPham
                        tieuDe={t('Sản phẩm tương tự còn hàng', 'Similar items in stock', '相似商品·有货')}
                        moTa={t('Món này đã hết — vài gợi ý gần giống đang còn bán', 'This one is sold out — a few close matches still available', '该商品已售罄 —— 以下相似商品仍有货')}
                        Icon={PackageSearch} mau={mau} sps={dsThayThe} dangTai={dangTaiLienQuan}
                        className="mt-10" />
                )}

                {/* Mô tả sản phẩm — section riêng, giữ xuống dòng (kiểu Shopee): mô tả TRƯỚC, đánh giá SAU */}
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700 mt-14 mb-4">
                    <FileText size={18} className="mau-khu" /> {t('Mô tả sản phẩm', 'Product description', '商品描述')}
                </h2>
                <div className="max-w-3xl bg-white border border-slate-100 rounded-2xl p-5 text-slate-600 leading-relaxed whitespace-pre-line">
                    {sp.moTa?.trim() || t('Người bán chưa thêm mô tả cho sản phẩm này.', 'The seller has not added a description yet.', '卖家尚未添加商品描述。')}
                </div>

                {/* Gợi ý CÙNG GIAN đặt ngay sau mô tả, TRƯỚC danh sách đánh giá: khách vừa đọc
                    xong mô tả là lúc đang quyết định, để sau list đánh giá dài là chôn mất. */}
                {/* Chỉ dựng ô mua kèm KHI đã có dữ liệu gợi ý: mấy ô tick mặc định được chọn
                    ngay lúc dựng, dựng sớm lúc danh sách còn rỗng thì chẳng tick được món nào.
                    key theo id để đổi sang sản phẩm khác là chọn lại từ đầu, không dính món cũ. */}
                {!hetSach && !dangTaiLienQuan && ungVienMuaKem.length > 0 && (
                    <MuaKemCungGian key={sp.id} spGoc={sp} ungVien={ungVienMuaKem} mau={mau} />
                )}

                <DaiSanPham
                    tieuDe={t('Khách hay mua kèm', 'Frequently bought together', '常一起购买')}
                    moTa={t('Từ những đơn đã đặt thật ở chợ', 'Based on real orders placed in the market', '来自市场真实订单')}
                    Icon={Users} mau={mau} sps={dsMuaKemKhac} toiThieu={1}
                    className="mt-12" />

                <DaiSanPham
                    tieuDe={`${t('Cũng bán tại', 'Also from', '同店在售')} ${sp.tenGian}`}
                    moTa={t('Gom chung một đơn, gian giao cùng một chuyến', 'Order together — the stall delivers them in one trip', '合并下单，同店一趟送达')}
                    Icon={Store} mau={mau} sps={dsCungGian} dangTai={dangTaiLienQuan}
                    href={`/gian/${sp.storeId}`} hrefText={t('Xem gian', 'Visit stall', '逛店铺')}
                    className="mt-12" />

                {/* Đánh giá & bình luận */}
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700 mt-14 mb-5">
                    <MessageSquare size={18} className="mau-khu" /> {t('Đánh giá & bình luận', 'Reviews & comments', '评价与评论')} ({danhGias.length})
                </h2>

                {/* Form đánh giá sản phẩm — CHỈ khách đã mua & nhận sản phẩm mới được đánh giá */}
                <div className="max-w-3xl mb-5">
                    {user === null ? (
                        <p className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                            <Link href={`/login?ve=/product/${productId}`} className="mau-khu font-semibold underline">{t('Đăng nhập', 'Sign in', '登录')}</Link> {t('để đánh giá và bình luận về sản phẩm này.', 'to review and comment on this product.', '以评价和评论该商品。')}
                        </p>
                    ) : toiDaDanhGia ? (
                        <p className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
                            <CheckCircle2 size={16} /> {t('Bạn đã đánh giá sản phẩm này — cảm ơn bạn!', 'You have reviewed this product — thank you!', '您已评价该商品 —— 谢谢！')}
                        </p>
                    ) : coTheDanhGia ? (
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                            <p className="text-sm font-semibold text-slate-700 mb-2">{t('Chia sẻ cảm nhận về sản phẩm', 'Share your thoughts on this product', '分享您对商品的感受')}</p>
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
                                placeholder={t('Bình luận của bạn về sản phẩm (không bắt buộc)...', 'Your comment about the product (optional)...', '您对商品的评论（可选）...')}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-300 resize-none placeholder-slate-400" />
                            <button onClick={guiDanhGia} disabled={dangGui}
                                className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded-full mt-2 active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none"
                                style={{ backgroundColor: mau }}>
                                <Send size={14} /> {dangGui ? t('Đang gửi...', 'Sending...', '提交中...') : t('Gửi đánh giá', 'Submit review', '提交评价')}
                            </button>
                        </div>
                    ) : user ? (
                        <p className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                            <ShoppingCart size={16} /> {t('Chỉ khách đã mua và nhận sản phẩm này mới có thể đánh giá.', 'Only customers who purchased and received this product can review it.', '只有购买并收到此商品的顾客才能评价。')}
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
                                    <div>
                                        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                                            {dg.ten}
                                            {dg.daMua && (
                                                <span className="flex items-center gap-0.5 text-ti font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                    <BadgeCheck size={12} /> {t('đã mua hàng', 'verified buyer', '已购买')}
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Rating value={dg.sao} />
                                            <span className="text-xs text-slate-400">{new Date(dg.createdAt).toLocaleDateString(t('vi-VN', 'en-US', 'zh-CN'))}</span>
                                        </div>
                                    </div>
                                </div>
                                {dg.binhLuan && <p className="text-sm text-slate-600 mt-2.5 pl-12">{dg.binhLuan}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm">{t('Chưa có đánh giá nào — hãy là người đầu tiên chia sẻ cảm nhận nhé!', 'No reviews yet — be the first to share your thoughts!', '暂无评价 —— 快来第一个分享感受吧！')}</p>
                )}

                {/* Bãi đáp cuối trang: khách đọc hết mà chưa chốt thì có đường đi tiếp,
                    khỏi phải bấm Back. Hàng hết sạch đã có dải thay thế ở trên nên bỏ qua. */}
                {!hetSach && (
                    <DaiSanPham
                        tieuDe={t('Có thể bạn cũng thích', 'You may also like', '你可能也喜欢')}
                        Icon={Sparkles} mau={mau} sps={lienQuan.goiY} kieu="luoi"
                        dangTai={dangTaiLienQuan} soKhungCho={4}
                        href="/shop" hrefText={t('Xem tất cả', 'View all', '查看全部')} />
                )}

                <BanVuaXem boQuaId={sp.id} mau={mau} />
            </div>

            {/* Thanh mua THU GỌN dính đáy — hiện khi cuộn qua nút mua chính, để khách đọc
                mô tả/đánh giá xong mua được ngay không phải cuộn ngược. Vị trí né thanh
                điều hướng dưới trên điện thoại (mẫu giống thanh "Đặt món" của quán ăn). */}
            {hienThanhMua && !hetHang && (
                // Thanh ĐẶC trải hết chiều ngang, dính SÁT trên thanh điều hướng (bottom-14 =
                // đúng chiều cao BottomNav) — bản trước là viên thuốc bo tròn đặt bottom-20 nên
                // hở một khe ~17px, trôi lơ lửng giữa khoảng trống, nhìn "thập thò".
                <div className='thanh-mua-vao fixed z-40 inset-x-0 bottom-16 lg:bottom-0 bg-white border-t border-slate-100 shadow-[0_-8px_28px_-12px_rgba(11,47,79,.3)] px-4 py-2.5 flex items-center gap-3'
                    style={{ '--mau-nut': mau, '--mau-khu': mau, paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}>
                    <Anh src={sp.anh} nho={sp.anhNho?.[0]} coHienThi="44px" alt='' fade={false} className='size-11 rounded-xl object-cover shrink-0' />
                    <div className='min-w-0 flex-1'>
                        <p className='text-ti text-slate-500 truncate leading-tight'>{sp.ten}</p>
                        <p className='mau-khu font-bold so-tien leading-tight'>
                            {coBienThe && !btChon ? `${t('từ', 'from', '起')} ${formatVND(sp.gia)}` : formatVND(giaHienThi)}
                        </p>
                    </div>
                    <button onClick={themVaoGio} aria-label={t('Thêm vào giỏ', 'Add to cart', '加入购物车')}
                        className='mau-khu vien-mau-khu flex items-center justify-center gap-1.5 border-2 bg-white rounded-full size-11 sm:size-auto sm:px-4 sm:py-2.5 text-sm font-semibold active:scale-95 transition shrink-0'>
                        <ShoppingCart size={17} /> <span className='max-sm:hidden'>{t('Thêm giỏ', 'Add', '加入')}</span>
                    </button>
                    <button onClick={muaNgay}
                        className='nut-chinh flex items-center gap-1.5 text-white rounded-full px-5 py-2.5 text-sm font-semibold active:scale-95 transition shrink-0'>
                        <Zap size={16} className='relative z-10' /> <span className='relative z-10'>{t('Mua ngay', 'Buy now', '立即购买')}</span>
                    </button>
                </div>
            )}

            {/* Lightbox xem ảnh to — mở khi bấm vào ảnh sản phẩm */}
            {moXemAnh && (
                <XemAnh anhs={anhs.length ? anhs : [sp.anh]} chiSo={anhChon} ten={sp.ten}
                    onDong={() => setMoXemAnh(false)} />
            )}
        </KhungTrang>
    )
}
