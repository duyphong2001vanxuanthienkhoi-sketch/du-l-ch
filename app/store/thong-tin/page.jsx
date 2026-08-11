'use client'
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import Anh from "@/components/Anh"
import { nenAnh } from "@/lib/utils/nenAnh"
import { NHAN_LOAI } from "@/components/admin/TheGianHang"
import { useNgonNgu } from "@/lib/i18n"
import { Camera, Phone, Store, UserRound } from "lucide-react"

export default function StoreThongTin() {
    const { t } = useNgonNgu()
    const [loading, setLoading] = useState(true)
    const [gian, setGian] = useState(null)
    const [dangGui, setDangGui] = useState(false)
    const [form, setForm] = useState({ tenGian: '', soDienThoai: '', moTa: '' })
    const [anh, setAnh] = useState(null) // ảnh mới (File) nếu người dùng chọn đổi

    useEffect(() => {
        fetch('/api/store/me').then(r => r.json()).then(st => {
            const g = st.store
            setGian(g)
            if (g) setForm({ tenGian: g.tenGian || '', soDienThoai: g.soDienThoai || '', moTa: g.moTa || '' })
        }).finally(() => setLoading(false))
    }, [])

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const onSubmit = async (e) => {
        e.preventDefault()
        setDangGui(true)
        try {
            const duLieu = new FormData()
            duLieu.append('tenGian', form.tenGian)
            duLieu.append('soDienThoai', form.soDienThoai)
            duLieu.append('moTa', form.moTa)
            if (anh) duLieu.append('logo', await nenAnh(anh))

            const res = await fetch('/api/store/cap-nhat', { method: 'POST', body: duLieu })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了')); return }
            toast.success(t('Đã cập nhật thông tin gian hàng!', 'Store info updated!', '店铺信息已更新！'))
            setGian(data.store)
            setAnh(null)
        } finally {
            setDangGui(false)
        }
    }

    if (loading) return <Loading />

    const nhan = NHAN_LOAI[gian?.loaiGian] || NHAN_LOAI.cho_tuoi
    const nhanTen = gian?.loaiGian === 'qua_quang_ninh' ? t('Quà Quảng Ninh', 'Quang Ninh Gifts', '广宁礼品') : t('Chợ Tươi', 'Fresh Market', '鲜市')
    // Ảnh xem trước: ảnh mới vừa chọn > logo hiện tại
    const anhXemTruoc = anh ? URL.createObjectURL(anh) : null

    return (
        <form onSubmit={onSubmit} className="text-slate-500 mb-28 max-w-xl">
            <h1 className="text-2xl">{t('Thông tin', 'Info', '信息')} <span className="text-slate-800 font-medium">{t('Gian Hàng', 'Store', '店铺')}</span></h1>
            <p className="text-sm mt-1">{t('Cập nhật ảnh đại diện và thông tin gian. Loại khu', 'Update the cover photo and store info. The zone type', '更新封面图片和店铺信息。区域类型')} (<b className="text-slate-700">{nhanTen}</b>) {t('không đổi ở đây.', 'cannot be changed here.', '此处无法更改。')}</p>

            <div className="flex flex-col gap-5 mt-8 text-sm">
                {/* Ảnh đại diện gian hàng (avatar) */}
                <div>
                    <p className="text-slate-600 font-medium mb-1.5">{t('Ảnh đại diện gian hàng', 'Store cover photo', '店铺封面图片')}</p>
                    <label className="flex items-center gap-4 cursor-pointer bg-slate-100 hover:bg-slate-200 transition px-4 py-3 rounded-xl max-w-lg">
                        {anhXemTruoc ? (
                            <img src={anhXemTruoc} alt={t("Xem trước ảnh mới", "New photo preview", "新图片预览")} className="size-16 rounded-xl object-cover" />
                        ) : gian?.logo ? (
                            <Anh src={gian.logo} alt={t("Ảnh hiện tại", "Current photo", "当前图片")} className="size-16 rounded-xl object-cover" />
                        ) : (
                            <span className="flex items-center justify-center size-16 rounded-xl bg-white text-slate-400"><Camera size={22} /></span>
                        )}
                        <span className="text-slate-500">{anh ? anh.name : t('Bấm để đổi ảnh (PNG/JPG/WebP, tối đa 5MB)', 'Tap to change photo (PNG/JPG/WebP, max 5MB)', '点击更换图片（PNG/JPG/WebP，最大5MB）')}</span>
                        <input type="file" accept="image/png,image/jpeg,image/webp" hidden
                            onChange={e => setAnh(e.target.files[0] || null)} />
                    </label>
                </div>

                <div>
                    <p className="text-slate-600 font-medium mb-1.5">{t('Tên gian hàng', 'Store name', '店铺名称')}</p>
                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl max-w-lg">
                        <Store size={17} className="text-slate-500 shrink-0" />
                        <input name="tenGian" value={form.tenGian} onChange={onChange} required maxLength={60}
                            placeholder={t("VD: Hải Sản Cô Ba", "e.g. Co Ba Seafood", "如：三姑海鲜")} className="w-full bg-transparent outline-none placeholder-slate-400" />
                    </div>
                </div>

                <div>
                    <p className="text-slate-600 font-medium mb-1.5">{t('Số điện thoại', 'Phone number', '手机号')}</p>
                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl max-w-lg">
                        <Phone size={17} className="text-slate-500 shrink-0" />
                        <input name="soDienThoai" value={form.soDienThoai} onChange={onChange} required type="tel"
                            placeholder={t("VD: 0912345678", "e.g. 0912345678", "如：0912345678")} className="w-full bg-transparent outline-none placeholder-slate-400" />
                    </div>
                </div>

                <div>
                    <p className="text-slate-600 font-medium mb-1.5">{t('Mô tả ngắn', 'Short description', '简短介绍')}</p>
                    <textarea name="moTa" value={form.moTa} onChange={onChange} required rows={3} maxLength={300}
                        placeholder={t("Gian hàng của bạn bán gì?", "What does your store sell?", "您的店铺卖什么？")} className="w-full max-w-lg bg-slate-100 px-4 py-3 rounded-xl outline-none placeholder-slate-400 resize-none" />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 max-w-lg">
                    <UserRound size={13} /> {t('Chủ gian:', 'Owner:', '店主：')} {gian?.tenChu}
                </div>

                <button type="submit" disabled={dangGui}
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-full max-w-lg mt-2 active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none">
                    {dangGui ? t('Đang lưu...', 'Saving...', '保存中...') : t('Lưu thay đổi', 'Save changes', '保存更改')}
                </button>
            </div>
        </form>
    )
}
