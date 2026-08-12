'use client'
import { useEffect, useRef, useState } from 'react'
import { useNgonNgu } from '@/lib/i18n'
import { mauDiaDiem, iconDiaDiem } from '@/lib/diaDiemLoai'
import 'leaflet/dist/leaflet.css'

// BẢN ĐỒ DÙNG CHUNG (Leaflet + OpenStreetMap, không cần API key).
// Thay cho BanDoLeaflet cũ — bản cũ gắn chết vào mảng DIA_DIEM hardcode; bản này
// nhận `ds` từ ngoài nên dùng được cho trang chủ, Khám phá, Bản đồ toàn màn hình,
// trang chi tiết (1 ghim + điểm quanh đây) và sau này là lộ trình.
//
// Leaflet cần `window` nên phải import động trong useEffect — giữ đúng cách bản cũ đã làm.
// CSS cho ghim nằm ở app/globals.css (khối "Bản đồ Leaflet").
//
// Props:
//   ds       — mảng địa điểm (cần d.viTri = [vĩ độ, kinh độ])
//   chon     — id đang chọn; onChon(id) khi bấm ghim
//   viTriToi — [lat, lng] vị trí khách, vẽ thêm chấm xanh
//   noiTuyen — true: nối các điểm trong ds theo ĐÚNG THỨ TỰ mảng bằng đường đứt nét
//              (dùng cho trang lộ trình). Đây là đường nối thẳng giữa các chặng để thấy
//              hình dáng hành trình, KHÔNG phải chỉ đường thực tế theo đường phố.
//   soThuTu  — true: ghim hiện SỐ CHẶNG (1, 2, 3...) thay cho emoji
//   cao      — class chiều cao khung

function taoIcon(L, d, dangChon, so = null) {
    const mau = mauDiaDiem(d)
    const trong = so != null
        ? `<span class="ghim-so">${so}</span>`
        : d.anhBia
            ? `<img class="ghim-anh" src="${d.anhBia}" alt=""/>`
            : `<span class="ghim-emoji">${iconDiaDiem(d)}</span>`
    return L.divIcon({
        className: '',
        html: `<div class="ghim ${dangChon ? 'ghim-chon' : ''}" style="--mau:${mau}">
                   <span class="ghim-dau">${trong}</span>
               </div>`,
        iconSize: [40, 50],
        iconAnchor: [20, 48],
        popupAnchor: [0, -48],
    })
}

export default function BanDo({
    ds = [], chon, onChon, viTriToi = null,
    noiTuyen = false, soThuTu = false,
    cao = 'h-full', className = '',
}) {
    const { t } = useNgonNgu()
    const khungRef = useRef(null)
    const mapRef = useRef(null)
    const LRef = useRef(null)
    const ghimRef = useRef({})
    const toiRef = useRef(null)
    const tuyenRef = useRef(null)
    const onChonRef = useRef(onChon)
    const chonRef = useRef(chon)

    // Leaflet nạp BẤT ĐỒNG BỘ còn dữ liệu địa điểm cũng về bất đồng bộ — bên nào xong
    // trước là chuyện may rủi. Nếu chỉ vẽ ghim trong effect [ds] thì khi dữ liệu về
    // TRƯỚC lúc bản đồ dựng xong, effect thoát sớm và KHÔNG BAO GIỜ vẽ lại → mất ghim.
    // Cờ này báo bản đồ đã sẵn sàng, và được đưa vào deps để effect vẽ chạy lại đúng lúc.
    const [sanSang, setSanSang] = useState(false)

    useEffect(() => { onChonRef.current = onChon }, [onChon])
    useEffect(() => { chonRef.current = chon }, [chon])

    // Khởi tạo bản đồ MỘT lần
    useEffect(() => {
        let daHuy = false
        import('leaflet').then(({ default: L }) => {
            if (daHuy || !khungRef.current || mapRef.current) return
            LRef.current = L
            const map = L.map(khungRef.current, { scrollWheelZoom: false, zoomControl: true })
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map)
            // Khung nhìn mặc định: trung tâm Hồng Gai, phòng khi chưa có địa điểm nào
            map.setView([20.9500, 107.0750], 14)
            mapRef.current = map
            setSanSang(true)
        })
        return () => {
            daHuy = true
            mapRef.current?.remove()
            mapRef.current = null
            ghimRef.current = {}
            setSanSang(false)
        }
    }, [])

    // Vẽ lại ghim mỗi khi danh sách đổi (đổi bộ lọc, tải xong dữ liệu)
    useEffect(() => {
        const L = LRef.current, map = mapRef.current
        if (!L || !map) return

        for (const m of Object.values(ghimRef.current)) m.remove()
        ghimRef.current = {}
        tuyenRef.current?.remove()
        tuyenRef.current = null

        const coToaDo = ds.filter(d => Array.isArray(d.viTri))

        // Đường nối các chặng — vẽ TRƯỚC ghim để nằm dưới, không che mũi ghim
        if (noiTuyen && coToaDo.length > 1) {
            tuyenRef.current = L.polyline(coToaDo.map(d => d.viTri), {
                color: '#0f172a', weight: 3, opacity: 0.5, dashArray: '7 8',
            }).addTo(map)
        }

        coToaDo.forEach((d, i) => {
            const m = L.marker(d.viTri, {
                icon: taoIcon(L, d, d.id === chonRef.current, soThuTu ? i + 1 : null),
                riseOnHover: true,
            }).addTo(map)
            m.on('click', () => onChonRef.current?.(d.id))
            ghimRef.current[d.id] = m
        })

        if (coToaDo.length) {
            map.fitBounds(coToaDo.map(d => d.viTri), { padding: [40, 40], maxZoom: 16 })
        }
    }, [ds, sanSang, noiTuyen, soThuTu])

    // Chấm vị trí khách
    useEffect(() => {
        const L = LRef.current, map = mapRef.current
        if (!L || !map) return
        toiRef.current?.remove()
        toiRef.current = null
        if (!Array.isArray(viTriToi)) return
        toiRef.current = L.marker(viTriToi, {
            icon: L.divIcon({ className: '', html: '<div class="ghim-toi"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
            zIndexOffset: -100,
        }).addTo(map)
    }, [viTriToi, sanSang])

    // Chọn từ danh sách bên ngoài -> bay tới ghim
    useEffect(() => {
        const L = LRef.current, map = mapRef.current
        if (!L || !map) return
        ds.forEach((d, i) => ghimRef.current[d.id]?.setIcon(
            taoIcon(L, d, d.id === chon, soThuTu ? i + 1 : null)))
        const dChon = ds.find(d => d.id === chon)
        if (dChon && Array.isArray(dChon.viTri)) {
            map.flyTo(dChon.viTri, Math.max(map.getZoom(), 15), { duration: 0.7 })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chon])

    return (
        <div ref={khungRef} className={`relative w-full ${cao} z-0 ${className}`}
            aria-label={t('Bản đồ địa điểm ở Hồng Gai', 'Map of places in Hong Gai', '鸿基地点地图')} />
    )
}
