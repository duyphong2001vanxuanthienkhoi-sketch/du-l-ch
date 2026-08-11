'use client'
import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowUpDown, SearchIcon, SearchXIcon } from "lucide-react"
import { LuoiSanPhamSkeleton } from "@/components/Skeleton"
import TheSanPham from "@/components/TheSanPham"
import TrangRong from "@/components/TrangRong"
import { DANH_MUC_SP } from "@/lib/danhMucSanPham"
import { boDau } from "@/lib/utils/chuoi"
import { taiSanPham } from "@/lib/utils/khoSanPham"
import { useNgonNgu } from "@/lib/i18n"

const BO_LOC_KHU = [
    { id: 'all', ten: 'Tất cả', mau: '#334155' },
    { id: 'cho_tuoi', ten: 'Chợ Tươi', mau: '#059669', anh: '/thuong-hieu/tile-cho-tuoi.webp' },
    { id: 'qua_quang_ninh', ten: 'Quà Quảng Ninh', mau: '#d97706', anh: '/thuong-hieu/tile-qua.webp' },
]


// Cách sắp xếp danh sách. 'lien-quan' là mặc định: hàng được khen nhiều rồi tới bán chạy —
// hợp với khách vào chợ chưa biết mua gì. Logic xếp nằm trong ketQua bên dưới.
const CACH_SAP_XEP = [
    { id: 'lien-quan', ten: ['Phù hợp nhất', 'Best match', '最相关'] },
    { id: 'ban-chay', ten: ['Bán chạy', 'Best selling', '热销'] },
    { id: 'moi-nhat', ten: ['Mới nhất', 'Newest', '最新'] },
    { id: 'gia-tang', ten: ['Giá thấp → cao', 'Price: low → high', '价格从低到高'] },
    { id: 'gia-giam', ten: ['Giá cao → thấp', 'Price: high → low', '价格从高到低'] },
]

// Lọc nhanh — bật/tắt độc lập, chồng nhau được (chọn nhiều cái cùng lúc)
const LOC_NHANH = [
    { id: 'con-hang', ten: ['Còn hàng', 'In stock', '有货'] },
    { id: 'gui-tinh', ten: ['Gửi đi tỉnh', 'Ships nationwide', '可寄外省'] },
    { id: 'giam-gia', ten: ['Đang giảm giá', 'On sale', '促销中'] },
]

// Nhãn dịch cho bộ lọc khu (BO_LOC_KHU ở ngoài component nên dịch tại render theo id)
const NHAN_KHU = {
    all: ['Tất cả', 'All', '全部'],
    cho_tuoi: ['Chợ Tươi', 'Fresh Market', '鲜市'],
    qua_quang_ninh: ['Quà Quảng Ninh', 'Quang Ninh Gifts', '广宁礼品'],
}

// Khung chờ trang chợ — tiêu đề + bộ lọc + lưới sản phẩm dạng skeleton (thay vòng xoay)
function ShopSkeleton() {
    return (
        <div className="min-h-[70vh] mx-6 mb-28">
            <div className="max-w-6xl mx-auto">
                <span className="skeleton block h-8 w-52 my-6" />
                <div className="flex items-center gap-3 flex-wrap mb-8">
                    <span className="skeleton block h-11 w-full max-w-sm !rounded-full" />
                    <span className="skeleton block h-9 w-20 !rounded-full" />
                    <span className="skeleton block h-9 w-28 !rounded-full" />
                    <span className="skeleton block h-9 w-32 !rounded-full" />
                </div>
                <LuoiSanPhamSkeleton soThe={10} />
            </div>
        </div>
    )
}

