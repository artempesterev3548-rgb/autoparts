'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/auth'

const inp = {
  width: '100%', border: '1px solid #e5e7eb', borderRadius: 10,
  padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const,
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', password2: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.password2) { setError('Пароли не совпадают'); return }
    if (form.password.length < 6) { setError('Пароль минимум 6 символов'); return }
    setLoading(true)
    setError('')
    const supabase = getSupabaseBrowser()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name, phone: form.phone },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message === 'User already registered' ? 'Email уже зарегистрирован' : 'Ошибка регистрации')
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📧</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Подтвердите email</h2>
          <p style={{ color: '#666', lineHeight: 1.6 }}>
            Мы отправили письмо на <b>{form.email}</b>.<br/>
            Перейдите по ссылке в письме для активации аккаунта.
          </p>
          <Link href="/auth/login" style={{ display: 'inline-block', marginTop: 20, color: '#FF6B00', fontWeight: 600 }}>
            Войти
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, textAlign: 'center' }}>Регистрация</h1>
        <p style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 28 }}>
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" style={{ color: '#FF6B00', fontWeight: 600 }}>Войти</Link>
        </p>

        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Имя *</label>
              <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Иван Иванов" required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Телефон</label>
              <input style={inp} type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+7 (999) 123-45-67" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Email *</label>
              <input style={inp} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="example@mail.ru" required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Пароль *</label>
              <input style={inp} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Минимум 6 символов" required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Повторите пароль *</label>
              <input style={inp} type="password" value={form.password2} onChange={e => setForm(f => ({ ...f, password2: e.target.value }))}
                placeholder="••••••••" required />
            </div>
            {error && <div style={{ color: '#ef4444', fontSize: 13 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{
              background: '#FF6B00', color: 'white', border: 'none', borderRadius: 10,
              padding: '13px 0', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: 4,
            }}>
              {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
