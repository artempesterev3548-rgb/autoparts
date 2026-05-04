'use client'
import { useState } from 'react'

interface Supplier {
  id: number
  name: string
  website: string | null
}

interface Props {
  order: any
  isSelected: boolean
  supplierMap: Record<string, Supplier>
}

const STATUS_CFG: Record<string, { label: string; bg: string; color: string }> = {
  new:        { label: 'Новая',      bg: '#fee2e2', color: '#b91c1c' },
  processing: { label: 'В работе',   bg: '#fef9c3', color: '#a16207' },
  shipped:    { label: 'Отправлено', bg: '#dbeafe', color: '#1d4ed8' },
  delivered:  { label: 'Доставлено', bg: '#dcfce7', color: '#15803d' },
  cancelled:  { label: 'Отменена',   bg: '#f3f4f6', color: '#6b7280' },
}

function getSupplierCfg(supplier: Supplier | undefined) {
  if (!supplier) return { bg: '#f9fafb', color: '#6b7280', icon: '❓', label: 'Неизвестно' }
  const name = supplier.name.toLowerCase()
  const website = (supplier.website ?? '').toLowerCase()
  if (name.includes('armtek') || website.includes('armtek'))
    return { bg: '#fff7ed', color: '#c2410c', icon: '🔧', label: supplier.name }
  if (name.includes('склад') || name.includes('собств'))
    return { bg: '#f0fdf4', color: '#15803d', icon: '🏠', label: supplier.name }
  return { bg: '#eff6ff', color: '#1d4ed8', icon: '🌐', label: supplier.name }
}

function SupplierBadge({ supplier }: { supplier: Supplier | undefined }) {
  const cfg = getSupplierCfg(supplier)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function parseCustomer(order: any) {
  // customer_comment may contain JSON with customer data for юр. лица
  try {
    const parsed = JSON.parse(order.customer_comment ?? '')
    if (parsed && typeof parsed === 'object') {
      return {
        name: parsed.name || order.customer_name,
        phone: parsed.phone || order.customer_phone,
        email: parsed.email || order.customer_email,
        company: parsed.company || null,
        inn: parsed.inn || null,
        type: parsed.type || 'фл',
        comment: parsed.comment || null,
      }
    }
  } catch {}
  return {
    name: order.customer_name,
    phone: order.customer_phone,
    email: order.customer_email,
    company: null,
    inn: null,
    type: 'фл',
    comment: order.customer_comment || null,
  }
}

export default function OrderCard({ order, isSelected, supplierMap }: Props) {
  const [status, setStatus] = useState(order.status)
  const [notes, setNotes] = useState(order.manager_notes ?? '')
  const [open, setOpen] = useState(isSelected)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setSaving(true)
    await fetch('/api/orders/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: order.id, status, manager_notes: notes }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const s = STATUS_CFG[status] ?? STATUS_CFG.new
  const customer = parseCustomer(order)
  const items: any[] = order.items ?? []

  return (
    <div style={{
      background: 'white', borderRadius: 14,
      border: `2px solid ${open ? '#93c5fd' : '#e5e7eb'}`,
      transition: 'border-color .2s',
      overflow: 'hidden',
    }}>
      {/* Шапка карточки */}
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', textAlign: 'left', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: '#1d4ed8', whiteSpace: 'nowrap' }}>
              {order.order_number}
            </span>
            <span style={{ fontWeight: 600, color: '#111827', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {customer.name}
            </span>
            {customer.type === 'юл' && customer.company && (
              <span style={{ fontSize: 11, background: '#f0f9ff', color: '#0369a1', padding: '1px 6px', borderRadius: 4, fontWeight: 600, whiteSpace: 'nowrap' }}>
                🏢 {customer.company}
              </span>
            )}
          </div>
          <span style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 700, whiteSpace: 'nowrap',
            background: s.bg, color: s.color,
          }}>
            {s.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, fontSize: 13, color: '#6b7280', flexWrap: 'wrap' }}>
          {customer.phone && <span>📞 {customer.phone}</span>}
          {customer.email && <span>✉️ {customer.email}</span>}
          <span style={{ fontWeight: 700, color: '#111827' }}>
            💰 {order.total_price?.toLocaleString('ru')} ₽
          </span>
          <span>{new Date(order.created_at).toLocaleString('ru', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
          <span style={{ color: '#9ca3af' }}>{items.length} поз.</span>
        </div>
      </button>

      {/* Развёрнутое содержимое */}
      {open && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px' }}>
          {/* Товары с поставщиками */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontWeight: 600 }}>
              Товары
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map((item: any, i: number) => {
                const supplier = supplierMap[item.article]
                const cfg = getSupplierCfg(supplier)
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    padding: '8px 10px', borderRadius: 8,
                    background: cfg.bg, flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                      <SupplierBadge supplier={supplier} />
                      <span style={{ fontSize: 13, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {item.article}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>
                      {item.quantity} × {item.price?.toLocaleString('ru')} ₽
                    </span>
                  </div>
                )
              })}
            </div>
            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 10 }}>
              Итого: {order.total_price?.toLocaleString('ru')} ₽
            </div>
          </div>

          {/* Комментарий */}
          {customer.comment && (
            <div style={{ marginBottom: 14, background: '#eff6ff', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#1e40af' }}>
              💬 {customer.comment}
            </div>
          )}

          {/* ИНН для юр. лица */}
          {customer.inn && (
            <div style={{ marginBottom: 14, fontSize: 13, color: '#374151' }}>
              <span style={{ color: '#9ca3af' }}>ИНН:</span> {customer.inn}
            </div>
          )}

          {/* Управление */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Статус
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', fontSize: 13, outline: 'none', background: 'white' }}
              >
                {Object.entries(STATUS_CFG).map(([val, { label }]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Заметки менеджера
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Договорились о доставке..."
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            style={{
              width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: saving ? 'default' : 'pointer',
              fontSize: 14, fontWeight: 700, transition: 'all .2s',
              background: saved ? '#16a34a' : '#1d4ed8',
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
