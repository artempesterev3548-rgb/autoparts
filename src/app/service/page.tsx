import Link from 'next/link'

export const metadata = {
  title: 'Автосервис для спецтехники — QPart',
  description: 'Техническое обслуживание и ремонт спецтехники: экскаваторы, бульдозеры, погрузчики, краны, самосвалы. Диагностика, ремонт двигателей, гидравлики, КПП.',
}

const SERVICES = [
  {
    icon: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
    title: 'Техническое обслуживание',
    desc: 'Плановое ТО по регламенту производителя. Замена масел, фильтров, технических жидкостей. Ведение сервисной книжки.',
    price: 'от 5 000 ₽',
  },
  {
    icon: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
    title: 'Ремонт двигателя',
    desc: 'Капитальный и текущий ремонт дизельных двигателей. Замена поршневой группы, коленвала, ГБЦ. Турбины и топливная аппаратура.',
    price: 'от 25 000 ₽',
  },
  {
    icon: `<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>`,
    title: 'Ремонт гидравлики',
    desc: 'Диагностика и восстановление гидравлических систем: насосы, гидромоторы, распределители, цилиндры, рукава ВД.',
    price: 'от 8 000 ₽',
  },
  {
    icon: `<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>`,
    title: 'Ремонт КПП и трансмиссии',
    desc: 'Ремонт и замена коробок передач, редукторов, мостов, карданных валов. Работаем с механическими и гидромеханическими КПП.',
    price: 'от 15 000 ₽',
  },
  {
    icon: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    title: 'Электрика и диагностика',
    desc: 'Компьютерная диагностика, ремонт генераторов и стартеров. Восстановление проводки, ремонт панелей управления и контроллеров.',
    price: 'от 3 000 ₽',
  },
  {
    icon: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>`,
    title: 'Тормозная система',
    desc: 'Замена колодок, дисков и барабанов. Ремонт пневматических и гидравлических тормозных систем. Регулировка и прокачка.',
    price: 'от 4 000 ₽',
  },
  {
    icon: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/>`,
    title: 'Ходовая часть',
    desc: 'Ремонт и замена ходовых катков, опорных катков, направляющих колёс гусеничной техники. Ремонт шарнирно-сочленённых рам.',
    price: 'от 10 000 ₽',
  },
  {
    icon: `<rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`,
    title: 'Выездной сервис',
    desc: 'Не нужно гнать машину на базу. Выезжаем на объект — карьер, стройплощадку, склад. Оперативно, без простоев техники.',
    price: 'по запросу',
  },
]

const EQUIPMENT = [
  { name: 'Экскаваторы', icon: '🦾', brands: 'Komatsu, Hitachi, CAT, Hyundai, XCMG' },
  { name: 'Бульдозеры', icon: '🚜', brands: 'Komatsu, CAT, Liebherr, ЧТЗ' },
  { name: 'Погрузчики', icon: '🏗️', brands: 'Hyster, Toyota, Komatsu, Liebherr, XCMG' },
  { name: 'Краны', icon: '🏚️', brands: 'Liebherr, Tadano, Zoomlion, Ивановец' },
  { name: 'Самосвалы', icon: '🚛', brands: 'КамАЗ, МАЗ, Урал, Volvo, SHACMAN' },
  { name: 'Тракторы', icon: '🚛', brands: 'ЧТЗ, Агромаш, John Deere, New Holland' },
  { name: 'Автогрейдеры', icon: '🛤️', brands: 'Komatsu, CAT, ДЗ-98' },
  { name: 'Вилочные погрузчики', icon: '📦', brands: 'Toyota, Hyster, Linde, Komatsu' },
]

