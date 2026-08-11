'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import Anh from '@/components/Anh'
import { useAuth } from '@/components/AuthProvider'
import { useNgonNgu } from '@/lib/i18n'
import { formatVND } from '@/lib/utils/currency'
import { ArrowLeft, Clock, LocateFixed, MapPin, MessageCircle, Minus, Phone, Plus, Send, ShoppingBag, UtensilsCrossed, X } from 'lucide-react'

const MAU = '#ea580c'

// Trang một quán ăn: thông tin quán + thực đơn theo "phần" + ĐẶT MÓN (giỏ + form).
export default function TrangQuanAn() {
    const { id } = useParams()
    const router = useRouter()
    const { t } = useNgonNgu()
    const { user } = useAuth() // undefined=đang tải; null=chưa đăng nhập
    const [quan, setQuan] = useState(undefined)
    const [thucDon, setThucDon] = useState([])
    const [gio, setGio] = useState({})            // { [monId]: soLuong }
    const [moModal, setMoModal] = useState(false)
    const [form, setForm] = useState({ tenKhach: '', soDienThoai: '', diaChi: '', ghiChu: '' })
    const [viTri, setViTri] = useState(null) // { lat, lng } ghim từ GPS
    const [dangLayViTri, setDangLayViTri] = useState(false)
    const [dangGui, setDangGui] = useState(false)
    const [dangMoChat, setDangMoChat] = useState(false)

    // Nhắn tin với quán: mở (hoặc tạo) hội thoại rồi vào trang chat
    const nhanTin = async () => {
        if (!user) { router.push(`/login?ve=/do-an/${id}`); return }
        setDangMoChat(true)
        try {
            const res = await fetch('/api/tin-nhan/bat-dau', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quanAnId: id }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Không mở được cuộc trò chuyện', 'Could not start the conversation', '无法开始对话')); return }
            // Mở thẳng bong bóng chat tại chỗ (không rời trang quán)
            window.dispatchEvent(new CustomEvent('mo-hop-chat', { detail: { hoiThoai: data.hoiThoai } }))
        } finally { setDangMoChat(false) }
    }

    useEffect(() => {
        if (!id) return
        fetch(`/api/quan-an/${id}`)
            .then(r => r.json())
            .then(d => { setQuan(d.quanAn || null); setThucDon(d.thucDon || []) })
            .catch(() => setQuan(null))
    }, [id])

    useEffect(() => {
        if (user) setForm(f => ({ ...f, tenKhach: f.tenKhach || user.name || '' }))
    }, [user])

    const monTheoId = useMemo(() => Object.fromEntries(thucDon.map(m => [m.id, m])), [thucDon])
    const soMon = Object.values(gio).reduce((s, n) => s + n, 0)
    const tongTien = Object.entries(gio).reduce((s, [mid, n]) => s + (monTheoId[mid]?.gia || 0) * n, 0)

    const them = (mid) => setGio(g => ({ ...g, [mid]: (g[mid] || 0) + 1 }))
    const bot = (mid) => setGio(g => { const n = (g[mid] || 0) - 1; const ng = { ...g }; if (n <= 0) delete ng[mid]; else ng[mid] = n; return ng })

    // Ghim vị trí giao bằng GPS trình duyệt (định vị khách — giao tận nơi)
    const layViTri = () => {
        if (!navigator.geolocation) return toast.error(t('Trình duyệt không hỗ trợ định vị', 'Your browser does not support geolocation', '您的浏览器不支持定位'))
        setDangLayViTri(true)
        navigator.geolocation.getCurrentPosition(
            pos => { setViTri({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setDangLayViTri(false); toast.success(t('Đã ghim vị trí của bạn cho quán', 'Your location has been pinned for the eatery', '已为餐馆标记您的位置')) },
            () => { setDangLayViTri(false); toast.error(t('Không lấy được vị trí — hãy cho phép truy cập vị trí rồi thử lại', 'Could not get location — please allow location access and try again', '无法获取位置 —— 请允许位置访问后重试')) },
            { enableHighAccuracy: true, timeout: 10000 },
        )
    }

    const datMon = async () => {
        if (!/^0\d{8,10}$/.test(form.soDienThoai.replace(/[\s.-]/g, ''))) return toast.error(t('Số điện thoại không hợp lệ', 'Invalid phone number', '手机号无效'))
        if (!form.diaChi.trim()) return toast.error(t('Vui lòng nhập địa chỉ nhận đồ', 'Please enter a delivery address', '请输入收货地址'))
        setDangGui(true)
        try {
            const res = await fetch('/api/don-do-an', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quanAnId: id,
                    items: Object.entries(gio).map(([monId, soLuong]) => ({ monId, soLuong })),
                    viTri,
                    ...form,
                }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Đặt món thất bại', 'Order failed', '点餐失败')); return }
            toast.success(t('Đã đặt món! Theo dõi đơn ở mục "Đơn đồ ăn của tôi".', 'Order placed! Track it in "My food orders".', '点餐成功！在"我的餐饮订单"中追踪。'))
            setGio({}); setViTri(null); setMoModal(false)
        } finally { setDangGui(false) }
    }

    if (quan === undefined) return <Loading />

    if (!quan) return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-6'>
            <UtensilsCrossed size={48} className='text-slate-300' />
            <h1 className='text-2xl font-semibold text-slate-700 mt-4'>{t('Không tìm thấy quán ăn', 'Eatery not found', '未找到餐馆')}</h1>
            <p className='text-slate-500 text-sm mt-2'>{t('Quán này không tồn tại hoặc chưa được duyệt hoạt động.', 'This eatery does not exist or has not been approved.', '该餐馆不存在或尚未通过审核。')}</p>
            <Link href='/do-an' className='text-white px-8 py-2.5 rounded-full mt-6 text-sm font-medium' style={{ backgroundColor: MAU }}>{t('Về trang Đồ Ăn', 'Back to Food', '返回美食')}</Link>
        </div>
    )

    const KHAC = 'Món khác'
    const phans = []; const theoPhan = {}
    for (const m of thucDon) { const p = m.phan || KHAC; if (!theoPhan[p]) { theoPhan[p] = []; phans.push(p) } theoPhan[p].push(m) }

    return (
        <div className='min-h-[70vh] mx-6 my-10 mb-40'>
            <div className='max-w-5xl mx-auto'>
                <Link href='/do-an' className='inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5'>
                    <ArrowLeft size={15} /> {t('Về trang Đồ Ăn', 'Back to Food', '返回美食')}
                </Link>

                {/* Đầu trang quán */}
                <div className='rounded-3xl px-6 py-7 sm:px-9 flex max-sm:flex-col sm:items-center gap-5'
                    style={{ background: `linear-gradient(135deg, ${MAU}12, ${MAU}26)`, borderLeft: `5px solid ${MAU}` }}>
                    <Anh src={quan.logo} alt={quan.ten} className='size-20 sm:size-24 rounded-2xl object-cover ring-2 ring-white shadow-md shrink-0' />
                    <div className='min-w-0 flex-1'>
                        <h1 className='text-2xl sm:text-3xl font-bold text-slate-800'>{quan.ten}</h1>
                        <p className='text-sm text-slate-600 mt-2 max-w-2xl'>{quan.moTa}</p>
                        <div className='flex items-center gap-4 flex-wrap mt-3 text-sm text-slate-600'>
                            {(quan.gioMoCua || quan.gioDongCua) && (
                                <span className='flex items-center gap-1.5'><Clock size={14} style={{ color: MAU }} /> {quan.gioMoCua} - {quan.gioDongCua}</span>
                            )}
                            {quan.diaChi && <span className='flex items-center gap-1.5'><MapPin size={14} style={{ color: MAU }} /> {quan.diaChi}</span>}
                            {quan.soDienThoai && <a href={`tel:${quan.soDienThoai}`} className='flex items-center gap-1.5 hover:underline'><Phone size={14} style={{ color: MAU }} /> {quan.soDienThoai}</a>}
                        </div>
                        <button onClick={nhanTin} disabled={dangMoChat}
                            className='inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-white px-4 py-2 rounded-full active:scale-95 transition disabled:opacity-60' style={{ backgroundColor: MAU }}>
                            <MessageCircle size={15} /> {dangMoChat ? t('Đang mở...', 'Opening...', '打开中...') : t('Nhắn tin với quán', 'Message eatery', '联系餐馆')}
                        </button>
                    </div>
                </div>

                {/* Thực đơn */}
                <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700 mt-10 mb-2'>
                    <UtensilsCrossed size={18} style={{ color: MAU }} /> {t('Thực đơn', 'Menu', '菜单')} ({thucDon.length})
                </h2>

                {thucDon.length ? (
                    <div className='flex flex-col gap-8 mt-4'>
                        {phans.map(phan => (
                            <div key={phan}>
                                <h3 className='text-base font-bold text-slate-700 mb-3 pb-2 border-b-2' style={{ borderColor: MAU + '33' }}>{phan === KHAC ? t('Món khác', 'Other', '其他') : phan}</h3>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    {theoPhan[phan].map(m => (
                                        <div key={m.id} className={`flex gap-3.5 bg-white border border-slate-100 rounded-2xl p-3.5 shadow-sm ${m.con ? '' : 'opacity-60'}`}>
                                            <div className='relative size-20 shrink-0'>
                                                <Anh src={m.anh} alt={m.ten} className='size-20 rounded-xl object-cover ring-1 ring-slate-100' />
                                                {!m.con && <span className='absolute inset-0 flex items-center justify-center bg-slate-900/50 text-white text-ti font-semibold rounded-xl'>{t('Hết món', 'Sold out', '售罄')}</span>}
                                            </div>
                                            <div className='min-w-0 flex-1'>
                                                <p className='font-semibold text-slate-800'>{m.ten}</p>
                                                {m.moTa && <p className='text-xs text-slate-500 mt-0.5 line-clamp-2'>{m.moTa}</p>}
                                                <div className='flex items-center justify-between gap-2 mt-1.5'>
                                                    <p className='font-bold' style={{ color: MAU }}>{formatVND(m.gia)}</p>
                                                    {m.con && (gio[m.id] ? (
                                                        <div className='flex items-center gap-2'>
                                                            <button onClick={() => bot(m.id)} aria-label={t('Bớt', 'Decrease', '减少')} className='size-7 flex items-center justify-center rounded-full text-white active:scale-90 transition' style={{ backgroundColor: MAU }}><Minus size={14} /></button>
                                                            <span className='text-sm font-bold text-slate-700 w-5 text-center'>{gio[m.id]}</span>
                                                            <button onClick={() => them(m.id)} aria-label={t('Thêm', 'Add', '添加')} className='size-7 flex items-center justify-center rounded-full text-white active:scale-90 transition' style={{ backgroundColor: MAU }}><Plus size={14} /></button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => them(m.id)} className='flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition' style={{ backgroundColor: MAU + '1a', color: MAU }}><Plus size={13} /> {t('Thêm', 'Add', '添加')}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='text-slate-400 text-sm py-10 text-center bg-slate-50 rounded-2xl mt-4'>{t('Quán chưa cập nhật thực đơn.', 'This eatery has not added a menu yet.', '该餐馆尚未更新菜单。')}</p>
                )}
            </div>

            {/* Thanh giỏ đặt món (hiện khi đã chọn món) */}
            {soMon > 0 && (
                <div className='fixed z-40 inset-x-4 bottom-20 lg:bottom-6 lg:inset-x-0 lg:mx-auto lg:max-w-md'>
                    <button
                        onClick={() => user ? setMoModal(true) : toast.error(t('Đăng nhập để đặt món', 'Sign in to order', '登录后点餐'))}
                        className='w-full flex items-center justify-between gap-3 text-white px-5 py-3.5 rounded-2xl shadow-xl active:scale-[0.99] transition'
                        style={{ backgroundColor: MAU }}>
                        <span className='flex items-center gap-2 font-semibold'>
                            <span className='flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-white/25 text-sm'>{soMon}</span>
                            <ShoppingBag size={18} /> {t('Đặt món', 'Order', '点餐')}
                        </span>
                        <span className='font-bold'>{formatVND(tongTien)}</span>
                    </button>
                </div>
            )}

            {/* Modal xác nhận đặt món */}
            {moModal && (
                <div onClick={() => setMoModal(false)} className='fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4'>
                    <div onClick={e => e.stopPropagation()} className='w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto'>
                        <div className='flex items-center justify-between mb-4'>
                            <h3 className='text-lg font-bold text-slate-800'>{t('Xác nhận đặt món', 'Confirm order', '确认点餐')}</h3>
                            <button onClick={() => setMoModal(false)} aria-label={t('Đóng', 'Close', '关闭')} className='size-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500'><X size={18} /></button>
                        </div>

                        {/* Tóm tắt món */}
                        <div className='bg-slate-50 rounded-2xl p-4 mb-4 text-sm'>
                            {Object.entries(gio).map(([mid, n]) => monTheoId[mid] && (
                                <div key={mid} className='flex items-center justify-between py-1'>
                                    <span className='text-slate-600'>{n} × {monTheoId[mid].ten}</span>
                                    <span className='font-medium text-slate-700'>{formatVND(monTheoId[mid].gia * n)}</span>
                                </div>
                            ))}
                            <div className='flex items-center justify-between pt-2 mt-2 border-t border-slate-200 font-bold text-slate-800'>
                                <span>{t('Tổng cộng', 'Total', '合计')}</span><span style={{ color: MAU }}>{formatVND(tongTien)}</span>
                            </div>
                        </div>

                        <div className='flex flex-col gap-3 text-sm'>
                            <input value={form.tenKhach} onChange={e => setForm({ ...form, tenKhach: e.target.value })} placeholder={t('Tên người nhận', 'Recipient name', '收货人姓名')} className='w-full bg-slate-100 px-4 py-3 rounded-xl outline-none placeholder-slate-400' />
                            <input value={form.soDienThoai} onChange={e => setForm({ ...form, soDienThoai: e.target.value })} type='tel' placeholder={t('Số điện thoại', 'Phone number', '手机号')} className='w-full bg-slate-100 px-4 py-3 rounded-xl outline-none placeholder-slate-400' />
                            <input value={form.diaChi} onChange={e => setForm({ ...form, diaChi: e.target.value })} placeholder={t('Địa chỉ nhận đồ', 'Delivery address', '收货地址')} className='w-full bg-slate-100 px-4 py-3 rounded-xl outline-none placeholder-slate-400' />
                            {/* Định vị GPS — giúp quán giao đúng chỗ */}
                            {viTri ? (
                                <div className='flex items-center justify-between gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5'>
                                    <span className='flex items-center gap-2 text-sm text-green-700 font-medium'><MapPin size={15} /> {t('Đã ghim vị trí của bạn', 'Your location is pinned', '已标记您的位置')}</span>
                                    <div className='flex items-center gap-3 text-xs'>
                                        <a href={`https://www.google.com/maps?q=${viTri.lat},${viTri.lng}`} target='_blank' rel='noopener noreferrer' className='font-semibold underline' style={{ color: MAU }}>{t('Xem', 'View', '查看')}</a>
                                        <button type='button' onClick={() => setViTri(null)} className='text-slate-400 hover:text-slate-600'>{t('Bỏ', 'Remove', '移除')}</button>
                                    </div>
                                </div>
                            ) : (
                                <button type='button' onClick={layViTri} disabled={dangLayViTri}
                                    className='flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-60' style={{ borderColor: MAU + '66', color: MAU }}>
                                    <LocateFixed size={16} /> {dangLayViTri ? t('Đang lấy vị trí...', 'Getting location...', '获取位置中...') : t('Dùng vị trí của tôi (giao chính xác hơn)', 'Use my location (more accurate delivery)', '使用我的位置（配送更精准）')}
                                </button>
                            )}
                            <textarea value={form.ghiChu} onChange={e => setForm({ ...form, ghiChu: e.target.value })} rows={2} maxLength={300} placeholder={t('Ghi chú cho quán (không bắt buộc)', 'Note for the eatery (optional)', '给餐馆的备注（可选）')} className='w-full bg-slate-100 px-4 py-3 rounded-xl outline-none placeholder-slate-400 resize-none' />
                        </div>
                        <p className='text-xs text-slate-400 mt-2'>{t('Giao tận nơi theo địa chỉ trên · thanh toán khi nhận đồ.', 'Delivered to the address above · pay on delivery.', '按上述地址配送 · 货到付款。')}</p>

                        <button onClick={datMon} disabled={dangGui} className='w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-full mt-4 active:scale-95 transition disabled:opacity-60' style={{ backgroundColor: MAU }}>
                            <Send size={15} /> {dangGui ? t('Đang đặt...', 'Ordering...', '下单中...') : `${t('Đặt món', 'Order', '点餐')} · ${formatVND(tongTien)}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
