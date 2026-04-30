import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import AddToCartButton from '@/components/AddToCartButton'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: p } = await supabaseAdmin
    .from('products')
    .select(`
      id, article, name, description, image_url, unit, weight_kg,
      brand:brands(id,name),
      category:categories(id,name,slug,parent_id),
      stock(id,price_sell,price_buy,quantity,in_stock,delivery_days,supplier:suppliers(id,name,type)),
      cross_numbers(id,brand,article),
      applicability(id,notes,vehicle:vehicles(id,make,model,modification,year_from,year_to,engine))
    `)
    .eq('id', id)
    .single()

  if (!p) notFound()

  const stocks = (p.stock ?? []).sort((a: any, b: any) => a.price_sell - b.price_sell)
  const bestStock = stocks[0]
  const inStock = stocks.some((s: any) => s.in_stock)

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh' }}>

      {/* Хлебные крошки */}
      <div style={{ background: '#0F2744', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Главная</Link>
          <span>/</span>
          <Link href="/catalog" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Каталог</Link>
          {p.category && (
            <>
              <span>/</span>
              <Link href={`/catalog?category=${(p.category as any).slug}`} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
                {(p.category as any).name}
              </Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{p.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 2px 20px rgba(0,0,0,0.08)', padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>

            {/* ── ФОТО ─────────────────────────────────────── */}
            <div>
              {p.image_url ? (
                <img src={p.image_url} alt={p.name}
                  style={{ width: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 16, background: '#F9FAFB', padding: 16 }} />
              ) : (
                <div style={{ width: '100%', height: 320, background: '#F0F2F5', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* ── ИНФОРМАЦИЯ ───────────────────────────────── */}
            <div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>
                Артикул: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#374151' }}>{p.article}</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F2744', marginBottom: 14, letterSpacing: -0.5, lineHeight: 1.2 }}>
                {p.name}
              </h1>

              {/* Теги */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {(p.brand as any)?.name && (
                  <span style={{ background: '#FFF0E8', color: '#FF6B00', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {(p.brand as any).name}
                  </span>
                )}
                {(p.category as any)?.name && (
                  <span style={{ background: '#F0F2F5', color: '#6B7280', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {(p.category as any).name}
                  </span>
                )}
              </div>

              {/* Цена и наличие */}
              {bestStock ? (
                <div style={{ border: '2px solid #F0F2F5', borderRadius: 16, padding: '20px', marginBottom: 20 }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#0F2744', letterSpacing: -1, marginBottom: 4 }}>
                    {bestStock.price_sell.toLocaleString('ru')} ₽
                    <span style={{ fontSize: 16, fontWeight: 500, color: '#9CA3AF', marginLeft: 6 }}>/ {p.unit}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: inStock ? '#16A34A' : '#EA580C' }}>
                    {inStock ? '✓ В наличии' : `⏱ Под заказ · ${bestStock.delivery_days} дн.`}
                  </div>
                  <AddToCartButton product={{
                    product_id: p.id,
                    article: p.article,
                    name: p.name,
                    price: bestStock.price_sell,
                    quantity: 1,
                    unit: p.unit,
                    in_stock: inStock,
                    delivery_days: bestStock.delivery_days,
                  }} />
                </div>
              ) : (
                <div style={{ border: '2px solid #F0F2F5', borderRadius: 16, padding: '20px', marginBottom: 20, color: '#9CA3AF', fontSize: 14 }}>
                  Цена по запросу — позвоните нам
                </div>
              )}

              {/* Характеристики */}
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <tbody>
                  {([
                    ['Единица измерения', p.unit],
                    ['Вес', p.weight_kg ? `${p.weight_kg} кг` : null],
                  ] as [string, string | null][]).filter(([, v]) => v).map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid #F0F2F5' }}>
                      <td style={{ padding: '10px 0', color: '#6B7280', width: '40%' }}>{k}</td>
                      <td style={{ padding: '10px 0', fontWeight: 600, color: '#374151' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── ОПИСАНИЕ ─────────────────────────────────────────── */}
          {p.description && (
            <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid #F0F2F5' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F2744', marginBottom: 12 }}>Описание</h2>
              <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7 }}>{p.description}</p>
            </div>
          )}

          {/* ── АНАЛОГИ / КРОСС-НОМЕРА ───────────────────────────── */}
          {(p.cross_numbers as any[])?.length > 0 && (
            <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid #F0F2F5' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F2744', marginBottom: 14 }}>Аналоги и кросс-номера</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(p.cross_numbers as any[]).map((c: any) => (
                  <span key={c.id} style={{ background: '#F0F2F5', color: '#374151', padding: '6px 14px', borderRadius: 10, fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>
                    {c.brand}: {c.article}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── ПРИМЕНИМОСТЬ ─────────────────────────────────────── */}
          {(p.applicability as any[])?.length > 0 && (
            <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid #F0F2F5' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F2744', marginBottom: 14 }}>Применимость</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                {(p.applicability as any[]).map((a: any) => (
                  <div key={a.id} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '12px 16px', fontSize: 13 }}>
                    <span style={{ fontWeight: 700, color: '#0F2744' }}>{a.vehicle?.make} {a.vehicle?.model}</span>
                    {a.vehicle?.modification && <span style={{ color: '#6B7280' }}> · {a.vehicle.modification}</span>}
                    {a.vehicle?.year_from && (
                      <span style={{ color: '#9CA3AF', marginLeft: 4 }}>
                        ({a.vehicle.year_from}–{a.vehicle.year_to ?? 'н.в.'})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ВСЕ ПОСТАВЩИКИ ───────────────────────────────────── */}
          {stocks.length > 1 && (
            <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid #F0F2F5' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F2744', marginBottom: 14 }}>Наличие у поставщиков</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stocks.map((s: any) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '12px 16px', fontSize: 13 }}>
                    <span style={{ color: '#374151', fontWeight: 500 }}>{s.supplier?.name}</span>
                    <span style={{ fontWeight: 700, color: s.in_stock ? '#16A34A' : '#EA580C' }}>
                      {s.in_stock ? `✓ ${s.quantity} шт.` : `⏱ ${s.delivery_days} дн.`}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#0F2744' }}>{s.price_sell.toLocaleString('ru')} ₽</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
