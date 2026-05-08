import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>

        <div style={{ fontSize: 80, fontWeight: 900, color: '#FF6B00', lineHeight: 1, marginBottom: 8 }}>404</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F2744', marginBottom: 12 }}>Страница не найдена</h1>
        <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.6, marginBottom: 32 }}>
          Возможно, ссылка устарела или страница была перемещена.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <Link href="/" style={{ background: '#FF6B00', color: 'white', padding: '13px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            На главную
          </Link>
          <Link href="/catalog" style={{ background: 'white', color: '#0F2744', border: '1px solid #E5E7EB', padding: '13px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
            В каталог
          </Link>
        </div>

        <div style={{ marginTop: 36, fontSize: 14, color: '#9CA3AF' }}>
          Нужна помощь?{' '}
          <a href="tel:+79232130101" style={{ color: '#FF6B00', fontWeight: 600, textDecoration: 'none' }}>
            +7 (923) 213-01-01
          </a>
        </div>

      </div>
    </div>
  )
}
