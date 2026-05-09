'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getCart } from '@/lib/cart'
import { getSupabaseBrowser } from '@/lib/auth'

const TruckLineLogo = ({ height = 62 }: { height?: number }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/truckline-logo.png" alt="TruckLine" style={{ display: 'block', height, width: 'auto' }} />
)

const IconParts = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="8" height="8" rx="1"/>
    <rect x="14" y="3" width="8" height="8" rx="1"/>
    <rect x="2" y="13" width="8" height="8" rx="1"/>
    <rect x="14" y="13" width="8" height="8" rx="1"/>
  </svg>
)

const IconWrench = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
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
      <style>{`
        @media (max-width: 768px) {
          .hdr-topbar { display: none !important; }
          .hdr-nav-label { display: none !important; }
          .hdr-nav { gap: 0 !important; }
          .hdr-nav a { padding: 8px 10px !important; }
          .hdr-main-inner { padding: 0 8px !important; gap: 4px !important; }
          .hdr-login-label { display: none !important; }
          .hdr-login { padding: 8px 10px !important; gap: 0 !important; min-width: 0 !important; }
          .hdr-cart { padding: 10px 12px !important; gap: 0 !important; }
          .hdr-logo img { height: 32px !important; }
          .hdr-main-inner { height: 48px !important; }
        }
        header { overflow: hidden; }
      `}</style>

      {/* Верхняя полоска */}
      <div className="hdr-topbar" style={{ background: '#0B1E35', padding: '7px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            +7 (923) 213-01-01 · Пн–Пт 8:00–19:00, Сб–Вс 9:00–17:00
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
        <div className="hdr-main-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 48 }}>
          {/* Логотип */}
          <Link href="/" className="hdr-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <TruckLineLogo height={36} />
          </Link>

          {/* Навигация */}
          <nav className="hdr-nav" style={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center' }}>
            <Link href="/parts" style={navLink(isActive('/parts') || isActive('/cars') || isActive('/special') || isActive('/vin'))}>
              <IconParts /> <span className="hdr-nav-label">Запчасти</span>
            </Link>
            <Link href="/service" style={navLink(isActive('/service'))}>
              <IconWrench /> <span className="hdr-nav-label">Сервис</span>
            </Link>
            <Link href="/search" style={navLink(pathname === '/search')}>
              <IconSearch /> <span className="hdr-nav-label">Поиск</span>
            </Link>
          </nav>

          {/* Войти / ЛК */}
          {userName ? (
            <Link href="/lk" className="hdr-login" style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              textDecoration: 'none', color: 'rgba(255,255,255,0.85)',
              background: 'rgba(255,255,255,0.08)', flexShrink: 0,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span className="hdr-login-label">{userName.length > 14 ? userName.slice(0, 14) + '…' : userName}</span>
            </Link>
          ) : (
            <Link href="/auth/login" className="hdr-login" style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              textDecoration: 'none', color: 'rgba(255,255,255,0.85)',
              background: 'rgba(255,255,255,0.08)', flexShrink: 0,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              <span className="hdr-login-label">Войти</span>
            </Link>
          )}

          {/* Корзина */}
          <Link href="/cart" className="hdr-cart" style={{
            display: 'flex', alignItems: 'center', gap: 8, position: 'relative',
            background: '#FF6B00', color: 'white', padding: '10px 20px',
            borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none',
            flexShrink: 0,
          }}>
            <IconCart /> <span className="hdr-login-label">Корзина</span>
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
