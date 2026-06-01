import Link from 'next/link'

const col = {
  heading: { color: '#FF6B00', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: 14 },
  link: { display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 10, textDecoration: 'none' },
}

export default function Footer() {
  return (
    <footer style={{ background: '#0B1E35' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '52px 24px 24px' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>

          {/* Бренд */}
          <div className="footer-brand-col">
            <div style={{ marginBottom: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/truckline-logo-v2.png" alt="TruckLine" style={{ display: 'block', height: 36, width: 'auto' }} />
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, marginBottom: 20 }}>
              Запчасти и ремонт тягачей, полуприцепов, самосвалов и спецтехники в Хакасии. Свой автосервис в Усть-Абакане.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="tel:+79232130101" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +7 (923) 213-01-01
              </a>
              <a href="mailto:info.truckline@mail.ru" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                info.truckline@mail.ru
              </a>
            </div>
          </div>

          {/* Покупателям */}
          <div>
            <div style={col.heading}>Покупателям</div>
            {[['Как заказать', '/how-to-order'], ['Доставка', '/delivery'], ['Возврат', '/returns'], ['Оплата', '/delivery']].map(([label, href]) => (
              <Link key={label} href={href} style={col.link}>{label}</Link>
            ))}
          </div>

          {/* Каталог */}
          <div>
            <div style={col.heading}>Каталог</div>
            {[
              ['Тягачи и полуприцепы', '/special'],
              ['Самосвалы и спецтехника', '/special'],
              ['Поиск по ОЕМ', '/search'],
              ['Автосервис', '/service'],
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
        <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
          <span>© 2024–2026 ООО «ТК Саяны Плюс»</span>
          <span>ИНН: 2413007682 · КПП: 241301001</span>
          <span>Цены и наличие могут быть изменены. Уточняйте у менеджера.</span>
        </div>
      </div>
    </footer>
  )
}
