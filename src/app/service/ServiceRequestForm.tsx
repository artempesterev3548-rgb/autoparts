'use client'
import { useState } from 'react'

const inputStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: '1.5px solid rgba(255,255,255,0.15)',
  borderRadius: 10, padding: '13px 16px',
  fontSize: 14, color: 'white', outline: 'none', width: '100%',
  boxSizing: 'border-box' as const,
}

export default function ServiceRequestForm() {
  const [fields, setFields] = useState({ name: '', phone: '', equipment: '', description: '' })
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fields.name || !fields.phone) { setError('Заполните имя и телефон'); return }
    setSending(true); setError('')
    const res = await fetch('/api/service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fields, _hp: '' }),
    })
    const json = await res.json()
    setSending(false)
    if (json.success) { setDone(true) }
    else { setError(json.error || 'Ошибка, попробуйте ещё раз') }
  }

  if (done) return (
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
      <div style={{ color: 'white', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Заявка принята!</div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Перезвоним в течение 30 минут</div>
    </div>
  )

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="svc-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <input placeholder="Ваше имя" required value={fields.name} onChange={set('name')} style={inputStyle} />
        <input placeholder="Телефон" required type="tel" value={fields.phone} onChange={set('phone')} style={inputStyle} />
      </div>
      <input placeholder="Марка и модель тягача / полуприцепа" value={fields.equipment} onChange={set('equipment')} style={inputStyle} />
      <textarea placeholder="Опишите проблему или нужные работы..." rows={4} value={fields.description} onChange={set('description')}
        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
      {error && <div style={{ color: '#fca5a5', fontSize: 13 }}>{error}</div>}
      <button type="submit" disabled={sending} style={{
        background: '#FF6B00', color: 'white', border: 'none', borderRadius: 10,
        padding: '14px', fontSize: 15, fontWeight: 700,
        cursor: sending ? 'default' : 'pointer',
        opacity: sending ? 0.7 : 1,
        boxShadow: '0 4px 20px rgba(255,107,0,0.4)',
      }}>
        {sending ? 'Отправляем...' : 'Отправить заявку'}
      </button>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
        Или позвоните: <a href="tel:+79232130101" style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>+7 (923) 213-01-01</a>
      </p>
    </form>
  )
}
