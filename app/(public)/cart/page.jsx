'use client'
import Counter from "@/components/Counter";
import PageTitle from "@/components/PageTitle";
import { clearCart, deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { phanTichKhoaGio } from "@/lib/utils/gioHang";
import { formatVND } from "@/lib/utils/currency";
import { Car, CheckCircle2, MapPin, Phone, ShoppingBag, Store, TicketPercent, Trash2Icon, Truck, UserRound, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AuthProvider";
import { useNgonNgu } from "@/lib/i18n";
import Anh from "@/components/Anh";
import TrangRong from "@/components/TrangRong";
import DaiSanPham from "@/components/DaiSanPham";
import BanVuaXem from "@/components/BanVuaXem";
import KhungTrang from "@/components/KhungTrang";
import { taiSanPham } from "@/lib/utils/khoSanPham";
import { BangDoiTacGreenSM, NutGoiGreenSM } from "@/components/GreenSM";

// Nhãn dịch cho hình thức giao (mảng ngoài component → dịch tại render theo id)
const HINH_THUC = [
    { id: 'giao_nhanh', ten: ['Giao nhanh trong ngày', 'Same-day delivery', '当日速送'], moTa: ['Đồ tươi sống — nội thành Hạ Long', 'Fresh goods — within Ha Long city', '生鲜 —— 下龙市区内'], Icon: Zap },
    { id: 'gui_xa', ten: ['Gửi đi xa', 'Ship far', '远程寄送'], moTa: ['Đồ khô, quà lưu niệm — gửi toàn quốc', 'Dry goods, souvenirs — nationwide', '干货、纪念品 —— 全国寄送'], Icon: Truck },
    { id: 'xanh_sm', ten: ['Giao hàng qua Green SM', 'Delivery via Green SM', '通过 Green SM 配送'], moTa: ['Xe điện Green SM giao tận nơi — nội thành', 'Green SM electric delivery in the city', 'Green SM 电动车送货上门 —— 市区内'], Icon: Car },
]

export default function Cart() {

    const { cartItems } = useSelector(state => state.cart);
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { t } = useNgonNgu();

    const [sanPhams, setSanPhams] = useState([]); // toàn bộ sản phẩm thật đang bán
    const [form, setForm] = useState({ ten: '', soDienThoai: '', diaChi: '' });
    const [hinhThucGiao, setHinhThucGiao] = useState('giao_nhanh');
    const [dangDat, setDangDat] = useState(false);
    const nutDatRef = useRef(null);            // nút "Đặt đơn" thật ở cuối form
    const [hienThanhDat, setHienThanhDat] = useState(false); // thanh chốt đơn thu gọn dính đáy
    const [donThanhCong, setDonThanhCong] = useState(null);
    const [maCode, setMaCode] = useState('');
    const [maApDung, setMaApDung] = useState(null); // { code, moTa, phanTramGiam, donToiThieu }
    const [dangKiemMa, setDangKiemMa] = useState(false);

    useEffect(() => {
        taiSanPham().then(setSanPhams);
    }, []);

    // Điền sẵn tên khi đã đăng nhập — chỉ khi ô tên còn trống (không đè tên khách đang gõ)
    useEffect(() => {
        if (user?.name) setForm(f => f.ten ? f : ({ ...f, ten: user.name }));
    }, [user]);

    // Ghép giỏ (khóa dòng -> số lượng) với dữ liệu sản phẩm thật.
    // Khóa dòng có thể kèm phân loại (size/màu) -> lấy đúng giá & tồn của phân loại đó.
    const gio = useMemo(() => {
        return Object.entries(cartItems).map(([khoa, soLuong]) => {
            const { productId, bienTheId } = phanTichKhoaGio(khoa);
            const sp = sanPhams.find(p => p.id === productId);
            if (!sp) return null;
            let gia = sp.gia, ton = sp.soLuong, bienTheNhan = '';
            if (bienTheId) {
                const bt = (sp.bienThe || []).find(v => v.id === bienTheId);
                if (!bt) return null; // phân loại không còn -> bỏ khỏi giỏ hiển thị
                gia = bt.gia; ton = bt.soLuong;
                bienTheNhan = [bt.size, bt.mau].filter(Boolean).join(' · ');
            }
            return {
                khoa, id: productId, bienTheId, bienTheNhan,
                ten: sp.ten, anh: sp.anh, anhNho: sp.anhNho?.[0], storeId: sp.storeId, tenGian: sp.tenGian, guiDiTinh: sp.guiDiTinh,
                gia, ton, soLuongTrongGio: soLuong,
            };
        }).filter(Boolean);
    }, [cartItems, sanPhams]);

    const tongTien = gio.reduce((s, it) => s + it.gia * it.soLuongTrongGio, 0);
    const doTuoiTrongGio = gio.filter(it => !it.guiDiTinh);

    // "Mua thêm ở gian bạn đang đặt" — hàng của CHÍNH những gian đã có trong giỏ, nên thêm
    // vào đây là gom được vào cùng chuyến giao. Tính tại chỗ từ `sanPhams` (trang này vốn
    // đã tải cả chợ để dựng giỏ) nên không tốn thêm một lượt gọi API nào.
    const goiYThemVaoGio = useMemo(() => {
        if (!gio.length || !sanPhams.length) return [];
        const gianTrongGio = new Set(gio.map(it => it.storeId).filter(Boolean));
        const idTrongGio = new Set(gio.map(it => it.id));
        return sanPhams
            .filter(p => gianTrongGio.has(p.storeId) && !idTrongGio.has(p.id) && p.soLuong > 0)
            .sort((a, b) => b.trungBinhSao - a.trungBinhSao || b.soDanhGia - a.soDanhGia || a.id.localeCompare(b.id))
            .slice(0, 8);
    }, [gio, sanPhams]);

    // Giảm giá tính lại theo tạm tính hiện tại; tự gỡ mã nếu đơn tụt dưới mức tối thiểu
    const tienGiam = maApDung ? Math.round(tongTien * maApDung.phanTramGiam / 100) : 0;
    const tongThanhToan = tongTien - tienGiam;

    useEffect(() => {
        if (maApDung && maApDung.donToiThieu && tongTien < maApDung.donToiThieu) {
            setMaApDung(null);
            toast(t('Đã gỡ mã giảm giá vì đơn không còn đạt tối thiểu', 'Coupon removed — order no longer meets the minimum', '订单未达最低金额，已移除优惠码'), { icon: '⚠️' });
        }
    }, [tongTien, maApDung]);

    // Thanh chốt đơn DÍNH ĐÁY (điện thoại/máy tính bảng): nút "Đặt đơn" thật nằm cuối một
    // form dài (tên, SĐT, địa chỉ, hình thức giao, mã giảm giá) nên khách phải cuộn hết mới
    // thấy. Hiện thanh khi nút thật CÒN Ở DƯỚI màn hình; cuộn tới nơi thì thanh tự ẩn để
    // không có hai nút "Đặt đơn" cùng lúc. Cùng mẫu với thanh mua ở trang sản phẩm.
    useEffect(() => {
        const tinh = () => {
            const el = nutDatRef.current;
            setHienThanhDat(el ? el.getBoundingClientRect().top > window.innerHeight : false);
        };
        tinh();
        window.addEventListener('scroll', tinh, { passive: true });
        window.addEventListener('resize', tinh);
        return () => { window.removeEventListener('scroll', tinh); window.removeEventListener('resize', tinh) };
    }, [gio.length, donThanhCong]);

    // Báo bong bóng chat lùi lên khi thanh chốt đơn đang chiếm góc phải-dưới — nếu không,
    // chat đè đúng lên nút "Đặt đơn" (y hệt chuyện đã gặp ở trang sản phẩm). Đặt đơn là
    // việc chính nên chat nhường chỗ.
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('thanh-mua:hien', { detail: { hien: hienThanhDat } }));
        return () => window.dispatchEvent(new CustomEvent('thanh-mua:hien', { detail: { hien: false } }));
    }, [hienThanhDat]);

    const apMa = async () => {
        if (!maCode.trim()) return;
        setDangKiemMa(true);
        try {
            const res = await fetch('/api/coupons/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: maCode, tongTien }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error || t('Mã không dùng được', 'Coupon cannot be used', '优惠码不可用')); return; }
            setMaApDung({ code: data.code, moTa: data.moTa, phanTramGiam: data.phanTramGiam, donToiThieu: data.donToiThieu });
            setMaCode('');
            toast.success(`${t('Đã áp mã', 'Applied', '已使用')} ${data.code} — ${t('giảm', 'save', '优惠')} ${data.phanTramGiam}%`);
        } finally {
            setDangKiemMa(false);
        }
    };

    const datDon = async (e) => {
        e.preventDefault();
        setDangDat(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    hinhThucGiao,
                    maGiam: maApDung?.code || null,
                    items: gio.map(it => ({ productId: it.id, bienTheId: it.bienTheId || null, soLuong: it.soLuongTrongGio })),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了'));
                return;
            }
            dispatch(clearCart());
            setDonThanhCong(data.order);
        } finally {
            setDangDat(false);
        }
    };

    // Màn hình đặt đơn thành công
    if (donThanhCong) return (
        <div className="min-h-[70vh] flex items-center justify-center px-6 my-10">
            <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-lg p-8 text-center">
                <CheckCircle2 size={52} className="text-green-500 mx-auto" />
                <h1 className="text-2xl font-bold text-slate-800 mt-4">{t('Đặt đơn thành công!', 'Order placed successfully!', '下单成功！')}</h1>
                <p className="text-sm text-slate-500 mt-2">
                    {t('Mã đơn', 'Order code', '订单号')}: <span className="font-mono font-semibold text-slate-700">{donThanhCong.id.slice(-8).toUpperCase()}</span>
                </p>
                <p className="text-sm text-slate-600 mt-3">
                    {donThanhCong.hinhThucGiao === 'gui_xa'
                        ? t('Đơn sẽ được đóng gói và gửi đi trong 1-2 ngày.', 'Your order will be packed and shipped within 1-2 days.', '订单将在1-2天内打包寄出。')
                        : donThanhCong.hinhThucGiao === 'xanh_sm'
                            ? t('Đơn sẽ được giao trong ngày qua đối tác Green SM.', 'Your order will be delivered same-day via our partner Green SM.', '订单将于当日通过合作伙伴 Green SM 送达。')
                            : t('Đơn sẽ được giao nhanh trong ngày tại Hồng Gai và lân cận.', 'Your order will be delivered same-day in Hong Gai and nearby.', '订单将于当日在鸿基及周边地区送达。')}{' '}
                    {t('Tiểu thương sẽ liên hệ số', 'The merchant will contact', '商户将联系')} {donThanhCong.soDienThoai} {t('để xác nhận.', 'to confirm.', '以确认订单。')}
                </p>
                {donThanhCong.hinhThucGiao === 'xanh_sm' && (
                    <div className="flex justify-center mt-4">
                        <NutGoiGreenSM nhan={t('Đặt xe ngay', 'Book a ride', '立即叫车')} />
                    </div>
                )}
                {/* Khách vãng lai: mã đơn + SĐT là cách DUY NHẤT xem lại đơn — nhắc lưu lại */}
                {!donThanhCong.userId && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mt-3">
                        💡 {t('Bạn đặt hàng chưa đăng nhập — hãy lưu lại mã đơn ở trên cùng số điện thoại để tra cứu đơn (mục Tra đơn trên menu).', 'You ordered without signing in — save the order code above and your phone number to look up the order (see "Track order" in the menu).', '您未登录下单 —— 请保存上方订单号和手机号以便查询订单（菜单中的"查询订单"）。')}
                    </p>
                )}
                {donThanhCong.tienGiam > 0 && (
                    <p className="text-sm text-green-600 mt-3">{t('Đã giảm', 'Saved', '已优惠')} {formatVND(donThanhCong.tienGiam)} {t('với mã', 'with code', '优惠码')} {donThanhCong.maGiam}</p>
                )}
                <p className="text-lg font-semibold text-slate-800 mt-1">{t('Tổng', 'Total', '合计')}: {formatVND(donThanhCong.tongTien)}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-6">
                    <Link href={`/tra-don?ma=${donThanhCong.id.slice(-8).toUpperCase()}&sdt=${encodeURIComponent(donThanhCong.soDienThoai)}`}
                        className="w-full sm:w-auto inline-block border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium px-8 py-2.5 rounded-full transition">
                        {t('Tra cứu đơn', 'Track order', '查询订单')}
                    </Link>
                    <Link href="/" className="w-full sm:w-auto inline-block bg-ngoc-500 hover:bg-ngoc-600 transition text-white text-sm font-medium px-8 py-2.5 rounded-full">
                        {t('Tiếp tục mua sắm', 'Continue shopping', '继续购物')}
                    </Link>
                </div>
            </div>
        </div>
    );

    return gio.length > 0 ? (
        <KhungTrang rong="toiDa" className="min-h-screen text-slate-800 mb-40 lg:mb-24">
            <>
                <PageTitle heading={t("Giỏ Hàng", "Cart", "购物车")} text={t("sản phẩm trong giỏ", "items in cart", "购物车商品")} linkText={t("Thêm sản phẩm", "Add products", "添加商品")} />

                <div className="flex items-start justify-between gap-8 max-lg:flex-col">

                    {/* Danh sách trong giỏ */}
                    <table className="w-full max-w-4xl text-slate-600 table-auto">
                        <thead>
                            <tr className="max-sm:text-sm">
                                <th className="text-left">{t('Sản phẩm', 'Product', '商品')}</th>
                                <th>{t('Số lượng', 'Qty', '数量')}</th>
                                <th>{t('Thành tiền', 'Subtotal', '小计')}</th>
                                <th className="max-md:hidden">{t('Xóa', 'Remove', '删除')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gio.map(item => (
                                <tr key={item.khoa}>
                                    <td className="flex gap-3 my-4">
                                        <Anh src={item.anh} nho={item.anhNho} coHienThi="72px" alt={item.ten} className="size-18 rounded-md object-cover ring-1 ring-slate-100" />
                                        <div>
                                            <p className="max-sm:text-sm font-medium">{item.ten}</p>
                                            {item.bienTheNhan && (
                                                <p className="inline-block text-ti font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full mt-0.5">{item.bienTheNhan}</p>
                                            )}
                                            <p className="text-xs text-slate-500">{item.tenGian}{item.guiDiTinh ? t(' · 🚚 gửi tỉnh được', ' · 🚚 ships nationwide', ' · 🚚 可寄外省') : t(' · đồ tươi', ' · fresh goods', ' · 生鲜')}</p>
                                            <p className="whitespace-nowrap">{formatVND(item.gia)}</p>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <Counter khoa={item.khoa} />
                                        {item.soLuongTrongGio > item.ton && (
                                            <p className="text-ti text-red-500 mt-1">{t('Chỉ còn', 'Only', '仅剩')} {item.ton}</p>
                                        )}
                                    </td>
                                    <td className="text-center whitespace-nowrap">{formatVND(item.gia * item.soLuongTrongGio)}</td>
                                    <td className="text-center max-md:hidden">
                                        <button onClick={() => dispatch(deleteItemFromCart({ khoa: item.khoa }))}
                                            className="text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all">
                                            <Trash2Icon size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Thông tin nhận hàng + đặt đơn */}
                    <form id="form-dat-don" onSubmit={datDon} className="w-full max-w-md bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm">
                        <h2 className="text-lg font-semibold text-slate-800">{t('Thông tin nhận hàng', 'Delivery details', '收货信息')}</h2>

                        {/* Khách chưa đăng nhập: đơn sẽ không tự lưu vào tài khoản — nhắc trước khi đặt */}
                        {user === null && (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mt-3">
                                💡 {t('Bạn đang đặt hàng chưa đăng nhập — đơn sẽ không hiện trong "Đơn hàng của tôi" (vẫn tra được bằng mã đơn + số điện thoại).', 'You are ordering without signing in — the order will not appear in "My orders" (still searchable by order code + phone).', '您未登录下单 —— 订单不会显示在"我的订单"中（仍可用订单号+手机号查询）。')}{' '}
                                <Link href="/login?ve=/cart" className="font-semibold underline">{t('Đăng nhập', 'Sign in', '登录')}</Link> {t('để đơn tự lưu vào tài khoản.', 'to save the order to your account.', '让订单保存到您的账户。')}
                            </p>
                        )}

                        <div className="flex flex-col gap-3 mt-4">
                            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-100">
                                <UserRound size={16} className="text-slate-400 shrink-0" />
                                <input value={form.ten} onChange={e => setForm({ ...form, ten: e.target.value })} required
                                    placeholder={t("Tên người nhận", "Recipient name", "收货人姓名")} className="w-full bg-transparent outline-none placeholder-slate-400" />
                            </div>
                            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-100">
                                <Phone size={16} className="text-slate-400 shrink-0" />
                                <input value={form.soDienThoai} onChange={e => setForm({ ...form, soDienThoai: e.target.value })} required type="tel"
                                    placeholder={t("Số điện thoại (VD: 0912345678)", "Phone (e.g. 0912345678)", "手机号（如 0912345678）")} className="w-full bg-transparent outline-none placeholder-slate-400" />
                            </div>
                            <div className="flex items-start gap-2 bg-white px-4 py-3 rounded-xl border border-slate-100">
                                <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                <textarea value={form.diaChi} onChange={e => setForm({ ...form, diaChi: e.target.value })} required rows={2}
                                    placeholder={t("Địa chỉ nhận hàng", "Delivery address", "收货地址")} className="w-full bg-transparent outline-none placeholder-slate-400 resize-none" />
                            </div>
                        </div>

                        <h3 className="font-semibold text-slate-700 mt-5 mb-2">{t('Hình thức giao', 'Delivery method', '配送方式')}</h3>
                        <div className="flex flex-col gap-2">
                            {HINH_THUC.map(ht => (
                                <button type="button" key={ht.id} onClick={() => setHinhThucGiao(ht.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition ${hinhThucGiao === ht.id ? 'border-ngoc-500 bg-ngoc-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                    <ht.Icon size={18} className={hinhThucGiao === ht.id ? 'text-ngoc-600' : 'text-slate-400'} />
                                    <span>
                                        <span className="block font-semibold text-slate-700">{t(...ht.ten)}</span>
                                        <span className="block text-xs text-slate-500">{t(...ht.moTa)}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                        {hinhThucGiao === 'gui_xa' && doTuoiTrongGio.length > 0 && (
                            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 mt-2">
                                ⚠️ {doTuoiTrongGio.map(it => `"${it.ten}"`).join(', ')} {t('là đồ tươi, không gửi đi xa được — hãy chọn "Giao nhanh trong ngày" hoặc bỏ khỏi giỏ.', 'are fresh goods and cannot be shipped far — choose "Same-day delivery" or remove them from the cart.', '为生鲜商品，无法远程寄送 —— 请选择"当日速送"或从购物车移除。')}
                            </p>
                        )}

                        {/* Đối tác giao vận Green SM — banner gọn (liên kết trưng bày, sẽ nối API đặt xe thật sau) */}
                        <div className="mt-3">
                            <BangDoiTacGreenSM
                                tieuDe={t('Giao hàng, đặt xe cùng Green SM', 'Delivery & rides with Green SM', 'Green SM 送货 · 叫车')}
                                moTa={t('Xe điện — nhanh, xanh, thân thiện môi trường', 'Electric — fast, green, eco-friendly', '电动车 —— 快速、环保')}
                                nhanNut={t('Đặt xe ngay', 'Book a ride', '立即叫车')} />
                        </div>

                        <h3 className="font-semibold text-slate-700 mt-5 mb-2">{t('Mã giảm giá', 'Coupon code', '优惠码')}</h3>
                        {maApDung ? (
                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                                <TicketPercent size={16} className="text-green-600 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-green-700">{maApDung.code} · {t('giảm', 'save', '优惠')} {maApDung.phanTramGiam}%</p>
                                    {maApDung.moTa && <p className="text-xs text-green-600 truncate">{maApDung.moTa}</p>}
                                </div>
                                <button type="button" onClick={() => setMaApDung(null)} aria-label={t("Gỡ mã", "Remove code", "移除优惠码")}
                                    className="text-slate-400 hover:text-red-500 shrink-0"><X size={16} /></button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input value={maCode}
                                    onChange={e => setMaCode(e.target.value.toUpperCase())}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); apMa(); } }}
                                    placeholder={t("Nhập mã (VD: HONGGAI10)", "Enter code (e.g. HONGGAI10)", "输入优惠码（如 HONGGAI10）")}
                                    className="w-full bg-white px-4 py-2.5 rounded-xl border border-slate-100 outline-none placeholder-slate-400 uppercase" />
                                <button type="button" onClick={apMa} disabled={dangKiemMa || !maCode.trim()}
                                    className="bg-slate-700 hover:bg-slate-900 text-white px-4 rounded-xl text-sm font-medium active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                                    {dangKiemMa ? '...' : t('Áp dụng', 'Apply', '使用')}
                                </button>
                            </div>
                        )}

                        <div className="border-t border-slate-200 mt-5 pt-4 space-y-1.5 text-sm">
                            <div className="flex items-center justify-between text-slate-500">
                                <span>{t('Tạm tính', 'Subtotal', '小计')}</span>
                                <span>{formatVND(tongTien)}</span>
                            </div>
                            {tienGiam > 0 && (
                                <div className="flex items-center justify-between text-green-600">
                                    <span>{t('Giảm giá', 'Discount', '优惠')} ({maApDung.code})</span>
                                    <span>-{formatVND(tienGiam)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                                <span className="text-slate-600 font-medium">{t('Tổng cộng', 'Total', '合计')}</span>
                                <span className="text-xl font-bold text-slate-800 so-tien">{formatVND(tongThanhToan)}</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{t('Thanh toán khi nhận hàng (COD)', 'Cash on delivery (COD)', '货到付款（COD）')}</p>

                        <button ref={nutDatRef} type="submit" disabled={dangDat}
                            className="w-full bg-ngoc-500 hover:bg-ngoc-600 text-white font-medium py-3 rounded-full mt-4 active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none">
                            {dangDat ? t('Đang đặt đơn...', 'Placing order...', '下单中...') : t('Đặt đơn', 'Place order', '下单')}
                        </button>
                    </form>
                </div>

                {/* Mua thêm ở gian đã có trong giỏ — thêm ở đây là gom vào cùng chuyến giao,
                    nên đặt ngay dưới giỏ, trước lúc khách bấm Đặt đơn. */}
                <DaiSanPham
                    tieuDe={t('Mua thêm ở gian bạn đang đặt', 'Add more from these stalls', '从当前店铺加购')}
                    moTa={t('Cùng gian nên giao chung một chuyến, nhận cùng lúc', 'Same stall — delivered in one trip, arrives together', '同店合并配送，一起送达')}
                    Icon={Store} mau="#059669" sps={goiYThemVaoGio} className="mt-12" />

            {/* Thanh chốt đơn dính đáy — dính SÁT trên thanh điều hướng dưới (bottom-16),
                từ lg thì thanh dưới không còn nên hạ xuống đáy màn. Nút dùng thuộc tính
                form= để gửi ĐÚNG form đặt đơn dù nó nằm ngoài form (không cần nhân đôi logic). */}
            {hienThanhDat && (
                <div className='thanh-mua-vao fixed z-40 inset-x-0 bottom-16 lg:bottom-0 bg-white border-t border-slate-100 shadow-[0_-8px_28px_-12px_rgba(11,47,79,.3)] px-4 py-2.5 flex items-center gap-3'
                    style={{ '--mau-nut': '#00A8A8', paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}>
                    <div className='min-w-0 flex-1'>
                        <p className='text-ti text-slate-500 leading-tight'>
                            {t('Tổng cộng', 'Total', '合计')} · {gio.length} {t('món', 'items', '件')}
                        </p>
                        <p className='text-lg font-bold so-tien text-slate-800 leading-tight'>{formatVND(tongThanhToan)}</p>
                    </div>
                    <button form='form-dat-don' type='submit' disabled={dangDat}
                        className='nut-chinh flex items-center gap-1.5 text-white rounded-full px-6 py-2.5 text-sm font-semibold active:scale-95 transition shrink-0 disabled:opacity-60 disabled:pointer-events-none'>
                        <span className='relative z-10'>{dangDat ? t('Đang đặt...', 'Placing...', '下单中...') : t('Đặt đơn', 'Place order', '下单')}</span>
                    </button>
                </div>
            )}
            </>
        </KhungTrang>
    ) : (
        <KhungTrang rong="vua" className="min-h-[80vh]">
            <div className="flex flex-col justify-center min-h-[60vh]">
                <TrangRong Icon={ShoppingBag}
                    tieuDe={t('Giỏ hàng của bạn đang trống', 'Your cart is empty', '您的购物车是空的')}
                    moTa={t('Thêm vài món hải sản tươi hoặc quà Quảng Ninh để bắt đầu nhé!', 'Add some fresh seafood or Quang Ninh gifts to get started!', '添加一些新鲜海鲜或广宁礼品，开始购物吧！')}
                    nutText={t('Xem sản phẩm', 'Browse products', '浏览商品')} nutHref="/" />

                {/* Giỏ trống là ngõ cụt — mời lại đúng những món khách vừa ngó qua */}
                <BanVuaXem className="mt-4 pb-16" />
            </div>
        </KhungTrang>
    )
}
