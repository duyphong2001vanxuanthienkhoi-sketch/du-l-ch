import { NextResponse } from 'next/server'
import { layPhien } from '@/lib/server/phien'
import { timTheoId, capNhatNguoiDung } from '@/lib/server/userDb'
import { taoGianHang, timGianTheoUserId, capNhatGianHang } from '@/lib/server/storeDb'
import { luuAnhUpload } from '@/lib/server/luuAnh'

const LOAI_GIAN_HOP_LE = ['cho_tuoi', 'qua_quang_ninh']

export async function POST(request) {
    try {
        // 1. Phải đăng nhập mới được đăng ký gian
        const phien = await layPhien()
        if (!phien) return NextResponse.json({ error: 'Bạn cần đăng nhập để đăng ký gian hàng' }, { status: 401 })

        const user = await timTheoId(phien.sub)
        if (!user) return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 401 })

        // 2. Mỗi tài khoản chỉ có 1 gian.
        //    Ngoại lệ: gian bị TỪ CHỐI được sửa thông tin và nộp lại (quay về chờ duyệt)
        const gianCu = await timGianTheoUserId(user.id)
        if (gianCu && gianCu.status !== 'tu_choi') {
            return NextResponse.json({ error: 'Tài khoản của bạn đã đăng ký gian hàng rồi' }, { status: 409 })
        }

        // 3. Đọc và kiểm tra dữ liệu form
        const form = await request.formData()
        const tenGian = String(form.get('tenGian') || '').trim()
        const tenChu = String(form.get('tenChu') || '').trim()
        const soDienThoai = String(form.get('soDienThoai') || '').trim()
        const loaiGian = String(form.get('loaiGian') || '')
        const moTa = String(form.get('moTa') || '').trim()
        // Thông tin nhà bán chi tiết (địa chỉ bắt buộc; email/fax/người chịu trách nhiệm/giấy phép tuỳ chọn)
        const email = String(form.get('email') || '').trim()
        const diaChi = String(form.get('diaChi') || '').trim()
        const fax = String(form.get('fax') || '').trim()
        const nguoiChiuTrachNhiem = String(form.get('nguoiChiuTrachNhiem') || '').trim()
        const giayPhep = String(form.get('giayPhep') || '').trim()
        const anh = form.get('logo')

        if (!tenGian) return NextResponse.json({ error: 'Vui lòng nhập tên gian hàng' }, { status: 400 })
        if (!tenChu) return NextResponse.json({ error: 'Vui lòng nhập tên chủ gian' }, { status: 400 })
        if (!/^0\d{8,10}$/.test(soDienThoai.replace(/[\s.-]/g, ''))) {
            return NextResponse.json({ error: 'Số điện thoại không hợp lệ (VD: 0912345678)' }, { status: 400 })
        }
        if (!LOAI_GIAN_HOP_LE.includes(loaiGian)) return NextResponse.json({ error: 'Vui lòng chọn loại gian hàng' }, { status: 400 })
        if (!moTa) return NextResponse.json({ error: 'Vui lòng nhập mô tả ngắn về gian hàng' }, { status: 400 })
        if (!diaChi) return NextResponse.json({ error: 'Vui lòng nhập địa chỉ gian hàng' }, { status: 400 })
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Email liên hệ không hợp lệ' }, { status: 400 })
        }

        const coAnhMoi = anh && typeof anh !== 'string'
        if (!coAnhMoi && !gianCu) return NextResponse.json({ error: 'Vui lòng chọn ảnh đại diện gian hàng' }, { status: 400 })

        // 4. Lưu ảnh (Vercel Blob khi chạy thật, hoặc public/uploads khi chạy máy).
        //    luuAnhUpload tự kiểm định dạng + dung lượng; nộp lại không đổi ảnh -> giữ ảnh cũ.
        let logo = gianCu?.logo
        if (coAnhMoi) {
            try {
                logo = await luuAnhUpload(anh, 'gian')
            } catch (e) {
                return NextResponse.json({ error: e.message }, { status: 400 })
            }
        }

        // 5. GHI DB (stores.json): tạo gian mới, hoặc cập nhật gian bị từ chối và đưa về chờ duyệt
        const gian = gianCu
            ? await capNhatGianHang(gianCu.id, {
                tenGian, tenChu, soDienThoai, loaiGian, moTa, logo,
                email, diaChi, fax, nguoiChiuTrachNhiem, giayPhep,
                status: 'cho_duyet',
                nopLaiLuc: new Date().toISOString(),
            })
            : await taoGianHang({
                userId: user.id, tenGian, tenChu, soDienThoai, loaiGian, moTa, logo,
                email, diaChi, fax, nguoiChiuTrachNhiem, giayPhep,
            })

        // 6. GHI DB (users.json): khách -> tiểu thương (không hạ cấp admin)
        if (user.role === 'khach') {
            await capNhatNguoiDung(user.id, { role: 'tieu_thuong' })
        }

        return NextResponse.json({ store: gian })
    } catch {
        return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
    }
}
