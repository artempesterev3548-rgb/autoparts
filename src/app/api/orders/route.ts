import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function generateOrderNumber() {
  const date = new Date()
  const d = date.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `AP-${d}-${rand}`
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
  try {
    const body = await req.json()
    const { customer_name, customer_phone, customer_comment, items, total_price } = body

    if (!customer_name || !customer_phone || !items?.length) {
      return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 })
    }

    const order_number = generateOrderNumber()

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number,
        customer_name,
        customer_phone,
        customer_comment: customer_comment || null,
        items,
        total_price: total_price || 0,
        status: 'new',
      })
      .select()
      .single()

    if (error) throw error

    // Telegram уведомление
    const itemsList = items
      .map((i: any) => `  • ${i.name} (${i.article}) × ${i.quantity} = ${(i.price * i.quantity).toLocaleString('ru')} ₽`)
      .join('\n')

    const tgText = `🔔 <b>Новая заявка ${order_number}</b>

👤 <b>${customer_name}</b>
📞 ${customer_phone}
${customer_comment ? `💬 ${customer_comment}\n` : ''}
🛒 <b>Товары:</b>
${itemsList}

💰 <b>Итого: ${total_price?.toLocaleString('ru')} ₽</b>`

    await sendTelegram(tgText)

    return NextResponse.json({ success: true, order_number })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
