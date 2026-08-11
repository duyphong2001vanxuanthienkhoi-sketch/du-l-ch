// Lưu ảnh tải lên — dùng chung cho gian hàng & sản phẩm.
// Trả về URL công khai của ảnh, hoặc ném lỗi có thông điệp tiếng Việt.
//
// - Trên Vercel (có BLOB_READ_WRITE_TOKEN): lưu lên Vercel Blob, trả URL https đầy đủ.
//   Bắt buộc vì đĩa của Vercel chỉ đọc — không ghi được vào public/uploads.
// - Chạy máy (dev, không có token): lưu tạm vào public/uploads như trước cho tiện thử.
import { put } from '@vercel/blob'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

const ANH_HO_TRO = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }
const DUNG_LUONG_TOI_DA = 5 * 1024 * 1024 // 5MB (ảnh đã được nén ở trình duyệt trước khi gửi)

export async function luuAnhUpload(file, tienTo = 'anh') {
    if (!ANH_HO_TRO[file.type]) throw new Error('Ảnh phải là PNG, JPG hoặc WebP')
    if (file.size > DUNG_LUONG_TOI_DA) throw new Error('Ảnh tối đa 5MB')

    const tenFile = `${tienTo}_${crypto.randomUUID()}.${ANH_HO_TRO[file.type]}`

    // Có token Blob -> lưu lên Vercel Blob (bắt buộc khi chạy trên Vercel).
    if (process.env.BLOB_READ_WRITE_TOKEN) {
        const { url } = await put(`uploads/${tenFile}`, file, {
            access: 'public',
            contentType: file.type,
        })
        return url
    }

    // Không có token (chạy máy) -> lưu tạm vào public/uploads.
    const thuMuc = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(thuMuc, { recursive: true })
    await fs.writeFile(path.join(thuMuc, tenFile), Buffer.from(await file.arrayBuffer()))
    return '/uploads/' + tenFile
}
