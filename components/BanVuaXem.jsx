'use client'
import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import DaiSanPham from './DaiSanPham'
import { docVuaXem, xoaVuaXem } from '@/lib/utils/vuaXem'
import { useNgonNgu } from '@/lib/i18n'

// Dải "Bạn vừa xem" — id lưu ở localStorage (lib/utils/vuaXem), dữ liệu thật lấy qua
// /api/products?ids=... nên giá/tồn kho luôn mới và sản phẩm đã gỡ bán sẽ tự biến mất.
// Hợp nhất với chợ nhỏ: khách hay đi vòng lại giữa vài món trước khi chốt.
export default function BanVuaXem({ boQuaId, mau = '#059669', kieu = 'dai', className = 'mt-14' }) {
    const { t } = useNgonNgu()
    const [sps, setSps] = useState([])

    useEffect(() => {
        const ids = docVuaXem().filter(i => i !== boQuaId).slice(0, 10)
        if (ids.length < 2) return
        fetch(`/api/products?ids=${ids.join(',')}`)
            .then(r => r.json())
            .then(d => {
                const theoId = Object.fromEntries((d.products || []).map(p => [p.id, p]))
                setSps(ids.map(i => theoId[i]).filter(Boolean)) // giữ đúng thứ tự vừa xem
            })
            .catch(() => { })
    }, [boQuaId])

    const xoa = () => { xoaVuaXem(); setSps([]) }

    return (
        <DaiSanPham
            tieuDe={t('Bạn vừa xem', 'Recently viewed', '最近浏览')}
            Icon={History}
            mau={mau}
            sps={sps}
            kieu={kieu}
            className={className}
            hanhDongPhu={
                <button onClick={xoa} className='text-sm text-slate-400 hover:text-slate-600 hover:underline shrink-0'>
                    {t('Xóa', 'Clear', '清除')}
                </button>
            }
        />
    )
}
