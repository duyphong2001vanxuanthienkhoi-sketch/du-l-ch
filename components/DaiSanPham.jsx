'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import TheSanPham from './TheSanPham'
import { TheSanPhamSkeleton } from './Skeleton'

// Khối sản phẩm dùng chung cho MỌI dải gợi ý (cùng gian, hay mua kèm, có thể bạn cũng
// thích, bạn vừa xem, mua thêm ở giỏ). Gom về một chỗ để các dải luôn cùng một dáng.
//
//   kieu='dai'  → MỘT hàng cuộn ngang, thẻ hít mép màn hình (điện thoại lướt bằng ngón cái)
//   kieu='luoi' → lưới nhiều hàng như trang chợ (dùng cho dải cuối trang, chỗ khách đã đọc hết)
//
// toiThieu: dưới ngần này sản phẩm thì ẨN HẲN cả khối. Chợ nhỏ mà hiện dải lèo tèo 1 thẻ
// trông như hết hàng — thà không có còn hơn.
export default function DaiSanPham({
    tieuDe,
    moTa,
    Icon,
    mau = '#059669',
    sps = [],
    kieu = 'dai',
    href,
    hrefText,
    hanhDongPhu,          // nút phụ bên phải tiêu đề (vd "Xóa" của dải Bạn vừa xem)
    dangTai = false,
    soKhungCho = 4,
    toiThieu = 2,
    className = 'mt-14',
}) {
    if (!dangTai && sps.length < toiThieu) return null

    const mauThe = (sp) => sp.loaiGian === 'qua_quang_ninh' ? '#d97706' : '#059669'

    return (
        // --mau-khu đặt MỘT lần ở đây, các lớp mau-khu bên trong tự lấy (và tự sáng lên khi tối)
        <section className={className} style={{ '--mau-khu': mau }}>
            {/* items-start: phụ đề xuống 2 dòng trên điện thoại, nếu canh đáy thì mũi tên
                "xem tất cả" tụt xuống ngang dòng 2, trông như rơi lửng giữa khối. */}
            <div className='flex items-start justify-between gap-3 mb-4'>
                <div className='min-w-0'>
                    {/* KHÔNG truncate tiêu đề: ở máy 375px "Có thể bạn cũng thích" cộng link
                        "Xem tất cả" là vừa hết chỗ, tiêu đề bị cắt ngang chữ ("...cũng thí").
                        Cho phép xuống dòng, còn link thì thu về mỗi mũi tên trên điện thoại. */}
                    <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-700'>
                        {Icon && <Icon size={18} className='mau-khu shrink-0' />}
                        <span>{tieuDe}</span>
                    </h2>
                    {moTa && <p className='text-sm text-slate-500 mt-0.5'>{moTa}</p>}
                </div>
                {href && hrefText && (
                    <Link href={href} aria-label={hrefText}
                        className='mau-khu inline-flex items-center gap-1.5 text-sm font-semibold hover:gap-2.5 transition-all shrink-0'>
                        <span className='max-sm:hidden'>{hrefText}</span> <ArrowRight size={15} />
                    </Link>
                )}
                {hanhDongPhu}
            </div>

            {kieu === 'luoi' ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {dangTai
                        ? Array.from({ length: soKhungCho }).map((_, i) => <TheSanPhamSkeleton key={i} />)
                        : sps.map(sp => <TheSanPham key={sp.id} sp={sp} accentColor={mauThe(sp)} />)}
                </div>
            ) : (
                // -mx-6 px-6: thẻ đầu/cuối chạm đúng mép nội dung trang, phần tràn vẫn cuộn được.
                // scroll-pl-6 BẮT BUỘC đi kèm: không có nó, trình duyệt hít thẻ snap-start đầu tiên
                // về mốc 0 của vùng cuộn (bỏ qua px-6) nên dải TỰ cuộn sẵn 24px ngay khi mở trang
                // — thẻ đầu bị cắt mất một mẩu bên trái, trông như lỗi vẽ.
                <div className='flex gap-3 overflow-x-auto no-scrollbar snap-x scroll-pl-6 -mx-6 px-6 pb-1'>
                    {dangTai
                        ? Array.from({ length: soKhungCho }).map((_, i) => (
                            <div key={i} className='w-40 sm:w-44 shrink-0'><TheSanPhamSkeleton /></div>
                        ))
                        : sps.map(sp => (
                            <div key={sp.id} className='w-40 sm:w-44 shrink-0 snap-start'>
                                <TheSanPham sp={sp} accentColor={mauThe(sp)} />
                            </div>
                        ))}
                </div>
            )}
        </section>
    )
}
