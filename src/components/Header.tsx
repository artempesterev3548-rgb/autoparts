'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getCart } from '@/lib/cart'

export default function Header() {
  const [cartCount, setCartCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const update = () => setCartCount(getCart().reduce((s, i) => s + i.quantity, 0))
    update()
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  const isSection = (s: string) => pathname.startsWith(`/${s}`)

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      {/* Верхняя полоса */}
      <div className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-10 text-xs text-gray-400">
          <span>Запчасти для легковых авто и спецтехники</span>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-white transition">О компании</Link>
            <Link href="/delivery" className="hover:text-white transition">Доставка</Link>
            <Link href="/contacts" className="hover:text-white transition">Контакты</Link>
          </div>
        </div>
      </div>

      {/* Основная шапка */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold tracking-tight hover:text-orange-400 transition">
            🔧 <span className="text-orange-400">Авто</span>Запчасти
          </Link>

          {/* Два главных раздела */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/cars"
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${
                isSection('cars')
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              🚗 Легковые авто
            </Link>
            <Link
              href="/special"
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${
                isSection('special')
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              🚛 Спецтехника и грузовики
            </Link>
            <Link
              href="/search"
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition"
            >
              🔍 Поиск
            </Link>
          </nav>

          <Link href="/cart" className="relative flex items-center gap-2 bg-orange-500 hover:bg-orange-600 transition px-4 py-2 rounded-lg text-sm font-semibold">
            🛒 Корзина
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