function ShopContent() {

    const { t } = useNgonNgu()
    const searchParams = useSearchParams()

    const [sanPhams, setSanPhams] = useState([])
    const [loading, setLoading] = useState(true)
    const [tuKhoa, setTuKhoa] = useState(searchParams.get('search') || '')
    const [khu, setKhu] = useState(searchParams.get('khu') || 'all')
    const [dm, setDm] = useState('all') // danh mục con đang lọc
    const [sapXep, setSapXep] = useState('lien-quan') // cách sắp xếp danh sách
    const [locNhanh, setLocNhanh] = useState([])      // các lọc bật kèm: con-hang / gui-tinh / giam-gia

    const doLoc = (id) => setLocNhanh(cu => cu.includes(id) ? cu.filter(x => x !== id) : [...cu, id])

    // Danh mục hiện theo khu đang chọn (khu 'all' -> hiện tất cả)
    const danhMucHienThi = useMemo(
        () => (khu === 'all' ? DANH_MUC_SP : DANH_MUC_SP.filter(d => d.khu === khu)),
        [khu]
    )

    useEffect(() => {
        taiSanPham()
            .then(setSanPhams)
            .finally(() => setLoading(false))
    }, [])

    // Navbar đẩy ?search=, thanh dưới đẩy ?khu= — đồng bộ lại vào trạng thái của trang
    useEffect(() => {
        setTuKhoa(searchParams.get('search') || '')
        setKhu(searchParams.get('khu') || 'all')
        setDm('all')
    }, [searchParams])

    const ketQua = useMemo(() => {
        const tu = boDau(tuKhoa.trim())
        const loc = sanPhams.filter(sp => {
            if (khu !== 'all' && sp.loaiGian !== khu) return false
            if (dm !== 'all' && sp.danhMuc !== dm) return false
            if (locNhanh.includes('con-hang') && !(sp.soLuong > 0)) return false
            if (locNhanh.includes('gui-tinh') && !sp.guiDiTinh) return false
            if (locNhanh.includes('giam-gia') && !(sp.giaGoc > sp.gia)) return false
            if (!tu) return true
            return boDau(`${sp.ten} ${sp.moTa} ${sp.tenGian}`).includes(tu)
        })

        // Hết hàng luôn xuống cuối ở MỌI cách sắp xếp — khách lướt chợ để mua, không phải
        // để xem hàng đã hết; so id ở bước cuối cho thứ tự tất định (tải lại vẫn y nguyên).
        const phu = (a, b) => (a.soLuong > 0 ? 0 : 1) - (b.soLuong > 0 ? 0 : 1)
        const cuoi = (a, b) => a.id.localeCompare(b.id)
        const cach = {
            'lien-quan': (a, b) => (b.trungBinhSao - a.trungBinhSao) || (b.daBan - a.daBan) || cuoi(a, b),
            'moi-nhat': (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')) || cuoi(a, b),
            'ban-chay': (a, b) => (b.daBan - a.daBan) || (b.soDanhGia - a.soDanhGia) || cuoi(a, b),
            'gia-tang': (a, b) => (a.gia - b.gia) || cuoi(a, b),
            'gia-giam': (a, b) => (b.gia - a.gia) || cuoi(a, b),
        }
        return loc.sort((a, b) => phu(a, b) || (cach[sapXep] || cach['lien-quan'])(a, b))
    }, [sanPhams, tuKhoa, khu, dm, sapXep, locNhanh])

    if (loading) return <ShopSkeleton />

    return (
        // nen-song: hoa văn sóng nước rất mờ thay nền trắng trơn — thẻ sản phẩm trắng nổi khối hơn
        <div className="nen-song min-h-[70vh] px-6 pb-28">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl text-slate-500 py-6">{t('Sản phẩm', 'Products', '商品')} <span className="text-slate-700 font-medium">{t('Toàn Chợ', 'Marketplace', '全场')}</span></h1>

                {/* Tìm kiếm + lọc khu.
                    Cả hai hàng chip đều CUỘN NGANG một hàng thay vì xuống dòng: trước đây bộ lọc
                    chiếm tới 3 hàng, đẩy sản phẩm xuống quá nửa màn hình đầu tiên trên điện thoại. */}
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2.5 rounded-full w-full max-w-sm mb-3">
                    <SearchIcon size={17} className="text-slate-500 shrink-0" />
                    <input value={tuKhoa} onChange={e => setTuKhoa(e.target.value)}
                        placeholder={t('Tìm sản phẩm, gian hàng...', 'Search products, stores...', '搜索商品、店铺...')} className="w-full bg-transparent outline-none text-sm placeholder-slate-400" />
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1 mb-2.5">
                    {BO_LOC_KHU.map(b => (
                        <button key={b.id} onClick={() => { setKhu(b.id); setDm('all') }}
                            className={`shrink-0 flex items-center gap-1.5 rounded-full text-sm font-medium transition ${b.anh ? 'pl-1.5 pr-4 py-1' : 'px-4 py-2'} ${khu === b.id ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            style={khu === b.id ? { backgroundColor: b.mau } : {}}>
                            {b.anh && (
                                <span className={`flex items-center justify-center size-6 rounded-full shrink-0 ${khu === b.id ? 'bg-white/25' : 'bg-white'}`}>
                                    <img src={b.anh} alt='' className='w-[18px] h-[18px] object-contain' />
                                </span>
                            )}
                            {t(...(NHAN_KHU[b.id] || [b.ten]))}
                        </button>
                    ))}
                </div>

                {/* Lọc theo danh mục con */}
                {danhMucHienThi.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1 mb-5">
                        <button onClick={() => setDm('all')}
                            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition ${dm === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            {t('Tất cả danh mục', 'All categories', '全部分类')}
                        </button>
                        {danhMucHienThi.map(d => (
                            <button key={d.id} onClick={() => setDm(d.id)}
                                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition ${dm === d.id ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                {t(...d.ten)}
                            </button>
                        ))}
                    </div>
                )}

                {/* Sắp xếp + lọc nhanh. Chợ đang ~15 món thì chưa cần, nhưng khi hàng nhiều lên
                    mà chỉ có lọc khu + danh mục thì khách không có cách nào tìm "rẻ nhất" hay
                    "còn hàng". Để CÙNG một hàng cuộn ngang cho khỏi ăn thêm chiều cao màn hình. */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1 mb-5">
                    <span className="shrink-0 flex items-center gap-1 text-xs text-slate-400 pr-0.5">
                        <ArrowUpDown size={13} /> {t('Sắp xếp', 'Sort', '排序')}
                    </span>
                    {CACH_SAP_XEP.map(c => (
                        <button key={c.id} onClick={() => setSapXep(c.id)}
                            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition ${sapXep === c.id ? 'bg-ngoc-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            {t(...c.ten)}
                        </button>
                    ))}
                    <span className="shrink-0 w-px h-5 bg-slate-200 mx-1" />
                    {LOC_NHANH.map(l => (
                        <button key={l.id} onClick={() => doLoc(l.id)}
                            aria-pressed={locNhanh.includes(l.id)}
                            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${locNhanh.includes(l.id) ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                            {t(...l.ten)}
                        </button>
                    ))}
                </div>

                {ketQua.length ? (
                    <>
                        <p className="text-sm text-slate-400 mb-4">{ketQua.length} {t('sản phẩm', 'products', '件商品')}{tuKhoa.trim() && <> {t('cho từ khóa', 'for', '关键词')} "<span className="text-slate-600 font-medium">{tuKhoa.trim()}</span>"</>}</p>
                        <div className="luoi-vao grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {ketQua.map(sp => (
                                <TheSanPham key={sp.id} sp={sp} accentColor={sp.loaiGian === 'qua_quang_ninh' ? '#d97706' : '#059669'} />
                            ))}
                        </div>
                    </>
                ) : sanPhams.length ? (
                    <TrangRong Icon={SearchXIcon}
                        tieuDe={t('Không tìm thấy sản phẩm', 'No products found', '未找到商品')}
                        moTa={tuKhoa.trim()
                            ? `${t('Không có kết quả cho', 'No results for', '未找到')} "${tuKhoa.trim()}". ${t('Thử từ khoá khác hoặc bỏ bớt bộ lọc.', 'Try another keyword or clear filters.', '试试其他关键词或清除筛选。')}`
                            : t('Thử bỏ bớt bộ lọc để xem thêm sản phẩm.', 'Try clearing filters to see more products.', '清除筛选以查看更多商品。')}
                        nutText={t('Xem tất cả sản phẩm', 'View all products', '查看全部商品')}
                        onNut={() => { setTuKhoa(''); setKhu('all'); setDm('all') }} />
                ) : (
                    <TrangRong Icon={SearchXIcon}
                        tieuDe={t('Chưa có sản phẩm', 'No products yet', '暂无商品')}
                        moTa={t('Chưa có tiểu thương nào đăng sản phẩm. Quay lại sau nhé!', 'No merchant has posted products yet. Check back soon!', '暂无商户发布商品，请稍后再来！')} />
                )}
            </div>
        </div>
    )
}

export default function Shop() {
    return (
        <Suspense fallback={<ShopSkeleton />}>
            <ShopContent />
        </Suspense>
    )
}
