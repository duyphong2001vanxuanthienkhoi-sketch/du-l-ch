'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { LockKeyhole } from 'lucide-react'
import { useNgonNgu } from '@/lib/i18n'

// Trang tạo mật khẩu mới — mở từ link trong email (bước 2 của luồng quên mật khẩu).
// Link dạng: /dat-lai-mat-khau?email=...&token=...
function FormDatLai() {
    const { t } = useNgonNgu()
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''
    const token = searchParams.get('token') || ''

    const [matKhau, setMatKhau] = useState('')
    const [nhapLai, setNhapLai] = useState('')
    const [dangGui, setDangGui] = useState(false)

    const thieuThongTin = !email || !token

    const onSubmit = async (e) => {
        e.preventDefault()
        if (matKhau !== nhapLai) {
            toast.error(t('Hai lần nhập mật khẩu chưa khớp nhau', 'The two passwords do not match', '两次输入的密码不一致'))
            return
        }
        setDangGui(true)
        try {
            const res = await fetch('/api/auth/dat-lai-mat-khau', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, password: matKhau }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || t('Có lỗi xảy ra', 'Something went wrong', '出错了'))
                return
            }
            toast.success(`${t('Đổi mật khẩu thành công. Chào', 'Password changed successfully. Hi', '密码修改成功。你好')} ${data.user.name}!`)
            // Đã được tự đăng nhập — tải lại toàn trang để Navbar cập nhật phiên mới
            window.location.href = '/'
        } finally {
            setDangGui(false)
        }
    }

    return (
        <div className='min-h-[70vh] flex items-center justify-center px-6 my-16'>
            <div className='w-full max-w-md'>
                <div className='text-center'>
                    <h1 className='text-3xl font-semibold text-slate-800'>{t('Tạo mật khẩu mới', 'Create new password', '创建新密码')}</h1>
                    <p className='text-sm text-slate-500 mt-2'>
                        {thieuThongTin
                            ? t('Liên kết chưa đầy đủ — hãy mở đúng liên kết trong email chúng tôi đã gửi.', 'The link is incomplete — please open the exact link in the email we sent.', '链接不完整 —— 请打开我们发送邮件中的准确链接。')
                            : <>{t('Đặt mật khẩu mới cho tài khoản', 'Set a new password for', '为账户设置新密码')} <span className='font-semibold text-slate-700'>{email}</span></>}
                    </p>
                </div>

                {thieuThongTin ? (
                    <p className='text-center mt-8'>
                        <Link href='/quen-mat-khau'
                            className='inline-block bg-ngoc-500 text-white text-sm font-medium px-8 py-3 rounded-full hover:bg-ngoc-600 transition'>
                            {t('Yêu cầu gửi lại email', 'Request a new email', '请求重新发送邮件')}
                        </Link>
                    </p>
                ) : (
                    <form onSubmit={onSubmit} className='mt-8 flex flex-col gap-4'>
                        <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-full'>
                            <LockKeyhole size={18} className='text-slate-500 shrink-0' />
                            <input value={matKhau} onChange={e => setMatKhau(e.target.value)} type='password'
                                placeholder={t('Mật khẩu mới (ít nhất 6 ký tự)', 'New password (at least 6 characters)', '新密码（至少6个字符）')} required minLength={6}
                                className='w-full bg-transparent outline-none text-sm placeholder-slate-500' />
                        </div>
                        <div className='flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-full'>
                            <LockKeyhole size={18} className='text-slate-500 shrink-0' />
                            <input value={nhapLai} onChange={e => setNhapLai(e.target.value)} type='password'
                                placeholder={t('Nhập lại mật khẩu mới', 'Re-enter new password', '再次输入新密码')} required minLength={6}
                                className='w-full bg-transparent outline-none text-sm placeholder-slate-500' />
                        </div>
                        <button type='submit' disabled={dangGui}
                            className='bg-ngoc-500 text-white font-medium py-3 rounded-full hover:bg-ngoc-600 active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none'>
                            {dangGui ? t('Đang đổi mật khẩu...', 'Changing password...', '修改密码中...') : t('Đổi mật khẩu & đăng nhập', 'Change password & sign in', '修改密码并登录')}
                        </button>
                    </form>
                )}

                <p className='text-center text-xs text-slate-400 mt-8'>
                    <Link href='/login' className='hover:underline'>{t('← Về trang đăng nhập', '← Back to sign in', '← 返回登录')}</Link>
                </p>
            </div>
        </div>
    )
}

export default function TrangDatLaiMatKhau() {
    return (
        <Suspense>
            <FormDatLai />
        </Suspense>
    )
}
