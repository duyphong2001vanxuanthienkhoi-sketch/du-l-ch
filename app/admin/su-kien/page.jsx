'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft, CalendarDays, Plus, Save, Trash2 } from 'lucide-react'
import Loading from '@/components/Loading'
import { iconDiaDiem } from '@/lib/diaDiemLoai'

// Quản lý SỰ KIỆN & LỄ HỘI.
// Điểm cần cẩn thận: LỄ HỘI ÂM LỊCH. App không tự quy đổi âm sang dương (quy đổi sai
// còn tệ hơn không có), nên bật "Theo âm lịch" thì ô ngày dương bị vô hiệu hoá và
// phần ghi chú ngày trở thành BẮT BUỘC — đó là thứ khách sẽ đọc.

const NGON_NGU = [
    { i: 0, ten: 'Tiếng Việt', phu: 'Bắt buộc' },
    { i: 1, ten: 'English', phu: 'Tuỳ chọn' },
    { i: 2, ten: '中文', phu: 'Tuỳ chọn' },
]

const FORM_RONG = {
    id: '', ten: ['', '', ''], mota: ['', '', ''], noiDung: [],
    diaDiemId: '', batDau: '', ketThuc: '',
    hangNam: true, amLich: false, ghiChuNgay: ['', '', ''],
    anhBia: '', mau: '#dc2626', icon: '🎏',
    status: 'da_duyet', noiBat: 0,
}

const lopO = 'w-full mt-1 p-2.5 border border-slate-200 rounded-md outline-slate-400 text-sm bg-white'

// [[vi,en,zh],...] <-> ô chữ một ngôn ngữ, các đoạn cách nhau bằng dòng trống
const docDoan = (ds, i) => (ds || []).map(p => p?.[i] || '').join('\n\n')
const ghiDoan = (ds, i, chuoi) => {
    const phan = String(chuoi).split(/\n\s*\n/).map(s => s.trim())
    while (phan.length && !phan[phan.length - 1]) phan.pop()
    const n = Math.max(phan.length, (ds || []).length)
    const kq = []
    for (let k = 0; k < n; k++) {
        const cu = (ds || [])[k] || ['', '', '']
        const moi = [cu[0] || '', cu[1] || '', cu[2] || '']
        moi[i] = phan[k] || ''
        kq.push(moi)
    }
    while (kq.length && kq[kq.length - 1].every(s => !s)) kq.pop()
    return kq
}

