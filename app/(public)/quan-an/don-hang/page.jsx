'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import { formatVND } from '@/lib/utils/currency'
import { useNgonNgu } from '@/lib/i18n'
import { TT } from '@/lib/donDoAn'
import { Bell, BellOff, Check, MapPin, Truck, UtensilsCrossed, X } from 'lucide-react'

const MAU = '#ea580c'
// Nút hành động theo trạng thái hiện tại của đơn (ten = [vi, en, zh] để dịch tại render)
const HANH_DONG = {
    cho_nhan: [{ tt: 'da_nhan', ten: ['Nhận đơn', 'Accept', '接单'], Icon: Check, mau: '#0284c7' }, { tt: 'huy', ten: ['Từ chối', 'Decline', '拒绝'], Icon: X, mau: '#dc2626' }],
    da_nhan: [{ tt: 'dang_giao', ten: ['Bắt đầu giao', 'Start delivery', '开始配送'], Icon: Truck, mau: '#7c3aed' }, { tt: 'huy', ten: ['Hủy', 'Cancel', '取消'], Icon: X, mau: '#dc2626' }],
    dang_giao: [{ tt: 'da_giao', ten: ['Đã giao xong', 'Delivered', '已送达'], Icon: Check, mau: '#059669' }],
}
// Nhãn trạng thái đơn đồ ăn dịch theo id (map gốc lib/donDoAn chỉ có tiếng Việt)
const TT_TEXT = {
    cho_nhan: ['Chờ quán nhận', 'Awaiting acceptance', '等待接单'], da_nhan: ['Đã nhận đơn', 'Accepted', '已接单'],
    dang_giao: ['Đang giao', 'Delivering', '配送中'], da_giao: ['Đã giao', 'Delivered', '已送达'], huy: ['Đã hủy', 'Cancelled', '已取消'],
}

