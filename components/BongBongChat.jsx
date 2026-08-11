'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft, LifeBuoy, MessageCircle, Store, User, X } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useNgonNgu } from '@/lib/i18n'
import { layPusherClient } from '@/lib/pusherClient'
import { keuTing } from '@/lib/utils/chuong'
import HopChat from '@/components/HopChat'
import NutBatThongBao from '@/components/NutBatThongBao'
import AnhDaiDien from '@/components/AnhDaiDien'

const MAU = '#ea580c'

// Gộp danh sách hội thoại theo id, mới cập nhật lên đầu (dùng khi trộn hộp thư quán + gian).
const gopHt = (a, b) => {
    const m = new Map(a.map(h => [h.id, h]))
    for (const h of b) m.set(h.id, h)
    return [...m.values()].sort((x, y) => String(y.capNhatLuc || '').localeCompare(String(x.capNhatLuc || '')))
}

// MỘT bong bóng chat nổi duy nhất (góc phải-dưới), gộp cả 2 vai:
//  - Khách: các cuộc chat mình nhắn cho quán ăn / gian hàng.
//  - Bán hàng (chỉ hiện nếu mình là chủ quán ăn HOẶC chủ gian ĐÃ DUYỆT): khách nhắn tới mình.
// Nếu vừa là khách vừa là chủ → có 2 tab; chỉ là khách → không có tab.
export default function BongBongChat() {
    const { user } = useAuth()
    const { t } = useNgonNgu()
    const pathname = usePathname()
    const [mo, setMo] = useState(false)
    const [cheDo, setCheDo] = useState('khach')     // tab hiện tại: 'khach' | 'quan'
    const [chon, setChon] = useState(null)          // id hội thoại đang mở (null = xem danh sách)
    const [htKhach, setHtKhach] = useState([])      // mình là khách
    const [htQuan, setHtQuan] = useState([])        // mình là chủ (gộp cả quán ăn + gian hàng)
    const [quanId, setQuanId] = useState(null)      // quán ăn đã duyệt mình sở hữu (null nếu không có)
    const [gianId, setGianId] = useState(null)      // gian hàng chợ đã duyệt mình sở hữu (null nếu không có)
    const [daTai, setDaTai] = useState(false)
    const [khachTamId, setKhachTamId] = useState(null) // id khách vãng lai (chỉ khi CHƯA đăng nhập, sau khi mở hỗ trợ)
    const [dangMoHoTro, setDangMoHoTro] = useState(false)

    // Giữ trạng thái mới nhất cho handler realtime (bind 1 lần)
    const moRef = useRef(false); useEffect(() => { moRef.current = mo }, [mo])
    const chonRef = useRef(null); useEffect(() => { chonRef.current = chon }, [chon])
    const daDatTab = useRef(false)

    // Báo cho các nút nổi khác (vd nút "lên đầu trang") biết panel đang mở/đóng để tránh đè nhau
    useEffect(() => { window.dispatchEvent(new CustomEvent('chat:mo', { detail: { mo } })) }, [mo])

    // Ẩn nút nổi khi đang CUỘN XUỐNG (giống nút "lên đầu trang") — lúc đó khách đang xem hàng,
    // bong bóng hay đè lên thẻ sản phẩm / nút hành động. Cuộn lên hoặc dừng cuộn thì hiện lại.
    const [anKhiCuon, setAnKhiCuon] = useState(false)

    // Nhường chỗ khi trang sản phẩm bật thanh mua dính đáy: hai cái cùng ở góc phải-dưới,
    // bong bóng che đúng lên nút "Mua ngay". Mua hàng là việc chính nên chat lùi lên trên.
    const [coThanhMua, setCoThanhMua] = useState(false)
    useEffect(() => {
        const nghe = (e) => setCoThanhMua(!!e.detail?.hien)
        window.addEventListener('thanh-mua:hien', nghe)
        return () => window.removeEventListener('thanh-mua:hien', nghe)
    }, [])
    useEffect(() => {
        let truoc = window.scrollY
        let hen
        const onScroll = () => {
            const nay = window.scrollY
            if (nay > truoc + 4 && nay > 300) setAnKhiCuon(true)
            else if (nay < truoc - 4) setAnKhiCuon(false)
            truoc = nay
            // Dừng cuộn một lúc thì hiện lại để khách luôn gọi được hỗ trợ
            clearTimeout(hen)
            hen = setTimeout(() => setAnKhiCuon(false), 900)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => { window.removeEventListener('scroll', onScroll); clearTimeout(hen) }
    }, [])

    // Trang đã CÓ giao diện chat riêng → ẩn HẲN bong bóng (tránh trùng UI)
    const anHoanToan = /^\/tin-nhan/.test(pathname) || pathname === '/quan-an/tin-nhan'
    // Trang chi tiết quán ăn / gian hàng → vẫn render (để nút "Nhắn tin" mở panel ngay tại chỗ),
    // chỉ ẩn NÚT nổi để không đè lên thanh "Đặt món".
    const anNut = /^\/do-an\/.+/.test(pathname) || /^\/gian\/.+/.test(pathname)
    // Handler realtime vẫn chạy khi bong bóng ẩn → dùng ref này để KHÔNG kêu/toast ở trang
    // đã có chat riêng (tránh báo trùng 2 lần). Danh sách/chấm chưa đọc vẫn cập nhật.
    const anRef = useRef(anHoanToan); useEffect(() => { anRef.current = anHoanToan }, [anHoanToan])

    // Nút "Nhắn tin" ở trang quán/gian phát sự kiện này → mở panel + vào thẳng cuộc chat (không rời trang)
    useEffect(() => {
        const moNhanh = (e) => {
            const ht = e.detail?.hoiThoai
            if (!ht) return
            setCheDo('khach')
            setHtKhach(prev => [ht, ...prev.filter(h => h.id !== ht.id)])
            setChon(ht.id)
            setMo(true)
        }
        window.addEventListener('mo-hop-chat', moNhanh)
        return () => window.removeEventListener('mo-hop-chat', moNhanh)
    }, [])

    // Mở (hoặc tạo) cuộc chat HỖ TRỢ với admin — dùng được cả khi CHƯA đăng nhập (khách vãng lai).
    const moHoTro = async () => {
        if (dangMoHoTro) return
        setDangMoHoTro(true)
        try {
            const res = await fetch('/api/tin-nhan/bat-dau', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hoTro: true }),
            })
            const data = await res.json()
            if (!res.ok || !data.hoiThoai) return
            setCheDo('khach')
            setHtKhach(prev => [data.hoiThoai, ...prev.filter(h => h.id !== data.hoiThoai.id)])
            // Chưa đăng nhập → nhớ id khách vãng lai (từ hoiThoai) để nghe realtime kênh của mình
            if (!user && String(data.hoiThoai.userId || '').startsWith('g_')) setKhachTamId(data.hoiThoai.userId)
            setChon(data.hoiThoai.id)
            setMo(true)
        } finally { setDangMoHoTro(false) }
    }

    // Tải: hội thoại KHÁCH + (nếu là chủ quán ăn/gian đã duyệt) hội thoại BÁN HÀNG (gộp cả hai)
    useEffect(() => {
        if (!user) { setHtKhach([]); setHtQuan([]); setQuanId(null); setGianId(null); setDaTai(false); daDatTab.current = false; return }
        let huy = false
        setHtQuan([])
        fetch('/api/tin-nhan').then(r => r.json()).then(d => { if (!huy) { setHtKhach(d.hoiThoais || []); setDaTai(true) } }).catch(() => {})
        // Chủ quán ăn
        fetch('/api/quan-an/me').then(r => r.json()).then(d => {
            if (huy || !d.quanAn || d.quanAn.status !== 'da_duyet') return
            setQuanId(d.quanAn.id)
            fetch('/api/quan-an/tin-nhan').then(r => r.json()).then(x => { if (!huy) setHtQuan(prev => gopHt(prev, x.hoiThoais || [])) }).catch(() => {})
        }).catch(() => {})
        // Chủ gian hàng chợ (Chợ Tươi / Quà)
        fetch('/api/store/me').then(r => r.json()).then(d => {
            if (huy || !d.store || d.store.status !== 'da_duyet') return
            setGianId(d.store.id)
            fetch('/api/gian/tin-nhan').then(r => r.json()).then(x => { if (!huy) setHtQuan(prev => gopHt(prev, x.hoiThoais || [])) }).catch(() => {})
        }).catch(() => {})
        return () => { huy = true }
    }, [user])

    // Chủ cửa hàng mà chưa từng nhắn với ai → mặc định mở thẳng tab "Cửa hàng"
    useEffect(() => {
        if (daDatTab.current) return
        if ((quanId || gianId) && daTai && htKhach.length === 0 && htQuan.length > 0) { setCheDo('quan'); daDatTab.current = true }
    }, [quanId, gianId, daTai, htKhach.length, htQuan.length])

    // Realtime kênh KHÁCH: quán trả lời mình
    useEffect(() => {
        if (!user) return
        const pusher = layPusherClient(); if (!pusher) return
        const ch = pusher.subscribe(`private-khach-${user.id}`)
        const xuLy = ({ hoiThoai }) => {
            if (!hoiThoai) return
            setHtKhach(prev => [hoiThoai, ...prev.filter(h => h.id !== hoiThoai.id)])
            const dangXem = moRef.current && chonRef.current === hoiThoai.id
            if (hoiThoai.tinCuoiBen === 'quan' && !dangXem && !anRef.current) {
                keuTing()
                toast(t => (
                    <span className='cursor-pointer' onClick={() => { setCheDo('khach'); setChon(hoiThoai.id); setMo(true); toast.dismiss(t.id) }}>
                        💬 <b>{hoiThoai.tenQuan}</b>: {hoiThoai.tinCuoi}
                    </span>
                ), { icon: '💬' })
            }
        }
        ch.bind('co-tin', xuLy)
        // Chỉ gỡ handler của mình, KHÔNG unsubscribe kênh — ThongBaoDon (ở root layout) còn dùng chung kênh này.
        return () => { ch.unbind('co-tin', xuLy) }
    }, [user])

    // Realtime cho KHÁCH VÃNG LAI: admin trả lời cuộc hỗ trợ của mình (kênh riêng theo id khách vãng lai)
    useEffect(() => {
        if (user || !khachTamId) return
        const pusher = layPusherClient(); if (!pusher) return
        const ch = pusher.subscribe(`private-khach-${khachTamId}`)
        const xuLy = ({ hoiThoai }) => {
            if (!hoiThoai) return
            setHtKhach(prev => [hoiThoai, ...prev.filter(h => h.id !== hoiThoai.id)])
            const dangXem = moRef.current && chonRef.current === hoiThoai.id
            if (hoiThoai.tinCuoiBen === 'quan' && !dangXem && !anRef.current) {
                keuTing()
                toast(tt => (
                    <span className='cursor-pointer' onClick={() => { setCheDo('khach'); setChon(hoiThoai.id); setMo(true); toast.dismiss(tt.id) }}>
                        💬 <b>{hoiThoai.tenQuan}</b>: {hoiThoai.tinCuoi}
                    </span>
                ), { icon: '💬' })
            }
        }
        ch.bind('co-tin', xuLy)
        return () => { ch.unbind('co-tin', xuLy); pusher.unsubscribe(`private-khach-${khachTamId}`) }
    }, [user, khachTamId])

    // Realtime kênh BÁN HÀNG: khách nhắn tới quán ăn / gian hàng của mình (nghe cả 2 kênh)
    useEffect(() => {
        const pusher = layPusherClient(); if (!pusher) return
        const cacKenh = [quanId, gianId].filter(Boolean).map(id => `private-quan-${id}`)
        if (!cacKenh.length) return
        const xuLy = ({ hoiThoai }) => {
            if (!hoiThoai) return
            setHtQuan(prev => [hoiThoai, ...prev.filter(h => h.id !== hoiThoai.id)])
            const dangXem = moRef.current && chonRef.current === hoiThoai.id
            if (hoiThoai.tinCuoiBen === 'khach' && !dangXem && !anRef.current) {
                keuTing()
                toast(t => (
                    <span className='cursor-pointer' onClick={() => { setCheDo('quan'); setChon(hoiThoai.id); setMo(true); toast.dismiss(t.id) }}>
                        🔔 <b>{hoiThoai.tenKhach}</b>: {hoiThoai.tinCuoi}
                    </span>
                ), { icon: '🔔' })
            }
        }
        const chs = cacKenh.map(ten => { const ch = pusher.subscribe(ten); ch.bind('co-tin', xuLy); return ch })
        // Chỉ gỡ handler của mình, KHÔNG unsubscribe kênh — ThongBaoDon còn dùng chung để nhận đơn.
        return () => { chs.forEach(ch => ch.unbind('co-tin', xuLy)) }
    }, [quanId, gianId])

    const khachChuaDoc = useMemo(() => htKhach.reduce((s, h) => s + (h.chuaDocKhach || 0), 0), [htKhach])
    const quanChuaDoc = useMemo(() => htQuan.reduce((s, h) => s + (h.chuaDocQuan || 0), 0), [htQuan])
    const tongChuaDoc = khachChuaDoc + quanChuaDoc

    // Mở cuộc nào thì xóa chấm chưa đọc của cuộc đó (đúng theo tab đang xem)
    const daDoc = (id) => {
        if (cheDo === 'khach') setHtKhach(prev => prev.map(h => h.id === id ? { ...h, chuaDocKhach: 0 } : h))
        else setHtQuan(prev => prev.map(h => h.id === id ? { ...h, chuaDocQuan: 0 } : h))
    }

    const laChuCuaHang = !!quanId || !!gianId
    const laQuanTab = cheDo === 'quan'
    const dsHienTai = laQuanTab ? htQuan : htKhach
    const htDangChon = dsHienTai.find(h => h.id === chon)
    const tenDoiPhuong = laQuanTab ? htDangChon?.tenKhach : htDangChon?.tenQuan
    const doiTab = (tab) => { setCheDo(tab); setChon(null) }

    if (user === undefined || anHoanToan) return null

    return (
        <>
            {/* Panel chat mini */}
            {mo && (
                <div className='fixed z-50 bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden
                    inset-x-3 bottom-32 top-20 rounded-2xl
                    sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-24 sm:w-[370px] sm:h-[540px]'>
                    {!user ? (
                        chon ? (
                            // Khách vãng lai đang chat hỗ trợ
                            <>
                                <ThanhDau tieuDe={tenDoiPhuong || t('Hỗ trợ Chợ Số', 'Cho So Support', '市场客服')} onVe={() => setChon(null)} onDong={() => setMo(false)} />
                                <div className='flex-1 min-h-0'>
                                    <HopChat key={chon} hoiThoaiId={chon} anDau vien={false} khungCao='h-full' onDoc={daDoc} />
                                </div>
                            </>
                        ) : (
                            // Chưa đăng nhập: nhắn hỗ trợ ngay (không cần đăng nhập) HOẶC đăng nhập để chat với quán
                            <>
                                <ThanhDau tieuDe={t('Tin nhắn', 'Messages', '消息')} onDong={() => setMo(false)} />
                                <div className='flex-1 flex flex-col items-center justify-center text-center px-6 gap-3'>
                                    <div className='size-14 rounded-full flex items-center justify-center' style={{ backgroundColor: MAU + '1a' }}>
                                        <LifeBuoy size={30} style={{ color: MAU }} />
                                    </div>
                                    <p className='text-sm text-slate-600 font-medium'>{t('Cần giúp đỡ? Nhắn cho đội hỗ trợ Chợ Số ngay — không cần đăng nhập.', 'Need help? Message Cho So support now — no sign-in needed.', '需要帮助？立即联系市场客服 —— 无需登录。')}</p>
                                    <button onClick={moHoTro} disabled={dangMoHoTro}
                                        className='flex items-center gap-2 text-white px-6 py-2.5 rounded-full text-sm font-semibold active:scale-95 transition disabled:opacity-60' style={{ backgroundColor: MAU }}>
                                        <LifeBuoy size={15} /> {dangMoHoTro ? t('Đang mở...', 'Opening...', '打开中...') : t('Liên hệ hỗ trợ', 'Contact support', '联系客服')}
                                    </button>
                                    <p className='text-xs text-slate-400'>{t('hoặc', 'or', '或')} <Link href='/login?ve=/do-an' onClick={() => setMo(false)} className='underline font-medium' style={{ color: MAU }}>{t('đăng nhập', 'sign in', '登录')}</Link> {t('để nhắn với quán ăn & gian hàng.', 'to chat with eateries & stores.', '以联系餐馆和店铺。')}</p>
                                </div>
                            </>
                        )
                    ) : chon ? (
                        // Đang mở một cuộc chat
                        <>
                            <ThanhDau tieuDe={tenDoiPhuong || t('Trò chuyện', 'Chat', '聊天')} onVe={() => setChon(null)} onDong={() => setMo(false)}
                                anh={laQuanTab ? '' : htDangChon?.logoQuan} tenAnh={tenDoiPhuong || ''} />
                            <div className='flex-1 min-h-0'>
                                <HopChat key={chon} hoiThoaiId={chon} anDau vien={false} khungCao='h-full' onDoc={daDoc} />
                            </div>
                        </>
                    ) : (
                        // Danh sách hội thoại (kèm tab nếu là chủ quán)
                        <>
                            <ThanhDau tieuDe={t('Tin nhắn', 'Messages', '消息')} onDong={() => setMo(false)} themPhai={<NutBatThongBao gonNhe />} />
                            {laChuCuaHang && (
                                <div className='flex shrink-0 border-b border-slate-100'>
                                    <TabNut ten={t('Khách', 'Customer', '顾客')} Icon={User} active={!laQuanTab} badge={khachChuaDoc} onClick={() => doiTab('khach')} />
                                    <TabNut ten={t('Cửa hàng', 'Store', '店铺')} Icon={Store} active={laQuanTab} badge={quanChuaDoc} onClick={() => doiTab('quan')} />
                                </div>
                            )}
                            <div className='flex-1 overflow-y-auto divide-y divide-slate-100'>
                                {/* Nút mở chat HỖ TRỢ — chỉ hiện ở tab Khách khi CHƯA có cuộc hỗ trợ nào (nếu có thì nó hiện trong danh sách bên dưới) */}
                                {!laQuanTab && !htKhach.some(h => h.loaiDoiTac === 'admin') && (
                                    <button onClick={moHoTro} disabled={dangMoHoTro}
                                        className='w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition'>
                                        <div className='size-10 rounded-full flex items-center justify-center text-white shrink-0' style={{ backgroundColor: MAU }}>
                                            <LifeBuoy size={18} />
                                        </div>
                                        <div className='min-w-0 flex-1'>
                                            <p className='font-semibold text-slate-800 truncate text-sm'>{t('Hỗ trợ Chợ Số', 'Cho So Support', '市场客服')}</p>
                                            <p className='text-xs text-slate-500 truncate'>{t('Nhắn cho đội hỗ trợ khi cần giúp đỡ', 'Message our team for help', '需要帮助时联系客服')}</p>
                                        </div>
                                    </button>
                                )}
                                {!daTai && <p className='text-center text-sm text-slate-400 py-10'>{t('Đang tải...', 'Loading...', '加载中...')}</p>}
                                {daTai && dsHienTai.length === 0 && (
                                    <div className='flex flex-col items-center justify-center py-14 text-slate-400 gap-2 px-6 text-center'>
                                        <MessageCircle size={32} />
                                        <p className='text-sm'>
                                            {laQuanTab ? t('Chưa có khách nào nhắn tới cửa hàng.', 'No customers have messaged your store yet.', '还没有顾客联系您的店铺。') : t('Chưa có tin nhắn. Vào một quán ăn hoặc gian hàng và bấm "Nhắn tin" nhé!', 'No messages yet. Visit an eatery or store and tap "Message"!', '暂无消息。进入餐馆或店铺并点击"联系"吧！')}
                                        </p>
                                    </div>
                                )}
                                {dsHienTai.map(h => {
                                    const ten = laQuanTab ? h.tenKhach : h.tenQuan
                                    const minhGuiCuoi = laQuanTab ? h.tinCuoiBen === 'quan' : h.tinCuoiBen === 'khach'
                                    const chuaDoc = laQuanTab ? h.chuaDocQuan : h.chuaDocKhach
                                    return (
                                        <button key={h.id} onClick={() => setChon(h.id)}
                                            className='w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition'>
                                            <AnhDaiDien src={laQuanTab ? '' : h.logoQuan} ten={ten} mau={MAU}
                                                khung='size-10 rounded-full' chu='text-white font-semibold' />
                                            <div className='min-w-0 flex-1'>
                                                <p className='font-semibold text-slate-800 truncate text-sm'>{ten}</p>
                                                <p className='text-xs text-slate-500 truncate'>
                                                    {minhGuiCuoi && <span className='text-slate-400'>{t('Bạn: ', 'You: ', '你：')}</span>}
                                                    {h.tinCuoi || t('Bắt đầu trò chuyện', 'Start chatting', '开始聊天')}
                                                </p>
                                            </div>
                                            {chuaDoc > 0 && (
                                                <span className='text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full shrink-0' style={{ backgroundColor: MAU }}>{chuaDoc}</span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Nút bong bóng nổi — ẩn ở trang chi tiết (mở qua nút "Nhắn tin"), tránh đè thanh Đặt món */}
            {!anNut && (
                <button
                    onClick={() => setMo(v => !v)} aria-label={t('Tin nhắn', 'Messages', '消息')}
                    className={`fixed z-40 right-4 ${coThanhMua ? 'bottom-[calc(9.5rem+env(safe-area-inset-bottom))] lg:bottom-24' : 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-6'} size-14 rounded-full text-white flex items-center justify-center shadow-xl active:scale-90 transition-all duration-300 ${anKhiCuon && !mo ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}
                    style={{ backgroundColor: MAU }}>
                    {mo ? <X size={24} /> : <MessageCircle size={24} />}
                    {!mo && tongChuaDoc > 0 && (
                        <span className='absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 flex items-center justify-center text-ti font-bold bg-red-500 text-white rounded-full ring-2 ring-white'>
                            {tongChuaDoc > 99 ? '99+' : tongChuaDoc}
                        </span>
                    )}
                </button>
            )}
        </>
    )
}

// Một tab (Khách / Quán) trong panel — kèm chấm chưa đọc riêng
function TabNut({ ten, Icon, active, badge, onClick }) {
    return (
        <button onClick={onClick}
            className='flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold border-b-2 transition'
            style={active ? { color: MAU, borderColor: MAU } : { color: '#94a3b8', borderColor: 'transparent' }}>
            <Icon size={15} /> {ten}
            {badge > 0 && (
                <span className='min-w-4 h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full' style={{ backgroundColor: '#ef4444' }}>{badge}</span>
            )}
        </button>
    )
}

// Thanh tiêu đề của panel: (tùy chọn) nút quay lại + (tùy chọn) avatar + tiêu đề + (tùy chọn) nội dung phải + nút đóng
// Truyền tenAnh (kể cả chuỗi rỗng) để hiện avatar trước tiêu đề; anh là logo quán (rỗng → dùng chữ cái).
function ThanhDau({ tieuDe, onVe, onDong, themPhai, anh, tenAnh }) {
    const { t } = useNgonNgu()
    return (
        <div className='flex items-center gap-2 px-3 py-3 text-white shrink-0' style={{ backgroundColor: MAU }}>
            {onVe && (
                <button onClick={onVe} aria-label={t('Quay lại', 'Back', '返回')} className='size-8 flex items-center justify-center rounded-full hover:bg-white/20'>
                    <ArrowLeft size={18} />
                </button>
            )}
            {tenAnh !== undefined && (
                <AnhDaiDien src={anh} ten={tenAnh} khung='size-8 rounded-full bg-white/20' chu='text-white font-semibold text-sm' />
            )}
            <p className='flex-1 font-semibold truncate px-1'>{tieuDe}</p>
            {themPhai}
            <button onClick={onDong} aria-label={t('Đóng', 'Close', '关闭')} className='size-8 flex items-center justify-center rounded-full hover:bg-white/20'>
                <X size={18} />
            </button>
        </div>
    )
}
