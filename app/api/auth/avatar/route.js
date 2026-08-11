import { NextResponse } from 'next/server'
import { layPhien } from '@/lib/server/phien'
import { capNhatNguoiDung, anThongTinNhayCam } from '@/lib/server/userDb'
import { luuAnhUpload } from '@/lib/server/luuAnh'

// POST /api/auth/avatar — đổi ảnh đại diện (multipart/form-data, field 'anh').
// Ảnh nên được nén ở trình duyệt trước khi gửi (xem lib/utils/nenAnh.js).
export async function POST(request) {
    const phien = await layPhien()
    if (!phien) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 })

    try {
        const form = await request.formData()
        const file = form.get('anh')
        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'Vui lòng chọn ảnh' }, { status: 400 })
        }

        const url = await luuAnhUpload(file, 'avatar') // ném lỗi tiếng Việt nếu sai định dạng/quá lớn
        const user = await capNhatNguoiDung(phien.sub, { avatar: url })
        if (!user) return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 })

        return NextResponse.json({ user: anThongTinNhayCam(user) })
    } catch (e) {
        return NextResponse.json({ error: e?.message || 'Không tải được ảnh' }, { status: 400 })
    }
}

// DELETE /api/auth/avatar — bỏ ảnh đại diện, quay về hiển thị chữ cái đầu.
export async function DELETE() {
    const phien = await layPhien()
    if (!phien) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 })

    const user = await capNhatNguoiDung(phien.sub, { avatar: null })
    if (!user) return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 })
    return NextResponse.json({ user: anThongTinNhayCam(user) })
}
