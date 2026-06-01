'use client'
import { useState, useCallback } from 'react'

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
  new:         { label: 'Новая',      bg: '#fee2e2', color: '#b91c1c' },
  processing:  { label: 'В работе',   bg: '#fef9c3', color: '#a16207' },
  shipped:     { label: 'Отправлено', bg: '#dbeafe', color: '#1d4ed8' },
  delivered:   { label: 'Доставлено', bg: '#dcfce7', color: '#15803d' },
  cancelled:   { label: 'Отменена',   bg: '#f3f4f6', color: '#6b7280' },
  scheduled:   { label: 'Запись',     bg: '#e0f2fe', color: '#0369a1' },
  in_progress: { label: 'В работе',   bg: '#fef9c3', color: '#a16207' },
  ready:       { label: 'Готово',     bg: '#dcfce7', color: '#15803d' },
  done:        { label: 'Успешно',    bg: '#f0fdf4', color: '#166534' },
}

const SVC_STATUSES = ['new', 'scheduled', 'in_progress', 'ready', 'done', 'cancelled']
const PARTS_STATUSES = ['new', 'processing', 'shipped', 'delivered', 'cancelled']

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
      {cfg.label}
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
  const [status, setStatus]               = useState(order.status)
  const [notes, setNotes]                 = useState(order.manager_notes ?? '')
  const [open, setOpen]                   = useState(isSelected)
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  // URL вычисляется детерминированно из order_number → миграция БД не нужна
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const derivedInvoiceUrl = order.order_number
    ? `${supabaseUrl}/storage/v1/object/public/invoices/invoice_${order.order_number}.pdf`
    : null
  const [invoiceUrl, setInvoiceUrl]       = useState<string | null>(
    (order as any).invoice_pdf_url ?? null
  )
  const [invoiceExists, setInvoiceExists]  = useState<boolean>(false)
  const [invoiceMsg, setInvoiceMsg]       = useState<string | null>(null)

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

  // ── Проверяем существует ли PDF в Storage при открытии ────────
  const checkInvoiceExists = useCallback(async () => {
    if (!derivedInvoiceUrl) return
    try {
      const r = await fetch(derivedInvoiceUrl, { method: 'HEAD' })
      if (r.ok) {
        setInvoiceExists(true)
        setInvoiceUrl(derivedInvoiceUrl)
      }
    } catch {}
  }, [derivedInvoiceUrl])

  // Проверяем при открытии карточки
  const handleToggle = useCallback(() => {
    const next = !open
    setOpen(next)
    if (next && !invoiceExists) checkInvoiceExists()
  }, [open, invoiceExists, checkInvoiceExists])

  // ── Скачать PDF напрямую ─────────────────────────────────────
  const downloadInvoice = useCallback(async () => {
    window.open(`/api/admin/orders/${order.id}/invoice`, '_blank')
  }, [order.id])

  // ── Сгенерировать PDF + отправить в Telegram ─────────────────
  const generateAndSend = useCallback(async () => {
    setInvoiceLoading(true)
    setInvoiceMsg(null)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/invoice`, { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        if (json.pdf_url) setInvoiceUrl(json.pdf_url)
        setInvoiceMsg(json.tg_sent
          ? '✅ Счёт сгенерирован и отправлен в Telegram'
          : '✅ Счёт сгенерирован (Telegram не настроен)')
      } else {
        setInvoiceMsg('❌ Ошибка: ' + (json.error ?? 'неизвестная'))
      }
    } catch {
      setInvoiceMsg('❌ Сетевая ошибка')
    } finally {
      setInvoiceLoading(false)
      setTimeout(() => setInvoiceMsg(null), 5000)
    }
  }, [order.id])

  const s = STATUS_CFG[status] ?? STATUS_CFG.new
  const customer = parseCustomer(order)
  const items: any[] = order.items ?? []
  const isService = (order.order_number as string)?.startsWith('SVC-')

  return (
    <div style={{
      background: 'white', borderRadius: 14,
      border: `2px solid ${open ? 'rgba(255,107,0,0.4)' : '#e5e7eb'}`,
      transition: 'border-color .2s',
      overflow: 'hidden',
    }}>
      {/* Шапка карточки */}
      <button
        onClick={handleToggle}
        style={{ width: '100%', textAlign: 'left', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: '#FF6B00', whiteSpace: 'nowrap' }}>
              {order.order_number}
            </span>
            <span style={{ fontWeight: 600, color: '#111827', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {customer.name}
            </span>
            {customer.type === 'юл' && customer.company && (
              <span style={{ fontSize: 11, background: '#f0f9ff', color: '#0369a1', padding: '1px 6px', borderRadius: 4, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {customer.company}
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
          {customer.phone && (
            <span style={{display:'flex',alignItems:'center',gap:4}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {customer.phone}
            </span>
          )}
          {customer.email && (
            <span style={{display:'flex',alignItems:'center',gap:4}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {customer.email}
            </span>
          )}
          <span style={{ fontWeight: 700, color: '#111827' }}>
            {order.total_price?.toLocaleString('ru')} ₽
          </span>
          <span>{new Date(order.created_at).toLocaleString('ru', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
          <span style={{ color: '#9ca3af' }}>{items.length} поз.</span>
        </div>
      </button>

      {/* Развёрнутое содержимое */}
      {open && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px' }}>
          {/* Содержимое заявки */}
          {isService ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontWeight: 600 }}>
                Заявка на сервис
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {customer.comment && (() => {
                  try {
                    const d = JSON.parse(order.customer_comment)
                    return (
                      <>
                        {d.equipment && (
                          <div style={{ background: '#fff7ed', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151' }}>
                            <span style={{ color: '#9ca3af', fontWeight: 600 }}>Техника: </span>{d.equipment}
                          </div>
                        )}
                        {d.description && (
                          <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', borderLeft: '3px solid #FF6B00' }}>
                            <span style={{ color: '#9ca3af', fontWeight: 600 }}>Описание: </span>{d.description}
                          </div>
                        )}
                      </>
                    )
                  } catch { return null }
                })()}
              </div>
            </div>
          ) : (
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
          )}

          {/* Комментарий */}
          {customer.comment && (
            <div style={{ marginBottom: 14, background: '#F8F9FA', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', borderLeft: '3px solid #FF6B00', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {customer.comment}
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
                {(isService ? SVC_STATUSES : PARTS_STATUSES).map(val => (
                  <option key={val} value={val}>{STATUS_CFG[val]?.label ?? val}</option>
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

          {/* ── Блок счёта ────────────────────────────────────────── */}
          {!isService && (
            <div style={{
              background: 'linear-gradient(135deg, #fff7ed 0%, #fff3e0 100%)',
              border: '1.5px solid #fed7aa',
              borderRadius: 12,
              padding: '12px 14px',
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                📄 Счёт на оплату
              </div>

              {invoiceUrl && (
                <div style={{ marginBottom: 10, fontSize: 12, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  Счёт сформирован
                  <a href={invoiceUrl} target="_blank" rel="noreferrer" style={{ color: '#FF6B00', textDecoration: 'underline', marginLeft: 4 }}>
                    Открыть PDF
                  </a>
                </div>
              )}

              {invoiceMsg && (
                <div style={{
                  marginBottom: 10, fontSize: 12, padding: '6px 10px', borderRadius: 7,
                  background: invoiceMsg.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
                  color:      invoiceMsg.startsWith('✅') ? '#15803d' : '#b91c1c',
                }}>
                  {invoiceMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                {/* Скачать PDF напрямую */}
                <button
                  onClick={downloadInvoice}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '9px 0', borderRadius: 9, border: '1.5px solid #FF6B00',
                    background: 'white', color: '#FF6B00', fontWeight: 700, fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Скачать PDF
                </button>

                {/* Сгенерировать + отправить в TG */}
                <button
                  onClick={generateAndSend}
                  disabled={invoiceLoading}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '9px 0', borderRadius: 9, border: 'none',
                    background: invoiceLoading ? '#ccc' : '#FF6B00',
                    color: 'white', fontWeight: 700, fontSize: 13,
                    cursor: invoiceLoading ? 'default' : 'pointer',
                    transition: 'background .2s',
                  }}
                >
                  {invoiceLoading ? (
                    '⏳ Генерация...'
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      {invoiceUrl ? 'Переотправить' : 'Выставить счёт'}
                    </>
                  )}
                </button>
              </div>

              {/* Быстрые кнопки: позвонить / WhatsApp */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {order.customer_phone && (
                  <>
                    <a
                      href={`tel:${order.customer_phone}`}
                      style={{
                        flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 8,
                        background: '#f0f9ff', color: '#0369a1', fontWeight: 600, fontSize: 12,
                        textDecoration: 'none', border: '1px solid #bae6fd',
                      }}
                    >
                      📞 Позвонить
                    </a>
                    <a
                      href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Здравствуйте! По вашей заявке ${order.order_number} счёт готов к оплате.`)}`}
                      target="_blank" rel="noreferrer"
                      style={{
                        flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 8,
                        background: '#f0fdf4', color: '#15803d', fontWeight: 600, fontSize: 12,
                        textDecoration: 'none', border: '1px solid #86efac',
                      }}
                    >
                      💬 WhatsApp
                    </a>
                  </>
                )}
              </div>
            </div>
          )}

          <button
            onClick={save}
            disabled={saving}
            style={{
              width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: saving ? 'default' : 'pointer',
              fontSize: 14, fontWeight: 700, transition: 'all .2s',
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
