import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { id, status, manager_notes } = await req.json()
    if (!id) return NextResponse.json({ error: 'Нет ID' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status, manager_notes, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}
