import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'

interface Props {
  searchParams: Promise<{ q?: string; vin?: string }>
}

async function searchByArticle(q: string) {
  const term = q.trim().toUpperCase()
  const { data: direct } = await supabaseAdmin
    .from('products')
    .select('id,article,name,brand:brands(name),stock(price_sell,in_stock)')
    .or(`article.ilike.%${term}%,name.ilike.%${q.trim()}%`)
    .eq('is_active', true)
    .limit(30)

  const { data: crosses } = await supabaseAdmin
    .from('cross_numbers')
    .select('product_id,brand,article')
    .ilike('article', `%${term}%`)
    .limit(20)

  const crossIds = [...new Set((crosses ?? []).map(c => c.product_id))]
  let crossProducts: any[] = []
  if (crossIds.length) {
    const { data } = await supabaseAdmin
      .from('products')
      .select('id,article,name,brand:brands(name),stock(price_sell,in_stock)')
      .in('id', crossIds)
      .eq('is_active', true)
    crossProducts = data ?? []
  }

  const all = [...(direct ?? []), ...crossProducts]
  const unique = all.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)
  return unique
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const results = q.length >= 2 ? await searchByArticle(q) : []

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Поиск запчастей</h1>

      <form method="GET" className="flex gap-2 mb-8">
        <input
          name="q"
          defaultValue={q}
          placeholder="Введите артикул, название или кросс-номер..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
        <button type="submit" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition">
          Найти
        </button>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
        <strong>Поиск работает по:</strong> артикулу, названию, кросс-номерам и аналогам
      </div>

      {q.length >= 2 && (
        <>
          <div className="text-sm text-gray-500 mb-4">
            {results.length > 0 ? `Найдено: ${results.length} товаров` : 'Ничего не найдено'}
          </div>

          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map((p: any) => {
                const bestStock = (p.stock ?? []).sort((a: any, b: any) => a.price_sell - b.price_sell)[0]
                const inStock = (p.stock ?? []).some((s: any) => s.in_stock)
                return (
                  <Link key={p.id} href={`/product/${p.id}`}
                    className="flex items-center justify-between bg-white rounded-xl shadow-sm hover:shadow-md transition p-4">
                    <div>
                      <div className="text-xs text-gray-400 font-mono mb-0.5">{p.article} · {(p.brand as any)?.name}</div>
                      <div className="font-medium text-gray-800">{p.name}</div>
                      <div className={`text-xs mt-1 ${inStock ? 'text-green-600' : 'text-orange-500'}`}>
                        {inStock ? '✓ В наличии' : '⏱ Под заказ'}
                      </div>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      {bestStock ? (
                        <div className="text-lg font-bold text-gray-900">{bestStock.price_sell.toLocaleString('ru')} ₽</div>
                      ) : (
                        <div className="text-sm text-gray-400">По запросу</div>
                      )}
                      <div className="text-xs text-blue-600 mt-1">Подробнее →</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-medium text-gray-700">По запросу «{q}» ничего не найдено</div>
              <div className="text-sm text-gray-400 mt-1">Проверьте правильность артикула или обратитесь к менеджеру</div>
              <Link href="/cart" className="inline-block mt-4 bg-blue-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-800">
                Оставить заявку
              </Link>
            </div>
          )}
        </>
      )}

      {!q && (
        <div className="text-center text-gray-400 py-12">
          <div className="text-5xl mb-4">🔩</div>
          <div>Введите артикул или название запчасти</div>
        </div>
      )}
    </div>
  )
}