export default function QuanLyDonHang() {
    const { t } = useNgonNgu()
    const [dons, setDons] = useState([])
    const [trangThaiTai, setTrangThaiTai] = useState('dang') // dang | ok | chuaCoQuan
    const [amBao, setAmBao] = useState(true)

    const idsRef = useRef(new Set())   // id đơn đã thấy — để phát hiện đơn mới
    const lanDauRef = useRef(true)
    const amBaoRef = useRef(true)
    const audioRef = useRef(null)
    useEffect(() => { amBaoRef.current = amBao }, [amBao])

    // Tiếng "ting" bằng Web Audio (không cần file). Chỉ chạy sau khi người dùng bấm (mở âm báo).
    const keuChuong = () => {
        try {
            if (!audioRef.current) audioRef.current = new (window.AudioContext || window.webkitAudioContext)()
            const ac = audioRef.current
            if (ac.state === 'suspended') ac.resume()
            const g = ac.createGain(); g.connect(ac.destination); g.gain.value = 0.001
            const o = ac.createOscillator(); o.type = 'sine'; o.connect(g)
            const t = ac.currentTime
            o.frequency.setValueAtTime(880, t); o.frequency.setValueAtTime(1320, t + 0.15)
            g.gain.exponentialRampToValueAtTime(0.3, t + 0.02)
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
            o.start(t); o.stop(t + 0.42)
        } catch { /* trình duyệt chặn — bỏ qua */ }
    }

    const tai = async () => {
        try {
            const res = await fetch('/api/quan-an/don')
            if (res.status === 403) { setTrangThaiTai('chuaCoQuan'); return }
            const data = await res.json()
            const ds = data.dons || []
            // Đơn MỚI (chưa nhận) chưa từng thấy -> kêu chuông
            const moi = ds.filter(d => d.trangThai === 'cho_nhan' && !idsRef.current.has(d.id))
            if (!lanDauRef.current && moi.length) {
                if (amBaoRef.current) keuChuong()
                toast.success(`${t('Có', 'You have', '有')} ${moi.length} ${t('đơn mới!', 'new order(s)!', '个新订单！')}`, { icon: '🔔' })
            }
            idsRef.current = new Set(ds.map(d => d.id))
            lanDauRef.current = false
            setDons(ds)
            setTrangThaiTai('ok')
        } catch { /* giữ nguyên đơn cũ nếu lỗi mạng */ }
    }

    useEffect(() => {
        tai()
        const timer = setInterval(tai, 15000) // poll 15s: fallback nếu realtime rớt
        // Realtime: có đơn mới → ThongBaoDon bắn 'don:refresh' → hiện ra + kêu chuông NGAY (không đợi 15s)
        const onRefresh = (e) => { if (e.detail?.scope === 'quan-don') tai() }
        window.addEventListener('don:refresh', onRefresh)
        return () => { clearInterval(timer); window.removeEventListener('don:refresh', onRefresh) }
    }, [])

    const capNhat = async (don, trangThai) => {
        if (trangThai === 'huy' && !confirm(t('Hủy/từ chối đơn này?', 'Cancel/decline this order?', '取消/拒绝此订单？'))) return
        const res = await fetch(`/api/quan-an/don/${don.id}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trangThai }),
        })
        const data = await res.json()
        if (!res.ok) { toast.error(data.error || t('Cập nhật thất bại', 'Update failed', '更新失败')); return }
        setDons(prev => prev.map(d => d.id === don.id ? data.don : d))
    }

    const batAmBao = () => {
        const bat = !amBao
        setAmBao(bat)
        if (bat) keuChuong() // bấm bật = cử chỉ người dùng, mở khóa âm thanh + nghe thử
    }

    if (trangThaiTai === 'dang') return <Loading />

    if (trangThaiTai === 'chuaCoQuan') return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-6'>
            <UtensilsCrossed size={48} className='text-slate-300' />
            <h1 className='text-2xl font-semibold text-slate-700 mt-4'>{t('Bạn chưa có quán ăn', "You don't have an eatery yet", '您还没有餐馆')}</h1>
            <p className='text-slate-500 text-sm mt-2'>{t('Mở quán ăn để nhận đơn đặt món từ khách.', 'Open an eatery to receive food orders from customers.', '开设餐馆以接收顾客的餐饮订单。')}</p>
            <Link href='/create-quan-an' className='text-white px-8 py-2.5 rounded-full mt-6 text-sm font-medium' style={{ backgroundColor: MAU }}>{t('Mở quán ăn', 'Open an eatery', '开设餐馆')}</Link>
        </div>
    )

    const dangXuLy = dons.filter(d => d.trangThai !== 'da_giao' && d.trangThai !== 'huy')
    const daXong = dons.filter(d => d.trangThai === 'da_giao' || d.trangThai === 'huy')

    return (
        <div className='mx-6 my-10 mb-28 max-w-3xl'>
            <div className='flex items-center justify-between gap-3 flex-wrap'>
                <div>
                    <h1 className='text-2xl text-slate-500'>{t('Đơn', 'Food', '订单')} <span className='text-slate-800 font-medium'>{t('đặt món', 'orders', '点餐')}</span></h1>
                    <p className='text-xs text-slate-400 mt-1'>{t('Đơn mới hiện ngay + kêu chuông · không cần tải lại trang', 'New orders appear instantly + chime · no need to refresh', '新订单即时显示+提示音 · 无需刷新')}</p>
                </div>
                <div className='flex items-center gap-2'>
                    <Link href='/quan-an/tin-nhan' className='text-sm font-semibold' style={{ color: MAU }}>{t('Tin nhắn', 'Messages', '消息')}</Link>
                    <Link href='/quan-an/thuc-don' className='text-sm font-semibold' style={{ color: MAU }}>{t('Thực đơn', 'Menu', '菜单')}</Link>
                    <button onClick={batAmBao} className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition ${amBao ? 'text-white' : 'bg-slate-100 text-slate-500'}`} style={amBao ? { backgroundColor: MAU } : {}}>
                        {amBao ? <Bell size={15} /> : <BellOff size={15} />} {amBao ? t('Chuông bật', 'Sound on', '铃声开') : t('Chuông tắt', 'Sound off', '铃声关')}
                    </button>
                </div>
            </div>

            {/* Đơn đang xử lý */}
            <h2 className='text-lg font-semibold text-slate-700 mt-6 mb-3'>{t('Đang xử lý', 'In progress', '处理中')} ({dangXuLy.length})</h2>
            {dangXuLy.length ? (
                <div className='flex flex-col gap-3'>
                    {dangXuLy.map(don => <TheDon key={don.id} don={don} capNhat={capNhat} />)}
                </div>
            ) : (
                <p className='text-slate-400 text-sm py-8 text-center bg-slate-50 rounded-2xl'>{t('Chưa có đơn nào đang chờ. Đơn mới sẽ tự hiện + kêu chuông.', 'No pending orders. New orders will appear automatically + chime.', '暂无待处理订单。新订单将自动显示+提示音。')}</p>
            )}

            {/* Đơn đã xong / đã hủy */}
            {daXong.length > 0 && (
                <>
                    <h2 className='text-lg font-semibold text-slate-700 mt-8 mb-3'>{t('Đã xong', 'Completed', '已完成')} ({daXong.length})</h2>
                    <div className='flex flex-col gap-3'>
                        {daXong.map(don => <TheDon key={don.id} don={don} capNhat={capNhat} />)}
                    </div>
                </>
            )}
        </div>
    )
}

