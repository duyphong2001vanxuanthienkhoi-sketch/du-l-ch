'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { PackageSearch, Hash, Phone } from 'lucide-react'
import TheDonHang from '@/components/TheDonHang'
import { useNgonNgu } from '@/lib/i18n'

function FormTraDon() {
    const { t } = useNgonNgu()
    const searchParams = useSearchParams()
    const [form, setForm] = useState({ ma: '', soDienThoai: '' })
    const [dangTra, setDangTra] = useState(false)
    const [don, setDon] = useState(null)
    const [daTra, setDaTra] = useState(false) // đã tra ít nhất 1 lần (để hiện "không thấy")

    const traCuu = async (ma, soDienThoai) => {
        setDangTra(true)
        try {
            const res = await fetch('/api/tra-don', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ma, soDienThoai }),
            })
            const data = await res.json()
            setDaTra(true)
            if (!res.ok) { setDon(null); toast.error(data.error || t('Không tìm thấy đơn', 'Order not found', '未找到订单')); return }
            setDon(data.order)
        } finally {
            setDangTra(false)
        }
    }

    // Cho phép mở sẵn từ màn đặt hàng thành công: /tra-don?ma=...&sdt=...
    useEffect(() => {
        const ma = searchParams.get('ma') || ''
        const sdt = searchParams.get('sdt') || ''
        if (ma && sdt) {
            setForm({ ma, soDienThoai: sdt })
            traCuu(ma, sdt)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onSubmit = (e) => {
        e.preventDefault()
        traCuu(form.ma.trim(), form.soDienThoai.trim())
    }

    return (
        <div className='min-h-[70vh] mx-auto max-w-xl px-5 my-10 mb-24'>
            <div className='text-center'>
                <PackageSearch size={44} className='text-ngoc-500 mx-auto' />
                <h1 className='text-2xl font-semibold text-slate-800 mt-3'>{t('Tra cứu đơn hàng', 'Track an order', '查询订单')}</h1>
                <p className='text-sm text-slate-500 mt-2'>{t('Không cần đăng nhập — nhập mã đơn và số điện thoại đã đặt để xem tình trạng.', 'No sign-in needed — enter your order code and phone number to see the status.', '无需登录 —— 输入订单号和下单手机号即可查看状态。')}</p>
            </div>

            <form onSubmit={onSubmit} className='mt-7 flex flex-col gap-3'>
                <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl'>
                    <Hash size={18} className='text-slate-500 shrink-0' />
                    <input name='ma' value={form.ma} onChange={e => setForm({ ...form, ma: e.target.value.toUpperCase() })}
                        placeholder={t('Mã đơn (8 ký tự, VD: A1B2C3D4)', 'Order code (8 chars, e.g. A1B2C3D4)', '订单号（8位，如 A1B2C3D4）')} required
                        className='w-full bg-transparent outline-none text-sm placeholder-slate-500 uppercase tracking-wide' />
                </div>
                <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl'>
                    <Phone size={18} className='text-slate-500 shrink-0' />
                    <input name='soDienThoai' value={form.soDienThoai} onChange={e => setForm({ ...form, soDienThoai: e.target.value })}
                        type='tel' placeholder={t('Số điện thoại đã đặt', 'Phone number used to order', '下单手机号')} required
                        className='w-full bg-transparent outline-none text-sm placeholder-slate-500' />
                </div>
                <button type='submit' disabled={dangTra}
                    className='bg-ngoc-500 hover:bg-ngoc-600 text-white font-medium py-3 rounded-full active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none'>
                    {dangTra ? t('Đang tra...', 'Searching...', '查询中...') : t('Tra cứu', 'Track', '查询')}
                </button>
            </form>

            {don && (
                <div className='mt-8'>
                    <TheDonHang don={don} hienGian tongTien={don.tongTien}
                        giamGia={{ tongTienHang: don.tongTienHang, tienGiam: don.tienGiam, maGiam: don.maGiam }} />
                    <p className='text-xs text-slate-400 text-center mt-3'>{t('Tiểu thương sẽ liên hệ số', 'The merchant will contact', '商户将联系')} {don.soDienThoai} {t('để giao hàng.', 'for delivery.', '进行配送。')}</p>
                </div>
            )}

            {daTra && !don && !dangTra && (
                <p className='text-center text-sm text-slate-400 mt-8'>{t('Không tìm thấy đơn khớp mã và số điện thoại.', 'No order matches this code and phone number.', '未找到匹配该订单号和手机号的订单。')}</p>
            )}

            <p className='text-center text-xs text-slate-400 mt-10'>
                {t('Đã có tài khoản?', 'Have an account?', '已有账户？')} <Link href='/orders' className='text-ngoc-600 font-semibold hover:underline'>{t('Xem tất cả đơn của bạn', 'View all your orders', '查看您的所有订单')}</Link>
            </p>
        </div>
    )
}

export default function TraDon() {
    return (
        <Suspense>
            <FormTraDon />
        </Suspense>
    )
}
