import Link from 'next/link'

// Trạng thái RỖNG dùng chung — thay cho các khối "chữ trơn" rời rạc, cho cảm giác chỉn chu
// & nhất quán. Gồm: icon trong vòng tròn mềm 2 lớp màu thương hiệu (minh hoạ nhẹ) + tiêu đề
// + phụ đề (tuỳ chọn) + nút hành động (tuỳ chọn: link `nutHref` hoặc `onNut`).
// `mau` cho phép đổi tông theo ngữ cảnh (mặc định ngọc thương hiệu).
export default function TrangRong({ Icon, tieuDe, moTa, nutText, nutHref, onNut, mau = '#00A8A8' }) {
    const lopNut = 'mt-6 inline-flex items-center gap-2 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition'
    return (
        <div className='flex flex-col items-center justify-center text-center py-16 px-6'>
            {/* Vòng tròn mềm 2 lớp — "minh hoạ" nhẹ nhàng cho trạng thái rỗng */}
            <div className='flex items-center justify-center size-24 rounded-full mb-5' style={{ backgroundColor: `${mau}12` }}>
                <div className='flex items-center justify-center size-16 rounded-full' style={{ backgroundColor: `${mau}22`, color: mau }}>
                    {Icon && <Icon size={30} strokeWidth={1.8} />}
                </div>
            </div>
            <h2 className='text-lg font-semibold text-slate-700'>{tieuDe}</h2>
            {moTa && <p className='text-sm text-slate-400 mt-1.5 max-w-xs'>{moTa}</p>}
            {nutText && (nutHref ? (
                <Link href={nutHref} className={lopNut} style={{ backgroundColor: mau }}>{nutText}</Link>
            ) : (
                <button type='button' onClick={onNut} className={lopNut} style={{ backgroundColor: mau }}>{nutText}</button>
            ))}
        </div>
    )
}
