'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, MapPin, Plus, Star } from 'lucide-react'
import Loading from '@/components/Loading'
import { LOAI_DIA_DIEM, timLoai, mauDiaDiem, iconDiaDiem } from '@/lib/diaDiemLoai'

// Tổng quan quản trị — app du lịch không bán hàng nên bảng này thống kê NỘI DUNG
// (địa điểm, độ phủ bản dịch, lượt xem) thay vì doanh thu/đơn hàng như bản cũ.
export default function AdminTongQuan() {
    const [ds, setDs] = useState([])
    const [loading, setLoading] = useState(true)
    const [chuaTaoBang, setChuaTaoBang] = useState(false)

    useEffect(() => {
        fetch('/api/admin/dia-diem')
            .then(async r => {
                const data = await r.json()
                if (r.status === 503 && data.chuaTaoBang) { setChuaTaoBang(true); return }
                setDs(data.diaDiems || [])
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <Loading />

    if (chuaTaoBang) return (
        <div className='mb-40 max-w-xl'>
            <h1 className='text-2xl text-slate-500'>Tổng quan</h1>
            <div className='mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5'>
                <p className='font-semibold text-amber-800'>Chưa có bảng dữ liệu địa điểm</p>
                <code className='block bg-white border border-amber-200 rounded-lg px-4 py-2.5 mt-2 text-sm text-slate-700'>
                    npm run tao-bang-du-lich
                </code>
            </div>
        </div>
    )

    const daDuyet = ds.filter(d => d.status === 'da_duyet')
    const thieuAnh = ds.filter(d => !d.anhBia)
    const thieuToaDo = ds.filter(d => !d.viTri)
    const thieuDich = ds.filter(d => !d.ten?.[1] || !d.ten?.[2])
    const tongXem = ds.reduce((s, d) => s + (d.luotXem || 0), 0)

    const oThongKe = [
        { nhan: 'Địa điểm', so: ds.length, phu: `${daDuyet.length} đã duyệt`, mau: '#0284c7' },
        { nhan: 'Lượt xem', so: tongXem, phu: 'tổng cộng', mau: '#059669' },
        { nhan: 'Thiếu ảnh bìa', so: thieuAnh.length, phu: 'nên bổ sung', mau: '#d97706' },
        { nhan: 'Thiếu bản dịch', so: thieuDich.length, phu: 'chưa đủ Anh/Trung', mau: '#dc2626' },
    ]

    const xemNhieu = [...ds].sort((a, b) => (b.luotXem || 0) - (a.luotXem || 0)).slice(0, 5)

    return (
        <div className='mb-40'>
            <div className='flex items-start justify-between gap-4 flex-wrap'>
                <div>
                    <h1 className='text-2xl text-slate-500'>Tổng quan <span className='text-slate-800 font-medium'>nội dung</span></h1>
                    <p className='text-sm text-slate-400 mt-1'>Khám Phá Hồng Gai — cẩm nang du lịch phường Hồng Gai</p>
                </div>
                <Link href='/admin/dia-diem'
                    className='flex items-center gap-2 px-5 py-2.5 rounded-md bg-slate-700 text-white text-sm font-semibold active:scale-95 transition'>
                    <Plus size={16} /> Thêm địa điểm
                </Link>
            </div>

            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 max-w-4xl'>
                {oThongKe.map(o => (
                    <div key={o.nhan} className='bg-white border border-slate-200 rounded-xl p-4'>
                        <p className='text-xs text-slate-500'>{o.nhan}</p>
                        <p className='text-3xl font-bold mt-1' style={{ color: o.mau }}>{o.so}</p>
                        <p className='text-[11px] text-slate-400 mt-0.5'>{o.phu}</p>
                    </div>
                ))}
            </div>

            {/* Việc cần làm — chỉ hiện khi thực sự có việc */}
            {(thieuToaDo.length > 0 || thieuAnh.length > 0 || thieuDich.length > 0) && (
                <div className='mt-8 max-w-4xl'>
                    <h2 className='font-semibold text-slate-700 mb-3'>Việc nên làm</h2>
                    <div className='flex flex-col gap-2'>
                        {thieuToaDo.length > 0 && (
                            <p className='text-sm text-slate-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5'>
                                <b>{thieuToaDo.length}</b> địa điểm chưa có toạ độ — sẽ không hiện trên bản đồ:{' '}
                                <span className='text-slate-500'>{thieuToaDo.slice(0, 3).map(d => d.ten?.[0]).join(', ')}</span>
                            </p>
                        )}
                        {thieuAnh.length > 0 && (
                            <p className='text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5'>
                                <b>{thieuAnh.length}</b> địa điểm chưa có ảnh bìa — thẻ sẽ hiện emoji thay ảnh
                            </p>
                        )}
                        {thieuDich.length > 0 && (
                            <p className='text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5'>
                                <b>{thieuDich.length}</b> địa điểm chưa đủ bản tiếng Anh / tiếng Trung
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className='grid lg:grid-cols-2 gap-6 mt-8 max-w-4xl'>
                {/* Theo loại hình */}
                <div>
                    <h2 className='font-semibold text-slate-700 mb-3'>Theo loại hình</h2>
                    <div className='flex flex-col gap-1.5'>
                        {LOAI_DIA_DIEM.map(l => {
                            const n = ds.filter(d => d.loai === l.id).length
                            if (!n) return null
                            return (
                                <Link key={l.id} href={`/admin/dia-diem`}
                                    className='flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 hover:bg-slate-50 transition'>
                                    <span>{l.icon}</span>
                                    <span className='text-sm text-slate-700 flex-1'>{l.ten[0]}</span>
                                    <span className='text-sm font-bold' style={{ color: l.mau }}>{n}</span>
                                </Link>
                            )
                        })}
                        {!ds.length && <p className='text-sm text-slate-400'>Chưa có địa điểm nào.</p>}
                    </div>
                </div>

                {/* Xem nhiều nhất */}
                <div>
                    <h2 className='font-semibold text-slate-700 mb-3'>Xem nhiều nhất</h2>
                    <div className='flex flex-col gap-1.5'>
                        {xemNhieu.map(d => (
                            <div key={d.id} className='flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2.5'>
                                <span className='flex items-center justify-center size-8 rounded-lg shrink-0'
                                    style={{ backgroundColor: mauDiaDiem(d) + '1a' }}>{iconDiaDiem(d)}</span>
                                <span className='text-sm text-slate-700 flex-1 truncate'>{d.ten?.[0]}</span>
                                <span className='flex items-center gap-1 text-xs text-slate-400 shrink-0'>
                                    <Eye size={13} /> {d.luotXem || 0}
                                </span>
                            </div>
                        ))}
                        {!ds.length && <p className='text-sm text-slate-400'>Chưa có dữ liệu.</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}
