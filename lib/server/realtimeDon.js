// Bắn realtime (Pusher) + thông báo đẩy (Web Push) cho ĐƠN HÀNG — cả chợ lẫn đồ ăn.
//  - Đơn MỚI            → báo CHỦ quán/gian: kênh private-quan-<id> (sự kiện 'don-moi') + push tới userId chủ.
//  - Đổi TRẠNG THÁI     → báo KHÁCH:         kênh private-khach-<userId> (sự kiện 'don-cap-nhat') + push (nếu khách đã đăng nhập).
// Dùng lại đúng các kênh/hạ tầng của phần chat (private-quan-*, private-khach-*) nên không cần cấu hình thêm.
// Mọi lỗi realtime/push đều được nuốt sẵn ở tầng dưới (ban / guiPushToiUser) → không làm gãy API đặt đơn.
import { ban, kenh } from './pusher'
import { guiPushToiUser } from './webPush'
import { formatVND } from '@/lib/utils/currency'
import { TT } from '@/lib/donDoAn'

// Nhãn trạng thái phần đơn CHỢ (statusTheoGian) — pipeline mới + nhánh hủy/trả
const NHAN_CHO = { cho_xac_nhan: 'Chờ xác nhận', cho_lay_hang: 'Chờ lấy hàng', dang_giao: 'Đang giao', da_giao: 'Đã giao xong', tra_hang: 'Trả hàng', da_huy: 'Đã hủy', moi: 'Chờ xác nhận' }

// ───────────────────────── ĐỒ ĂN ─────────────────────────

// Khách vừa đặt món → báo chủ quán (quanUserId = data.userId của quán).
export async function baoDonDoAnMoi(don, quanUserId) {
    await ban(kenh.quan(don.quanAnId), 'don-moi', {
        loai: 'do_an', id: don.id, tenKhach: don.tenKhach, tongTien: don.tongTien,
    })
    guiPushToiUser(quanUserId, {
        tieuDe: '🔔 Đơn đặt món mới',
        noiDung: `${don.tenKhach} • ${formatVND(don.tongTien)}`,
        url: '/quan-an/don-hang', tag: 'don-do-an-moi',
    })
}

// Chủ quán đổi trạng thái → báo khách theo dõi đơn.
export async function baoDonDoAnCapNhat(don) {
    if (!don?.userId) return
    const nhan = TT[don.trangThai]?.ten || 'Đã cập nhật'
    await ban(kenh.khach(don.userId), 'don-cap-nhat', {
        loai: 'do_an', id: don.id, tenQuan: don.tenQuan, trangThai: don.trangThai, nhan,
    })
    guiPushToiUser(don.userId, {
        tieuDe: `Đơn ở ${don.tenQuan}`,
        noiDung: `Trạng thái: ${nhan}`,
        url: '/don-do-an', tag: 'don-do-an-' + don.id,
    })
}

// ───────────────────────── CHỢ ─────────────────────────

// Khách vừa đặt đơn chợ → mỗi gian có sản phẩm trong đơn nhận một thông báo riêng.
// chuTheoStore: Map<storeId, { userId, tenGian }> để biết đẩy push tới ai.
export async function baoDonChoMoi(don, chuTheoStore) {
    const cacStore = [...new Set(don.items.map(it => it.storeId))]
    await Promise.all(cacStore.map(async storeId => {
        const phanGian = don.items.filter(it => it.storeId === storeId)
        const tong = phanGian.reduce((s, it) => s + it.gia * it.soLuong, 0)
        await ban(kenh.quan(storeId), 'don-moi', {
            loai: 'cho', id: don.id, tenKhach: don.ten, tongTien: tong,
        })
        const chu = chuTheoStore?.get(storeId)
        if (chu?.userId) guiPushToiUser(chu.userId, {
            tieuDe: '🛒 Đơn hàng mới',
            noiDung: `${don.ten} • ${formatVND(tong)}`,
            url: '/store/orders', tag: 'don-cho-moi',
        })
    }))
}

// Gian đổi trạng thái phần của mình trong đơn → báo khách (nếu đơn có userId).
export async function baoDonChoCapNhat(don, storeId, status) {
    if (!don?.userId) return
    const nhan = NHAN_CHO[status] || 'Đã cập nhật'
    await ban(kenh.khach(don.userId), 'don-cap-nhat', {
        loai: 'cho', id: don.id, trangThai: status, nhan,
    })
    guiPushToiUser(don.userId, {
        tieuDe: 'Cập nhật đơn hàng',
        noiDung: `Một phần đơn của bạn: ${nhan}`,
        url: '/orders', tag: 'don-cho-' + don.id,
    })
}
