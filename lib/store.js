import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './features/cart/cartSlice'

// Chỉ còn giỏ hàng dùng Redux — các slice product/address/rating của template cũ
// không nơi nào đọc nữa nên đã gỡ (chúng chứa dữ liệu giả tiếng Anh).
export const makeStore = () => {
    return configureStore({
        reducer: {
            cart: cartReducer,
        },
    })
}
