'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

// ── Типы ─────────────────────────────────────────────────────────────────────
type Vehicle  = { make: string; model: string; year: string; bodyClass: string; engine: string }
type OurProduct = { id: number; article: string; name: string; image_url: string | null; brand: { name: string } | null; stock: { price_sell: number; in_stock: boolean; delivery_days: number; quantity: number }[] }
type EtsProduct = { article: string; brand: string; name: string; price: number; quantity: number; in_stock: boolean; delivery: number }
type VinResult = { vin: string; vehicle: Vehicle; products: OurProduct[]; brandsFound: string[] }
type OemResult = { query: string; our: OurProduct[]; ets: EtsProduct[]; ets_url: string; ets_connected: boolean }

const VIN_EXAMPLE = 'KMHD84LF1HU353014'

const VIN_ZONES = [
  { label: 'Производитель',  chars: [0,1,2],     color: '#FF6B00' },
  { label: 'Модель',         chars: [3,4,5,6,7], color: '#0F2744' },
  { label: 'Проверочный',    chars: [8],         color: '#6B7280' },
  { label: 'Год',            chars: [9],         color: '#059669' },
  { label: 'Завод',          chars: [10],        color: '#7C3AED' },
  { label: 'Серийный номер', chars: [11,12,13,14,15,16], color: '#2563EB' },
]

