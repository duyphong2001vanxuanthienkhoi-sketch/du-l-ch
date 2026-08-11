'use client'
import { useEffect, useRef, useState } from 'react'
import { DIA_DIEM, linkChiDuong, dichDD } from '@/lib/diaDiem'
import { useNgonNgu } from '@/lib/i18n'
import 'leaflet/dist/leaflet.css'

// Bản đồ THẬT bằng Leaflet + OpenStreetMap (miễn phí, không cần API key).
// - Ghim (marker) tự vẽ bằng L.divIcon: chấm tròn màu riêng + ẢNH THẬT của địa điểm
//   (public/dia-diem/<id>.jpg qua /api/dia-diem/anh); chưa có ảnh mới rơi về emoji.
// - Popup tự dựng HTML: ảnh bìa lớn + dải ảnh nhỏ trong thư viện + nút "Khám phá"/"Chỉ đường".
// - Đồng bộ 2 chiều với danh sách bên phải: props `chon` (id đang chọn) + `onChon(id)`.
// CSS cho ghim & popup nằm ở app/globals.css (khối "Bản đồ Leaflet").

// Dựng HTML bên trong popup của một địa điểm (Leaflet nhận chuỗi HTML).
// lang: 'vi' | 'en' | 'zh' — chọn bản dịch cho tên/loại/mô tả & nhãn nút.
function htmlPopup(d, anh, thuVien = [], lang = 'vi') {
    const loai = dichDD(d.loai, lang)
    const ten = dichDD(d.ten, lang)
    const mota = dichDD(d.mota, lang)
    const nhanKhamPha = dichDD(['Khám phá', 'Explore', '探索'], lang)
    const nhanChiDuong = dichDD(['Chỉ đường', 'Directions', '路线'], lang)
    const dauPopup = anh
        ? `<div class="pdd-anh"><img src="${anh}" alt=""/><span class="pdd-loai" style="background:${d.mau}">${loai}</span></div>`
        : `<div class="pdd-anh pdd-anh-trong" style="background:linear-gradient(135deg, ${d.mau}22, ${d.mau}44)">
               <span class="pdd-emoji">${d.icon}</span>
               <span class="pdd-loai" style="background:${d.mau}">${loai}</span>
           </div>`
    // Dải ảnh phụ trong thư viện (bỏ ảnh bìa đầu tiên), tối đa 3 tấm
    const phu = (thuVien || []).slice(1, 4)
    const daiAnh = phu.length
        ? `<div class="pdd-thumbs">${phu.map(a => `<img src="${a}" alt=""/>`).join('')}</div>`
        : ''
    return `
    <div class="pdd">
        ${dauPopup}
        ${daiAnh}
        <div class="pdd-than">
            <h3>${ten}</h3>
            <p>${mota}</p>
            <div class="pdd-nut">
                <a href="/dia-diem/${d.id}" class="pdd-nut-chinh" style="background:${d.mau}">${nhanKhamPha}</a>
                <a href="${linkChiDuong(d.ten)}" target="_blank" rel="noopener noreferrer"
                   style="color:${d.mau};border:1.5px solid ${d.mau}">${nhanChiDuong}</a>
            </div>
        </div>
    </div>`
}

// Ghim trên bản đồ: chấm tròn màu + ẢNH THẬT (nếu có) hoặc emoji, đuôi nhọn chỉ đúng tọa độ
function taoIcon(L, d, dangChon, anh) {
    const benTrong = anh
        ? `<img class="ghim-anh" src="${anh}" alt=""/>`
        : `<span class="ghim-emoji">${d.icon}</span>`
    return L.divIcon({
        className: '', // bỏ khung trắng mặc định của Leaflet
        html: `<div class="ghim ${dangChon ? 'ghim-chon' : ''}" style="--mau:${d.mau}">
                   <span class="ghim-dau">${benTrong}</span>
               </div>`,
        iconSize: [40, 50],
        iconAnchor: [20, 48],   // mũi nhọn của ghim đặt đúng tọa độ
        popupAnchor: [0, -48],  // popup mở phía trên ghim
    })
}

