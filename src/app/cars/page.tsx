import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'

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
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: CAT_ICONS[slug] || DEFAULT_CAT_ICON }}
    />
  )
}

async function getData() {
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabaseAdmin.from('categories').select('id,name,slug').is('parent_id', null).eq('is_active', true).order('sort_order'),
    supabaseAdmin.from('brands').select('id,name').eq('section', 'cars').eq('is_active', true).order('name'),
  ])
  return { categories: categories ?? [], brands: brands ?? [] }
}

export default async function CarsPage() {
  const { categories, brands } = await getData()

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0B1E35 0%, #0F2744 100%)', padding: '44px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Хлебные крошки */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Главная</Link>
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>Легковые автомобили</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 72, height: 72, background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.25)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17H5a2 2 0 0 1-2-2v-4l2.5-5h11L19 11v4a2 2 0 0 1-2 2z"/>
                <circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/>
                <line x1="3" y1="11" x2="21" y2="11"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: -0.5 }}>
                Запчасти для легковых автомобилей
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>
                Toyota, Lada, Kia, Hyundai, Volkswagen, Renault, Skoda и другие
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>

        {/* ── КАТЕГОРИИ ───────────────────────────────────── */}
        <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 6 }}>
          Категории запчастей
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0F2744', marginBottom: 6, letterSpacing: -0.5 }}>
          Выберите категорию
        </h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
          Найдите нужную деталь по типу
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 52 }}>
          {categories.map(cat => (
            <Link key={cat.id} href={`/catalog?category=${cat.slug}`} className="hover-cat-card">
              <div style={{ width: 48, height: 48, background: '#FFF0E8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <CatIcon slug={cat.slug} size={22} />
              </div>
              <span style={{ fontSize: 12, color: '#374151', fontWeight: 600, lineHeight: 1.3, display: 'block', wordBreak: 'break-word' as const }}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* ── МАРКИ ───────────────────────────────────────── */}
        <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 6 }}>
          Марки автомобилей
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0F2744', marginBottom: 8, letterSpacing: -0.5 }}>
          Выбрать по марке
        </h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
          Запчасти для всех популярных марок легковых автомобилей
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {brands.map(brand => (
            <Link key={brand.id} href={`/catalog?brand=${encodeURIComponent(brand.name)}`} className="hover-brand-tag">
              {brand.name}
            </Link>
          ))}
          <Link href="/catalog" style={{ background: '#FF6B00', color: 'white', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Весь каталог →
          </Link>
        </div>

      </div>
    </div>
  )
}
