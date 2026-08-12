// Đọc CSV xuất từ GOOGLE SHEETS THU THẬP DỮ LIỆU và đổi thành object địa điểm.
// Dùng chung ở /admin/nhap (xem trước) và /api/admin/dia-diem/nhap (ghi vào CSDL) —
// một hàm cho cả hai, để cái xem trước đúng bằng cái được ghi thật.
//
// ĐỌC ĐÚNG ĐỊNH DẠNG SHEET ĐANG DÙNG, không bắt sửa sheet:
//   • 4 mục ngăn bằng dòng tiêu đề có emoji ("☕ 1. CAFE & ĐỒ UỐNG (VIEW ĐẸP / CHECK-IN)")
//     -> suy ra `loai` cho mọi dòng phía dưới, khỏi cần cột "loại"
//   • Hàng tiêu đề cột LẶP LẠI sau mỗi mục -> tự nhận ra và bỏ qua
//   • Giờ là một ô gộp "07:00 - 23:00" -> tách thành gioMoCua / gioDongCua
//   • Giá là khoảng "35.000 - 70.000" -> suy ra mucGia, đồng thời giữ nguyên câu chữ
//   • Toạ độ lấy từ LINK GOOGLE MAP trong cột địa chỉ
import { LOAI_DIA_DIEM, taoSlug } from '@/lib/diaDiemLoai'

// ---------- Tách CSV (RFC 4180 — đúng thứ Google Sheets xuất ra) ----------
export function tachCsv(vanBan) {
    const dong = []
    let o = []
    let cur = ''
    let trongNgoac = false
    const s = String(vanBan || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    for (let i = 0; i < s.length; i++) {
        const c = s[i]
        if (trongNgoac) {
            if (c === '"') {
                if (s[i + 1] === '"') { cur += '"'; i++ }   // "" -> "
                else trongNgoac = false
            } else cur += c
            continue
        }
        if (c === '"') { trongNgoac = true; continue }
        if (c === ',') { o.push(cur); cur = ''; continue }
        if (c === '\n') { o.push(cur); dong.push(o); o = []; cur = ''; continue }
        cur += c
    }
    if (cur !== '' || o.length) { o.push(cur); dong.push(o) }
    return dong
}

const boDau = (s) => String(s || '')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/đ/gi, 'd').toLowerCase()

// Ô rỗng, hoặc "#ERROR!" / "—" mà Sheets hay để lại
const rong = (v) => {
    const s = String(v ?? '').trim()
    return !s || s === '—' || s === '-' || /^#(ERROR|N\/A|REF|VALUE)/i.test(s)
}

// ---------- Nhận diện loại từ dòng tiêu đề mục ----------
const MUC_SANG_LOAI = [
    { khop: /cafe|ca phe|do uong/, loai: 'ca_phe' },
    { khop: /quan an|am thuc|dac san/, loai: 'an_uong' },
    { khop: /an dem/, loai: 'an_uong' },
    { khop: /khach san|homestay|luu tru|luu tr/, loai: 'luu_tru' },
    { khop: /du lich|tham quan|mua sam/, loai: 'du_lich_gop' },  // mục gộp — đoán tiếp theo tên
]

function nhanDienMuc(hang) {
    const daySo = hang.filter(x => !rong(x))
    // Dòng mục chỉ có 1–2 ô có chữ, và chứa số thứ tự mục
    if (!daySo.length || daySo.length > 2) return null
    const s = boDau(daySo[0])
    if (!/\d\s*\./.test(daySo[0]) && !/[☕🍜🏛️🏨🌙]/u.test(daySo[0])) return null
    for (const m of MUC_SANG_LOAI) if (m.khop.test(s)) return m.loai
    return null
}

// Mục 3 gộp 6 thứ khác nhau (chùa, bảo tàng, núi, chợ, TTTM...) nên phải đoán tiếp
// theo TÊN địa điểm. Đoán sai thì biên tập viên sửa lại ngay ở bảng xem trước.
//
// DÙNG \b (ranh giới từ) chứ không phải "ho " — bản đầu viết /ho / khiến "Chợ Hạ Long"
// khớp nhầm chuỗi "ho " nằm giữa chữ "c-h-o- " và bị xếp thành ngắm cảnh.
// Thứ tự kiểm tra cũng quan trọng: cái CỤ THỂ trước, cái chung chung sau.
function doanLoaiTheoTen(ten) {
    const s = boDau(ten)
    if (/\b(chua|den|dinh|mieu|nha tho|thien vien|pagoda|tu vien)\b/.test(s)) return 'tam_linh'
    if (/\b(bao tang|nha van hoa|thu vien|cung quy hoach|trien lam)\b/.test(s)) return 'van_hoa'
    if (/\b(di tich|bia|thanh co|nha luu niem)\b/.test(s)) return 'di_tich'
    if (/\b(cho|sieu thi|vincom|tttm|shop|cua hang)\b|trung tam thuong mai|luu niem/.test(s)) return 'mua_sam'
    if (/\b(rap|karaoke|bowling|game|spa)\b|khu vui choi|pho di bo|cong vien/.test(s)) return 'vui_choi'
    if (/\b(tau|thuyen|taxi)\b|du thuyen|thue xe/.test(s)) return 'dich_vu'
    if (/\b(nui|cau|dao|ho|suoi|deo|vinh)\b|bai bien|bai tam/.test(s)) return 'ngam_canh'
    return 'ngam_canh'   // mặc định an toàn cho mục "du lịch, tham quan"
}

