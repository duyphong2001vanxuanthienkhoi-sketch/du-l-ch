'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Link from "next/link"
import Loading from "@/components/Loading"
import Anh from "@/components/Anh"
import { formatVND } from "@/lib/utils/currency"
import { useNgonNgu } from "@/lib/i18n"
import { PencilIcon, PlusIcon, Trash2Icon, Truck } from "lucide-react"

export default function StoreManageProducts() {

    const { t } = useNgonNgu()
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [dangXoa, setDangXoa] = useState(null)

    // ĐỌC DB: sản phẩm của gian mình
    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/store/products')
            const data = await res.json()
            setProducts(data.products || [])
        } finally {
            setLoading(false)
        }
    }

    // GHI DB: xóa sản phẩm
    const xoaSanPham = async (sp) => {
        if (!window.confirm(`${t('Xóa sản phẩm', 'Delete product', '删除商品')} "${sp.ten}"? ${t('Hành động này không hoàn tác được.', 'This action cannot be undone.', '此操作无法撤销。')}`)) return
        setDangXoa(sp.id)
        try {
            const res = await fetch(`/api/store/products/${sp.id}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了'))
                return
            }
            toast.success(t('Đã xóa sản phẩm', 'Product deleted', '商品已删除'))
            setProducts(products.filter(p => p.id !== sp.id))
        } finally {
            setDangXoa(null)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="mb-28">
            <div className="flex items-center justify-between max-w-4xl flex-wrap gap-3 mb-5">
                <h1 className="text-2xl text-slate-500">{t('Quản lý', 'Manage', '管理')} <span className="text-slate-800 font-medium">{t('Sản Phẩm', 'Products', '商品')}</span></h1>
                <Link href="/store/add-product" className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-full active:scale-95 transition">
                    <PlusIcon size={16} /> {t('Thêm sản phẩm', 'Add product', '添加商品')}
                </Link>
            </div>

            {products.length ? (
                <table className="w-full max-w-4xl text-left ring ring-slate-200 rounded overflow-hidden text-sm">
                    <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">{t('Sản phẩm', 'Product', '商品')}</th>
                            <th className="px-4 py-3">{t('Giá bán', 'Price', '售价')}</th>
                            <th className="px-4 py-3 hidden sm:table-cell">{t('Số lượng', 'Quantity', '数量')}</th>
                            <th className="px-4 py-3">{t('Hành động', 'Actions', '操作')}</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {products.map((sp) => (
                            <tr key={sp.id} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex gap-3 items-center">
                                        <Anh src={sp.anh} alt={sp.ten} className="size-11 rounded-lg object-cover ring-1 ring-slate-200" />
                                        <div>
                                            <p className="font-medium">{sp.ten}</p>
                                            {sp.guiDiTinh && (
                                                <span className="inline-flex items-center gap-1 text-ti text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-0.5">
                                                    <Truck size={11} /> {t('Gửi đi tỉnh khác', 'Ships to other provinces', '可寄外省')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-medium">{formatVND(sp.gia)}</td>
                                <td className="px-4 py-3 hidden sm:table-cell">
                                    {sp.soLuong > 0 ? sp.soLuong : <span className="text-red-500 font-medium">{t('Hết hàng', 'Out of stock', '已售罄')}</span>}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/store/add-product?sua=${sp.id}`}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition">
                                            <PencilIcon size={13} /> {t('Sửa', 'Edit', '编辑')}
                                        </Link>
                                        <button onClick={() => xoaSanPham(sp)} disabled={dangXoa === sp.id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-500 text-xs font-medium transition disabled:opacity-50">
                                            <Trash2Icon size={13} /> {t('Xóa', 'Delete', '删除')}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="flex flex-col items-center justify-center h-72 max-w-4xl text-center">
                    <p className="text-xl text-slate-400 font-medium">{t('Gian của bạn chưa có sản phẩm nào', 'Your store has no products yet', '您的店铺暂无商品')}</p>
                    <Link href="/store/add-product" className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-6 py-2.5 rounded-full mt-5 active:scale-95 transition">
                        <PlusIcon size={16} /> {t('Thêm sản phẩm đầu tiên', 'Add your first product', '添加第一个商品')}
                    </Link>
                </div>
            )}
        </div>
    )
}
