'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getCart } from '@/lib/cart'

const QPartIcon = ({ size = 36 }: { size?: number }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <path fill="#FF6B00" d="M17.66,6.71 L18.07,1.60 L21.93,1.60 L22.34,6.71 L27.74,8.94 L31.64,5.62 L34.38,8.36 L31.06,12.26 L33.30,17.66 L38.40,18.07 L38.40,21.93 L33.30,22.34 L31.06,27.74 L34.38,31.64 L31.64,34.38 L27.74,31.06 L22.34,33.30 L21.93,38.40 L18.07,38.40 L17.66,33.30 L12.26,31.06 L8.36,34.38 L5.62,31.64 L8.94,27.74 L6.70,22.34 L1.60,21.93 L1.60,18.07 L6.70,17.66 L8.94,12.26 L5.62,8.36 L8.36,5.62 L12.26,8.94 Z"/>
    <circle cx="20" cy="20" r="11.5" fill="#0F2744"/>
    <circle cx="18" cy="18" r="6.5" stroke="#FF6B00" strokeWidth="2.5" fill="none"/>
    <line x1="23" y1="23" x2="27.5" y2="27.5" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

const IconCar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17H5a2 2 0 0 1-2-2v-4l2.5-5h11L19 11v4a2 2 0 0 1-2 2z"/>
    <circle cx="7.5" cy="17" r="2.5"/>
    <circle cx="16.5" cy="17" r="2.5"/>
    <line x1="3" y1="11" x2="21" y2="11"/>
  </svg>
)

const IconTruck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const IconCart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/>
    <circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
)

export default function Header() {
  const [cartCount, setCartCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const update = () => setCartCount(getCart().reduce((s, i) => s + i.quantity, 0))
    update()
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  const isActive = (path: string) => pathname.startsWith(path)

  const navLink = (active: boolean) => ({
    display: 'flex' as const, alignItems: 'center' as const, gap: 6,
    padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
    textDecoration: 'none', transition: 'all .2s',
    color: active ? 'white' : 'rgba(255,255,255,0.65)',
    background: active ? 'rgba(255,107,0,0.18)' : 'transparent',
  })

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      {/* Верхняя полоска */}
      <div style={{ background: '#0B1E35', padding: '7px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            +7 (000) 000-00-00 · Пн–Сб 9:00–18:00
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['О компании', '/about'], ['Доставка', '/delivery'], ['Контакты', '/contacts']].map(([label, href]) => (
              <Link key={href} href={href} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* Основная шапка */}
      <div style={{ background: '#0F2744', boxShadow: '0 2px 20px rgba(0,0,0,0.35)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Логотип */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <QPartIcon size={36} />
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', fontStyle: 'italic' }}>
              <span style={{ color: '#FF6B00' }}>Q</span><span style={{ color: 'white' }}>Part</span>
            </span>
          </Link>

          {/* Навигация */}
          <nav style={{ display: 'flex', gap: 2 }}>
            <Link href="/cars" style={navLink(isActive('/cars'))}>
              <IconCar /> Легковые
            </Link>
            <Link href="/special" style={navLink(isActive('/special'))}>
              <IconTruck /> Спецтехника
            </Link>
            <Link href="/vin" style={navLink(isActive('/vin'))}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12.01"/></svg>
              VIN
            </Link>
            <Link href="/search" style={navLink(false)}>
              <IconSearch /> Поиск
            </Link>
          </nav>

          {/* Корзина */}
          <Link href="/cart" style={{
            display: 'flex', alignItems: 'center', gap: 8, position: 'relative',
            background: '#FF6B00', color: 'white', padding: '10px 20px',
            borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none',
            flexShrink: 0,
          }}>
            <IconCart /> Корзина
            {cartCount > 0 && (
              <span style={{
                background: 'white', color: '#FF6B00', borderRadius: '50%',
                width: 18, height: 18, fontSize: 11, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
