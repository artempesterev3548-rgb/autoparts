'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getCart } from '@/lib/cart'
import { getSupabaseBrowser } from '@/lib/auth'

const QPartIcon = ({ size = 36 }: { size?: number }) => (
  <svg viewBox="0 0 48 46" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    {/* 12-tooth gear centered at (20,20), outer R=19, valley r=14 */}
    <path fill="#FF6B00" d="
      M18.05,6.14 L18.01,1.11 L21.99,1.11 L21.95,6.14
      L25.24,7.02 L27.73,2.64 L31.17,4.63 L28.62,8.97
      L31.03,11.38 L35.37,8.83 L37.36,12.27 L32.98,14.76
      L33.86,18.05 L38.90,18.01 L38.90,21.99 L33.86,21.95
      L32.98,25.24 L37.36,27.73 L35.37,31.17 L31.03,28.62
      L28.62,31.03 L31.17,35.37 L27.73,37.36 L25.24,32.98
      L21.95,33.86 L21.99,38.90 L18.01,38.90 L18.05,33.86
      L14.76,32.98 L12.27,37.36 L8.83,35.37 L11.38,31.03
      L8.97,28.62 L4.63,31.17 L2.64,27.73 L7.02,25.24
      L6.14,21.95 L1.10,21.99 L1.10,18.01 L6.14,18.05
      L7.02,14.76 L2.64,12.27 L4.63,8.83 L8.97,11.38
      L11.38,8.97 L8.83,4.63 L12.27,2.64 L14.76,7.02 Z
    "/>
    {/* Dark hub */}
    <circle cx="20" cy="20" r="10" fill="#0F2744"/>
    {/* Q ring — thick orange circle (magnifying glass lens) */}
    <circle cx="18.5" cy="17.5" r="5.8" stroke="#FF6B00" strokeWidth="3.5" fill="none"/>
    {/* Q handle — exits gear, forms the tail of Q */}
    <line x1="22.8" y1="21.5" x2="44" y2="42" stroke="#FF6B00" strokeWidth="4.5" strokeLinecap="round"/>
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
  const [userName, setUserName] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const update = () => setCartCount(getCart().reduce((s, i) => s + i.quantity, 0))
    update()
    window.addEventListener('cart-updated', update)

    const supabase = getSupabaseBrowser()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.name || user.email?.split('@')[0] || 'ЛК'
        setUserName(name)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'ЛК'
        setUserName(name)
      } else {
        setUserName(null)
      }
    })

    return () => {
      window.removeEventListener('cart-updated', update)
      subscription.unsubscribe()
    }
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

          {/* Войти / ЛК */}
          {userName ? (
            <Link href="/lk" style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              textDecoration: 'none', color: 'rgba(255,255,255,0.85)',
              background: 'rgba(255,255,255,0.08)', flexShrink: 0,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {userName.length > 14 ? userName.slice(0, 14) + '…' : userName}
            </Link>
          ) : (
            <Link href="/auth/login" style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              textDecoration: 'none', color: 'rgba(255,255,255,0.85)',
              background: 'rgba(255,255,255,0.08)', flexShrink: 0,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Войти
            </Link>
          )}

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
