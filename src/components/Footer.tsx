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
              <svg viewBox="0 0 40 40" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FF6B00" d="M17.66,6.71 L18.07,1.60 L21.93,1.60 L22.34,6.71 L27.74,8.94 L31.64,5.62 L34.38,8.36 L31.06,12.26 L33.30,17.66 L38.40,18.07 L38.40,21.93 L33.30,22.34 L31.06,27.74 L34.38,31.64 L31.64,34.38 L27.74,31.06 L22.34,33.30 L21.93,38.40 L18.07,38.40 L17.66,33.30 L12.26,31.06 L8.36,34.38 L5.62,31.64 L8.94,27.74 L6.70,22.34 L1.60,21.93 L1.60,18.07 L6.70,17.66 L8.94,12.26 L5.62,8.36 L8.36,5.62 L12.26,8.94 Z"/>
                <circle cx="20" cy="20" r="11.5" fill="#0B1E35"/>
                <circle cx="18" cy="18" r="6.5" stroke="#FF6B00" strokeWidth="2.5" fill="none"/>
                <line x1="23" y1="23" x2="27.5" y2="27.5" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round"/>
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
