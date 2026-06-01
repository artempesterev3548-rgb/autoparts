import Link from 'next/link'

const sLabel = { fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' as const, marginBottom: 6 }
const sH2    = { fontSize: 30, fontWeight: 800, color: '#0F2744', marginBottom: 6, letterSpacing: -0.5 }
const sSub   = { fontSize: 15, color: '#6B7280', marginBottom: 28 }

export default function HomePage() {

  const TRUST_PILLS = [
    { icon: `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`, text: 'Свой сервис в Усть-Абакане' },
    { icon: `<rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="17" width="18" height="4" rx="1"/>`, text: 'Стоимость работ — заранее' },
    { icon: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`, text: 'Цены в открытом каталоге' },
    { icon: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>`, text: 'Гарантия до 6 месяцев' },
  ]

  const SECTION_CARDS = [
    {
      href: '/special', title: 'Тягачи и полуприцепы',
      desc: 'Volvo, Scania, DAF, Mercedes, КамАЗ. Седельные тягачи и полуприцепы — наша основная специализация',
      icon: `<path d="M2 17h20"/><path d="M3 17V9a1 1 0 0 1 1-1h6v9"/><rect x="4" y="9" width="5" height="3" rx="0.3"/><line x1="13" y1="14" x2="20" y2="14"/><circle cx="6.5" cy="19" r="2"/><circle cx="14.5" cy="19" r="2"/><circle cx="18.5" cy="19" r="2"/>`,
      cta: 'Перейти в каталог →',
      primary: true,
    },
    {
      href: '/special', title: 'Самосвалы и спецтехника',
      desc: 'КамАЗ, МАЗ, SHACMAN, FAW, Volvo. Запчасти для самосвалов и спецтехники',
      icon: `<path d="M2 17h20"/><path d="M3 17v-6a1 1 0 0 1 1-1h5v7"/><rect x="4" y="11" width="4" height="2.5" rx="0.3"/><path d="M9 17V8l12-2v9"/><line x1="9" y1="11" x2="21" y2="11"/><circle cx="6" cy="19" r="2"/><circle cx="14" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>`,
      cta: 'Перейти в каталог →',
      primary: false,
    },
    {
      href: '/service', title: 'Автосервис в Усть-Абакане',
      desc: 'Ремонт тягачей и полуприцепов. Гарантия до 6 месяцев · Стоимость работ — до начала ремонта.',
      icon: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
      cta: 'Записаться на сервис →',
      primary: false,
    },
  ]

  const WHY_CARDS = [
    { icon: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>`, title: 'Оригинал и аналоги', text: 'Работаем с проверенными поставщиками. Гарантируем качество каждой детали.' },
    { icon: `<rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`, title: 'Быстрая доставка', text: 'Отправляем в день заказа. Доставка по всей России от 1 до 7 дней.' },
    { icon: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`, title: 'Менеджер поможет', text: 'Не знаете ОЕМ номер? Позвоните — подберём по марке, модели и году выпуска.' },
    { icon: `<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5"/>`, title: 'Возврат 14 дней', text: 'Если деталь не подошла — вернём деньги без лишних вопросов.' },
  ]

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh' }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 480 }}>
        <style>{`
          @media (max-width: 768px) {
            .home-hero-title { font-size: 30px !important; letter-spacing: -1px !important; line-height: 1.15 !important; }
            .home-hero-sub { font-size: 14px !important; }
            .home-hero-inner { padding: 40px 16px !important; flex-direction: column !important; align-items: flex-start !important; }
            .home-hero-pills { width: 100% !important; flex-direction: row !important; flex-wrap: wrap !important; }
            .home-hero-pills > div { flex: 1 1 calc(50% - 5px) !important; font-size: 12px !important; padding: 9px 12px !important; }
          }
        `}</style>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, rgba(11,30,53,0.95) 0%, rgba(15,39,68,0.88) 55%, rgba(15,39,68,0.6) 100%)',
        }} />
        <div className="home-hero-inner" style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '64px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
          <div style={{ flex: 1, maxWidth: 620 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,0,0.18)', border: '1px solid rgba(255,107,0,0.4)', color: '#FF8C38', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: '0.5px', marginBottom: 22 }}>
              <span style={{ width: 6, height: 6, background: '#FF6B00', borderRadius: '50%', display: 'inline-block' }} />
              Усть-Абакан · Сервис + Запчасти
            </div>
            <h1 className="home-hero-title" style={{ fontSize: 48, fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 18, letterSpacing: -1.5 }}>
              Запчасти и ремонт тягачей<br />
              <span style={{ color: '#FF6B00' }}>в Хакасии</span> — с открытыми ценами
            </h1>
            <p className="home-hero-sub" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
              Volvo, Scania, DAF, Mercedes, КамАЗ. Открытые цены · Гарантия до 6 мес.
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
              <a href="tel:+79232130101" style={{ background: '#FF6B00', color: 'white', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,107,0,0.4)', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Позвонить
              </a>
              <Link href="/search" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
                Подобрать по ОЕМ номеру
              </Link>
            </div>
            <form method="GET" action="/search" style={{ display: 'flex', background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
              <input name="q" placeholder="ОЕМ номер..."
                style={{ flex: 1, border: 'none', padding: '15px 18px', fontSize: 14, outline: 'none', color: '#111', minWidth: 0 }} />
              <button type="submit" style={{ background: '#FF6B00', color: 'white', border: 'none', padding: '15px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Найти
              </button>
            </form>
          </div>

          {/* Пиллы доверия */}
          <div className="trust-pills home-hero-pills" style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 220, flexShrink: 0 }}>
            {TRUST_PILLS.map(({ icon, text }) => (
              <div key={text} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12, padding: '11px 16px', color: 'white', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: icon }} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── КЛЮЧЕВЫЕ УТП ───────────────────────────────────────────── */}
      <div className="stats-grid" style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          {
            icon: `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>`,
            val: '10 000+',
            lbl: 'Запчастей в каталоге',
          },
          {
            icon: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`,
            val: 'Открытые цены',
            lbl: 'видны до покупки',
          },
          {
            icon: `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
            val: 'Свой сервис',
            lbl: 'в Усть-Абакане',
          },
          {
            icon: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>`,
            val: 'До 6 мес.',
            lbl: 'гарантия на работы',
          },
        ].map((s, i) => (
          <div key={i} style={{ padding: '22px 16px', textAlign: 'center', borderRight: i < 3 ? '1px solid #F0F2F5' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: s.icon }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0F2744', letterSpacing: -0.5, lineHeight: 1.1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── РАЗДЕЛЫ + КАТЕГОРИИ + БРЕНДЫ ──────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px 0' }}>

        {/* Разделы каталога */}
        <div style={sLabel}>Что мы делаем</div>
        <h2 style={sH2}>Запчасти и сервис для тягачей</h2>
        <p style={sSub}>Специализируемся на тягачах и полуприцепах. Дополнительно — самосвалы и спецтехника.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 52 }}>
          {SECTION_CARDS.map(card => (
            <Link
              key={card.title}
              href={card.href}
              className="hover-section-card"
              style={card.primary ? {
                position: 'relative',
                background: 'linear-gradient(135deg, #0F2744 0%, #1a3a6b 100%)',
                borderRadius: 20,
                padding: 28,
                border: '2px solid #FF6B00',
                boxShadow: '0 8px 28px rgba(15,39,68,0.18)',
                color: 'white',
                textDecoration: 'none',
                display: 'block',
              } : undefined}
            >
              {card.primary && (
                <span style={{
                  position: 'absolute', top: 16, right: 16,
                  fontSize: 10, fontWeight: 800, background: '#FF6B00', color: 'white',
                  padding: '4px 10px', borderRadius: 12, letterSpacing: '0.5px', textTransform: 'uppercase',
                }}>
                  Основное
                </span>
              )}
              <div style={{
                width: 64, height: 64,
                background: card.primary ? 'rgba(255,107,0,0.2)' : '#FFF0E8',
                borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: card.icon }} />
              </div>
              <h3 style={{ fontSize: 21, fontWeight: 700, color: card.primary ? 'white' : '#0F2744', marginBottom: 8 }}>{card.title}</h3>
              <p style={{ color: card.primary ? 'rgba(255,255,255,0.65)' : '#6B7280', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{card.desc}</p>
              <span style={{ color: '#FF6B00', fontSize: 13, fontWeight: 700 }}>{card.cta}</span>
            </Link>
          ))}
        </div>

      </section>

      {/* ── КАК ЗАКАЗАТЬ ──────────────────────────────────────────── */}
      <section style={{ background: 'white', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 6 }}>Просто и быстро</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0F2744', marginBottom: 6, letterSpacing: -0.5 }}>Как сделать заказ</h2>
          <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 40 }}>Четыре простых шага — от поиска до получения</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0, position: 'relative' }}>
            {/* Соединительная линия */}
            <div style={{ position: 'absolute', top: 28, left: '12.5%', right: '12.5%', height: 2, background: 'linear-gradient(90deg, #FF6B00, #FF6B00)', opacity: 0.15, zIndex: 0 }} />

            {[
              {
                num: '1',
                icon: `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
                title: 'Найдите запчасть',
                text: 'Введите ОЕМ-номер в поиск — увидите наличие и цену сразу. Не знаете ОЕМ — позвоните или оставьте заявку, менеджер подберёт по марке, модели и году.',
                cta: { label: 'Поиск по ОЕМ', href: '/search' },
              },
              {
                num: '2',
                icon: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>`,
                title: 'Согласуйте с менеджером',
                text: 'Менеджер свяжется в течение 30 минут: подтвердит наличие, актуальную цену и срок поставки. Подберёт аналог, если оригинал недоступен.',
                cta: { label: 'Позвонить сейчас', href: 'tel:+79232130101', external: true },
              },
              {
                num: '3',
                icon: `<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>`,
                title: 'Оплатите удобным способом',
                text: 'Картой онлайн, наличными при получении или по безналу для юрлиц. Выставим счёт с НДС или без — как вам нужно.',
                cta: { label: 'Реквизиты', href: '/requisites' },
              },
              {
                num: '4',
                icon: `<rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`,
                title: 'Получите запчасть',
                text: 'Самовывоз в Усть-Абакане — бесплатно. Доставка по России — 1–7 дней через СДЭК, Деловые Линии и Почту. Возврат — 14 дней.',
                cta: { label: 'Условия доставки', href: '/delivery' },
              },
            ].map((step, i) => (
              <div key={step.num} style={{
                padding: '32px 28px', position: 'relative', zIndex: 1,
                borderRight: i < 3 ? '1px solid #F0F2F5' : 'none',
              }}>
                {/* Номер-кружок */}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: '#FFF0E8', border: '2px solid #FF6B00',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: step.icon }} />
                </div>
                {/* Номер-бейдж */}
                <div style={{
                  position: 'absolute', top: 28, left: 60,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#FF6B00', color: 'white',
                  fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F2744', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, marginBottom: step.cta ? 20 : 0 }}>{step.text}</p>
                {step.cta && (
                  step.cta.href.startsWith('tel:') ? (
                    <a href={step.cta.href} style={{ fontSize: 13, fontWeight: 700, color: '#FF6B00', textDecoration: 'none' }}>
                      {step.cta.label} →
                    </a>
                  ) : (
                    <Link href={step.cta.href} style={{ fontSize: 13, fontWeight: 700, color: '#FF6B00', textDecoration: 'none' }}>
                      {step.cta.label} →
                    </Link>
                  )
                )}
              </div>
            ))}
          </div>

          {/* CTA-полоска */}
          <div style={{
            marginTop: 40, padding: '20px 28px',
            background: '#F8F9FA', borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2744' }}>Не знаете ОЕМ-номер или нужна консультация?</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>Позвоните — менеджер подберёт деталь по марке, модели и году выпуска</div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="tel:+79232130101" style={{ background: '#FF6B00', color: 'white', padding: '11px 22px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                📞 +7 (923) 213-01-01
              </a>
              <Link href="/search" style={{ background: 'white', color: '#0F2744', border: '1.5px solid #e5e7eb', padding: '11px 22px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Поиск по ОЕМ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ОТЗЫВЫ 2ГИС ───────────────────────────────────────────── */}
      <section style={{ background: '#F8F9FA', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 6 }}>Нам доверяют</div>
              <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0F2744', marginBottom: 6, letterSpacing: -0.5 }}>Отзывы наших клиентов</h2>
              <p style={{ fontSize: 15, color: '#6B7280' }}>Реальные отзывы водителей и автопарков с 2ГИС</p>
            </div>
            <a
              href="https://2gis.ru/abakan/search/70%20%D0%BB%D0%B5%D1%82%20%D0%91%D0%B5%D0%BB%D0%B0%D0%97%D1%83%2051"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 14,
                background: 'white', borderRadius: 14, padding: '14px 22px',
                border: '1.5px solid #e5e7eb', textDecoration: 'none',
                boxShadow: '0 2px 12px rgba(15,39,68,0.06)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: '#0F2744', letterSpacing: -0.5 }}>4.9</span>
                  <div style={{ display: 'flex', gap: 1 }}>
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF6B00" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>из 5 в 2ГИС · 47 отзывов</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#FF6B00', whiteSpace: 'nowrap' }}>
                Смотреть в 2ГИС →
              </span>
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              {
                name: 'Алексей К.',
                role: 'Водитель Volvo FH',
                date: 'апрель 2026',
                stars: 5,
                text: 'Сломался по дороге в Кызыл, пригнал тягач в TruckLine. Цены на запчасти сразу показали в каталоге, стоимость работ озвучили до ремонта — никаких сюрпризов. За день поменяли тормозную систему. Рекомендую.',
              },
              {
                name: 'ИП Никитин',
                role: 'Автопарк из 6 ТС',
                date: 'март 2026',
                stars: 5,
                text: 'Обслуживаем здесь весь парк уже второй год. Цены адекватные, работают по безналу, выставляют счета. Гарантию на работы соблюдают — была пара случаев, переделали без вопросов.',
              },
              {
                name: 'Сергей М.',
                role: 'Scania R-series',
                date: 'февраль 2026',
                stars: 5,
                text: 'Долго искал нормальный сервис по тягачам в Хакасии. Здесь специалисты реально разбираются в Scania, не пытаются «навешать». Запчасти заказывал по ОЕМ — пришли за 4 дня.',
              },
            ].map((r, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 16, padding: '24px 22px',
                border: '1.5px solid #e5e7eb',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF6B00" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: '#374151', margin: 0, flex: 1 }}>«{r.text}»</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 14, borderTop: '1px solid #F0F2F5' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2744' }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{r.role}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{r.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ПОЧЕМУ МЫ ─────────────────────────────────────────────── */}
      <section style={{ background: '#0F2744', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 6 }}>Наши преимущества</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 36, letterSpacing: -0.5 }}>Почему выбирают нас</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {WHY_CARDS.map(item => (
              <div key={item.title} className="hover-why-card">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 14, display: 'block' }} dangerouslySetInnerHTML={{ __html: item.icon }} />
                <h4 style={{ color: 'white', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</h4>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
