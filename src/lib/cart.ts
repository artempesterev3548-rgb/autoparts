import { CartItem } from './types'

const KEY = 'autoparts_cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('cart-updated'))
}

export function addToCart(item: CartItem) {
  const cart = getCart()
  const existing = cart.find(i => i.product_id === item.product_id)
  if (existing) {
    existing.quantity += item.quantity
  } else {
    cart.push(item)
  }
  saveCart(cart)
}

export function removeFromCart(product_id: number) {
  saveCart(getCart().filter(i => i.product_id !== product_id))
}

export function updateQuantity(product_id: number, quantity: number) {
  const cart = getCart()
  const item = cart.find(i => i.product_id === product_id)
  if (item) {
    item.quantity = Math.max(1, quantity)
    saveCart(cart)
  }
}

export function clearCart() {
  saveCart([])
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}
