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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-sm text-gray-400 mb-4">
        <a href="/catalog" className="hover:text-blue-600">Каталог</a>
        {p.category && <> / <a href={`/catalog?category=${(p.category as any).slug}`} className="hover:text-blue-600">{(p.category as any).name}</a></>}
        {' / '}{p.name}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Фото */}
          <div>
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} className="w-full rounded-xl object-contain max-h-80 bg-gray-50" />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-7xl">🔧</div>
            )}
          </div>

          {/* Инфо */}
          <div>
            <div className="text-sm text-gray-400 mb-1">Артикул: <span className="font-mono font-semibold text-gray-700">{p.article}</span></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{p.name}</h1>
            <div className="flex gap-3 mb-4 text-sm">
              {(p.brand as any)?.name && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{(p.brand as any).name}</span>}
              {(p.category as any)?.name && <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">{(p.category as any).name}</span>}
            </div>

            {/* Цена и наличие */}
            {bestStock ? (
              <div className="border rounded-xl p-4 mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {bestStock.price_sell.toLocaleString('ru')} ₽ / {p.unit}
                </div>
                <div className={`text-sm font-medium mb-3 ${inStock ? 'text-green-600' : 'text-orange-500'}`}>
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
              <div className="border rounded-xl p-4 mb-4 text-gray-400">Цена по запросу</div>
            )}

            {/* Характеристики */}
            <table className="w-full text-sm">
              <tbody>
                {[
                  ['Единица', p.unit],
                  ['Вес', p.weight_kg ? `${p.weight_kg} кг` : null],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <tr key={k} className="border-b last:border-0">
                    <td className="py-1.5 text-gray-500 w-32">{k}</td>
                    <td className="py-1.5 font-medium">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Описание */}
        {p.description && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="font-semibold text-gray-800 mb-2">Описание</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{p.description}</p>
          </div>
        )}

        {/* Кросс-номера */}
        {(p.cross_numbers as any[])?.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="font-semibold text-gray-800 mb-2">Аналоги и кросс-номера</h2>
            <div className="flex flex-wrap gap-2">
              {(p.cross_numbers as any[]).map((c: any) => (
                <span key={c.id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-mono">
                  {c.brand}: {c.article}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Применимость */}
        {(p.applicability as any[])?.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="font-semibold text-gray-800 mb-3">Применимость</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {(p.applicability as any[]).map((a: any) => (
                <div key={a.id} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span className="font-medium">{a.vehicle?.make} {a.vehicle?.model}</span>
                  {a.vehicle?.modification && <span className="text-gray-500"> · {a.vehicle.modification}</span>}
                  {a.vehicle?.year_from && (
                    <span className="text-gray-400 ml-1">
                      ({a.vehicle.year_from}–{a.vehicle.year_to ?? 'н.в.'})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Все поставщики */}
        {stocks.length > 1 && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="font-semibold text-gray-800 mb-3">Наличие у поставщиков</h2>
            <div className="space-y-2">
              {stocks.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span className="text-gray-700">{s.supplier?.name}</span>
                  <span className={s.in_stock ? 'text-green-600' : 'text-orange-500'}>
                    {s.in_stock ? `✓ ${s.quantity} шт.` : `⏱ ${s.delivery_days} дн.`}
                  </span>
                  <span className="font-semibold">{s.price_sell.toLocaleString('ru')} ₽</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
