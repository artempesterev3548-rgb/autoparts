'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/auth'

const STATUS: Record<string, { label: string; color: string }> = {
  new:        { label: 'Новый',       color: '#3b82f6' },
  processing: { label: 'В обработке', color: '#f97316' },
  shipped:    { label: 'Отправлен',   color: '#8b5cf6' },
  delivered:  { label: 'Доставлен',   color: '#22c55e' },
  cancelled:  { label: 'Отменён',     color: '#ef4444' },
}

export default function LkOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setOrders(data ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>Загрузка...</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <Link href="/lk" style={{ color: '#888', textDecoration: 'none', fontSize: 13 }}>← ЛК</Link>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Мои заказы</h1>
      </div>

      {orders.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ color: '#888', marginBottom: 16 }}>Заказов пока нет</div>
          <Link href="/catalog" style={{ background: '#FF6B00', color: 'white', padding: '12px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const st = STATUS[order.status] ?? { label: order.status, color: '#888' }
            const items: any[] = order.items ?? []
            return (
              <div key={order.id} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{order.order_number}</div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                      {new Date(order.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ background: st.color + '18', color: st.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {st.label}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{order.total_price?.toLocaleString('ru')} ₽</span>
                  </div>
                </div>
                {items.length > 0 && (
                  <div style={{ marginTop: 12, borderTop: '1px solid #f4f4f4', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {items.map((item: any, i: number) => (
                      <div key={i} style={{ fontSize: 13, color: '#555', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.name} <span style={{ color: '#aaa', fontFamily: 'monospace' }}>({item.article})</span> × {item.quantity}</span>
                        <span style={{ fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString('ru')} ₽</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
