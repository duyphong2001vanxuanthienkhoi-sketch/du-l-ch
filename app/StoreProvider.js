'use client'
import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'
import { khoiPhucGio } from '../lib/features/cart/cartSlice'
import { KHOA_GIO } from '../lib/utils/gioHang'

export default function StoreProvider({ children }) {
  const storeRef = useRef(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  // Khôi phục giỏ hàng đã lưu, và tự lưu lại mỗi khi giỏ thay đổi
  useEffect(() => {
    const store = storeRef.current
    try {
      const daLuu = localStorage.getItem(KHOA_GIO)
      if (daLuu) store.dispatch(khoiPhucGio(JSON.parse(daLuu)))
    } catch { }

    const boDangKy = store.subscribe(() => {
      try {
        const { cartItems } = store.getState().cart
        localStorage.setItem(KHOA_GIO, JSON.stringify({ cartItems }))
      } catch { }
    })
    return boDangKy
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
}
