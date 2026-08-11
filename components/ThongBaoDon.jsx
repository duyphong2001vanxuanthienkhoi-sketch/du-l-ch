'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { layPusherClient } from '@/lib/pusherClient'
import { keuTing } from '@/lib/utils/chuong'
import { formatVND } from '@/lib/utils/currency'
import { useNgonNgu } from '@/lib/i18n'

// Nghe realtime cho ĐƠN HÀNG và hiện thông báo NỔI (toast + chuông) ở BẤT KỲ trang nào —
// để chủ quán/gian thấy đơn mới ngay mà không phải vào "Đơn hàng của tôi"/"Quán ăn của tôi",
// và khách thấy đơn đổi trạng thái ngay mà không phải F5.
//
// Đây là subscriber DUY NHẤT tới các kênh đơn. Các trang danh sách đơn KHÔNG tự subscribe
// (tránh cùng subscribe/unsubscribe một kênh với BongBongChat/nhau gây rớt kênh); thay vào đó
// chúng nghe window-event 'don:refresh' (kèm scope) để tự tải lại danh sách.
//
// Dùng lại kênh chat: private-quan-<id> (chủ) và private-khach-<userId> (khách),
// nên chỉ UNBIND handler của mình khi dọn — KHÔNG unsubscribe kênh (BongBongChat còn dùng).

// scope phát cho từng loại sự kiện → trang tương ứng lắng nghe để tải lại
const SCOPE = {
    do_an_moi: 'quan-don',      // trang chủ quán: /quan-an/don-hang
    cho_moi: 'store-don',       // trang gian chợ: /store/orders
    do_an_capnhat: 'khach-doan',// khách đồ ăn:   /don-do-an
    cho_capnhat: 'khach-cho',   // khách chợ:     /orders
}
// Trang đang "sở hữu" sự kiện → khi khách/chủ đang xem đúng trang đó thì thôi toast (danh sách tự nhảy)
const TRANG = { do_an_moi: '/quan-an/don-hang', cho_moi: '/store/orders', do_an_capnhat: '/don-do-an', cho_capnhat: '/orders' }

export default function ThongBaoDon() {
    const { user } = useAuth()
    const { t } = useNgonNgu()
    const router = useRouter()
    const pathname = usePathname()
    const pathRef = useRef(pathname)
    useEffect(() => { pathRef.current = pathname }, [pathname])
    // Luôn có bản t mới nhất trong handler realtime (không cần re-subscribe khi đổi ngôn ngữ)
    const tRef = useRef(t)
    useEffect(() => { tRef.current = t }, [t])

    const [quanId, setQuanId] = useState(null) // quán ăn đã duyệt mình sở hữu
    const [gianId, setGianId] = useState(null) // gian chợ đã duyệt mình sở hữu

    // Biết mình có sở hữu quán ăn / gian hàng đã duyệt không (để nghe kênh nhận đơn)
    useEffect(() => {
        if (!user) { setQuanId(null); setGianId(null); return }
        let huy = false
        fetch('/api/quan-an/me').then(r => r.json()).then(d => { if (!huy && d.quanAn?.status === 'da_duyet') setQuanId(d.quanAn.id) }).catch(() => {})
        fetch('/api/store/me').then(r => r.json()).then(d => { if (!huy && d.store?.status === 'da_duyet') setGianId(d.store.id) }).catch(() => {})
        return () => { huy = true }
    }, [user])

    // Bảo các trang danh sách đơn tự tải lại
    const baoTaiLai = (scope) => window.dispatchEvent(new CustomEvent('don:refresh', { detail: { scope } }))

    // ĐƠN MỚI về quán/gian của mình → toast + chuông (trừ khi đang xem đúng trang đơn đó)
    useEffect(() => {
        const pusher = layPusherClient(); if (!pusher) return
        const ids = [quanId, gianId].filter(Boolean)
        if (!ids.length) return
        const xuLy = (d) => {
            const key = d.loai === 'do_an' ? 'do_an_moi' : 'cho_moi'
            baoTaiLai(SCOPE[key])
            if (pathRef.current === TRANG[key]) return // đang xem trang đơn → danh sách tự hiện, khỏi toast
            keuTing()
            const href = TRANG[key]
            const tr = tRef.current
            toast(to => (
                <span className='cursor-pointer leading-snug' onClick={() => { router.push(href); toast.dismiss(to.id) }}>
                    🔔 <b>{tr('Đơn mới', 'New order', '新订单')}</b>{d.tenKhach ? <> {tr('từ', 'from', '来自')} <b>{d.tenKhach}</b></> : ''} · <span style={{ color: '#ea580c' }}>{formatVND(d.tongTien)}</span>
                    <span className='block text-xs text-slate-400'>{tr('Bấm để xem đơn →', 'Tap to view order →', '点击查看订单 →')}</span>
                </span>
            ), { icon: '🛒', duration: 7000 })
        }
        const chs = ids.map(id => { const ch = pusher.subscribe(`private-quan-${id}`); ch.bind('don-moi', xuLy); return ch })
        return () => { chs.forEach(ch => ch.unbind('don-moi', xuLy)) } // chỉ gỡ handler của mình
    }, [quanId, gianId, router])

    // ĐƠN CỦA MÌNH đổi trạng thái → toast + chuông (trừ khi đang xem đúng trang theo dõi đơn)
    useEffect(() => {
        if (!user) return
        const pusher = layPusherClient(); if (!pusher) return
        const ch = pusher.subscribe(`private-khach-${user.id}`)
        const xuLy = (d) => {
            const key = d.loai === 'do_an' ? 'do_an_capnhat' : 'cho_capnhat'
            baoTaiLai(SCOPE[key])
            if (pathRef.current === TRANG[key]) return
            keuTing()
            const href = TRANG[key]
            const tr = tRef.current
            // Dịch nhãn trạng thái ở client theo trangThai (payload server gửi kèm) thay vì dùng chuỗi VI d.nhan
            const nhanDich = d.loai === 'do_an'
                ? ({ cho_nhan: tr('Chờ quán nhận', 'Awaiting acceptance', '等待接单'), da_nhan: tr('Đã nhận đơn', 'Accepted', '已接单'), dang_giao: tr('Đang giao', 'Delivering', '配送中'), da_giao: tr('Đã giao', 'Delivered', '已送达'), huy: tr('Đã hủy', 'Cancelled', '已取消') }[d.trangThai] || d.nhan)
                : ({ moi: tr('Chờ xử lý', 'Pending', '待处理'), dang_giao: tr('Đang giao', 'Delivering', '配送中'), da_giao: tr('Đã giao xong', 'Delivered', '已送达') }[d.trangThai] || d.nhan)
            toast(to => (
                <span className='cursor-pointer leading-snug' onClick={() => { router.push(href); toast.dismiss(to.id) }}>
                    📦 {tr('Đơn', 'Order', '订单')} {d.tenQuan ? <>{tr('ở', 'at', '在')} <b>{d.tenQuan}</b> </> : ''}{tr('cập nhật:', 'updated:', '更新：')} <b style={{ color: '#ea580c' }}>{nhanDich}</b>
                    <span className='block text-xs text-slate-400'>{tr('Bấm để theo dõi →', 'Tap to track →', '点击追踪 →')}</span>
                </span>
            ), { duration: 7000 })
        }
        ch.bind('don-cap-nhat', xuLy)
        return () => { ch.unbind('don-cap-nhat', xuLy) } // chỉ gỡ handler của mình, không unsubscribe (chat còn dùng)
    }, [user, router])

    return null
}
