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

function buildTelegramText(order_number: string, customer_type: string, data: any, items: any[], total_price: number) {
  const itemsList = items
    .map((i: any) => `  • ${i.name} (${i.article}) × ${i.quantity} = ${(i.price * i.quantity).toLocaleString('ru')} ₽`)
    .join('\n')

  const typeLabel = customer_type === 'company' ? '🏢 Юридическое лицо' : '👤 Физическое лицо'

  let details = ''
  if (customer_type === 'individual') {
    details = [
      `👤 <b>${data.name}</b>`,
      `📞 ${data.phone}`,
      `📦 Адрес СДЭК: ${data.address}`,
      data.comment ? `💬 ${data.comment}` : '',
    ].filter(Boolean).join('\n')
  } else {
    details = [
      `🏢 <b>${data.company_name}</b>`,
      data.inn        ? `ИНН: ${data.inn}` : '',
      data.kpp        ? `КПП: ${data.kpp}` : '',
      data.ogrn       ? `ОГРН: ${data.ogrn}` : '',
      data.legal_address ? `Юр. адрес: ${data.legal_address}` : '',
      '',
      data.bank       ? `Банк: ${data.bank}` : '',
      data.bik        ? `БИК: ${data.bik}` : '',
      data.account    ? `Р/с: ${data.account}` : '',
      data.corr_account ? `К/с: ${data.corr_account}` : '',
      data.edo        ? `ЭДО: ${data.edo}` : '',
      '',
      `📋 Контакт: <b>${data.contact_name}</b>`,
      data.contact_position ? `Должность: ${data.contact_position}` : '',
      `📞 ${data.contact_phone}`,
      `📦 Адрес СДЭК: ${data.delivery_address}`,
      data.comment    ? `💬 ${data.comment}` : '',
    ].filter(s => s !== undefined && s !== null).join('\n').replace(/\n{3,}/g, '\n\n')
  }

  return `🔔 <b>Новая заявка ${order_number}</b>
${typeLabel}

${details}

🛒 <b>Товары:</b>
${itemsList}

💰 <b>Итого: ${total_price?.toLocaleString('ru')} ₽</b>`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer_name, customer_phone, customer_comment, customer_type, items, total_price } = body

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

    let parsedData: any = {}
    try { parsedData = JSON.parse(customer_comment || '{}') } catch {}

    const tgText = buildTelegramText(order_number, customer_type || 'individual', parsedData, items, total_price)
    await sendTelegram(tgText)

    return NextResponse.json({ success: true, order_number })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
