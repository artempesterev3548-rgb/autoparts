import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/requireAdmin'

export async function GET(req: NextRequest) {
  const deny = await requireAdmin(req); if (deny) return deny
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const payment = searchParams.get('payment')
  const search = searchParams.get('search')
  const contractor_id = searchParams.get('contractor_id')

  let query = supabaseAdmin
    .from('service_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)

  if (contractor_id) query = query.eq('contractor_id', contractor_id)
  if (status) query = query.eq('status', status)
  if (payment) query = query.eq('payment_status', payment)
  if (search) {
    query = query.or(
      `client_name.ilike.%${search}%,client_phone.ilike.%${search}%,vehicle_plate.ilike.%${search}%,vehicle_vin.ilike.%${search}%,order_number.ilike.%${search}%`
    )
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin(req); if (deny) return deny
  try {
    const body = await req.json()
    const d = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const rand = Math.floor(Math.random() * 9000) + 1000
    const order_number = body.order_number || `SRV-${d}-${rand}`

    const { data, error } = await supabaseAdmin
      .from('service_orders')
      .insert({ ...body, order_number })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
