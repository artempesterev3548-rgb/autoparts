import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

function generateOrderNumber() {
  const date = new Date()
  const d = date.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `SVC-${d}-${rand}`
}

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
  } catch {}
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!await rateLimit(ip, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Слишком много запросов. Попробуйте позже.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { name, phone, equipment, description, _hp } = body

    if (_hp) return NextResponse.json({ success: true })

    if (!name || !phone) {
      return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 })
    }

    const order_number = generateOrderNumber()

    const comment = JSON.stringify({ type: 'service', equipment: equipment || '', description: description || '' })

    const { error } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number,
        customer_name: name,
        customer_phone: phone,
        customer_comment: comment,
        items: [],
        total_price: 0,
        status: 'new',
      })

    if (error) throw error

    const tgText = `🔧 <b>Заявка на автосервис ${order_number}</b>

👤 <b>${name}</b>
📞 ${phone}${equipment ? `\n🚛 ${equipment}` : ''}${description ? `\n💬 ${description}` : ''}`

    await sendTelegram(tgText)

    return NextResponse.json({ success: true, order_number })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
