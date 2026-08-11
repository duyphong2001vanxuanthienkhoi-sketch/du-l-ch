'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import Anh from '@/components/Anh'
import { nenAnh } from '@/lib/utils/nenAnh'
import { BUOI_DO_AN, NHOM_DO_AN } from '@/lib/doAn'
import { useNgonNgu } from '@/lib/i18n'
import { Camera, Clock, MapPin, Phone, UserRound, UtensilsCrossed } from 'lucide-react'

const MAU = '#ea580c'

export default function ThongTinQuanAn() {
    const { t } = useNgonNgu()
    const [quan, setQuan] = useState(undefined) // undefined=đang tải; null=chưa có
    const [dangGui, setDangGui] = useState(false)
    const [form, setForm] = useState({ ten: '', tenChu: '', soDienThoai: '', diaChi: '', moTa: '', gioMoCua: '', gioDongCua: '' })
    const [loai, setLoai] = useState([])
    const [nhom, setNhom] = useState([])
    const [anh, setAnh] = useState(null) // ảnh mới (File) nếu đổi

    useEffect(() => {
        fetch('/api/quan-an/me').then(r => r.json()).then(d => {
            const q = d.quanAn || null
            setQuan(q)
            if (q) {
                setForm({ ten: q.ten || '', tenChu: q.tenChu || '', soDienThoai: q.soDienThoai || '', diaChi: q.diaChi || '', moTa: q.moTa || '', gioMoCua: q.gioMoCua || '', gioDongCua: q.gioDongCua || '' })
                setLoai(q.loai || []); setNhom(q.nhom || [])
            }
        }).catch(() => setQuan(null))
    }, [])

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
    const batTat = (setter, arr, id) => setter(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id])

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!loai.length) return toast.error(t('Chọn ít nhất 1 buổi phục vụ', 'Choose at least 1 serving time', '至少选择1个供应时段'))
        if (!nhom.length) return toast.error(t('Chọn ít nhất 1 loại món', 'Choose at least 1 cuisine type', '至少选择1个菜类'))

        setDangGui(true)
        try {
            const fd = new FormData()
            Object.entries(form).forEach(([k, v]) => fd.append(k, v))
            fd.append('loai', JSON.stringify(loai))
            fd.append('nhom', JSON.stringify(nhom))
            if (anh) fd.append('logo', await nenAnh(anh))

            const res = await fetch('/api/quan-an/cap-nhat', { method: 'POST', body: fd })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了')); return }
            toast.success(t('Đã cập nhật thông tin quán!', 'Eatery info updated!', '餐馆信息已更新！'))
            setQuan(data.quanAn)
            setAnh(null)
        } finally {
            setDangGui(false)
        }
    }

    if (quan === undefined) return <Loading />

    // Chưa có quán / chưa duyệt -> mời sang trang quán
    if (!quan || quan.status !== 'da_duyet') return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-6'>
            <UtensilsCrossed size={48} className='text-slate-300' />
            <h1 className='text-2xl font-semibold text-slate-700 mt-4'>{t('Chưa thể sửa thông tin quán', 'Cannot edit eatery info yet', '暂时无法编辑餐馆信息')}</h1>
            <p className='text-slate-500 text-sm mt-2'>{t('Bạn cần có quán ăn đã được duyệt mới sửa được thông tin quán.', 'You need an approved eatery to edit its info.', '需要有已通过审核的餐馆才能编辑信息。')}</p>
            <Link href='/create-quan-an' className='text-white px-8 py-2.5 rounded-full mt-6 text-sm font-medium' style={{ backgroundColor: MAU }}>{t('Trang quán của tôi', 'My eatery page', '我的餐馆页')}</Link>
        </div>
    )

    const anhXemTruoc = anh ? URL.createObjectURL(anh) : null

    return (
        <div className='mx-6 my-10 mb-28'>
            <form onSubmit={onSubmit} className='max-w-xl mx-auto'>
                <div className='flex items-center justify-between gap-3 flex-wrap'>
                    <h1 className='text-2xl text-slate-500'>{t('Thông tin', 'Info', '信息')} <span className='text-slate-800 font-medium'>{t('Quán Ăn', 'Eatery', '餐馆')}</span></h1>
                    <div className='flex items-center gap-4'>
                        <Link href='/quan-an/thuc-don' className='text-sm font-semibold' style={{ color: MAU }}>{t('Thực đơn →', 'Menu →', '菜单 →')}</Link>
                        <Link href={`/do-an/${quan.id}`} className='text-sm font-semibold text-slate-500 hover:text-slate-700'>{t('Xem trang quán →', 'View eatery page →', '查看餐馆页 →')}</Link>
                    </div>
                </div>

                <div className='flex flex-col gap-4 mt-7 text-sm'>
                    {/* Ảnh đại diện quán (avatar) */}
                    <div>
                        <p className='text-slate-600 font-medium mb-1.5'>{t('Ảnh đại diện quán', 'Eatery cover photo', '餐馆封面图片')}</p>
                        <label className='flex items-center gap-4 cursor-pointer bg-slate-100 hover:bg-slate-200 transition px-4 py-3 rounded-xl'>
                            {anhXemTruoc ? (
                                <img src={anhXemTruoc} alt={t('Xem trước ảnh mới', 'New photo preview', '新图片预览')} className='size-16 rounded-xl object-cover' />
                            ) : quan.logo ? (
                                <Anh src={quan.logo} alt={t('Ảnh hiện tại', 'Current photo', '当前图片')} className='size-16 rounded-xl object-cover' />
                            ) : (
                                <span className='flex items-center justify-center size-16 rounded-xl bg-white text-slate-400'><Camera size={22} /></span>
                            )}
                            <span className='text-slate-500'>{anh ? anh.name : t('Bấm để đổi ảnh (PNG/JPG/WebP, tối đa 5MB)', 'Tap to change photo (PNG/JPG/WebP, max 5MB)', '点击更换图片（PNG/JPG/WebP，最大5MB）')}</span>
                            <input type='file' accept='image/png,image/jpeg,image/webp' hidden onChange={e => setAnh(e.target.files[0] || null)} />
                        </label>
                    </div>

                    <div>
                        <p className='text-slate-600 font-medium mb-1.5'>{t('Tên quán', 'Eatery name', '餐馆名称')}</p>
                        <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl'>
                            <UtensilsCrossed size={17} className='text-slate-500 shrink-0' />
                            <input name='ten' value={form.ten} onChange={onChange} required maxLength={60} placeholder={t('VD: Hải Sản Cô Tư', 'e.g. Co Tu Seafood', '如：四姑海鲜')} className='w-full bg-transparent outline-none placeholder-slate-400' />
                        </div>
                    </div>

                    <div className='grid sm:grid-cols-2 gap-4'>
                        <div>
                            <p className='text-slate-600 font-medium mb-1.5'>{t('Tên chủ quán', 'Owner name', '店主姓名')}</p>
                            <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl'>
                                <UserRound size={17} className='text-slate-500 shrink-0' />
                                <input name='tenChu' value={form.tenChu} onChange={onChange} required maxLength={50} placeholder={t('VD: Nguyễn Thị Tư', 'e.g. Nguyen Thi Tu', '如：阮氏四')} className='w-full bg-transparent outline-none placeholder-slate-400' />
                            </div>
                        </div>
                        <div>
                            <p className='text-slate-600 font-medium mb-1.5'>{t('Số điện thoại', 'Phone number', '手机号')}</p>
                            <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl'>
                                <Phone size={17} className='text-slate-500 shrink-0' />
                                <input name='soDienThoai' value={form.soDienThoai} onChange={onChange} required type='tel' placeholder={t('VD: 0912345678', 'e.g. 0912345678', '如：0912345678')} className='w-full bg-transparent outline-none placeholder-slate-400' />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className='text-slate-600 font-medium mb-1.5'>{t('Địa chỉ quán', 'Eatery address', '餐馆地址')}</p>
                        <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl'>
                            <MapPin size={17} className='text-slate-500 shrink-0' />
                            <input name='diaChi' value={form.diaChi} onChange={onChange} required maxLength={120} placeholder={t('VD: Đường bao biển Trần Quốc Nghiễn, Hồng Gai', 'e.g. Tran Quoc Nghien coastal road, Hong Gai', '如：鸿基陈国岘海滨路')} className='w-full bg-transparent outline-none placeholder-slate-400' />
                        </div>
                    </div>

                    <div className='grid sm:grid-cols-2 gap-4'>
                        <div>
                            <p className='text-slate-600 font-medium mb-1.5'>{t('Giờ mở cửa', 'Opening time', '开门时间')}</p>
                            <input name='gioMoCua' value={form.gioMoCua} onChange={onChange} required type='time' className='w-full bg-slate-100 px-4 py-3 rounded-xl outline-none' />
                        </div>
                        <div>
                            <p className='text-slate-600 font-medium mb-1.5'>{t('Giờ đóng cửa', 'Closing time', '关门时间')}</p>
                            <input name='gioDongCua' value={form.gioDongCua} onChange={onChange} required type='time' className='w-full bg-slate-100 px-4 py-3 rounded-xl outline-none' />
                        </div>
                    </div>

                    <div>
                        <p className='text-slate-600 font-medium mb-1.5'>{t('Buổi phục vụ', 'Serving times', '供应时段')} <span className='text-slate-400 font-normal'>{t('(chọn nhiều)', '(select multiple)', '（可多选）')}</span></p>
                        <div className='flex flex-wrap gap-2'>
                            {BUOI_DO_AN.map(b => {
                                const chon = loai.includes(b.id)
                                return (
                                    <button type='button' key={b.id} onClick={() => batTat(setLoai, loai, b.id)}
                                        className={`flex items-center gap-1.5 pl-1.5 pr-3.5 py-1.5 rounded-full border-2 text-sm transition ${chon ? 'text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                        style={chon ? { backgroundColor: MAU, borderColor: MAU } : {}}>
                                        <span className={`flex items-center justify-center size-6 rounded-full shrink-0 ${chon ? 'bg-white/25' : 'bg-white'}`}>
                                            {b.anh ? <img src={b.anh} alt='' className='w-[18px] h-[18px] object-contain' /> : <span className='text-sm leading-none'>{b.icon}</span>}
                                        </span>
                                        {t(...b.ten)}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <p className='text-slate-600 font-medium mb-1.5'>{t('Loại món', 'Cuisine type', '菜类')} <span className='text-slate-400 font-normal'>{t('(chọn nhiều)', '(select multiple)', '（可多选）')}</span></p>
                        <div className='flex flex-wrap gap-2'>
                            {NHOM_DO_AN.map(n => {
                                const chon = nhom.includes(n.id)
                                return (
                                    <button type='button' key={n.id} onClick={() => batTat(setNhom, nhom, n.id)}
                                        className={`flex items-center gap-1.5 pl-1.5 pr-3.5 py-1.5 rounded-full border-2 text-sm transition ${chon ? 'text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                        style={chon ? { backgroundColor: MAU, borderColor: MAU } : {}}>
                                        <span className={`flex items-center justify-center size-6 rounded-full shrink-0 ${chon ? 'bg-white/25' : 'bg-white'}`}>
                                            <img src={n.anh} alt='' className='w-[18px] h-[18px] object-contain' />
                                        </span>
                                        {t(...n.ten)}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <p className='text-slate-600 font-medium mb-1.5'>{t('Mô tả ngắn', 'Short description', '简短介绍')}</p>
                        <textarea name='moTa' value={form.moTa} onChange={onChange} required rows={3} maxLength={300}
                            placeholder={t('Quán bán gì, có gì đặc biệt?', 'What do you sell, what makes it special?', '您卖什么、有何特色？')} className='w-full bg-slate-100 px-4 py-3 rounded-xl outline-none placeholder-slate-400 resize-none' />
                    </div>

                    <button type='submit' disabled={dangGui}
                        className='text-white font-medium py-3 rounded-full mt-2 active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none' style={{ backgroundColor: MAU }}>
                        {dangGui ? t('Đang lưu...', 'Saving...', '保存中...') : t('Lưu thay đổi', 'Save changes', '保存更改')}
                    </button>
                </div>
            </form>
        </div>
    )
}
