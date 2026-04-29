import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

async function getStats() {
  const [
    { count: total },
    { count: newOrders },
    { count: processing },
    { data: recent },
  ] = await Promise.all([
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
    supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
  ])
  return { total, newOrders, processing, recent: recent ?? [] }
}

const STATUS_LABELS: Record<string, string> = {
  new: '🔴 Новая',
  processing: '🟡 В работе',
  completed: '🟢 Выполнена',
  cancelled: '⚫ Отменена',
}

export default async function AdminPage() {
  const { total, newOrders, processing, recent } = await getStats()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Панель управления</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">← На сайт</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Всего заявок', value: total ?? 0, color: 'text-gray-800' },
          { label: 'Новые', value: newOrders ?? 0, color: 'text-red-600' },
          { label: 'В работе', value: processing ?? 0, color: 'text-yellow-600' },
          { label: 'Сегодня', value: '-', color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link href="/admin/orders" className="bg-blue-700 text-white rounded-xl p-5 hover:bg-blue-800 transition">
          <div className="text-2xl mb-1">📋</div>
          <div className="font-semibold">Все заявки</div>
          <div className="text-blue-200 text-sm">Просмотр и управление заявками</div>
        </Link>
        <Link href="/catalog" className="bg-white border rounded-xl p-5 hover:shadow-md transition">
          <div className="text-2xl mb-1">📦</div>
          <div className="font-semibold text-gray-800">Каталог товаров</div>
          <div className="text-gray-400 text-sm">Перейти в каталог</div>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Последние заявки</h2>
        {recent.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-6">Заявок ещё нет</div>
        ) : (
          <div className="space-y-2">
            {recent.map((order: any) => (
              <Link key={order.id} href={`/admin/orders?id=${order.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
                <div>
                  <span className="font-mono text-sm font-semibold text-blue-700">{order.order_number}</span>
                  <span className="text-gray-700 ml-3">{order.customer_name}</span>
                  <span className="text-gray-400 ml-2 text-sm">{order.customer_phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{order.total_price?.toLocaleString('ru')} ₽</span>
                  <span className="text-xs">{STATUS_LABELS[order.status]}</span>
                  <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('ru')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
