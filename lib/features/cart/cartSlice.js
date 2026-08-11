import { createSlice } from '@reduxjs/toolkit'

// Giỏ hàng dùng KHÓA DÒNG (khoa): sản phẩm thường -> productId; sản phẩm có phân loại
// -> "productId::bienTheId" (xem lib/utils/gioHang). Các action nhận { khoa }.
// Vẫn chấp nhận { productId } cho tương thích cũ (productId cũng là một khóa hợp lệ).
const layKhoa = (payload = {}) => payload.khoa ?? payload.productId

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
    },
    reducers: {
        addToCart: (state, action) => {
            const khoa = layKhoa(action.payload)
            if (khoa == null) return
            state.cartItems[khoa] = (state.cartItems[khoa] || 0) + 1
            state.total += 1
        },
        removeFromCart: (state, action) => {
            const khoa = layKhoa(action.payload)
            if (state.cartItems[khoa]) {
                state.cartItems[khoa]--
                if (state.cartItems[khoa] === 0) {
                    delete state.cartItems[khoa]
                }
                state.total -= 1
            }
        },
        deleteItemFromCart: (state, action) => {
            const khoa = layKhoa(action.payload)
            state.total -= state.cartItems[khoa] ? state.cartItems[khoa] : 0
            delete state.cartItems[khoa]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
        // Khôi phục giỏ đã lưu trong localStorage (gọi sau khi hydrate để tránh lệch SSR)
        khoiPhucGio: (state, action) => {
            const { cartItems } = action.payload || {}
            if (cartItems && typeof cartItems === 'object') {
                state.cartItems = cartItems
                state.total = Object.values(cartItems).reduce((s, n) => s + n, 0)
            }
        },
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart, khoiPhucGio } = cartSlice.actions

export default cartSlice.reducer