function TheDon({ don, capNhat }) {
    const { t } = useNgonNgu()
    const tt = TT[don.trangThai] || TT.cho_nhan
    const actions = HANH_DONG[don.trangThai] || []
    return (
        <div className='bg-white border border-slate-100 rounded-2xl shadow-sm p-4'>
            <div className='flex items-center justify-between gap-3 flex-wrap'>
                <div>
                    <p className='font-semibold text-slate-800'>{don.tenKhach} · <a href={`tel:${don.soDienThoai}`} className='text-slate-500 font-normal hover:underline'>{don.soDienThoai}</a></p>
                    <p className='text-xs text-slate-400'>{new Date(don.createdAt).toLocaleString(t('vi-VN', 'en-US', 'zh-CN'))}</p>
                </div>
                <span className='text-xs font-semibold px-3 py-1 rounded-full text-white' style={{ backgroundColor: tt.mau }}>{TT_TEXT[don.trangThai] ? t(...TT_TEXT[don.trangThai]) : tt.ten}</span>
            </div>

            <div className='text-sm text-slate-600 mt-3 border-t border-slate-100 pt-2'>
                {don.items.map(it => (
                    <div key={it.monId} className='flex items-center justify-between py-0.5'>
                        <span>{it.soLuong} × {it.ten}</span><span className='text-slate-500'>{formatVND(it.gia * it.soLuong)}</span>
                    </div>
                ))}
                <div className='flex items-center justify-between pt-1.5 mt-1 border-t border-slate-100 font-bold text-slate-800'>
                    <span>{t('Tổng', 'Total', '合计')}</span><span style={{ color: MAU }}>{formatVND(don.tongTien)}</span>
                </div>
            </div>
            <p className='text-xs text-slate-500 mt-2'>
                📍 {don.diaChi}{don.ghiChu && ` · ${t('Ghi chú', 'Note', '备注')}: ${don.ghiChu}`}
                {don.viTri && (
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${don.viTri.lat},${don.viTri.lng}`} target='_blank' rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 ml-2 font-semibold' style={{ color: MAU }}>
                        <MapPin size={12} /> {t('Chỉ đường', 'Directions', '导航')}
                    </a>
                )}
            </p>

            {actions.length > 0 && (
                <div className='flex items-center gap-2 mt-3'>
                    {actions.map(a => (
                        <button key={a.tt} onClick={() => capNhat(don, a.tt)}
                            className='flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-full active:scale-95 transition' style={{ backgroundColor: a.mau }}>
                            <a.Icon size={14} /> {t(...a.ten)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
