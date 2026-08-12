'use client'
// LỊCH TRÌNH CỦA TÔI — khách tự xếp các địa điểm thành hành trình riêng.
//
// Khác `lo_trinh` trong CSDL (do biên tập viên dựng, dùng chung cho mọi người):
// cái này là của RIÊNG từng khách, nằm trên localStorage, KHÔNG cần đăng nhập.
//
// Cố tình giữ đơn giản: một danh sách phẳng có thứ tự, kèm ghi chú và ngày.
// Du khách xếp lịch trong lúc đi bộ ngoài đường — không phải lúc ngồi lập kế hoạch,
// nên đừng bắt họ điền form dài.
import { useEffect, useState } from 'react'

const KEY = 'lich-trinh-cua-toi'
const SU_KIEN = 'lich-trinh-doi'

export function layLichTrinh() {
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

export const trongLichTrinh = (id, ds = layLichTrinh()) => ds.some(x => x.diaDiemId === id)

export function themVaoLichTrinh(diaDiemId) {
    const ds = layLichTrinh()
    if (ds.some(x => x.diaDiemId === diaDiemId)) return false
    ghi([...ds, { diaDiemId, ngay: 1, ghiChu: '' }])
    return true
}

export function boKhoiLichTrinh(diaDiemId) {
    ghi(layLichTrinh().filter(x => x.diaDiemId !== diaDiemId))
}

export function doiChoLichTrinh(i, huong) {
    const ds = layLichTrinh()
    const j = i + huong
    if (j < 0 || j >= ds.length) return
    const moi = [...ds]
    ;[moi[i], moi[j]] = [moi[j], moi[i]]
    ghi(moi)
}

export function suaMuc(i, thayDoi) {
    ghi(layLichTrinh().map((x, k) => (k === i ? { ...x, ...thayDoi } : x)))
}

export function xoaHetLichTrinh() { ghi([]) }

// Nạp một lộ trình dựng sẵn vào lịch trình cá nhân để khách sửa lại theo ý mình.
// Đây là điểm nối giữa nội dung biên tập và kế hoạch cá nhân — "Dùng lộ trình này".
export function napTuLoTrinh(loTrinh) {
    const them = (loTrinh?.diem || [])
        .map(c => c.diaDiemId)
        .filter(Boolean)
    if (!them.length) return 0

    const ds = layLichTrinh()
    const daCo = new Set(ds.map(x => x.diaDiemId))
    const moi = them.filter(id => !daCo.has(id)).map(id => ({ diaDiemId: id, ngay: 1, ghiChu: '' }))
    if (!moi.length) return 0

    ghi([...ds, ...moi])
    return moi.length
}

export function useLichTrinh() {
    const [ds, setDs] = useState([])
    useEffect(() => {
        setDs(layLichTrinh())
        const nghe = (e) => setDs(e.detail || layLichTrinh())
        window.addEventListener(SU_KIEN, nghe)
        const ngheTab = (e) => { if (e.key === KEY) setDs(layLichTrinh()) }
        window.addEventListener('storage', ngheTab)
        return () => {
            window.removeEventListener(SU_KIEN, nghe)
            window.removeEventListener('storage', ngheTab)
        }
    }, [])
    return ds
}
