'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

type Vehicle = { make: string; model: string; year: string; bodyClass: string; engine: string }
type Product = { id: number; article: string; name: string; image_url: string | null; brand: { name: string } | null; stock: { price_sell: number; in_stock: boolean; delivery_days: number }[] }

const VIN_EXAMPLE = 'KMHD84LF1HU353014'

// Описание позиций VIN для подсветки
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

export default function VinPage() {
  const [vin, setVin] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ vin: string; vehicle: Vehicle; products: Product[]; brandsFound: string[] } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const clean = (v: string) => v.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase().slice(0, 17)

  async function search(vinVal?: string) {
    const v = (vinVal ?? vin).toUpperCase()
    if (v.length !== 17) { setError('VIN должен содержать ровно 17 символов'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const r = await fetch(`/api/vin?vin=${v}`)
      const data = await r.json()
      if (!r.ok) { setError(data.error || 'Ошибка'); return }
      setResult(data)
    } catch { setError('Ошибка сети, попробуйте снова') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh' }}>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0B1E35 0%, #0F2744 100%)', padding: '44px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Главная</Link>
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>Поиск по VIN</span>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="10" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                <line x1="12" y1="12" x2="12" y2="12.01"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: -0.5 }}>
                Поиск запчастей по VIN-номеру
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>
                Введите 17-значный VIN — мы определим марку, модель и год автомобиля и подберём подходящие запчасти
              </p>

              {/* Поле ввода */}
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  ref={inputRef}
                  value={vin}
                  onChange={e => setVin(clean(e.target.value))}
                  onKeyDown={e => e.key === 'Enter' && search()}
                  placeholder="Введите VIN (17 символов)"
                  maxLength={17}
                  style={{
                    flex: 1, padding: '14px 18px', borderRadius: 12, border: '2px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 18, fontFamily: 'monospace',
                    letterSpacing: 2, outline: 'none', backdropFilter: 'blur(10px)',
                  }}
                />
                <button
                  onClick={() => search()}
                  disabled={loading}
                  style={{ padding: '14px 28px', background: '#FF6B00', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, whiteSpace: 'nowrap' }}
                >
                  {loading ? 'Поиск...' : 'Найти'}
                </button>
              </div>

              {/* Счётчик символов */}
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: vin.length === 17 ? '#34D399' : 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                  {vin.length}/17 символов {vin.length === 17 ? '✓' : ''}
                </span>
                <button onClick={() => { setVin(VIN_EXAMPLE); search(VIN_EXAMPLE) }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                  попробовать пример
                </button>
              </div>

              {error && (
                <div style={{ marginTop: 12, padding: '10px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#FCA5A5', fontSize: 14 }}>
                  ⚠ {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Визуализация VIN */}
        {vin.length > 0 && (
          <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Структура VIN</div>
            <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
              <VinChart vin={vin} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
              {VIN_ZONES.map(z => (
                <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6B7280' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: z.color }} />
                  {z.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Результат */}
        {result && (
          <>
            {/* Автомобиль */}
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
                    {result.vehicle.year} {result.vehicle.make} {result.vehicle.model}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                    {result.vehicle.bodyClass && <span style={{ fontSize: 13, color: '#6B7280' }}>🚗 {result.vehicle.bodyClass}</span>}
                    {result.vehicle.engine && <span style={{ fontSize: 13, color: '#6B7280' }}>⚙️ {result.vehicle.engine}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace', textAlign: 'right' }}>
                  {result.vin}
                </div>
              </div>
            </div>

            {/* Товары */}
            {result.products.length > 0 ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Подходящие запчасти</div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F2744' }}>
                    Найдено {result.products.length} позиций для {result.vehicle.make}
                  </h2>
                  {result.brandsFound.length > 0 && (
                    <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                      Марки в каталоге: {result.brandsFound.join(', ')}
                    </p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
                  {result.products.map((p: Product) => {
                    const stock = p.stock?.[0]
                    return (
                      <Link key={p.id} href={`/product/${p.id}`} className="hover-product-card" style={{ textDecoration: 'none' }}>
                        <div style={{ height: 140, background: '#F8FAFC', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, overflow: 'hidden' }}>
                          {p.image_url
                            ? <img src={p.image_url} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            : <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                          }
                        </div>
                        <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 600, marginBottom: 4 }}>{p.brand?.name || ''}</div>
                        <div style={{ fontSize: 13, color: '#374151', fontWeight: 600, lineHeight: 1.3, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.name}
                        </div>
                        {stock ? (
                          <div style={{ marginTop: 'auto' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F2744' }}>{stock.price_sell.toLocaleString('ru-RU')} ₽</div>
                            <div style={{ fontSize: 11, color: stock.in_stock ? '#059669' : '#6B7280', fontWeight: 600, marginTop: 2 }}>
                              {stock.in_stock ? '● В наличии' : `○ Под заказ ${stock.delivery_days} дн.`}
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 'auto' }}>Цена по запросу</div>
                        )}
                      </Link>
                    )
                  })}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Link href={`/catalog?brand=${encodeURIComponent(result.vehicle.make)}`}
                    style={{ display: 'inline-block', padding: '14px 32px', background: '#FF6B00', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                    Все запчасти для {result.vehicle.make} →
                  </Link>
                </div>
              </>
            ) : (
              <div style={{ background: 'white', borderRadius: 16, padding: '40px 24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" style={{ marginBottom: 16 }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                  Автомобиль определён, но запчасти пока не загружены
                </div>
                <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
                  {result.vehicle.make} {result.vehicle.model} — наш каталог пополняется каждые 12 часов
                </p>
                <Link href="/catalog" style={{ display: 'inline-block', padding: '12px 28px', background: '#FF6B00', color: 'white', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>
                  Весь каталог
                </Link>
              </div>
            )}
          </>
        )}

        {/* Инструкция (пустое состояние) */}
        {!result && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { icon: '🔍', title: 'Где найти VIN?', text: 'На лобовом стекле слева снизу, в техническом паспорте, на стойке водительской двери или под капотом' },
              { icon: '🚗', title: 'Какие авто поддерживаются?', text: 'Toyota, Lada, KIA, Hyundai, Volkswagen, Renault, Skoda, BMW, Mercedes и большинство других марок' },
              { icon: '⚡', title: 'Как быстро работает?', text: 'Расшифровка VIN занимает 1–2 секунды. Мы используем официальную базу данных NHTSA' },
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