const WHY = [
  {
    icon: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>`,
    title: 'Опыт с тяжёлой техникой',
    text: 'Специализируемся исключительно на спецтехнике. Механики с опытом 10+ лет на карьерах и стройках.',
  },
  {
    icon: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
    title: 'Оригинальные запчасти',
    text: 'Используем оригинальные и сертифицированные аналоги. Все детали есть в нашем каталоге с гарантией.',
  },
  {
    icon: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
    title: 'Минимальный простой',
    text: 'Понимаем, что простой техники = убытки. Работаем быстро и приоритизируем срочные заявки.',
  },
  {
    icon: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`,
    title: 'Прозрачная стоимость',
    text: 'Предварительная диагностика бесплатно. Смета согласовывается до начала работ. Никаких скрытых доплат.',
  },
]

const STEPS = [
  { num: '01', title: 'Заявка', text: 'Позвоните или оставьте заявку онлайн. Менеджер свяжется в течение 30 минут.' },
  { num: '02', title: 'Диагностика', text: 'Бесплатная компьютерная и визуальная диагностика. Точный перечень работ.' },
  { num: '03', title: 'Согласование', text: 'Предоставим смету. Все работы начинаются только после вашего одобрения.' },
  { num: '04', title: 'Ремонт', text: 'Квалифицированные механики выполняют работы в срок. Гарантия на всё.' },
]

