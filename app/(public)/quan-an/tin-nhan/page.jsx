'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import HopChat from '@/components/HopChat'
import NutBatThongBao from '@/components/NutBatThongBao'
import { layPusherClient } from '@/lib/pusherClient'
import { useNgonNgu } from '@/lib/i18n'
import { MessageCircle, UtensilsCrossed } from 'lucide-react'

const MAU = '#ea580c'

// Hộp thư của CHỦ QUÁN: danh sách khách nhắn tới + khung chat (2 cột trên máy tính).
export default function HopThuQuan() {
    const { t } = useNgonNgu()
    const [hoiThoais, setHoiThoais] = useState([])
    const [quanAnId, setQuanAnId] = useState(null)
    const [chon, setChon] = useState(null)          // id hội thoại đang mở
    const [trangThai, setTrangThai] = useState('dang') // dang | ok | chuaCoQuan

    useEffect(() => {
        fetch('/api/quan-an/tin-nhan').then(async r => {
            if (r.status === 403) { setTrangThai('chuaCoQuan'); return }
            const d = await r.json()
            setHoiThoais(d.hoiThoais || []); setQuanAnId(d.quanAnId || null); setTrangThai('ok')
        }).catch(() => setTrangThai('ok'))
    }, [])

    // Realtime: khách nhắn tới → cập nhật danh sách + báo (nếu không phải đang mở đúng hội thoại đó)
    useEffect(() => {
        if (!quanAnId) return
        const pusher = layPusherClient()
        if (!pusher) return
        const ch = pusher.subscribe(`private-quan-${quanAnId}`)
        const xuLy = ({ hoiThoai }) => {
            if (!hoiThoai) return
            setHoiThoais(prev => [hoiThoai, ...prev.filter(h => h.id !== hoiThoai.id)])
            if (hoiThoai.tinCuoiBen === 'khach' && hoiThoai.id !== chon) {
                toast(`${hoiThoai.tenKhach}: ${hoiThoai.tinCuoi}`, { icon: '💬' })
            }
        }
        ch.bind('co-tin', xuLy)
        return () => { ch.unbind('co-tin', xuLy); pusher.unsubscribe(`private-quan-${quanAnId}`) }
    }, [quanAnId, chon])

    // Mở hội thoại nào thì xóa chấm chưa đọc của dòng đó
    const daDoc = (id) => setHoiThoais(prev => prev.map(h => h.id === id ? { ...h, chuaDocQuan: 0 } : h))

    if (trangThai === 'dang') return <Loading />

    if (trangThai === 'chuaCoQuan') return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-6'>
            <UtensilsCrossed size={48} className='text-slate-300' />
            <h1 className='text-2xl font-semibold text-slate-700 mt-4'>{t('Bạn chưa có quán ăn', "You don't have an eatery yet", '您还没有餐馆')}</h1>
            <p className='text-slate-500 text-sm mt-2'>{t('Mở quán ăn để nhận tin nhắn từ khách.', 'Open an eatery to receive messages from customers.', '开设餐馆以接收顾客消息。')}</p>
            <Link href='/create-quan-an' className='text-white px-8 py-2.5 rounded-full mt-6 text-sm font-medium' style={{ backgroundColor: MAU }}>{t('Mở quán ăn', 'Open an eatery', '开设餐馆')}</Link>
        </div>
    )

    return (
        <div className='mx-4 sm:mx-6 my-8 mb-28 max-w-5xl sm:mx-auto'>
            <div className='flex items-center justify-between gap-3 mb-5'>
                <h1 className='text-2xl text-slate-500'>{t('Tin nhắn', 'Messages', '消息')} <span className='text-slate-800 font-medium'>{t('khách hàng', 'from customers', '顾客')}</span></h1>
                <div className='flex items-center gap-3'>
                    <NutBatThongBao />
                    <Link href='/quan-an/don-hang' className='text-sm font-semibold' style={{ color: MAU }}>{t('Đơn hàng', 'Orders', '订单')}</Link>
                </div>
            </div>

            <div className='grid sm:grid-cols-[300px_1fr] gap-4'>
                {/* Danh sách hội thoại — ẩn trên điện thoại khi đã mở một cuộc */}
                <div className={`${chon ? 'max-sm:hidden' : ''} bg-white border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 h-fit`}>
                    {hoiThoais.length === 0 && (
                        <div className='flex flex-col items-center justify-center py-14 text-slate-400 gap-2'>
                            <MessageCircle size={32} /><p className='text-sm'>{t('Chưa có khách nhắn tin.', 'No customer messages yet.', '暂无顾客消息。')}</p>
                        </div>
                    )}
                    {hoiThoais.map(h => (
                        <button key={h.id} onClick={() => setChon(h.id)}
                            className={`w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition ${chon === h.id ? 'bg-orange-50' : ''}`}>
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
                        <HopChat key={chon} hoiThoaiId={chon} onVe={() => setChon(null)} onDoc={daDoc} />
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
