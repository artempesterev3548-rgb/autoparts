import { supabaseAdmin } from '@/lib/supabase'
import OrderCard from './OrderCard'

interface Props {
  searchParams: Promise<{ status?: string; id?: string }>
}

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams

  let query = supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)

  const { data: orders } = await query.limit(100)

  const selected = params.id
    ? (orders ?? []).find((o: any) => String(o.id) === params.id)
    : null

  const STATUS_LABELS: Record<string, string> = {
    new: '🔴 Новые',
    processing: '🟡 В работе',
    completed: '🟢 Выполненные',
    cancelled: '⚫ Отменённые',
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Заявки</h1>
        <a href="/admin" className="text-sm text-blue-600 hover:underline">← Панель</a>
      </div>

      <div className="flex gap-2 mb-6">
        {[['', 'Все'], ...Object.entries(STATUS_LABELS)].map(([val, label]) => (
          <a key={val} href={`/admin/orders${val ? `?status=${val}` : ''}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              (params.status ?? '') === val
                ? 'bg-blue-700 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}>
            {label}
          </a>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {(orders ?? []).length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl p-12 text-center text-gray-400">
            Заявок нет
          </div>
        ) : (
          (orders ?? []).map((order: any) => (
            <OrderCard key={order.id} order={order} isSelected={String(order.id) === params.id} />
          ))
        )}
      </div>
    </div>
  )
}
