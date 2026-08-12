'use client'
// HỘ CHIẾU HỒNG GAI — check-in tại địa điểm và sưu tầm huy hiệu.
//
// Chạy hoàn toàn trên localStorage, KHÔNG cần tài khoản (guest-first, mục 7).
// Đây là thứ thay cho "tích điểm" của bản chợ cũ: du khách không cần điểm thưởng,
// họ cần một lý do để đi thêm chỗ nữa và một thứ để khoe.
//
// XÁC THỰC BẰNG TOẠ ĐỘ: phải ĐỨNG GẦN địa điểm mới đóng được dấu. Không xác thực thì
// huy hiệu vô nghĩa — ai ngồi nhà cũng bấm được hết.
import { useEffect, useState } from 'react'
import { khoangCachKm } from '@/lib/diaDiemLoai'

const KEY = 'ho-chieu-check-in'
const SU_KIEN = 'ho-chieu-doi'

// Bán kính cho phép đóng dấu (mét).
// 500m nghe rộng, nhưng: GPS trong phố kẹp giữa nhà cao tầng sai 50–100m là thường,
// và những nơi như núi Bài Thơ hay vịnh Hạ Long bản thân đã trải rộng hơn thế.
// Thà rộng rãi còn hơn để khách đứng ngay trước cổng chùa mà máy báo "bạn ở quá xa".
export const BAN_KINH_M = 500

export function layCheckIn() {
    if (typeof window === 'undefined') return []
    try {
        const v = JSON.parse(localStorage.getItem(KEY) || '[]')
        return Array.isArray(v) ? v : []
    } catch { return [] }
}

function ghi(ds) {
    try { localStorage.setItem(KEY, JSON.stringify(ds)) } catch { /* bỏ qua */ }
    try { window.dispatchEvent(new CustomEvent(SU_KIEN, { detail: ds })) } catch { /* bỏ qua */ }
}

export const daCheckIn = (id, ds = layCheckIn()) => ds.some(c => c.diaDiemId === id)

/**
 * Đóng dấu một địa điểm. Trả { ok, loi, khoangCachM }.
 * Cần trình duyệt cho phép truy cập vị trí và khách đang đứng trong bán kính.
 */
export async function dongDau(diaDiem) {
    if (!diaDiem?.viTri) {
        return { ok: false, loi: 'thieu-toa-do' }
    }
    if (daCheckIn(diaDiem.id)) {
        return { ok: false, loi: 'da-check-in' }
    }
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return { ok: false, loi: 'khong-ho-tro' }
    }

    let vt
    try {
        vt = await new Promise((giai, tuChoi) => {
            navigator.geolocation.getCurrentPosition(giai, tuChoi, {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 30000,
            })
        })
    } catch (e) {
        return { ok: false, loi: e?.code === 1 ? 'tu-choi-vi-tri' : 'khong-lay-duoc-vi-tri' }
    }

    const toi = [vt.coords.latitude, vt.coords.longitude]
    const km = khoangCachKm(toi, diaDiem.viTri)
    const m = Math.round((km ?? 999) * 1000)

    // Cộng thêm sai số máy báo: máy nói "chính xác ±80m" thì nới thêm chừng đó,
    // nếu không người dùng máy GPS kém sẽ không bao giờ check-in được.
    const noiThem = Math.min(Number(vt.coords.accuracy) || 0, 300)
    if (m > BAN_KINH_M + noiThem) {
        return { ok: false, loi: 'qua-xa', khoangCachM: m }
    }

    const ds = layCheckIn()
    ghi([{ diaDiemId: diaDiem.id, luc: new Date().toISOString(), viTri: toi }, ...ds])
    return { ok: true, khoangCachM: m }
}

export function xoaDau(diaDiemId) {
    ghi(layCheckIn().filter(c => c.diaDiemId !== diaDiemId))
}

export function useCheckIn() {
    // Lần render đầu trả [] để khớp HTML dựng sẵn ở server, đọc localStorage sau khi mount
    const [ds, setDs] = useState([])
    useEffect(() => {
        setDs(layCheckIn())
        const nghe = (e) => setDs(e.detail || layCheckIn())
        window.addEventListener(SU_KIEN, nghe)
        const ngheTab = (e) => { if (e.key === KEY) setDs(layCheckIn()) }
        window.addEventListener('storage', ngheTab)
        return () => {
            window.removeEventListener(SU_KIEN, nghe)
            window.removeEventListener('storage', ngheTab)
        }
    }, [])
    return ds
}

// ---------- Huy hiệu ----------
//
// Định nghĩa bằng DỮ LIỆU chứ không gắn cứng vào từng địa điểm cụ thể:
// gắn cứng id (vd 'nui-bai-tho') thì đổi dữ liệu là huy hiệu hỏng.

