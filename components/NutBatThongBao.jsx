'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Bell, BellOff } from 'lucide-react'
import { hoTroPush, dangBatPush, batPush, tatPush } from '@/lib/pushClient'
import { useNgonNgu } from '@/lib/i18n'

// Nút bật/tắt thông báo đẩy (Web Push) trên THIẾT BỊ NÀY.
// Dùng trong panel chat khách và trang tin nhắn của quán.
export default function NutBatThongBao({ mau = '#ea580c', gonNhe = false }) {
    const { t } = useNgonNgu()
    const [hoTro, setHoTro] = useState(false)
    const [bat, setBat] = useState(false)
    const [dang, setDang] = useState(false)

    useEffect(() => {
        setHoTro(hoTroPush())
        dangBatPush().then(setBat)
    }, [])

    if (!hoTro) return null

    const doi = async () => {
        setDang(true)
        try {
            if (bat) {
                await tatPush(); setBat(false); toast(t('Đã tắt thông báo trên thiết bị này', 'Notifications turned off on this device', '已在此设备关闭通知'))
            } else {
                const kq = await batPush()
                if (kq.ok) { setBat(true); toast.success(t('Đã bật thông báo! Bạn sẽ nhận báo cả khi đóng app.', 'Notifications enabled! You will be notified even when the app is closed.', '已开启通知！即使关闭应用也会收到提醒。')) }
                else toast.error(kq.lyDo || t('Không bật được thông báo', 'Could not enable notifications', '无法开启通知'))
            }
        } finally { setDang(false) }
    }

    return (
        <button onClick={doi} disabled={dang} title={bat ? t('Tắt thông báo thiết bị này', 'Turn off notifications on this device', '关闭此设备通知') : t('Bật thông báo thiết bị này', 'Turn on notifications on this device', '开启此设备通知')}
            className={`flex items-center gap-1.5 text-xs font-semibold rounded-full transition disabled:opacity-60 ${gonNhe ? 'px-2 py-1' : 'px-3 py-1.5'}`}
            style={bat ? { backgroundColor: '#ffffff33', color: '#fff' } : { backgroundColor: '#fff', color: mau, border: `1px solid ${mau}55` }}>
            {bat ? <Bell size={14} /> : <BellOff size={14} />}
            {!gonNhe && (bat ? t('Đang bật', 'On', '已开') : t('Bật báo', 'Notify', '开启'))}
        </button>
    )
}