// Dòng mẫu để sẵn trong sheet cho người thu thập điền tiếp — KHÔNG phải địa điểm thật.
// Sheet đang có 6 dòng kiểu "[Nhập thêm quán cafe...]"; nhập vào là rác hiện lên app.
const laDongMau = (ten) => {
    const s = String(ten || '').trim()
    return /^[[(<].*[\])>]$/.test(s) || /nhap them|dien them|vi du|example|mau/i.test(boDau(s))
}

// ---------- Đọc từng giá trị ----------

// "07:00 - 23:00" | "7h-23h" | "07:00–23:00" (gạch dài) | "Cả ngày"
function tachGio(v) {
    if (rong(v)) return ['', '']
    const s = String(v).trim()
    if (/ca ngay|24\/7|24h|suot ngay/i.test(boDau(s))) return ['00:00', '23:59']

    const so = [...s.matchAll(/(\d{1,2})\s*[:hg.]\s*(\d{2})?/gi)]
    if (so.length < 2) return ['', '']

    const dinh = (m) => {
        const h = Number(m[1]), p = Number(m[2] || 0)
        if (h > 23 || p > 59) return ''
        return `${String(h).padStart(2, '0')}:${String(p).padStart(2, '0')}`
    }
    return [dinh(so[0]), dinh(so[1])]
}

// "35.000 - 70.000" -> { mucGia: 'vua', so: [35000, 70000] }
// "Miễn phí" -> mien_phi. Không đọc được thì để trống, KHÔNG đoán bừa.
function docGia(v) {
    if (rong(v)) return { mucGia: null }
    const s = String(v).trim()
    if (/mien phi|free|tu do|khong thu phi/.test(boDau(s))) return { mucGia: 'mien_phi' }

    // Bỏ dấu chấm/phẩy ngăn nghìn rồi lấy các số
    const so = [...s.matchAll(/\d[\d.,]*/g)]
        .map(m => Number(String(m[0]).replace(/[.,]/g, '')))
        .filter(n => Number.isFinite(n) && n > 0)
    if (!so.length) return { mucGia: null }

    // Số nhỏ kiểu "35" (nghìn) -> nhân lên cho đồng nhất
    const chuan = so.map(n => (n < 1000 ? n * 1000 : n))
    const giua = chuan.reduce((a, b) => a + b, 0) / chuan.length

    let mucGia = 'cao'
    if (giua < 50000) mucGia = 're'
    else if (giua <= 150000) mucGia = 'vua'
    return { mucGia, so: chuan }
}

// Toạ độ từ LINK GOOGLE MAP. Bắt các dạng link dán thẳng từ trình duyệt.
// Link RÚT GỌN (maps.app.goo.gl / goo.gl/maps) không chứa toạ độ -> trả null kèm cờ
// để phía server tự mở link lấy địa chỉ thật.
export function docToaDoTuLink(v) {
    const s = String(v || '')
    if (!s) return { viTri: null }

    // .../@20.9527,107.0731,17z
    let m = s.match(/@(-?\d+\.\d+),\s*(-?\d+\.\d+)/)
    // ...!3d20.9527!4d107.0731
    if (!m) m = s.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
    // ?q=20.9527,107.0731 hoặc ?ll= / ?daddr=
    if (!m) m = s.match(/[?&](?:q|ll|daddr|center)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/)
    // Hoặc người nhập dán thẳng "20.9527, 107.0731"
    if (!m) m = s.match(/^\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{2,3}\.\d+)\s*$/)

    if (m) {
        const lat = Number(m[1]), lng = Number(m[2])
        if (Number.isFinite(lat) && Number.isFinite(lng) &&
            lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return { viTri: [lat, lng] }
        }
    }

    const linkRutGon = /(maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(s)
    return { viTri: null, linkRutGon, link: linkRutGon ? s.match(/https?:\/\/\S+/)?.[0] : null }
}

// ---------- Nhận diện hàng tiêu đề cột ----------
const TU_KHOA_TIEU_DE = ['ten dia diem', 'dia chi', 'muc gia', 'gio mo cua']
const laHangTieuDe = (hang) => {
    const s = hang.map(boDau).join(' | ')
    return TU_KHOA_TIEU_DE.filter(k => s.includes(k)).length >= 2
}

