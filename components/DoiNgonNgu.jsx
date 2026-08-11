'use client'
import { useEffect, useRef, useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { useNgonNgu } from '@/lib/i18n'

// Nút chuyển ngôn ngữ Việt ⇄ Anh (dropdown). Đặt ở Navbar (máy tính + điện thoại).
const DS = [
    { ma: 'vi', ten: 'Tiếng Việt', co: '🇻🇳' },
    { ma: 'en', ten: 'English', co: '🇬🇧' },
    { ma: 'zh', ten: '中文', co: '🇨🇳' },
]

export default function DoiNgonNgu() {
    const { lang, doiNgonNgu } = useNgonNgu()
    const [mo, setMo] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const dong = (e) => { if (ref.current && !ref.current.contains(e.target)) setMo(false) }
        document.addEventListener('mousedown', dong)
        return () => document.removeEventListener('mousedown', dong)
    }, [])

    return (
        <div ref={ref} className='relative shrink-0'>
            <button onClick={() => setMo(v => !v)} aria-label='Đổi ngôn ngữ / Change language'
                className='flex items-center gap-1 px-2.5 max-sm:px-2 h-9 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition text-slate-600 text-sm font-semibold shrink-0'>
                <Globe size={17} />
                <span className='uppercase max-sm:hidden'>{lang}</span>
            </button>
            {mo && (
                <div className='absolute right-0 top-full mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 z-50 text-sm text-slate-600'>
                    {DS.map(d => (
                        <button key={d.ma} onClick={() => { doiNgonNgu(d.ma); setMo(false) }}
                            className='w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50'>
                            <span className='text-base leading-none'>{d.co}</span>
                            <span className='flex-1 text-left'>{d.ten}</span>
                            {d.ma === lang && <Check size={15} className='text-ngoc-500' />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
