'use client'
import { useState } from 'react'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/auth'

const inp = {
  width: '100%', border: '1px solid #e5e7eb', borderRadius: 10,
  padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const,
}

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = getSupabaseBrowser()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (error) {
      setError('Не удалось отправить письмо. Проверьте email.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, textAlign: 'center' }}>Восстановление пароля</h1>
        <p style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 28 }}>
          Вспомнили пароль?{' '}
          <Link href="/auth/login" style={{ color: '#FF6B00', fontWeight: 600 }}>Войти</Link>
        </p>

        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Письмо отправлено</div>
              <div style={{ color: '#666', fontSize: 13 }}>
                Проверьте почту <b>{email}</b> и перейдите по ссылке для сброса пароля.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Email</label>
                <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="example@mail.ru" required />
              </div>
              {error && <div style={{ color: '#ef4444', fontSize: 13 }}>{error}</div>}
              <button type="submit" disabled={loading} style={{
                background: '#FF6B00', color: 'white', border: 'none', borderRadius: 10,
                padding: '13px 0', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, marginTop: 4,
              }}>
                {loading ? 'Отправляем...' : 'Отправить ссылку'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
