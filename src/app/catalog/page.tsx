import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import AddToCartButton from '@/components/AddToCartButton'
import StockFilter from '@/components/StockFilter'

interface Props {
  searchParams: Promise<{ category?: string; make?: string; brand?: string; in_stock?: string; q?: string; page?: string }>
}

async function getFilters() {
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabaseAdmin.from('categories').select('id,name,slug,parent_id').eq('is_active', true).order('sort_order'),
    supabaseAdmin.from('brands').select('id,name').eq('is_active', true).order('name'),
  ])
  return { categories: categories ?? [], brands: brands ?? [] }
}

async function getProducts(params: Awaited<Props['searchParams']>) {
  const PAGE_SIZE = 24
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const offset = (page - 1) * PAGE_SIZE

  let query = supabaseAdmin
    .from('products')
    .select(`
      id, article, name, unit, image_url,
      brand:brands(id,name),
      category:categories(id,name,slug),
      stock(id,price_sell,quantity,in_stock,delivery_days,supplier:suppliers(id,name,type))
    `, { count: 'exact' })
    .eq('is_active', true)

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,article.ilike.%${params.q}%`)
  }
  if (params.brand) {
    const { data: b } = await supabaseAdmin.from('brands').select('id').ilike('name', params.brand).single()
    if (b) query = query.eq('brand_id', b.id)
  }
  if (params.category) {
    const { data: c } = await supabaseAdmin.from('categories').select('id').eq('slug', params.category).single()
    if (c) query = query.eq('category_id', c.id)
  }
  if (params.in_stock === '1') {
    const { data: stockIds } = await supabaseAdmin.from('stock').select('product_id').eq('in_stock', true)
    const ids = [...new Set((stockIds ?? []).map(s => s.product_id))]
    if (ids.length) query = query.in('id', ids)
    else return { products: [], total: 0, page, pages: 0 }
  }
  if (params.make) {
    const { data: vehicles } = await supabaseAdmin.from('vehicles').select('id').ilike('make', params.make)
    if (vehicles?.length) {
      const vIds = vehicles.map(v => v.id)
      const { data: applic } = await supabaseAdmin.from('applicability').select('product_id').in('vehicle_id', vIds)
      const pIds = [...new Set((applic ?? []).map(a => a.product_id))]
      if (pIds.length) query = query.in('id', pIds)
      else return { products: [], total: 0, page, pages: 0 }
    }
  }

  const { data, count } = await query.order('id').range(offset, offset + PAGE_SIZE - 1)
  return { products: data ?? [], total: count ?? 0, page, pages: Math.ceil((count ?? 0) / PAGE_SIZE) }
}

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams
  const [{ categories, brands }, { products, total, page, pages }] = await Promise.all([
    getFilters(),
    getProducts(params),
  ])

  const buildUrl = (extra: Record<string, string | undefined>) => {
    const p = { ...params, ...extra }
    const qs = Object.entries(p).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join('&')
    return `/catalog${qs ? '?' + qs : ''}`
  }

  const topCategories = categories.filter(c => !c.parent_id)
  const activeCategory = topCategories.find(c => c.slug === params.category)

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh' }}>

      {/* ── ШАПКА СТРАНИЦЫ ─────────────────────────────────────── */}
      <div style={{ background: '#0F2744', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Главная</Link>
            <span>/</span>
            {activeCategory ? (
              <>
                <Link href="/catalog" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Каталог</Link>
                <span>/</span>
                <span style={{ color: 'rgba(255,255,255,0.75)' }}>{activeCategory.name}</span>
              </>
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>Каталог</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>
              {activeCategory ? activeCategory.name : 'Все товары'}
              <span style={{ fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginLeft: 12 }}>
                {total.toLocaleString('ru')} шт.
              </span>
            </h1>
            {/* Поиск */}
            <form method="GET" action="/catalog" style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
              {params.category && <input type="hidden" name="category" value={params.category} />}
              {params.brand && <input type="hidden" name="brand" value={params.brand} />}
              <input name="q" defaultValue={params.q} placeholder="Артикул или название..."
                style={{ border: 'none', background: 'transparent', padding: '10px 16px', fontSize: 14, color: 'white', outline: 'none', width: 240 }} />
              <button type="submit" style={{ background: '#FF6B00', border: 'none', padding: '10px 18px', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Найти
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── КОНТЕНТ ────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px', display: 'flex', gap: 24 }}>

        {/* САЙДБАР */}
        <aside style={{ width: 220, flexShrink: 0, display: 'none' }} className="catalog-sidebar">
          <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'sticky', top: 80 }}>

            {/* Категории */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: '#FF6B00', textTransform: 'uppercase', marginBottom: 12 }}>
                Категории
              </div>
              <Link href={buildUrl({ category: undefined, page: undefined })}
                style={{ display: 'block', padding: '6px 10px', borderRadius: 8, fontSize: 13, fontWeight: !params.category ? 700 : 400, color: !params.category ? '#FF6B00' : '#4B5563', textDecoration: 'none', background: !params.category ? '#FFF0E8' : 'transparent', marginBottom: 2 }}>
                Все категории
              </Link>
              {topCategories.map(cat => (
                <Link key={cat.id} href={buildUrl({ category: cat.slug, page: undefined })}
                  style={{ display: 'block', padding: '6px 10px', borderRadius: 8, fontSize: 13, fontWeight: params.category === cat.slug ? 700 : 400, color: params.category === cat.slug ? '#FF6B00' : '#4B5563', textDecoration: 'none', background: params.category === cat.slug ? '#FFF0E8' : 'transparent', marginBottom: 2 }}>
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Наличие */}
            <div style={{ marginBottom: 24, paddingTop: 16, borderTop: '1px solid #F0F2F5' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: '#FF6B00', textTransform: 'uppercase', marginBottom: 12 }}>
                Наличие
              </div>
              <StockFilter
                checked={params.in_stock === '1'}
                href={buildUrl({ in_stock: params.in_stock === '1' ? undefined : '1', page: undefined })}
              />
            </div>

            {/* Бренд */}
            <div style={{ paddingTop: 16, borderTop: '1px solid #F0F2F5' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: '#FF6B00', textTransform: 'uppercase', marginBottom: 12 }}>
                Бренд
              </div>
              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                <Link href={buildUrl({ brand: undefined, page: undefined })}
                  style={{ display: 'block', padding: '5px 10px', borderRadius: 8, fontSize: 13, fontWeight: !params.brand ? 700 : 400, color: !params.brand ? '#FF6B00' : '#4B5563', textDecoration: 'none', background: !params.brand ? '#FFF0E8' : 'transparent', marginBottom: 2 }}>
                  Все бренды
                </Link>
                {brands.map(b => (
                  <Link key={b.id} href={buildUrl({ brand: b.name, page: undefined })}
                    style={{ display: 'block', padding: '5px 10px', borderRadius: 8, fontSize: 13, fontWeight: params.brand === b.name ? 700 : 400, color: params.brand === b.name ? '#FF6B00' : '#4B5563', textDecoration: 'none', background: params.brand === b.name ? '#FFF0E8' : 'transparent', marginBottom: 2 }}>
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* ТОВАРЫ */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {products.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 20, padding: '64px 24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Товары не найдены</div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>Попробуйте изменить параметры поиска</div>
              <Link href="/catalog" style={{ background: '#FF6B00', color: 'white', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Сбросить фильтры
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {products.map((p: any) => {
                const bestStock = (p.stock ?? []).sort((a: any, b: any) => a.price_sell - b.price_sell)[0]
                const inStock = (p.stock ?? []).some((s: any) => s.in_stock)
                return (
                  <div key={p.id} className="hover-product-card">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'contain', marginBottom: 12, borderRadius: 10, background: '#F9FAFB' }} />
                    ) : (
                      <div style={{ width: '100%', height: 140, background: '#F0F2F5', borderRadius: 10, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>
                      {p.article}{p.brand?.name ? ` · ${p.brand.name}` : ''}
                    </div>
                    <Link href={`/product/${p.id}`} style={{ fontSize: 14, fontWeight: 600, color: '#111827', textDecoration: 'none', lineHeight: 1.4, marginBottom: 12, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                      {p.name}
                    </Link>
                    <div style={{ borderTop: '1px solid #F0F2F5', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div>
                        {bestStock ? (
                          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F2744', letterSpacing: -0.5 }}>
                            {bestStock.price_sell.toLocaleString('ru')} ₽
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: '#9CA3AF' }}>По запросу</div>
                        )}
                        <div style={{ fontSize: 11, marginTop: 2, color: inStock ? '#16A34A' : '#EA580C', fontWeight: 600 }}>
                          {inStock ? '✓ В наличии' : '⏱ Под заказ'}
                        </div>
                      </div>
                      {bestStock && (
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
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Пагинация */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
              {page > 1 && (
                <Link href={buildUrl({ page: String(page - 1) })}
                  style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: 10, fontSize: 14, color: '#374151', textDecoration: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  ‹
                </Link>
              )}
              {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => (
                <Link key={p} href={buildUrl({ page: String(p) })}
                  style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, fontSize: 14, fontWeight: p === page ? 700 : 400, textDecoration: 'none', background: p === page ? '#FF6B00' : 'white', color: p === page ? 'white' : '#374151', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  {p}
                </Link>
              ))}
              {page < pages && (
                <Link href={buildUrl({ page: String(page + 1) })}
                  style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: 10, fontSize: 14, color: '#374151', textDecoration: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  ›
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
