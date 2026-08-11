// Gửi email qua Brevo (https://brevo.com) — gói miễn phí 300 email/ngày,
// KHÔNG cần sở hữu tên miền riêng (chỉ cần xác minh một địa chỉ người gửi).
//
// Cần 2 biến môi trường trong .env:
//   BREVO_API_KEY   — lấy ở Brevo > Settings > SMTP & API > API Keys
//   BREVO_TU_EMAIL  — email người gửi ĐÃ XÁC MINH trong Brevo > Senders
// (tùy chọn) BREVO_TU_TEN — tên hiển thị của người gửi, mặc định "Chợ Số Hồng Gai"
//
// CHƯA có API key (đang dev ở máy): email không gửi thật mà IN RA CONSOLE
// nơi chạy `npm run dev` — nhờ vậy vẫn thử được toàn bộ luồng quên mật khẩu.
export async function guiEmail({ den, tieuDe, html }) {
    const apiKey = process.env.BREVO_API_KEY

    if (!apiKey) {
        console.log('\n════════ EMAIL (chế độ dev — chưa có BREVO_API_KEY) ════════')
        console.log('Tới     :', den)
        console.log('Tiêu đề :', tieuDe)
        // In phần link trong email (nếu có) để bấm thử ngay từ terminal
        const link = html.match(/href="([^"]+)"/)?.[1]
        if (link) console.log('Link    :', link)
        console.log('═════════════════════════════════════════════════════════════\n')
        return { daGui: true, cheDoDev: true }
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sender: {
                name: process.env.BREVO_TU_TEN || 'Chợ Số Hồng Gai',
                email: process.env.BREVO_TU_EMAIL,
            },
            to: [{ email: den }],
            subject: tieuDe,
            htmlContent: html,
        }),
    })

    if (!res.ok) {
        const loi = await res.text().catch(() => '')
        console.error('Gửi email Brevo thất bại:', res.status, loi)
        return { daGui: false }
    }
    return { daGui: true }
}

// Khung email HTML dùng chung — màu xanh lục đồng bộ với app
export function khungEmail({ loiChao, noiDung, nutChu, nutLink, ghiChu }) {
    return `
    <div style="background:#f1f5f9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
            <div style="background:#059669;padding:20px 28px">
                <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold">Chợ Số Hồng Gai</p>
                <p style="margin:2px 0 0;color:#a7f3d0;font-size:12px">Chợ truyền thống Quảng Ninh trên không gian số</p>
            </div>
            <div style="padding:28px">
                <p style="margin:0 0 12px;color:#0f172a;font-size:15px">${loiChao}</p>
                <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6">${noiDung}</p>
                ${nutLink ? `
                <p style="text-align:center;margin:0 0 20px">
                    <a href="${nutLink}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 32px;border-radius:999px">${nutChu}</a>
                </p>
                <p style="margin:0 0 20px;color:#94a3b8;font-size:12px;line-height:1.6">Nếu nút không bấm được, sao chép liên kết sau vào trình duyệt:<br><a href="${nutLink}" style="color:#059669;word-break:break-all">${nutLink}</a></p>
                ` : ''}
                ${ghiChu ? `<p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6">${ghiChu}</p>` : ''}
            </div>
        </div>
        <p style="text-align:center;color:#94a3b8;font-size:11px;margin:16px 0 0">© Chợ Số Hồng Gai — Phường Hồng Gai, Quảng Ninh</p>
    </div>`
}
