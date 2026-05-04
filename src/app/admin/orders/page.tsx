import { supabaseAdmin } from '@/lib/supabase'
import OrderCard from './OrderCard'

interface Props {
  searchParams: Promise<{ status?: string; id?: string }>
}

/** Возвращает map: article → { id, name, website } */
async function getSupplierMap(orders: any[]): Promise<Record<string, { id: number; name: string; website: string | null }>> {
  const articles = [...new Set(
    orders.flatMap(o => (o.items ?? []).map((i: any) => i.article).filter(Boolean))
  )] as string[]

  if (!articles.length) return {}

  const [{ data: suppliers }, { data: products }] = await Promise.all([
    supabaseAdmin.from('suppliers').select('id, name, website'),
    supabaseAdmin.from('products').select('id, article').in('article', articles),
  ])

  if (!products?.length) return {}

  const supplierById: Record<number, any> = Object.fromEntries(
    (suppliers ?? []).map(s => [s.id, s])
  )
  const productIds = products.map(p => p.id)
  const { data: stock } = await supabaseAdmin
    .from('stock')
    .select('product_id, supplier_id')
    .in('product_id', productIds)

  const stockByProductId: Record<number, number> = Object.fromEntries(
    (stock ?? []).map(s => [s.product_id, s.supplier_id])
  )
  const productByArticle: Record<string, number> = Object.fromEntries(
    products.map(p => [p.article, p.id])
  )

  const result: Record<string, any> = {}
  for (const article of articles) {
    const pid = productByArticle[article]
    if (!pid) continue
    const sid = stockByProductId[pid]
    if (!sid) continue
    result[article] = supplierById[sid]
  }
  return result
}

const STATUS_LABELS: Record<string, string> = {
  new: '🔴 Новые',
  processing: '🟡 В работе',
  shipped: '🚚 Отправлено',
  delivered: '🟢 Доставлено',
  cancelled: '⚫ Отменённые',
}

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams

  let query = supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)

  const { data: orders } = await query.limit(200)
  const supplierMap = await getSupplierMap(orders ?? [])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Заголовок */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F2744', margin: 0 }}>Заявки</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{(orders ?? []).length} заявок загружено</p>
        </div>
        <a href="/admin" style={{ fontSize: 13, color: '#FF6B00', textDecoration: 'none' }}>← Панель</a>
      </div>

      {/* Фильтры по статусу */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[['', 'Все'], ...Object.entries(STATUS_LABELS)].map(([val, label]) => (
          <a key={val} href={`/admin/orders${val ? `?status=${val}` : ''}`}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              textDecoration: 'none', transition: 'all .2s',
              background: (params.status ?? '') === val ? '#0F2744' : 'white',
              color: (params.status ?? '') === val ? 'white' : '#555',
              border: '1.5px solid',
              borderColor: (params.status ?? '') === val ? '#0F2744' : '#e5e7eb',
            }}>
            {label}
          </a>
        ))}
      </div>

      {/* Список заявок */}
      {(orders ?? []).length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, padding: '64px 24px', textAlign: 'center', color: '#aaa' }}>
          Заявок нет
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(orders ?? []).map((order: any) => (
            <OrderCard
              key={order.id}
              order={order}
              isSelected={String(order.id) === params.id}
              supplierMap={supplierMap}
            />
          ))}
        </div>
      )}
    </div>
  )
}
