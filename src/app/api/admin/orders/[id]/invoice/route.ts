/**
 * POST /api/admin/orders/[id]/invoice
 * Генерирует PDF-счёт и отправляет в Telegram
 * Также сохраняет ссылку в orders.invoice_pdf_url
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/requireAdmin'
import { generateInvoicePDF, InvoiceData, InvoiceItem } from '@/lib/invoice-pdf'

async function sendTelegramDocument(
  pdfBytes: Uint8Array,
  filename: string,
  caption: string
): Promise<boolean> {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return false

  try {
    const buf  = Buffer.from(pdfBytes)
    const form = new FormData()
    form.append('chat_id', chatId)
    form.append('caption', caption)
    form.append('parse_mode', 'HTML')
    form.append('document', new Blob([buf], { type: 'application/pdf' }), filename)

    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: form,
    })
    return res.ok
  } catch {
    return false
  }
}

function buildInvoiceData(order: any): InvoiceData {
  // customer_comment может содержать JSON с реквизитами
  let extra: any = {}
  try { extra = JSON.parse(order.customer_comment ?? '{}') } catch {}

  const isCompany = extra.type === 'company'

  const items: InvoiceItem[] = (order.items ?? []).map((i: any) => ({
    article:  i.article  ?? i.oem ?? '',
    name:     i.name     ?? i.title ?? 'Запчасть',
    quantity: i.quantity ?? 1,
    price:    i.price    ?? 0,
    unit:     i.unit     ?? 'шт',
  }))

  return {
    order_number:      order.order_number,
    created_at:        order.created_at,
    customer_type:     isCompany ? 'company' : 'individual',
    customer_name:     order.customer_name,
    customer_phone:    order.customer_phone,
    customer_email:    order.customer_email ?? extra.email,
    company_name:      extra.company_name,
    inn:               extra.inn,
    kpp:               extra.kpp,
    ogrn:              extra.ogrn,
    legal_address:     extra.legal_address,
    delivery_address:  extra.delivery_address ?? extra.address,
    items,
    total_price:       order.total_price ?? 0,
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin(req)
  if (deny) return deny

  const { id } = await params

  // Загружаем заказ
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
  }

  try {
    // Генерируем PDF
    const invoiceData = buildInvoiceData(order)
    const pdfBytes    = await generateInvoicePDF(invoiceData)

    // Загружаем в Supabase Storage
    const filename = `invoice_${order.order_number}.pdf`
    let pdfUrl: string | null = null

    try {
      const pdfBuf = Buffer.from(pdfBytes)
      const { data: upload, error: uploadErr } = await supabaseAdmin.storage
        .from('invoices')
        .upload(filename, pdfBuf, {
          contentType:  'application/pdf',
          upsert:       true,
          cacheControl: '3600',
        })

      if (!uploadErr && upload) {
        const { data: urlData } = supabaseAdmin.storage
          .from('invoices')
          .getPublicUrl(filename)
        pdfUrl = urlData?.publicUrl ?? null
      }
    } catch {
      // Storage недоступен — продолжаем без сохранения
    }

    // Обновляем статус заказа (только безопасные поля)
    // Колонки invoice_pdf_url / invoice_sent_at добавятся после миграции
    const updatePayload: Record<string, unknown> = {
      status: order.status === 'new' ? 'processing' : order.status,
    }
    // Пробуем сохранить URL — если колонки нет, ошибка поймается
    if (pdfUrl) {
      try {
        await supabaseAdmin
          .from('orders')
          .update({ ...updatePayload, invoice_pdf_url: pdfUrl, invoice_sent_at: new Date().toISOString() })
          .eq('id', id)
      } catch {
        // Колонка ещё не создана — обновляем только статус
        await supabaseAdmin.from('orders').update(updatePayload).eq('id', id)
      }
    } else {
      await supabaseAdmin.from('orders').update(updatePayload).eq('id', id)
    }

    // Отправляем в Telegram
    const isCompany = order.customer_name && order.customer_comment?.includes('company_name')
    const buyerLine = isCompany ? '🏢 Юр. лицо' : '👤 Физ. лицо'
    const caption   = [
      `📄 <b>Счёт ${order.order_number}</b>`,
      `${buyerLine}: <b>${order.customer_name}</b>`,
      `📞 ${order.customer_phone}`,
      `💰 <b>${(order.total_price ?? 0).toLocaleString('ru')} ₽</b>`,
      pdfUrl ? `\n🔗 <a href="${pdfUrl}">Скачать PDF</a>` : '',
    ].filter(Boolean).join('\n')

    const tgFilename = `Счёт_${order.order_number}.pdf`
    const sent = await sendTelegramDocument(pdfBytes, tgFilename, caption)

    return NextResponse.json({
      success:   true,
      pdf_url:   pdfUrl,
      tg_sent:   sent,
      pdf_bytes: Buffer.from(pdfBytes).toString('base64'),
    })
  } catch (e) {
    console.error('Invoice generation error:', e)
    return NextResponse.json(
      { error: 'Ошибка генерации счёта: ' + String(e) },
      { status: 500 }
    )
  }
}

// GET — скачать PDF напрямую (для кнопки "Скачать")
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin(req)
  if (deny) return deny

  const { id } = await params

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) return NextResponse.json({ error: 'Не найден' }, { status: 404 })

  const invoiceData = buildInvoiceData(order)
  const pdfBytes    = await generateInvoicePDF(invoiceData)

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="Schet_${order.order_number}.pdf"`,
    },
  })
}
