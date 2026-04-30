import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// NHTSA vPIC API — бесплатно, без ключа
const NHTSA = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues'

// WMI (первые 3 символа VIN) → производитель
// Покрывает Россию, Европу, Азию — то что NHTSA не знает
const WMI: Record<string, { make: string; country: string }> = {
  // Россия
  XTA: { make: 'LADA', country: 'Россия' },
  XTT: { make: 'LADA', country: 'Россия' },
  X7L: { make: 'LADA', country: 'Россия' },
  X96: { make: 'LADA', country: 'Россия' },
  XUF: { make: 'GAZ', country: 'Россия' },
  XUU: { make: 'GAZ', country: 'Россия' },
  X9F: { make: 'GAZ', country: 'Россия' },
  XTC: { make: 'UAZ', country: 'Россия' },
  XWB: { make: 'UAZ', country: 'Россия' },
  Y6D: { make: 'KAMAZ', country: 'Россия' },
  XVN: { make: 'MAZ', country: 'Беларусь' },
  // Германия
  WBA: { make: 'BMW', country: 'Германия' },
  WBS: { make: 'BMW', country: 'Германия' },
  WBY: { make: 'BMW', country: 'Германия' },
  WDB: { make: 'Mercedes-Benz', country: 'Германия' },
  WDC: { make: 'Mercedes-Benz', country: 'Германия' },
  WDD: { make: 'Mercedes-Benz', country: 'Германия' },
  WEB: { make: 'Mercedes-Benz', country: 'Германия' },
  WVW: { make: 'Volkswagen', country: 'Германия' },
  WV1: { make: 'Volkswagen', country: 'Германия' },
  WV2: { make: 'Volkswagen', country: 'Германия' },
  WV3: { make: 'Volkswagen', country: 'Германия' },
  WAU: { make: 'Audi', country: 'Германия' },
  WA1: { make: 'Audi', country: 'Германия' },
  WP0: { make: 'Porsche', country: 'Германия' },
  WP1: { make: 'Porsche', country: 'Германия' },
  W0L: { make: 'Opel', country: 'Германия' },
  // Швеция
  YV1: { make: 'Volvo', country: 'Швеция' },
  YV4: { make: 'Volvo', country: 'Швеция' },
  XLS: { make: 'Volvo', country: 'Швеция' },
  YS2: { make: 'Scania', country: 'Швеция' },
  YS3: { make: 'Saab', country: 'Швеция' },
  // Франция
  VF1: { make: 'Renault', country: 'Франция' },
  VF2: { make: 'Renault', country: 'Франция' },
  VF3: { make: 'Peugeot', country: 'Франция' },
  VF7: { make: 'Citroën', country: 'Франция' },
  VF9: { make: 'Bugatti', country: 'Франция' },
  // Италия
  ZAR: { make: 'Alfa Romeo', country: 'Италия' },
  ZFF: { make: 'Ferrari', country: 'Италия' },
  ZLA: { make: 'Lancia', country: 'Италия' },
  // Корея
  KMH: { make: 'Hyundai', country: 'Корея' },
  KNA: { make: 'KIA', country: 'Корея' },
  KNB: { make: 'KIA', country: 'Корея' },
  KNC: { make: 'KIA', country: 'Корея' },
  // Япония
  JHM: { make: 'Honda', country: 'Япония' },
  JTD: { make: 'Toyota', country: 'Япония' },
  JTJ: { make: 'Toyota', country: 'Япония' },
  JN1: { make: 'Nissan', country: 'Япония' },
  JN6: { make: 'Nissan', country: 'Япония' },
  JA3: { make: 'Mitsubishi', country: 'Япония' },
  JA4: { make: 'Mitsubishi', country: 'Япония' },
  JS1: { make: 'Suzuki', country: 'Япония' },
  JS2: { make: 'Suzuki', country: 'Япония' },
  JS3: { make: 'Suzuki', country: 'Япония' },
  // Китай
  LSG: { make: 'Chevrolet', country: 'Китай' },
  LHG: { make: 'Honda', country: 'Китай' },
  LDN: { make: 'Nissan', country: 'Китай' },
  LFV: { make: 'Volkswagen', country: 'Китай' },
  // Чехия
  TMB: { make: 'Skoda', country: 'Чехия' },
  // Испания
  VSS: { make: 'SEAT', country: 'Испания' },
  // Великобритания
  SAJ: { make: 'Jaguar', country: 'Великобритания' },
  SAL: { make: 'Land Rover', country: 'Великобритания' },
}

// Год по 10-й позиции VIN (стандарт ISO 3779)
const YEAR_MAP: Record<string, number> = {
  A:2010, B:2011, C:2012, D:2013, E:2014, F:2015, G:2016, H:2017,
  J:2018, K:2019, L:2020, M:2021, N:2022, P:2023, R:2024, S:2025,
  T:2026, V:1997, W:1998, X:1999, Y:2000,
  '1':2001,'2':2002,'3':2003,'4':2004,'5':2005,'6':2006,'7':2007,'8':2008,'9':2009,
}

export async function GET(req: NextRequest) {
  const vin = req.nextUrl.searchParams.get('vin')?.trim().toUpperCase()

  if (!vin || vin.length !== 17) {
    return NextResponse.json({ error: 'VIN должен содержать ровно 17 символов' }, { status: 400 })
  }

  let make = '', model = '', year = '', bodyClass = '', engine = '', country = ''

  // 1. Пробуем NHTSA (хорошо знает американский рынок и часть азиатских VIN)
  try {
    const r = await fetch(`${NHTSA}/${vin}?format=json`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    })
    const data = await r.json()
    const res = data?.Results?.[0] ?? {}
    make      = res.Make      || ''
    model     = res.Model     || ''
    year      = res.ModelYear || ''
    bodyClass = res.BodyClass || ''
    engine    = [res.DisplacementL && `${parseFloat(res.DisplacementL).toFixed(1)}L`,
                 res.EngineCylinders && `${res.EngineCylinders} цил.`].filter(Boolean).join(' ')
  } catch { /* NHTSA недоступен — идём в WMI */ }

  // 2. Если NHTSA не дал марку — ищем по WMI-таблице
  if (!make) {
    const wmi = WMI[vin.slice(0, 3)]
    if (wmi) {
      make    = wmi.make
      country = wmi.country
      year    = year || String(YEAR_MAP[vin[9]] || '')
    }
  }

  if (!make) {
    return NextResponse.json({
      error: 'VIN не распознан. Проверьте правильность ввода — возможно, это нестандартный номер.',
    }, { status: 404 })
  }

  // 3. Ищем товары в нашей базе по марке (частичное совпадение)
  const { data: brands } = await supabaseAdmin
    .from('brands')
    .select('id, name')
    .ilike('name', `%${make.split(' ')[0].toLowerCase()}%`)
    .limit(5)

  let products: any[] = []
  if (brands && brands.length > 0) {
    const brandIds = brands.map((b: any) => b.id)
    const { data: prods } = await supabaseAdmin
      .from('products')
      .select(`id, article, name, image_url, brand:brands(name), stock(price_sell, in_stock, delivery_days)`)
      .in('brand_id', brandIds)
      .eq('is_active', true)
      .limit(24)
    products = prods ?? []
  }

  return NextResponse.json({
    vin,
    vehicle: { make, model, year, bodyClass, engine, country },
    products,
    brandsFound: brands?.map((b: any) => b.name) ?? [],
  })
}
