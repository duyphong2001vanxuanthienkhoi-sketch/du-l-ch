import { NextResponse } from 'next/server'
import { yeuCauAdmin } from '@/lib/server/quyen'
import { capNhatGianHang } from '@/lib/server/storeDb'

// POST /api/admin/stores/sap-xep  { thuTu: [storeId, ...] }
// Chỉ admin — GHI stores.json: gán uuTien = vị trí trong danh sách (0 = lên đầu).
// Trang chủ / API công khai sẽ ưu tiên gian có uuTien nhỏ, phần còn lại vẫn xếp theo sao.
export async function POST(request) {
    const admin = await yeuCauAdmin()
    if (!admin) {
        return NextResponse.json({ error: 'Chỉ quản trị viên mới được truy cập' }, { status: 403 })
    }

    const { thuTu } = await request.json()
    if (!Array.isArray(thuTu) || thuTu.some(id => typeof id !== 'string')) {
        return NextResponse.json({ error: 'Danh sách thứ tự không hợp lệ' }, { status: 400 })
    }

    // Gán uuTien theo vị trí — làm tuần tự cho chắc (số lượng gian nhỏ)
    for (let i = 0; i < thuTu.length; i++) {
        await capNhatGianHang(thuTu[i], { uuTien: i })
    }

    return NextResponse.json({ ok: true })
}