export default function AdminSuKien() {
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
                fetch('/api/admin/su-kien'),
                fetch('/api/dia-diem'),
            ])
            const d1 = await r1.json()
            if (r1.status === 503 && d1.chuaTaoBang) { setChuaTaoBang(true); return }
            setDs(d1.suKiens || [])
            setDiaDiems((await r2.json()).diaDiems || [])
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => { tai() }, [])

    const datChu = (khoa, v) => setForm(f => {
        const a = [...f[khoa]]; a[nn] = v; return { ...f, [khoa]: a }
    })

    const luu = async (e) => {
        e.preventDefault()
        if (!form.ten[0].trim()) { setNn(0); return toast.error('Chưa nhập tên lễ hội') }
        if (form.amLich && !form.ghiChuNgay[0].trim()) {
            setNn(0)
            return toast.error('Lễ hội âm lịch bắt buộc có ghi chú ngày — đó là thứ khách đọc thay cho đếm ngược')
        }

        setDangLuu(true)
        try {
            const res = await fetch('/api/admin/su-kien', {
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

    const xoa = async (sk) => {
        if (!confirm(`Xoá "${sk.ten?.[0]}"?`)) return
        const res = await fetch(`/api/admin/su-kien?id=${encodeURIComponent(sk.id)}`, { method: 'DELETE' })
        if (!res.ok) { toast.error('Không xoá được'); return }
        toast.success('Đã xoá')
        setDs(cs => cs.filter(x => x.id !== sk.id))
    }

    if (loading) return <Loading />

    if (chuaTaoBang) return (
        <div className='mb-40 max-w-xl'>
            <h1 className='text-2xl text-slate-500'>Sự kiện</h1>
            <div className='mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5'>
                <p className='font-semibold text-amber-800'>Chưa có bảng dữ liệu sự kiện</p>
                <code className='block bg-white border border-amber-200 rounded-lg px-4 py-2.5 mt-2 text-sm'>
                    npm run tao-bang-du-lich
                </code>
            </div>
        </div>
    )

    if (form) return (
        <form onSubmit={luu} className='mb-40 max-w-3xl'>
            <button type='button' onClick={() => setForm(null)}
                className='inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700'>
                <ArrowLeft size={15} /> Về danh sách
            </button>
            <h1 className='text-2xl text-slate-500 mt-3'>
                {laMoi ? 'Thêm' : 'Sửa'} <span className='text-slate-800 font-medium'>lễ hội</span>
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
                <label className='block'>
                    <span className='text-xs font-semibold text-slate-600'>Tên lễ hội ({NGON_NGU[nn].ten})</span>
                    <input value={form.ten[nn]} onChange={e => datChu('ten', e.target.value)} className={lopO}
                        placeholder={nn === 0 ? 'VD: Lễ hội đền Đức Ông' : ''} />
                </label>

                <label className='block'>
                    <span className='text-xs font-semibold text-slate-600'>Mô tả ngắn ({NGON_NGU[nn].ten})</span>
                    <textarea rows={2} value={form.mota[nn]} onChange={e => datChu('mota', e.target.value)} className={lopO} />
                </label>

                <label className='block'>
                    <span className='text-xs font-semibold text-slate-600'>Diễn ra tại</span>
                    <select value={form.diaDiemId} onChange={e => setForm({ ...form, diaDiemId: e.target.value })} className={lopO}>
                        <option value=''>— Không gắn địa điểm cụ thể —</option>
                        {diaDiems.map(d => (
                            <option key={d.id} value={d.id}>{iconDiaDiem(d)} {d.ten?.[0]}</option>
                        ))}
                    </select>
                </label>
            </section>

            <section className='bg-white border border-slate-200 rounded-xl p-5 mt-4 flex flex-col gap-3.5'>
                <h3 className='font-semibold text-slate-700'>Thời điểm</h3>

                <div className='flex items-center gap-5 flex-wrap'>
                    <label className='flex items-center gap-2 text-sm text-slate-700'>
                        <input type='checkbox' checked={form.hangNam}
                            onChange={e => setForm({ ...form, hangNam: e.target.checked })} />
                        Lặp lại hằng năm
                    </label>
                    <label className='flex items-center gap-2 text-sm text-slate-700'>
                        <input type='checkbox' checked={form.amLich}
                            onChange={e => setForm({ ...form, amLich: e.target.checked })} />
                        Theo âm lịch
                    </label>
                </div>

                {form.amLich ? (
                    <p className='text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5'>
                        Lễ hội âm lịch <b>không có đếm ngược</b> — app cố tình không quy đổi âm sang dương
                        vì quy đổi sai còn tệ hơn không có. Khách sẽ đọc phần <b>ghi chú thời điểm</b> bên dưới,
                        nên hãy viết thật rõ.
                    </p>
                ) : (
                    <div className='grid sm:grid-cols-2 gap-3'>
                        <label className='block'>
                            <span className='text-xs font-semibold text-slate-600'>Ngày bắt đầu</span>
                            <input type='date' value={form.batDau}
                                onChange={e => setForm({ ...form, batDau: e.target.value })} className={lopO} />
                        </label>
                        <label className='block'>
                            <span className='text-xs font-semibold text-slate-600'>Ngày kết thúc</span>
                            <input type='date' value={form.ketThuc}
                                onChange={e => setForm({ ...form, ketThuc: e.target.value })} className={lopO} />
                        </label>
                    </div>
                )}

                <label className='block'>
                    <span className='text-xs font-semibold text-slate-600'>
                        Ghi chú thời điểm ({NGON_NGU[nn].ten}){form.amLich && <span className='text-red-600'> *</span>}
                    </span>
                    <span className='block text-[11px] text-slate-400 mt-0.5'>
                        Câu chữ khách đọc. VD: “Ngày 24/3 âm lịch hằng năm (thường rơi vào tháng 4–5 dương lịch)”
                    </span>
                    <input value={form.ghiChuNgay[nn]} onChange={e => datChu('ghiChuNgay', e.target.value)} className={lopO} />
                </label>
            </section>

            <section className='bg-white border border-slate-200 rounded-xl p-5 mt-4 flex flex-col gap-3.5'>
                <h3 className='font-semibold text-slate-700'>Nội dung chi tiết</h3>
                <p className='text-xs text-slate-400 -mt-2'>Mỗi đoạn cách nhau bằng MỘT DÒNG TRỐNG.</p>
                <textarea rows={7} className={lopO}
                    value={docDoan(form.noiDung, nn)}
                    onChange={e => setForm({ ...form, noiDung: ghiDoan(form.noiDung, nn, e.target.value) })} />
                <p className='text-[11px] text-slate-400'>Đang có {form.noiDung.length} đoạn.</p>

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

            <div className='sticky bottom-0 bg-slate-50/90 backdrop-blur py-4 mt-4 flex items-center gap-3'>
                <button disabled={dangLuu}
                    className='flex items-center gap-2 px-8 py-2.5 rounded-md bg-slate-700 text-white text-sm font-semibold active:scale-95 transition disabled:opacity-60'>
                    <Save size={16} /> {dangLuu ? 'Đang lưu…' : laMoi ? 'Thêm' : 'Lưu'}
                </button>
                <button type='button' onClick={() => setForm(null)}
                    className='px-6 py-2.5 rounded-md border border-slate-200 bg-white text-sm text-slate-600'>Huỷ</button>
            </div>
        </form>
    )

    return (
        <div className='mb-40'>
            <div className='flex items-start justify-between gap-4 flex-wrap'>
                <div>
                    <h1 className='text-2xl text-slate-500'>Quản lý <span className='text-slate-800 font-medium'>lễ hội</span></h1>
                    <p className='text-sm text-slate-400 mt-1'>Sự kiện & lễ hội của riêng Hồng Gai</p>
                </div>
                <button onClick={() => { setForm({ ...FORM_RONG }); setLaMoi(true); setNn(0) }}
                    className='flex items-center gap-2 px-5 py-2.5 rounded-md bg-slate-700 text-white text-sm font-semibold active:scale-95 transition'>
                    <Plus size={16} /> Thêm lễ hội
                </button>
            </div>

            <div className='flex flex-col gap-2.5 mt-6 max-w-4xl'>
                {ds.map(sk => {
                    const noi = diaDiems.find(d => d.id === sk.diaDiemId)
                    return (
                        <div key={sk.id} className='flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4'>
                            <span className='flex items-center justify-center size-12 rounded-xl text-2xl shrink-0'
                                style={{ backgroundColor: (sk.mau || '#dc2626') + '1a' }}>{sk.icon || '🎏'}</span>
                            <div className='min-w-0 flex-1'>
                                <div className='flex items-center gap-2 flex-wrap'>
                                    <p className='font-semibold text-slate-800 truncate'>{sk.ten?.[0]}</p>
                                    {sk.amLich && (
                                        <span className='text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700'>
                                            Âm lịch
                                        </span>
                                    )}
                                </div>
                                <p className='text-xs text-slate-400 mt-0.5'>
                                    {sk.ghiChuNgay?.[0] || sk.batDau || 'chưa có thời điểm'}
                                    {noi && ` · ${noi.ten?.[0]}`}
                                </p>
                            </div>
                            <button onClick={() => { setForm({ ...FORM_RONG, ...sk }); setLaMoi(false); setNn(0) }}
                                className='px-4 py-2 rounded-md border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 shrink-0'>
                                Sửa
                            </button>
                            <button onClick={() => xoa(sk)} aria-label='Xoá'
                                className='p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0'>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )
                })}
                {!ds.length && (
                    <p className='flex items-center gap-2 text-sm text-slate-400 py-8'>
                        <CalendarDays size={16} /> Chưa có lễ hội nào. Nạp mẫu: <code>npm run nap-lo-trinh</code>
                    </p>
                )}
            </div>
        </div>
    )
}
