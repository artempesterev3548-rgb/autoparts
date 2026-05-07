import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import { ServiceBoard } from './service/ServiceKanban'

const styles = `
  .admin-order-row:hover { background: #F8F9FA; }
`

async function getStats() {
  const [
    { count: total },
    { count: newOrders },
    { count: processing },
    { data: recent },
    { data: svcOrders },
  ] = await Promise.all([
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).like('order_number', 'AP-%'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).like('order_number', 'AP-%').eq('status', 'new'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).like('order_number', 'AP-%').eq('status', 'processing'),
    supabaseAdmin.from('orders').select('*').like('order_number', 'AP-%').order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('orders').select('*').like('order_number', 'SVC-%').in('status', ['new', 'scheduled', 'in_progress', 'ready']).order('created_at', { ascending: false }).limit(200),
  ])
  return { total, newOrders, processing, recent: recent ?? [], svcOrders: svcOrders ?? [] }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:        { label: 'Новая',      color: '#ef4444' },
  processing: { label: 'В работе',   color: '#f97316' },
  shipped:    { label: 'Отправлено', color: '#8b5cf6' },
  delivered:  { label: 'Доставлено', color: '#22c55e' },
  cancelled:  { label: 'Отменена',   color: '#9ca3af' },
}

export default async function AdminPage() {
  const { total, newOrders, processing, recent, svcOrders } = await getStats()

  const today = recent.filter(
    (o: any) => new Date(o.created_at).toDateString() === new Date().toDateString()
  ).length

  const stats = [
    { label: 'Всего заявок', value: total ?? 0, color: '#0F2744' },
    { label: 'Новые',        value: newOrders ?? 0, color: '#ef4444' },
    { label: 'В работе',     value: processing ?? 0, color: '#f97316' },
    { label: 'Сегодня',      value: today, color: '#FF6B00' },
  ]

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', padding: '32px 24px' }}>
      <style>{styles}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F2744', margin: 0 }}>Панель управления</h1>
          <Link href="/" style={{ color: '#FF6B00', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
            ← На сайт
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: 'white', borderRadius: 14, padding: '20px 16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {/* All orders card */}
          <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#0F2744', borderRadius: 16, padding: '20px 24px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.10)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ background: '#FFF0E8', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
                  <line x1="9" y1="12" x2="15" y2="12"/>
                  <line x1="9" y1="16" x2="13" y2="16"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'white', fontSize: 15 }}>Все заявки</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Просмотр и управление заявками</div>
              </div>
            </div>
          </Link>

          {/* Contractors card */}
          <Link href="/admin/contractors" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white', borderRadius: 16, padding: '20px 24px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1.5px solid #e5e7eb',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ background: '#FFF0E8', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0F2744', fontSize: 15 }}>Контрагенты</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Клиенты, долги, оборот</div>
              </div>
            </div>
          </Link>

          {/* Service dashboard card */}
          <Link href="/admin/service" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white', borderRadius: 16, padding: '20px 24px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1.5px solid #e5e7eb',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ background: '#FFF0E8', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0F2744', fontSize: 15 }}>Автосервис</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Дашборд заявок сервиса</div>
              </div>
            </div>
          </Link>

          {/* Catalog card */}
          <Link href="/catalog" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white', borderRadius: 16, padding: '20px 24px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1.5px solid #e5e7eb',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ background: '#FFF0E8', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0F2744', fontSize: 15 }}>Каталог товаров</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Перейти в каталог</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Service dashboard */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: '24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F2744', margin: 0 }}>🔧 Автосервис</h2>
            <Link href="/admin/service" style={{ fontSize: 13, color: '#FF6B00', textDecoration: 'none', fontWeight: 600 }}>Открыть дашборд →</Link>
          </div>
          <ServiceBoard orders={svcOrders} />
        </div>

        {/* Recent orders */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: '24px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F2744', margin: '0 0 16px 0' }}>Последние заявки</h2>
          {recent.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6B7280', fontSize: 14, padding: '24px 0' }}>Заявок ещё нет</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recent.map((order: any) => {
                const st = STATUS_LABELS[order.status]
                return (
                  <Link key={order.id} href={`/admin/orders?id=${order.id}`} style={{ textDecoration: 'none' }}>
                    <div className="admin-order-row" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', borderRadius: 10,
                      transition: 'background .15s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: '#FF6B00' }}>
                          {order.order_number}
                        </span>
                        <span style={{ color: '#0F2744', fontWeight: 600, fontSize: 14 }}>{order.customer_name}</span>
                        <span style={{ color: '#6B7280', fontSize: 13 }}>{order.customer_phone}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#0F2744' }}>
                          {order.total_price?.toLocaleString('ru')} ₽
                        </span>
                        {st && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.color, display: 'inline-block' }} />
                            {st.label}
                          </span>
                        )}
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>
                          {new Date(order.created_at).toLocaleDateString('ru')}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
