import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createHash } from 'crypto'

const ETS_API   = 'https://siteapi.etsgroup.ru'
const ETS_TOKEN = process.env.ETS_ACCESS_TOKEN || ''
const ETS_SECRET = process.env.ETS_SECRET_KEY || ''

// Нормализация артикула: убираем пробелы, тире, точки — для сравнения
function normalize(s: string) {
  return s.replace(/[\s\-\.]/g, '').toUpperCase()
}

// Подпись для ETS Group API: md5(JSON.stringify(params) + token + secret)
function etsSign(params: object) {
  return createHash('md5')
    .update(JSON.stringify(params) + ETS_TOKEN + ETS_SECRET)
    .digest('hex')
}

// Запрос к ETS Group B2B API
async function fetchEts(article: string): Promise<EtsProduct[]> {
  if (!ETS_TOKEN || !ETS_SECRET) return []
  const params = { number: article }
  const body = {
    accessToken: ETS_TOKEN,
    api_version: '1.2',
    params,
    signature: etsSign(params),
  }
  try {
    const r = await fetch(`${ETS_API}/findNumberByOem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    })
    if (!r.ok) return []
    const json = await r.json()
    if (json?.response?.error || !Array.isArray(json?.response?.data)) return []
    return json.response.data.map((item: any) => ({
      article:   item.number   || item.article || '',
      brand:     item.brand    || item.brandName || '',
      name:      item.name     || item.description || '',
      price:     item.price    || item.retailPrice || 0,
      quantity:  item.quantity || item.count || 0,
      in_stock:  (item.quantity || item.count || 0) > 0,
      delivery:  item.deliveryDays || item.delivery_days || 0,
      source:    'ets',
    }))
  } catch {
    return []
  }
}

type EtsProduct = {
  article: string; brand: string; name: string
  price: number; quantity: number; in_stock: boolean; delivery: number; source: string
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 3) {
    return NextResponse.json({ error: 'Введите минимум 3 символа' }, { status: 400 })
  }

  const norm = normalize(q)

  // 1. Поиск в нашей базе — точный артикул + fuzzy по названию
  const { data: exact } = await supabaseAdmin
    .from('products')
    .select(`id, article, name, image_url, brand:brands(name), stock(price_sell, in_stock, delivery_days, quantity)`)
    .ilike('article', `%${q}%`)
    .eq('is_active', true)
    .order('article')
    .limit(30)

  // Дополнительно — поиск по нормализованному артикулу без разделителей
  let fuzzy: any[] = []
  if ((exact?.length ?? 0) < 5) {
    const { data: f } = await supabaseAdmin
      .from('products')
      .select(`id, article, name, image_url, brand:brands(name), stock(price_sell, in_stock, delivery_days, quantity)`)
      .ilike('article', `%${norm}%`)
      .eq('is_active', true)
      .limit(20)
    fuzzy = f ?? []
  }

  // Дедупликация по id
  const seen = new Set((exact ?? []).map((p: any) => p.id))
  const our = [...(exact ?? []), ...fuzzy.filter((p: any) => !seen.has(p.id))]

  // 2. Запрос к ETS Group (если есть токен)
  const ets = await fetchEts(q)

  // 3. URL для перехода на сайт ETS Group
  const etsUrl = `https://etsgroup.ru/#!/search?q=${encodeURIComponent(q)}`
  const etsHasCredentials = !!(ETS_TOKEN && ETS_SECRET)

  return NextResponse.json({
    query: q,
    our,
    ets,
    ets_url: etsUrl,
    ets_connected: etsHasCredentials,
  })
}
