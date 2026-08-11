'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import Anh from '@/components/Anh'
import { nenAnh } from '@/lib/utils/nenAnh'
import { useAuth } from '@/components/AuthProvider'
import { useNgonNgu } from '@/lib/i18n'
import { BUOI_DO_AN, NHOM_DO_AN } from '@/lib/doAn'
import { ArrowRight, Camera, CheckCircle2, Clock, MapPin, Phone, UserRound, UtensilsCrossed, XCircle } from 'lucide-react'

const MAU = '#ea580c'
const TRANG_THAI = {
    cho_duyet: { ten: ['Chờ duyệt', 'Pending approval', '待审核'], mau: '#d97706', nen: '#fef3c7', Icon: Clock, thongBao: ['Quán đang chờ quản trị viên duyệt. Duyệt xong là bạn thêm món và nhận đơn được ngay.', 'Your eatery is awaiting admin approval. Once approved, you can add dishes and receive orders right away.', '餐馆正在等待管理员审核。审核通过后即可添加菜品和接单。'] },
    da_duyet: { ten: ['Đang hoạt động', 'Active', '运营中'], mau: '#059669', nen: '#d1fae5', Icon: CheckCircle2, thongBao: ['Quán đã hoạt động! Thêm món vào thực đơn để khách đặt.', 'Your eatery is live! Add dishes to the menu for customers to order.', '餐馆已上线！添加菜品供顾客点餐。'] },
    tu_choi: { ten: ['Bị từ chối', 'Rejected', '已拒绝'], mau: '#dc2626', nen: '#fee2e2', Icon: XCircle, thongBao: ['Quán chưa được duyệt. Chỉnh sửa thông tin rồi nộp lại để admin xét lại nhé.', 'Your eatery was not approved. Edit the info and resubmit for admin review.', '餐馆未通过审核。请修改信息后重新提交，供管理员再次审核。'] },
}

