import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// NHTSA vPIC API — бесплатно, без ключа, поддерживает большинство VIN
const NHTSA = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues'

export async function GET(req: NextRequest) {
  const vin = req.nextUrl.searchParams.get('vin')?.trim().toUpperCase()

  if (!vin || vin.length !== 17) {
    return NextResponse.json({ error: 'VIN должен содержать ровно 17 символов' }, { status: 400 })
  }

  // 1. Расшифровываем VIN через NHTSA
  let make = '', model = '', year = '', bodyClass = '', engine = ''
  try {
    const r = await fetch(`${NHTSA}/${vin}?format=json`, { next: { revalidate: 86400 } })
    const data = await r.json()
    const res = data?.Results?.[0] ?? {}
    make      = res.Make        || ''
    model     = res.Model       || ''
    year      = res.ModelYear   || ''
    bodyClass = res.BodyClass   || ''
    engine    = [res.DisplacementL && `${res.DisplacementL}L`, res.EngineCylinders && `${res.EngineCylinders} цил.`]
                  .filter(Boolean).join(' ')
  } catch {
    return NextResponse.json({ error: 'Не удалось расшифровать VIN. Проверьте правильность ввода.' }, { status: 502 })
  }

  if (!make) {
    return NextResponse.json({ error: 'VIN не распознан. Возможно, это нестандартный или некорректный номер.' }, { status: 404 })
  }

  // 2. Ищем товары в нашей базе по марке
  // Ищем бренд по названию (частичное совпадение)
  const makeSearch = make.toLowerCase()
  const { data: brands } = await supabaseAdmin
    .from('brands')
    .select('id, name')
    .ilike('name', `%${makeSearch}%`)
    .limit(5)

  let products: any[] = []
  if (brands && brands.length > 0) {
    const brandIds = brands.map((b: any) => b.id)
    const { data: prods } = await supabaseAdmin
      .from('products')
      .select(`
        id, article, name, image_url,
        brand:brands(name),
        stock(price_sell, in_stock, delivery_days)
      `)
      .in('brand_id', brandIds)
      .eq('is_active', true)
      .limit(24)
    products = prods ?? []
  }

  return NextResponse.json({
    vin,
    vehicle: { make, model, year, bodyClass, engine },
    products,
    brandsFound: brands?.map((b: any) => b.name) ?? [],
  })
}
