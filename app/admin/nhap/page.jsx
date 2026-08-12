'use client'
import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AlertTriangle, CheckCircle2, Download, FileUp, MapPinOff, Upload } from 'lucide-react'
import { docCsvDiaDiem } from '@/lib/nhapCsv'
import { LOAI_DIA_DIEM, timLoai, timMucGia } from '@/lib/diaDiemLoai'

// NHẬP HÀNG LOẠT từ Google Sheets.
// Gõ tay 100+ địa điểm vào form từng cái một là không khả thi — đây là đường chính
// để dữ liệu đội thu thập vào được app.
//
// Luôn XEM TRƯỚC rồi mới ghi: bảng bên dưới hiện đúng thứ sẽ được lưu, kèm cảnh báo
// từng dòng. Dòng có LỖI không được nhập (thà thiếu còn hơn nhập rác).

export default function AdminNhap() {
    const [csv, setCsv] = useState('')
    const [kq, setKq] = useState(null)      // kết quả đọc { ds, loi }
    const [ghiDe, setGhiDe] = useState(false)
    const [dangNhap, setDangNhap] = useState(false)
    const [xong, setXong] = useState(null)

    const doc = (vanBan) => {
        setCsv(vanBan)
        setXong(null)
        if (!vanBan.trim()) { setKq(null); return }
        try {
            setKq(docCsvDiaDiem(vanBan))
        } catch (e) {
            setKq({ ds: [], loi: e?.message || 'Không đọc được file' })
        }
    }

    const chonFile = async (e) => {
        const f = e.target.files?.[0]
        e.target.value = ''
        if (!f) return
        doc(await f.text())
    }

    // Cho phép sửa loại hình ngay trên bảng xem trước — máy đoán sai thì chữa tại chỗ,
    // khỏi phải quay lại sửa Google Sheets rồi tải xuống lại.
    const doiLoai = (i, loai) => setKq(k => ({
        ...k,
        ds: k.ds.map((x, n) => n === i
            ? { ...x, doanLoai: false, diaDiem: { ...x.diaDiem, loai } }
            : x),
    }))

    const nhap = async () => {
        setDangNhap(true)
        try {
            const res = await fetch('/api/admin/dia-diem/nhap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diaDiems: hopLe.map(x => x.diaDiem), ghiDe }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || 'Không nhập được'); return }
            setXong(data)
            toast.success(`Đã thêm ${data.daThem}` + (data.daCapNhat ? `, cập nhật ${data.daCapNhat}` : ''))
        } finally {
            setDangNhap(false)
        }
    }

    const ds = kq?.ds || []
    const hopLe = ds.filter(x => x.ok)
    const thieuToaDo = hopLe.filter(x => !x.diaDiem.viTri)
    const canRaSoat = hopLe.filter(x => x.doanLoai)

    return (
        <div className='mb-40 max-w-5xl'>
            <h1 className='text-2xl text-slate-500'>Nhập <span className='text-slate-800 font-medium'>từ Google Sheets</span></h1>
            <p className='text-sm text-slate-400 mt-1'>
                Trong Sheets: <b>Tệp → Tải xuống → CSV</b>, rồi chọn file hoặc dán nội dung vào đây.
                Hệ thống tự nhận 4 mục (cafe / quán ăn / tham quan / lưu trú) theo dòng tiêu đề có emoji.
            </p>

            {/* Nguồn dữ liệu */}
            <div className='flex items-center gap-3 mt-5 flex-wrap'>
                <label className='flex items-center gap-2 px-5 py-2.5 rounded-md bg-slate-700 text-white text-sm font-semibold cursor-pointer active:scale-95 transition'>
                    <FileUp size={16} /> Chọn file CSV
                    <input type='file' accept='.csv,text/csv' onChange={chonFile} className='hidden' />
                </label>
                {csv && (
                    <button onClick={() => { setCsv(''); setKq(null); setXong(null) }}
                        className='px-4 py-2.5 rounded-md border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50'>
                        Xoá
                    </button>
                )}
            </div>

            <textarea value={csv} onChange={e => doc(e.target.value)} rows={5}
                placeholder='...hoặc dán thẳng nội dung CSV vào đây'
                className='w-full mt-3 p-3 border border-slate-200 rounded-md outline-slate-400 text-xs font-mono bg-white' />

            {kq?.loi && (
                <p className='flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mt-3'>
                    <AlertTriangle size={16} /> {kq.loi}
                </p>
            )}

            {/* Tổng quan trước khi ghi */}
            {ds.length > 0 && (
                <>
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6'>
                        {[
                            { nhan: 'Đọc được', so: ds.length, mau: '#334155' },
                            { nhan: 'Sẽ nhập', so: hopLe.length, mau: '#059669' },
                            { nhan: 'Thiếu toạ độ', so: thieuToaDo.length, mau: '#d97706' },
                            { nhan: 'Cần rà loại', so: canRaSoat.length, mau: '#B8923F' },
                        ].map(o => (
                            <div key={o.nhan} className='bg-white border border-slate-200 rounded-xl p-4'>
                                <p className='text-xs text-slate-500'>{o.nhan}</p>
                                <p className='text-2xl font-bold mt-0.5' style={{ color: o.mau }}>{o.so}</p>
                            </div>
                        ))}
                    </div>

                    {thieuToaDo.length > 0 && (
                        <div className='flex items-start gap-2.5 text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mt-4'>
                            <MapPinOff size={17} className='text-amber-600 shrink-0 mt-0.5' />
                            <div className='text-amber-800'>
                                <b>{thieuToaDo.length} địa điểm chưa có toạ độ.</b> Vẫn nhập được, nhưng chúng sẽ
                                <b> không hiện trên bản đồ, không có "gần tôi", không đưa vào lộ trình được</b> —
                                tức là mất phần lớn giá trị của app.
                                <br />
                                Cách bổ sung: mở Google Maps → tìm địa điểm → bấm <b>Chia sẻ → Sao chép liên kết</b>
                                → dán vào cột <i>“Địa chỉ chi tiết ( Link Google Map )”</i> trong Sheets.
                            </div>
                        </div>
                    )}

                    {/* Bảng xem trước */}
                    <div className='overflow-x-auto mt-5 rounded-lg border border-slate-200'>
                        <table className='min-w-full bg-white text-sm'>
                            <thead className='bg-slate-50'>
                                <tr>
                                    {['', 'Tên địa điểm', 'Loại hình', 'Giờ', 'Giá', 'Toạ độ'].map(h => (
                                        <th key={h} className='py-2.5 px-3 text-left font-semibold text-slate-600 whitespace-nowrap'>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-slate-100'>
                                {ds.map((x, i) => {
                                    const d = x.diaDiem
                                    const gia = timMucGia(d.mucGia)
                                    return (
                                        <tr key={`${d.id}-${i}`} className={x.ok ? '' : 'bg-red-50'}>
                                            <td className='py-2 px-3'>
                                                {x.ok
                                                    ? <CheckCircle2 size={15} className='text-green-600' />
                                                    : <AlertTriangle size={15} className='text-red-600' />}
                                            </td>
                                            <td className='py-2 px-3'>
                                                <p className='font-medium text-slate-800'>{d.ten[0]}</p>
                                                <code className='text-[11px] text-slate-400'>{d.id}</code>
                                                {x.loi.map(l => <p key={l} className='text-[11px] text-red-600'>{l}</p>)}
                                                {x.canhBao.filter(c => !/toạ độ/i.test(c)).map(c => (
                                                    <p key={c} className='text-[11px] text-amber-600'>{c}</p>
                                                ))}
                                            </td>
                                            <td className='py-2 px-3'>
                                                <select value={d.loai} onChange={e => doiLoai(i, e.target.value)}
                                                    className={`text-xs p-1.5 rounded border bg-white ${x.doanLoai ? 'border-violet-400 text-violet-700' : 'border-slate-200'}`}>
                                                    {LOAI_DIA_DIEM.map(l => (
                                                        <option key={l.id} value={l.id}>{l.icon} {l.ten[0]}</option>
                                                    ))}
                                                </select>
                                                {x.doanLoai && <p className='text-[10px] text-violet-600 mt-0.5'>máy đoán — rà lại</p>}
                                            </td>
                                            <td className='py-2 px-3 whitespace-nowrap text-slate-600 text-xs'>
                                                {d.gioMoCua ? `${d.gioMoCua}–${d.gioDongCua}` : <span className='text-slate-300'>—</span>}
                                            </td>
                                            <td className='py-2 px-3 text-xs text-slate-600'>
                                                {gia ? <span className='font-semibold'>{gia.kyHieu || gia.ten[0]}</span> : <span className='text-slate-300'>—</span>}
                                            </td>
                                            <td className='py-2 px-3 text-xs whitespace-nowrap'>
                                                {d.viTri
                                                    ? <span className='text-green-600'>{d.viTri[0].toFixed(4)}, {d.viTri[1].toFixed(4)}</span>
                                                    : <span className='text-amber-600'>thiếu</span>}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Ghi vào CSDL */}
                    <div className='flex items-center gap-4 flex-wrap mt-5'>
                        <button onClick={nhap} disabled={dangNhap || !hopLe.length}
                            className='flex items-center gap-2 px-8 py-2.5 rounded-md bg-green-600 text-white text-sm font-semibold active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none'>
                            <Upload size={16} /> {dangNhap ? 'Đang nhập…' : `Nhập ${hopLe.length} địa điểm`}
                        </button>
                        <label className='flex items-center gap-2 text-sm text-slate-600'>
                            <input type='checkbox' checked={ghiDe} onChange={e => setGhiDe(e.target.checked)} />
                            Ghi đè địa điểm đã có
                            <span className='text-xs text-slate-400'>(mặc định: bỏ qua, không đè bản đã sửa tay)</span>
                        </label>
                    </div>
                </>
            )}

            {/* Kết quả */}
            {xong && (
                <div className='bg-green-50 border border-green-200 rounded-xl p-5 mt-5'>
                    <p className='font-semibold text-green-800'>
                        Đã thêm {xong.daThem} địa điểm
                        {xong.daCapNhat > 0 && `, cập nhật ${xong.daCapNhat}`}
                    </p>
                    {xong.boQua?.length > 0 && (
                        <p className='text-sm text-green-700 mt-1'>
                            Bỏ qua {xong.boQua.length} địa điểm đã có: {xong.boQua.slice(0, 6).join(', ')}
                            {xong.boQua.length > 6 && '…'}
                        </p>
                    )}
                    {xong.loiGhi?.length > 0 && (
                        <div className='text-sm text-red-700 mt-2'>
                            {xong.loiGhi.map(l => <p key={l}>{l}</p>)}
                        </div>
                    )}
                    <Link href='/admin/dia-diem' className='inline-block mt-3 text-sm font-semibold text-green-800 underline'>
                        Xem danh sách địa điểm
                    </Link>
                </div>
            )}
        </div>
    )
}
