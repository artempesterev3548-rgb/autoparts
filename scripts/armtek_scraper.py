"""
Armtek.ru → Supabase scraper
Запуск: python3 scripts/armtek_scraper.py
Аргументы: --batch 200 --sitemap-start 1 --sitemap-end 5
"""

import os, sys, json, time, gzip, re, urllib.request, urllib.error, ssl, argparse
from datetime import datetime, timezone

# ── Конфиг ──────────────────────────────────────────────────────────────────
# os.getenv возвращает "" если секрет не задан в GitHub → используем `or` для fallback
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or "https://wsnbtfuurxinoonyjhxh.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbmJ0ZnV1cnhpbm9vbnlqaHhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ2MTc2OSwiZXhwIjoyMDkzMDM3NzY5fQ.GqiQFgHrLOaVDglbeS5986dbJg36kYp5frhpl5Ea9fU"
ARMTEK_BASE      = "https://armtek.ru/rest/ru"
SITEMAP_BASE     = "https://armtek.ru/sitemap/product/product_{n}.xml.gz"
DELAY            = 0.2   # секунд между запросами (0.2 = ~25 000 товаров за 6 часов)
ARMTEK_SUPPLIER_ID = 4   # ID поставщика "Armtek" в таблице suppliers

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

# ── HTTP helpers ─────────────────────────────────────────────────────────────
# Статичные заголовки Armtek, обнаруженные через Playwright
ARMTEK_STATIC_HEADERS = {
    "x-auth-token":        "nJhNK87gJOOU6dfr",
    "x-ca-external-system": "IM_RU",
    "x-ca-vkorg":          "4000",
    "x-auth-system":       "AUTH_MICROSERVICE_V1_ARMTEK_RU",
}

def http_get(url, headers=None, timeout=15):
    h = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "ru-RU,ru;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Origin": "https://armtek.ru",
        "Referer": "https://armtek.ru/",
    }
    h.update(ARMTEK_STATIC_HEADERS)
    if headers: h.update(headers)
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, context=ssl_ctx, timeout=timeout) as r:
        data = r.read()
        try: return json.loads(gzip.decompress(data))
        except: return json.loads(data)

def http_post(url, body, headers=None, timeout=15):
    h = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "ru-RU,ru;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json",
        "Origin": "https://armtek.ru",
        "Referer": "https://armtek.ru/",
        "X-Requested-With": "XMLHttpRequest",
    }
    h.update(ARMTEK_STATIC_HEADERS)
    if headers: h.update(headers)
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=h, method="POST")
    with urllib.request.urlopen(req, context=ssl_ctx, timeout=timeout) as r:
        raw = r.read()
        try: return json.loads(gzip.decompress(raw))
        except: return json.loads(raw)

def supabase_upsert(table, rows, on_conflict="article"):
    """Пробуем upsert, если нет уникального ключа — делаем обычный INSERT (игнорируем дубли)"""
    url = f"{SUPABASE_URL}/rest/v1/{table}?on_conflict={on_conflict}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }
    data = json.dumps(rows).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=30) as r:
            return r.status
    except urllib.error.HTTPError as e:
        body = e.read()
        # Нет уникального constraint — пробуем обычный INSERT (ignore duplicates)
        if e.code == 400 and b"42P10" in body:
            return supabase_insert_ignore(table, rows)
        print(f"  Supabase error {e.code}: {body[:200]}")
        return e.code