function VinChart({ vin }: { vin: string }) {
  const padded = vin.padEnd(17, '_')
  return (
    <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
      {padded.split('').map((ch, i) => {
        const zone = VIN_ZONES.find(z => z.chars.includes(i))
        return (
          <div key={i} style={{ width: 28, height: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: zone ? zone.color + '18' : '#F3F4F6', border: `1.5px solid ${zone?.color || '#D1D5DB'}`, borderRadius: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: zone?.color || '#9CA3AF', fontFamily: 'monospace' }}>{ch === '_' ? '' : ch}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Карточка нашего товара ────────────────────────────────────────────────────
function OurCard({ p }: { p: OurProduct }) {
  const stock = p.stock?.[0]
  return (
    <Link href={`/product/${p.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1.5px solid #F0F2F5', transition: 'box-shadow .2s' }}>
      <div style={{ height: 120, background: '#F8FAFC', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, overflow: 'hidden' }}>
        {p.image_url
          ? <img src={p.image_url} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          : <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        }
      </div>
      <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', marginBottom: 2 }}>{p.article}</div>
      <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 600, marginBottom: 4 }}>{p.brand?.name}</div>
      <div style={{ fontSize: 13, color: '#374151', fontWeight: 600, lineHeight: 1.35, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 8 }}>{p.name}</div>
      {stock ? (
        <>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F2744' }}>{stock.price_sell.toLocaleString('ru-RU')} ₽</div>
          <div style={{ fontSize: 11, fontWeight: 600, marginTop: 3, color: stock.in_stock ? '#059669' : '#6B7280' }}>
            {stock.in_stock ? `● В наличии ${stock.quantity > 0 ? `(${stock.quantity} шт.)` : ''}` : `○ Под заказ ${stock.delivery_days} дн.`}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12, color: '#9CA3AF' }}>Цена по запросу</div>
      )}
    </Link>
  )
}

// ── Карточка ETS Group ────────────────────────────────────────────────────────
function EtsCard({ p }: { p: EtsProduct }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1.5px solid #FFF3E6', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ background: '#FF6B00', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, letterSpacing: 1 }}>ETS</div>
        <span style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace' }}>{p.article}</span>
      </div>
      <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 600, marginBottom: 4 }}>{p.brand}</div>
      <div style={{ fontSize: 13, color: '#374151', fontWeight: 600, lineHeight: 1.35, flex: 1, marginBottom: 10 }}>{p.name}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#0F2744', marginBottom: 3 }}>{p.price.toLocaleString('ru-RU')} ₽</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: p.in_stock ? '#059669' : '#6B7280' }}>
        {p.in_stock ? `● В наличии (${p.quantity} шт.)` : `○ Под заказ ${p.delivery} дн.`}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function VinPage() {
  const [tab, setTab]         = useState<'vin'|'oem'>('vin')
  const [vin, setVin]         = useState('')
  const [oem, setOem]         = useState('')
  const [loading, setLoading] = useState(false)
  const [vinResult, setVinResult] = useState<VinResult | null>(null)
  const [oemResult, setOemResult] = useState<OemResult | null>(null)
  const [error, setError]     = useState('')
  const vinRef = useRef<HTMLInputElement>(null)
  const oemRef = useRef<HTMLInputElement>(null)

  const cleanVin = (v: string) => v.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase().slice(0, 17)

  async function searchVin(vinVal?: string) {
    const v = (vinVal ?? vin).toUpperCase()
    if (v.length !== 17) { setError('VIN должен содержать ровно 17 символов'); return }
    setError(''); setLoading(true); setVinResult(null)
    try {
      const r = await fetch(`/api/vin?vin=${v}`)
      const data = await r.json()
      if (!r.ok) { setError(data.error || 'Ошибка'); return }
      setVinResult(data)
    } catch { setError('Ошибка сети, попробуйте снова') }
    finally { setLoading(false) }
  }

  async function searchOem(oemVal?: string) {
    const q = (oemVal ?? oem).trim()
    if (q.length < 3) { setError('Введите минимум 3 символа'); return }
    setError(''); setLoading(true); setOemResult(null)
    try {
      const r = await fetch(`/api/oem?q=${encodeURIComponent(q)}`)
      const data = await r.json()
      if (!r.ok) { setError(data.error || 'Ошибка'); return }
      setOemResult(data)
    } catch { setError('Ошибка сети, попробуйте снова') }
    finally { setLoading(false) }
  }

  const tabStyle = (active: boolean) => ({
    padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer',
    border: 'none', transition: 'all .2s',
    background: active ? '#FF6B00' : 'rgba(255,255,255,0.1)',
    color: active ? 'white' : 'rgba(255,255,255,0.6)',
  })

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg, #0B1E35 0%, #0F2744 100%)', padding: '44px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Главная</Link>
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>Поиск</span>
          </div>

          {/* Переключатель вкладок */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            <button style={tabStyle(tab === 'vin')} onClick={() => { setTab('vin'); setError(''); }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                По VIN-номеру
              </span>
            </button>
            <button style={tabStyle(tab === 'oem')} onClick={() => { setTab('oem'); setError(''); }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                По OEM / артикулу
              </span>
            </button>
          </div>

          {/* ── VIN вкладка ── */}
          {tab === 'vin' && (
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="10" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  <line x1="12" y1="12" x2="12" y2="12.01"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 6, letterSpacing: -0.5 }}>Поиск по VIN-номеру</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>
                  Введите 17-значный VIN — определим марку, модель, год и подберём запчасти
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input ref={vinRef} value={vin} onChange={e => setVin(cleanVin(e.target.value))}
                    onKeyDown={e => e.key === 'Enter' && searchVin()}
                    placeholder="Введите VIN (17 символов)" maxLength={17}
                    style={{ flex: 1, padding: '14px 18px', borderRadius: 12, border: '2px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 17, fontFamily: 'monospace', letterSpacing: 2, outline: 'none' }}
                  />
                  <button onClick={() => searchVin()} disabled={loading}
                    style={{ padding: '14px 28px', background: '#FF6B00', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                    {loading ? 'Поиск...' : 'Найти'}
                  </button>
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: vin.length === 17 ? '#34D399' : 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                    {vin.length}/17 {vin.length === 17 ? '✓' : ''}
                  </span>
                  <button onClick={() => { setVin(VIN_EXAMPLE); searchVin(VIN_EXAMPLE) }}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                    попробовать пример
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── OEM вкладка ── */}
          {tab === 'oem' && (
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 6, letterSpacing: -0.5 }}>Поиск по OEM / артикулу</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>
                  Введите оригинальный номер детали — найдём в нашем каталоге и у партнёров
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input ref={oemRef} value={oem}
                    onChange={e => setOem(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && searchOem()}
                    placeholder="Например: 740.1002010 или W712/4"
                    style={{ flex: 1, padding: '14px 18px', borderRadius: 12, border: '2px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 17, fontFamily: 'monospace', letterSpacing: 1, outline: 'none' }}
                  />
                  <button onClick={() => searchOem()} disabled={loading}
                    style={{ padding: '14px 28px', background: '#FF6B00', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                    {loading ? 'Поиск...' : 'Найти'}
                  </button>
                </div>
                <p style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  Поиск ведётся в нашем каталоге и у партнёра ETS Group
                </p>
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 16, padding: '10px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#FCA5A5', fontSize: 14 }}>
              ⚠ {error}
            </div>
          )}
        </div>
      </div>

      {/* ── КОНТЕНТ ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* ════ VIN результат ════ */}
        {tab === 'vin' && (
          <>
            {vin.length > 0 && (
              <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Структура VIN</div>
                <div style={{ overflowX: 'auto' }}><VinChart vin={vin} /></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                  {VIN_ZONES.map(z => (
                    <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6B7280' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: z.color }} />{z.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vinResult && (
              <>
                <div style={{ background: 'white', borderRadius: 16, padding: '24px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '2px solid #34D399' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 56, height: 56, background: '#ECFDF5', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 17H5a2 2 0 0 1-2-2v-4l2.5-5h11L19 11v4a2 2 0 0 1-2 2z"/>
                        <circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/>
                        <line x1="3" y1="11" x2="21" y2="11"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: '#059669', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Автомобиль определён</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#0F2744' }}>
                        {vinResult.vehicle.year} {vinResult.vehicle.make} {vinResult.vehicle.model}
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                        {vinResult.vehicle.bodyClass && <span style={{ fontSize: 13, color: '#6B7280' }}>🚗 {vinResult.vehicle.bodyClass}</span>}
                        {vinResult.vehicle.engine && <span style={{ fontSize: 13, color: '#6B7280' }}>⚙️ {vinResult.vehicle.engine}</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace', textAlign: 'right' }}>{vinResult.vin}</div>
                  </div>
                </div>

                {vinResult.products.length > 0 ? (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Подходящие запчасти</div>
                      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F2744' }}>Найдено {vinResult.products.length} позиций</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 24 }}>
                      {vinResult.products.map(p => <OurCard key={p.id} p={p} />)}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Link href={`/catalog?brand=${encodeURIComponent(vinResult.vehicle.make)}`}
                        style={{ display: 'inline-block', padding: '14px 32px', background: '#FF6B00', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                        Все запчасти для {vinResult.vehicle.make} →
                      </Link>
                    </div>
                  </>
                ) : (
                  <div style={{ background: 'white', borderRadius: 16, padding: '40px 24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Запчасти пока не загружены</div>
                    <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>Наш каталог пополняется каждые 4 часа</p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Link href="/catalog" style={{ display: 'inline-block', padding: '12px 28px', background: '#FF6B00', color: 'white', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>
                        Весь каталог
                      </Link>
                      <button onClick={() => setTab('oem')}
                        style={{ display: 'inline-block', padding: '12px 28px', background: 'white', color: '#0F2744', border: '2px solid #E5E7EB', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                        Поиск по артикулу
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {!vinResult && !loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {[
                  { icon: '🔍', title: 'Где найти VIN?', text: 'На лобовом стекле слева снизу, в техпаспорте, на стойке водительской двери или под капотом' },
                  { icon: '🚗', title: 'Какие авто?', text: 'Toyota, LADA, KIA, Hyundai, VW, Renault, BMW, Mercedes, КамАЗ, МАЗ, Урал и большинство других марок' },
                  { icon: '⚡', title: 'Как быстро?', text: 'Расшифровка VIN — 1–2 секунды. Используем официальную базу NHTSA и собственную базу WMI' },
                ].map(item => (
                  <div key={item.title} style={{ background: 'white', borderRadius: 16, padding: '24px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2744', marginBottom: 8 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{item.text}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ════ OEM результат ════ */}
        {tab === 'oem' && oemResult && (
          <>
            {/* Наши товары */}
            {oemResult.our.length > 0 ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#0F2744', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>В нашем каталоге</div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F2744' }}>
                    {oemResult.our.length} позиций по запросу «{oemResult.query}»
                  </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 32 }}>
                  {oemResult.our.map(p => <OurCard key={p.id} p={p} />)}
                </div>
              </>
            ) : (
              <div style={{ background: 'white', borderRadius: 16, padding: '28px 24px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#374151', marginBottom: 6 }}>В нашем каталоге не найдено</div>
                <p style={{ fontSize: 13, color: '#6B7280' }}>Попробуйте другой вариант написания или ищите у партнёра ниже</p>
              </div>
            )}

            {/* ETS Group — живые данные если подключено */}
            {oemResult.ets_connected && oemResult.ets.length > 0 && (
              <>
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>ETS Group — партнёр</div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F2744' }}>
                      {oemResult.ets.length} позиций в наличии
                    </h2>
                  </div>
                  <img src="https://etsgroup.ru/favicon.ico" alt="ETS" width={28} height={28} style={{ borderRadius: 6 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 32 }}>
                  {oemResult.ets.map((p, i) => <EtsCard key={i} p={p} />)}
                </div>
              </>
            )}

            {/* ETS Group — редирект-блок (всегда показываем) */}
            <div style={{ background: 'linear-gradient(135deg, #0F2744, #1a3560)', borderRadius: 20, padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Партнёрская площадка</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 6 }}>ETS Group</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 0 }}>
                  Расширенный каталог запчастей с наличием на складе. Поиск по артикулу «{oemResult.query}».
                </p>
                {!oemResult.ets_connected && (
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
                    Для отображения цен ETS Group прямо здесь — подключите B2B API (ETS_ACCESS_TOKEN в .env)
                  </p>
                )}
              </div>
              <a href={oemResult.ets_url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px', background: '#FF6B00', color: 'white', borderRadius: 14, fontWeight: 700, fontSize: 15, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Искать на ETS Group
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </>
        )}

        {/* OEM — пустое состояние */}
        {tab === 'oem' && !oemResult && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { icon: '🔢', title: 'Что такое OEM номер?', text: 'Оригинальный каталожный номер детали от производителя автомобиля. Обычно указан на упаковке или в каталоге' },
              { icon: '🔍', title: 'Форматы поиска', text: 'Поиск работает с любым форматом: 740.1002010, 7401002010, W712/4 — пробелы и тире не важны' },
              { icon: '🤝', title: 'Партнёр ETS Group', text: 'Если товара нет у нас — система автоматически проверяет наличие у партнёра ETS Group и показывает результаты' },
            ].map(item => (
              <div key={item.title} style={{ background: 'white', borderRadius: 16, padding: '24px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2744', marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{item.text}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
