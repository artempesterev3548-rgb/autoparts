'use client'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

interface Work { name: string; qty: number; price: number }
interface Part { article: string; name: string; qty: number; price: number }

const SVC_STATUS = [
  { v: 'new',           l: 'Новая' },
  { v: 'in_progress',   l: 'В работе' },
  { v: 'waiting_parts', l: 'Ожидает запчасти' },
  { v: 'ready',         l: 'Готово к выдаче' },
  { v: 'done',          l: 'Завершено' },
  { v: 'cancelled',     l: 'Отменено' },
]
const PAY_STATUS = [
  { v: 'unpaid',  l: 'Не оплачено' },
  { v: 'partial', l: 'Частично оплачено' },
  { v: 'paid',    l: 'Оплачено' },
]

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  new:           { bg: '#fee2e2', color: '#b91c1c' },
  in_progress:   { bg: '#fef9c3', color: '#a16207' },
  waiting_parts: { bg: '#fce7f3', color: '#9d174d' },
  ready:         { bg: '#dbeafe', color: '#1d4ed8' },
  done:          { bg: '#dcfce7', color: '#15803d' },
  cancelled:     { bg: '#f3f4f6', color: '#6b7280' },
}

const inp = (extra?: object): React.CSSProperties => ({
  width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8,
  padding: '9px 12px', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', background: 'white', ...extra,
})

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  )
}

const EMPTY = {
  client_name: '', client_phone: '', client_email: '',
  vehicle_make: '', vehicle_model: '', vehicle_year: '', vehicle_vin: '', vehicle_plate: '',
  works: [] as Work[], parts: [] as Part[],
  contractor_id: null as number | null,
  vehicle_id: null as number | null,
  check_in_at: '', check_out_at: '',
  status: 'new', payment_status: 'unpaid', payment_amount: 0,
  manager_notes: '', linked_order_id: null as number | null, order_number: '',
}

