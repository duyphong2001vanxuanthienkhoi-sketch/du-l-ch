'use client'
import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";

// khoa: khóa dòng trong giỏ (sản phẩm thường = productId; có phân loại = "productId::bienTheId").
// Vẫn nhận productId cũ cho tương thích.
const Counter = ({ khoa, productId }) => {

    const ma = khoa ?? productId
    const { cartItems } = useSelector(state => state.cart);

    const dispatch = useDispatch();

    const addToCartHandler = () => {
        dispatch(addToCart({ khoa: ma }))
    }

    const removeFromCartHandler = () => {
        dispatch(removeFromCart({ khoa: ma }))
    }

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
            <button onClick={removeFromCartHandler} className="p-1 select-none">-</button>
            <p className="p-1">{cartItems[ma]}</p>
            <button onClick={addToCartHandler} className="p-1 select-none">+</button>
        </div>
    )
}

export default Counter
