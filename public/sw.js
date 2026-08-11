/* Service Worker — nhận Web Push và hiện thông báo (chạy cả khi tab/app đã đóng,
   miễn là trình duyệt còn chạy nền). Đặt ở /public nên phục vụ tại /sw.js (scope gốc). */

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// Có tin đẩy tới → hiện thông báo hệ thống
self.addEventListener('push', (event) => {
    let data = {}
    try { data = event.data ? event.data.json() : {} } catch { data = {} }
    const tieuDe = data.tieuDe || 'Tin nhắn mới'
    const opts = {
        body: data.noiDung || '',
        icon: data.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.tag || 'tin-nhan',   // gộp cùng tag để không spam nhiều thông báo
        renotify: true,
        data: { url: data.url || '/' },
    }
    event.waitUntil(self.registration.showNotification(tieuDe, opts))
})

// Bấm vào thông báo → mở/di chuyển tới đúng trang
self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const url = event.notification.data?.url || '/'
    event.waitUntil((async () => {
        const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        for (const c of all) {
            if ('focus' in c) { c.navigate(url); return c.focus() }
        }
        if (self.clients.openWindow) return self.clients.openWindow(url)
    })())
})
