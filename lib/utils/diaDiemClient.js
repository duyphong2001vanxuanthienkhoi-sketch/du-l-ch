'use client'
// Tầng dữ liệu ĐỊA ĐIỂM phía trình duyệt.
//
// GUEST-FIRST (xem THIET-KE-APP-DU-LICH.md mục 7): khách KHÔNG cần đăng nhập để lưu
// địa điểm hay dựng lịch trình — tất cả nằm ở localStorage. Khách mở web giữa đường
// bằng điện thoại mà bắt đăng ký là mất khách ngay.
import { useEffect, useState } from 'react'

// ---------- Tải danh sách địa điểm (nhớ tạm trong phiên để khỏi gọi lại) ----------

let _kho = null
let _dangTai = null

export async function taiDiaDiem() {
    if (_kho) return _kho
    if (_dangTai) return _dangTai
    _dangTai = fetch('/api/dia-diem')
        .then(r => r.json())
        .then(d => { _kho = d.diaDiems || []; return _kho })
        .catch(() => [])
        .finally(() => { _dangTai = null })
    return _dangTai
}

export function xoaKhoTam() { _kho = null }

// Hook tiện dụng: trả { ds, dangTai }
export function useDiaDiem() {
    const [ds, setDs] = useState(_kho || [])
    const [dangTai, setDangTai] = useState(!_kho)

    useEffect(() => {
        let huy = false
        taiDiaDiem().then(kq => {
            if (huy) return
            setDs(kq)
            setDangTai(false)
        })
        return () => { huy = true }
    }, [])

    return { ds, dangTai }
}

// ---------- Địa điểm đã lưu (localStorage, không cần tài khoản) ----------

const KEY_LUU = 'dia-diem-da-luu'
const SU_KIEN = 'dia-diem-da-luu-doi'

export function layDaLuu() {
    if (typeof window === 'undefined') return []
    try {
        const v = JSON.parse(localStorage.getItem(KEY_LUU) || '[]')
        return Array.isArray(v) ? v : []
    } catch { return [] }
}

function ghiDaLuu(ds) {
    try { localStorage.setItem(KEY_LUU, JSON.stringify(ds)) } catch { /* bỏ qua */ }
    // Báo cho mọi component đang mở biết để cùng cập nhật (nút tim ở nhiều chỗ)
    try { window.dispatchEvent(new CustomEvent(SU_KIEN, { detail: ds })) } catch { /* bỏ qua */ }
}

export function doiLuu(id) {
    const ds = layDaLuu()
    const moi = ds.includes(id) ? ds.filter(x => x !== id) : [id, ...ds]
    ghiDaLuu(moi)
    return moi.includes(id)
}

// Hook cho nút tim: trả [danhSach, doi]
export function useDaLuu() {
    // Lần render đầu luôn trả [] để khớp HTML dựng sẵn ở server — đọc localStorage
    // sau khi mount, tránh lỗi hydration (cùng cách lib/i18n đang xử lý ngôn ngữ).
    const [ds, setDs] = useState([])

    useEffect(() => {
        setDs(layDaLuu())
        const nghe = (e) => setDs(e.detail || layDaLuu())
        window.addEventListener(SU_KIEN, nghe)
        // Đồng bộ khi khách mở nhiều tab
        const ngheTab = (e) => { if (e.key === KEY_LUU) setDs(layDaLuu()) }
        window.addEventListener('storage', ngheTab)
        return () => {
            window.removeEventListener(SU_KIEN, nghe)
            window.removeEventListener('storage', ngheTab)
        }
    }, [])

    return [ds, doiLuu]
}

// ---------- Tìm kiếm & sắp xếp ----------

// Bỏ dấu để tìm không cần gõ dấu (vd "vinh ha long" khớp "Vịnh Hạ Long")
export const boDau = (s) => String(s || '')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()

export function locDiaDiem(ds, { tuKhoa, loai, mucGia, dangMo, daLuu } = {}) {
    const q = boDau(String(tuKhoa || '').trim())
    return ds.filter(d => {
        if (loai && d.loai !== loai) return false
        if (mucGia && d.mucGia !== mucGia) return false
        if (dangMo && !dangMoCua(d)) return false
        if (daLuu && !daLuu.includes(d.id)) return false
        if (!q) return true
        const kho = [...(d.ten || []), d.diaChi, ...(d.mota || [])].join(' ')
        return boDau(kho).includes(q)
    })
}

// Có đang mở cửa không, theo giờ máy khách. Thiếu giờ thì coi như không rõ -> trả null.
export function dangMoCua(d, luc = new Date()) {
    if (!d?.gioMoCua || !d?.gioDongCua) return null
    if ((d.ngayNghi || []).includes(luc.getDay())) return false

    const phut = (hhmm) => {
        const [h, m] = String(hhmm).split(':').map(Number)
        return (h || 0) * 60 + (m || 0)
    }
    const nay = luc.getHours() * 60 + luc.getMinutes()
    const mo = phut(d.gioMoCua), dong = phut(d.gioDongCua)

    // Quán mở qua đêm (vd 18:00 -> 02:00): khoảng giờ vắt qua nửa đêm
    if (dong <= mo) return nay >= mo || nay < dong
    return nay >= mo && nay < dong
}
