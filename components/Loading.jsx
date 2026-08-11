'use client'

// Vòng xoay chờ dữ liệu — dùng ở các trang phải gọi API trước khi vẽ.
// Vòng nền mờ + cung teal thương hiệu quay: nhẹ mắt hơn viền xám + xanh lá generic cũ.
// Dùng min-h thay cho h-screen để không đẩy trang cao quá mức khi đã có Banner/Navbar.
const Loading = () => {
    return (
        <div className='flex items-center justify-center min-h-[60vh]' role='status' aria-label='Đang tải'>
            <span className='relative flex size-11'>
                {/* Vòng nền mờ */}
                <span className='absolute inset-0 rounded-full border-[3px] border-ngoc-500/15' />
                {/* Cung sáng quay */}
                <span className='absolute inset-0 rounded-full border-[3px] border-transparent border-t-ngoc-500 animate-spin' />
            </span>
        </div>
    )
}

export default Loading
