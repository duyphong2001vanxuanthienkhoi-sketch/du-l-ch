'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import Anh from '@/components/Anh'
import { formatVND } from '@/lib/utils/currency'
import { nenAnh } from '@/lib/utils/nenAnh'
import { useNgonNgu } from '@/lib/i18n'
import { Camera, Pencil, Plus, Trash2, UtensilsCrossed, X } from 'lucide-react'

const MAU = '#ea580c'
const PHAN_GOI_Y = ['Món chính', 'Khai vị', 'Đồ uống', 'Tráng miệng', 'Ăn vặt']
const RONG = { ten: '', moTa: '', gia: '', phan: '' }

export default function QuanLyThucDon() {
    const { t } = useNgonNgu()
    const [quan, setQuan] = useState(undefined) // undefined=đang tải; null=chưa có quán
    const [mons, setMons] = useState([])
    const [form, setForm] = useState(RONG)
    const [anh, setAnh] = useState(null)      // file ảnh mới đã nén
    const [suaId, setSuaId] = useState(null)   // đang sửa món nào
    const [dangGui, setDangGui] = useState(false)

    useEffect(() => {
        fetch('/api/quan-an/me').then(r => r.json()).then(async d => {
            setQuan(d.quanAn || null)
            if (d.quanAn?.status === 'da_duyet') {
                const md = await fetch('/api/quan-an/mon').then(r => r.json())
                setMons(md.mon || [])
            }
        }).catch(() => setQuan(null))
    }, [])

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const chonAnh = async (e) => {
        const f = e.target.files[0]
        e.target.value = ''
        if (!f) return
        try { setAnh(await nenAnh(f)) } catch { toast.error(t('Ảnh không hợp lệ', 'Invalid image', '图片无效')) }
    }

    const resetForm = () => { setForm(RONG); setAnh(null); setSuaId(null) }

    const sua = (m) => {
        setSuaId(m.id)
        setForm({ ten: m.ten, moTa: m.moTa || '', gia: String(m.gia), phan: m.phan || '' })
        setAnh(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const luu = async (e) => {
        e.preventDefault()
        if (!form.ten.trim()) return toast.error(t('Nhập tên món', 'Enter the dish name', '请输入菜名'))
        if (!(Number(form.gia) > 0)) return toast.error(t('Giá món phải là số dương', 'Price must be a positive number', '价格必须为正数'))
        setDangGui(true)
        try {
            const fd = new FormData()
            fd.append('ten', form.ten); fd.append('moTa', form.moTa)
            fd.append('gia', form.gia); fd.append('phan', form.phan)
            if (anh) fd.append('anh', anh)

            const res = await fetch(suaId ? `/api/quan-an/mon/${suaId}` : '/api/quan-an/mon', { method: suaId ? 'PUT' : 'POST', body: fd })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Lưu thất bại', 'Save failed', '保存失败')); return }
            setMons(prev => suaId ? prev.map(m => m.id === suaId ? data.mon : m) : [...prev, data.mon])
            toast.success(suaId ? t('Đã cập nhật món', 'Dish updated', '菜品已更新') : t('Đã thêm món', 'Dish added', '菜品已添加'))
            resetForm()
        } finally { setDangGui(false) }
    }

    const doiCon = async (m) => {
        const fd = new FormData(); fd.append('con', String(!m.con))
        const res = await fetch(`/api/quan-an/mon/${m.id}`, { method: 'PUT', body: fd })
        const data = await res.json()
        if (res.ok) setMons(prev => prev.map(x => x.id === m.id ? data.mon : x))
    }

    const xoa = async (m) => {
        if (!confirm(`${t('Xóa món', 'Delete dish', '删除菜品')} "${m.ten}"?`)) return
        const res = await fetch(`/api/quan-an/mon/${m.id}`, { method: 'DELETE' })
        if (res.ok) { setMons(prev => prev.filter(x => x.id !== m.id)); toast.success(t('Đã xóa món', 'Dish deleted', '菜品已删除')) }
        else toast.error(t('Xóa thất bại', 'Delete failed', '删除失败'))
    }

    if (quan === undefined) return <Loading />

    if (!quan || quan.status !== 'da_duyet') return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-6'>
            <UtensilsCrossed size={48} className='text-slate-300' />
            <h1 className='text-2xl font-semibold text-slate-700 mt-4'>{t('Bạn chưa có quán ăn', "You don't have an eatery yet", '您还没有餐馆')}</h1>
            <p className='text-slate-500 text-sm mt-2'>{t('Mở quán ăn trước rồi mới thêm món vào thực đơn.', 'Open an eatery first, then add dishes to the menu.', '请先开设餐馆，再添加菜品到菜单。')}</p>
            <Link href='/create-quan-an' className='text-white px-8 py-2.5 rounded-full mt-6 text-sm font-medium' style={{ backgroundColor: MAU }}>{t('Mở quán ăn', 'Open an eatery', '开设餐馆')}</Link>
        </div>
    )

    // Gom món theo phần
    const phans = []; const theoPhan = {}
    const KHAC = 'Món khác'
    for (const m of mons) { const p = m.phan || KHAC; if (!theoPhan[p]) { theoPhan[p] = []; phans.push(p) } theoPhan[p].push(m) }

    return (
        <div className='mx-6 my-10 mb-28 max-w-3xl'>
            <div className='flex items-center justify-between gap-3 flex-wrap'>
                <h1 className='text-2xl text-slate-500'>{t('Thực đơn', 'Menu', '菜单')} <span className='text-slate-800 font-medium'>{quan.ten}</span></h1>
                <div className='flex items-center gap-4 flex-wrap'>
                    <Link href='/quan-an/don-hang' className='text-sm font-semibold' style={{ color: MAU }}>{t('Đơn đặt món →', 'Food orders →', '餐饮订单 →')}</Link>
                    <Link href='/quan-an/thong-tin' className='text-sm font-semibold text-slate-500 hover:text-slate-700'>{t('Thông tin quán →', 'Eatery info →', '餐馆信息 →')}</Link>
                    <Link href={`/do-an/${quan.id}`} className='text-sm font-semibold text-slate-500 hover:text-slate-700'>{t('Xem trang quán →', 'View eatery page →', '查看餐馆页 →')}</Link>
                </div>
            </div>

            {/* Form thêm/sửa món */}
            <form onSubmit={luu} className='bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mt-6'>
                <p className='font-semibold text-slate-700 mb-3 flex items-center gap-2'>
                    {suaId ? <><Pencil size={16} /> {t('Sửa món', 'Edit dish', '编辑菜品')}</> : <><Plus size={16} /> {t('Thêm món mới', 'Add new dish', '添加新菜品')}</>}
                </p>
                <div className='flex gap-4'>
                    <label className='size-24 shrink-0 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-orange-400 hover:text-orange-500 transition overflow-hidden relative'>
                        {anh ? <img src={URL.createObjectURL(anh)} alt='' className='w-full h-full object-cover' />
                            : suaId && mons.find(m => m.id === suaId)?.anh ? <Anh src={mons.find(m => m.id === suaId).anh} alt='' className='w-full h-full object-cover' />
                            : <><Camera size={20} /><span className='text-ti mt-1'>{t('Ảnh món', 'Dish photo', '菜品图片')}</span></>}
                        <input type='file' accept='image/png,image/jpeg,image/webp' hidden onChange={chonAnh} />
                    </label>
                    <div className='flex-1 flex flex-col gap-3 text-sm min-w-0'>
                        <input name='ten' value={form.ten} onChange={onChange} required maxLength={80} placeholder={t('Tên món (VD: Ghẹ hấp bia)', 'Dish name (e.g. Beer-steamed crab)', '菜名（如：啤酒蒸蟹）')} className='w-full bg-slate-100 px-4 py-2.5 rounded-xl outline-none placeholder-slate-400' />
                        <div className='grid grid-cols-2 gap-3'>
                            <input name='gia' value={form.gia} onChange={onChange} required type='number' min='1000' step='1000' placeholder={t('Giá (VNĐ)', 'Price (VND)', '价格（越南盾）')} className='w-full bg-slate-100 px-4 py-2.5 rounded-xl outline-none placeholder-slate-400' />
                            <input name='phan' value={form.phan} onChange={onChange} list='phan-goi-y' placeholder={t('Phần (VD: Món chính)', 'Section (e.g. Mains)', '分类（如：主菜）')} className='w-full bg-slate-100 px-4 py-2.5 rounded-xl outline-none placeholder-slate-400' />
                            <datalist id='phan-goi-y'>{PHAN_GOI_Y.map(p => <option key={p} value={p} />)}</datalist>
                        </div>
                        <input name='moTa' value={form.moTa} onChange={onChange} maxLength={200} placeholder={t('Mô tả ngắn (không bắt buộc)', 'Short description (optional)', '简短介绍（可选）')} className='w-full bg-slate-100 px-4 py-2.5 rounded-xl outline-none placeholder-slate-400' />
                    </div>
                </div>
                <div className='flex items-center gap-2 mt-4'>
                    <button type='submit' disabled={dangGui} className='text-white text-sm font-semibold px-6 py-2.5 rounded-full active:scale-95 transition disabled:opacity-60' style={{ backgroundColor: MAU }}>
                        {dangGui ? t('Đang lưu...', 'Saving...', '保存中...') : suaId ? t('Lưu thay đổi', 'Save changes', '保存更改') : t('Thêm món', 'Add dish', '添加菜品')}
                    </button>
                    {suaId && <button type='button' onClick={resetForm} className='text-sm text-slate-500 px-4 py-2.5 rounded-full hover:bg-slate-100 flex items-center gap-1'><X size={14} /> {t('Hủy', 'Cancel', '取消')}</button>}
                </div>
            </form>

            {/* Danh sách món theo phần */}
            <h2 className='text-lg font-semibold text-slate-700 mt-8 mb-3'>{t('Món trong thực đơn', 'Dishes in menu', '菜单中的菜品')} ({mons.length})</h2>
            {mons.length ? (
                <div className='flex flex-col gap-6'>
                    {phans.map(phan => (
                        <div key={phan}>
                            <h3 className='text-sm font-bold text-slate-600 mb-2'>{phan === KHAC ? t('Món khác', 'Other', '其他') : phan}</h3>
                            <div className='flex flex-col gap-2'>
                                {theoPhan[phan].map(m => (
                                    <div key={m.id} className={`flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm ${m.con ? '' : 'opacity-60'}`}>
                                        <Anh src={m.anh} alt={m.ten} className='size-14 rounded-xl object-cover ring-1 ring-slate-100 shrink-0' />
                                        <div className='min-w-0 flex-1'>
                                            <p className='font-semibold text-slate-800 truncate'>{m.ten}</p>
                                            {m.moTa && <p className='text-xs text-slate-500 truncate'>{m.moTa}</p>}
                                            <p className='text-sm font-bold' style={{ color: MAU }}>{formatVND(m.gia)}</p>
                                        </div>
                                        <button onClick={() => doiCon(m)} className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${m.con ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {m.con ? t('Còn món', 'Available', '有货') : t('Hết món', 'Sold out', '售罄')}
                                        </button>
                                        <button onClick={() => sua(m)} aria-label={t('Sửa', 'Edit', '编辑')} className='size-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 shrink-0'><Pencil size={15} /></button>
                                        <button onClick={() => xoa(m)} aria-label={t('Xóa', 'Delete', '删除')} className='size-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 shrink-0'><Trash2 size={15} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className='text-slate-400 text-sm py-10 text-center bg-slate-50 rounded-2xl'>{t('Chưa có món nào — thêm món đầu tiên ở form trên nhé.', 'No dishes yet — add your first one in the form above.', '暂无菜品 —— 在上方表单添加第一道菜吧。')}</p>
            )}
        </div>
    )
}
