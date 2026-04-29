import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import AddToCartButton from '@/components/AddToCartButton'
import StockFilter from '@/components/StockFilter'

interface Props {
  searchParams: Promise<{ category?: string; make?: string; brand?: string; in_stock?: string; q?: string; page?: string }>
}

async function getFilters() {
  const [{ data: categories }, { data: brands }, { data: makes }] = await Promise.all([
    supabaseAdmin.from('categories').select('id,name,slug,parent_id').eq('is_active', true).order('sort_order'),
    supabaseAdmin.from('brands').select('id,name').eq('is_active', true).order('name'),
    supabaseAdmin.from('vehicles').select('make').order('make'),
  ])
  const uniqueMakes = [...new Set((makes ?? []).map(v => v.make))].sort()
  return { categories: categories ?? [], brands: brands ?? [], makes: uniqueMakes }
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
  return {
    products: data ?? [],
    total: count ?? 0,
    page,
    pages: Math.ceil((count ?? 0) / PAGE_SIZE),
  }
}

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams
  const [{ categories, brands, makes }, { products, total, page, pages }] = await Promise.all([
    getFilters(),
    getProducts(params),
  ])

  const buildUrl = (extra: Record<string, string | undefined>) => {
    const p = { ...params, ...extra }
    const qs = Object.entries(p).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join('&')
    return `/catalog${qs ? '?' + qs : ''}`
  }

  const topCategories = categories.filter(c => !c.parent_id)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Фильтры */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4 space-y-6">
            <div>
              <div className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">Категории</div>
              <div className="space-y-1">
                <Link href={buildUrl({ category: undefined, page: undefined })}
                  className={`block px-2 py-1 rounded text-sm hover:text-blue-700 ${!params.category ? 'font-semibold text-blue-700' : 'text-gray-600'}`}>
                  Все категории
                </Link>
                {topCategories.map(cat => (
                  <Link key={cat.id} href={buildUrl({ category: cat.slug, page: undefined })}
                    className={`block px-2 py-1 rounded text-sm hover:text-blue-700 ${params.category === cat.slug ? 'font-semibold text-blue-700 bg-blue-50' : 'text-gray-600'}`}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">Наличие</div>
              <StockFilter
                checked={params.in_stock === '1'}
                href={buildUrl({ in_stock: params.in_stock === '1' ? undefined : '1', page: undefined })}
              />
            </div>

            <div>
              <div className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">Бренд</div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <Link href={buildUrl({ brand: undefined, page: undefined })}
                  className={`block px-2 py-1 rounded text-sm hover:text-blue-700 ${!params.brand ? 'font-semibold text-blue-700' : 'text-gray-600'}`}>
                  Все бренды
                </Link>
                {brands.map(b => (
                  <Link key={b.id} href={buildUrl({ brand: b.name, page: undefined })}
                    className={`block px-2 py-1 rounded text-sm hover:text-blue-700 ${params.brand === b.name ? 'font-semibold text-blue-700 bg-blue-50' : 'text-gray-600'}`}>
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">Марка техники</div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <Link href={buildUrl({ make: undefined, page: undefined })}
                  className={`block px-2 py-1 rounded text-sm hover:text-blue-700 ${!params.make ? 'font-semibold text-blue-700' : 'text-gray-600'}`}>
                  Все марки
                </Link>
                {makes.map(m => (
                  <Link key={m} href={buildUrl({ make: m, page: undefined })}
                    className={`block px-2 py-1 rounded text-sm hover:text-blue-700 ${params.make === m ? 'font-semibold text-blue-700 bg-blue-50' : 'text-gray-600'}`}>
                    {m}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Товары */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-gray-800">
              {params.category ? categories.find(c => c.slug === params.category)?.name : 'Все товары'}
              <span className="text-sm font-normal text-gray-500 ml-2">({total.toLocaleString('ru')} шт.)</span>
            </h1>
            <form method="GET" action="/catalog" className="flex gap-2">
              <input name="q" defaultValue={params.q} placeholder="Поиск по названию..."
                className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-400" />
              <button type="submit" className="bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-800">
                Найти
              </button>
            </form>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-medium">Товары не найдены</div>
              <Link href="/catalog" className="text-blue-600 text-sm mt-2 inline-block hover:underline">Сбросить фильтры</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p: any) => {
                const bestStock = (p.stock ?? []).sort((a: any, b: any) => a.price_sell - b.price_sell)[0]
                const inStock = (p.stock ?? []).some((s: any) => s.in_stock)
                return (
                  <div key={p.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-col">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-36 object-contain mb-3 rounded-lg bg-gray-50" />
                    ) : (
                      <div className="w-full h-36 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-4xl">🔧</div>
                    )}
                    <div className="text-xs text-gray-400 mb-1">{p.article} · {p.brand?.name}</div>
                    <Link href={`/product/${p.id}`} className="text-sm font-medium text-gray-800 hover:text-blue-700 mb-2 line-clamp-2 flex-1">
                      {p.name}
                    </Link>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                      <div>
                        {bestStock ? (
                          <div className="text-lg font-bold text-gray-900">{bestStock.price_sell.toLocaleString('ru')} ₽</div>
                        ) : (
                          <div className="text-sm text-gray-400">Цена по запросу</div>
                        )}
                        <div className={`text-xs mt-0.5 ${inStock ? 'text-green-600' : 'text-orange-500'}`}>
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
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => (
                <Link key={p} href={buildUrl({ page: String(p) })}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition
                    ${p === page ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-blue-50'}`}>
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
