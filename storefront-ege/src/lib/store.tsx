'use client'

import {
  createContext, useContext, useEffect, useState, ReactNode, useCallback,
} from 'react'
import { Customer, Product } from './api'

// ─────────────────────────────────────────────
// Combined Auth + Cart context
// ─────────────────────────────────────────────
export interface CartItem {
  product: Product
  quantity: number
}

interface StoreContextType {
  // Auth
  customer: Customer | null
  setCustomer: (c: Customer | null) => void
  logout: () => void
  // Cart
  cart: CartItem[]
  addToCart: (product: Product, qty?: number) => void
  setQuantity: (productId: string, qty: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  // Toast
  toast: { msg: string; type: 'success' | 'error' } | null
  showToast: (msg: string, type?: 'success' | 'error') => void
}

const StoreContext = createContext<StoreContextType | null>(null)

const LS_CUSTOMER = 'ege:customer'
const LS_CART = 'ege:cart'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomerState] = useState<Customer | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const c = localStorage.getItem(LS_CUSTOMER)
      if (c) setCustomerState(JSON.parse(c))
      const k = localStorage.getItem(LS_CART)
      if (k) setCart(JSON.parse(k))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (customer) localStorage.setItem(LS_CUSTOMER, JSON.stringify(customer))
    else localStorage.removeItem(LS_CUSTOMER)
  }, [customer, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(LS_CART, JSON.stringify(cart))
  }, [cart, hydrated])

  const setCustomer = (c: Customer | null) => setCustomerState(c)
  const logout = () => setCustomerState(null)

  const addToCart = useCallback((product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + qty, product.stock_quantity) }
            : i,
        )
      }
      return [...prev, { product, quantity: Math.min(qty, product.stock_quantity) }]
    })
  }, [])

  const setQuantity = useCallback((productId: string, qty: number) => {
    setCart(prev =>
      prev
        .map(i =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(1, Math.min(qty, i.product.stock_quantity)) }
            : i,
        )
        .filter(i => i.quantity > 0),
    )
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = cart.reduce(
    (sum, i) => sum + Number(i.product.unit_price) * i.quantity,
    0,
  )

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <StoreContext.Provider
      value={{
        customer, setCustomer, logout,
        cart, addToCart, setQuantity, removeFromCart, clearCart, cartCount, cartTotal,
        toast, showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be inside StoreProvider')
  return ctx
}