export const HUY_HIEU = [
    {
        id: 'nguoi-moi', icon: '🧭', mau: '#0d9488',
        ten: ['Người mới đến', 'Newcomer', '初来乍到'],
        moTa: ['Đóng dấu địa điểm đầu tiên', 'Stamp your first place', '打卡第一个地点'],
        can: 1, dat: (c) => c.tong >= 1,
        tien: (c) => Math.min(c.tong, 1),
    },
    {
        id: 'nguoi-kham-pha', icon: '🗺️', mau: '#0284c7',
        ten: ['Người khám phá', 'Explorer', '探索者'],
        moTa: ['Đóng dấu 5 địa điểm', 'Stamp 5 places', '打卡5个地点'],
        can: 5, dat: (c) => c.tong >= 5,
        tien: (c) => Math.min(c.tong, 5),
    },
    {
        id: 'tho-dia', icon: '🏅', mau: '#d97706',
        ten: ['Thổ địa Hồng Gai', 'Hong Gai local', '鸿基通'],
        moTa: ['Đóng dấu 15 địa điểm', 'Stamp 15 places', '打卡15个地点'],
        can: 15, dat: (c) => c.tong >= 15,
        tien: (c) => Math.min(c.tong, 15),
    },
    {
        id: 'nguoi-hanh-huong', icon: '🏯', mau: '#b45309',
        ten: ['Người hành hương', 'Pilgrim', '朝圣者'],
        moTa: ['Đóng dấu 3 điểm tâm linh', 'Stamp 3 spiritual sites', '打卡3处灵修地'],
        can: 3, dat: (c) => c.loai.tam_linh >= 3,
        tien: (c) => Math.min(c.loai.tam_linh || 0, 3),
    },
    {
        id: 'sanh-an', icon: '🍜', mau: '#ea580c',
        ten: ['Sành ăn phố mỏ', 'Local foodie', '矿城美食家'],
        moTa: ['Đóng dấu 5 quán ăn hoặc cà phê', 'Stamp 5 eateries or cafés', '打卡5家餐馆或咖啡馆'],
        can: 5, dat: (c) => (c.loai.an_uong || 0) + (c.loai.ca_phe || 0) >= 5,
        tien: (c) => Math.min((c.loai.an_uong || 0) + (c.loai.ca_phe || 0), 5),
    },
    {
        id: 'nguoi-yeu-su', icon: '📜', mau: '#059669',
        ten: ['Người yêu sử', 'History buff', '历史爱好者'],
        moTa: ['Đóng dấu 3 di tích hoặc bảo tàng', 'Stamp 3 heritage sites or museums', '打卡3处古迹或博物馆'],
        can: 3, dat: (c) => (c.loai.di_tich || 0) + (c.loai.van_hoa || 0) >= 3,
        tien: (c) => Math.min((c.loai.di_tich || 0) + (c.loai.van_hoa || 0), 3),
    },
    {
        id: 'san-hoang-hon', icon: '🌅', mau: '#7c3aed',
        ten: ['Thợ săn hoàng hôn', 'Sunset chaser', '追日落的人'],
        moTa: ['Đóng dấu một điểm ngắm cảnh sau 17h', 'Stamp a scenic spot after 5pm', '17点后打卡观景点'],
        can: 1, dat: (c) => c.hoangHon >= 1,
        tien: (c) => Math.min(c.hoangHon, 1),
    },
    {
        id: 'day-tu-mo-sang', icon: '🌄', mau: '#0369a1',
        ten: ['Dậy từ mờ sáng', 'Early bird', '早起的人'],
        moTa: ['Đóng dấu trước 7h sáng', 'Stamp before 7am', '早上7点前打卡'],
        can: 1, dat: (c) => c.sangSom >= 1,
        tien: (c) => Math.min(c.sangSom, 1),
    },
    {
        id: 'du-loai-hinh', icon: '💎', mau: '#c026d3',
        ten: ['Đủ đường đủ nẻo', 'All-rounder', '全能玩家'],
        moTa: ['Đóng dấu đủ 5 loại hình khác nhau', 'Stamp 5 different categories', '打卡5种不同类型'],
        can: 5, dat: (c) => c.soLoai >= 5,
        tien: (c) => Math.min(c.soLoai, 5),
    },
]

// Tổng hợp số liệu từ danh sách check-in + dữ liệu địa điểm
export function thongKe(checkIns, diaDiems) {
    const theoId = Object.fromEntries((diaDiems || []).map(d => [d.id, d]))
    const loai = {}
    let hoangHon = 0
    let sangSom = 0

    for (const c of checkIns || []) {
        const d = theoId[c.diaDiemId]
        if (!d) continue
        loai[d.loai] = (loai[d.loai] || 0) + 1

        const gio = new Date(c.luc).getHours()
        if (d.loai === 'ngam_canh' && gio >= 17) hoangHon++
        if (gio < 7) sangSom++
    }

    return {
        tong: (checkIns || []).filter(c => theoId[c.diaDiemId]).length,
        loai,
        soLoai: Object.keys(loai).length,
        hoangHon,
        sangSom,
    }
}

export function tinhHuyHieu(checkIns, diaDiems) {
    const c = thongKe(checkIns, diaDiems)
    return HUY_HIEU.map(h => ({
        ...h,
        daDat: h.dat(c),
        tienDo: h.tien(c),
    }))
}
