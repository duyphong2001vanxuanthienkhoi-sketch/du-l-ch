'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Loading from '@/components/Loading'
import { useAuth } from '@/components/AuthProvider'
import { useNgonNgu } from '@/lib/i18n'
import { formatVND } from '@/lib/utils/currency'
import { CAC_BUOC, HUY, TT, viTriBuoc } from '@/lib/donDoAn'
import { CheckCircle2, Clock, UtensilsCrossed } from 'lucide-react'

const MAU = '#ea580c'

// Trang khách theo dõi đơn đặt món của mình + trạng thái (chưa nhận -> đã giao).
export default function DonDoAnCuaToi() {
    const { user } = useAuth()
    const { t } = useNgonNgu()
    const [dons, setDons] = useState([])
    const [loading, setLoading] = useState(true)
    // Nhãn trạng thái đơn đồ ăn (dịch theo id — map gốc ở lib/donDoAn chỉ có tiếng Việt)
    const TT_TEXT = { cho_nhan: t('Chờ quán nhận', 'Awaiting acceptance', '等待接单'), da_nhan: t('Đã nhận đơn', 'Accepted', '已接单'), dang_giao: t('Đang giao', 'Delivering', '配送中'), da_giao: t('Đã giao', 'Delivered', '已送达'), huy: t('Đã hủy', 'Cancelled', '已取消') }
    const NGAN_TEXT = { cho_nhan: t('Chưa nhận', 'Pending', '待接单'), da_nhan: t('Đã nhận', 'Accepted', '已接单'), dang_giao: t('Đang giao', 'Delivering', '配送中'), da_giao: t('Đã giao', 'Delivered', '已送达') }

    const taiDon = () => fetch('/api/don-do-an/me').then(r => r.json()).then(d => setDons(d.dons || [])).catch(() => setDons([])).finally(() => setLoading(false))

    useEffect(() => {
        if (user === undefined) return
        if (user === null) { setLoading(false); return }
        taiDon()
        // Quán đổi trạng thái đơn → ThongBaoDon bắn 'don:refresh' → trạng thái nhảy ngay (khỏi F5)
        const onRefresh = (e) => { if (e.detail?.scope === 'khach-doan') taiDon() }
        window.addEventListener('don:refresh', onRefresh)
        return () => window.removeEventListener('don:refresh', onRefresh)
    }, [user])

    if (user === undefined || loading) return <Loading />

    if (!user) return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-6'>
            <UtensilsCrossed size={48} className='text-slate-300' />
            <h1 className='text-2xl font-semibold text-slate-700 mt-4'>{t('Đơn đồ ăn của tôi', 'My food orders', '我的餐饮订单')}</h1>
            <p className='text-slate-500 text-sm mt-2'>{t('Đăng nhập để xem và theo dõi các đơn đặt món của bạn.', 'Sign in to view and track your food orders.', '登录以查看和追踪您的餐饮订单。')}</p>
            <Link href='/login?ve=/don-do-an' className='text-white px-8 py-2.5 rounded-full mt-6 text-sm font-medium' style={{ backgroundColor: MAU }}>{t('Đăng nhập', 'Sign in', '登录')}</Link>
        </div>
    )

    return (
        <div className='min-h-[70vh] mx-6 my-10 mb-28 max-w-3xl md:mx-auto'>
            <h1 className='text-2xl text-slate-500 mb-6'>{t('Đơn', 'My', '我的')} <span className='text-slate-800 font-medium'>{t('đồ ăn của tôi', 'food orders', '餐饮订单')}</span></h1>

            {dons.length ? (
                <div className='flex flex-col gap-4'>
                    {dons.map(don => {
                        const vt = viTriBuoc(don.trangThai)
                        const huy = don.trangThai === 'huy'
                        const tt = TT[don.trangThai] || CAC_BUOC[0]
                        return (
                            <div key={don.id} className='bg-white border border-slate-100 rounded-2xl shadow-sm p-5'>
                                <div className='flex items-center justify-between gap-3 flex-wrap'>
                                    <Link href={`/do-an/${don.quanAnId}`} className='font-semibold text-slate-800 hover:underline'>{don.tenQuan}</Link>
                                    <span className='text-xs font-semibold px-3 py-1 rounded-full text-white' style={{ backgroundColor: tt.mau }}>{TT_TEXT[don.trangThai] || tt.ten}</span>
                                </div>
                                <p className='text-xs text-slate-400 mt-0.5'>{new Date(don.createdAt).toLocaleString(t('vi-VN', 'en-US', 'zh-CN'))}</p>

                                {/* Thanh tiến trình trạng thái */}
                                {!huy ? (
                                    <div className='flex items-center mt-4'>
                                        {CAC_BUOC.map((b, i) => (
                                            <div key={b.id} className='flex items-center flex-1 last:flex-none'>
                                                <div className='flex flex-col items-center'>
                                                    <span className='flex items-center justify-center size-7 rounded-full text-white shrink-0' style={{ backgroundColor: i <= vt ? b.mau : '#e2e8f0' }}>
                                                        {i < vt ? <CheckCircle2 size={15} /> : i === vt ? <Clock size={14} /> : <span className='text-ti'>{i + 1}</span>}
                                                    </span>
                                                    <span className='text-[10px] mt-1 text-center' style={{ color: i <= vt ? b.mau : '#94a3b8' }}>{NGAN_TEXT[b.id] || b.nhanNgan}</span>
                                                </div>
                                                {i < CAC_BUOC.length - 1 && <span className='flex-1 h-0.5 mx-1 -mt-4' style={{ backgroundColor: i < vt ? CAC_BUOC[i + 1].mau : '#e2e8f0' }} />}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className='text-sm text-red-500 mt-3'>{t('Đơn đã bị hủy.', 'This order has been cancelled.', '此订单已取消。')}</p>
                                )}

                                {/* Món + tổng */}
                                <div className='text-sm text-slate-600 mt-4 border-t border-slate-100 pt-3'>
                                    {don.items.map(it => (
                                        <div key={it.monId} className='flex items-center justify-between py-0.5'>
                                            <span>{it.soLuong} × {it.ten}</span>
                                            <span className='text-slate-500'>{formatVND(it.gia * it.soLuong)}</span>
                                        </div>
                                    ))}
                                    <div className='flex items-center justify-between pt-2 mt-1 border-t border-slate-100 font-bold text-slate-800'>
                                        <span>{t('Tổng cộng', 'Total', '合计')}</span><span style={{ color: MAU }}>{formatVND(don.tongTien)}</span>
                                    </div>
                                </div>
                                <p className='text-xs text-slate-400 mt-2'>
                                    {t('Giao tới:', 'Deliver to:', '送至：')} {don.diaChi}
                                    {don.viTri && <span className='text-green-600 font-medium'> · 📍 {t('đã ghim vị trí', 'location pinned', '已标记位置')}</span>}
                                </p>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center py-16 text-slate-400 gap-3 bg-slate-50 rounded-2xl'>
                    <UtensilsCrossed size={36} />
                    <p className='text-sm'>{t('Bạn chưa đặt món nào —', "You haven't ordered any food yet —", '您还没有点餐 ——')} <Link href='/do-an' className='underline font-medium' style={{ color: MAU }}>{t('khám phá quán ăn', 'explore eateries', '探索餐馆')}</Link>{t(' nhé!', '!', '！')}</p>
                </div>
            )}
        </div>
    )
}
