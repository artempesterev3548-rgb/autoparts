'use client'
import { useState } from 'react'
import { addToCart } from '@/lib/cart'
import { CartItem } from '@/lib/types'

export default function AddToCartButton({ product }: { product: CartItem }) {
  const [added, setAdded] = useState(false)

  const handleClick = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
        added
          ? 'bg-green-600 text-white'
          : 'bg-blue-700 text-white hover:bg-blue-800'
      }`}
    >
      {added ? '✓ Добавлено' : '+ В корзину'}
    </button>
  )
}
