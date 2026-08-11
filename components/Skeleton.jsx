// Khung chờ (skeleton) dùng chung — hiện khung xám nhấp nháy ĐÚNG hình dạng nội dung
// trong lúc tải dữ liệu, thay cho vòng xoay. CSS ở globals.css (.skeleton).

// Ô skeleton cơ bản
export function O({ className = '' }) {
    return <span className={`skeleton block ${className}`} />
}

// Khung chờ 1 thẻ sản phẩm — khớp bố cục components/TheSanPham
export function TheSanPhamSkeleton() {
    return (
        <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm'>
            <div className='skeleton aspect-square' style={{ borderRadius: 0 }} />
            <div className='p-3'>
                <O className='h-3.5 w-11/12' />
                <O className='h-3.5 w-2/3 mt-1.5' />
                <div className='flex items-center justify-between mt-3'>
                    <O className='h-4 w-16' />
                    <O className='size-8 !rounded-full' />
                </div>
            </div>
        </div>
    )
}

// Lưới khung chờ sản phẩm (mặc định khớp lưới /shop)
export function LuoiSanPhamSkeleton({ soThe = 10, className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' }) {
    return (
        <div className={className}>
            {Array.from({ length: soThe }).map((_, i) => <TheSanPhamSkeleton key={i} />)}
        </div>
    )
}

// Khung chờ TRANG CHI TIẾT SẢN PHẨM — khớp đúng bố cục: ảnh vuông bên trái, tên/sao/giá/
// nút mua bên phải, rồi khối mô tả. Thay màn xoay che cả trang: khách thấy ngay trang sắp
// hiện ra hình gì nên cảm giác nhanh hơn, và không bị "nhảy" bố cục khi dữ liệu về.
export function ChiTietSanPhamSkeleton() {
    return (
        <div className='min-h-[70vh] mx-6 my-10 mb-28'>
            <div className='max-w-5xl mx-auto'>
                <O className='h-4 w-28 mb-6' />
                <div className='grid md:grid-cols-2 gap-8 items-start'>
                    <div>
                        <div className='skeleton aspect-square !rounded-3xl' />
                        <div className='flex gap-2.5 mt-3'>
                            {Array.from({ length: 3 }).map((_, i) => <O key={i} className='size-16 !rounded-xl' />)}
                        </div>
                    </div>
                    <div>
                        <O className='h-8 w-4/5' />
                        <O className='h-4 w-40 mt-3' />
                        <O className='h-4 w-32 mt-2' />
                        <O className='h-9 w-44 mt-5' />
                        <O className='h-4 w-28 mt-2' />
                        <div className='flex gap-3 mt-7'>
                            <O className='h-12 w-40 !rounded-full' />
                            <O className='h-12 w-40 !rounded-full' />
                        </div>
                    </div>
                </div>
                <O className='h-5 w-40 mt-14' />
                <O className='h-24 w-full max-w-3xl mt-4 !rounded-2xl' />
            </div>
        </div>
    )
}

// Khung chờ 1 thẻ quán ăn (thẻ có ảnh bìa lớn — khớp thẻ quán ở /do-an)
export function QuanAnSkeleton() {
    return (
        <div className='rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden'>
            <div className='skeleton aspect-[16/9]' style={{ borderRadius: 0 }} />
            <div className='p-4'>
                <O className='h-4 w-3/4' />
                <O className='h-3 w-1/2 mt-2' />
                <O className='h-3 w-2/3 mt-3' />
            </div>
        </div>
    )
}

export function LuoiQuanAnSkeleton({ soThe = 6 }) {
    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {Array.from({ length: soThe }).map((_, i) => <QuanAnSkeleton key={i} />)}
        </div>
    )
}
