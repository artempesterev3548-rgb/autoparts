'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#0B1E35', borderTop: '2px solid #FF6B00',
      padding: '16px 24px', display: 'flex', alignItems: 'center',
      flexWrap: 'wrap', gap: 12, justifyContent: 'space-between',
    }}>
      <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: 13, flex: '1 1 300px' }}>
        Мы используем файлы cookie для корректной работы сайта и анализа посещаемости.
        Продолжая использование сайта, вы соглашаетесь с нашей{' '}
        <Link href="/privacy" style={{ color: '#FF6B00', textDecoration: 'underline' }}>
          политикой конфиденциальности
        </Link>.
      </p>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            padding: '8px 20px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer',
          }}
        >
          Отклонить
        </button>
        <button
          onClick={accept}
          style={{
            padding: '8px 20px', borderRadius: 6, border: 'none',
            background: '#FF6B00', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Принять
        </button>
      </div>
    </div>
  )
}
