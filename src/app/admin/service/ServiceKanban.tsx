'use client'
import { useState, useEffect, useCallback } from 'react'

const SVC_STATUS: Record<string, { label: string; bg: string; color: string; col: string }> = {
  new:         { label: 'Новая',     bg: '#fee2e2', color: '#b91c1c', col: 'new' },
  scheduled:   { label: 'Запись',    bg: '#e0f2fe', color: '#0369a1', col: 'scheduled' },
  in_progress: { label: 'В работе',  bg: '#fef9c3', color: '#a16207', col: 'in_progress' },
  ready:       { label: 'Готово',    bg: '#dcfce7', color: '#15803d', col: 'ready' },
  done:        { label: 'Успешно',   bg: '#f0fdf4', color: '#166534', col: 'done' },
  cancelled:   { label: 'Неуспешно', bg: '#f3f4f6', color: '#6b7280', col: 'cancelled' },
}

const COLUMNS = [
  { key: 'new',         title: 'Новые',    icon: '🔴' },
  { key: 'scheduled',   title: 'Запись',   icon: '🔵' },
  { key: 'in_progress', title: 'В работе', icon: '🟡' },
  { key: 'ready',       title: 'Готово',   icon: '🟢' },
]
const HISTORY_COLS = ['done', 'cancelled']

function parseCustomer(order: any) {
  try {
    const p = JSON.parse(order.customer_comment ?? '')
    if (p && typeof p === 'object') return {
      name: p.name || order.customer_name,
      phone: p.phone || order.customer_phone,
      equipment: p.equipment || null,
      description: p.description || null,
    }
  } catch {}
  return {
    name: order.customer_name,
    phone: order.customer_phone,
    equipment: null,
    description: order.customer_comment || null,
  }
}

function fmtDate(val: string | null | undefined) {
  if (!val) return null
  return new Date(val).toLocaleString('ru', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function KanbanCard({ order, onUpdate }: { order: any; onUpdate: (id: number, patch: any) => void }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<string>(order.status ?? 'new')
  const [notes, setNotes] = useState<string>(order.manager_notes ?? '')
  const [scheduledAt, setScheduledAt] = useState<string>(
    order.scheduled_at ? order.scheduled_at.slice(0, 16) : ''
  )
  const [readyAt, setReadyAt] = useState<string>(
    order.ready_at ? order.ready_at.slice(0, 16) : ''
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const customer = parseCustomer(order)
  const s = SVC_STATUS[status] ?? SVC_STATUS.new

  const save = async () => {
    setSaving(true)
    const patch = {
      id: order.id,
      status,
      manager_notes: notes,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      ready_at: readyAt ? new Date(readyAt).toISOString() : null,
    }
    await fetch('/api/orders/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onUpdate(order.id, patch)
  }

  return (
    <div style={{
      background: 'white', borderRadius: 12, border: `1.5px solid ${open ? 'rgba(255,107,0,0.4)' : '#e5e7eb'}`,
      overflow: 'hidden', transition: 'border-color .2s',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 800, color: '#FF6B00' }}>{order.order_number}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {customer.name}
            </div>
            {customer.phone && (
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{customer.phone}</div>
            )}
          </div>
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
            background: s.bg, color: s.color,
          }}>{s.label}</span>
        </div>
        {scheduledAt && (
          <div style={{ marginTop: 6, fontSize: 11, color: '#0369a1', fontWeight: 600 }}>
            📅 Заезд: {fmtDate(order.scheduled_at)}
          </div>
        )}
        {order.ready_at && (
          <div style={{ marginTop: 2, fontSize: 11, color: '#15803d', fontWeight: 600 }}>
            ✅ Готово: {fmtDate(order.ready_at)}
          </div>
        )}
        {customer.equipment && (
          <div style={{ marginTop: 4, fontSize: 11, color: '#374151', background: '#fff7ed', borderRadius: 4, padding: '2px 6px' }}>
            {customer.equipment}
          </div>
        )}
      </button>

      {open && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {customer.description && (
            <div style={{ fontSize: 12, color: '#374151', background: '#f8f9fa', borderRadius: 6, padding: '6px 10px', borderLeft: '3px solid #FF6B00' }}>
              {customer.description}
            </div>
          )}

          <div>
            <label style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 3 }}>Статус</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 7, padding: '5px 8px', fontSize: 13, outline: 'none', background: 'white' }}
            >
              {Object.entries(SVC_STATUS).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 3 }}>Дата заезда</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 7, padding: '5px 8px', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 3 }}>Дата выезда</label>
              <input
                type="datetime-local"
                value={readyAt}
                onChange={e => setReadyAt(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 7, padding: '5px 8px', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 3 }}>Заметки</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 7, padding: '6px 8px', fontSize: 12, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            style={{
              width: '100%', padding: '8px', borderRadius: 8, border: 'none', cursor: saving ? 'default' : 'pointer',
              fontSize: 13, fontWeight: 700,
              background: saved ? '#16a34a' : '#0F2744',
              color: 'white', opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Сохраняем...' : saved ? '✓ Сохранено' : 'Сохранить'}
          </button>
        </div>
      )}
    </div>
  )
}

