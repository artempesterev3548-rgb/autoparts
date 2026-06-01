import Link from 'next/link'
import Map2GIS from '@/components/Map2GIS'
import ServiceRequestForm from './ServiceRequestForm'

export const metadata = {
  title: 'Автосервис для тягачей и полуприцепов — TruckLine',
  description: 'Специализированный сервис для тягачей, полуприцепов, самосвалов и спецтехники в Абакане. ТО, ремонт двигателей, КПП, ходовой, тормозов. Цены на запчасти — открыто в каталоге.',
}

const SERVICES = [
  {
    icon: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
    title: 'ТО тягачей и полуприцепов',
    desc: 'Плановое обслуживание по регламенту производителя. Замена масел, фильтров, тормозных колодок. Проверка сцепного устройства и пневматики п/п.',
    price: 'от 6 000 ₽',
  },
  {
    icon: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
    title: 'Ремонт двигателя',
    desc: 'Капитальный и текущий ремонт дизельных двигателей Volvo, Scania, DAF, Mercedes, КамАЗ и другие. Турбины, топливная аппаратура, ГБЦ, поршневая группа.',
    price: 'от 30 000 ₽',
  },
  {
    icon: `<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>`,
    title: 'Ремонт КПП и трансмиссии',
    desc: 'Ремонт и замена механических и автоматических КПП: ZF, Fuller, Eaton, КПП КамАЗ. Карданные валы, мосты, редукторы тягачей.',
    price: 'от 20 000 ₽',
  },
  {
    icon: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/>`,
    title: 'Ходовая и рулевое',
    desc: 'Ремонт подвески, замена ступичных подшипников, шкворней, рулевых тяг. Регулировка углов развал/схождение для грузовых автомобилей.',
    price: 'от 8 000 ₽',
  },
  {
    icon: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>`,
    title: 'Тормозная система',
    desc: 'Ремонт пневматической тормозной системы тягачей: тормозные камеры, энергоаккумуляторы, ABS/EBS. Замена колодок, дисков, барабанов.',
    price: 'от 5 000 ₽',
  },
  {
    icon: `<rect x="2" y="8" width="20" height="8" rx="1"/><line x1="2" y1="12" x2="22" y2="12"/><circle cx="5" cy="18" r="2"/><circle cx="11" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><circle cx="22" cy="18" r="2"/><line x1="3" y1="8" x2="1" y2="6"/>`,
    title: 'Ремонт полуприцепов',
    desc: 'Ремонт рамы, осей, тормозной системы п/п. Замена сцепного устройства (ССУ) тягача. Обслуживание рефрижераторных и тентованных п/п.',
    price: 'от 4 000 ₽',
  },
  {
    icon: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    title: 'Электрика и диагностика',
    desc: 'Компьютерная диагностика Euro Truck, считывание и сброс ошибок. Ремонт генераторов, стартеров, блоков управления тягачей.',
    price: 'от 3 000 ₽',
  },
]

// Основная специализация
const EQUIPMENT_PRIMARY = [
  {
    name: 'Седельные тягачи',
    icon: `<path d="M3 17V11l2-3h4l2 2v7"/>
<line x1="5" y1="8" x2="5" y2="11"/>
<line x1="11" y1="17" x2="21" y2="17"/>
<line x1="15" y1="15" x2="20" y2="15"/>
<circle cx="6" cy="19" r="2"/>
<circle cx="14" cy="19" r="1.7"/>
<circle cx="18" cy="19" r="1.7"/>`,
    brands: 'Volvo, Scania, DAF, Mercedes, КамАЗ и другие',
    primary: true,
  },
  {
    name: 'Полуприцепы',
    icon: `<rect x="2" y="8" width="20" height="8" rx="1"/>
<line x1="2" y1="11" x2="22" y2="11"/>
<circle cx="6" cy="18" r="2"/>
<circle cx="12" cy="18" r="2"/>
<circle cx="18" cy="18" r="2"/>
<circle cx="22" cy="18" r="2"/>
<line x1="2" y1="8" x2="1" y2="6"/>`,
    brands: 'Schmitz Cargobull, Krone, Wielton, Bodex, Kögel',
    primary: true,
  },
]

