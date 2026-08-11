'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import HopChat from '@/components/HopChat'
import { layPusherClient } from '@/lib/pusherClient'
import { useNgonNgu } from '@/lib/i18n'
import { LifeBuoy, MessageCircle } from 'lucide-react'

const MAU = '#16a34a' // xanh lá — tông của khu quản trị

// Hộp thư HỖ TRỢ của ADMIN: danh sách khách đã nhắn tới + khung chat (2 cột trên máy tính).
// Nằm trong /admin nên AdminLayout đã chặn người không phải admin.
export default function HoTroAdmin() {
    const { t } = useNgonNgu()
    const [hoiThoais, setHoiThoais] = useState([])
    const [chon, setChon] = useState(null)          // id hội thoại đang mở
    const [trangThai, setTrangThai] = useState('dang') // dang | ok

    useEffect(() => {
        fetch('/api/admin/tin-nhan').then(async r => {
            if (!r.ok) { setTrangThai('ok'); return }
            const d = await r.json()
            setHoiThoais(d.hoiThoais || []); setTrangThai('ok')
        }).catch(() => setTrangThai('ok'))
    }, [])

    // Realtime: khách nhắn hỗ trợ → cập nhật danh sách + báo (nếu không phải đang mở đúng hội thoại đó)
    useEffect(() => {
        const pusher = layPusherClient()
        if (!pusher) return
        const ch = pusher.subscribe('private-admin')
        const xuLy = ({ hoiThoai }) => {
            if (!hoiThoai) return
            setHoiThoais(prev => [hoiThoai, ...prev.filter(h => h.id !== hoiThoai.id)])
            if (hoiThoai.tinCuoiBen === 'khach' && hoiThoai.id !== chon) {
                toast(`${hoiThoai.tenKhach}: ${hoiThoai.tinCuoi}`, { icon: '🆘' })
            }
        }
        ch.bind('co-tin', xuLy)
        return () => { ch.unbind('co-tin', xuLy); pusher.unsubscribe('private-admin') }
    }, [chon])

    // Mở hội thoại nào thì xóa chấm chưa đọc của dòng đó
    const daDoc = (id) => setHoiThoais(prev => prev.map(h => h.id === id ? { ...h, chuaDocQuan: 0 } : h))

    if (trangThai === 'dang') return <Loading />

    return (
        <div className='max-w-5xl'>
            <h1 className='flex items-center gap-2 text-2xl text-slate-500 mb-5'>
                <LifeBuoy size={22} style={{ color: MAU }} />
                {t('Tin nhắn', 'Messages', '消息')} <span className='text-slate-800 font-medium'>{t('hỗ trợ khách hàng', 'customer support', '客户支持')}</span>
            </h1>

            <div className='grid sm:grid-cols-[300px_1fr] gap-4'>
                {/* Danh sách hội thoại — ẩn trên điện thoại khi đã mở một cuộc */}
                <div className={`${chon ? 'max-sm:hidden' : ''} bg-white border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 h-fit`}>
                    {hoiThoais.length === 0 && (
                        <div className='flex flex-col items-center justify-center py-14 text-slate-400 gap-2'>
                            <MessageCircle size={32} /><p className='text-sm'>{t('Chưa có khách nhắn hỗ trợ.', 'No support messages yet.', '暂无支持消息。')}</p>
                        </div>
                    )}
                    {hoiThoais.map(h => (
                        <button key={h.id} onClick={() => setChon(h.id)}
                            className={`w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition ${chon === h.id ? 'bg-green-50' : ''}`}>
                            <div className='size-11 rounded-full flex items-center justify-center text-white font-semibold shrink-0' style={{ backgroundColor: MAU }}>
                                {(h.tenKhach || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className='min-w-0 flex-1'>
                                <p className='font-semibold text-slate-800 truncate'>{h.tenKhach}</p>
                                <p className='text-sm text-slate-500 truncate'>
                                    {h.tinCuoiBen === 'quan' && <span className='text-slate-400'>{t('Bạn: ', 'You: ', '你：')}</span>}
                                    {h.tinCuoi || t('Bắt đầu trò chuyện', 'Start chatting', '开始聊天')}
                                </p>
                            </div>
                            {h.chuaDocQuan > 0 && (
                                <span className='text-ti font-bold text-white px-2 py-0.5 rounded-full shrink-0' style={{ backgroundColor: MAU }}>{h.chuaDocQuan}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Khung chat */}
                <div className={`${chon ? '' : 'max-sm:hidden'}`}>
                    {chon ? (
                        <HopChat key={chon} hoiThoaiId={chon} mau={MAU} onVe={() => setChon(null)} onDoc={daDoc} />
                    ) : (
                        <div className='hidden sm:flex flex-col items-center justify-center h-[70vh] bg-white border border-slate-100 rounded-2xl text-slate-400 gap-3'>
                            <MessageCircle size={40} />
                            <p className='text-sm'>{t('Chọn một khách để bắt đầu trả lời.', 'Select a customer to start replying.', '选择一位顾客开始回复。')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
