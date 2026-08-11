'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { Trash2Icon } from "lucide-react"
import Loading from "@/components/Loading"
import { formatVND } from "@/lib/utils/currency"
import { useNgonNgu } from "@/lib/i18n"

const MA_RONG = { code: '', moTa: '', phanTramGiam: '', donToiThieu: '', hetHan: '' }

export default function AdminCoupons() {

    const { t } = useNgonNgu()
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [dangThem, setDangThem] = useState(false)
    const [ma, setMa] = useState(MA_RONG)

    const taiMa = async () => {
        try {
            const res = await fetch('/api/admin/coupons')
            const data = await res.json()
            setCoupons(data.coupons || [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { taiMa() }, [])

    const onChange = (e) => setMa({ ...ma, [e.target.name]: e.target.value })

    const themMa = async (e) => {
        e.preventDefault()
        setDangThem(true)
        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: ma.code,
                    moTa: ma.moTa,
                    phanTramGiam: Number(ma.phanTramGiam),
                    donToiThieu: Number(ma.donToiThieu) || 0,
                    hetHan: ma.hetHan || null,
                }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || t('Không thêm được mã', 'Could not add coupon', '无法添加优惠券')); return }
            toast.success(t('Đã thêm mã giảm giá', 'Coupon added', '已添加优惠券'))
            setMa(MA_RONG)
            taiMa()
        } finally {
            setDangThem(false)
        }
    }

    const xoaMa = async (code) => {
        if (!confirm(t(`Xóa mã "${code}"?`, `Delete coupon "${code}"?`, `删除优惠券"${code}"？`))) return
        const res = await fetch(`/api/admin/coupons/${code}`, { method: 'DELETE' })
        const data = await res.json()
        if (!res.ok) { toast.error(data.error || t('Không xóa được mã', 'Could not delete coupon', '无法删除优惠券')); return }
        toast.success(t('Đã xóa mã', 'Coupon deleted', '已删除优惠券'))
        setCoupons(cs => cs.filter(c => c.code !== code))
    }

    return (
        <div className="text-slate-500 mb-40">
            <form onSubmit={themMa} className="max-w-lg text-sm">
                <h2 className="text-2xl">{t('Thêm', 'Add', '添加')} <span className="text-slate-800 font-medium">{t('Mã Giảm Giá', 'Coupon', '优惠券')}</span></h2>
                <p className="text-sm mt-1">{t('Mã áp dụng cho toàn sàn, giảm theo phần trăm trên tổng tiền hàng.', 'The coupon applies platform-wide, discounting by a percentage of the order subtotal.', '优惠券适用于全平台，按商品总额的百分比折扣。')}</p>

                <div className="flex gap-2 max-sm:flex-col mt-3">
                    <input type="text" placeholder={t('Mã (VD: HONGGAI10)', 'Code (e.g. HONGGAI10)', '代码（如 HONGGAI10）')} className="w-full p-2.5 border border-slate-200 outline-slate-400 rounded-md uppercase"
                        name="code" value={ma.code} onChange={onChange} required maxLength={20} />
                    <input type="number" placeholder={t('Mức giảm (%)', 'Discount (%)', '折扣（%）')} min={1} max={100} className="w-full p-2.5 border border-slate-200 outline-slate-400 rounded-md"
                        name="phanTramGiam" value={ma.phanTramGiam} onChange={onChange} required />
                </div>

                <input type="text" placeholder={t('Mô tả (VD: Giảm 10% toàn sàn)', 'Description (e.g. 10% off platform-wide)', '描述（如 全平台减 10%）')} className="w-full mt-2 p-2.5 border border-slate-200 outline-slate-400 rounded-md"
                    name="moTa" value={ma.moTa} onChange={onChange} required />

                <div className="flex gap-2 max-sm:flex-col mt-2">
                    <label className="w-full">
                        <span className="text-slate-600">{t('Đơn tối thiểu (đ)', 'Minimum order (₫)', '最低订单额（₫）')}</span>
                        <input type="number" placeholder={t('0 = không yêu cầu', '0 = no minimum', '0 = 无要求')} min={0} step={1000} className="w-full mt-1 p-2.5 border border-slate-200 outline-slate-400 rounded-md"
                            name="donToiThieu" value={ma.donToiThieu} onChange={onChange} />
                    </label>
                    <label className="w-full">
                        <span className="text-slate-600">{t('Hết hạn (để trống = không hết hạn)', 'Expiry (leave blank = never)', '有效期（留空 = 永不过期）')}</span>
                        <input type="date" className="w-full mt-1 p-2.5 border border-slate-200 outline-slate-400 rounded-md"
                            name="hetHan" value={ma.hetHan} onChange={onChange} />
                    </label>
                </div>

                <button disabled={dangThem} className="mt-4 p-2.5 px-10 rounded bg-slate-700 text-white active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none">
                    {dangThem ? t('Đang thêm...', 'Adding...', '添加中…') : t('Thêm Mã', 'Add Coupon', '添加优惠券')}
                </button>
            </form>

            <div className="mt-14">
                <h2 className="text-2xl">{t('Danh sách', 'List of', '列表')} <span className="text-slate-800 font-medium">{t('Mã Giảm Giá', 'Coupons', '优惠券')}</span></h2>
                {loading ? <Loading /> : coupons.length ? (
                    <div className="overflow-x-auto mt-4 rounded-lg border border-slate-200 max-w-4xl">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">{t('Mã', 'Code', '代码')}</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">{t('Mô tả', 'Description', '描述')}</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">{t('Giảm', 'Discount', '折扣')}</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">{t('Đơn tối thiểu', 'Min. order', '最低订单额')}</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">{t('Hết hạn', 'Expiry', '有效期')}</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">{t('Xóa', 'Delete', '删除')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {coupons.map((c) => {
                                    const hetHanRoi = c.hetHan && new Date(c.hetHan) < new Date()
                                    return (
                                        <tr key={c.code} className="hover:bg-slate-50">
                                            <td className="py-3 px-4 font-medium text-slate-800">{c.code}</td>
                                            <td className="py-3 px-4 text-slate-800">{c.moTa}</td>
                                            <td className="py-3 px-4 text-slate-800">{c.phanTramGiam}%</td>
                                            <td className="py-3 px-4 text-slate-800">{c.donToiThieu ? formatVND(c.donToiThieu) : '—'}</td>
                                            <td className="py-3 px-4">
                                                {c.hetHan
                                                    ? <span className={hetHanRoi ? 'text-red-500 font-medium' : 'text-slate-800'}>{format(new Date(c.hetHan), 'dd/MM/yyyy')}{hetHanRoi ? t(' (hết hạn)', ' (expired)', '（已过期）') : ''}</span>
                                                    : <span className="text-slate-400">{t('Không hết hạn', 'Never', '永不过期')}</span>}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Trash2Icon onClick={() => xoaMa(c.code)} className="w-5 h-5 text-red-500 hover:text-red-800 cursor-pointer" />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mt-4 text-slate-400">{t('Chưa có mã giảm giá nào.', 'No coupons yet.', '暂无优惠券。')}</p>
                )}
            </div>
        </div>
    )
}
