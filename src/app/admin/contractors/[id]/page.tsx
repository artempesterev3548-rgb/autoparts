'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const inp = (extra?: object): React.CSSProperties => ({
  width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8,
  padding: '9px 12px', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', background: 'white', ...extra,
})

const EMPTY_C = { name: '', inn: '', phone: '', email: '', contact_person: '', notes: '' }
const EMPTY_V = { make: '', model: '', year: '', vin: '', plate: '', notes: '' }

function calcTotal(works: any[], parts: any[]) {
  return (works ?? []).reduce((s: number, r: any) => s + (r.qty || 1) * (r.price || 0), 0)
    + (parts ?? []).reduce((s: number, r: any) => s + (r.qty || 1) * (r.price || 0), 0)
}

const SVC_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  new:           { label: 'Новая',            color: '#b91c1c', bg: '#fee2e2' },
  in_progress:   { label: 'В работе',         color: '#a16207', bg: '#fef9c3' },
  waiting_parts: { label: 'Ожидает запчасти', color: '#9d174d', bg: '#fce7f3' },
  ready:         { label: 'Готово',           color: '#1d4ed8', bg: '#dbeafe' },
  done:          { label: 'Завершено',         color: '#15803d', bg: '#dcfce7' },
  cancelled:     { label: 'Отменено',          color: '#6b7280', bg: '#f3f4f6' },
}
const PAY_STATUS: Record<string, { label: string; color: string }> = {
  unpaid:  { label: 'Не оплачено', color: '#b91c1c' },
  partial: { label: 'Частично',    color: '#a16207' },
  paid:    { label: 'Оплачено',    color: '#15803d' },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  )
}