// Дополнительно
const EQUIPMENT_SECONDARY = [
  {
    name: 'Грузовики',
    icon: `<rect x="1" y="10" width="7" height="9" rx="1"/>
<rect x="2" y="7" width="5" height="3"/>
<rect x="8" y="8" width="14" height="11" rx="1"/>
<line x1="8" y1="13" x2="22" y2="13"/>
<circle cx="4" cy="21" r="2"/>
<circle cx="13" cy="21" r="2"/>
<circle cx="20" cy="21" r="2"/>`,
    brands: 'Volvo, Scania, DAF, Mercedes, КамАЗ и другие',
  },
  {
    name: 'Самосвалы',
    icon: `<path d="M2 17V12l2-2h3l1 1v6"/>
<line x1="3" y1="11" x2="7" y2="11"/>
<path d="M9 17V9l13-3v8"/>
<line x1="9" y1="11" x2="22" y2="11"/>
<circle cx="5" cy="19" r="2"/>
<circle cx="14" cy="19" r="1.7"/>
<circle cx="18" cy="19" r="1.7"/>`,
    brands: 'КамАЗ, Volvo, SHACMAN, FAW и другие',
  },
  {
    name: 'Спецтехника',
    icon: `<rect x="1" y="13" width="8" height="6" rx="1"/>
<rect x="2" y="10" width="5" height="3"/>
<path d="M9 11 L16 7 L21 9 L19 15 L9 15"/>
<circle cx="4" cy="21" r="2"/>
<circle cx="14" cy="21" r="2"/>`,
    brands: 'Крупные мировые и российские производители',
  },
]

const WHY = [
  {
    icon: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`,
    title: 'Цены на запчасти — открыто',
    text: 'Все запчасти есть в нашем каталоге с реальными ценами. Вы видите стоимость детали до начала ремонта — никаких сюрпризов в счёте.',
  },
  {
    icon: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>`,
    title: 'Стоимость работ — до начала',
    text: 'После диагностики менеджер называет ориентировочную стоимость работ. Подтверждаете — начинаем. Без скрытых доплат и согласований постфактум.',
  },
  {
    icon: `<path d="M3 17V11l2-3h4l2 2v7"/><line x1="5" y1="8" x2="5" y2="11"/><line x1="11" y1="17" x2="21" y2="17"/><line x1="15" y1="15" x2="20" y2="15"/><circle cx="6" cy="19" r="2"/><circle cx="14" cy="19" r="1.7"/><circle cx="18" cy="19" r="1.7"/>`,
    title: 'Специализация — тягачи и п/п',
    text: 'Знаем конструкцию Volvo, Scania, DAF, Mercedes и КамАЗ досконально. Не берёмся за то, в чём неуверены — лучше честно скажем.',
  },
]

const STEPS = [
  { num: '01', title: 'Звонок или заявка', text: 'Позвоните или заполните форму. Менеджер уточнит симптомы и запишет на удобное время.' },
  { num: '02', title: 'Диагностика', text: 'Компьютерная и визуальная диагностика. Определяем точную причину неисправности и стоимость работ.' },
  { num: '03', title: 'Смета и согласование', text: 'Называем стоимость запчастей (цены в каталоге) и работ. Начинаем только после вашего «Да».' },
  { num: '04', title: 'Ремонт и выдача', text: 'Выполняем работы в срок. Гарантия на запчасти и работы. Выдаём технику с документами.' },
]