def supabase_insert_ignore(table, rows):
    """INSERT без upsert — Prefer: return=minimal + игнорируем 409"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    data = json.dumps(rows).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=30) as r:
            return r.status
    except urllib.error.HTTPError as e:
        if e.code == 409:  # duplicate
            return 200
        body = e.read()
        print(f"  Supabase insert error {e.code}: {body[:200]}")
        return e.code

def supabase_get(table, params=""):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{params}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Accept": "application/json",
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ssl_ctx, timeout=15) as r:
        return json.loads(r.read())

# ── Armtek API ───────────────────────────────────────────────────────────────
_token = None
HAS_SOURCE_COLS = False

def get_guest_token():
    global _token
    if _token: return _token
    resp = http_post(f"{ARMTEK_BASE}/auth-microservice/v1/guest", {})
    _token = resp["data"]["accessToken"]
    print(f"  Guest token: {_token[:40]}...")
    return _token

def get_product_by_slug(slug, token):
    """Получаем artid, brand, name, article (pin), photo"""
    try:
        url = f"{ARMTEK_BASE}/assortment-microservice/v1/market-article/alias/{slug}"
        resp = http_get(url, {"Authorization": f"Bearer {token}"})
        return resp.get("data") or {}
    except Exception as e:
        print(f"  ⚠️  market-article error for {slug[:40]}: {e}")
        return {}

def get_product_photo(slug, token):
    """Получаем URL фото товара"""
    try:
        url = f"{ARMTEK_BASE}/assortment-microservice/v1/articles/details/alias/resources/{slug}?weightUnitType=kg&lengthUnitType=cm&country=ru"
        resp = http_get(url, {"Authorization": f"Bearer {token}"})
        return resp.get("data", {}).get("mainPhoto") or resp.get("data", {}).get("resources", {}).get("images", [{}])[0].get("500x500")
    except:
        return None

def get_prices(artid, token):
    """Получаем цены и наличие — с retry при 429"""
    body = {
        "query": "VZ",
        "artId": artid,
        "page": 1,
        "cacheKey": "",
        "userInfo": {"VKORG": "4000", "VSTELS_LIST": ["ME86"]},
        "isServer": False
    }
    for attempt in range(3):
        try:
            resp = http_post(
                f"{ARMTEK_BASE}/search-microservice/v1/search/by-related",
                body,
                {"Authorization": f"Bearer {token}"}
            )
            articles = resp.get("data", {}).get("articlesData", [])
            if not articles: return None, False, None
            best = articles[0]
            suggestions = best.get("SUGGESTIONS", [best])
            if not suggestions: return None, False, None
            s = suggestions[0]
            price = float(s.get("PRICES1") or s.get("PRICEP") or 0)
            in_stock_val = int(s.get("NUMZAK") or 0)
            delivery_raw = s.get("DLVDT") or ""
            return price if price > 0 else None, in_stock_val > 0, delivery_raw
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = (attempt + 1) * 3  # 3с, 6с, 9с
                time.sleep(wait)
                continue
            print(f"  ⚠️  prices error for artid={artid}: {e}")
            return None, False, None
        except Exception as e:
            print(f"  ⚠️  prices error for artid={artid}: {e}")
            return None, False, None
    # Все попытки исчерпаны — пропускаем цену, товар всё равно вставим
    return None, False, None

# ── Sitemap → slugs ──────────────────────────────────────────────────────────
def get_slugs_from_sitemap(n):
    """Скачивает sitemap файл #n и возвращает список slug-ов"""
    url = SITEMAP_BASE.format(n=n)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=30) as r:
            xml = gzip.decompress(r.read()).decode("utf-8", errors="ignore")
        locs = re.findall(r"<loc>(https://armtek\.ru/product/([^<]+))</loc>", xml)
        return [(slug, full_url) for full_url, slug in locs]
    except Exception as e:
        print(f"  ⚠️  sitemap {n} error: {e}")
        return []

# ── Категории и бренды из Supabase ───────────────────────────────────────────
def get_or_create_brand(name, brand_cache):
    if name in brand_cache: return brand_cache[name]
    # Проверяем существующий
    rows = supabase_get("brands", f"name=eq.{urllib.parse.quote(name)}&select=id")
    if rows:
        brand_cache[name] = rows[0]["id"]
        return rows[0]["id"]
    # Создаём новый
    result = http_post_supabase("brands", {
        "name": name, "section": "both", "is_active": True
    })
    if result and result.get("id"):
        brand_cache[name] = result["id"]
        return result["id"]
    return None

def http_post_supabase(table, row):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    data = json.dumps(row).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=15) as r:
            rows = json.loads(r.read())
            return rows[0] if rows else None
    except:
        return None

# Заглушка для urllib.parse
import urllib.parse

