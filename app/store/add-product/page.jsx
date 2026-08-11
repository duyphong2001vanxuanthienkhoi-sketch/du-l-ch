'use client'
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "react-hot-toast"
import Loading from "@/components/Loading"
import { Camera, Layers, Plus, Star, Truck, X } from "lucide-react"
import { nenNhieuCo } from "@/lib/utils/nenAnh"
import { danhMucTheoKhu } from "@/lib/danhMucSanPham"
import { useNgonNgu } from "@/lib/i18n"

const TOI_DA_ANH = 6
const khoa = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()))
const dongBienTheRong = () => ({ key: khoa(), size: '', mau: '', gia: '', soLuong: '' })

function FormSanPham() {

    const router = useRouter()
    const { t } = useNgonNgu()
    const searchParams = useSearchParams()
    const suaId = searchParams.get('sua') // có ?sua=<id> nghĩa là đang sửa

    const [loading, setLoading] = useState(true)
    const [gian, setGian] = useState(null)
    const [spCu, setSpCu] = useState(null)
    const [dangGui, setDangGui] = useState(false)
    const [dangNen, setDangNen] = useState(false)

    const [form, setForm] = useState({ ten: '', gia: '', giaGoc: '', moTa: '', soLuong: '', guiDiTinh: false, danhMuc: '' })
    // Mỗi ảnh: { key, url? (ảnh cũ), file? (ảnh mới đã nén), preview }
    const [dsAnh, setDsAnh] = useState([])
    // Biến thể (phân loại): bật/tắt + danh sách dòng { key, size, mau, gia, soLuong }
    const [coBienThe, setCoBienThe] = useState(false)
    const [bienThe, setBienThe] = useState([dongBienTheRong()])

    useEffect(() => {
        const taiDuLieu = async () => {
            try {
                const st = await fetch('/api/store/me').then(r => r.json())
                setGian(st.store)
                if (suaId) {
                    const ds = await fetch('/api/store/products').then(r => r.json())
                    const sp = (ds.products || []).find(p => p.id === suaId)
                    if (sp) {
                        setSpCu(sp)
                        setForm({ ten: sp.ten, gia: String(sp.gia), giaGoc: sp.giaGoc ? String(sp.giaGoc) : '', moTa: sp.moTa, soLuong: String(sp.soLuong), guiDiTinh: !!sp.guiDiTinh, danhMuc: sp.danhMuc || '' })
                        const anhs = sp.anhs?.length ? sp.anhs : (sp.anh ? [sp.anh] : [])
                        setDsAnh(anhs.map(url => ({ key: khoa(), url, preview: url })))
                        if (Array.isArray(sp.bienThe) && sp.bienThe.length) {
                            setCoBienThe(true)
                            setBienThe(sp.bienThe.map(v => ({ key: khoa(), size: v.size || '', mau: v.mau || '', gia: String(v.gia ?? ''), soLuong: String(v.soLuong ?? '') })))
                        }
                    } else {
                        toast.error(t('Không tìm thấy sản phẩm cần sửa', 'Product to edit not found', '未找到要编辑的商品'))
                    }
                }
            } finally {
                setLoading(false)
            }
        }
        taiDuLieu()
    }, [suaId])

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const onChonAnh = async (e) => {
        const files = [...e.target.files]
        e.target.value = '' // cho phép chọn lại đúng file vừa xóa
        if (!files.length) return
        setDangNen(true)
        try {
            const conLai = TOI_DA_ANH - dsAnh.length
            if (conLai <= 0) { toast.error(`${t('Tối đa', 'Max', '最多')} ${TOI_DA_ANH} ${t('ảnh', 'photos', '张图片')}`); return }
            const moi = []
            for (const f of files.slice(0, conLai)) {
                // Nén ra 2 cỡ: bản lớn 1400px cho trang chi tiết, bản nhỏ 400px cho thẻ
                // sản phẩm (khách lướt chợ trên 3G/4G khỏi tải ảnh to gấp 8 lần khung hiện)
                const { lon, nho } = await nenNhieuCo(f)
                moi.push({ key: khoa(), file: lon, fileNho: nho, preview: URL.createObjectURL(lon) })
            }
            setDsAnh(prev => [...prev, ...moi])
            if (files.length > conLai) toast(`${t('Chỉ thêm được', 'Can only add', '只能再添加')} ${conLai} ${t('ảnh nữa (tối đa', 'more photo(s) (max', '张（最多')} ${TOI_DA_ANH})`, { icon: '⚠️' })
        } finally {
            setDangNen(false)
        }
    }

    const xoaAnh = (key) => setDsAnh(prev => {
        const bo = prev.find(a => a.key === key)
        if (bo?.file && bo.preview) URL.revokeObjectURL(bo.preview)
        return prev.filter(a => a.key !== key)
    })

    const datAnhChinh = (key) => setDsAnh(prev => {
        const a = prev.find(x => x.key === key)
        return a ? [a, ...prev.filter(x => x.key !== key)] : prev
    })

    // --- Biến thể ---
    const doiBienThe = (key, truong, giaTri) =>
        setBienThe(prev => prev.map(d => d.key === key ? { ...d, [truong]: giaTri } : d))
    const themDongBienThe = () => setBienThe(prev => [...prev, dongBienTheRong()])
    const xoaDongBienThe = (key) => setBienThe(prev => prev.length > 1 ? prev.filter(d => d.key !== key) : prev)

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!dsAnh.length) return toast.error(t('Vui lòng chọn ít nhất 1 ảnh sản phẩm', 'Please choose at least 1 product photo', '请至少选择1张商品图片'))

        // Kiểm tra biến thể phía trình duyệt (server vẫn kiểm lại)
        let bienTheGui = []
        if (coBienThe) {
            const dong = bienThe.filter(d => d.size.trim() || d.mau.trim() || d.gia || d.soLuong)
            if (!dong.length) return toast.error(t('Hãy thêm ít nhất 1 phân loại (size/màu)', 'Add at least 1 variant (size/color)', '请至少添加1个规格（尺寸/颜色）'))
            for (const d of dong) {
                if (!d.size.trim() && !d.mau.trim()) return toast.error(t('Mỗi phân loại cần ít nhất Size hoặc Màu', 'Each variant needs at least a Size or Color', '每个规格至少需要尺寸或颜色'))
                if (!(Number(d.gia) > 0)) return toast.error(t('Mỗi phân loại phải có giá bán hợp lệ', 'Each variant must have a valid price', '每个规格必须有有效价格'))
                if (!(Number.isInteger(Number(d.soLuong)) && Number(d.soLuong) >= 0)) return toast.error(t('Mỗi phân loại phải có số lượng hợp lệ', 'Each variant must have a valid quantity', '每个规格必须有有效数量'))
            }
            bienTheGui = dong.map(d => ({ size: d.size.trim(), mau: d.mau.trim(), gia: Number(d.gia), soLuong: Number(d.soLuong) }))
        }

        setDangGui(true)
        try {
            const duLieu = new FormData()
            duLieu.append('ten', form.ten)
            duLieu.append('moTa', form.moTa)
            duLieu.append('giaGoc', form.giaGoc || '0')
            duLieu.append('guiDiTinh', String(form.guiDiTinh))
            duLieu.append('danhMuc', form.danhMuc)
            // Có phân loại: gửi mảng biến thể (server tự tính giá/tồn). Không: gửi '[]' + giá/số lượng.
            duLieu.append('bienThe', JSON.stringify(bienTheGui))
            if (!coBienThe) {
                duLieu.append('gia', form.gia)
                duLieu.append('soLuong', form.soLuong)
            }

            // Thứ tự ảnh: 'cu:<url>' giữ ảnh cũ, 'moi' + file cho ảnh mới
            const thuTu = []
            for (const a of dsAnh) {
                if (a.url) thuTu.push('cu:' + a.url)
                else {
                    thuTu.push('moi')
                    duLieu.append('anhMoi', a.file)
                    // Bản nhỏ gửi ĐÚNG THỨ TỰ với anhMoi. Ảnh vốn đã bé thì không có bản
                    // nhỏ — gửi chữ 'khong' để giữ đúng chỉ số (gửi lại bản lớn thì server
                    // phải tải lên hai lần cùng một tấm, tốn dung lượng vô ích).
                    duLieu.append('anhMoiNho', a.fileNho || 'khong')
                }
            }
            duLieu.append('thuTu', JSON.stringify(thuTu))

            const res = await fetch(spCu ? `/api/store/products/${spCu.id}` : '/api/store/products', {
                method: spCu ? 'PUT' : 'POST',
                body: duLieu,
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了'))
                return
            }
            toast.success(spCu ? t('Đã cập nhật sản phẩm!', 'Product updated!', '商品已更新！') : t('Đã thêm sản phẩm!', 'Product added!', '商品已添加！'))
            router.push('/store/manage-product')
        } finally {
            setDangGui(false)
        }
    }

    if (loading) return <Loading />

    const laGianQua = gian?.loaiGian === 'qua_quang_ninh'
    const dsDanhMuc = danhMucTheoKhu(gian?.loaiGian)

    return (
        <form onSubmit={onSubmit} className="text-slate-500 mb-28 max-w-xl">
            <h1 className="text-2xl">{spCu ? t('Sửa', 'Edit', '编辑') : t('Thêm', 'Add', '添加')} <span className="text-slate-800 font-medium">{t('Sản Phẩm', 'Product', '商品')}</span></h1>
            <p className="text-sm mt-1">{t('Sản phẩm sẽ hiển thị cho khách trong khu', 'The product will show to customers in the', '商品将在')} <span className="font-medium text-slate-700">{laGianQua ? t('Quà Quảng Ninh', 'Quang Ninh Gifts', '广宁礼品') : t('Chợ Tươi', 'Fresh Market', '鲜市')}</span> {t('cùng gian', 'zone, under store', '区展示，属于店铺')} "{gian?.tenGian}".</p>

            <div className="flex flex-col gap-5 mt-8 text-sm">
                <div>
                    <p className="text-slate-600 font-medium mb-1.5">{t('Ảnh sản phẩm', 'Product photos', '商品图片')} <span className="text-slate-400 font-normal">{t(`(tối đa ${TOI_DA_ANH}, ảnh đầu là ảnh chính)`, `(max ${TOI_DA_ANH}, first is the main photo)`, `（最多${TOI_DA_ANH}张，第一张为主图）`)}</span></p>
                    <div className="flex flex-wrap gap-3">
                        {dsAnh.map((a, i) => (
                            <div key={a.key} className="relative size-24 rounded-xl overflow-hidden ring-1 ring-slate-200 bg-slate-100">
                                <img src={a.preview} alt="" className="w-full h-full object-cover" />
                                {i === 0 && (
                                    <span className="absolute top-1 left-1 flex items-center gap-1 bg-green-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                                        <Star size={9} className="fill-current" /> {t('Chính', 'Main', '主图')}
                                    </span>
                                )}
                                <button type="button" onClick={() => xoaAnh(a.key)} aria-label={t("Xóa ảnh", "Remove photo", "删除图片")}
                                    className="absolute top-1 right-1 bg-black/55 hover:bg-black/75 text-white rounded-full p-1 transition">
                                    <X size={11} />
                                </button>
                                {i !== 0 && (
                                    <button type="button" onClick={() => datAnhChinh(a.key)}
                                        className="absolute bottom-0 inset-x-0 bg-black/55 hover:bg-black/75 text-white text-[10px] py-1 transition">
                                        {t('Đặt làm chính', 'Set as main', '设为主图')}
                                    </button>
                                )}
                            </div>
                        ))}
                        {dsAnh.length < TOI_DA_ANH && (
                            <label className="size-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-green-400 hover:text-green-500 transition">
                                {dangNen ? (
                                    <span className="text-ti">{t('Đang xử lý...', 'Processing...', '处理中...')}</span>
                                ) : (
                                    <><Camera size={22} /><span className="text-ti mt-1">{t('Thêm ảnh', 'Add photo', '添加图片')}</span></>
                                )}
                                <input type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={onChonAnh} />
                            </label>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">{t('Chọn ảnh gốc từ máy/điện thoại — hệ thống tự nén nhẹ, không cần lo dung lượng.', 'Pick original photos from your device — the system lightly compresses them, no need to worry about size.', '从设备选择原图 —— 系统会自动轻度压缩，无需担心大小。')}</p>
                </div>

                <div>
                    <p className="text-slate-600 font-medium mb-1.5">{t('Tên sản phẩm', 'Product name', '商品名称')}</p>
                    <input name="ten" value={form.ten} onChange={onChange} required maxLength={100}
                        placeholder={t("VD: Cá song tươi loại 1", "e.g. Fresh grouper grade 1", "如：一级鲜石斑鱼")} className="w-full max-w-lg bg-slate-100 px-4 py-3 rounded-xl outline-none placeholder-slate-400" />
                </div>

                {/* Danh mục con — lọc theo khu của gian */}
                {dsDanhMuc.length > 0 && (
                    <div>
                        <p className="text-slate-600 font-medium mb-1.5">{t('Danh mục', 'Category', '分类')} <span className="text-slate-400 font-normal">{t('(giúp khách lọc nhanh)', '(helps customers filter)', '（帮助顾客筛选）')}</span></p>
                        <select name="danhMuc" value={form.danhMuc} onChange={onChange}
                            className="w-full max-w-lg bg-slate-100 px-4 py-3 rounded-xl outline-none text-slate-700">
                            <option value="">{t('— Chưa phân loại —', '— Uncategorized —', '— 未分类 —')}</option>
                            {dsDanhMuc.map(d => <option key={d.id} value={d.id}>{t(...d.ten)}</option>)}
                        </select>
                    </div>
                )}

                {/* Giá & số lượng CHUNG — ẩn khi bật phân loại (giá/tồn tính theo từng phân loại) */}
                {!coBienThe && (
                    <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
                        <div>
                            <p className="text-slate-600 font-medium mb-1.5">{t('Giá bán (VNĐ)', 'Price (VND)', '售价（越南盾）')}</p>
                            <input name="gia" value={form.gia} onChange={onChange} required type="number" min="1000" step="500"
                                placeholder={t("VD: 290000", "e.g. 290000", "如：290000")} className="w-full bg-slate-100 px-4 py-3 rounded-xl outline-none placeholder-slate-400" />
                        </div>
                        <div>
                            <p className="text-slate-600 font-medium mb-1.5">{t('Số lượng', 'Quantity', '数量')}</p>
                            <input name="soLuong" value={form.soLuong} onChange={onChange} required type="number" min="0" step="1"
                                placeholder={t("VD: 20", "e.g. 20", "如：20")} className="w-full bg-slate-100 px-4 py-3 rounded-xl outline-none placeholder-slate-400" />
                        </div>
                    </div>
                )}

                {/* Giá gốc — để hiện giá gạch ngang + nhãn "-x%" khi đang khuyến mãi */}
                <div className="max-w-lg">
                    <p className="text-slate-600 font-medium mb-1.5">
                        {t('Giá gốc (VNĐ)', 'Original price (VND)', '原价（越南盾）')}{' '}
                        <span className="text-slate-400 font-normal">({t('không bắt buộc', 'optional', '选填')})</span>
                    </p>
                    <input name="giaGoc" value={form.giaGoc} onChange={onChange} type="number" min="0" step="500"
                        placeholder={t("Bỏ trống nếu không giảm giá. VD: 350000", "Leave empty if not on sale. e.g. 350000", "不促销请留空。如：350000")}
                        className="w-full bg-slate-100 px-4 py-3 rounded-xl outline-none placeholder-slate-400" />
                    <p className="text-xs text-slate-400 mt-1.5">
                        {t('Nhập giá TRƯỚC khi giảm (phải lớn hơn giá bán) — sản phẩm sẽ hiện giá gạch ngang kèm nhãn giảm %.', 'Enter the price BEFORE the discount (must be higher than the selling price) — the product will show a struck-through price and a % off badge.', '填写促销前的价格（须高于售价）—— 商品将显示划线价和折扣标签。')}
                    </p>
                </div>

                {/* Phân loại size/màu */}
                <div className="max-w-lg">
                    <label className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer">
                        <input type="checkbox" checked={coBienThe}
                            onChange={e => setCoBienThe(e.target.checked)}
                            className="size-4 accent-green-600 mt-0.5" />
                        <span>
                            <span className="flex items-center gap-2 text-slate-700 font-medium"><Layers size={16} className="text-green-600" /> {t('Sản phẩm có nhiều phân loại (size / màu)', 'Product has multiple variants (size / color)', '商品有多个规格（尺寸/颜色）')}</span>
                            <span className="block text-xs text-slate-500 mt-0.5">{t('VD: quần áo cần Size + Màu; quà lưu niệm chỉ cần Màu. Mỗi phân loại đặt giá & số lượng riêng.', 'e.g. clothes need Size + Color; souvenirs only need Color. Each variant has its own price & quantity.', '如：服装需要尺寸+颜色；纪念品只需颜色。每个规格单独设置价格和数量。')}</span>
                        </span>
                    </label>

                    {coBienThe && (
                        <div className="mt-3 flex flex-col gap-2.5">
                            {/* Tiêu đề cột (màn rộng) */}
                            <div className="hidden sm:grid grid-cols-[1fr_1fr_1.1fr_0.8fr_auto] gap-2 px-1 text-ti font-semibold text-slate-400 uppercase tracking-wide">
                                <span>{t('Size', 'Size', '尺寸')}</span><span>{t('Màu', 'Color', '颜色')}</span><span>{t('Giá (VNĐ)', 'Price (VND)', '价格')}</span><span>{t('Tồn', 'Stock', '库存')}</span><span></span>
                            </div>
                            {bienThe.map(d => (
                                <div key={d.key} className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1.1fr_0.8fr_auto] gap-2">
                                    <input value={d.size} onChange={e => doiBienThe(d.key, 'size', e.target.value)} maxLength={20}
                                        placeholder={t("Size (VD: M)", "Size (e.g. M)", "尺寸（如 M）")} className="bg-slate-100 px-3 py-2.5 rounded-lg outline-none placeholder-slate-400" />
                                    <input value={d.mau} onChange={e => doiBienThe(d.key, 'mau', e.target.value)} maxLength={20}
                                        placeholder={t("Màu (VD: Đỏ)", "Color (e.g. Red)", "颜色（如 红）")} className="bg-slate-100 px-3 py-2.5 rounded-lg outline-none placeholder-slate-400" />
                                    <input value={d.gia} onChange={e => doiBienThe(d.key, 'gia', e.target.value)} type="number" min="1000" step="500"
                                        placeholder={t("Giá", "Price", "价格")} className="bg-slate-100 px-3 py-2.5 rounded-lg outline-none placeholder-slate-400" />
                                    <input value={d.soLuong} onChange={e => doiBienThe(d.key, 'soLuong', e.target.value)} type="number" min="0" step="1"
                                        placeholder={t("Tồn", "Stock", "库存")} className="bg-slate-100 px-3 py-2.5 rounded-lg outline-none placeholder-slate-400" />
                                    <button type="button" onClick={() => xoaDongBienThe(d.key)} aria-label={t("Xóa phân loại", "Remove variant", "删除规格")}
                                        className="flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 px-3 py-2.5 sm:px-2.5 transition disabled:opacity-40"
                                        disabled={bienThe.length <= 1}>
                                        <X size={15} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={themDongBienThe}
                                className="flex items-center gap-1.5 self-start text-sm font-medium text-green-600 hover:text-green-700 mt-1">
                                <Plus size={15} /> {t('Thêm phân loại', 'Add variant', '添加规格')}
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-slate-600 font-medium mb-1.5">{t('Mô tả', 'Description', '描述')}</p>
                    <textarea name="moTa" value={form.moTa} onChange={onChange} required rows={6} maxLength={2000}
                        placeholder={t("Mô tả chi tiết: nguồn gốc, độ tươi, quy cách, cách bảo quản, cách dùng... (xuống dòng để dễ đọc)", "Detailed description: origin, freshness, specs, storage, usage... (use line breaks for readability)", "详细描述：产地、新鲜度、规格、保存、用法……（可换行）")} className="w-full max-w-lg bg-slate-100 px-4 py-3 rounded-xl outline-none placeholder-slate-400 resize-none" />
                </div>

                {laGianQua && (
                    <label className="flex items-center gap-3 max-w-lg bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 cursor-pointer">
                        <input type="checkbox" checked={form.guiDiTinh}
                            onChange={e => setForm({ ...form, guiDiTinh: e.target.checked })}
                            className="size-4 accent-amber-600" />
                        <span className="flex items-center gap-2 text-slate-700"><Truck size={16} className="text-amber-600" /> {t('Có thể gửi đi tỉnh khác', 'Can be shipped to other provinces', '可寄往其他省份')}</span>
                    </label>
                )}

                <button type="submit" disabled={dangGui || dangNen}
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-full max-w-lg mt-2 active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none">
                    {dangGui ? t('Đang lưu...', 'Saving...', '保存中...') : spCu ? t('Lưu thay đổi', 'Save changes', '保存更改') : t('Thêm sản phẩm', 'Add product', '添加商品')}
                </button>
            </div>
        </form>
    )
}

export default function StoreAddProduct() {
    return (
        <Suspense fallback={<Loading />}>
            <FormSanPham />
        </Suspense>
    )
}
