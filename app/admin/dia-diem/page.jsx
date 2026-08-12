'use client'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft, DatabaseIcon, MapPin, Plus, Save, Search, Trash2 } from 'lucide-react'
import Loading from '@/components/Loading'
import {
    LOAI_DIA_DIEM, MUC_GIA, TIEN_ICH, TRANG_THAI,
    mauDiaDiem, iconDiaDiem, taoSlug, timLoai, timTrangThai,
} from '@/lib/diaDiemLoai'

// Quản lý ĐỊA ĐIỂM — thêm/sửa/xoá ngay trên web.
// Trước đây muốn thêm một địa điểm phải sửa tay lib/diaDiem.js rồi deploy lại;
// trang này gỡ đúng nút thắt đó.
//
// Nội dung chữ là mảng [vi, en, zh]. Thay vì bày 3 ô cho mỗi trường (form dài gấp ba),
// form có TAB NGÔN NGỮ ở trên: chọn tab nào thì mọi ô chữ sửa bản dịch đó.

const NGON_NGU = [
    { i: 0, ma: 'vi', ten: 'Tiếng Việt', phu: 'Bắt buộc' },
    { i: 1, ma: 'en', ten: 'English', phu: 'Tuỳ chọn' },
    { i: 2, ma: 'zh', ten: '中文', phu: 'Tuỳ chọn' },
]

const FORM_RONG = {
    id: '', loai: 'ngam_canh',
    ten: ['', '', ''], mota: ['', '', ''],
    gioiThieu: [], diemNoiBat: [],
    lat: '', lng: '', diaChi: '',
    gioMoCua: '', gioDongCua: '',
    gioMoCuaMoTa: ['', '', ''], giaVe: ['', '', ''], diChuyen: ['', '', ''],
    mucGia: '', dienThoai: '', website: '', facebook: '',
    tienIch: [], mau: '', icon: '',
    lanCan: [], noiBat: 0, status: 'da_duyet',
    anhBia: '', anhs: [],
    x: '', y: '', nhanPhai: false,
}

// --- Chuyển đổi giữa mảng-các-đoạn [[vi,en,zh],...] và một ô chữ của MỘT ngôn ngữ ---

// Đọc: lấy cột ngôn ngữ i, nối lại thành chuỗi để đổ vào textarea
const docNhieu = (ds, i, noi) => (ds || []).map(p => p?.[i] || '').join(noi)

