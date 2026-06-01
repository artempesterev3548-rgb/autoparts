import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { sendOrderConfirmation } from '@/lib/email'
import { generateInvoicePDF, InvoiceData, InvoiceItem } from '@/lib/invoice-pdf'

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

// Отправка PDF-документа в Telegram
async function sendTelegramInvoice(
  pdfBytes: Uint8Array,
  filename: string,
  caption: string
): Promise<void> {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  try {
    const buf = Buffer.from(pdfBytes)
    const form = new FormData()
    form.append('chat_id', chatId)
    form.append('caption', caption)
    form.append('parse_mode', 'HTML')
    form.append('document', new Blob([buf], { type: 'application/pdf' }), filename)
    await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: form,
    })
  } catch {}
}

// Сохранение PDF в Supabase Storage
async function uploadInvoice(pdfBytes: Uint8Array, order_number: string): Promise<string | null> {
  try {
    const filename = `invoice_${order_number}.pdf`
    const buf = Buffer.from(pdfBytes)
    const { error } = await supabaseAdmin.storage
      .from('invoices')
      .upload(filename, buf, { contentType: 'application/pdf', upsert: true })
    if (error) return null
    const { data } = supabaseAdmin.storage.from('invoices').getPublicUrl(filename)
    return data?.publicUrl ?? null
  } catch {
    return null
  }
}

// Строим InvoiceData из данных заказа
function buildInvoiceData(
  order_number: string,
  customer_type: string,
  parsedData: any,
  items: any[],
  total_price: number,
  created_at: string,
  customer_name: string,
  customer_phone: string,
  customer_email?: string
): InvoiceData {
  const isCompany = customer_type === 'company'
  const invoiceItems: InvoiceItem[] = items.map((i: any) => ({
    article:  i.article ?? i.oem ?? '',
    name:     i.name    ?? i.title ?? 'Запчасть',
    quantity: i.quantity ?? 1,
    price:    i.price    ?? 0,
    unit:     i.unit     ?? 'шт',
  }))
  return {
    order_number,
    created_at,
    customer_type: isCompany ? 'company' : 'individual',
    customer_name,
    customer_phone,
    customer_email,
    company_name:      parsedData.company_name,
    inn:               parsedData.inn,
    kpp:               parsedData.kpp,
    ogrn:              parsedData.ogrn,
    legal_address:     parsedData.legal_address,
    delivery_address:  parsedData.delivery_address ?? parsedData.address,
    items:             invoiceItems,
    total_price,
  }
}

// Краткая подпись к PDF-документу
function buildTelegramCaption(order_number: string, customer_type: string, data: any, items: any[], total_price: number): string {
  const typeLabel = customer_type === 'company' ? '🏢' : '👤'
  const buyer = customer_type === 'company'
    ? `${data.company_name ?? ''} (${data.contact_name ?? ''})`
    : data.name ?? ''
  const phone = customer_type === 'company' ? data.contact_phone : data.phone
  const itemCount = items.length
  return [
    `📄 <b>СЧЁТ ${order_number}</b>`,
    `${typeLabel} ${buyer}`,
    `📞 ${phone ?? '—'}`,
    `🛒 ${itemCount} позиц. на <b>${(total_price ?? 0).toLocaleString('ru')} ₽</b>`,
    ``,
    `👆 Откройте PDF — счёт готов к отправке клиенту`,
  ].join('\n')
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

async function getUserId(req: NextRequest): Promise<string | null> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll() {},
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id ?? null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!await rateLimit(ip, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Слишком много запросов. Попробуйте позже.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { customer_name, customer_phone, customer_email, customer_comment, customer_type, items, total_price, _hp } = body

    // Honeypot: боты заполняют скрытые поля
    if (_hp) {
      return NextResponse.json({ success: true, order_number: 'BOT' })
    }

    if (!customer_name || !customer_phone || !items?.length) {
      return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 })
    }

    // Защита от аномально больших запросов
    if (items.length > 100 || String(customer_name).length > 200 || String(customer_phone).length > 30) {
      return NextResponse.json({ error: 'Недопустимые данные' }, { status: 400 })
    }

    const order_number = generateOrderNumber()
    const user_id = await getUserId(req)

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        customer_comment: customer_comment || null,
        items,
        total_price: total_price || 0,
        status: 'new',
        ...(user_id ? { user_id } : {}),
      })
      .select()
      .single()

    if (error) throw error

    let parsedData: any = {}
    try { parsedData = JSON.parse(customer_comment || '{}') } catch {}

    // ── Генерация PDF-счёта ─────────────────────────────────────
    let pdfUrl: string | null = null
    try {
      const invoiceData = buildInvoiceData(
        order_number,
        customer_type || 'individual',
        parsedData,
        items,
        total_price || 0,
        data.created_at,
        customer_name,
        customer_phone,
        customer_email || undefined
      )
      const pdfBytes = await generateInvoicePDF(invoiceData)

      // Загружаем в Storage (параллельно с Telegram)
      const [uploadedUrl] = await Promise.all([
        uploadInvoice(pdfBytes, order_number),
        // Отправляем PDF-документ в Telegram вместо текста
        sendTelegramInvoice(
          pdfBytes,
          `Счёт_${order_number}.pdf`,
          buildTelegramCaption(order_number, customer_type || 'individual', parsedData, items, total_price)
        ),
      ])
      pdfUrl = uploadedUrl

      // Сохраняем ссылку на PDF в заказе
      if (pdfUrl) {
        await supabaseAdmin
          .from('orders')
          .update({ invoice_pdf_url: pdfUrl, invoice_sent_at: new Date().toISOString() })
          .eq('id', data.id)
      }
    } catch (pdfErr) {
      // PDF не критичен — если не вышло, шлём обычный текст
      console.error('PDF generation failed:', pdfErr)
      const tgText = buildTelegramText(order_number, customer_type || 'individual', parsedData, items, total_price)
      await sendTelegram(tgText)
    }

    if (customer_email) {
      await sendOrderConfirmation({
        to: customer_email,
        order_number,
        customer_name,
        items,
        total_price: total_price || 0,
      })
    }

    return NextResponse.json({ success: true, order_number, invoice_url: pdfUrl })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