const BanDoLeaflet = ({ chon, onChon }) => {
    const { t, lang } = useNgonNgu()
    const khungRef = useRef(null)     // div chứa bản đồ
    const mapRef = useRef(null)       // L.Map sau khi khởi tạo
    const markersRef = useRef({})     // { id: L.Marker }
    const LRef = useRef(null)
    const onChonRef = useRef(onChon)
    const chonRef = useRef(chon)
    const langRef = useRef(lang)      // ngôn ngữ mới nhất cho effect khởi tạo (chạy 1 lần) đọc
    const anhRef = useRef({ anh: {}, thuVien: {} }) // ảnh mới nhất cho các effect đọc mà không phải chạy lại
    const [duLieuAnh, setDuLieuAnh] = useState({ anh: {}, thuVien: {} })

    useEffect(() => { onChonRef.current = onChon }, [onChon])
    useEffect(() => { chonRef.current = chon }, [chon])
    useEffect(() => { langRef.current = lang }, [lang])

    // Ảnh thật của các địa điểm (bìa + thư viện) nếu đã thả ảnh vào public/dia-diem/
    useEffect(() => {
        fetch('/api/dia-diem/anh').then(r => r.json()).then(d => {
            const data = { anh: d.anh || {}, thuVien: d.thuVien || {} }
            anhRef.current = data
            setDuLieuAnh(data)
        }).catch(() => { })
    }, [])

    // Khởi tạo bản đồ MỘT lần (Leaflet cần window nên phải import động trong useEffect)
    useEffect(() => {
        let daHuy = false
        import('leaflet').then(({ default: L }) => {
            if (daHuy || !khungRef.current || mapRef.current) return
            LRef.current = L

            const map = L.map(khungRef.current, {
                scrollWheelZoom: false, // tránh cướp thao tác lăn chuột khi đang cuộn trang
                zoomControl: true,
            })
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map)

            const { anh, thuVien } = anhRef.current
            for (const d of DIA_DIEM) {
                const marker = L.marker(d.viTri, { icon: taoIcon(L, d, d.id === chonRef.current, anh[d.id]), riseOnHover: true })
                    .addTo(map)
                    .bindPopup(htmlPopup(d, anh[d.id] || null, thuVien[d.id] || [], langRef.current), {
                        className: 'popup-diadiem', closeButton: true, maxWidth: 260, minWidth: 240,
                        autoPanPadding: [28, 28], // tự đẩy bản đồ để popup không bị mép khung cắt
                    })
                marker.on('click', () => onChonRef.current?.(d.id))
                markersRef.current[d.id] = marker
            }

            // Thu khung nhìn vừa đủ ôm trọn mọi ghim
            map.fitBounds(DIA_DIEM.map(d => d.viTri), { padding: [36, 36] })
            mapRef.current = map

            // Mở sẵn popup của điểm đang chọn để người xem thấy ngay cách dùng
            setTimeout(() => markersRef.current[chonRef.current]?.openPopup(), 500)
        })
        return () => {
            daHuy = true
            mapRef.current?.remove()
            mapRef.current = null
            markersRef.current = {}
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Có ảnh thật HOẶC đổi ngôn ngữ -> cập nhật lại nội dung popup (và ghim khi có ảnh)
    useEffect(() => {
        const L = LRef.current
        for (const d of DIA_DIEM) {
            const marker = markersRef.current[d.id]
            if (!marker) continue
            marker.setPopupContent(htmlPopup(d, duLieuAnh.anh[d.id] || null, duLieuAnh.thuVien[d.id] || [], lang))
            if (L) marker.setIcon(taoIcon(L, d, d.id === chonRef.current, duLieuAnh.anh[d.id]))
        }
    }, [duLieuAnh, lang])

    // Chọn từ danh sách bên ngoài -> bay tới ghim + mở popup + đổi kiểu ghim đang chọn
    useEffect(() => {
        const L = LRef.current, map = mapRef.current
        if (!L || !map) return
        const anh = anhRef.current.anh
        for (const d of DIA_DIEM) {
            markersRef.current[d.id]?.setIcon(taoIcon(L, d, d.id === chon, anh[d.id]))
        }
        const dChon = DIA_DIEM.find(d => d.id === chon)
        const marker = markersRef.current[chon]
        if (dChon && marker) {
            // Mở popup SAU khi bay xong — mở giữa lúc bay sẽ bị khung bản đồ cắt mất đỉnh popup
            const moPopup = () => marker.openPopup()
            map.once('moveend', moPopup)
            map.flyTo(dChon.viTri, Math.max(map.getZoom(), 14), { duration: 0.8 })
            // Phòng khi bản đồ đã đứng yên đúng chỗ (không phát moveend)
            const henGio = setTimeout(() => { map.off('moveend', moPopup); if (!marker.isPopupOpen()) marker.openPopup() }, 1000)
            return () => { clearTimeout(henGio); map.off('moveend', moPopup) }
        }
    }, [chon])

    return (
        <div
            ref={khungRef}
            className='relative w-full aspect-[8/5] max-sm:aspect-[4/5] rounded-3xl overflow-hidden shadow-lg ring-1 ring-sky-100 z-0'
            aria-label={t('Bản đồ các điểm tham quan quanh Hồng Gai', 'Map of sights around Hong Gai', '鸿基周边景点地图')}
        />
    )
}

export default BanDoLeaflet