# ── Главная логика ───────────────────────────────────────────────────────────
def scrape_batch(sitemap_start, sitemap_end, batch_size):
    print(f"\n🚀 Armtek scraper: sitemap {sitemap_start}–{sitemap_end}, batch {batch_size}")
    print(f"   Supabase: {SUPABASE_URL}")

    token = get_guest_token()

    # Загружаем кеши
    brand_cache = {}
    existing_brands = supabase_get("brands", "select=id,name&limit=200")
    for b in existing_brands:
        brand_cache[b["name"]] = b["id"]
    print(f"   Загружено брендов из БД: {len(brand_cache)}")

    # Первый доступный category_id (для Двигатель, по умолчанию)
    cats = supabase_get("categories", "slug=eq.dvigatel&select=id")
    default_cat_id = cats[0]["id"] if cats else None

    # Проверяем наличие расширенных колонок
    global HAS_SOURCE_COLS
    try:
        sample = supabase_get("products", "limit=1&select=source")
        HAS_SOURCE_COLS = True
        print("   ✅ Расширенные колонки (source, source_slug, source_artid) найдены")
    except Exception:
        HAS_SOURCE_COLS = False
        print("   ⚠️  Расширенные колонки отсутствуют — работаем без них")

    # Загружаем уже сохранённые source_slug чтобы пропускать дубли без API-запроса
    existing_slugs: set = set()
    if HAS_SOURCE_COLS:
        try:
            page_n, page_size = 0, 1000
            while True:
                rows = supabase_get("products", f"select=source_slug&source=eq.armtek&source_slug=not.is.null&limit={page_size}&offset={page_n*page_size}")
                for r in rows:
                    if r.get("source_slug"):
                        existing_slugs.add(r["source_slug"])
                if len(rows) < page_size:
                    break
                page_n += 1
            print(f"   Уже в базе: {len(existing_slugs)} armtek-товаров (будут пропущены)")
        except Exception as e:
            print(f"   ⚠️  Не удалось загрузить existing slugs: {e}")

    processed = 0
    inserted  = 0
    skipped   = 0

    for sitemap_n in range(sitemap_start, sitemap_end + 1):
        if processed >= batch_size:
            break
        print(f"\n📄 Sitemap #{sitemap_n}...")
        slugs = get_slugs_from_sitemap(sitemap_n)
        print(f"   {len(slugs)} товаров")

        for slug, full_url in slugs:
            if processed >= batch_size:
                break

            # Пропускаем уже загруженные товары
            if slug in existing_slugs:
                skipped += 1
                continue

            # 1. Основные данные
            time.sleep(DELAY)
            info = get_product_by_slug(slug, token)
            if not info or not info.get("artid"):
                continue

            artid   = info["artid"]
            article = info.get("pin") or slug
            name    = info.get("name") or slug
            brand_name = info.get("brand") or ""
            photo   = info.get("photo")

            # 2. Цены
            time.sleep(DELAY)
            price, in_stock, delivery_raw = get_prices(artid, token)

            # 3. Бренд
            brand_id = brand_cache.get(brand_name)
            if not brand_id and brand_name:
                result = http_post_supabase("brands", {
                    "name": brand_name, "section": "both", "is_active": True
                })
                if result:
                    brand_id = result["id"]
                    brand_cache[brand_name] = brand_id

            # 4. Upsert товара
            product_row = {
                "article": article[:100],
                "name": name[:500],
                "brand_id": brand_id,
                "category_id": default_cat_id,
                "image_url": photo,
                "is_active": True,
            }
            # Добавляем расширенные поля если они уже созданы в БД
            if HAS_SOURCE_COLS:
                product_row["source"]       = "armtek"
                product_row["source_slug"]  = slug[:255]
                product_row["source_artid"] = artid

            status = supabase_upsert("products", [product_row], on_conflict="article")

            # 5. Если есть цена — обновляем/создаём запись в stock
            if price and status in (200, 201):
                prods = supabase_get("products", f"article=eq.{urllib.parse.quote(article)}&select=id")
                if prods:
                    prod_id = prods[0]["id"]
                    stock_row = {
                        "product_id": prod_id,
                        "supplier_id": ARMTEK_SUPPLIER_ID,
                        "price_sell": round(price, 2),
                        "price_buy": round(price * 0.85, 2),
                        "in_stock": in_stock,
                        "quantity": 10 if in_stock else 0,
                        "delivery_days": 1 if in_stock else 5,
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                    }
                    supabase_upsert("stock", [stock_row], on_conflict="product_id")

            processed += 1
            inserted  += 1 if status in (200, 201) else 0

            if processed % 10 == 0:
                print(f"   ✅ {processed}/{batch_size} | вставлено: {inserted} | пропущено: {skipped} | {name[:40]}")

    print(f"\n✅ Готово: {processed} обработано, {inserted} вставлено/обновлено, {skipped} пропущено (уже в базе)")

# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Armtek → Supabase scraper")
    parser.add_argument("--sitemap-start", type=int, default=1, help="Первый номер sitemap файла")
    parser.add_argument("--sitemap-end",   type=int, default=3, help="Последний номер sitemap файла")
    parser.add_argument("--batch",         type=int, default=100, help="Макс. товаров за запуск")
    args = parser.parse_args()
    scrape_batch(args.sitemap_start, args.sitemap_end, args.batch)
