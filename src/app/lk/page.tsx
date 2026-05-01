'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/auth'

export default function LkPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    await getSupabaseBrowser().auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>Загрузка...</div>

  const name = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '36px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Личный кабинет</h1>
          <p style={{ color: '#888', fontSize: 14 }}>Привет, {name}!</p>
        </div>
        <button onClick={handleLogout} style={{
          background: 'none', border: '1px solid #e5e7eb', borderRadius: 10,
          padding: '8px 18px', fontSize: 13, color: '#666', cursor: 'pointer',
        }}>
          Выйти
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <Link href="/lk/orders" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform .15s' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Мои заказы</div>
            <div style={{ fontSize: 13, color: '#888' }}>История и статусы заказов</div>
          </div>
        </Link>

        <Link href="/lk/profile" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform .15s' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Профиль</div>
            <div style={{ fontSize: 13, color: '#888' }}>Имя, телефон, адрес доставки</div>
          </div>
        </Link>

        <Link href="/catalog" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔧</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Каталог</div>
            <div style={{ fontSize: 13, color: '#888' }}>Перейти к покупкам</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
