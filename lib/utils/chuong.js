// Tiếng "ting" báo tin nhắn/đơn mới bằng Web Audio (không cần file âm thanh).
// Lưu ý: nhiều trình duyệt chặn âm thanh cho tới khi người dùng tương tác lần đầu
// (bấm/chạm) — nên lần đầu có thể im, các lần sau kêu bình thường. Nuốt lỗi cho an toàn.
let _ac = null

export function keuTing() {
    try {
        if (typeof window === 'undefined') return
        if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)()
        const ac = _ac
        if (ac.state === 'suspended') ac.resume()
        const g = ac.createGain(); g.connect(ac.destination); g.gain.value = 0.001
        const o = ac.createOscillator(); o.type = 'sine'; o.connect(g)
        const t = ac.currentTime
        o.frequency.setValueAtTime(880, t); o.frequency.setValueAtTime(1320, t + 0.15)
        g.gain.exponentialRampToValueAtTime(0.3, t + 0.02)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
        o.start(t); o.stop(t + 0.42)
    } catch { /* trình duyệt chặn — bỏ qua */ }
}
