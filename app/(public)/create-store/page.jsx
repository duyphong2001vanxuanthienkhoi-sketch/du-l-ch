'use client'
import { useEffect, useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useAuth } from "@/components/AuthProvider"
import { useNgonNgu } from "@/lib/i18n"
import Anh from "@/components/Anh"
import { nenAnh } from "@/lib/utils/nenAnh"
import { ArrowRight, Camera, Clock, FileText, Mail, MapPin, Phone, Printer, ShieldCheck, Store, UserRound, XCircle, CheckCircle2 } from "lucide-react"

const LOAI_GIAN = [
    { id: 'cho_tuoi', ten: ['Chợ Tươi', 'Fresh Market', '鲜市'], anh: '/thuong-hieu/tile-cho-tuoi.webp', moTa: ['Hải sản, thực phẩm tươi sống', 'Seafood, fresh produce', '海鲜、生鲜食品'] },
    { id: 'qua_quang_ninh', ten: ['Quà Quảng Ninh', 'Quang Ninh Gifts', '广宁礼品'], anh: '/thuong-hieu/tile-qua.webp', moTa: ['Đặc sản, quà lưu niệm', 'Specialties, souvenirs', '特产、纪念品'] },
]

const TRANG_THAI = {
    cho_duyet: { ten: ['Chờ duyệt', 'Pending approval', '待审核'], mau: '#d97706', nen: '#fef3c7', Icon: Clock,
        thongBao: ['Gian hàng của bạn đang chờ quản trị viên xét duyệt. Bạn sẽ bán được hàng ngay khi gian được duyệt.', 'Your store is awaiting admin approval. You can start selling as soon as it is approved.', '您的店铺正在等待管理员审核。审核通过后即可开始销售。'] },
    da_duyet: { ten: ['Đã duyệt', 'Approved', '已通过'], mau: '#059669', nen: '#d1fae5', Icon: CheckCircle2,
        thongBao: ['Gian hàng đã được duyệt! Bạn có thể vào trang quản lý để đăng sản phẩm và nhận đơn.', 'Your store is approved! Go to the dashboard to post products and receive orders.', '店铺已通过审核！可进入管理页发布商品并接单。'] },
    tu_choi: { ten: ['Từ chối', 'Rejected', '已拒绝'], mau: '#dc2626', nen: '#fee2e2', Icon: XCircle,
        thongBao: ['Rất tiếc, gian hàng của bạn chưa được duyệt. Vui lòng liên hệ ban quản lý chợ để biết thêm chi tiết.', 'Sorry, your store was not approved. Please contact the market management for details.', '很抱歉，您的店铺未通过审核。请联系市场管理方了解详情。'] },
}

