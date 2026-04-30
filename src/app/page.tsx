import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'

// SVG-иконки для категорий по slug
const CAT_ICONS: Record<string, string> = {
  dvigatel: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
  transmissiya: `<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>`,
  'podveska-rulevoe': `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/>`,
  'tormoznaya-sistema': `<circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/><circle cx="12" cy="12" r="4"/>`,
  elektrooborudovanie: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  'toplivnaya-sistema': `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>`,
  'sistema-ohlazhdeniya': `<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>`,
  'vykhlopnaya-sistema': `<path d="M2 12h20"/><circle cx="12" cy="12" r="9"/><path d="M12 3v9"/>`,
  'kuzov-steklo': `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>`,
  filtry: `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`,
  'to-rashkodniki': `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
  gidravlika: `<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>`,
  pnevmatika: `<circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/>`,
}

const DEFAULT_CAT_ICON = `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>`

function CatIcon({ slug, size = 22 }: { slug: string; size?: number }) {
  const path = CAT_ICONS[slug] || DEFAULT_CAT_ICON
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      stroke="#0F2744" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: path }}
    />
  )
}

async function getData() {
  const [
    { count: productCount },
    { data: categories },
    { data: carBrands },
    { data: truckBrands },
  ] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('categories')
      .select('id, name, slug, section')
      .is('parent_id', null)
      .eq('is_active', true)
      .order('sort_order'),
    supabaseAdmin
      .from('brands')
      .select('id, name, country')
      .eq('section', 'cars')
      .eq('is_active', true)
      .order('name')
      .limit(24),
    supabaseAdmin
      .from('brands')
      .select('id, name, country')
      .eq('section', 'special')
      .eq('is_active', true)
      .order('name')
      .limit(20),
  ])
  return {
    productCount: productCount ?? 0,
    categories: categories ?? [],
    carBrands: carBrands ?? [],
    truckBrands: truckBrands ?? [],
  }
}

const sLabel = { fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' as const, marginBottom: 6 }
const sH2    = { fontSize: 30, fontWeight: 800, color: '#0F2744', marginBottom: 6, letterSpacing: -0.5 }
const sSub   = { fontSize: 15, color: '#6B7280', marginBottom: 28 }

export default async function HomePage() {
  const { productCount, categories, carBrands, truckBrands } = await getData()

  const TRUST_PILLS = [
    { icon: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>`, text: 'Оригинал и аналоги' },
    { icon: `<rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`, text: 'Доставка 1–7 дней' },
    { icon: `<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5"/>`, text: 'Возврат 14 дней' },
    { icon: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`, text: 'Менеджер поможет' },
  ]

  const SECTION_CARDS = [
    {
      href: '/cars', title: 'Легковые автомобили',
      desc: 'Toyota, Lada, Kia, Hyundai, Volkswagen, Renault, Nissan и другие марки',
      icon: `<path d="M19 17H5a2 2 0 0 1-2-2v-4l2.5-5h11L19 11v4a2 2 0 0 1-2 2z"/><circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/><line x1="3" y1="11" x2="21" y2="11"/>`,
    },
    {
      href: '/special', title: 'Спецтехника и грузовики',
      desc: 'КамАЗ, МАЗ, Урал, ЯМЗ, Komatsu, Hitachi, JCB, Volvo и другие',
      icon: `<rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`,
    },
  ]

  const WHY_CARDS = [
    { icon: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>`, title: 'Оригинал и аналоги', text: 'Работаем с проверенными поставщиками. Гарантируем качество каждой детали.' },
    { icon: `<rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`, title: 'Быстрая доставка', text: 'Отправляем в день заказа. Доставка по всей России от 1 до 7 дней.' },
    { icon: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`, title: 'Менеджер поможет', text: 'Не знаете артикул? Позвоните — подберём по марке и году выпуска.' },
    { icon: `<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5"/>`, title: 'Возврат 14 дней', text: 'Если деталь не подошла — вернём деньги без лишних вопросов.' },
  ]

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh' }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 480 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, rgba(11,30,53,0.95) 0%, rgba(15,39,68,0.88) 55%, rgba(15,39,68,0.6) 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '64px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
          <div style={{ flex: 1, maxWidth: 620 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,0,0.18)', border: '1px solid rgba(255,107,0,0.4)', color: '#FF8C38', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: '0.5px', marginBottom: 22 }}>
              <span style={{ width: 6, height: 6, background: '#FF6B00', borderRadius: '50%', display: 'inline-block' }} />
              Профессиональный подбор запчастей
            </div>
            <h1 style={{ fontSize: 52, fontWeight: 900, color: 'white', lineHeight: 1.05, marginBottom: 18, letterSpacing: -2 }}>
              Запчасти для<br /><span style={{ color: '#FF6B00' }}>любой техники</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
              КамАЗ, МАЗ, Урал, Toyota, Komatsu и другие.<br />
              {productCount > 0 ? `Более ${productCount.toLocaleString('ru')} позиций в каталоге.` : 'Более 10 000 позиций в наличии.'}
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
              <Link href="/catalog" style={{ background: '#FF6B00', color: 'white', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,107,0,0.4)' }}>
                Перейти в каталог
              </Link>
              <Link href="/search" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
                Подобрать по VIN
              </Link>
            </div>
            <form method="GET" action="/search" style={{ display: 'flex', background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
              <input name="q" placeholder="Артикул, название или кросс-номер..."
                style={{ flex: 1, border: 'none', padding: '15px 18px', fontSize: 14, outline: 'none', color: '#111', minWidth: 0 }} />
              <button type="submit" style={{ background: '#FF6B00', color: 'white', border: 'none', padding: '15px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Найти
              </button>
            </form>
          </div>

          {/* Пиллы доверия */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 220, flexShrink: 0 }}>
            {TRUST_PILLS.map(({ icon, text }) => (
              <div key={text} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12, padding: '11px 16px', color: 'white', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: icon }} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── СТАТИСТИКА ─────────────────────────────────────────────── */}
      <div style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { val: `${productCount > 0 ? productCount.toLocaleString('ru') : '10 000'}+`, lbl: 'Товаров в каталоге' },
          { val: '70+', lbl: 'Марок техники' },
          { val: '1–7 дней', lbl: 'Доставка по РФ' },
          { val: 'Пн–Сб 9–18', lbl: 'Режим работы' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '22px 16px', textAlign: 'center', borderRight: i < 3 ? '1px solid #F0F2F5' : 'none' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#0F2744', letterSpacing: -0.5 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── РАЗДЕЛЫ + КАТЕГОРИИ + БРЕНДЫ ──────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px 0' }}>

        {/* Разделы каталога */}
        <div style={sLabel}>Разделы каталога</div>
        <h2 style={sH2}>Выберите тип техники</h2>
        <p style={sSub}>Широкий ассортимент для любой задачи</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 52 }}>
          {SECTION_CARDS.map(card => (
            <Link key={card.href} href={card.href} className="hover-section-card">
              <div style={{ width: 64, height: 64, background: '#FFF0E8', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: card.icon }} />
              </div>
              <h3 style={{ fontSize: 21, fontWeight: 700, color: '#0F2744', marginBottom: 8 }}>{card.title}</h3>
              <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{card.desc}</p>
              <span style={{ color: '#FF6B00', fontSize: 13, fontWeight: 700 }}>Перейти в каталог →</span>
            </Link>
          ))}
        </div>

        {/* Категории */}
        <div style={sLabel}>Категории</div>
        <h2 style={sH2}>Запчасти по категориям</h2>
        <p style={sSub}>Найдите нужную деталь быстро</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 52 }}>
          {categories.map(cat => (
            <Link key={cat.id} href={`/catalog?category=${cat.slug}`} className="hover-cat-card">
              <div style={{ width: 48, height: 48, background: '#FFF0E8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <CatIcon slug={cat.slug} size={22} />
              </div>
              <span style={{ fontSize: 12, color: '#374151', fontWeight: 600, lineHeight: 1.3, display: 'block', wordBreak: 'break-word' as const }}>{cat.name}</span>
            </Link>
          ))}
        </div>

        {/* Марки легковых */}
        <div style={sLabel}>Легковые автомобили</div>
        <h2 style={sH2}>Марки автомобилей</h2>
        <p style={{ ...sSub, marginBottom: 20 }}>Запчасти для всех популярных марок</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 52 }}>
          {carBrands.map(brand => (
            <Link key={brand.id} href={`/cars?brand=${brand.id}`} className="hover-brand-tag">
              {brand.name}
            </Link>
          ))}
          <Link href="/cars" style={{ background: '#FF6B00', color: 'white', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Все марки →
          </Link>
        </div>

        {/* Марки спецтехники */}
        <div style={sLabel}>Спецтехника и грузовики</div>
        <h2 style={sH2}>Марки спецтехники</h2>
        <p style={{ ...sSub, marginBottom: 20 }}>Отечественная и импортная техника</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 56 }}>
          {truckBrands.map(brand => (
            <Link key={brand.id} href={`/special?brand=${brand.id}`} className="hover-brand-tag">
              {brand.name}
            </Link>
          ))}
          <Link href="/special" style={{ background: '#FF6B00', color: 'white', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Все марки →
          </Link>
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
