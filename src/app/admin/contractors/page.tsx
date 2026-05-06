import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

function calcTotal(works: any[], parts: any[]) {
  return (works ?? []).reduce((s, r) => s + (r.qty || 1) * (r.price || 0), 0)
    + (parts ?? []).reduce((s, r) => s + (r.qty || 1) * (r.price || 0), 0)
}

export default async function ContractorsPage() {
  const [{ data: contractors }, { data: orders }, { data: vehicles }] = await Promise.all([
    supabaseAdmin.from('contractors').select('*').order('name'),
    supabaseAdmin.from('service_orders').select('contractor_id, works, parts, payment_amount, payment_status, vehicle_id'),
    supabaseAdmin.from('vehicles').select('id, contractor_id'),
  ])

  // Агрегация по контрагентам
  const stats: Record<number, { orders: number; invoiced: number; paid: number; vehicles: number }> = {}
  for (const o of orders ?? []) {
    if (!o.contractor_id) continue
    if (!stats[o.contractor_id]) stats[o.contractor_id] = { orders: 0, invoiced: 0, paid: 0, vehicles: 0 }
    stats[o.contractor_id].orders++
    stats[o.contractor_id].invoiced += calcTotal(o.works, o.parts)
    stats[o.contractor_id].paid += o.payment_amount ?? 0
  }
  for (const v of vehicles ?? []) {
    if (!v.contractor_id) continue
    if (!stats[v.contractor_id]) stats[v.contractor_id] = { orders: 0, invoiced: 0, paid: 0, vehicles: 0 }
    stats[v.contractor_id].vehicles++
  }

  const totalDebt = Object.values(stats).reduce((s, x) => s + Math.max(0, x.invoiced - x.paid), 0)
  const totalTurnover = Object.values(stats).reduce((s, x) => s + x.invoiced, 0)

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Шапка */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F2744', margin: 0 }}>Контрагенты</h1>
            <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{(contractors ?? []).length} компаний / клиентов</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <a href="/admin" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>← Панель</a>
            <Link href="/admin/contractors/new" style={{
              background: '#FF6B00', color: 'white', padding: '9px 18px',
              borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}>+ Новый контрагент</Link>
          </div>
        </div>

        {/* Сводка */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Контрагентов', value: (contractors ?? []).length, color: '#0F2744' },
            { label: 'Общий оборот', value: totalTurnover.toLocaleString('ru') + ' ₽', color: '#15803d' },
            { label: 'Общий долг', value: totalDebt.toLocaleString('ru') + ' ₽', color: totalDebt > 0 ? '#b91c1c' : '#15803d' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Таблица */}
        {!(contractors ?? []).length ? (
          <div style={{ background: 'white', borderRadius: 16, padding: '64px 24px', textAlign: 'center', color: '#aaa' }}>
            Контрагентов нет. <Link href="/admin/contractors/new" style={{ color: '#FF6B00' }}>Добавить первого →</Link>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            {/* Заголовок таблицы */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 140px 80px 80px 140px 140px 120px 36px',
              padding: '10px 20px', background: '#f8f9fa', gap: 12,
              fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {['Контрагент', 'Телефон / контакт', 'Машин', 'Заказов', 'Оборот', 'Оплачено', 'Долг', ''].map(h => (
                <div key={h}>{h}</div>
              ))}
            </div>
            {(contractors ?? []).map((c: any, i: number) => {
              const st = stats[c.id] ?? { orders: 0, invoiced: 0, paid: 0, vehicles: 0 }
              const debt = Math.max(0, st.invoiced - st.paid)
              return (
                <Link key={c.id} href={`/admin/contractors/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 140px 80px 80px 140px 140px 120px 36px',
                    alignItems: 'center', gap: 12, padding: '14px 20px',
                    borderBottom: i < (contractors ?? []).length - 1 ? '1px solid #f3f4f6' : 'none',
                    transition: 'background .15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0F2744' }}>{c.name}</div>
                      {c.inn && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>ИНН {c.inn}</div>}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: '#374151' }}>{c.phone || '—'}</div>
                      {c.contact_person && <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.contact_person}</div>}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', textAlign: 'center' }}>{st.vehicles}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', textAlign: 'center' }}>{st.orders}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2744' }}>{st.invoiced.toLocaleString('ru')} ₽</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#15803d' }}>{st.paid.toLocaleString('ru')} ₽</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: debt > 0 ? '#b91c1c' : '#9ca3af' }}>
                      {debt > 0 ? `${debt.toLocaleString('ru')} ₽` : '—'}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 18 }}>›</div>
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
