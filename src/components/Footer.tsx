import Link from 'next/link'

const col = {
  heading: { color: '#FF6B00', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: 14 },
  link: { display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 10, textDecoration: 'none' },
}

export default function Footer() {
  return (
    <footer style={{ background: '#0B1E35' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '52px 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>

          {/* Бренд */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <svg viewBox="0 0 48 46" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FF6B00" d="M18.05,6.14 L18.01,1.11 L21.99,1.11 L21.95,6.14 L25.24,7.02 L27.73,2.64 L31.17,4.63 L28.62,8.97 L31.03,11.38 L35.37,8.83 L37.36,12.27 L32.98,14.76 L33.86,18.05 L38.90,18.01 L38.90,21.99 L33.86,21.95 L32.98,25.24 L37.36,27.73 L35.37,31.17 L31.03,28.62 L28.62,31.03 L31.17,35.37 L27.73,37.36 L25.24,32.98 L21.95,33.86 L21.99,38.90 L18.01,38.90 L18.05,33.86 L14.76,32.98 L12.27,37.36 L8.83,35.37 L11.38,31.03 L8.97,28.62 L4.63,31.17 L2.64,27.73 L7.02,25.24 L6.14,21.95 L1.10,21.99 L1.10,18.01 L6.14,18.05 L7.02,14.76 L2.64,12.27 L4.63,8.83 L8.97,11.38 L11.38,8.97 L8.83,4.63 L12.27,2.64 L14.76,7.02 Z"/>
                <circle cx="20" cy="20" r="10" fill="#0B1E35"/>
                <circle cx="18.5" cy="17.5" r="5.8" stroke="#FF6B00" strokeWidth="3.5" fill="none"/>
                <line x1="22.8" y1="21.5" x2="44" y2="42" stroke="#FF6B00" strokeWidth="4.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 20, fontWeight: 800, fontStyle: 'italic', letterSpacing: '-0.5px' }}>
                <span style={{ color: '#FF6B00' }}>Q</span><span style={{ color: 'white' }}>Part</span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, marginBottom: 20 }}>
              Запчасти для грузовиков, спецтехники и легковых автомобилей. Более 10 000 позиций в наличии.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="tel:+70000000000" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +7 (000) 000-00-00
              </a>
              <a href="mailto:info@example.ru" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                info@example.ru
              </a>
            </div>
          </div>

          {/* Покупателям */}
          <div>
            <div style={col.heading}>Покупателям</div>
            {[['Как заказать', '/about'], ['Доставка', '/delivery'], ['Возврат', '/returns'], ['Оплата', '/about']].map(([label, href]) => (
              <Link key={label} href={href} style={col.link}>{label}</Link>
            ))}
          </div>

          {/* Каталог */}
          <div>
            <div style={col.heading}>Каталог</div>
            {[
              ['Легковые авто', '/cars'],
              ['Спецтехника', '/special'],
              ['Двигатель', '/catalog?category=dvigatel'],
              ['Трансмиссия', '/catalog?category=transmissiya'],
              ['Подвеска', '/catalog?category=podveska-rulevoe'],
            ].map(([label, href]) => (
              <Link key={label} href={href} style={col.link}>{label}</Link>
            ))}
          </div>

          {/* Документы */}
          <div>
            <div style={col.heading}>Документы</div>
            {[
              ['Политика конфиденциальности', '/privacy'],
              ['Пользовательское соглашение', '/terms'],
              ['Обработка персональных данных', '/personal-data'],
              ['Условия возврата', '/returns'],
              ['Реквизиты', '/requisites'],
            ].map(([label, href]) => (
              <Link key={label} href={href} style={col.link}>{label}</Link>
            ))}
          </div>
        </div>

        {/* Нижняя строка */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
          <span>© 2024–2026 ООО «QPart»</span>
          <span>ИНН: 0000000000 · ОГРН: 0000000000000</span>
          <span>Не является публичной офертой</span>
        </div>
      </div>
    </footer>
  )
}
