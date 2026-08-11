'use client'
import { useParams } from 'next/navigation'
import HopChat from '@/components/HopChat'

// Trang một cuộc chat của khách với quán. HopChat tự lo tải/gửi/realtime.
export default function TrangChatKhach() {
    const { id } = useParams()
    return (
        <div className='max-w-2xl md:mx-auto my-4 sm:my-8 px-3 sm:px-6 mb-24'>
            <HopChat hoiThoaiId={id} veLink='/tin-nhan' />
        </div>
    )
}
