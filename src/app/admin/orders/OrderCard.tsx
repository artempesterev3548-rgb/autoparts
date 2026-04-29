'use client'
import { useState } from 'react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:        { label: 'Новая',      color: 'bg-red-100 text-red-700' },
  processing: { label: 'В работе',   color: 'bg-yellow-100 text-yellow-700' },
  completed:  { label: 'Выполнена',  color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Отменена',   color: 'bg-gray-100 text-gray-500' },
}

export default function OrderCard({ order, isSelected }: { order: any; isSelected: boolean }) {
  const [status, setStatus] = useState(order.status)
  const [notes, setNotes] = useState(order.manager_notes ?? '')
  const [open, setOpen] = useState(isSelected)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await fetch('/api/orders/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: order.id, status, manager_notes: notes }),
    })
    setSaving(false)
  }

  const s = STATUS_LABELS[status]

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition ${open ? 'border-blue-300' : 'border-transparent'}`}>
      <button className="w-full text-left p-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-sm font-bold text-blue-700">{order.order_number}</span>
            <span className="text-gray-700 ml-2 font-medium">{order.customer_name}</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
          <span>📞 {order.customer_phone}</span>
          <span>💰 {order.total_price?.toLocaleString('ru')} ₽</span>
          <span>{new Date(order.created_at).toLocaleString('ru', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          {/* Товары */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Товары</div>
            <div className="space-y-1">
              {(order.items ?? []).map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.name} <span className="text-gray-400 font-mono text-xs">({item.article})</span></span>
                  <span className="font-medium ml-2 shrink-0">{item.quantity} × {item.price?.toLocaleString('ru')} ₽</span>
                </div>
              ))}
            </div>
            <div className="text-right font-bold mt-2 text-gray-900">Итого: {order.total_price?.toLocaleString('ru')} ₽</div>
          </div>

          {order.customer_comment && (
            <div className="mb-3 bg-blue-50 rounded-lg p-2 text-sm text-blue-800">
              💬 {order.customer_comment}
            </div>
          )}

          {/* Управление */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Статус</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400">
                {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Заметки менеджера</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Договорились о доставке..."
              className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
          </div>
          <button onClick={save} disabled={saving}
            className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-60 transition">
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </div>
      )}
    </div>
  )
}
