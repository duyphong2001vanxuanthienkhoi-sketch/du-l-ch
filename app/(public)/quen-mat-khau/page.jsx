'use client'
import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Mail, MailCheck } from 'lucide-react'
import { useNgonNgu } from '@/lib/i18n'

// Trang nhập email để nhận link đặt lại mật khẩu (bước 1 của luồng quên mật khẩu)
export default function TrangQuenMatKhau() {
    const { t } = useNgonNgu()
    const [email, setEmail] = useState('')
    const [dangGui, setDangGui] = useState(false)
    const [daGui, setDaGui] = useState(false)

    const onSubmit = async (e) => {
        e.preventDefault()
        setDangGui(true)
        try {
            const res = await fetch('/api/auth/quen-mat-khau', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了'))
                return
            }
            setDaGui(true)
        } finally {
            setDangGui(false)
        }
    }

    return (
        <div className='min-h-[70vh] flex items-center justify-center px-6 my-16'>
            <div className='w-full max-w-md'>
                {daGui ? (
                    <div className='text-center'>
                        <span className='inline-flex items-center justify-center size-16 rounded-full bg-green-100 text-green-600'>
                            <MailCheck size={30} />
                        </span>
                        <h1 className='text-2xl font-semibold text-slate-800 mt-5'>{t('Kiểm tra hộp thư của bạn', 'Check your inbox', '请查收邮件')}</h1>
                        <p className='text-sm text-slate-500 mt-3 leading-relaxed'>
                            {t('Nếu', 'If', '如果')} <span className='font-semibold text-slate-700'>{email}</span> {t('đã đăng ký, liên kết đặt lại mật khẩu sẽ tới trong ít phút. Không thấy thư? Hãy xem cả mục', 'is registered, a password reset link will arrive in a few minutes. Not seeing it? Check your', '已注册，密码重置链接将在几分钟内送达。没看到？请检查')} <b>{t('Spam / Thư rác', 'Spam / Junk', '垃圾邮件')}</b>.
                        </p>
                        <button onClick={() => setDaGui(false)} className='text-sm text-ngoc-600 font-semibold hover:underline mt-6'>
                            {t('Gửi lại với email khác', 'Send to a different email', '换个邮箱重发')}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className='text-center'>
                            <h1 className='text-3xl font-semibold text-slate-800'>{t('Quên mật khẩu?', 'Forgot password?', '忘记密码？')}</h1>
                            <p className='text-sm text-slate-500 mt-2'>
                                {t('Nhập email đã đăng ký — chúng tôi sẽ gửi liên kết để bạn tạo mật khẩu mới', "Enter your registered email — we'll send a link to create a new password", '输入注册邮箱 —— 我们将发送链接供您创建新密码')}
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className='mt-8 flex flex-col gap-4'>
                            <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-full'>
                                <Mail size={18} className='text-slate-500 shrink-0' />
                                <input value={email} onChange={e => setEmail(e.target.value)} type='email' placeholder={t('Email của bạn', 'Your email', '您的邮箱')} required
                                    className='w-full bg-transparent outline-none text-sm placeholder-slate-500' />
                            </div>
                            <button type='submit' disabled={dangGui}
                                className='bg-ngoc-500 text-white font-medium py-3 rounded-full hover:bg-ngoc-600 active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none'>
                                {dangGui ? t('Đang gửi...', 'Sending...', '发送中...') : t('Gửi liên kết đặt lại', 'Send reset link', '发送重置链接')}
                            </button>
                        </form>
                    </>
                )}

                <p className='text-center text-sm text-slate-500 mt-6'>
                    {t('Nhớ ra mật khẩu rồi?', 'Remembered your password?', '想起密码了？')}{' '}
                    <Link href='/login' className='text-ngoc-600 font-semibold hover:underline'>{t('Đăng nhập', 'Sign in', '登录')}</Link>
                </p>
                <p className='text-center text-xs text-slate-400 mt-8'>
                    <Link href='/' className='hover:underline'>{t('← Về trang chủ', '← Back to home', '← 返回首页')}</Link>
                </p>
            </div>
        </div>
    )
}