export default function MoQuanAn() {
    const { user } = useAuth()
    const { t } = useNgonNgu()
    const [quan, setQuan] = useState(undefined) // undefined = đang tải; null = chưa có
    const [dangGui, setDangGui] = useState(false)
    const [suaLai, setSuaLai] = useState(false)

    const [form, setForm] = useState({ ten: '', tenChu: '', soDienThoai: '', diaChi: '', moTa: '', gioMoCua: '', gioDongCua: '' })
    const [loai, setLoai] = useState([])
    const [nhom, setNhom] = useState([])
    const [anh, setAnh] = useState(null)

    useEffect(() => {
        fetch('/api/quan-an/me').then(r => r.json()).then(d => setQuan(d.quanAn || null)).catch(() => setQuan(null))
    }, [])

    const loading = user === undefined || quan === undefined
    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
    const batTat = (setter, arr, id) => setter(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id])

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!loai.length) return toast.error(t('Chọn ít nhất 1 buổi phục vụ', 'Choose at least 1 serving time', '至少选择1个供应时段'))
        if (!nhom.length) return toast.error(t('Chọn ít nhất 1 loại món', 'Choose at least 1 cuisine type', '至少选择1个菜类'))
        if (!anh && !suaLai) return toast.error(t('Vui lòng chọn ảnh đại diện quán', 'Please choose a cover photo for the eatery', '请选择餐馆封面图片'))

        setDangGui(true)
        try {
            const fd = new FormData()
            Object.entries(form).forEach(([k, v]) => fd.append(k, v))
            fd.append('loai', JSON.stringify(loai))
            fd.append('nhom', JSON.stringify(nhom))
            if (anh) fd.append('logo', await nenAnh(anh))

            const res = await fetch('/api/quan-an/register', { method: 'POST', body: fd })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了')); return }
            toast.success(suaLai ? t('Đã nộp lại! Quán đang chờ duyệt.', 'Resubmitted! Your eatery is pending approval.', '已重新提交！餐馆待审核。') : t('Đã gửi đăng ký! Quán đang chờ quản trị viên duyệt.', 'Registration sent! Your eatery is awaiting admin approval.', '注册已提交！餐馆等待管理员审核。'))
            setQuan(data.quanAn)
            setSuaLai(false)
        } finally {
            setDangGui(false)
        }
    }

    if (loading) return <Loading />

    if (!user) return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-6 my-10'>
            <UtensilsCrossed size={48} className='text-slate-300' />
            <h1 className='text-2xl font-semibold text-slate-700 mt-4'>{t('Mở quán ăn trên Chợ Số', 'Open an eatery on Cho So', '在数字市场开设餐馆')}</h1>
            <p className='text-slate-500 text-sm mt-2 max-w-md'>{t('Bạn cần đăng nhập trước khi mở quán ăn.', 'You need to sign in before opening an eatery.', '开设餐馆前需要先登录。')}</p>
            <Link href='/login?ve=/create-quan-an' className='text-white px-8 py-2.5 rounded-full mt-6 text-sm font-medium' style={{ backgroundColor: MAU }}>{t('Đăng nhập ngay', 'Sign in now', '立即登录')}</Link>
        </div>
    )

    // Đã có quán -> thẻ trạng thái theo tình trạng duyệt
    if (quan && !suaLai) {
        const tt = TRANG_THAI[quan.status] || TRANG_THAI.cho_duyet
        return (
            <div className='min-h-[60vh] flex items-center justify-center px-6 my-10'>
                <div className='w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-lg p-8'>
                    <div className='flex items-center gap-4'>
                        <Anh src={quan.logo} alt={quan.ten} className='size-16 rounded-2xl object-cover ring-1 ring-slate-100' />
                        <div className='flex-1 min-w-0'>
                            <h1 className='text-xl font-bold text-slate-800 truncate'>{quan.ten}</h1>
                            <p className='text-sm text-slate-500'>{t('Chủ quán:', 'Owner:', '店主：')} {quan.tenChu}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2 mt-6 rounded-2xl px-4 py-3' style={{ backgroundColor: tt.nen }}>
                        <tt.Icon size={18} style={{ color: tt.mau }} />
                        <span className='text-sm font-bold' style={{ color: tt.mau }}>{t(...tt.ten)}</span>
                    </div>
                    <p className='text-sm text-slate-600 mt-3 leading-relaxed'>{t(...tt.thongBao)}</p>
                    <div className='text-sm text-slate-500 mt-4 space-y-1.5 border-t border-slate-100 pt-4'>
                        <p className='flex items-center gap-2'><Clock size={14} /> {quan.gioMoCua} - {quan.gioDongCua}</p>
                        <p className='flex items-center gap-2'><MapPin size={14} /> {quan.diaChi}</p>
                        <p className='flex items-center gap-2'><Phone size={14} /> {quan.soDienThoai}</p>
                    </div>
                    <div className='flex items-center gap-3 mt-7 flex-wrap'>
                        {quan.status === 'da_duyet' && (
                            <>
                                <Link href='/quan-an/thuc-don' className='flex items-center gap-2 text-white px-6 py-2.5 rounded-full text-sm font-medium active:scale-95 transition' style={{ backgroundColor: MAU }}>
                                    <UtensilsCrossed size={15} /> {t('Quản lý thực đơn', 'Manage menu', '管理菜单')} <ArrowRight size={15} />
                                </Link>
                                <Link href='/quan-an/don-hang' className='px-6 py-2.5 rounded-full text-sm font-medium bg-slate-100 hover:bg-slate-200 transition text-slate-600'>{t('Đơn đặt món', 'Food orders', '餐饮订单')}</Link>
                                <Link href='/quan-an/thong-tin' className='px-6 py-2.5 rounded-full text-sm font-medium bg-slate-100 hover:bg-slate-200 transition text-slate-600'>{t('Sửa thông tin quán', 'Edit eatery info', '修改餐馆信息')}</Link>
                                <Link href={`/do-an/${quan.id}`} className='px-6 py-2.5 rounded-full text-sm font-medium bg-slate-100 hover:bg-slate-200 transition text-slate-600'>{t('Xem trang quán', 'View eatery page', '查看餐馆页')}</Link>
                            </>
                        )}
                        {quan.status === 'tu_choi' && (
                            <button
                                onClick={() => {
                                    setForm({ ten: quan.ten, tenChu: quan.tenChu, soDienThoai: quan.soDienThoai, diaChi: quan.diaChi, moTa: quan.moTa, gioMoCua: quan.gioMoCua, gioDongCua: quan.gioDongCua })
                                    setLoai(quan.loai || []); setNhom(quan.nhom || [])
                                    setSuaLai(true)
                                }}
                                className='text-white px-6 py-2.5 rounded-full text-sm font-medium active:scale-95 transition' style={{ backgroundColor: MAU }}>
                                {t('Sửa & nộp lại', 'Edit & resubmit', '修改并重新提交')}
                            </button>
                        )}
                        <Link href='/' className='px-6 py-2.5 rounded-full text-sm font-medium bg-slate-100 hover:bg-slate-200 transition text-slate-600'>{t('Về trang chủ', 'Back to home', '返回首页')}</Link>
                    </div>
                </div>
            </div>
        )
    }

    // Form đăng ký quán
    return (
        <div className='mx-6 my-14'>
            <form onSubmit={onSubmit} className='max-w-xl mx-auto'>
                <h1 className='text-3xl text-slate-500'>{t('Mở', 'Open an', '开设')} <span className='text-slate-800 font-medium'>{t('Quán Ăn', 'Eatery', '餐馆')}</span></h1>
                <p className='text-sm text-slate-500 mt-2 max-w-lg'>{t('Đăng ký quán để bán đồ ăn/uống trên Chợ Số Hồng Gai. Quán hoạt động ngay sau khi đăng ký, bạn thêm món vào thực đơn là khách xem được.', 'Register your eatery to sell food & drinks on Cho So Hong Gai. It goes live right after registration — add dishes to the menu and customers can see them.', '注册餐馆以在鸿基数字市场销售餐饮。注册后立即上线 —— 添加菜品后顾客即可查看。')}</p>

                <div className='flex flex-col gap-4 mt-8 text-sm'>
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
                            placeholder={t('Quán bán gì, có gì đặc biệt? VD: Hải sản tươi bến Hòn Gai, chế biến tại chỗ...', 'What do you sell, what makes it special? e.g. Fresh seafood from Hon Gai wharf, cooked on the spot...', '您卖什么、有何特色？如：鸿基码头的新鲜海鲜，现场烹制...')} className='w-full bg-slate-100 px-4 py-3 rounded-xl outline-none placeholder-slate-400 resize-none' />
                    </div>

                    <div>
                        <p className='text-slate-600 font-medium mb-1.5'>{t('Ảnh đại diện quán', 'Eatery cover photo', '餐馆封面图片')}</p>
                        <label className='flex items-center gap-4 cursor-pointer bg-slate-100 hover:bg-slate-200 transition px-4 py-3 rounded-xl'>
                            {anh ? (
                                <img src={URL.createObjectURL(anh)} alt={t('Xem trước', 'Preview', '预览')} className='size-14 rounded-xl object-cover' />
                            ) : suaLai && quan?.logo ? (
                                <Anh src={quan.logo} alt={t('Ảnh hiện tại', 'Current photo', '当前图片')} className='size-14 rounded-xl object-cover' />
                            ) : (
                                <span className='flex items-center justify-center size-14 rounded-xl bg-white text-slate-400'><Camera size={22} /></span>
                            )}
                            <span className='text-slate-500'>{anh ? anh.name : suaLai ? t('Giữ ảnh cũ — bấm để đổi', 'Keep current photo — tap to change', '保留当前图片 —— 点击更换') : t('Bấm để chọn ảnh (PNG/JPG/WebP, tối đa 5MB)', 'Tap to choose an image (PNG/JPG/WebP, max 5MB)', '点击选择图片（PNG/JPG/WebP，最大5MB）')}</span>
                            <input type='file' accept='image/png,image/jpeg,image/webp' hidden onChange={e => setAnh(e.target.files[0] || null)} />
                        </label>
                    </div>

                    <button type='submit' disabled={dangGui}
                        className='text-white font-medium py-3 rounded-full mt-2 active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none' style={{ backgroundColor: MAU }}>
                        {dangGui ? t('Đang gửi...', 'Sending...', '提交中...') : t('Mở quán ăn', 'Open eatery', '开设餐馆')}
                    </button>
                </div>
            </form>
        </div>
    )
}
