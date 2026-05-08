import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/requireAdmin'

export async function GET(req: NextRequest) {
  const deny = await requireAdmin(req); if (deny) return deny
  const { searchParams } = new URL(req.url)
  const contractor_id = searchParams.get('contractor_id')

  let q = supabaseAdmin.from('vehicles').select('*').order('created_at', { ascending: false })
  if (contractor_id) q = q.eq('contractor_id', contractor_id)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin(req); if (deny) return deny
  const body = await req.json()
  const { data, error } = await supabaseAdmin.from('vehicles').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const deny = await requireAdmin(req); if (deny) return deny
  const body = await req.json()
  const { id, ...rest } = body
  const { data, error } = await supabaseAdmin.from('vehicles').update(rest).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const deny = await requireAdmin(req); if (deny) return deny
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const { error } = await supabaseAdmin.from('vehicles').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