export default function ServicePage() {
  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 640px) {
          .svc-hero-content { padding: 40px 16px 110px !important; }
          .svc-hero-title { font-size: 28px !important; letter-spacing: -1px !important; max-width: 100% !important; }
          .svc-stats-bar { grid-template-columns: repeat(2,1fr) !important; }
          .svc-location-grid { grid-template-columns: 1fr !important; }
          .svc-cta-inner { padding: 24px 20px !important; flex-direction: column !important; align-items: flex-start !important; }
          .svc-steps-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
          .svc-step { border-radius: 16px !important; border-right: none !important; }
          .svc-form-grid { grid-template-columns: 1fr !important; }
          .svc-utp-row { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .svc-utp-row a { margin-left: 0 !important; }
        }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 460 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, rgba(11,30,53,0.97) 0%, rgba(15,39,68,0.90) 55%, rgba(15,39,68,0.65) 100%)',
        }} />
        <div className="svc-hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '72px 24px 136px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,0,0.18)', border: '1px solid rgba(255,107,0,0.4)', color: '#FF8C38', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: '0.5px', marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, background: '#FF6B00', borderRadius: '50%', display: 'inline-block' }} />
            TruckLine Автосервис · Усть-Абакан
          </div>
          <h1 className="svc-hero-title" style={{ fontSize: 50, fontWeight: 900, color: 'white', lineHeight: 1.05, marginBottom: 18, letterSpacing: -2, maxWidth: 720 }}>
            Сервис тягачей<br />
            <span style={{ color: '#FF6B00' }}>и полуприцепов</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, lineHeight: 1.7, marginBottom: 12, maxWidth: 580 }}>
            Специализируемся на тягачах, полуприцепах, самосвалах и спецтехнике.
          </p>
          <p style={{ color: 'rgba(255,107,0,0.85)', fontSize: 15, fontWeight: 600, marginBottom: 36 }}>
            Цены на запчасти — открыто в каталоге. Стоимость работ — до начала ремонта.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="tel:+79232130101" style={{ background: '#FF6B00', color: 'white', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,107,0,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Позвонить
            </a>
            <a href="#request" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              Оставить заявку
            </a>
            <a href="#location" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 28px', borderRadius: 10, fontWeight: 500, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Усть-Абакан, адрес
            </a>
          </div>
        </div>

        <div className="svc-stats-bar" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,107,0,0.95)', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
          {[
            { val: 'Тягачи и п/п', lbl: 'специализация' },
            { val: 'Открытые цены', lbl: 'на запчасти и работы' },
            { val: 'До 6 месяцев', lbl: 'гарантия на работы' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '16px', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.25)' : 'none' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'white', letterSpacing: -0.3 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ГЛАВНОЕ УТП ─────────────────────────────────────────── */}
      <section style={{ background: 'white', borderBottom: '1px solid #f0f2f5' }}>
        <div className="svc-utp-row" style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0F2744' }}>Прозрачные цены:</span>
          <span style={{ fontSize: 14, color: '#555' }}>стоимость запчастей видна в каталоге заранее,</span>
          <span style={{ fontSize: 14, color: '#555' }}>стоимость работ менеджер называет до начала ремонта.</span>
          <Link href="/special" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: '#FF6B00', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Смотреть каталог запчастей →
          </Link>
        </div>
      </section>

      {/* ── УСЛУГИ ──────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px 0' }}>
        <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 6 }}>Что мы делаем</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0F2744', marginBottom: 6, letterSpacing: -0.5 }}>Виды работ</h2>
        <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 36 }}>Специализация — тягачи, полуприцепы, самосвалы и спецтехника.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 64 }}>
          {SERVICES.map(svc => (
            <div key={svc.title} style={{ background: 'white', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #e5e7eb' }}>
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

      {/* ── ТЕХНИКА ─────────────────────────────────────────────── */}
      <section style={{ background: '#0F2744', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 6 }}>Специализация и доп. направления</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: -0.5 }}>Техника, с которой мы работаем</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>Основная специализация — тягачи и полуприцепы</p>

          {/* Основная специализация */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12, marginBottom: 20 }}>
            {EQUIPMENT_PRIMARY.map(eq => (
              <div key={eq.name} style={{
                background: 'rgba(255,107,0,0.12)', borderRadius: 14, padding: '20px 24px',
                border: '1px solid rgba(255,107,0,0.35)',
                display: 'flex', alignItems: 'flex-start', gap: 16,
              }}>
                <div style={{ width: 48, height: 48, background: 'rgba(255,107,0,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: eq.icon }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{eq.name}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, background: '#FF6B00', color: 'white', padding: '2px 8px', borderRadius: 10, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Основное</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{eq.brands}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Дополнительно */}
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>Дополнительно</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {EQUIPMENT_SECONDARY.map(eq => (
              <div key={eq.name} style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 18px',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <div style={{ width: 38, height: 38, background: 'rgba(255,107,0,0.1)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: eq.icon }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 3 }}>{eq.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{eq.brands}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ПОЧЕМУ МЫ ───────────────────────────────────────────── */}
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

      {/* ── КАК МЫ РАБОТАЕМ ─────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 6 }}>Процесс</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0F2744', marginBottom: 6, letterSpacing: -0.5 }}>Как мы работаем</h2>
        <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 40 }}>Прозрачно и без сюрпризов — от звонка до выдачи</p>
        <div className="svc-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0 }}>
          {STEPS.map((step, i) => (
            <div key={step.num} className="svc-step" style={{ padding: '32px 28px', background: 'white', borderRadius: i === 0 ? '16px 0 0 16px' : i === STEPS.length - 1 ? '0 16px 16px 0' : 0, borderRight: i < STEPS.length - 1 ? '1px solid #F0F2F5' : 'none' }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: '#FF6B00', opacity: 0.25, lineHeight: 1, marginBottom: 16, letterSpacing: -2 }}>{step.num}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F2744', marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── КАТАЛОГ ЗАПЧАСТЕЙ ───────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 56px' }}>
        <div className="svc-cta-inner" style={{
          background: 'linear-gradient(135deg, #0F2744 0%, #1a3a6b 100%)',
          borderRadius: 20, padding: '40px 48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 8 }}>Прозрачные цены</div>
            <h3 style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 10 }}>Цены на запчасти — в открытом каталоге</h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7, maxWidth: 500 }}>
              Перед ремонтом вы можете сами посмотреть стоимость нужных деталей в нашем каталоге. Никаких накруток «за воздух» — цена запчасти та же, что в каталоге.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
            <Link href="/special" style={{ background: '#FF6B00', color: 'white', padding: '13px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Каталог для тягачей →
            </Link>
            <Link href="/search" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '13px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Поиск по ОЕМ
            </Link>
          </div>
        </div>
      </section>

      {/* ── АДРЕС И КАРТА ───────────────────────────────────────── */}
      <section id="location" style={{ background: 'white', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 6 }}>Где мы находимся</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0F2744', marginBottom: 6, letterSpacing: -0.5 }}>Как нас найти</h2>
          <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 36 }}>Усть-Абаканский р-н, ул. 70 лет БелАЗу, 51 стр1 — работаем только в своём помещении, без выездов</p>

          <div className="svc-location-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 32, alignItems: 'start' }}>
            {/* Контактный блок */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ background: '#F8F9FA', borderRadius: 14, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, background: '#FFF0E8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Адрес</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2744' }}>ул. 70 лет БелАЗу, 51 стр1</div>
                      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>655017, Усть-Абаканский р-н, Республика Хакасия</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#F8F9FA', borderRadius: 14, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, background: '#FFF0E8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Телефон</div>
                      <a href="tel:+79232130101" style={{ fontSize: 17, fontWeight: 700, color: '#0F2744', textDecoration: 'none' }}>+7 (923) 213-01-01</a>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#F8F9FA', borderRadius: 14, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, background: '#FFF0E8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Режим работы</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2744' }}>Пн–Пт 8:00–19:00</div>
                      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Сб–Вс 9:00–17:00</div>
                    </div>
                  </div>
                </div>

                <a href="tel:+79232130101" style={{ background: '#FF6B00', color: 'white', padding: '14px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none', textAlign: 'center', boxShadow: '0 4px 16px rgba(255,107,0,0.35)' }}>
                  Позвонить нам
                </a>
              </div>
            </div>

            {/* Карта 2ГИС */}
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', border: '1.5px solid #e5e7eb' }}>
              <div style={{ width: '100%', height: 340, position: 'relative' }}>
                <Map2GIS />
              </div>
              <div style={{ padding: '12px 16px', background: '#F8F9FA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>Усть-Абакан · ул. 70 лет БелАЗу, 51 стр1</span>
                <a
                  href="https://2gis.ru/abakan/search/70%20%D0%BB%D0%B5%D1%82%20%D0%91%D0%B5%D0%BB%D0%B0%D0%97%D1%83%2051"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: '#FF6B00', fontWeight: 600, textDecoration: 'none' }}
                >
                  Открыть в 2ГИС →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ФОРМА ЗАЯВКИ ────────────────────────────────────────── */}
      <section id="request" style={{ background: '#0F2744', padding: '64px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 8 }}>Записаться на сервис</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 10, letterSpacing: -0.5 }}>Оставьте заявку</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 36 }}>Перезвоним в течение 30 минут, согласуем время и ответим на вопросы по стоимости</p>
          <ServiceRequestForm />
        </div>
      </section>

    </div>
  )
}

