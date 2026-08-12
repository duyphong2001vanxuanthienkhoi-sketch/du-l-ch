// Khung chờ (skeleton) dùng chung — hiện khung xám nhấp nháy ĐÚNG hình dạng nội dung
// trong lúc tải dữ liệu, thay cho vòng xoay. CSS ở globals.css (.skeleton).

// Ô skeleton cơ bản. Cũng là export mặc định để dùng nhanh: <Skeleton className='h-64 rounded-2xl' />
export function O({ className = '' }) {
    return <span className={`skeleton block ${className}`} />
}

export default O

// Khung chờ 1 thẻ địa điểm — khớp bố cục components/TheDiaDiem (kiểu 'luoi')
export function TheDiaDiemSkeleton() {
    return (
        <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm'>
            <div className='skeleton aspect-[16/10]' style={{ borderRadius: 0 }} />
            <div className='p-4'>
                <O className='h-4 w-3/4' />
                <O className='h-3 w-1/2 mt-2.5' />
                <O className='h-3 w-full mt-3' />
                <O className='h-3 w-2/3 mt-1.5' />
            </div>
        </div>
    )
}

// Lưới khung chờ địa điểm — khớp lưới ở /kham-pha
export function LuoiDiaDiemSkeleton({ soThe = 6, className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' }) {
    return (
        <div className={className}>
            {Array.from({ length: soThe }).map((_, i) => <TheDiaDiemSkeleton key={i} />)}
        </div>
    )
}
