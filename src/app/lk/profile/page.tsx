'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/auth'

const inp = {
  width: '100%', border: '1px solid #e5e7eb', borderRadius: 10,
  padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const,
}

export default function LkProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setForm({ name: data.name || '', phone: data.phone || '', address: data.address || '' })
      else setForm(f => ({ ...f, name: user.user_metadata?.name || '', phone: user.user_metadata?.phone || '' }))
      setLoading(false)
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    setSuccess(false)
    const supabase = getSupabaseBrowser()
    await supabase.from('profiles').upsert({ id: userId, ...form })
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>Загрузка...</div>

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '36px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <Link href="/lk" style={{ color: '#888', textDecoration: 'none', fontSize: 13 }}>← ЛК</Link>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Профиль</h1>
      </div>

      <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Имя / ФИО</label>
            <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Иванов Иван Иванович" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Телефон</label>
            <input style={inp} type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+7 (999) 123-45-67" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Адрес СДЭК по умолчанию</label>
            <input style={inp} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Город, улица, дом, индекс" />
          </div>

          {success && <div style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>✓ Сохранено</div>}

          <button type="submit" disabled={saving} style={{
            background: '#FF6B00', color: 'white', border: 'none', borderRadius: 10,
            padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  )
}