// Ghép chỉ số cột theo tên tiêu đề (khớp mềm, không cần đúng từng chữ)
function ghepCot(hang) {
    const c = {}
    hang.forEach((o, i) => {
        const s = boDau(o)
        if (!s) return
        if (s.includes('ten dia diem') || s === 'ten') c.ten = i
        else if (s.includes('dia chi')) c.diaChi = i
        else if (s.includes('muc gia') || s.includes('gia tham khao')) c.gia = i
        else if (s.includes('gio mo')) c.gio = i
        else if (s.includes('dien thoai') || s.includes('contact')) c.dienThoai = i
        else if (s.includes('diem noi bat') || s.includes('danh gia') || s.includes('mo ta')) c.mota = i
        else if (s.includes('link anh') || s.includes('hinh anh') || s.includes('anh')) c.anh = i
        else if (s.includes('ghi chu') || s.includes('nguoi dong gop')) c.ghiChu = i
        else if (s === 'stt') c.stt = i
    })
    return c
}

/**
 * Đọc CSV -> { ds } với mỗi phần tử: { dong, ok, loi[], canhBao[], doanLoai, diaDiem }
 * `doanLoai` = true khi loại hình là do máy ĐOÁN theo tên (mục "du lịch, tham quan")
 * -> giao diện tô màu để biên tập viên rà lại.
 */
export function docCsvDiaDiem(vanBan) {
    const bang = tachCsv(vanBan)
    if (!bang.length) return { ds: [], loi: 'File rỗng hoặc không đọc được' }

    const idLoai = LOAI_DIA_DIEM.map(l => l.id)
    let cot = null
    let loaiHienTai = null
    const ds = []

    bang.forEach((hang, i) => {
        if (hang.every(rong)) return

        const muc = nhanDienMuc(hang)
        if (muc) { loaiHienTai = muc; return }

        if (laHangTieuDe(hang)) { cot = ghepCot(hang); return }
        if (!cot) return                      // chưa gặp hàng tiêu đề thì chưa đọc dữ liệu

        const o = (k) => (cot[k] == null ? '' : String(hang[cot[k]] ?? '').trim())
        const ten = o('ten')
        if (rong(ten)) return                 // dòng trống / dòng tổng
        if (laDongMau(ten)) return            // dòng mẫu "[Nhập thêm quán cafe...]"

        const loi = []
        const canhBao = []

        // Loại hình: theo mục đang đọc; mục gộp thì đoán theo tên
        let loai = loaiHienTai
        let doanLoai = false
        if (!loai) {
            loi.push('Không xác định được loại hình — dòng này nằm ngoài mọi mục')
            loai = 'ngam_canh'
        } else if (loai === 'du_lich_gop') {
            loai = doanLoaiTheoTen(ten)
            doanLoai = true
        }
        if (!idLoai.includes(loai)) loai = 'ngam_canh'

        const [gioMo, gioDong] = tachGio(o('gio'))
        if (!rong(o('gio')) && !gioMo) canhBao.push(`Không đọc được giờ "${o('gio')}"`)

        const gia = docGia(o('gia'))
        const chuoiDiaChi = o('diaChi')
        const kq = docToaDoTuLink(chuoiDiaChi)

        if (!kq.viTri) {
            canhBao.push(kq.linkRutGon
                ? 'Link Google Map rút gọn — hệ thống sẽ tự mở link để lấy toạ độ khi nhập'
                : 'Chưa có toạ độ (dán link Google Map vào cột địa chỉ) — sẽ KHÔNG lên bản đồ, không vào được lộ trình')
        }

        // Địa chỉ hiển thị: bỏ phần link ra khỏi câu chữ cho gọn
        const diaChiChu = chuoiDiaChi.replace(/https?:\/\/\S+/g, '').replace(/[()\s]+$/, '').trim()

        ds.push({
            dong: i + 1,
            ok: loi.length === 0,
            loi, canhBao, doanLoai,
            linkCanMo: kq.linkRutGon ? kq.link : null,
            diaDiem: {
                id: taoSlug(ten),
                loai,
                ten: [ten, '', ''],
                mota: [rong(o('mota')) ? '' : o('mota'), '', ''],
                gioiThieu: [], diemNoiBat: [],
                viTri: kq.viTri,
                diaChi: diaChiChu,
                gioMoCua: gioMo, gioDongCua: gioDong, ngayNghi: [],
                mucGia: gia.mucGia,
                // Giữ NGUYÊN câu chữ giá của người thu thập — không quy ra con số cứng
                giaVe: [rong(o('gia')) ? '' : o('gia'), '', ''],
                gioMoCuaMoTa: ['', '', ''], diChuyen: ['', '', ''],
                dienThoai: rong(o('dienThoai')) ? '' : o('dienThoai'),
                website: '', facebook: '',
                tienIch: [],
                anhBia: rong(o('anh')) ? '' : (o('anh').match(/https?:\/\/\S+/)?.[0] || ''),
                anhs: [],
                mau: '', icon: '',
                lanCan: [],
                nguon: 'bien_tap',
                status: 'da_duyet',
                noiBat: 0,
            },
        })
    })

    if (!ds.length) {
        return { ds: [], loi: 'Không tìm thấy dòng dữ liệu nào. Kiểm tra file có hàng tiêu đề chứa "Tên địa điểm" không.' }
    }
    return { ds }
}
