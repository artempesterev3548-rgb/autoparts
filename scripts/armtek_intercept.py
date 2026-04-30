"""
Шаг 1: Разведка — перехватываем реальные API-запросы Армтека через браузер.
Запуск: python3 armtek_intercept.py

Скрипт откроет браузер, пройдёт по Армтеку и сохранит:
- Реальные API-эндпоинты
- Заголовки запросов (User-Agent, Cookie, Authorization и т.д.)
- Структуру ответов (формат данных, поля)

Результат: armtek_api_config.json — используется в armtek_parser.py
"""

import asyncio
import json
import re
from urllib.parse import urlparse
from playwright.async_api import async_playwright

ARMTEK_SEARCH = "https://armtek.ru/search"
OUTPUT_FILE   = "armtek_api_config.json"

# Категории которые нас интересуют (по ключевым словам из URL Армтека)
TARGET_KEYWORDS = [
    "dvigatel", "engine", "transmiss", "podveska", "suspension",
    "tormoz", "brake", "electro", "toplivn", "fuel", "ohlazhd",
    "filter", "kuzo", "exhaust", "vyhlop",
]

captured = {
    "search_api": None,
    "catalog_api": None,
    "price_api": None,
    "headers": {},
    "sample_responses": {},
    "cookies": [],
}

def is_api_request(url):
    """Отфильтровываем только JSON-API запросы, не статику."""
    parsed = urlparse(url)
    skip = ['.js', '.css', '.png', '.jpg', '.svg', '.woff', '.ico', '.mp4']
    if any(parsed.path.endswith(s) for s in skip):
        return False
    if 'fonts' in parsed.path or 'static' in parsed.path:
        return False
    return True


async def capture_api_calls(article: str = "740.1002010"):
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=False,  # видимый — помогает пройти DDoS-Guard
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"]
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/122.0.0.0 Safari/537.36",
            viewport={"width": 1440, "height": 900},
            locale="ru-RU",
        )

        api_calls = []

        async def on_request(request):
            url = request.url
            if not is_api_request(url):
                return
            # Сохраняем только XHR/fetch
            if request.resource_type in ("xhr", "fetch"):
                api_calls.append({
                    "url":     url,
                    "method":  request.method,
                    "headers": dict(request.headers),
                    "post":    request.post_data,
                })

        async def on_response(response):
            url = response.url
            if not is_api_request(url):
                return
            if response.request.resource_type not in ("xhr", "fetch"):
                return
            try:
                ct = response.headers.get("content-type", "")
                if "json" not in ct:
                    return
                body = await response.json()
                api_calls[-1]["response_sample"] = body if isinstance(body, dict) else {"list": body[:3] if isinstance(body, list) else body}
                api_calls[-1]["status"] = response.status
            except Exception:
                pass

        page = await context.new_page()

        # Stealth: скрываем признаки автоматизации
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            Object.defineProperty(navigator, 'plugins', {get: () => [1,2,3,4,5]});
            window.chrome = {runtime: {}};
        """)

        page.on("request", on_request)
        page.on("response", on_response)

        print("⏳ Открываю armtek.ru (ждём 15 сек на DDoS-Guard)...")
        try:
            await page.goto("https://armtek.ru", wait_until="load", timeout=60000)
        except Exception:
            pass
        await asyncio.sleep(8)  # ждём JS-челлендж DDoS-Guard

        print(f"🔍 Ищу артикул: {article}")
        try:
            await page.goto(f"https://armtek.ru/search?query={article}",
                            wait_until="load", timeout=45000)
        except Exception:
            pass
        await asyncio.sleep(5)

        # Попробуем ещё один артикул
        try:
            await page.goto("https://armtek.ru/search?query=853.1601130",
                            wait_until="load", timeout=30000)
        except Exception:
            pass
        await asyncio.sleep(3)

        # Сохраняем куки
        cookies = await context.cookies()
        captured["cookies"] = [
            {"name": c["name"], "value": c["value"], "domain": c["domain"]}
            for c in cookies
        ]

        await browser.close()

        # ── Анализируем собранные вызовы ──────────────────────────────────
        print(f"\n📦 Перехвачено API-вызовов: {len(api_calls)}")

        search_apis, catalog_apis, price_apis, other = [], [], [], []

        for call in api_calls:
            url = call["url"].lower()
            if any(k in url for k in ["search", "query", "find"]):
                search_apis.append(call)
            elif any(k in url for k in ["catalog", "categor", "tree", "group"]):
                catalog_apis.append(call)
            elif any(k in url for k in ["price", "stock", "avail", "balance"]):
                price_apis.append(call)
            else:
                other.append(call)

        print(f"  🔍 Search API:  {len(search_apis)}")
        print(f"  📂 Catalog API: {len(catalog_apis)}")
        print(f"  💰 Price API:   {len(price_apis)}")
        print(f"  ❓ Другие:      {len(other)}")

        # Берём лучший пример каждого типа
        result = {
            "search_api":  search_apis[0]  if search_apis  else None,
            "catalog_api": catalog_apis[0] if catalog_apis else None,
            "price_api":   price_apis[0]   if price_apis   else None,
            "all_apis":    api_calls[:50],  # первые 50 для анализа
            "cookies":     captured["cookies"],
        }

        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print(f"\n✅ Конфиг сохранён: {OUTPUT_FILE}")
        print("\n📋 Все перехваченные URL:")
        seen = set()
        for c in api_calls:
            base = re.sub(r'\?.*', '', c["url"])
            if base not in seen:
                seen.add(base)
                print(f"  {c['method']:4s}  {c['url'][:120]}")

        return result


if __name__ == "__main__":
    asyncio.run(capture_api_calls())