export default function CreateStore() {

    const { user: nguoiDung } = useAuth() // phiên dùng chung; undefined = đang tải
    const { t } = useNgonNgu()
    const [gian, setGian] = useState(undefined) // undefined = đang tải /api/store/me
    const [dangGui, setDangGui] = useState(false)
    const [suaLai, setSuaLai] = useState(false) // gian bị từ chối -> sửa & nộp lại

    const [form, setForm] = useState({ tenGian: '', tenChu: '', soDienThoai: '', loaiGian: '', moTa: '', email: '', diaChi: '', fax: '', nguoiChiuTrachNhiem: '', giayPhep: '' })
    const [anh, setAnh] = useState(null)

    useEffect(() => {
        fetch('/api/store/me').then(r => r.json())
            .then(st => setGian(st.store || null))
            .catch(() => setGian(null))
    }, [])

    const loading = nguoiDung === undefined || gian === undefined

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!form.loaiGian) return toast.error(t('Vui lòng chọn loại gian hàng', 'Please choose a store type', '请选择店铺类型'))
        if (!anh && !suaLai) return toast.error(t('Vui lòng chọn ảnh đại diện gian hàng', 'Please choose a store cover photo', '请选择店铺封面图片'))

        setDangGui(true)
        try {
            const duLieu = new FormData()
            Object.entries(form).forEach(([k, v]) => duLieu.append(k, v))
            if (anh) duLieu.append('logo', await nenAnh(anh))

            const res = await fetch('/api/store/register', { method: 'POST', body: duLieu })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了'))
                return
            }
            toast.success(suaLai ? t('Đã nộp lại! Gian hàng đang chờ duyệt.', 'Resubmitted! Your store is pending approval.', '已重新提交！店铺待审核。') : t('Đã gửi đăng ký! Gian hàng đang chờ duyệt.', 'Registration sent! Your store is pending approval.', '注册已提交！店铺待审核。'))
            setGian(data.store)
            setSuaLai(false)
            // đăng ký lần đầu: tải lại để Navbar cập nhật vai trò tiểu thương
            if (!suaLai) setTimeout(() => window.location.reload(), 1500)
        } finally {
            setDangGui(false)
        }
    }

    if (loading) return <Loading />

    // Chưa đăng nhập -> mời đăng nhập trước
    if (!nguoiDung) return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-6 my-10'>
            <Store size={48} className='text-slate-300' />
            <h1 className='text-2xl font-semibold text-slate-700 mt-4'>{t('Đăng ký mở gian hàng', 'Register to open a store', '注册开店')}</h1>
            <p className='text-slate-500 text-sm mt-2 max-w-md'>{t('Bạn cần đăng nhập tài khoản trước khi đăng ký gian hàng trên Chợ Số Hồng Gai.', 'You need to sign in before registering a store on Cho So Hong Gai.', '在鸿基数字市场注册店铺前需要先登录账户。')}</p>
            <Link href='/login?ve=/create-store' className='bg-ngoc-500 hover:bg-ngoc-600 transition text-white px-8 py-2.5 rounded-full mt-6 text-sm font-medium'>
                {t('Đăng nhập ngay', 'Sign in now', '立即登录')}
            </Link>
        </div>
    )

    // Đã có gian -> hiện thẻ trạng thái (trang cá nhân gian hàng)
    if (gian && !suaLai) {
        const tt = TRANG_THAI[gian.status] || TRANG_THAI.cho_duyet
        const loai = LOAI_GIAN.find(l => l.id === gian.loaiGian)
        return (
            <div className='min-h-[60vh] flex items-center justify-center px-6 my-10'>
                <div className='w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-lg p-8'>
                    <div className='flex items-center gap-4'>
                        <Anh src={gian.logo} alt={t('Logo gian hàng', 'Store logo', '店铺标志')} className='size-16 rounded-2xl object-cover ring-1 ring-slate-100' />
                        <div className='flex-1'>
                            <h1 className='text-xl font-bold text-slate-800'>{gian.tenGian}</h1>
                            <p className='text-sm text-slate-500'>{loai ? t(...loai.ten) : ''} · {t('Chủ gian:', 'Owner:', '店主：')} {gian.tenChu}</p>
                        </div>
                    </div>

                    <div className='flex items-center gap-2 mt-6 rounded-2xl px-4 py-3' style={{ backgroundColor: tt.nen }}>
                        <tt.Icon size={18} style={{ color: tt.mau }} />
                        <span className='text-sm font-bold' style={{ color: tt.mau }}>{t(...tt.ten)}</span>
                    </div>
                    <p className='text-sm text-slate-600 mt-3 leading-relaxed'>{t(...tt.thongBao)}</p>

                    <div className='text-sm text-slate-500 mt-5 space-y-1.5 border-t border-slate-100 pt-4'>
                        <p className='flex items-center gap-2'><Phone size={14} className='shrink-0' /> {gian.soDienThoai}</p>
                        {gian.email && <p className='flex items-center gap-2'><Mail size={14} className='shrink-0' /> {gian.email}</p>}
                        {gian.diaChi && <p className='flex items-center gap-2'><MapPin size={14} className='shrink-0' /> {gian.diaChi}</p>}
                        {gian.fax && <p className='flex items-center gap-2'><Printer size={14} className='shrink-0' /> Fax: {gian.fax}</p>}
                        {gian.nguoiChiuTrachNhiem && <p className='flex items-center gap-2'><ShieldCheck size={14} className='shrink-0' /> {t('Người chịu trách nhiệm:', 'Responsible person:', '负责人：')} {gian.nguoiChiuTrachNhiem}</p>}
                        {gian.giayPhep && <p className='flex items-center gap-2'><FileText size={14} className='shrink-0' /> {t('Giấy phép KD:', 'Business license:', '营业执照：')} {gian.giayPhep}</p>}
                        <p className='text-slate-600 pt-1'>{gian.moTa}</p>
                    </div>

                    <div className='flex items-center gap-3 mt-7'>
                        {gian.status === 'da_duyet' && (
                            <Link href='/store' className='flex items-center gap-2 bg-ngoc-500 hover:bg-ngoc-600 transition text-white px-6 py-2.5 rounded-full text-sm font-medium'>
                                {t('Quản lý gian hàng', 'Manage store', '管理店铺')} <ArrowRight size={15} />
                            </Link>
                        )}
                        {gian.status === 'tu_choi' && (
                            <button
                                onClick={() => {
                                    setForm({ tenGian: gian.tenGian, tenChu: gian.tenChu, soDienThoai: gian.soDienThoai, loaiGian: gian.loaiGian, moTa: gian.moTa, email: gian.email || '', diaChi: gian.diaChi || '', fax: gian.fax || '', nguoiChiuTrachNhiem: gian.nguoiChiuTrachNhiem || '', giayPhep: gian.giayPhep || '' })
                                    setSuaLai(true)
                                }}
                                className='bg-ngoc-500 hover:bg-ngoc-600 transition text-white px-6 py-2.5 rounded-full text-sm font-medium'>
                                {t('Sửa & nộp lại', 'Edit & resubmit', '修改并重新提交')}
                            </button>
                        )}
                        <Link href='/' className='px-6 py-2.5 rounded-full text-sm font-medium bg-slate-100 hover:bg-slate-200 transition text-slate-600'>
                            {t('Về trang chủ', 'Back to home', '返回首页')}
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Chưa có gian -> form đăng ký
    return (
        <div className='mx-6 my-14'>
            <form onSubmit={onSubmit} className='max-w-xl mx-auto'>
                <h1 className='text-3xl text-slate-500'>{suaLai ? t('Sửa & nộp lại', 'Edit & resubmit', '修改并重新提交') : t('Đăng ký', 'Register', '注册')} <span className='text-slate-800 font-medium'>{t('Gian Hàng', 'Store', '店铺')}</span></h1>
                <p className='text-sm text-slate-500 mt-2 max-w-lg'>
                    {suaLai
                        ? t('Chỉnh sửa thông tin gian hàng rồi nộp lại — gian sẽ quay về trạng thái chờ duyệt.', 'Edit your store info and resubmit — it will return to pending approval.', '修改店铺信息后重新提交 —— 店铺将回到待审核状态。')
                        : t('Gửi thông tin để trở thành tiểu thương trên Chợ Số Hồng Gai. Gian hàng sẽ hoạt động sau khi quản trị viên phê duyệt.', 'Submit your info to become a merchant on Cho So Hong Gai. Your store goes live after admin approval.', '提交信息成为鸿基数字市场的商户。店铺将在管理员审核后上线。')}
                </p>

                <div className='flex flex-col gap-4 mt-8 text-sm'>
                    <div>
                        <p className='text-slate-600 font-medium mb-1.5'>{t('Tên gian hàng', 'Store name', '店铺名称')}</p>
                        <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl'>
                            <Store size={17} className='text-slate-500 shrink-0' />
                            <input name='tenGian' value={form.tenGian} onChange={onChange} required maxLength={60}
                                placeholder={t('VD: Hải Sản Cô Ba', 'e.g. Co Ba Seafood', '如：三姑海鲜')} className='w-full bg-transparent outline-none placeholder-slate-400' />
                        </div>
                    </div>

                    <div className='grid sm:grid-cols-2 gap-4'>
                        <div>
                            <p className='text-slate-600 font-medium mb-1.5'>{t('Tên chủ gian', 'Owner name', '店主姓名')}</p>
                            <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl'>
                                <UserRound size={17} className='text-slate-500 shrink-0' />
                                <input name='tenChu' value={form.tenChu} onChange={onChange} required maxLength={50}
                                    placeholder={t('VD: Nguyễn Thị Ba', 'e.g. Nguyen Thi Ba', '如：阮氏三')} className='w-full bg-transparent outline-none placeholder-slate-400' />
                            </div>
                        </div>
                        <div>
                            <p className='text-slate-600 font-medium mb-1.5'>{t('Số điện thoại', 'Phone number', '手机号')}</p>
                            <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl'>
                                <Phone size={17} className='text-slate-500 shrink-0' />
                                <input name='soDienThoai' value={form.soDienThoai} onChange={onChange} required type='tel'
                                    placeholder={t('VD: 0912345678', 'e.g. 0912345678', '如：0912345678')} className='w-full bg-transparent outline-none placeholder-slate-400' />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className='text-slate-600 font-medium mb-1.5'>{t('Địa chỉ gian hàng', 'Store address', '店铺地址')}</p>
                        <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl'>
                            <MapPin size={17} className='text-slate-500 shrink-0' />
                            <input name='diaChi' value={form.diaChi} onChange={onChange} required maxLength={200}
                                placeholder={t('VD: 12 Lê Thánh Tông, Hòn Gai, Hạ Long', 'e.g. 12 Le Thanh Tong, Hon Gai, Ha Long', '如：下龙市鸿基坊黎圣宗街12号')} className='w-full bg-transparent outline-none placeholder-slate-400' />
                        </div>
                    </div>

                    <div className='grid sm:grid-cols-2 gap-4'>
                        <div>
                            <p className='text-slate-600 font-medium mb-1.5'>{t('Email liên hệ', 'Contact email', '联系邮箱')} <span className='text-slate-400 font-normal'>({t('không bắt buộc', 'optional', '选填')})</span></p>
                            <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl'>
                                <Mail size={17} className='text-slate-500 shrink-0' />
                                <input name='email' value={form.email} onChange={onChange} type='email' maxLength={100}
                                    placeholder={t('VD: haisancoba@email.com', 'e.g. store@email.com', '如：store@email.com')} className='w-full bg-transparent outline-none placeholder-slate-400' />
                            </div>
                        </div>
                        <div>
                            <p className='text-slate-600 font-medium mb-1.5'>{t('Fax', 'Fax', '传真')} <span className='text-slate-400 font-normal'>({t('không bắt buộc', 'optional', '选填')})</span></p>
                            <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl'>
                                <Printer size={17} className='text-slate-500 shrink-0' />
                                <input name='fax' value={form.fax} onChange={onChange} maxLength={30}
                                    placeholder={t('VD: 0203 3xxxxxx', 'e.g. 0203 3xxxxxx', '如：0203 3xxxxxx')} className='w-full bg-transparent outline-none placeholder-slate-400' />
                            </div>
                        </div>
                    </div>

                    <div className='grid sm:grid-cols-2 gap-4'>
                        <div>
                            <p className='text-slate-600 font-medium mb-1.5'>{t('Người chịu trách nhiệm', 'Responsible person', '负责人')} <span className='text-slate-400 font-normal'>({t('không bắt buộc', 'optional', '选填')})</span></p>
                            <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl'>
                                <ShieldCheck size={17} className='text-slate-500 shrink-0' />
                                <input name='nguoiChiuTrachNhiem' value={form.nguoiChiuTrachNhiem} onChange={onChange} maxLength={50}
                                    placeholder={t('VD: Nguyễn Thị Ba', 'e.g. Nguyen Thi Ba', '如：阮氏三')} className='w-full bg-transparent outline-none placeholder-slate-400' />
                            </div>
                        </div>
                        <div>
                            <p className='text-slate-600 font-medium mb-1.5'>{t('Số giấy phép KD', 'Business license no.', '营业执照号')} <span className='text-slate-400 font-normal'>({t('không bắt buộc', 'optional', '选填')})</span></p>
                            <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl'>
                                <FileText size={17} className='text-slate-500 shrink-0' />
                                <input name='giayPhep' value={form.giayPhep} onChange={onChange} maxLength={50}
                                    placeholder={t('VD: 5701234567', 'e.g. 5701234567', '如：5701234567')} className='w-full bg-transparent outline-none placeholder-slate-400' />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className='text-slate-600 font-medium mb-1.5'>{t('Loại gian hàng', 'Store type', '店铺类型')}</p>
                        <div className='grid sm:grid-cols-2 gap-3'>
                            {LOAI_GIAN.map(l => (
                                <button type='button' key={l.id} onClick={() => setForm({ ...form, loaiGian: l.id })}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition ${form.loaiGian === l.id ? 'border-ngoc-500 bg-ngoc-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <span className='flex items-center justify-center size-11 rounded-xl bg-white shadow-sm shrink-0 p-1'>
                                        <img src={l.anh} alt='' className='w-full h-full object-contain' />
                                    </span>
                                    <span>
                                        <span className='block font-semibold text-slate-700'>{t(...l.ten)}</span>
                                        <span className='block text-xs text-slate-500'>{t(...l.moTa)}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className='text-slate-600 font-medium mb-1.5'>{t('Mô tả ngắn', 'Short description', '简短介绍')}</p>
                        <textarea name='moTa' value={form.moTa} onChange={onChange} required rows={3} maxLength={300}
                            placeholder={t('Gian hàng của bạn bán gì? VD: Hải sản tươi đánh bắt trong ngày tại bến Hòn Gai...', 'What does your store sell? e.g. Fresh seafood caught daily at Hon Gai wharf...', '您的店铺卖什么？如：鸿基码头当日捕捞的新鲜海鲜...')}
                            className='w-full bg-slate-100 px-4 py-3 rounded-xl outline-none placeholder-slate-400 resize-none' />
                    </div>

                    <div>
                        <p className='text-slate-600 font-medium mb-1.5'>{t('Ảnh đại diện gian hàng', 'Store cover photo', '店铺封面图片')}</p>
                        <label className='flex items-center gap-4 cursor-pointer bg-slate-100 hover:bg-slate-200 transition px-4 py-3 rounded-xl'>
                            {anh ? (
                                <img src={URL.createObjectURL(anh)} alt={t('Xem trước logo', 'Logo preview', '标志预览')} className='size-14 rounded-xl object-cover' />
                            ) : suaLai && gian?.logo ? (
                                <Anh src={gian.logo} alt={t('Ảnh hiện tại', 'Current photo', '当前图片')} className='size-14 rounded-xl object-cover' />
                            ) : (
                                <span className='flex items-center justify-center size-14 rounded-xl bg-white text-slate-400'><Camera size={22} /></span>
                            )}
                            <span className='text-slate-500'>{anh ? anh.name : suaLai ? t('Đang giữ ảnh cũ — bấm để đổi ảnh khác', 'Keeping current photo — tap to change', '保留当前图片 —— 点击更换') : t('Bấm để chọn ảnh (PNG/JPG/WebP, tối đa 5MB)', 'Tap to choose an image (PNG/JPG/WebP, max 5MB)', '点击选择图片（PNG/JPG/WebP，最大5MB）')}</span>
                            <input type='file' accept='image/png,image/jpeg,image/webp' hidden
                                onChange={e => setAnh(e.target.files[0] || null)} />
                        </label>
                    </div>

                    <button type='submit' disabled={dangGui}
                        className='bg-ngoc-500 hover:bg-ngoc-600 text-white font-medium py-3 rounded-full mt-2 active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none'>
                        {dangGui ? t('Đang gửi...', 'Sending...', '提交中...') : t('Gửi đăng ký gian hàng', 'Submit store registration', '提交店铺注册')}
                    </button>
                </div>
            </form>
        </div>
    )
}
