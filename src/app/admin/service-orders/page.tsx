import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ status?: string; payment?: string; search?: string }>
}

const SVC_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  new:           { label: 'Новая',             color: '#b91c1c', bg: '#fee2e2' },
  in_progress:   { label: 'В работе',          color: '#a16207', bg: '#fef9c3' },
  waiting_parts: { label: 'Ожидает запчасти',  color: '#9d174d', bg: '#fce7f3' },
  ready:         { label: 'Готово к выдаче',   color: '#1d4ed8', bg: '#dbeafe' },
  done:          { label: 'Завершено',          color: '#15803d', bg: '#dcfce7' },
  cancelled:     { label: 'Отменено',           color: '#6b7280', bg: '#f3f4f6' },
}

const PAY_STATUS: Record<string, { label: string; color: string }> = {
  unpaid:  { label: 'Не оплачено', color: '#b91c1c' },
  partial: { label: 'Частично',    color: '#a16207' },
  paid:    { label: 'Оплачено',    color: '#15803d' },
}

function calcTotal(works: any[], parts: any[]) {
  const w = (works ?? []).reduce((s, r) => s + (r.qty || 1) * (r.price || 0), 0)
  const p = (parts ?? []).reduce((s, r) => s + (r.qty || 1) * (r.price || 0), 0)
  return w + p
}

const styles = `
  .svc-row:hover { background: #f8f9fa !important; }
`

export default async function ServiceOrdersPage({ searchParams }: Props) {
  const p = await searchParams

  let query = supabaseAdmin
    .from('service_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)

  if (p.status) query = query.eq('status', p.status)
  if (p.payment) query = query.eq('payment_status', p.payment)
  if (p.search) {
    query = query.or(
      `client_name.ilike.%${p.search}%,client_phone.ilike.%${p.search}%,vehicle_plate.ilike.%${p.search}%,order_number.ilike.%${p.search}%`
    )
  }

  const { data: orders } = await query

  const filterHref = (key: string, val: string) => {
    const params = new URLSearchParams({
      ...(p.status && key !== 'status' ? { status: p.status } : {}),
      ...(p.payment && key !== 'payment' ? { payment: p.payment } : {}),
      ...(p.search ? { search: p.search } : {}),
      ...(val ? { [key]: val } : {}),
    })
    return `/admin/service-orders${params.size ? '?' + params.toString() : ''}`
  }

  const chip = (active: boolean) => ({
    padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    textDecoration: 'none', border: '1.5px solid',
    background: active ? '#0F2744' : 'white',
    color: active ? 'white' : '#555',
    borderColor: active ? '#0F2744' : '#e5e7eb',
  } as React.CSSProperties)

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', padding: '32px 24px' }}>
      <style>{styles}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Шапка */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F2744', margin: 0 }}>Карты сервиса</h1>
            <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{(orders ?? []).length} записей</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <a href="/admin" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>← Панель</a>
            <Link href="/admin/service-orders/new" style={{
              background: '#FF6B00', color: 'white', padding: '9px 18px',
              borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}>
              + Новая карта
            </Link>
          </div>
        </div>

        {/* Фильтры статус */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <a href={filterHref('status', '')} style={chip(!p.status)}>Все</a>
          {Object.entries(SVC_STATUS).map(([v, cfg]) => (
            <a key={v} href={filterHref('status', v)} style={chip(p.status === v)}>{cfg.label}</a>
          ))}
        </div>

        {/* Фильтры оплата */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          <a href={filterHref('payment', '')} style={{ ...chip(!p.payment), fontSize: 12 }}>Любая оплата</a>
          {Object.entries(PAY_STATUS).map(([v, cfg]) => (
            <a key={v} href={filterHref('payment', v)} style={{ ...chip(p.payment === v), fontSize: 12 }}>{cfg.label}</a>
          ))}
        </div>

        {/* Поиск */}
        <form method="GET" action="/admin/service-orders" style={{ marginBottom: 20 }}>
          {p.status && <input type="hidden" name="status" value={p.status} />}
          {p.payment && <input type="hidden" name="payment" value={p.payment} />}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              name="search"
              defaultValue={p.search ?? ''}
              placeholder="Поиск по имени, телефону, номеру авто, номеру заявки..."
              style={{
                flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 10,
                padding: '9px 14px', fontSize: 14, outline: 'none', background: 'white',
              }}
            />
            <button type="submit" style={{
              background: '#0F2744', color: 'white', border: 'none',
              borderRadius: 10, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Найти</button>
            {p.search && <a href={filterHref('search', '')} style={{ ...chip(false), display: 'flex', alignItems: 'center' }}>✕</a>}
          </div>
        </form>

        {/* Список */}
        {!(orders ?? []).length ? (
          <div style={{ background: 'white', borderRadius: 16, padding: '64px 24px', textAlign: 'center', color: '#aaa' }}>
            Карт сервиса нет
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            {(orders ?? []).map((o: any, i: number) => {
              const st = SVC_STATUS[o.status] ?? SVC_STATUS.new
              const pay = PAY_STATUS[o.payment_status] ?? PAY_STATUS.unpaid
              const total = calcTotal(o.works, o.parts)
              return (
                <Link key={o.id} href={`/admin/service-orders/${o.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="svc-row" style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr 1fr 120px 130px 120px',
                    alignItems: 'center', gap: 16,
                    padding: '14px 20px',
                    borderBottom: i < (orders ?? []).length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: 'white', transition: 'background .15s',
                  }}>
                    {/* Номер + дата */}
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: '#FF6B00' }}>{o.order_number}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                        {o.check_in_at ? new Date(o.check_in_at).toLocaleDateString('ru') : new Date(o.created_at).toLocaleDateString('ru')}
                      </div>
                    </div>
                    {/* Клиент */}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0F2744' }}>{o.client_name || '—'}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{o.client_phone}</div>
                    </div>
                    {/* Автомобиль */}
                    <div>
                      <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>
                        {[o.vehicle_make, o.vehicle_model, o.vehicle_year].filter(Boolean).join(' ') || '—'}
                      </div>
                      {o.vehicle_plate && (
                        <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#9ca3af', marginTop: 2 }}>{o.vehicle_plate}</div>
                      )}
                    </div>
                    {/* Статус */}
                    <div>
                      <span style={{
                        display: 'inline-block', padding: '3px 8px', borderRadius: 6,
                        fontSize: 11, fontWeight: 700, background: st.bg, color: st.color,
                      }}>{st.label}</span>
                    </div>
                    {/* Оплата */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: pay.color }}>{pay.label}</div>
                      {o.payment_amount > 0 && (
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                          {o.payment_amount.toLocaleString('ru')} ₽
                        </div>
                      )}
                    </div>
                    {/* Итого */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: '#0F2744' }}>
                        {total.toLocaleString('ru')} ₽
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
