import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'

function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',').map(e => e.trim()).filter(Boolean)
  return adminEmails.length === 0 || adminEmails.includes(email)
}

async function getSessionUser(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

const VALID_STATUSES = [
  'new', 'processing', 'shipped', 'delivered', 'cancelled',
  'scheduled', 'in_progress', 'ready', 'done',
]

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  try {
    const { id, status, manager_notes, scheduled_at, ready_at } = await req.json()
    if (!id) return NextResponse.json({ error: 'Нет ID' }, { status: 400 })
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Недопустимый статус' }, { status: 400 })
    }

    const patch: Record<string, any> = { updated_at: new Date().toISOString() }
    if (status !== undefined) patch.status = status
    if (manager_notes !== undefined) patch.manager_notes = manager_notes
    if (scheduled_at !== undefined) patch.scheduled_at = scheduled_at
    if (ready_at !== undefined) patch.ready_at = ready_at

    const { error } = await supabaseAdmin
      .from('orders')
      .update(patch)
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}