export default function ServiceOrderPage() {
  const params = useParams()
  const sp = useSearchParams()
  const router = useRouter()
  const isNew = params.id === 'new'

  const [form, setForm] = useState({ ...EMPTY })
  const [contractors, setContractors] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch('/api/admin/contractors').then(r => r.json()).then(d => setContractors(Array.isArray(d) ? d : []))

    if (isNew) {
      const contractorId = sp.get('contractor_id') ? Number(sp.get('contractor_id')) : null
      setForm(f => ({
        ...f,
        client_name: sp.get('name') ?? '',
        client_phone: sp.get('phone') ?? '',
        linked_order_id: sp.get('linked') ? Number(sp.get('linked')) : null,
        contractor_id: contractorId,
      }))
      if (contractorId) {
        fetch(`/api/admin/vehicles?contractor_id=${contractorId}`)
          .then(r => r.json()).then(d => setVehicles(Array.isArray(d) ? d : []))
      }
    } else {
      fetch(`/api/admin/service-orders/${params.id}`)
        .then(r => r.json())
        .then(d => {
          setForm({
            ...EMPTY, ...d,
            check_in_at: d.check_in_at ? d.check_in_at.slice(0, 16) : '',
            check_out_at: d.check_out_at ? d.check_out_at.slice(0, 16) : '',
            works: d.works ?? [],
            parts: d.parts ?? [],
            contractor_id: d.contractor_id ?? null,
            vehicle_id: d.vehicle_id ?? null,
          })
          if (d.contractor_id) {
            fetch(`/api/admin/vehicles?contractor_id=${d.contractor_id}`)
              .then(r => r.json()).then(v => setVehicles(Array.isArray(v) ? v : []))
          }
          setLoading(false)
        })
    }
  }, [])

  const onContractorChange = (cid: number | null) => {
    setForm(f => ({ ...f, contractor_id: cid, vehicle_id: null }))
    setVehicles([])
    if (cid) {
      const c = contractors.find(x => x.id === cid)
      if (c) setForm(f => ({ ...f, contractor_id: cid, vehicle_id: null, client_name: c.contact_person || c.name, client_phone: c.phone || f.client_phone }))
      fetch(`/api/admin/vehicles?contractor_id=${cid}`)
        .then(r => r.json()).then(d => setVehicles(Array.isArray(d) ? d : []))
    }
  }

  const onVehicleChange = (vid: number | null) => {
    setForm(f => ({ ...f, vehicle_id: vid }))
    if (vid) {
      const v = vehicles.find(x => x.id === vid)
      if (v) setForm(f => ({ ...f, vehicle_id: vid, vehicle_make: v.make, vehicle_model: v.model, vehicle_year: v.year, vehicle_vin: v.vin, vehicle_plate: v.plate }))
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const setWork = (i: number, k: keyof Work, v: string | number) =>
    setForm(f => { const w = [...f.works]; w[i] = { ...w[i], [k]: k === 'name' ? v : Number(v) }; return { ...f, works: w } })
  const addWork = () => setForm(f => ({ ...f, works: [...f.works, { name: '', qty: 1, price: 0 }] }))
  const rmWork = (i: number) => setForm(f => ({ ...f, works: f.works.filter((_, j) => j !== i) }))

  const setPart = (i: number, k: keyof Part, v: string | number) =>
    setForm(f => { const p = [...f.parts]; p[i] = { ...p[i], [k]: k === 'name' || k === 'article' ? v : Number(v) }; return { ...f, parts: p } })
  const addPart = () => setForm(f => ({ ...f, parts: [...f.parts, { article: '', name: '', qty: 1, price: 0 }] }))
  const rmPart = (i: number) => setForm(f => ({ ...f, parts: f.parts.filter((_, j) => j !== i) }))

  const worksTotal = form.works.reduce((s, r) => s + r.qty * r.price, 0)
  const partsTotal = form.parts.reduce((s, r) => s + r.qty * r.price, 0)
  const total = worksTotal + partsTotal

  const save = async () => {
    setSaving(true); setError('')
    const body = {
      ...form,
      payment_amount: Number(form.payment_amount),
      check_in_at: form.check_in_at || null,
      check_out_at: form.check_out_at || null,
    }
    const url = isNew ? '/api/admin/service-orders' : `/api/admin/service-orders/${params.id}`
    const method = isNew ? 'POST' : 'PUT'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await r.json()
    setSaving(false)
    if (d.error) { setError(d.error); return }
    setSaved(true)
    if (isNew) router.push(`/admin/service-orders/${d.id}`)
    setTimeout(() => setSaved(false), 2000)
  }

  const del = async () => {
    if (!confirm('Удалить карту сервиса?')) return
    setDeleting(true)
    await fetch(`/api/admin/service-orders/${params.id}`, { method: 'DELETE' })
    router.push('/admin/service-orders')
  }

  const stColor = STATUS_COLORS[form.status] ?? STATUS_COLORS.new

  if (loading) return (
    <div style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>Загрузка...</div>
  )

  const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } as React.CSSProperties
  const row3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 } as React.CSSProperties

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Шапка */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="/admin/service-orders" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>← Список</a>
            <div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Карта сервиса</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#FF6B00', fontSize: 15 }}>
                {isNew ? 'Новая запись' : form.order_number}
              </div>
            </div>
            {!isNew && (
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: stColor.bg, color: stColor.color }}>
                {SVC_STATUS.find(s => s.v === form.status)?.l}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNew && (
              <button onClick={del} disabled={deleting} style={{
                border: '1.5px solid #fca5a5', background: 'white', color: '#ef4444',
                borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Удалить</button>
            )}
            <button onClick={save} disabled={saving} style={{
              background: saved ? '#16a34a' : '#FF6B00', color: 'white',
              border: 'none', borderRadius: 10, padding: '9px 24px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', minWidth: 120,
            }}>
              {saving ? 'Сохраняем...' : saved ? '✓ Сохранено' : 'Сохранить'}
            </button>
          </div>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 14 }}>{error}</div>}

        {/* Контрагент */}
        <Section title="Контрагент">
          <div style={{ display: 'grid', gridTemplateColumns: vehicles.length > 0 || form.contractor_id ? '1fr 1fr' : '1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Компания / клиент</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  style={{ ...inp(), flex: 1, cursor: 'pointer' }}
                  value={form.contractor_id ?? ''}
                  onChange={e => onContractorChange(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">— Без контрагента —</option>
                  {contractors.map(c => <option key={c.id} value={c.id}>{c.name}{c.inn ? ` (ИНН ${c.inn})` : ''}</option>)}
                </select>
                <a href="/admin/contractors/new" target="_blank" style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: '#f3f4f6', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', textDecoration: 'none', whiteSpace: 'nowrap' }}>+ Новый</a>
              </div>
            </div>
            {form.contractor_id && (
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Автомобиль контрагента</label>
                <select
                  style={{ ...inp(), cursor: 'pointer' }}
                  value={form.vehicle_id ?? ''}
                  onChange={e => onVehicleChange(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">— Выбрать машину —</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {[v.make, v.model, v.year].filter(Boolean).join(' ')}{v.plate ? ` · ${v.plate}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {form.contractor_id && (
            <a href={`/admin/contractors/${form.contractor_id}`} target="_blank" style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: '#FF6B00', textDecoration: 'none' }}>
              Открыть карточку контрагента →
            </a>
          )}
        </Section>

        {/* Клиент */}
        <Section title="Клиент">
          <div style={row3}>
            <div><label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Имя *</label>
              <input style={inp()} value={form.client_name} onChange={set('client_name')} placeholder="Иванов Иван Иванович" /></div>
            <div><label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Телефон</label>
              <input style={inp()} value={form.client_phone} onChange={set('client_phone')} placeholder="+7 (___) ___-__-__" /></div>
            <div><label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Email</label>
              <input style={inp()} value={form.client_email} onChange={set('client_email')} placeholder="mail@example.ru" /></div>
          </div>
        </Section>

        {/* Автомобиль */}
        <Section title="Автомобиль">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 1fr 1fr', gap: 12 }}>
            <div><label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Марка</label>
              <input style={inp()} value={form.vehicle_make} onChange={set('vehicle_make')} placeholder="Volvo" /></div>
            <div><label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Модель</label>
              <input style={inp()} value={form.vehicle_model} onChange={set('vehicle_model')} placeholder="FH 500" /></div>
            <div><label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Год</label>
              <input style={inp()} value={form.vehicle_year} onChange={set('vehicle_year')} placeholder="2019" /></div>
            <div><label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Гос. номер</label>
              <input style={inp({ fontFamily: 'monospace', textTransform: 'uppercase' })} value={form.vehicle_plate} onChange={set('vehicle_plate')} placeholder="А000АА124" /></div>
            <div><label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>VIN</label>
              <input style={inp({ fontFamily: 'monospace' })} value={form.vehicle_vin} onChange={set('vehicle_vin')} placeholder="YV2..." /></div>
          </div>
        </Section>

        {/* Работы */}
        <Section title="Работы">
          {form.works.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 120px 100px 32px', gap: 8, marginBottom: 6 }}>
                {['Наименование работы', 'Кол-во', 'Цена, ₽', 'Сумма', ''].map(h => (
                  <div key={h} style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{h}</div>
                ))}
              </div>
              {form.works.map((w, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 120px 100px 32px', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                  <input style={inp()} value={w.name} onChange={e => setWork(i, 'name', e.target.value)} placeholder="Замена масла" />
                  <input style={inp({ textAlign: 'center' })} type="number" min={1} value={w.qty} onChange={e => setWork(i, 'qty', e.target.value)} />
                  <input style={inp({ textAlign: 'right' })} type="number" min={0} value={w.price} onChange={e => setWork(i, 'price', e.target.value)} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2744', textAlign: 'right', padding: '0 4px' }}>
                    {(w.qty * w.price).toLocaleString('ru')} ₽
                  </div>
                  <button onClick={() => rmWork(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <button onClick={addWork} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
              + Добавить работу
            </button>
            {form.works.length > 0 && (
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2744' }}>
                Итого работы: {worksTotal.toLocaleString('ru')} ₽
              </div>
            )}
          </div>
        </Section>

        {/* Запчасти */}
        <Section title="Запчасти">
          {form.parts.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 70px 120px 100px 32px', gap: 8, marginBottom: 6 }}>
                {['Артикул', 'Наименование', 'Кол-во', 'Цена, ₽', 'Сумма', ''].map(h => (
                  <div key={h} style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{h}</div>
                ))}
              </div>
              {form.parts.map((pt, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 70px 120px 100px 32px', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                  <input style={inp({ fontFamily: 'monospace' })} value={pt.article} onChange={e => setPart(i, 'article', e.target.value)} placeholder="ABC123" />
                  <input style={inp()} value={pt.name} onChange={e => setPart(i, 'name', e.target.value)} placeholder="Масло 5W-40 5л" />
                  <input style={inp({ textAlign: 'center' })} type="number" min={1} value={pt.qty} onChange={e => setPart(i, 'qty', e.target.value)} />
                  <input style={inp({ textAlign: 'right' })} type="number" min={0} value={pt.price} onChange={e => setPart(i, 'price', e.target.value)} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2744', textAlign: 'right', padding: '0 4px' }}>
                    {(pt.qty * pt.price).toLocaleString('ru')} ₽
                  </div>
                  <button onClick={() => rmPart(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <button onClick={addPart} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
              + Добавить запчасть
            </button>
            {form.parts.length > 0 && (
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2744' }}>
                Итого запчасти: {partsTotal.toLocaleString('ru')} ₽
              </div>
            )}
          </div>
        </Section>

        {/* Итого */}
        <div style={{ background: '#0F2744', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 32 }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Работы</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{worksTotal.toLocaleString('ru')} ₽</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Запчасти</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{partsTotal.toLocaleString('ru')} ₽</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,107,0,0.8)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Итого к оплате</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#FF6B00', letterSpacing: -1 }}>{total.toLocaleString('ru')} ₽</div>
            </div>
          </div>
        </div>

        {/* Сроки и статус */}
        <Section title="Сроки и статус">
          <div style={row2}>
            <div style={row2}>
              <div><label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Дата заезда</label>
                <input type="datetime-local" style={inp()} value={form.check_in_at} onChange={set('check_in_at')} /></div>
              <div><label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Дата выезда</label>
                <input type="datetime-local" style={inp()} value={form.check_out_at} onChange={set('check_out_at')} /></div>
            </div>
            <div><label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Статус</label>
              <select style={{ ...inp(), cursor: 'pointer' }} value={form.status} onChange={set('status')}>
                {SVC_STATUS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
          </div>
        </Section>

        {/* Оплата */}
        <Section title="Оплата">
          <div style={row2}>
            <div><label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Статус оплаты</label>
              <select style={{ ...inp(), cursor: 'pointer' }} value={form.payment_status} onChange={set('payment_status')}>
                {PAY_STATUS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
            <div><label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Оплачено, ₽</label>
              <input type="number" min={0} style={inp()} value={form.payment_amount} onChange={set('payment_amount')} placeholder="0" />
            </div>
          </div>
        </Section>

        {/* Заметки */}
        <Section title="Заметки менеджера">
          <textarea
            value={form.manager_notes}
            onChange={set('manager_notes')}
            rows={3}
            placeholder="Внутренние заметки..."
            style={{ ...inp(), resize: 'vertical', fontFamily: 'inherit' }}
          />
        </Section>

        {/* Кнопка сохранить внизу */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingBottom: 32 }}>
          {!isNew && (
            <button onClick={del} disabled={deleting} style={{
              border: '1.5px solid #fca5a5', background: 'white', color: '#ef4444',
              borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Удалить</button>
          )}
          <button onClick={save} disabled={saving} style={{
            background: saved ? '#16a34a' : '#FF6B00', color: 'white',
            border: 'none', borderRadius: 10, padding: '11px 32px',
            fontSize: 15, fontWeight: 700, cursor: 'pointer', minWidth: 160,
          }}>
            {saving ? 'Сохраняем...' : saved ? '✓ Сохранено' : 'Сохранить'}
          </button>
        </div>

      </div>
    </div>
  )
}