// Ghi: cập nhật cột ngôn ngữ i, GIỮ NGUYÊN hai ngôn ngữ còn lại theo đúng thứ tự đoạn
const ghiNhieu = (ds, i, chuoi, tach) => {
    const phan = String(chuoi).split(tach).map(s => s.trim())
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

// Bản ghi từ CSDL -> dữ liệu form
const sangForm = (d) => ({
    ...FORM_RONG,
    ...d,
    ten: [d.ten?.[0] || '', d.ten?.[1] || '', d.ten?.[2] || ''],
    mota: [d.mota?.[0] || '', d.mota?.[1] || '', d.mota?.[2] || ''],
    gioMoCuaMoTa: [d.gioMoCuaMoTa?.[0] || '', d.gioMoCuaMoTa?.[1] || '', d.gioMoCuaMoTa?.[2] || ''],
    giaVe: [d.giaVe?.[0] || '', d.giaVe?.[1] || '', d.giaVe?.[2] || ''],
    diChuyen: [d.diChuyen?.[0] || '', d.diChuyen?.[1] || '', d.diChuyen?.[2] || ''],
    gioiThieu: d.gioiThieu || [], diemNoiBat: d.diemNoiBat || [],
    tienIch: d.tienIch || [], lanCan: d.lanCan || [], anhs: d.anhs || [],
    lat: d.viTri?.[0] ?? '', lng: d.viTri?.[1] ?? '',
    mucGia: d.mucGia || '',
    x: d.x ?? '', y: d.y ?? '',
})

// Dữ liệu form -> body gửi API
const sangBody = (f) => {
    const { lat, lng, ...r } = f
    const co = String(lat).trim() !== '' && String(lng).trim() !== ''
    return { ...r, viTri: co ? [Number(lat), Number(lng)] : null, mucGia: f.mucGia || null }
}

// --- Ô nhập dùng lại ---
const lopO = 'w-full mt-1 p-2.5 border border-slate-200 rounded-md outline-slate-400 text-sm bg-white'

const O = ({ nhan, goiY, ...props }) => (
    <label className='block'>
        <span className='text-xs font-semibold text-slate-600'>{nhan}</span>
        {goiY && <span className='block text-[11px] text-slate-400 mt-0.5'>{goiY}</span>}
        <input className={lopO} {...props} />
    </label>
)

const Khu = ({ tieuDe, moTa, children }) => (
    <section className='bg-white border border-slate-200 rounded-xl p-5 mt-4'>
        <h3 className='font-semibold text-slate-700'>{tieuDe}</h3>
        {moTa && <p className='text-xs text-slate-400 mt-0.5'>{moTa}</p>}
        <div className='mt-4 flex flex-col gap-3.5'>{children}</div>
    </section>
)

export default function AdminDiaDiem() {

    const [ds, setDs] = useState([])
    const [loading, setLoading] = useState(true)
    const [chuaTaoBang, setChuaTaoBang] = useState(false)
    const [dangNap, setDangNap] = useState(false)

    const [form, setForm] = useState(null)   // null = đang xem danh sách
    const [laMoi, setLaMoi] = useState(false)
    const [dangLuu, setDangLuu] = useState(false)
    const [nn, setNn] = useState(0)          // tab ngôn ngữ đang sửa

    const [tim, setTim] = useState('')
    const [locLoai, setLocLoai] = useState('')

    const tai = async () => {
        try {
            const res = await fetch('/api/admin/dia-diem')
            const data = await res.json()
            if (res.status === 503 && data.chuaTaoBang) { setChuaTaoBang(true); return }
            if (!res.ok) { toast.error(data.error || 'Không tải được danh sách'); return }
            setChuaTaoBang(false)
            setDs(data.diaDiems || [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { tai() }, [])

    const napMau = async () => {
        setDangNap(true)
        try {
            const res = await fetch('/api/admin/dia-diem/nap-mau', { method: 'POST' })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || 'Không nạp được dữ liệu mẫu'); return }
            toast.success(`Đã thêm ${data.daThem} địa điểm` + (data.boQua?.length ? `, bỏ qua ${data.boQua.length} đã có` : ''))
            if (data.loi?.length) console.warn('Lỗi khi nạp:', data.loi)
            tai()
        } finally {
            setDangNap(false)
        }
    }

    const moThem = () => {
        setForm({ ...FORM_RONG })
        setLaMoi(true)
        setNn(0)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const moSua = (d) => {
        setForm(sangForm(d))
        setLaMoi(false)
        setNn(0)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const luu = async (e) => {
        e.preventDefault()
        if (!form.ten[0].trim()) { toast.error('Chưa nhập tên địa điểm (tiếng Việt)'); setNn(0); return }

        setDangLuu(true)
        try {
            const res = await fetch('/api/admin/dia-diem', {
                method: laMoi ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sangBody(form)),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || 'Không lưu được địa điểm'); return }
            toast.success(laMoi ? 'Đã thêm địa điểm' : 'Đã lưu thay đổi')
            setForm(null)
            tai()
        } finally {
            setDangLuu(false)
        }
    }

    const xoa = async (d) => {
        if (!confirm(`Xoá địa điểm "${d.ten?.[0]}"? Không khôi phục được.`)) return
        const res = await fetch(`/api/admin/dia-diem?id=${encodeURIComponent(d.id)}`, { method: 'DELETE' })
        const data = await res.json()
        if (!res.ok) { toast.error(data.error || 'Không xoá được'); return }
        toast.success('Đã xoá địa điểm')
        setDs(cs => cs.filter(x => x.id !== d.id))
    }

    // Sửa một trường chữ đa ngữ tại cột ngôn ngữ đang chọn
    const datChu = (khoa, giaTri) => setForm(f => {
        const v = [...f[khoa]]
        v[nn] = giaTri
        return { ...f, [khoa]: v }
    })

    const doiTienIch = (id) => setForm(f => ({
        ...f,
        tienIch: f.tienIch.includes(id) ? f.tienIch.filter(x => x !== id) : [...f.tienIch, id],
    }))

    const doiLanCan = (id) => setForm(f => ({
        ...f,
        lanCan: f.lanCan.includes(id) ? f.lanCan.filter(x => x !== id) : [...f.lanCan, id],
    }))

    const dsLoc = useMemo(() => {
        const q = tim.trim().toLowerCase()
        return ds.filter(d => {
            if (locLoai && d.loai !== locLoai) return false
            if (!q) return true
            return (d.ten || []).some(x => String(x).toLowerCase().includes(q)) ||
                String(d.id).includes(q)
        })
    }, [ds, tim, locLoai])

    if (loading) return <Loading />

    // Chưa chạy script tạo bảng — hướng dẫn đúng việc cần làm thay vì báo lỗi chung chung
    if (chuaTaoBang) return (
        <div className='mb-40 max-w-xl'>
            <h2 className='text-2xl text-slate-500'>Quản lý <span className='text-slate-800 font-medium'>Địa điểm</span></h2>
            <div className='mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5'>
                <p className='flex items-center gap-2 font-semibold text-amber-800'>
                    <DatabaseIcon size={18} /> Chưa có bảng dữ liệu địa điểm
                </p>
                <p className='text-sm text-amber-700 mt-2'>Mở terminal ở thư mục dự án và chạy:</p>
                <code className='block bg-white border border-amber-200 rounded-lg px-4 py-2.5 mt-2 text-sm text-slate-700'>
                    npm run tao-bang-du-lich
                </code>
                <p className='text-sm text-amber-700 mt-3'>Chạy xong thì tải lại trang này.</p>
            </div>
        </div>
    )

    // ---------------- FORM THÊM / SỬA ----------------
    if (form) {
        const mauHienTai = form.mau || timLoai(form.loai)?.mau || '#0284c7'
        const maDuKien = form.id || taoSlug(form.ten[0]) || '(chưa có tên)'

        return (
            <form onSubmit={luu} className='mb-40 max-w-3xl'>
                <button type='button' onClick={() => setForm(null)}
                    className='inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700'>
                    <ArrowLeft size={15} /> Về danh sách
                </button>

                <h2 className='text-2xl text-slate-500 mt-3'>
                    {laMoi ? 'Thêm' : 'Sửa'} <span className='text-slate-800 font-medium'>địa điểm</span>
                </h2>
                <p className='text-sm text-slate-400 mt-1'>
                    Mã địa điểm: <code className='text-slate-600'>{maDuKien}</code>
                    <span className='text-slate-400'> — dùng làm địa chỉ trang /dia-diem/{maDuKien}</span>
                </p>

                {/* Tab ngôn ngữ — đổi tab là mọi ô chữ bên dưới chuyển sang bản dịch tương ứng */}
                <div className='sticky top-0 z-10 -mx-1 px-1 py-3 bg-slate-50/90 backdrop-blur mt-4'>
                    <div className='flex items-center gap-2'>
                        {NGON_NGU.map(l => (
                            <button key={l.ma} type='button' onClick={() => setNn(l.i)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${nn === l.i ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                                {l.ten}
                                <span className={`block text-[10px] font-normal ${nn === l.i ? 'text-white/60' : 'text-slate-400'}`}>{l.phu}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Khu tieuDe='Cơ bản'>
                    <label className='block'>
                        <span className='text-xs font-semibold text-slate-600'>Loại hình</span>
                        <select value={form.loai} onChange={e => setForm({ ...form, loai: e.target.value })} className={lopO}>
                            {LOAI_DIA_DIEM.map(l => <option key={l.id} value={l.id}>{l.icon} {l.ten[0]}</option>)}
                        </select>
                    </label>

                    <O nhan={`Tên địa điểm (${NGON_NGU[nn].ten})`}
                        value={form.ten[nn]} onChange={e => datChu('ten', e.target.value)}
                        placeholder={nn === 0 ? 'VD: Chùa Long Tiên' : 'Để trống thì tự dùng bản tiếng Việt'} />

                    <label className='block'>
                        <span className='text-xs font-semibold text-slate-600'>Mô tả ngắn ({NGON_NGU[nn].ten})</span>
                        <span className='block text-[11px] text-slate-400 mt-0.5'>1–2 câu, hiện trên thẻ ở trang Khám phá</span>
                        <textarea rows={2} value={form.mota[nn]} onChange={e => datChu('mota', e.target.value)} className={lopO} />
                    </label>
                </Khu>

                <Khu tieuDe='Bài giới thiệu' moTa='Mỗi đoạn cách nhau bằng MỘT DÒNG TRỐNG. Thứ tự đoạn giữ chung cho cả 3 thứ tiếng.'>
                    <textarea rows={8} className={lopO}
                        value={docNhieu(form.gioiThieu, nn, '\n\n')}
                        onChange={e => setForm({ ...form, gioiThieu: ghiNhieu(form.gioiThieu, nn, e.target.value, /\n\s*\n/) })}
                        placeholder={`Bài giới thiệu (${NGON_NGU[nn].ten})…`} />
                    <p className='text-[11px] text-slate-400'>Đang có {form.gioiThieu.length} đoạn.</p>
                </Khu>

                <Khu tieuDe='Điểm nổi bật' moTa='Mỗi dòng là một gạch đầu dòng.'>
                    <textarea rows={4} className={lopO}
                        value={docNhieu(form.diemNoiBat, nn, '\n')}
                        onChange={e => setForm({ ...form, diemNoiBat: ghiNhieu(form.diemNoiBat, nn, e.target.value, /\n/) })}
                        placeholder={`Mỗi dòng một ý (${NGON_NGU[nn].ten})…`} />
                    <p className='text-[11px] text-slate-400'>Đang có {form.diemNoiBat.length} ý.</p>
                </Khu>

                <Khu tieuDe='Vị trí' moTa='Lấy toạ độ: mở Google Maps → bấm chuột phải đúng vị trí → dòng đầu menu là "vĩ độ, kinh độ" → bấm để sao chép.'>
                    <div className='grid grid-cols-2 gap-3'>
                        <O nhan='Vĩ độ (latitude)' type='number' step='any' placeholder='20.9527'
                            value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} />
                        <O nhan='Kinh độ (longitude)' type='number' step='any' placeholder='107.0731'
                            value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} />
                    </div>
                    <O nhan='Địa chỉ' placeholder='VD: Phố Long Tiên, P. Hồng Gai'
                        value={form.diaChi} onChange={e => setForm({ ...form, diaChi: e.target.value })} />
                </Khu>

                <Khu tieuDe='Thông tin tham quan'>
                    <div className='grid grid-cols-2 gap-3'>
                        <O nhan='Giờ mở cửa' type='time' value={form.gioMoCua} onChange={e => setForm({ ...form, gioMoCua: e.target.value })} />
                        <O nhan='Giờ đóng cửa' type='time' value={form.gioDongCua} onChange={e => setForm({ ...form, gioDongCua: e.target.value })} />
                    </div>

                    <label className='block'>
                        <span className='text-xs font-semibold text-slate-600'>Ghi chú giờ mở cửa ({NGON_NGU[nn].ten})</span>
                        <textarea rows={2} className={lopO} value={form.gioMoCuaMoTa[nn]}
                            onChange={e => datChu('gioMoCuaMoTa', e.target.value)}
                            placeholder='VD: Mở cửa hằng ngày, đông nhất sáng sớm và ngày rằm' />
                    </label>

                    <label className='block'>
                        <span className='text-xs font-semibold text-slate-600'>Mức giá</span>
                        <span className='block text-[11px] text-slate-400 mt-0.5'>Dùng để LỌC. Không nhập giá từng món — xem ghi chú bên dưới.</span>
                        <select value={form.mucGia} onChange={e => setForm({ ...form, mucGia: e.target.value })} className={lopO}>
                            <option value=''>— Chưa xác định —</option>
                            {MUC_GIA.map(m => (
                                <option key={m.id} value={m.id}>{m.kyHieu ? m.kyHieu + ' · ' : ''}{m.ten[0]} ({m.goi[0]})</option>
                            ))}
                        </select>
                    </label>

                    <label className='block'>
                        <span className='text-xs font-semibold text-slate-600'>Giá vé — mô tả ({NGON_NGU[nn].ten})</span>
                        <span className='block text-[11px] text-slate-400 mt-0.5'>
                            Viết CÂU CHỮ MỀM, đừng viết con số cụ thể: &ldquo;Miễn phí (tùy tâm công đức)&rdquo;,
                            &ldquo;Tham khảo tại quầy&rdquo;. Câu mềm thì không bao giờ sai khi nơi đó đổi giá.
                        </span>
                        <textarea rows={2} className={lopO} value={form.giaVe[nn]} onChange={e => datChu('giaVe', e.target.value)} />
                    </label>

                    <label className='block'>
                        <span className='text-xs font-semibold text-slate-600'>Cách di chuyển ({NGON_NGU[nn].ten})</span>
                        <textarea rows={2} className={lopO} value={form.diChuyen[nn]} onChange={e => datChu('diChuyen', e.target.value)}
                            placeholder='VD: Đi bộ 5 phút từ chợ Hạ Long I' />
                    </label>

                    <div>
                        <span className='text-xs font-semibold text-slate-600'>Tiện ích</span>
                        <div className='flex flex-wrap gap-2 mt-2'>
                            {TIEN_ICH.map(ti => {
                                const chon = form.tienIch.includes(ti.id)
                                return (
                                    <button key={ti.id} type='button' onClick={() => doiTienIch(ti.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${chon ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                                        {ti.icon} {ti.ten[0]}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </Khu>

                <Khu tieuDe='Liên hệ'>
                    <div className='grid sm:grid-cols-3 gap-3'>
                        <O nhan='Điện thoại' placeholder='0912…' value={form.dienThoai} onChange={e => setForm({ ...form, dienThoai: e.target.value })} />
                        <O nhan='Website' placeholder='https://…' value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
                        <O nhan='Facebook' placeholder='https://facebook.com/…' value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} />
                    </div>
                </Khu>

                <Khu tieuDe='Hình ảnh' moTa='Dán đường dẫn ảnh. Cách cũ vẫn dùng được: thả file vào public/dia-diem/<mã>.jpg là tự nhận.'>
                    <O nhan='Ảnh bìa (URL)' placeholder='/dia-diem/chua-long-tien.jpg'
                        value={form.anhBia} onChange={e => setForm({ ...form, anhBia: e.target.value })} />
                    <label className='block'>
                        <span className='text-xs font-semibold text-slate-600'>Ảnh thêm — mỗi dòng một đường dẫn</span>
                        <textarea rows={3} className={lopO} value={(form.anhs || []).join('\n')}
                            onChange={e => setForm({ ...form, anhs: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })} />
                    </label>
                </Khu>

                <Khu tieuDe='Hiển thị'>
                    <div className='grid sm:grid-cols-3 gap-3'>
                        <label className='block'>
                            <span className='text-xs font-semibold text-slate-600'>Màu chủ đạo</span>
                            <div className='flex items-center gap-2 mt-1'>
                                <input type='color' value={mauHienTai} onChange={e => setForm({ ...form, mau: e.target.value })}
                                    className='w-11 h-10 rounded-md border border-slate-200 bg-white cursor-pointer shrink-0' />
                                <input value={form.mau} onChange={e => setForm({ ...form, mau: e.target.value })}
                                    placeholder='theo loại hình'
                                    className='w-full p-2.5 border border-slate-200 rounded-md outline-slate-400 text-sm bg-white' />
                            </div>
                        </label>
                        <O nhan='Icon dự phòng (emoji)' placeholder={timLoai(form.loai)?.icon}
                            value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
                        <O nhan='Độ nổi bật' type='number' goiY='Số lớn hiện lên trước'
                            value={form.noiBat} onChange={e => setForm({ ...form, noiBat: e.target.value })} />
                    </div>

                    <label className='block'>
                        <span className='text-xs font-semibold text-slate-600'>Trạng thái</span>
                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={lopO}>
                            {TRANG_THAI.map(s => <option key={s.id} value={s.id}>{s.ten[0]}</option>)}
                        </select>
                    </label>

                    <div>
                        <span className='text-xs font-semibold text-slate-600'>Gợi ý &ldquo;gần đó còn gì hay&rdquo;</span>
                        <span className='block text-[11px] text-slate-400 mt-0.5'>Chọn tay vài điểm nên ghé cùng chuyến.</span>
                        <div className='flex flex-wrap gap-2 mt-2 max-h-44 overflow-y-auto'>
                            {ds.filter(x => x.id !== form.id).map(x => {
                                const chon = form.lanCan.includes(x.id)
                                return (
                                    <button key={x.id} type='button' onClick={() => doiLanCan(x.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${chon ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                                        {iconDiaDiem(x)} {x.ten?.[0]}
                                    </button>
                                )
                            })}
                            {!ds.filter(x => x.id !== form.id).length && (
                                <p className='text-xs text-slate-400'>Chưa có địa điểm nào khác.</p>
                            )}
                        </div>
                    </div>
                </Khu>

                <div className='sticky bottom-0 bg-slate-50/90 backdrop-blur py-4 mt-4 flex items-center gap-3'>
                    <button disabled={dangLuu}
                        className='flex items-center gap-2 px-8 py-2.5 rounded-md bg-slate-700 text-white text-sm font-semibold active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none'>
                        <Save size={16} /> {dangLuu ? 'Đang lưu…' : laMoi ? 'Thêm địa điểm' : 'Lưu thay đổi'}
                    </button>
                    <button type='button' onClick={() => setForm(null)}
                        className='px-6 py-2.5 rounded-md border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-100 transition'>
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
                    <h2 className='text-2xl text-slate-500'>Quản lý <span className='text-slate-800 font-medium'>Địa điểm</span></h2>
                    <p className='text-sm text-slate-400 mt-1'>
                        Thực thể trung tâm của app du lịch — quán ăn, chùa, di tích, điểm ngắm cảnh đều là địa điểm.
                    </p>
                </div>
                <button onClick={moThem}
                    className='flex items-center gap-2 px-5 py-2.5 rounded-md bg-slate-700 text-white text-sm font-semibold active:scale-95 transition'>
                    <Plus size={16} /> Thêm địa điểm
                </button>
            </div>

            {/* Nạp dữ liệu mẫu — chỉ hiện khi bảng còn trống, tránh bấm nhầm về sau */}
            {!ds.length && (
                <div className='mt-6 bg-sky-50 border border-sky-200 rounded-xl p-5 max-w-2xl'>
                    <p className='font-semibold text-sky-900'>Chưa có địa điểm nào</p>
                    <p className='text-sm text-sky-800 mt-1'>
                        Nạp sẵn bộ địa điểm Hồng Gai đã biên tập đủ 3 thứ tiếng (núi Bài Thơ, chùa Long Tiên,
                        đền Đức Ông, Bảo tàng Quảng Ninh…) để có cái bắt đầu. Nạp xong sửa lại thoải mái.
                    </p>
                    <button onClick={napMau} disabled={dangNap}
                        className='flex items-center gap-2 mt-3 px-5 py-2.5 rounded-md bg-sky-600 text-white text-sm font-semibold active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none'>
                        <DatabaseIcon size={16} /> {dangNap ? 'Đang nạp…' : 'Nạp địa điểm mẫu'}
                    </button>
                </div>
            )}

            {ds.length > 0 && (
                <>
                    <div className='flex items-center gap-3 mt-6 flex-wrap'>
                        <div className='relative'>
                            <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
                            <input value={tim} onChange={e => setTim(e.target.value)} placeholder='Tìm theo tên hoặc mã…'
                                className='pl-9 pr-4 py-2.5 border border-slate-200 rounded-md outline-slate-400 text-sm bg-white w-64 max-w-full' />
                        </div>
                        <select value={locLoai} onChange={e => setLocLoai(e.target.value)}
                            className='px-3 py-2.5 border border-slate-200 rounded-md outline-slate-400 text-sm bg-white'>
                            <option value=''>Tất cả loại hình</option>
                            {LOAI_DIA_DIEM.map(l => <option key={l.id} value={l.id}>{l.icon} {l.ten[0]}</option>)}
                        </select>
                        <span className='text-sm text-slate-400'>{dsLoc.length}/{ds.length} địa điểm</span>
                    </div>

                    <div className='mt-4 flex flex-col gap-2.5 max-w-4xl'>
                        {dsLoc.map(d => {
                            const mau = mauDiaDiem(d)
                            const loai = timLoai(d.loai)
                            const tt = timTrangThai(d.status)
                            return (
                                <div key={d.id} className='flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4'>
                                    <span className='flex items-center justify-center size-12 rounded-xl text-2xl shrink-0'
                                        style={{ backgroundColor: mau + '1a' }}>
                                        {iconDiaDiem(d)}
                                    </span>
                                    <div className='min-w-0 flex-1'>
                                        <div className='flex items-center gap-2 flex-wrap'>
                                            <p className='font-semibold text-slate-800 truncate'>{d.ten?.[0]}</p>
                                            <span className='text-[11px] font-semibold px-2 py-0.5 rounded-full'
                                                style={{ backgroundColor: mau + '1a', color: mau }}>
                                                {loai?.ten[0] || d.loai}
                                            </span>
                                            {d.status !== 'da_duyet' && (
                                                <span className='text-[11px] font-semibold px-2 py-0.5 rounded-full'
                                                    style={{ backgroundColor: (tt?.mau || '#64748b') + '1a', color: tt?.mau || '#64748b' }}>
                                                    {tt?.ten[0] || d.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className='text-xs text-slate-400 mt-0.5 truncate'>
                                            <code>{d.id}</code>
                                            {d.viTri ? ` · ${d.viTri[0].toFixed(4)}, ${d.viTri[1].toFixed(4)}` : ' · chưa có toạ độ'}
                                            {!d.ten?.[1] && ' · thiếu bản tiếng Anh'}
                                            {!d.ten?.[2] && ' · thiếu bản tiếng Trung'}
                                        </p>
                                    </div>
                                    <button onClick={() => moSua(d)}
                                        className='px-4 py-2 rounded-md border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition shrink-0'>
                                        Sửa
                                    </button>
                                    <button onClick={() => xoa(d)} aria-label='Xoá'
                                        className='p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition shrink-0'>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )
                        })}
                        {!dsLoc.length && (
                            <p className='flex items-center gap-2 text-sm text-slate-400 py-8'>
                                <MapPin size={16} /> Không có địa điểm nào khớp bộ lọc.
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
