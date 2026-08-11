'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { layPusherClient } from '@/lib/pusherClient'
import { useNgonNgu } from '@/lib/i18n'
import AnhDaiDien from '@/components/AnhDaiDien'

// Khung một cuộc chat KHÁCH ↔ QUÁN, dùng chung cho cả trang khách và trang chủ quán.
// - Tự biết mình là 'khach' hay 'quan' nhờ API trả về (không cần truyền vào).
// - Nhận tin realtime qua Pusher kênh private-ht-<id>; gửi tin qua POST.
// Props: hoiThoaiId, veLink (Link quay lại) HOẶC onVe (hàm quay lại, ưu tiên), mau, onDoc,
//        hienVeLuon (hiện nút quay lại cả trên máy tính), khungCao (class chiều cao), vien (viền+bo góc),
//        anDau (ẩn thanh tiêu đề — dùng khi cha tự vẽ header, vd bong bóng chat mini).
export default function HopChat({ hoiThoaiId, veLink, onVe, hienVeLuon = false, mau = '#ea580c', onDoc, khungCao = 'h-[70vh]', vien = true, anDau = false }) {
    const { t } = useNgonNgu()
    const [hoiThoai, setHoiThoai] = useState(null)
    const [tinNhan, setTinNhan] = useState([])
    const [ben, setBen] = useState(null)          // 'khach' | 'quan' = mình là ai
    const [loading, setLoading] = useState(true)
    const [loi, setLoi] = useState(null)
    const [noiDung, setNoiDung] = useState('')
    const [dangGui, setDangGui] = useState(false)

    const dsRef = useRef(null)                      // khung danh sách tin (để cuộn nội bộ)
    const benRef = useRef(null)
    useEffect(() => { benRef.current = ben }, [ben])

    // Thêm tin, tránh trùng (Pusher có thể echo lại tin mình vừa gửi)
    const themTin = (tin) => setTinNhan(prev => prev.some(t => t.id === tin.id) ? prev : [...prev, tin])

    // Tải nội dung hội thoại + đánh dấu đã đọc
    useEffect(() => {
        let huy = false
        setLoading(true); setLoi(null)
        fetch(`/api/tin-nhan/${hoiThoaiId}`)
            .then(async r => { if (!r.ok) throw new Error((await r.json()).error || t('Lỗi', 'Error', '错误')); return r.json() })
            .then(d => {
                if (huy) return
                setHoiThoai(d.hoiThoai); setTinNhan(d.tinNhan || []); setBen(d.ben)
                onDoc?.(hoiThoaiId)
            })
            .catch(e => { if (!huy) setLoi(e.message) })
            .finally(() => { if (!huy) setLoading(false) })
        return () => { huy = true }
    }, [hoiThoaiId]) // eslint-disable-line react-hooks/exhaustive-deps

    // Realtime: nghe tin mới trên kênh của hội thoại
    useEffect(() => {
        const pusher = layPusherClient()
        if (!pusher) return
        const ch = pusher.subscribe(`private-ht-${hoiThoaiId}`)
        const xuLy = ({ tinNhan: tin }) => {
            if (!tin) return
            themTin(tin)
            // Nếu là tin của BÊN KIA gửi tới trong lúc mình đang mở → đánh dấu đã đọc (bỏ chấm chưa đọc)
            if (tin.ben !== benRef.current) {
                fetch(`/api/tin-nhan/${hoiThoaiId}`).catch(() => {})
                onDoc?.(hoiThoaiId)
            }
        }
        ch.bind('tin-moi', xuLy)
        return () => { ch.unbind('tin-moi', xuLy); pusher.unsubscribe(`private-ht-${hoiThoaiId}`) }
    }, [hoiThoaiId]) // eslint-disable-line react-hooks/exhaustive-deps

    // Cuộn xuống cuối khi có tin mới — CHỈ cuộn trong khung tin, không cuộn cả trang
    useEffect(() => {
        const el = dsRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [tinNhan])

    const gui = async () => {
        const text = noiDung.trim()
        if (!text || dangGui) return
        setDangGui(true)
        try {
            const res = await fetch(`/api/tin-nhan/${hoiThoaiId}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ noiDung: text }),
            })
            const data = await res.json()
            if (!res.ok) { setLoi(data.error || t('Gửi thất bại', 'Failed to send', '发送失败')); return }
            themTin(data.tinNhan)      // hiện ngay, không đợi Pusher
            setNoiDung('')
        } finally { setDangGui(false) }
    }

    const nhanPhim = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); gui() } }

    const khungRong = `flex flex-col items-center justify-center ${khungCao} bg-white ${vien ? 'rounded-2xl border border-slate-100' : ''}`
    if (loading) return (
        <div className={khungRong}>
            <div className='w-9 h-9 rounded-full border-[3px] border-slate-200 animate-spin' style={{ borderTopColor: mau }} />
        </div>
    )
    if (loi) return (
        <div className={`${khungRong} text-center px-6`}>
            <p className='text-slate-500'>{loi}</p>
            {onVe ? (
                <button onClick={onVe} className='mau-khu mt-4 text-sm font-semibold' style={{ '--mau-khu': mau }}>{t('← Quay lại', '← Back', '← 返回')}</button>
            ) : veLink && <Link href={veLink} className='mau-khu mt-4 text-sm font-semibold' style={{ '--mau-khu': mau }}>{t('← Quay lại', '← Back', '← 返回')}</Link>}
        </div>
    )

    // Tên bên đối diện để hiện ở tiêu đề
    const tenDoiPhuong = ben === 'quan' ? hoiThoai?.tenKhach : hoiThoai?.tenQuan

    return (
        <div className={`flex flex-col ${khungCao} bg-white overflow-hidden ${vien ? 'rounded-2xl border border-slate-100' : ''}`}>
            {/* Đầu khung */}
            {!anDau && (
                <div className='flex items-center gap-3 px-4 py-3 border-b border-slate-100 shrink-0'>
                    {onVe ? (
                        <button onClick={onVe} aria-label={t('Quay lại', 'Back', '返回')} className={`${hienVeLuon ? '' : 'sm:hidden'} size-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500`}>
                            <ArrowLeft size={18} />
                        </button>
                    ) : veLink && (
                        <Link href={veLink} aria-label={t('Quay lại', 'Back', '返回')} className={`${hienVeLuon ? '' : 'sm:hidden'} size-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500`}>
                            <ArrowLeft size={18} />
                        </Link>
                    )}
                    <AnhDaiDien src={ben === 'quan' ? '' : hoiThoai?.logoQuan} ten={tenDoiPhuong} mau={mau}
                        khung='size-9 rounded-full' chu='text-white font-semibold' />
                    <div className='min-w-0'>
                        <p className='font-semibold text-slate-800 truncate'>{tenDoiPhuong || t('Hội thoại', 'Conversation', '对话')}</p>
                        <p className='text-ti text-slate-400'>{ben === 'quan'
                            ? t('Khách hàng', 'Customer', '顾客')
                            : hoiThoai?.loaiDoiTac === 'admin' ? t('Hỗ trợ Chợ Số', 'Cho So Support', '市场客服')
                            : hoiThoai?.loaiDoiTac === 'gian' ? t('Gian hàng', 'Store', '店铺')
                            : t('Quán ăn', 'Eatery', '餐馆')}</p>
                    </div>
                </div>
            )}

            {/* Danh sách tin */}
            <div ref={dsRef} className='flex-1 overflow-y-auto px-4 py-4 bg-slate-50/60 space-y-2'>
                {tinNhan.length === 0 && (
                    <p className='text-center text-sm text-slate-400 py-10'>{t('Chưa có tin nhắn. Gửi lời chào đầu tiên nhé!', 'No messages yet. Send the first hello!', '暂无消息。发送第一句问候吧！')}</p>
                )}
                {tinNhan.map(tin => {
                    const cuaMinh = tin.ben === ben
                    return (
                        <div key={tin.id} className={`flex ${cuaMinh ? 'justify-end' : 'justify-start'}`}>
                            <div className='max-w-[78%] px-3.5 py-2 rounded-2xl text-sm break-words'
                                style={cuaMinh
                                    ? { backgroundColor: mau, color: '#fff', borderBottomRightRadius: 4 }
                                    : { backgroundColor: '#fff', color: '#334155', border: '1px solid #e2e8f0', borderBottomLeftRadius: 4 }}>
                                <p className='whitespace-pre-wrap'>{tin.noiDung}</p>
                                <p className={`text-[10px] mt-0.5 ${cuaMinh ? 'text-white/70' : 'text-slate-400'}`}>
                                    {new Date(tin.taoLuc).toLocaleTimeString(t('vi-VN', 'en-US', 'zh-CN'), { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Ô soạn tin */}
            <div className='flex items-end gap-2 px-3 py-3 border-t border-slate-100 shrink-0'>
                <textarea
                    value={noiDung} onChange={e => setNoiDung(e.target.value)} onKeyDown={nhanPhim}
                    rows={1} placeholder={t('Nhập tin nhắn...', 'Type a message...', '输入消息...')} maxLength={1000}
                    className='flex-1 resize-none bg-slate-100 px-4 py-2.5 rounded-2xl outline-none text-base sm:text-sm placeholder-slate-400 max-h-28' />
                <button onClick={gui} disabled={dangGui || !noiDung.trim()} aria-label={t('Gửi', 'Send', '发送')}
                    className='size-10 flex items-center justify-center rounded-full text-white shrink-0 active:scale-90 transition disabled:opacity-40'
                    style={{ backgroundColor: mau }}>
                    <Send size={17} />
                </button>
            </div>
        </div>
    )
}
