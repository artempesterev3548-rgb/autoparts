import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',').map(e => e.trim()).filter(Boolean)
  return adminEmails.length === 0 || adminEmails.includes(email)
}

const FORBIDDEN = NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })

export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return FORBIDDEN
  return null
}
