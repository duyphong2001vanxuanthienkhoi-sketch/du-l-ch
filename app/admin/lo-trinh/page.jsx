'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Route, Save, Trash2, X } from 'lucide-react'
import Loading from '@/components/Loading'
import { iconDiaDiem, mauDiaDiem } from '@/lib/diaDiemLoai'

// Quản lý LỘ TRÌNH & BỘ SƯU TẬP.
// Phần khó là sắp THỨ TỰ CHẶNG — nên dùng nút lên/xuống thay vì kéo thả:
// kéo thả trên điện thoại rất khó trúng, mà biên tập viên hay sửa bằng máy tính bảng.

const NGON_NGU = [
    { i: 0, ten: 'Tiếng Việt', phu: 'Bắt buộc' },
    { i: 1, ten: 'English', phu: 'Tuỳ chọn' },
    { i: 2, ten: '中文', phu: 'Tuỳ chọn' },
]

const FORM_RONG = {
    id: '', kieu: 'lo_trinh',
    ten: ['', '', ''], mota: ['', '', ''], thoiLuong: ['', '', ''],
    diem: [], anhBia: '', mau: '#7c3aed', icon: '🗺️',
    status: 'da_duyet', noiBat: 0,
}

const lopO = 'w-full mt-1 p-2.5 border border-slate-200 rounded-md outline-slate-400 text-sm bg-white'