export function ServiceBoard({ orders: initial }: { orders: any[] }) {
  const [orders, setOrders] = useState(initial)

  const handleUpdate = (id: number, patch: any) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o))
  }

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/svc-orders', { cache: 'no-store' })
      if (res.ok) setOrders(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    const id = setInterval(refresh, 30_000)
    return () => clearInterval(id)
  }, [refresh])

  const byStatus = (key: string) => orders.filter(o => (o.status ?? 'new') === key)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {COLUMNS.map(col => {
        const colOrders = byStatus(col.key)
        return (
          <div key={col.key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>{col.icon}</span>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#0F2744' }}>{col.title}</span>
              <span style={{
                marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                background: '#e5e7eb', color: '#374151', borderRadius: 20, padding: '1px 8px',
              }}>{colOrders.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80 }}>
              {colOrders.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#d1d5db', fontSize: 12, padding: '20px 0' }}>Нет заявок</div>
              ) : colOrders.map(o => (
                <KanbanCard key={o.id} order={o} onUpdate={handleUpdate} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ServiceKanban({ orders: initial }: { orders: any[] }) {
  const [orders, setOrders] = useState(initial)

  const handleUpdate = (id: number, patch: any) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o))
  }

  const history = orders.filter(o => HISTORY_COLS.includes(o.status ?? 'new'))
  const active = orders.filter(o => !HISTORY_COLS.includes(o.status ?? 'new'))

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F2744', margin: 0 }}>Сервис</h1>
          <a href="/admin" style={{ fontSize: 13, color: '#FF6B00', textDecoration: 'none', fontWeight: 600 }}>← Панель</a>
        </div>

        <ServiceBoard orders={active} />

        {history.length > 0 && (
          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: '24px', marginTop: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F2744', margin: '0 0 16px 0' }}>История</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {history.map(o => {
                const c = parseCustomer(o)
                const s = SVC_STATUS[o.status] ?? SVC_STATUS.done
                return (
                  <div key={o.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 10, background: '#fafafa', flexWrap: 'wrap', gap: 8,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: '#FF6B00' }}>{o.order_number}</span>
                      <span style={{ fontWeight: 600, color: '#0F2744', fontSize: 13 }}>{c.name}</span>
                      <span style={{ color: '#6b7280', fontSize: 12 }}>{c.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {o.scheduled_at && (
                        <span style={{ fontSize: 12, color: '#6b7280' }}>📅 {fmtDate(o.scheduled_at)}</span>
                      )}
                      <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 700, background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>
                        {new Date(o.created_at).toLocaleDateString('ru')}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
