'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, LayoutDashboard, Store, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useNgonNgu } from '@/lib/i18n'

// Khu "quản lý của tôi" ngay đầu trang chủ — hiện RIÊNG theo vai trò người đăng nhập:
//  - Admin           : thẻ Trang quản trị
//  - Có gian hàng    : thẻ Gian hàng của tôi (kèm trạng thái duyệt)
//  - Tiểu thương chưa có gian: thẻ mời đăng ký gian
//  - Có quán ăn      : thẻ Quán đồ ăn của tôi (kèm trạng thái duyệt)
// Khách thường (không quản lý gì) không thấy khu này — trang chủ giữ gọn.

const NHAN_TRANG_THAI = {
    cho_duyet: { chu: ['Chờ duyệt', 'Pending approval', '待审核'], mau: '#b45309', nen: '#fef3c7' },
    da_duyet: { chu: ['Đang hoạt động', 'Active', '运营中'], mau: '#047857', nen: '#d1fae5' },
    tu_choi: { chu: ['Bị từ chối', 'Rejected', '已拒绝'], mau: '#b91c1c', nen: '#fee2e2' },
}

function TheLoiVao({ href, Icon, mau, nen, tieuDe, moTa, trangThai }) {
    const { t } = useNgonNgu()
    const tt = trangThai ? NHAN_TRANG_THAI[trangThai] : null
    return (
        <Link href={href}
            className='flex items-center gap-3.5 rounded-2xl p-4 border border-slate-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[.98] transition-all min-w-0'>
            <span className='flex items-center justify-center size-11 rounded-xl shrink-0' style={{ background: nen }}>
                <Icon size={22} style={{ color: mau }} />
            </span>
            <span className='min-w-0 flex-1'>
                <span className='flex items-center gap-2 flex-wrap'>
                    <span className='font-semibold text-slate-800 text-sm'>{tieuDe}</span>
                    {tt && (
                        <span className='text-[10px] font-bold px-2 py-0.5 rounded-full' style={{ color: tt.mau, background: tt.nen }}>
                            {t(...tt.chu)}
                        </span>
                    )}
                </span>
                <span className='block text-xs text-slate-500 truncate mt-0.5'>{moTa}</span>
            </span>
            <ChevronRight size={18} className='text-slate-300 shrink-0' />
        </Link>
    )
}

// className: cho phép nơi đặt tự quyết khung (mặc định là khối giữa trang).
// TrangChuApp (mobile) truyền className gọn vì đã có padding sẵn của trang.
const LoiVaoQuanLy = ({ className = 'max-w-6xl mx-auto px-5 sm:px-6 mt-5 sm:mt-8' }) => {
    const { user } = useAuth() // undefined = đang tải; null = chưa đăng nhập
    const { t } = useNgonNgu()
    const [gian, setGian] = useState(null)
    const [quan, setQuan] = useState(null)
    const [daTai, setDaTai] = useState(false)

    useEffect(() => {
        if (!user) { setDaTai(false); setGian(null); setQuan(null); return }
        Promise.all([
            fetch('/api/store/me').then(r => r.json()).catch(() => ({})),
            fetch('/api/quan-an/me').then(r => r.json()).catch(() => ({})),
        ]).then(([g, q]) => {
            setGian(g.store || null)
            setQuan(q.quanAn || null)
            setDaTai(true)
        })
    }, [user])

    if (!user || !daTai) return null

    const the = []

    if (user.role === 'admin') {
        the.push(
            <TheLoiVao key='admin' href='/admin' Icon={LayoutDashboard} mau='#0369a1' nen='#e0f2fe'
                tieuDe={t('Trang quản trị', 'Admin panel', '管理面板')} moTa={t('Duyệt gian hàng, quán ăn, quản lý đơn & mã giảm giá', 'Approve stores, eateries, manage orders & coupons', '审核店铺、餐馆，管理订单和优惠码')} />
        )
    }

    if (gian) {
        the.push(
            <TheLoiVao key='gian'
                href={gian.status === 'da_duyet' ? '/store' : '/create-store'}
                Icon={Store} mau='#059669' nen='#d1fae5'
                tieuDe={t('Gian hàng của tôi', 'My store', '我的店铺')} trangThai={gian.status}
                moTa={gian.status === 'da_duyet' ? `${gian.tenGian} — ${t('quản lý sản phẩm & đơn hàng', 'manage products & orders', '管理商品和订单')}` : gian.tenGian} />
        )
    } else if (user.role === 'tieu_thuong') {
        the.push(
            <TheLoiVao key='mo-gian' href='/create-store' Icon={Store} mau='#059669' nen='#d1fae5'
                tieuDe={t('Mở gian hàng', 'Open a store', '开店')} moTa={t('Đăng ký gian hàng để bắt đầu bán trên Chợ Số', 'Register a store to start selling on Cho So', '注册店铺，开始在数字市场销售')} />
        )
    }

    if (quan) {
        the.push(
            <TheLoiVao key='quan'
                href={quan.status === 'da_duyet' ? '/quan-an/thuc-don' : '/create-quan-an'}
                Icon={UtensilsCrossed} mau='#c2410c' nen='#ffedd5'
                tieuDe={t('Quán đồ ăn của tôi', 'My eatery', '我的餐馆')} trangThai={quan.status}
                moTa={quan.status === 'da_duyet' ? `${quan.ten || quan.name} — ${t('quản lý thực đơn & đơn đồ ăn', 'manage menu & food orders', '管理菜单和餐饮订单')}` : (quan.ten || quan.name)} />
        )
    }

    if (the.length === 0) return null

    return (
        <section className={className}>
            <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5'>{t('Khu quản lý của bạn', 'Your management area', '您的管理区')}</p>
            <div className={`grid grid-cols-1 gap-3 ${the.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-md'}`}>{the}</div>
        </section>
    )
}

export default LoiVaoQuanLy