export default function ServicePage() {
  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 460 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center 35%',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, rgba(11,30,53,0.97) 0%, rgba(15,39,68,0.90) 55%, rgba(15,39,68,0.65) 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '72px 24px 64px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,0,0.18)', border: '1px solid rgba(255,107,0,0.4)', color: '#FF8C38', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: '0.5px', marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, background: '#FF6B00', borderRadius: '50%', display: 'inline-block' }} />
            Сервисный центр QPart
          </div>
          <h1 style={{ fontSize: 50, fontWeight: 900, color: 'white', lineHeight: 1.05, marginBottom: 18, letterSpacing: -2, maxWidth: 720 }}>
            Автосервис<br />
            <span style={{ color: '#FF6B00' }}>для спецтехники</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, lineHeight: 1.7, marginBottom: 36, maxWidth: 560 }}>
            Экскаваторы, бульдозеры, краны, самосвалы и погрузчики.
            ТО, диагностика, ремонт любой сложности. Выезд на объект.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="tel:+70000000000" style={{ background: '#FF6B00', color: 'white', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,107,0,0.4)' }}>
              📞 Позвонить
            </a>
            <a href="#request" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              Оставить заявку
            </a>
          </div>
        </div>

        {/* Плашки статистики поверх Hero */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,107,0,0.95)',
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        }}>
          {[
            { val: '10+', lbl: 'лет опыта' },
            { val: '500+', lbl: 'ремонтов в год' },
            { val: '24/7', lbl: 'выездной сервис' },
            { val: '1 год', lbl: 'гарантия на работы' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '16px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.25)' : 'none' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: -0.5 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── УСЛУГИ ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px 0' }}>
        <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 6 }}>Что мы делаем</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0F2744', marginBottom: 6, letterSpacing: -0.5 }}>Виды работ</h2>
        <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 36 }}>Полный спектр обслуживания и ремонта спецтехники</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 64 }}>
          {SERVICES.map(svc => (
            <div key={svc.title} style={{
              background: 'white', borderRadius: 16, padding: '28px 24px',
              border: '1.5px solid #e5e7eb',
              transition: 'all .2s',
            }}>
              <div style={{ width: 52, height: 52, background: '#FFF0E8', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: svc.icon }} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F2744', marginBottom: 8 }}>{svc.title}</h3>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65, marginBottom: 16 }}>{svc.desc}</p>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#FF6B00' }}>{svc.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ТЕХНИКА С КОТОРОЙ РАБОТАЕМ ────────────────────────── */}
      <section style={{ background: '#0F2744', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 6 }}>Парк оборудования</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: -0.5 }}>Техника, с которой мы работаем</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 36 }}>Обслуживаем любую строительную и промышленную технику</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {EQUIPMENT.map(eq => (
              <div key={eq.name} style={{
                background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 20px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>{eq.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 4 }}>{eq.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{eq.brands}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: 12, color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
            Не нашли свою технику? <a href="tel:+70000000000" style={{ color: '#FF6B00', fontWeight: 700, textDecoration: 'none' }}>Позвоните нам</a> — работаем с любой импортной и отечественной спецтехникой.
          </div>
        </div>
      </section>

      {/* ── КАК МЫ РАБОТАЕМ ─────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 6 }}>Процесс</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0F2744', marginBottom: 6, letterSpacing: -0.5 }}>Как мы работаем</h2>
        <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 40 }}>Прозрачно и без сюрпризов</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0, position: 'relative' }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ padding: '32px 28px', background: 'white', borderRadius: i === 0 ? '16px 0 0 16px' : i === STEPS.length - 1 ? '0 16px 16px 0' : 0, borderRight: i < STEPS.length - 1 ? '1px solid #F0F2F5' : 'none' }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: '#FF6B00', opacity: 0.25, lineHeight: 1, marginBottom: 16, letterSpacing: -2 }}>{step.num}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F2744', marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ПОЧЕМУ МЫ ─────────────────────────────────────────── */}
      <section style={{ background: '#F8F9FA', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 6 }}>Наши преимущества</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0F2744', marginBottom: 36, letterSpacing: -0.5 }}>Почему выбирают нас</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {WHY.map(item => (
              <div key={item.title} style={{ background: 'white', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #e5e7eb' }}>
                <div style={{ width: 48, height: 48, background: '#FFF0E8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: item.icon }} />
                </div>
                <h4 style={{ color: '#0F2744', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</h4>
                <p style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.65 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ЗАПЧАСТИ ────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #0F2744 0%, #1a3a6b 100%)',
          borderRadius: 20, padding: '40px 48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 8 }}>Каталог запчастей</div>
            <h3 style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 10 }}>Нужны запчасти для ремонта?</h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.65, maxWidth: 480 }}>
              Используем только оригинальные и сертифицированные аналоги. Все детали есть в нашем каталоге — подберём нужную по артикулу или VIN.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <Link href="/special" style={{ background: '#FF6B00', color: 'white', padding: '13px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Каталог спецтехники →
            </Link>
            <Link href="/search" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '13px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Поиск по артикулу
            </Link>
          </div>
        </div>
      </section>

      {/* ── ФОРМА ЗАЯВКИ ────────────────────────────────────────── */}
      <section id="request" style={{ background: '#0F2744', padding: '64px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 8 }}>Связаться с нами</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 10, letterSpacing: -0.5 }}>Оставьте заявку</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 36 }}>Перезвоним в течение 30 минут и уточним детали</p>

          <ServiceRequestForm />
        </div>
      </section>

    </div>
  )
}

// Клиентский компонент формы
function ServiceRequestForm() {
  return (
    <form
      action="mailto:info@qpart.store"
      method="get"
      encType="text/plain"
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <input
          name="name"
          placeholder="Ваше имя"
          required
          style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '13px 16px', fontSize: 14, color: 'white', outline: 'none' }}
        />
        <input
          name="phone"
          placeholder="Телефон"
          required
          type="tel"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '13px 16px', fontSize: 14, color: 'white', outline: 'none' }}
        />
      </div>
      <input
        name="equipment"
        placeholder="Тип техники (экскаватор, бульдозер...)"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '13px 16px', fontSize: 14, color: 'white', outline: 'none' }}
      />
      <textarea
        name="description"
        placeholder="Опишите проблему или вид работ..."
        rows={4}
        style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '13px 16px', fontSize: 14, color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
      />
      <button
        type="submit"
        style={{ background: '#FF6B00', color: 'white', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,107,0,0.4)' }}
      >
        Отправить заявку
      </button>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
        Или позвоните напрямую: <a href="tel:+70000000000" style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>+7 (000) 000-00-00</a>
      </p>
    </form>
  )
}
