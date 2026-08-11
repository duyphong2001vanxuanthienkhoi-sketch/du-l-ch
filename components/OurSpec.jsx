'use client'
import React from 'react'
import Title from './Title'
import { ourSpecsData } from '@/assets/assets'
import { useNgonNgu } from '@/lib/i18n'

const OurSpecs = () => {
    const { t } = useNgonNgu()

    return (
        <div className='px-6 my-20 max-w-6xl mx-auto'>
            <Title visibleButton={false} title={t('Cam Kết Của Chợ Số', 'Our Commitments', '我们的承诺')} description={t("Chúng tôi mang đến dịch vụ tận tâm và tiện lợi để trải nghiệm mua sắm của bạn luôn suôn sẻ, an toàn và không phải lo lắng.", "We deliver caring, convenient service so your shopping experience is always smooth, safe and worry-free.", "我们提供贴心便捷的服务，让您的购物体验始终顺畅、安全、无忧。")} />

            <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mt-12'>
                {
                    ourSpecsData.map((spec, index) => (
                        <div className='rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition' key={index}>
                            <span className='flex items-center justify-center size-12 rounded-xl' style={{ backgroundColor: spec.accent + '1a', color: spec.accent }}>
                                <spec.icon size={22} />
                            </span>
                            <h3 className='text-slate-800 font-semibold mt-4'>{t(...spec.title)}</h3>
                            <p className='text-sm text-slate-500 mt-2 leading-relaxed'>{t(...spec.description)}</p>
                        </div>
                    ))
                }
            </div>

        </div>
    )
}

export default OurSpecs