export default function AdminLoTrinh() {
    const [ds, setDs] = useState([])
    const [diaDiems, setDiaDiems] = useState([])
    const [loading, setLoading] = useState(true)
    const [chuaTaoBang, setChuaTaoBang] = useState(false)

    const [form, setForm] = useState(null)
    const [laMoi, setLaMoi] = useState(false)
    const [dangLuu, setDangLuu] = useState(false)
    const [nn, setNn] = useState(0)

    const tai = async () => {
        try {
            const [r1, r2] = await Promise.all([
                fetch('/api/admin/lo-trinh'),
                fetch('/api/dia-diem'),
            ])
            const d1 = await r1.json()
            if (r1.status === 503 && d1.chuaTaoBang) { setChuaTaoBang(true); return }
            setDs(d1.loTrinhs || [])
            setDiaDiems((await r2.json()).diaDiems || [])
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => { tai() }, [])

    const datChu = (khoa, v) => setForm(f => {
        const a = [...f[khoa]]; a[nn] = v; return { ...f, [khoa]: a }
    })

    // --- Thao tác trên danh sách chặng ---
    const themDiem = (diaDiemId) => setForm(f =>
        f.diem.some(d => d.diaDiemId === diaDiemId)
            ? f
            : { ...f, diem: [...f.diem, { diaDiemId, gio: '', phut: 0, ghiChu: ['', '', ''] }] })

    const boDiem = (i) => setForm(f => ({ ...f, diem: f.diem.filter((_, k) => k !== i) }))

    const doiChoDiem = (i, huong) => setForm(f => {
        const j = i + huong
        if (j < 0 || j >= f.diem.length) return f
        const d = [...f.diem]
        ;[d[i], d[j]] = [d[j], d[i]]
        return { ...f, diem: d }
    })

    const suaDiem = (i, khoa, v) => setForm(f => ({
        ...f,
        diem: f.diem.map((d, k) => k === i ? { ...d, [khoa]: v } : d),
    }))

    const suaGhiChuDiem = (i, v) => setForm(f => ({
        ...f,
        diem: f.diem.map((d, k) => {
            if (k !== i) return d
            const g = [...(d.ghiChu || ['', '', ''])]; g[nn] = v
            return { ...d, ghiChu: g }
        }),
    }))

    const luu = async (e) => {
        e.preventDefault()
        if (!form.ten[0].trim()) { setNn(0); return toast.error('Chưa nhập tên') }
        if (!form.diem.length) return toast.error('Cần chọn ít nhất một địa điểm')

        setDangLuu(true)
        try {
            const res = await fetch('/api/admin/lo-trinh', {
                method: laMoi ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || 'Không lưu được'); return }
            toast.success(laMoi ? 'Đã thêm' : 'Đã lưu')
            setForm(null); tai()
        } finally { setDangLuu(false) }
    }

    const xoa = async (lt) => {
        if (!confirm(`Xoá "${lt.ten?.[0]}"?`)) return
        const res = await fetch(`/api/admin/lo-trinh?id=${encodeURIComponent(lt.id)}`, { method: 'DELETE' })
        if (!res.ok) { toast.error('Không xoá được'); return }
        toast.success('Đã xoá')
        setDs(cs => cs.filter(x => x.id !== lt.id))
    }

    if (loading) return <Loading />

    if (chuaTaoBang) return (
        <div className='mb-40 max-w-xl'>
            <h1 className='text-2xl text-slate-500'>Lộ trình</h1>
            <div className='mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5'>
                <p className='font-semibold text-amber-800'>Chưa có bảng dữ liệu lộ trình</p>
                <code className='block bg-white border border-amber-200 rounded-lg px-4 py-2.5 mt-2 text-sm'>
                    npm run tao-bang-du-lich
                </code>
            </div>
        </div>
    )

    // ---------------- FORM ----------------
    if (form) {
        const laBoSuuTap = form.kieu === 'bo_suu_tap'
        const chuaChon = diaDiems.filter(d => !form.diem.some(x => x.diaDiemId === d.id))

        return (
            <form onSubmit={luu} className='mb-40 max-w-3xl'>
                <button type='button' onClick={() => setForm(null)}
                    className='inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700'>
                    <ArrowLeft size={15} /> Về danh sách
                </button>
                <h1 className='text-2xl text-slate-500 mt-3'>
                    {laMoi ? 'Thêm' : 'Sửa'} <span className='text-slate-800 font-medium'>lộ trình</span>
                </h1>

                <div className='sticky top-0 z-10 -mx-1 px-1 py-3 bg-slate-50/90 backdrop-blur mt-3'>
                    <div className='flex items-center gap-2'>
                        {NGON_NGU.map(l => (
                            <button key={l.i} type='button' onClick={() => setNn(l.i)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${nn === l.i ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                                {l.ten}
                                <span className={`block text-[10px] font-normal ${nn === l.i ? 'text-white/60' : 'text-slate-400'}`}>{l.phu}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <section className='bg-white border border-slate-200 rounded-xl p-5 mt-2 flex flex-col gap-3.5'>
                    <div className='flex gap-2'>
                        {[
                            { id: 'lo_trinh', ten: 'Lộ trình (có giờ giấc)' },
                            { id: 'bo_suu_tap', ten: 'Bộ sưu tập (theo chủ đề)' },
                        ].map(k => (
                            <button key={k.id} type='button' onClick={() => setForm({ ...form, kieu: k.id })}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${form.kieu === k.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}>
                                {k.ten}
                            </button>
                        ))}
                    </div>

                    <label className='block'>
                        <span className='text-xs font-semibold text-slate-600'>Tên ({NGON_NGU[nn].ten})</span>
                        <input value={form.ten[nn]} onChange={e => datChu('ten', e.target.value)} className={lopO}
                            placeholder={nn === 0 ? 'VD: Hồng Gai một ngày' : 'Để trống thì dùng bản tiếng Việt'} />
                    </label>

                    <label className='block'>
                        <span className='text-xs font-semibold text-slate-600'>Mô tả ({NGON_NGU[nn].ten})</span>
                        <textarea rows={3} value={form.mota[nn]} onChange={e => datChu('mota', e.target.value)} className={lopO} />
                    </label>

                    {!laBoSuuTap && (
                        <label className='block'>
                            <span className='text-xs font-semibold text-slate-600'>Thời lượng ({NGON_NGU[nn].ten})</span>
                            <input value={form.thoiLuong[nn]} onChange={e => datChu('thoiLuong', e.target.value)} className={lopO}
                                placeholder='VD: Khoảng 1 ngày' />
                        </label>
                    )}

                    <div className='grid sm:grid-cols-3 gap-3'>
                        <label className='block'>
                            <span className='text-xs font-semibold text-slate-600'>Màu</span>
                            <div className='flex items-center gap-2 mt-1'>
                                <input type='color' value={form.mau} onChange={e => setForm({ ...form, mau: e.target.value })}
                                    className='w-11 h-10 rounded-md border border-slate-200 bg-white cursor-pointer shrink-0' />
                                <input value={form.mau} onChange={e => setForm({ ...form, mau: e.target.value })}
                                    className='w-full p-2.5 border border-slate-200 rounded-md text-sm bg-white' />
                            </div>
                        </label>
                        <label className='block'>
                            <span className='text-xs font-semibold text-slate-600'>Icon (emoji)</span>
                            <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className={lopO} />
                        </label>
                        <label className='block'>
                            <span className='text-xs font-semibold text-slate-600'>Độ nổi bật</span>
                            <input type='number' value={form.noiBat} onChange={e => setForm({ ...form, noiBat: e.target.value })} className={lopO} />
                        </label>
                    </div>
                </section>

                {/* Các chặng */}
                <section className='bg-white border border-slate-200 rounded-xl p-5 mt-4'>
                    <h3 className='font-semibold text-slate-700'>Các điểm dừng ({form.diem.length})</h3>
                    <p className='text-xs text-slate-400 mt-0.5'>
                        {laBoSuuTap
                            ? 'Bộ sưu tập không có giờ giấc — chỉ cần thứ tự hiển thị.'
                            : 'Thứ tự này quyết định đường nối trên bản đồ và dòng thời gian.'}
                    </p>

                    <div className='flex flex-col gap-2.5 mt-4'>
                        {form.diem.map((c, i) => {
                            const d = diaDiems.find(x => x.id === c.diaDiemId)
                            return (
                                <div key={`${c.diaDiemId}-${i}`} className='flex gap-3 items-start border border-slate-100 rounded-xl p-3'>
                                    <div className='flex flex-col items-center gap-1 shrink-0'>
                                        <button type='button' onClick={() => doiChoDiem(i, -1)} disabled={i === 0}
                                            className='text-slate-300 hover:text-slate-600 disabled:opacity-30' aria-label='Lên'>
                                            <ChevronUp size={16} />
                                        </button>
                                        <span className='flex items-center justify-center size-7 rounded-full text-white text-xs font-bold'
                                            style={{ backgroundColor: form.mau }}>{i + 1}</span>
                                        <button type='button' onClick={() => doiChoDiem(i, 1)} disabled={i === form.diem.length - 1}
                                            className='text-slate-300 hover:text-slate-600 disabled:opacity-30' aria-label='Xuống'>
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>

                                    <div className='min-w-0 flex-1'>
                                        <p className='font-medium text-slate-800 text-sm'>
                                            {d ? `${iconDiaDiem(d)} ${d.ten?.[0]}` : <span className='text-red-600'>Địa điểm đã bị xoá ({c.diaDiemId})</span>}
                                        </p>
                                        {!laBoSuuTap && (
                                            <div className='flex gap-2 mt-2'>
                                                <label className='block'>
                                                    <span className='text-[11px] text-slate-500'>Giờ tới</span>
                                                    <input type='time' value={c.gio} onChange={e => suaDiem(i, 'gio', e.target.value)}
                                                        className='block mt-0.5 p-1.5 border border-slate-200 rounded text-xs bg-white' />
                                                </label>
                                                <label className='block'>
                                                    <span className='text-[11px] text-slate-500'>Nên dành (phút)</span>
                                                    <input type='number' min={0} step={15} value={c.phut}
                                                        onChange={e => suaDiem(i, 'phut', Number(e.target.value) || 0)}
                                                        className='block mt-0.5 w-24 p-1.5 border border-slate-200 rounded text-xs bg-white' />
                                                </label>
                                            </div>
                                        )}
                                        <input value={c.ghiChu?.[nn] || ''} onChange={e => suaGhiChuDiem(i, e.target.value)}
                                            placeholder={`Ghi chú cho chặng này (${NGON_NGU[nn].ten})`}
                                            className='w-full mt-2 p-2 border border-slate-200 rounded text-xs bg-white' />
                                    </div>

                                    <button type='button' onClick={() => boDiem(i)} aria-label='Bỏ'
                                        className='p-1.5 text-slate-300 hover:text-red-600 shrink-0'>
                                        <X size={16} />
                                    </button>
                                </div>
                            )
                        })}
                        {!form.diem.length && <p className='text-sm text-slate-400'>Chưa chọn địa điểm nào.</p>}
                    </div>

                    <div className='mt-4'>
                        <span className='text-xs font-semibold text-slate-600'>Thêm địa điểm</span>
                        <div className='flex flex-wrap gap-2 mt-2 max-h-44 overflow-y-auto'>
                            {chuaChon.map(d => (
                                <button key={d.id} type='button' onClick={() => themDiem(d.id)}
                                    className='px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'>
                                    + {iconDiaDiem(d)} {d.ten?.[0]}
                                </button>
                            ))}
                            {!chuaChon.length && <p className='text-xs text-slate-400'>Đã thêm hết địa điểm.</p>}
                        </div>
                    </div>
                </section>

                <div className='sticky bottom-0 bg-slate-50/90 backdrop-blur py-4 mt-4 flex items-center gap-3'>
                    <button disabled={dangLuu}
                        className='flex items-center gap-2 px-8 py-2.5 rounded-md bg-slate-700 text-white text-sm font-semibold active:scale-95 transition disabled:opacity-60'>
                        <Save size={16} /> {dangLuu ? 'Đang lưu…' : laMoi ? 'Thêm' : 'Lưu'}
                    </button>
                    <button type='button' onClick={() => setForm(null)}
                        className='px-6 py-2.5 rounded-md border border-slate-200 bg-white text-sm text-slate-600'>
                        Huỷ
                    </button>
                </div>
            </form>
        )
    }

    // ---------------- DANH SÁCH ----------------
    return (
        <div className='mb-40'>
            <div className='flex items-start justify-between gap-4 flex-wrap'>
                <div>
                    <h1 className='text-2xl text-slate-500'>Quản lý <span className='text-slate-800 font-medium'>lộ trình</span></h1>
                    <p className='text-sm text-slate-400 mt-1'>Lộ trình có giờ giấc và bộ sưu tập theo chủ đề</p>
                </div>
                <button onClick={() => { setForm({ ...FORM_RONG }); setLaMoi(true); setNn(0) }}
                    className='flex items-center gap-2 px-5 py-2.5 rounded-md bg-slate-700 text-white text-sm font-semibold active:scale-95 transition'>
                    <Plus size={16} /> Thêm lộ trình
                </button>
            </div>

            <div className='flex flex-col gap-2.5 mt-6 max-w-4xl'>
                {ds.map(lt => (
                    <div key={lt.id} className='flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4'>
                        <span className='flex items-center justify-center size-12 rounded-xl text-2xl shrink-0'
                            style={{ backgroundColor: (lt.mau || '#7c3aed') + '1a' }}>{lt.icon || '🗺️'}</span>
                        <div className='min-w-0 flex-1'>
                            <div className='flex items-center gap-2 flex-wrap'>
                                <p className='font-semibold text-slate-800 truncate'>{lt.ten?.[0]}</p>
                                <span className='text-[11px] font-semibold px-2 py-0.5 rounded-full'
                                    style={{ backgroundColor: (lt.mau || '#7c3aed') + '1a', color: lt.mau || '#7c3aed' }}>
                                    {lt.kieu === 'bo_suu_tap' ? 'Bộ sưu tập' : 'Lộ trình'}
                                </span>
                            </div>
                            <p className='text-xs text-slate-400 mt-0.5'>
                                <code>{lt.id}</code> · {lt.diem?.length || 0} điểm
                                {!lt.ten?.[1] && ' · thiếu tiếng Anh'}
                            </p>
                        </div>
                        <button onClick={() => { setForm({ ...FORM_RONG, ...lt }); setLaMoi(false); setNn(0) }}
                            className='px-4 py-2 rounded-md border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 shrink-0'>
                            Sửa
                        </button>
                        <button onClick={() => xoa(lt)} aria-label='Xoá'
                            className='p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0'>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {!ds.length && (
                    <p className='flex items-center gap-2 text-sm text-slate-400 py-8'>
                        <Route size={16} /> Chưa có lộ trình nào. Nạp mẫu: <code>npm run nap-lo-trinh</code>
                    </p>
                )}
            </div>
        </div>
    )
}
