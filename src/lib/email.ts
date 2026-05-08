const FROM = 'TruckLine <info.truckline@mail.ru>'

export async function sendOrderConfirmation(params: {
  to: string
  order_number: string
  customer_name: string
  items: Array<{ name: string; article: string; quantity: number; price: number; unit: string }>
  total_price: number
}) {
  const key = process.env.RESEND_API_KEY
  if (!key) return

  const itemRows = params.items
    .map(i => `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0">${i.name}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;color:#888;font-size:12px">${i.article}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity} ${i.unit}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600">${(i.price * i.quantity).toLocaleString('ru')} ₽</td>
    </tr>`)
    .join('')

  const html = `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:#0B1E35;padding:24px 32px;display:flex;align-items:center;gap:12px">
      <span style="color:#FF6B00;font-size:22px;font-weight:900">TruckLine</span>
      <span style="color:rgba(255,255,255,0.4);font-size:14px">— запчасти для грузовиков и спецтехники</span>
    </div>
    <div style="padding:32px">
      <h1 style="margin:0 0 8px;font-size:20px;color:#111">Ваша заявка принята</h1>
      <p style="margin:0 0 24px;color:#555;font-size:14px">Здравствуйте, ${params.customer_name}! Мы получили вашу заявку <strong>${params.order_number}</strong> и скоро свяжемся с вами.</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#f8f8f8">
            <th style="padding:8px;text-align:left;font-weight:600;color:#555">Наименование</th>
            <th style="padding:8px;text-align:left;font-weight:600;color:#555">Артикул</th>
            <th style="padding:8px;text-align:center;font-weight:600;color:#555">Кол-во</th>
            <th style="padding:8px;text-align:right;font-weight:600;color:#555">Сумма</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:10px 8px;text-align:right;font-weight:700;font-size:15px">Итого:</td>
            <td style="padding:10px 8px;text-align:right;font-weight:700;font-size:15px;color:#FF6B00">${params.total_price.toLocaleString('ru')} ₽</td>
          </tr>
        </tfoot>
      </table>

      <div style="margin-top:28px;padding:16px;background:#fff9f4;border-left:3px solid #FF6B00;border-radius:4px;font-size:13px;color:#555">
        Менеджер свяжется с вами по телефону для подтверждения заказа и уточнения деталей доставки.
      </div>

      <p style="margin-top:24px;font-size:13px;color:#999">Если у вас есть вопросы — звоните: <a href="tel:+79232130101" style="color:#FF6B00;text-decoration:none">+7 (923) 213-01-01</a></p>
    </div>
    <div style="padding:16px 32px;background:#f8f8f8;font-size:11px;color:#bbb;text-align:center">
      ООО «ТК Саяны Плюс» · ИНН 2413007682 · info.truckline@mail.ru
    </div>
  </div>
</body>
</html>`

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [params.to],
        subject: `Заявка ${params.order_number} принята — TruckLine`,
        html,
      }),
    })
  } catch {}
}
