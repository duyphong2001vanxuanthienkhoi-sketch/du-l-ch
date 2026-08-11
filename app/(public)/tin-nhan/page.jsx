'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Loading from '@/components/Loading'
import NutBatThongBao from '@/components/NutBatThongBao'
import AnhDaiDien from '@/components/AnhDaiDien'
import { useAuth } from '@/components/AuthProvider'
import { useNgonNgu } from '@/lib/i18n'
import { layPusherClient } from '@/lib/pusherClient'
import { LifeBuoy, MessageCircle } from 'lucide-react'

const MAU = '#ea580c'

// Hộp thư của KHÁCH: danh sách các cuộc chat với quán.
export default function HopThuKhach() {
    const { user } = useAuth()
    const { t } = useNgonNgu()
    const router = useRouter()
    const [hoiThoais, setHoiThoais] = useState([])
    const [loading, setLoading] = useState(true)
    const [dangMoHoTro, setDangMoHoTro] = useState(false)

    // Nhắn với đội hỗ trợ (admin): mở/tạo cuộc chat hỗ trợ rồi vào thẳng trang chat
    const moHoTro = async () => {
        if (!user) { router.push('/login?ve=/tin-nhan'); return }
        setDangMoHoTro(true)
        try {
            const res = await fetch('/api/tin-nhan/bat-dau', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hoTro: true }),
            })
            const data = await res.json()
            if (res.ok && data.hoiThoai) router.push(`/tin-nhan/${data.hoiThoai.id}`)
        } finally { setDangMoHoTro(false) }
    }

    useEffect(() => {
        if (user === undefined) return
        if (user === null) { setLoading(false); return }
        fetch('/api/tin-nhan').then(r => r.json()).then(d => setHoiThoais(d.hoiThoais || [])).catch(() => {}).finally(() => setLoading(false))
    }, [user])

    // Realtime: có tin mới thì cập nhật đúng dòng hội thoại + đưa lên đầu
    useEffect(() => {
        if (!user) return
        const pusher = layPusherClient()
        if (!pusher) return
        const ch = pusher.subscribe(`private-khach-${user.id}`)
        const xuLy = ({ hoiThoai }) => {
            if (!hoiThoai) return
            setHoiThoais(prev => [hoiThoai, ...prev.filter(h => h.id !== hoiThoai.id)])
        }
        ch.bind('co-tin', xuLy)
        return () => { ch.unbind('co-tin', xuLy); pusher.unsubscribe(`private-khach-${user.id}`) }
    }, [user])

    if (user === undefined || loading) return <Loading />

    if (!user) return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-6'>
            <MessageCircle size={48} className='text-slate-300' />
            <h1 className='text-2xl font-semibold text-slate-700 mt-4'>{t('Tin nhắn', 'Messages', '消息')}</h1>
            <p className='text-slate-500 text-sm mt-2'>{t('Đăng nhập để nhắn tin với các quán ăn.', 'Sign in to chat with eateries.', '登录以与餐馆聊天。')}</p>
            <Link href='/login?ve=/tin-nhan' className='text-white px-8 py-2.5 rounded-full mt-6 text-sm font-medium' style={{ backgroundColor: MAU }}>{t('Đăng nhập', 'Sign in', '登录')}</Link>
        </div>
    )

    return (
        <div className='min-h-[70vh] mx-6 my-10 mb-28 max-w-2xl md:mx-auto'>
            <div className='flex items-center justify-between gap-3 mb-6'>
                <h1 className='text-2xl text-slate-500'>{t('Tin', 'My', '我的')} <span className='text-slate-800 font-medium'>{t('nhắn của tôi', 'messages', '消息')}</span></h1>
                <div className='flex items-center gap-2'>
                    <button onClick={moHoTro} disabled={dangMoHoTro}
                        className='flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-full active:scale-95 transition disabled:opacity-60'
                        style={{ backgroundColor: MAU }}>
                        <LifeBuoy size={15} /> {dangMoHoTro ? t('Đang mở...', 'Opening...', '打开中...') : t('Liên hệ hỗ trợ', 'Contact support', '联系客服')}
                    </button>
                    <NutBatThongBao />
                </div>
            </div>

            {hoiThoais.length ? (
                <div className='flex flex-col divide-y divide-slate-100 bg-white border border-slate-100 rounded-2xl overflow-hidden'>
                    {hoiThoais.map(h => (
                        <Link key={h.id} href={`/tin-nhan/${h.id}`} className='flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition'>
                            <AnhDaiDien src={h.logoQuan} ten={h.tenQuan} mau={MAU}
                                khung='size-11 rounded-full' chu='text-white font-semibold' />
                            <div className='min-w-0 flex-1'>
                                <p className='font-semibold text-slate-800 truncate'>{h.tenQuan}</p>
                                <p className='text-sm text-slate-500 truncate'>
                                    {h.tinCuoiBen === 'khach' && <span className='text-slate-400'>{t('Bạn: ', 'You: ', '你：')}</span>}
                                    {h.tinCuoi || t('Bắt đầu trò chuyện', 'Start chatting', '开始聊天')}
                                </p>
                            </div>
                            {h.chuaDocKhach > 0 && (
                                <span className='text-ti font-bold text-white px-2 py-0.5 rounded-full shrink-0' style={{ backgroundColor: MAU }}>{h.chuaDocKhach}</span>
                            )}
                        </Link>
                    ))}
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center py-16 text-slate-400 gap-3 bg-slate-50 rounded-2xl'>
                    <MessageCircle size={36} />
                    <p className='text-sm'>{t('Chưa có tin nhắn nào — vào một', 'No messages yet — visit an', '暂无消息 —— 进入')} <Link href='/do-an' className='underline font-medium' style={{ color: MAU }}>{t('quán ăn', 'eatery', '餐馆')}</Link> {t('hoặc', 'or', '或')} <Link href='/shop' className='underline font-medium' style={{ color: MAU }}>{t('gian hàng chợ', 'market store', '市场店铺')}</Link> {t('và bấm "Nhắn tin" nhé!', 'and tap "Message"!', '并点击"联系"吧！')}</p>
                </div>
            )}
        </div>
    )
}