export default function ContractorPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === 'new'

  const [form, setForm] = useState(EMPTY_C)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Vehicle modal
  const [vModal, setVModal] = useState(false)
  const [vForm, setVForm] = useState({ ...EMPTY_V, id: null as number | null })
  const [vSaving, setVSaving] = useState(false)

  useEffect(() => {
    if (isNew) return
    Promise.all([
      fetch(`/api/admin/contractors/${params.id}`).then(r => r.json()),
      fetch(`/api/admin/vehicles?contractor_id=${params.id}`).then(r => r.json()),
      fetch(`/api/admin/service-orders?contractor_id=${params.id}`).then(r => r.json()),
    ]).then(([c, v, o]) => {
      if (c.error) { router.push('/admin/contractors'); return }
      setForm({ name: c.name ?? '', inn: c.inn ?? '', phone: c.phone ?? '', email: c.email ?? '', contact_person: c.contact_person ?? '', notes: c.notes ?? '' })
      setVehicles(Array.isArray(v) ? v : [])
      setOrders(Array.isArray(o) ? o : [])
      setLoading(false)
    })
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    if (!form.name.trim()) { setError('Укажите название'); return }
    setSaving(true); setError('')
    const url = isNew ? '/api/admin/contractors' : `/api/admin/contractors/${params.id}`
    const method = isNew ? 'POST' : 'PUT'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await r.json()
    setSaving(false)
    if (d.error) { setError(d.error); return }
    setSaved(true)
    if (isNew) router.push(`/admin/contractors/${d.id}`)
    setTimeout(() => setSaved(false), 2000)
  }

  const del = async () => {
    if (!confirm('Удалить контрагента? Все связанные записи останутся.')) return
    await fetch(`/api/admin/contractors/${params.id}`, { method: 'DELETE' })
    router.push('/admin/contractors')
  }

  const saveVehicle = async () => {
    setVSaving(true)
    const body = vForm.id
      ? { ...vForm, contractor_id: Number(params.id) }
      : { ...vForm, id: undefined, contractor_id: Number(params.id) }
    const method = vForm.id ? 'PUT' : 'POST'
    const r = await fetch('/api/admin/vehicles', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await r.json()
    setVSaving(false)
    if (!d.error) {
      setVehicles(vs => vForm.id ? vs.map(v => v.id === d.id ? d : v) : [d, ...vs])
      setVModal(false)
    }
  }

  const delVehicle = async (id: number) => {
    if (!confirm('Удалить автомобиль?')) return
    await fetch(`/api/admin/vehicles?id=${id}`, { method: 'DELETE' })
    setVehicles(vs => vs.filter(v => v.id !== id))
  }

  const openVModal = (v?: any) => {
    setVForm(v ? { make: v.make, model: v.model, year: v.year, vin: v.vin, plate: v.plate, notes: v.notes, id: v.id } : { ...EMPTY_V, id: null })
    setVModal(true)
  }

  // Financial summary
  const invoiced = orders.reduce((s, o) => s + calcTotal(o.works, o.parts), 0)
  const paid = orders.reduce((s, o) => s + (o.payment_amount ?? 0), 0)
  const debt = Math.max(0, invoiced - paid)

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>Загрузка...</div>

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>

        {/* Шапка */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="/admin/contractors" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>← Контрагенты</a>
            <div style={{ fontWeight: 800, color: '#0F2744', fontSize: 17 }}>{isNew ? 'Новый контрагент' : form.name || '—'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNew && <button onClick={del} style={{ border: '1.5px solid #fca5a5', background: 'white', color: '#ef4444', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Удалить</button>}
            <button onClick={save} disabled={saving} style={{ background: saved ? '#16a34a' : '#FF6B00', color: 'white', border: 'none', borderRadius: 10, padding: '9px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', minWidth: 120 }}>
              {saving ? 'Сохраняем...' : saved ? '✓ Сохранено' : 'Сохранить'}
            </button>
          </div>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 14 }}>{error}</div>}

        {/* Финансовая сводка (только для существующих) */}
        {!isNew && (
          <div style={{ background: '#0F2744', borderRadius: 14, padding: '18px 24px', marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[
              { label: 'Заказов', value: orders.length, color: 'white' },
              { label: 'Оборот', value: invoiced.toLocaleString('ru') + ' ₽', color: '#60a5fa' },
              { label: 'Оплачено', value: paid.toLocaleString('ru') + ' ₽', color: '#4ade80' },
              { label: 'Долг', value: debt > 0 ? debt.toLocaleString('ru') + ' ₽' : '—', color: debt > 0 ? '#f87171' : '#6b7280' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Данные контрагента */}
        <Section title="Контрагент">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: '1/3' }}>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Название *</label>
              <input style={inp()} value={form.name} onChange={set('name')} placeholder='ООО "ТрансЛогистик"' />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>ИНН</label>
              <input style={inp({ fontFamily: 'monospace' })} value={form.inn} onChange={set('inn')} placeholder="1234567890" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Телефон</label>
              <input style={inp()} value={form.phone} onChange={set('phone')} placeholder="+7 (___) ___-__-__" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Email</label>
              <input style={inp()} value={form.email} onChange={set('email')} placeholder="info@company.ru" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Контактное лицо</label>
              <input style={inp()} value={form.contact_person} onChange={set('contact_person')} placeholder="Иванов Иван" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Заметки</label>
            <textarea style={{ ...inp(), resize: 'vertical', fontFamily: 'inherit' }} rows={2} value={form.notes} onChange={set('notes')} placeholder="Условия оплаты, особенности..." />
          </div>
        </Section>

        {/* Автомобили */}
        {!isNew && (
          <Section title={`Автомобили (${vehicles.length})`}>
            {vehicles.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {vehicles.map(v => {
                  const vOrders = orders.filter(o => o.vehicle_id === v.id)
                  const vInvoiced = vOrders.reduce((s, o) => s + calcTotal(o.works, o.parts), 0)
                  const vPaid = vOrders.reduce((s, o) => s + (o.payment_amount ?? 0), 0)
                  const vDebt = Math.max(0, vInvoiced - vPaid)
                  return (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8f9fa', borderRadius: 10, marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#0F2744' }}>
                            {[v.make, v.model, v.year].filter(Boolean).join(' ')}
                          </div>
                          <div style={{ display: 'flex', gap: 12, marginTop: 2, fontSize: 12, color: '#6b7280' }}>
                            {v.plate && <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v.plate}</span>}
                            {v.vin && <span>VIN: {v.vin}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                          <span style={{ color: '#6b7280' }}>{vOrders.length} заказов</span>
                          <span style={{ color: '#0F2744', fontWeight: 600 }}>{vInvoiced.toLocaleString('ru')} ₽</span>
                          {vDebt > 0 && <span style={{ color: '#b91c1c', fontWeight: 700 }}>Долг: {vDebt.toLocaleString('ru')} ₽</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openVModal(v)} style={{ border: '1.5px solid #e5e7eb', background: 'white', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: '#374151' }}>Ред.</button>
                        <button onClick={() => delVehicle(v.id)} style={{ border: '1.5px solid #fca5a5', background: 'white', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: '#ef4444' }}>✕</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <button onClick={() => openVModal()} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
              + Добавить автомобиль
            </button>
          </Section>
        )}

        {/* История заказов */}
        {!isNew && orders.length > 0 && (
          <Section title={`История заказов (${orders.length})`}>
            <div>
              {orders.map((o, i) => {
                const st = SVC_STATUS[o.status] ?? SVC_STATUS.new
                const pay = PAY_STATUS[o.payment_status] ?? PAY_STATUS.unpaid
                const tot = calcTotal(o.works, o.parts)
                const veh = vehicles.find(v => v.id === o.vehicle_id)
                return (
                  <Link key={o.id} href={`/admin/service-orders/${o.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '140px 1fr 110px 110px 120px',
                      alignItems: 'center', gap: 12, padding: '11px 14px',
                      background: i % 2 === 0 ? '#f8f9fa' : 'white', borderRadius: 8, marginBottom: 4,
                      transition: 'background .1s',
                    }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#FF6B00' }}>{o.order_number}</div>
                      <div style={{ fontSize: 13, color: '#374151' }}>
                        {veh ? `${veh.make} ${veh.model} ${veh.plate ? '(' + veh.plate + ')' : ''}` : o.client_name || '—'}
                        {o.check_in_at && <span style={{ color: '#9ca3af', marginLeft: 8, fontSize: 11 }}>{new Date(o.check_in_at).toLocaleDateString('ru')}</span>}
                      </div>
                      <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, whiteSpace: 'nowrap' }}>{st.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: pay.color }}>{pay.label}</span>
                      <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 14, color: '#0F2744' }}>{tot.toLocaleString('ru')} ₽</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Section>
        )}

      </div>

      {/* Модальное окно — добавить/редактировать машину */}
      {vModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 500, maxWidth: '95vw' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0F2744', marginBottom: 20 }}>
              {vForm.id ? 'Редактировать автомобиль' : 'Добавить автомобиль'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[
                { k: 'make', l: 'Марка', p: 'Volvo' },
                { k: 'model', l: 'Модель', p: 'FH 500' },
                { k: 'year', l: 'Год', p: '2019' },
                { k: 'plate', l: 'Гос. номер', p: 'А000АА124' },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>{f.l}</label>
                  <input style={inp(f.k === 'plate' ? { fontFamily: 'monospace', textTransform: 'uppercase' } : {})}
                    value={(vForm as any)[f.k]} placeholder={f.p}
                    onChange={e => setVForm(v => ({ ...v, [f.k]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>VIN</label>
              <input style={inp({ fontFamily: 'monospace' })} value={vForm.vin} placeholder="YV2..." onChange={e => setVForm(v => ({ ...v, vin: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Заметки</label>
              <input style={inp()} value={vForm.notes} placeholder="Особенности..." onChange={e => setVForm(v => ({ ...v, notes: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setVModal(false)} style={{ border: '1.5px solid #e5e7eb', background: 'white', borderRadius: 10, padding: '9px 20px', fontSize: 14, cursor: 'pointer', color: '#6b7280' }}>Отмена</button>
              <button onClick={saveVehicle} disabled={vSaving} style={{ background: '#0F2744', color: 'white', border: 'none', borderRadius: 10, padding: '9px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {vSaving ? 'Сохраняем...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
