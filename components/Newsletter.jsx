'use client'
import React from 'react'
import Title from './Title'
import { useNgonNgu } from '@/lib/i18n'

const Newsletter = () => {
    const { t } = useNgonNgu()
    return (
        <div className='flex flex-col items-center mx-4 my-24'>
            <Title title={t("Đăng Ký Nhận Tin", "Subscribe to Newsletter", "订阅资讯")} description={t("Đăng ký để nhận ưu đãi độc quyền, sản phẩm mới về và thông tin đặc sản Hồng Gai mỗi tuần ngay vào hộp thư của bạn.", "Sign up for exclusive offers, new arrivals and Hong Gai specialty news delivered to your inbox every week.", "订阅以每周在邮箱中接收独家优惠、新品和鸿基特产资讯。")} visibleButton={false} />
            <div className='flex bg-slate-100 text-sm p-1 rounded-full w-full max-w-xl my-10 border-2 border-white ring ring-slate-200'>
                <input className='flex-1 pl-5 outline-none' type="text" placeholder={t('Nhập địa chỉ email của bạn', 'Enter your email address', '输入您的邮箱地址')} />
                <button className='font-medium bg-ngoc-500 text-white px-7 py-3 rounded-full hover:scale-103 active:scale-95 transition'>{t('Đăng ký', 'Subscribe', '订阅')}</button>
            </div>
        </div>
    )
}

export default Newsletter