/**
 * Генератор PDF-счёта на оплату (СЧЁТ НА ОПЛАТУ)
 * Российский стандарт — без НДС (УСН / ИП)
 *
 * Зависимости: pdf-lib, @pdf-lib/fontkit
 * Шрифт: Roboto (загружается с Google CDN, поддерживает кириллицу)
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

// ─── Цвета ────────────────────────────────────────────────────────
const NAVY   = rgb(0.059, 0.153, 0.267)   // #0F2744
const ORANGE = rgb(1,     0.42,  0)        // #FF6B00
const GRAY   = rgb(0.6,   0.6,   0.6)
const LGRAY  = rgb(0.95,  0.95,  0.95)
const BLACK  = rgb(0,     0,     0)
const WHITE  = rgb(1,     1,     1)

// ─── Тип заказа ───────────────────────────────────────────────────
export interface InvoiceItem {
  article: string
  name:    string
  quantity: number
  price:   number
  unit?:   string
}

export interface InvoiceData {
  order_number:   string
  created_at:     string          // ISO string
  customer_type:  'individual' | 'company'
  customer_name:  string
  customer_phone: string
  customer_email?: string
  company_name?:  string
  inn?:           string
  kpp?:           string
  ogrn?:          string
  legal_address?: string
  delivery_address?: string
  items:          InvoiceItem[]
  total_price:    number
}

// ─── Продавец из env ──────────────────────────────────────────────
function getSeller() {
  return {
    name:         process.env.SELLER_NAME         ?? 'ИП Пестерев Артём Александрович',
    inn:          process.env.SELLER_INN           ?? '272400349812',
    ogrnip:       process.env.SELLER_OGRNIP        ?? '325272400007350',
    address:      process.env.SELLER_ADDRESS       ?? '680000, г. Хабаровск, ул. Карла Маркса, 176/5',
    bank:         process.env.SELLER_BANK          ?? 'ПАО Сбербанк',
    bik:          process.env.SELLER_BIK           ?? '040813608',
    account:      process.env.SELLER_ACCOUNT       ?? '40802810200000017398',
    corr_account: process.env.SELLER_CORR_ACCOUNT  ?? '30101810200000000608',
    phone:        process.env.SELLER_PHONE         ?? '+7 (4212) 98-88-23',
  }
}

// ─── Число прописью (рубли) ───────────────────────────────────────
function rubles(n: number): string {
  const ones = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять',
                'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
                'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать']
  const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят',
                'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто']
  const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот',
                    'шестьсот', 'семьсот', 'восемьсот', 'девятьсот']

  function chunk(num: number, feminine = false): string {
    if (num === 0) return ''
    let r = ''
    r += hundreds[Math.floor(num / 100)] ? hundreds[Math.floor(num / 100)] + ' ' : ''
    const rem = num % 100
    if (rem < 20) {
      const w = ones[rem]
      if (w) {
        // female forms for тысяча
        if (feminine) {
          r += w.replace(/^один$/, 'одна').replace(/^два$/, 'две') + ' '
        } else {
          r += w + ' '
        }
      }
    } else {
      r += tens[Math.floor(rem / 10)] + ' '
      const unit = rem % 10
      if (unit) {
        const w = ones[unit]
        if (feminine) {
          r += w.replace(/^один$/, 'одна').replace(/^два$/, 'две') + ' '
        } else {
          r += w + ' '
        }
      }
    }
    return r.trim()
  }

  function rubWord(n: number): string {
    const mod10 = n % 10; const mod100 = n % 100
    if (mod100 >= 11 && mod100 <= 19) return 'рублей'
    if (mod10 === 1) return 'рубль'
    if (mod10 >= 2 && mod10 <= 4) return 'рубля'
    return 'рублей'
  }

  function thousandWord(n: number): string {
    const mod10 = n % 10; const mod100 = n % 100
    if (mod100 >= 11 && mod100 <= 19) return 'тысяч'
    if (mod10 === 1) return 'тысяча'
    if (mod10 >= 2 && mod10 <= 4) return 'тысячи'
    return 'тысяч'
  }

  function millionWord(n: number): string {
    const mod10 = n % 10; const mod100 = n % 100
    if (mod100 >= 11 && mod100 <= 19) return 'миллионов'
    if (mod10 === 1) return 'миллион'
    if (mod10 >= 2 && mod10 <= 4) return 'миллиона'
    return 'миллионов'
  }

  const int = Math.floor(n)
  const kopecks = Math.round((n - int) * 100)

  let result = ''
  const millions = Math.floor(int / 1_000_000)
  const thousands = Math.floor((int % 1_000_000) / 1000)
  const remainder = int % 1000

  if (millions) result += chunk(millions) + ' ' + millionWord(millions) + ' '
  if (thousands) result += chunk(thousands, true) + ' ' + thousandWord(thousands) + ' '
  if (remainder || !int) result += chunk(remainder) + ' '

  result = result.trim()
  // Capitalize
  result = result.charAt(0).toUpperCase() + result.slice(1)

  return `${result} ${rubWord(int)} ${kopecks.toString().padStart(2, '0')} копеек`
}

// ─── Форматирование даты ──────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso)
  const months = ['января','февраля','марта','апреля','мая','июня',
                  'июля','августа','сентября','октября','ноября','декабря']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} г.`
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function fmt(n: number): string {
  return n.toLocaleString('ru-RU')
}

// ─── Загрузка шрифта ──────────────────────────────────────────────
let _fontCache: ArrayBuffer | null = null

async function loadCyrillicFont(): Promise<ArrayBuffer> {
  if (_fontCache) return _fontCache
  // Roboto Regular — поддерживает кириллицу, ~130KB
  const url = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2'
  // Fallback: ttf версия
  const ttfUrl = 'https://github.com/googlefonts/roboto/raw/main/src/hinted/Roboto-Regular.ttf'

  try {
    const r = await fetch(ttfUrl, { signal: AbortSignal.timeout(8000) })
    if (r.ok) {
      _fontCache = await r.arrayBuffer()
      return _fontCache
    }
  } catch {}

  // Second fallback: jsDelivr CDN
  try {
    const r2 = await fetch(
      'https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.8/files/roboto-cyrillic-400-normal.woff2',
      { signal: AbortSignal.timeout(8000) }
    )
    if (r2.ok) {
      _fontCache = await r2.arrayBuffer()
      return _fontCache
    }
  } catch {}

  throw new Error('Не удалось загрузить шрифт для PDF')
}

// ─── Главная функция генерации PDF ────────────────────────────────
export async function generateInvoicePDF(data: InvoiceData): Promise<Uint8Array> {
  const seller = getSeller()

  // Пробуем загрузить кириллический шрифт
  let cyrFont: Awaited<ReturnType<typeof loadCyrillicFont>> | null = null
  try { cyrFont = await loadCyrillicFont() } catch { cyrFont = null }

  const pdfDoc = await PDFDocument.create()
  if (cyrFont) {
    pdfDoc.registerFontkit(fontkit)
  }

  // Встраиваем шрифты
  const fontRegular = cyrFont
    ? await pdfDoc.embedFont(cyrFont, { subset: true })
    : await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = cyrFont
    ? await pdfDoc.embedFont(cyrFont, { subset: true })
    : await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Размеры страницы A4 (595.28 x 841.89 pt)
  const W = 595.28
  const H = 841.89
  const ML = 40   // left margin
  const MR = 40   // right margin
  const cw = W - ML - MR  // content width

  const page = pdfDoc.addPage([W, H])
  const { drawText, drawRectangle, drawLine } = page

  let y = H - 40  // текущая y-позиция (сверху вниз)

  // ── Хелперы ────────────────────────────────────────────────────
  function text(
    s: string, x: number, yPos: number,
    { size = 9, bold = false, color = BLACK, maxWidth = 0 }: {
      size?: number; bold?: boolean; color?: typeof BLACK; maxWidth?: number
    } = {}
  ) {
    const font = bold ? fontBold : fontRegular
    let str = s ?? ''
    // Обрезаем если не влезает
    if (maxWidth > 0) {
      while (str.length > 1 && font.widthOfTextAtSize(str, size) > maxWidth) {
        str = str.slice(0, -1)
      }
      if (str !== s) str = str.slice(0, -1) + '…'
    }
    page.drawText(str, { x, y: yPos, size, font, color })
  }

  function rect(x: number, yPos: number, w: number, h: number, fillColor: typeof BLACK) {
    page.drawRectangle({ x, y: yPos, width: w, height: h, color: fillColor })
  }

  function line(x1: number, y1: number, x2: number, y2: number, thickness = 0.5, color = GRAY) {
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color })
  }

  // ── Шапка ─────────────────────────────────────────────────────
  // Синяя полоса сверху
  rect(0, H - 8, W, 8, NAVY)

  // Логотип / название
  text('TRUCK LINE', ML, y - 2, { size: 18, bold: true, color: NAVY })
  text('Запчасти для грузовых автомобилей', ML, y - 16, { size: 8, color: GRAY })

  // Номер счёта справа
  const invoiceLabel = `СЧЁТ НА ОПЛАТУ`
  const invoiceNumber = `№ ${data.order_number}`
  const invoiceDate   = `от ${formatDate(data.created_at)}`
  const validUntil    = `Действителен до: ${formatDate(addDays(data.created_at, 7))}`

  text(invoiceLabel, W - MR - 220, y - 2,  { size: 13, bold: true, color: NAVY })
  text(invoiceNumber, W - MR - 220, y - 16, { size: 11, bold: true, color: ORANGE })
  text(invoiceDate,   W - MR - 220, y - 28, { size: 8,  color: GRAY })
  text(validUntil,    W - MR - 220, y - 40, { size: 8,  color: GRAY })

  y -= 60

  // Линия под шапкой
  line(ML, y, W - MR, y, 1.5, NAVY)
  y -= 14

  // ── Блок Поставщик / Покупатель ───────────────────────────────
  const colW = (cw - 10) / 2

  // Поставщик
  rect(ML, y - 14, colW, 14, NAVY)
  text('ПОСТАВЩИК', ML + 6, y - 10, { size: 8, bold: true, color: WHITE })
  y -= 14

  const sellerLines = [
    seller.name,
    `ИНН: ${seller.inn}   ОГРНИП: ${seller.ogrnip}`,
    seller.address,
    `Тел: ${seller.phone}`,
    `Банк: ${seller.bank}`,
    `БИК: ${seller.bik}`,
    `Р/с: ${seller.account}`,
    `К/с: ${seller.corr_account}`,
  ]
  const sellerBlockH = sellerLines.length * 11 + 8
  rect(ML, y - sellerBlockH, colW, sellerBlockH, LGRAY)

  let sy = y - 6
  for (const ln of sellerLines) {
    text(ln, ML + 6, sy, { size: 7.5, maxWidth: colW - 12 })
    sy -= 11
  }

  // Покупатель
  const cx = ML + colW + 10
  rect(cx, y + 14, colW, 14, ORANGE)
  text('ПОКУПАТЕЛЬ', cx + 6, y + 18, { size: 8, bold: true, color: WHITE })

  const buyerLines: string[] = []
  if (data.customer_type === 'company' && data.company_name) {
    buyerLines.push(data.company_name)
    if (data.inn)           buyerLines.push(`ИНН: ${data.inn}${data.kpp ? `   КПП: ${data.kpp}` : ''}`)
    if (data.ogrn)          buyerLines.push(`ОГРН: ${data.ogrn}`)
    if (data.legal_address) buyerLines.push(data.legal_address)
    buyerLines.push(`Контакт: ${data.customer_name}`)
    buyerLines.push(`Тел: ${data.customer_phone}`)
    if (data.customer_email) buyerLines.push(data.customer_email)
    if (data.delivery_address) buyerLines.push(`Доставка: ${data.delivery_address}`)
  } else {
    buyerLines.push(data.customer_name)
    buyerLines.push(`Тел: ${data.customer_phone}`)
    if (data.customer_email) buyerLines.push(data.customer_email)
    if (data.delivery_address) buyerLines.push(`Доставка: ${data.delivery_address}`)
  }

  const buyerBlockH = Math.max(sellerBlockH, buyerLines.length * 11 + 8)
  rect(cx, y - buyerBlockH, colW, buyerBlockH, LGRAY)

  let by = y - 6
  for (const ln of buyerLines) {
    text(ln, cx + 6, by, { size: 7.5, maxWidth: colW - 12 })
    by -= 11
  }

  y -= Math.max(sellerBlockH, buyerBlockH) + 16

  // ── Таблица товаров ────────────────────────────────────────────
  // Заголовок таблицы
  const colWidths = { num: 22, article: 90, name: cw - 22 - 90 - 40 - 55 - 60, unit: 40, qty: 55, price: 60, total: 62 }
  // num | article | name | ед | кол-во | цена | сумма

  const cols = [
    { key: 'num',     label: '№',           w: colWidths.num,     align: 'center' as const },
    { key: 'article', label: 'Артикул',     w: colWidths.article, align: 'left' as const   },
    { key: 'name',    label: 'Наименование',w: colWidths.name,    align: 'left' as const   },
    { key: 'unit',    label: 'Ед.',         w: colWidths.unit,    align: 'center' as const },
    { key: 'qty',     label: 'Кол-во',      w: colWidths.qty,     align: 'center' as const },
    { key: 'price',   label: 'Цена ₽',      w: colWidths.price,   align: 'right' as const  },
    { key: 'total',   label: 'Сумма ₽',     w: colWidths.total,   align: 'right' as const  },
  ]

  const ROW_H = 16
  const HDR_H = 18

  // Шапка таблицы
  rect(ML, y - HDR_H, cw, HDR_H, NAVY)
  let cx2 = ML
  for (const col of cols) {
    const tx = col.align === 'center' ? cx2 + col.w / 2 - fontBold.widthOfTextAtSize(col.label, 7.5) / 2
               : col.align === 'right' ? cx2 + col.w - 4 - fontBold.widthOfTextAtSize(col.label, 7.5)
               : cx2 + 4
    text(col.label, tx, y - 12, { size: 7.5, bold: true, color: WHITE })
    cx2 += col.w
  }
  y -= HDR_H

  // Строки товаров
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i]
    const rowTotal = (item.price * item.quantity)
    const rowBg = i % 2 === 0 ? WHITE : LGRAY

    rect(ML, y - ROW_H, cw, ROW_H, rowBg)

    const rowData = [
      String(i + 1),
      item.article,
      item.name,
      item.unit ?? 'шт',
      String(item.quantity),
      fmt(item.price),
      fmt(rowTotal),
    ]

    let rx = ML
    for (let j = 0; j < cols.length; j++) {
      const col = cols[j]
      const val = rowData[j]
      const tx = col.align === 'center' ? rx + col.w / 2 - fontRegular.widthOfTextAtSize(val, 8) / 2
                 : col.align === 'right'  ? rx + col.w - 4 - fontRegular.widthOfTextAtSize(val, 8)
                 : rx + 4
      text(val, tx, y - 11.5, { size: 8, maxWidth: col.w - 6, color: j === 2 ? rgb(0.1,0.1,0.1) : BLACK })
      // Вертикальная линия между колонками
      if (j > 0) line(rx, y, rx, y - ROW_H, 0.3, GRAY)
      rx += col.w
    }

    // Горизонтальная линия под строкой
    line(ML, y - ROW_H, ML + cw, y - ROW_H, 0.3, GRAY)
    y -= ROW_H
  }

  // Граница таблицы
  page.drawRectangle({ x: ML, y, width: cw, height: HDR_H + data.items.length * ROW_H, color: rgb(0,0,0), opacity: 0, borderColor: NAVY, borderWidth: 0.5 })

  y -= 10

  // ── Итого ─────────────────────────────────────────────────────
  const totalColX = ML + cw - 200
  const totalColW = 200

  const totalRows = [
    { label: 'Итого без НДС:', value: fmt(data.total_price) + ' ₽' },
    { label: 'НДС:',           value: 'Не облагается' },
    { label: 'ИТОГО К ОПЛАТЕ:', value: fmt(data.total_price) + ' ₽', bold: true, big: true },
  ]

  for (const row of totalRows) {
    if (row.big) {
      rect(totalColX, y - 18, totalColW, 18, ORANGE)
      text(row.label, totalColX + 6, y - 13, { size: 9, bold: true, color: WHITE })
      text(row.value, totalColX + totalColW - 6 - fontBold.widthOfTextAtSize(row.value, 10), y - 12.5,
           { size: 10, bold: true, color: WHITE })
      y -= 22
    } else {
      line(totalColX, y, totalColX + totalColW, y, 0.5, LGRAY)
      text(row.label, totalColX + 6, y - 11, { size: 8, color: GRAY })
      text(row.value, totalColX + totalColW - 6 - fontRegular.widthOfTextAtSize(row.value, 8), y - 11,
           { size: 8, color: BLACK })
      y -= 14
    }
  }

  y -= 8

  // Сумма прописью
  rect(ML, y - 20, cw, 20, rgb(0.97, 0.97, 0.97))
  const rublesText = `Итого к оплате: ${rubles(data.total_price)}`
  text(rublesText, ML + 8, y - 13.5, { size: 8, bold: true, color: NAVY, maxWidth: cw - 16 })
  y -= 28

  // ── Подпись ────────────────────────────────────────────────────
  y -= 20

  line(ML, y, ML + 160, y, 0.7, BLACK)
  text('Руководитель', ML, y - 9, { size: 7.5, color: GRAY })

  const sigName = `/ ${seller.name.split(' ').slice(0, 2).join(' ')} /`
  text(sigName, ML + 70, y + 3, { size: 8 })

  // МП
  page.drawCircle({ x: ML + 260, y: y - 5, size: 22, borderColor: ORANGE, borderWidth: 0.8 })
  text('М.П.', ML + 252, y - 9, { size: 7, color: ORANGE })

  // Телефон / сайт
  y -= 40
  line(ML, y, ML + cw, y, 0.5, LGRAY)
  y -= 10
  text(`Тел: ${seller.phone}`, ML, y, { size: 7.5, color: GRAY })
  text('truckline.ru', ML + cw / 2, y, { size: 7.5, color: ORANGE })
  text('Счёт сформирован автоматически', ML + cw - 140, y, { size: 7, color: GRAY })

  // Нижняя полоса
  rect(0, 0, W, 6, NAVY)

  return pdfDoc.save()
}
