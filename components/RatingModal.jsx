'use client'
import { Star, XIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNgonNgu } from '@/lib/i18n'

// Hộp đánh giá sản phẩm sau khi nhận hàng.
// ratingModal: { orderId, productId, tenSanPham } | null
// onDone: gọi sau khi gửi thành công (để trang cập nhật lại)
const RatingModal = ({ ratingModal, setRatingModal, onDone }) => {

    const { t } = useNgonNgu()
    const [sao, setSao] = useState(0)
    const [binhLuan, setBinhLuan] = useState('')
    const [dangGui, setDangGui] = useState(false)

    const guiDanhGia = async () => {
        if (sao < 1) return toast.error(t('Vui lòng chọn số sao', 'Please select a rating', '请选择评分'))

        setDangGui(true)
        try {
            const res = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: ratingModal.orderId,
                    productId: ratingModal.productId,
                    sao,
                    binhLuan,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了'))
                return
            }
            toast.success(t('Cảm ơn bạn đã đánh giá!', 'Thanks for your review!', '感谢您的评价！'))
            setRatingModal(null)
            onDone?.()
        } finally {
            setDangGui(false)
        }
    }

    return (
        <div className='fixed inset-0 z-120 flex items-center justify-center bg-black/30 px-4'>
            <div className='bg-white p-7 rounded-3xl shadow-xl w-full max-w-sm relative'>
                <button onClick={() => setRatingModal(null)} className='absolute top-4 right-4 text-slate-400 hover:text-slate-600'>
                    <XIcon size={20} />
                </button>
                <h2 className='text-lg font-semibold text-slate-800'>{t('Đánh giá sản phẩm', 'Rate product', '评价商品')}</h2>
                <p className='text-sm text-slate-500 mt-0.5 truncate'>{ratingModal.tenSanPham}</p>

                <div className='flex items-center justify-center gap-1 my-5'>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`size-9 cursor-pointer transition ${sao > i ? 'text-amber-400 fill-current' : 'text-slate-300 hover:text-amber-300'}`}
                            onClick={() => setSao(i + 1)}
                        />
                    ))}
                </div>

                <textarea
                    className='w-full bg-slate-100 px-4 py-3 rounded-xl outline-none placeholder-slate-400 resize-none text-sm'
                    placeholder={t('Chia sẻ cảm nhận của bạn (không bắt buộc)...', 'Share your thoughts (optional)...', '分享您的感受（可选）...')}
                    rows={4}
                    maxLength={500}
                    value={binhLuan}
                    onChange={e => setBinhLuan(e.target.value)}
                />

                <button onClick={guiDanhGia} disabled={dangGui}
                    className='w-full bg-ngoc-500 hover:bg-ngoc-600 text-white font-medium py-3 rounded-full mt-4 active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none'>
                    {dangGui ? t('Đang gửi...', 'Sending...', '提交中...') : t('Gửi đánh giá', 'Submit review', '提交评价')}
                </button>
            </div>
        </div>
    )
}

export default RatingModal
