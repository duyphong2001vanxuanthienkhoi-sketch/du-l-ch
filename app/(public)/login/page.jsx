'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useNgonNgu } from '@/lib/i18n'

function FormDangNhap() {
    const { t } = useNgonNgu()
    const searchParams = useSearchParams()
    // Mở thẳng form đăng ký khi vào bằng /login?dangky=1 (link "Đăng ký thành viên")
    const [cheDo, setCheDo] = useState(searchParams.get('dangky') === '1' ? 'dang-ky' : 'dang-nhap') // 'dang-nhap' | 'dang-ky'
    const [dangGui, setDangGui] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: '' })

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const onSubmit = async (e) => {
        e.preventDefault()
        setDangGui(true)
        try {
            const res = await fetch(cheDo === 'dang-nhap' ? '/api/auth/login' : '/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了'))
                return
            }
            toast.success(cheDo === 'dang-nhap' ? `${t('Chào', 'Hi', '你好')} ${data.user.name}!` : t('Đăng ký thành công!', 'Registration successful!', '注册成功！'))
            // Tải lại toàn trang để Navbar và các khu vực cập nhật phiên mới
            window.location.href = searchParams.get('ve') || '/'
        } finally {
            setDangGui(false)
        }
    }

    return (
        <div className='min-h-[70vh] flex items-center justify-center px-6 my-16'>
            <div className='w-full max-w-md'>
                <div className='text-center'>
                    <h1 className='text-3xl font-semibold text-slate-800'>
                        {cheDo === 'dang-nhap' ? t('Đăng nhập', 'Sign in', '登录') : t('Tạo tài khoản', 'Create account', '创建账户')}
                    </h1>
                    <p className='text-sm text-slate-500 mt-2'>
                        {cheDo === 'dang-nhap'
                            ? t('Chào mừng trở lại Chợ Số Hồng Gai', 'Welcome back to Cho So Hong Gai', '欢迎回到鸿基数字市场')
                            : t('Đăng ký làm khách mua hàng — muốn mở gian hàng, bạn có thể đăng ký sau', 'Sign up as a customer — you can register a store later', '注册为顾客 —— 如需开店可稍后注册')}
                    </p>
                </div>

                <form onSubmit={onSubmit} className='mt-8 flex flex-col gap-4'>
                    {cheDo === 'dang-ky' && (
                        <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-full ring-1 ring-transparent focus-within:ring-2 focus-within:ring-ngoc-500/50 focus-within:bg-white transition'>
                            <UserRound size={18} className='text-slate-500 shrink-0' />
                            <input name='name' value={form.name} onChange={onChange} type='text' placeholder={t('Họ tên', 'Full name', '姓名')} required
                                className='w-full bg-transparent outline-none text-sm placeholder-slate-500' />
                        </div>
                    )}
                    <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-full ring-1 ring-transparent focus-within:ring-2 focus-within:ring-ngoc-500/50 focus-within:bg-white transition'>
                        <Mail size={18} className='text-slate-500 shrink-0' />
                        <input name='email' value={form.email} onChange={onChange} type='email' placeholder='Email' required
                            className='w-full bg-transparent outline-none text-sm placeholder-slate-500' />
                    </div>
                    <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-full ring-1 ring-transparent focus-within:ring-2 focus-within:ring-ngoc-500/50 focus-within:bg-white transition'>
                        <LockKeyhole size={18} className='text-slate-500 shrink-0' />
                        <input name='password' value={form.password} onChange={onChange} type='password' placeholder={t('Mật khẩu (ít nhất 6 ký tự)', 'Password (at least 6 characters)', '密码（至少6个字符）')} required minLength={6}
                            className='w-full bg-transparent outline-none text-sm placeholder-slate-500' />
                    </div>

                    {cheDo === 'dang-nhap' && (
                        <p className='text-right -mt-1'>
                            <Link href='/quen-mat-khau' className='text-xs text-slate-500 hover:text-ngoc-600 hover:underline'>
                                {t('Quên mật khẩu?', 'Forgot password?', '忘记密码？')}
                            </Link>
                        </p>
                    )}

                    <button type='submit' disabled={dangGui}
                        className='bg-ngoc-500 text-white font-medium py-3 rounded-full shadow-lg shadow-ngoc-500/25 hover:bg-ngoc-600 hover:shadow-ngoc-600/30 active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none disabled:shadow-none'>
                        {dangGui ? t('Đang xử lý...', 'Processing...', '处理中...') : cheDo === 'dang-nhap' ? t('Đăng nhập', 'Sign in', '登录') : t('Đăng ký', 'Sign up', '注册')}
                    </button>
                </form>

                <p className='text-center text-sm text-slate-500 mt-6'>
                    {cheDo === 'dang-nhap' ? (
                        <>{t('Chưa có tài khoản?', "Don't have an account?", '还没有账户？')}{' '}
                            <button onClick={() => setCheDo('dang-ky')} className='text-ngoc-600 font-semibold hover:underline'>{t('Đăng ký ngay', 'Sign up now', '立即注册')}</button>
                        </>
                    ) : (
                        <>{t('Đã có tài khoản?', 'Already have an account?', '已有账户？')}{' '}
                            <button onClick={() => setCheDo('dang-nhap')} className='text-ngoc-600 font-semibold hover:underline'>{t('Đăng nhập', 'Sign in', '登录')}</button>
                        </>
                    )}
                </p>

                <p className='text-center text-xs text-slate-400 mt-8'>
                    <Link href='/' className='hover:underline'>{t('← Về trang chủ', '← Back to home', '← 返回首页')}</Link>
                </p>
            </div>
        </div>
    )
}

export default function TrangDangNhap() {
    return (
        <Suspense>
            <FormDangNhap />
        </Suspense>
    )
}
