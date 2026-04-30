"""
Парсер Армтека — использует реальные API-эндпоинты, перехваченные браузером.

API:
  POST /rest/ru/search-microservice/v1/search          → артикулы (без цен)
  POST /rest/ru/search-microservice/v1/search/all-suggestions  → цены/наличие

Режимы:
  python3 armtek_parser.py --mode discover  # открываем каталог по ключевым словам
  python3 armtek_parser.py --mode delta     # обновляем цены/наличие уже известных
  python3 armtek_parser.py --mode check     # статистика БД
  python3 armtek_parser.py --mode index     # создать индексы (один раз)
"""

import asyncio
import aiohttp
import asyncpg
import json
import argparse
import hashlib
import re
import time
from datetime import datetime, timedelta
from typing import Optional

# ── Константы ─────────────────────────────────────────────────────────────────
DB_URL      = "postgresql://postgres:vocrer-ryhfy8-vYhnuz@db.wsnbtfuurxinoonyjhxh.supabase.co:5432/postgres"
SUPPLIER_ID = 2
CONCURRENT       = 50    # параллельных запросов к Армтеку
QUERY_CONCURRENT = 8     # одновременно обрабатываемых поисковых запросов
BATCH_SIZE  = 200         # товаров за один DB-batch
MIN_PRICE   = 100         # ₽ — фильтр снизу
MAX_PRICE   = 800_000     # ₽ — фильтр сверху
MARKUP      = 1.30        # наценка 30%
SKIP_FRESH  = 4           # не обновлять если свежее N часов

BASE_URL    = "https://armtek.ru/rest/ru"
SEARCH_URL  = f"{BASE_URL}/search-microservice/v1/search"
PRICE_URL   = f"{BASE_URL}/search-microservice/v1/search/all-suggestions"

# JWT из перехваченного браузером сеанса — действует до 2027 года
# Обновить через: python3 armtek_intercept.py → armtek_api_config.json
JWT = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJleHAiOjE4MDg2NTg3NDcsImtleSI6IjU0Zjk5YjhiNGUxMTQ1YmU0NmYzZWI0YzllMWVhZTg0IiwidHlwZSI6Imc5WCIsImRhdGEiOnsibG9naW4iOiJHVUVTVF8xNzc3NTU0NzQ3NTkwNzI0IiwidXVpZCI6Ikc0M2VlZTU0MjljNjNmZmRjYjVmYmFjMzFiNTI1ZTk1NiIsInV0eXBlIjoiRyIsInVmdW5jdGlvbiI6bnVsbCwiYWNsU2NoZW1lVHlwZSI6IltcImYwOGI3YzdkLTkxMGQtNDE5MC0zMWVhLWYxOGRmNGIzMTBjMlwiXSJ9fQ=="
    ".wy3rT53TlAlPat6zND3q2CnxZ0nZXg/WRnZyH8AL0kE="
)

HEADERS = {
    "Authorization":      f"Bearer {JWT}",
    "x-auth-token":       "nJhNK87gJOOU6dfr",
    "x-ca-external-system": "IM_RU",
    "x-ca-vkorg":         "4000",
    "Content-Type":       "application/json",
    "Accept":             "application/json",
    "Accept-Language":    "ru-RU,ru;q=0.9",
    "User-Agent":         "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Referer":            "https://armtek.ru/",
    "Origin":             "https://armtek.ru",
}

USER_INFO = {"VKORG": "4000", "VSTELS_LIST": ["ME86"]}

# ── Поисковые запросы для обхода каталога ─────────────────────────────────────
# Каждый запрос → список артикулов → цены → запись в БД
DISCOVER_QUERIES = [
    # ── Двигатель (базовые) ───────────────────────────────────────────────────
    "поршень", "поршневые кольца", "вкладыши коренные", "вкладыши шатунные",
    "прокладка головки блока", "клапан выпускной", "клапан впускной",
    "распределительный вал", "коленвал", "маховик", "шатун",
    "масляный насос", "масляный фильтр", "масляный поддон",
    "помпа охлаждения", "термостат", "патрубок радиатора", "радиатор охлаждения",
    "ремень ГРМ", "цепь ГРМ", "натяжитель ГРМ", "успокоитель цепи",
    # ── Трансмиссия ──────────────────────────────────────────────────────────
    "диск сцепления", "корзина сцепления", "выжимной подшипник",
    "кардан", "крестовина карданного вала", "ШРУС", "граната",
    "подшипник ступицы", "ступица", "полуось",
    # ── Подвеска / Рулевое ────────────────────────────────────────────────────
    "амортизатор", "пружина подвески", "шаровая опора", "рычаг подвески",
    "сайлентблок", "стабилизатор поперечной устойчивости", "стойка стабилизатора",
    "рулевая тяга", "рулевой наконечник", "рулевая рейка",
    # ── Тормоза ──────────────────────────────────────────────────────────────
    "тормозные колодки передние", "тормозные колодки задние",
    "тормозной диск", "тормозной барабан", "тормозной суппорт",
    "тормозной цилиндр", "вакуумный усилитель", "датчик ABS",
    # ── Электрика ─────────────────────────────────────────────────────────────
    "генератор", "стартер", "аккумулятор", "свечи зажигания",
    "свечи накаливания", "катушка зажигания", "датчик температуры",
    "датчик кислорода", "лямбда зонд", "регулятор напряжения",
    # ── Фильтры / Топливо ─────────────────────────────────────────────────────
    "воздушный фильтр", "фильтр салона", "топливный фильтр",
    "топливный насос", "форсунка", "дроссельная заслонка",
    # ── Резинотехника / Выхлоп ───────────────────────────────────────────────
    "сальник коленвала", "сальник распредвала", "прокладка клапанной крышки",
    "манжета", "резиновый пыльник", "гофра выхлопной",
    # ── Спецтехника / Грузовые (общие) ───────────────────────────────────────
    "КАМАЗ двигатель", "ЯМЗ двигатель", "МАЗ запчасти", "ЗИЛ запчасти",
    "УРАЛ запчасти", "турбина КАМАЗ", "топливная аппаратура ТНВД",

    # ══════════════════════════════════════════════════════════════════════════
    # РАСШИРЕНИЕ: более детальные и специфичные запросы
    # ══════════════════════════════════════════════════════════════════════════

    # ── Двигатель (детальные) ─────────────────────────────────────────────────
    "гильза цилиндра", "поршневой палец", "заглушка блока",
    "прокладка выпускного коллектора", "прокладка впускного коллектора",
    "прокладка поддона", "прокладка помпы", "сальник клапана",
    "толкатель клапана", "пружина клапана", "рокер коромысло",
    "турбокомпрессор", "интеркулер", "заслонка EGR", "клапан EGR",
    "маслосъёмный колпачок", "маслозаливная горловина", "щуп масла",
    "натяжной ролик ремня", "обводной ролик ремня", "ролик ГРМ",
    # ── Охлаждение ───────────────────────────────────────────────────────────
    "расширительный бачок", "крышка радиатора", "вентилятор охлаждения",
    "муфта вентилятора", "шланг охлаждения", "антифриз тосол",
    "радиатор печки", "кран печки", "моторчик печки",
    # ── Трансмиссия (детальные) ───────────────────────────────────────────────
    "синхронизатор КПП", "вилка переключения", "подшипник КПП",
    "манжета КПП", "сальник КПП", "масло КПП трансмиссионное",
    "редуктор моста", "подшипник дифференциала", "шестерня главной пары",
    "раздаточная коробка", "вал привода колеса", "ШРУС внутренний",
    "ШРУС наружный", "хомут привода", "пыльник ШРУС",
    # ── Подвеска (детальные) ──────────────────────────────────────────────────
    "опора стойки", "отбойник амортизатора", "пыльник амортизатора",
    "втулка стабилизатора", "тяга стабилизатора", "сайлентблок рычага",
    "сайлентблок подрамника", "шаровая рычага", "опора шаровая",
    "рулевой карданчик", "рейка рулевая", "насос ГУР", "бачок ГУР",
    "шланг ГУР", "колонка рулевая", "крестовина рулевого вала",
    # ── Тормоза (детальные) ───────────────────────────────────────────────────
    "тормозной шланг", "тормозной трубопровод", "главный тормозной цилиндр",
    "рабочий тормозной цилиндр", "суппорт задний", "суппорт передний",
    "ремкомплект суппорта", "ремкомплект тормозного цилиндра",
    "тросик ручника", "кронштейн суппорта", "направляющая суппорта",
    # ── Электрика (детальные) ─────────────────────────────────────────────────
    "выключатель зажигания", "реле поворотников", "реле стеклоочистителя",
    "мотор стеклоочистителя", "трапеция стеклоочистителя", "щётки генератора",
    "диодный мост генератора", "щёточный узел стартера", "обгонная муфта стартера",
    "датчик давления масла", "датчик уровня топлива", "датчик скорости",
    "датчик положения коленвала", "датчик распредвала", "датчик детонации",
    "лямбда-зонд передний", "лямбда-зонд задний", "катализатор",
    "датчик MAF расходомер воздуха", "датчик MAP давления",
    # ── Топливная система ─────────────────────────────────────────────────────
    "топливный фильтр тонкой очистки", "топливный регулятор давления",
    "форсунка бензиновая", "форсунка дизельная", "ТНВД",
    "плунжер ТНВД", "форсунка Common Rail", "трубка высокого давления",
    "сепаратор топлива", "подкачивающий насос", "топливный бак",
    # ── Кузов / Навесное ──────────────────────────────────────────────────────
    "крыло переднее", "бампер передний", "бампер задний",
    "петля двери", "замок двери", "ручка двери",
    "стекло лобовое", "уплотнитель стекла", "молдинг",
    "фара передняя", "задний фонарь", "поворотник",
    "зеркало боковое", "мотор зеркала", "стеклоподъёмник",
    "уплотнитель двери", "порог", "брызговик",
    # ── КАМАЗ (специфичные) ────────────────────────────────────────────────────
    "КАМАЗ поршень 740", "КАМАЗ вкладыши 740", "КАМАЗ прокладка ГБЦ",
    "КАМАЗ водяной насос", "КАМАЗ термостат", "КАМАЗ маховик",
    "КАМАЗ муфта сцепления", "КАМАЗ КПП 154", "КАМАЗ КПП 141",
    "КАМАЗ передний мост", "КАМАЗ задний мост", "КАМАЗ рессора",
    "КАМАЗ амортизатор", "КАМАЗ тормозной цилиндр",
    "КАМАЗ компрессор", "КАМАЗ тормозной кран", "КАМАЗ регулятор давления",
    # ── ЯМЗ (специфичные) ─────────────────────────────────────────────────────
    "ЯМЗ 238 поршень", "ЯМЗ 240 поршень", "ЯМЗ 236 гильза",
    "ЯМЗ прокладка ГБЦ", "ЯМЗ вкладыши", "ЯМЗ ТНВД",
    "ЯМЗ 238 турбина", "ЯМЗ 536 форсунка",
    # ── МАЗ / УРАЛ (специфичные) ──────────────────────────────────────────────
    "МАЗ рессора", "МАЗ втулка рессоры", "МАЗ серьга рессоры",
    "МАЗ суппорт", "МАЗ тормозной цилиндр",
    "УРАЛ рессора", "УРАЛ мост", "УРАЛ карданный вал",
    # ── Экскаваторы / Спецтехника ─────────────────────────────────────────────
    "Komatsu PC200 ковш", "Komatsu гидромотор", "Hitachi EX зубья ковша",
    "JCB телескопический", "CAT ходовой", "Volvo EC гидравлика",
    "гидравлический насос экскаватора", "гидрораспределитель",
    "гидроцилиндр стрелы", "гидроцилиндр рукояти", "гидроцилиндр ковша",
    "зубья ковша", "режущая кромка", "гусеница экскаватора",
    "каток гусеничный", "натяжитель гусеницы", "звёздочка ходовая",
    "поворотный редуктор", "ходовой редуктор", "гидростатика гусеничного",
    # ── Погрузчики / Краны ────────────────────────────────────────────────────
    "вилочный погрузчик Toyota", "погрузчик ТОЙОТА мачта",
    "погрузчик Komatsu", "погрузчик Hyster",
    "автокран КС", "кран ИВАНОВЕЦ стрела", "кран МАЗ",
    # ── Тракторы ──────────────────────────────────────────────────────────────
    "МТЗ 82 поршень", "МТЗ 82 КПП", "МТЗ гидравлика",
    "Т-150 двигатель", "Т-40 запчасти", "ДТ-75 запчасти",
    "трактор К-700 запчасти", "Кировец К-744",
    # ── Легковые по маркам ────────────────────────────────────────────────────
    "Toyota Camry запчасти", "Toyota Land Cruiser запчасти",
    "Toyota RAV4 запчасти", "Toyota Hilux запчасти",
    "Lada Vesta запчасти", "Lada Granta запчасти",
    "Kia Rio запчасти", "Kia Sportage запчасти",
    "Hyundai Solaris запчасти", "Hyundai Creta запчасти",
    "Volkswagen Polo запчасти", "Volkswagen Tiguan запчасти",
    "Renault Logan запчасти", "Renault Duster запчасти",
    "Nissan Qashqai запчасти", "Nissan X-Trail запчасти",
    "BMW 3 series запчасти", "Mercedes C class запчасти",
    "Audi A4 запчасти", "Skoda Octavia запчасти",
    # ── Расходники (ТО) ───────────────────────────────────────────────────────
    "моторное масло 5W40", "моторное масло 10W40",
    "трансмиссионное масло 75W90", "гидравлическое масло",
    "тормозная жидкость DOT 4", "охлаждающая жидкость",
    "ремень приводной поликлиновый", "комплект ГРМ",
    "свечи NGK", "свечи Bosch", "фильтр MANN",
    # ── Пневматика (тяжёлая техника) ──────────────────────────────────────────
    "пневмоцилиндр тормозной", "тормозная камера",
    "энергоаккумулятор", "осушитель воздуха",
    "компрессор пневматический", "клапан ограничения давления",
    "кран тормозной педали", "кран ручного тормоза",
]

# ── Маппинг категорий поставщика → наши slug ──────────────────────────────────
CATEGORY_MAP = {
    "двигател":        "dvigatel",
    "поршнев":         "porshnevaya-gruppa",
    "грм":             "grm",
    "прокладк":        "prokladki-uplotneniya",
    "сальник":         "prokladki-uplotneniya",
    "уплотнен":        "prokladki-uplotneniya",
    "смазк":           "sistema-smazki",
    "масляны насос":   "maslyanye-nasosy",
    "масляны фильтр":  "maslyanye-filtry",
    "головк блок":     "golovka-bloka-tsylindrov",
    "блок цилиндр":    "blok-tsylindrov",
    "коленвал":        "kolenvaly-raspredy",
    "распредвал":      "kolenvaly-raspredy",
    "трансмисси":      "transmissiya",
    "сцеплени":        "sceplenie",
    "кпп":             "kpp-mkpp",
    "акпп":            "akpp-variator",
    "кардан":          "kardannyy-val-shrusy",
    "шрус":            "kardannyy-val-shrusy",
    "дифференциал":    "differentsial-mosty",
    "раздаточн":       "razdatochnaya-korobka",
    "подвеск":         "podveska-rulevoe",
    "амортизатор":     "amortizatory-stoyki",
    "пружин":          "pruzhiny-ressory",
    "рессор":          "pruzhiny-ressory",
    "шаров":           "sharovye-opory",
    "сайлентблок":     "saylentbloki-vtulki",
    "рулев тяг":       "rulevye-tyagi",
    "наконечник":      "rulevye-tyagi",
    "рулев рейк":      "rulevye-reyki-nasosy",
    "ступиц":          "stupitsy-podshipniki",
    "подшипник":       "stupitsy-podshipniki",
    "стабилизатор":    "stabilizatory-stoyki",
    "тормоз":          "tormoznaya-sistema",
    "колодк":          "tormoznye-kolodki",
    "тормозн диск":    "tormoznye-diski",
    "барабан":         "tormoznye-barabany",
    "суппорт":         "supperty-tsylindry",
    "тормозн цилиндр": "supperty-tsylindry",
    "вакуумн":         "vakuumnyy-usilitel",
    "abs":             "abs-datchiki",
    "электр":          "elektrooborudovanie",
    "генератор":       "generatory-startery",
    "стартер":         "generatory-startery",
    "аккумулятор":     "akkumulyatory",
    "датчик":          "datchiki-rele",
    "катушк":          "katushki-svechi",
    "свеч зажиган":    "svechi-zazhiganiya",
    "свеч накалив":    "svechi-nakalivaniya",
    "фар":             "osveshchenie",
    "лампа":           "osveshchenie",
    "топлив":          "toplivnaya-sistema",
    "форсунк":         "forsunki-inzhektory",
    "инжектор":        "forsunki-inzhektory",
    "тнвд":            "tnvd-dizel",
    "охлажден":        "sistema-ohlazhdeniya",
    "радиатор":        "radiatory-ohlazhdeniya",
    "термостат":       "termostaty",
    "помп":            "pompy",
    "вентилятор":      "ventilyatory-mufty",
    "патрубок":        "patrutby-shlangi",
    "расширительн":    "rasshiritelnye-bachki",
    "выхлоп":          "vykhlopnaya-sistema",
    "глушител":        "glushiteli",
    "коллектор":       "vypusknye-kollektory",
    "катализатор":     "katalizatory",
    "гофр":            "gofry-khomyty",
    "кислородн":       "kislorodnyy-datchik",
    "воздушн фильтр":  "vozdushnye-filtry",
    "фильтр салон":    "filtry-salona",
    "топлив фильтр":   "toplivnye-filtry",
    "гидравлик":       "gidravlika",
    "пневматик":       "pnevmatika",
    "компрессор":      "kompressory",
    "осушитель":       "osushiteli",
}


def map_category(text: str, slug_to_id: dict) -> Optional[int]:
    t = text.lower().strip()
    for kw, slug in CATEGORY_MAP.items():
        if kw in t:
            return slug_to_id.get(slug)
    return None


def price_hash(price: float, qty: int) -> str:
    return hashlib.md5(f"{price:.2f}:{qty}".encode()).hexdigest()[:8]


def parse_qty(val) -> int:
    if val is None:
        return 0
    s = str(val).strip()
    if s.startswith(">"):
        nums = re.findall(r"\d+", s)
        return int(nums[0]) + 1 if nums else 99
    nums = re.findall(r"\d+", s)
    return int(nums[0]) if nums else 0


# ══════════════════════════════════════════════════════════════════════════════

class ArmtekParser:
    def __init__(self):
        self.db: asyncpg.Pool = None
        self.session: aiohttp.ClientSession = None
        self.sem = asyncio.Semaphore(CONCURRENT)
        self._brand_cache: dict = {}
        self._cat_cache:   dict = {}
        self._hash_cache:  dict = {}

    async def connect(self):
        self.db = await asyncpg.create_pool(DB_URL, min_size=5, max_size=30)
        connector = aiohttp.TCPConnector(limit=CONCURRENT + 20, ssl=False)
        self.session = aiohttp.ClientSession(
            connector=connector,
            headers=HEADERS,
            timeout=aiohttp.ClientTimeout(total=20, connect=8),
        )
        await self._load_caches()
        print(f"  Кэш: {len(self._brand_cache)} брендов, {len(self._cat_cache)} категорий")

    async def close(self):
        await self.session.close()
        await self.db.close()

    async def _load_caches(self):
        async with self.db.acquire() as c:
            self._brand_cache = {r["name"].lower(): r["id"]
                                 for r in await c.fetch("SELECT id, name FROM brands")}
            self._cat_cache   = {r["slug"]: r["id"]
                                 for r in await c.fetch("SELECT id, slug FROM categories")}
            rows = await c.fetch(
                "SELECT p.article, s.price_sell, s.quantity "
                "FROM stock s JOIN products p ON p.id = s.product_id "
                "WHERE s.supplier_id = $1", SUPPLIER_ID)
            self._hash_cache = {
                r["article"]: price_hash(float(r["price_sell"] or 0), r["quantity"] or 0)
                for r in rows
            }

    # ── HTTP-запрос к Армтеку ─────────────────────────────────────────────────
    async def _post(self, url: str, body: dict) -> Optional[dict]:
        async with self.sem:
            for attempt in range(3):
                try:
                    async with self.session.post(url, json=body) as r:
                        if r.status == 429:
                            await asyncio.sleep(2 ** attempt)
                            continue
                        if r.status != 200:
                            return None
                        return await r.json(content_type=None)
                except asyncio.TimeoutError:
                    await asyncio.sleep(1)
                except Exception:
                    await asyncio.sleep(0.5)
        return None

    # ── Поиск артикулов по запросу ────────────────────────────────────────────
    async def search_articles(self, query: str) -> list[dict]:
        """Возвращает список статей (ARTID, PIN, BRAND, NAME)."""
        data = await self._post(SEARCH_URL, {
            "query": query,
            "queryType": 1,
            "userInfo": USER_INFO,
        })
        if not data:
            return []
        articles = data.get("data", {}) or {}
        return articles.get("articlesData", []) or []

    # ── Цены для одного ARTID ─────────────────────────────────────────────────
    async def get_prices(self, art_id: int) -> list[dict]:
        """Возвращает список офферов с PRICES1, RVALUE, COLOR."""
        data = await self._post(PRICE_URL, {
            "artId": art_id,
            "limitSuggestions": True,
            "userInfo": USER_INFO,
        })
        if not data:
            return []
        return data.get("data", []) or []

    # ── Обработка одного артикула ─────────────────────────────────────────────
    async def process_article(self, art: dict, query_hint: str = "") -> Optional[dict]:
        art_id = art.get("ARTID")
        pin    = str(art.get("PIN", "")).strip().upper()
        brand  = str(art.get("BRAND", "")).strip()
        name   = str(art.get("NAME", "")).strip()

        if not pin or not art_id:
            return None

        offers = await self.get_prices(art_id)
        if not offers:
            return None

        # Берём самый дешёвый оффер
        best = None
        for o in offers:
            try:
                p = float(o.get("PRICES1") or 0)
                if p < MIN_PRICE or p > MAX_PRICE:
                    continue
                if best is None or p < float(best.get("PRICES1", 999999)):
                    best = o
            except Exception:
                continue

        if not best:
            return None

        price = float(best["PRICES1"])
        qty   = parse_qty(best.get("RVALUE", 0))

        if qty == 0:
            return None

        # Маппинг категории: сначала по name, потом по запросу
        cat_text = name + " " + query_hint
        cat_id   = map_category(cat_text, self._cat_cache)

        return {
            "pin":    pin,
            "brand":  brand,
            "name":   name,
            "price":  price,
            "qty":    qty,
            "cat_id": cat_id,
            "days":   0,
        }

    # ── Запись пачки в БД ─────────────────────────────────────────────────────
    async def upsert_batch(self, items: list[dict], mode: str = "full") -> int:
        if not items:
            return 0
        written = 0
        async with self.db.acquire() as conn:
            async with conn.transaction():
                for it in items:
                    pin   = it["pin"]
                    price_sell = round(it["price"] * MARKUP, 2)
                    qty   = it["qty"]

                    if mode == "delta":
                        h = price_hash(price_sell, qty)
                        if self._hash_cache.get(pin) == h:
                            continue
                        self._hash_cache[pin] = h

                    brand_id = self._brand_cache.get(it["brand"].lower())

                    product_id = await conn.fetchval("""
                        INSERT INTO products (article, name, brand_id, category_id, unit, source, is_active)
                        VALUES ($1, $2, $3, $4, 'шт', 'armtek', true)
                        ON CONFLICT (article) DO UPDATE
                          SET name        = EXCLUDED.name,
                              brand_id    = COALESCE(EXCLUDED.brand_id, products.brand_id),
                              category_id = COALESCE(EXCLUDED.category_id, products.category_id),
                              updated_at  = NOW()
                        RETURNING id
                    """, pin, it["name"], brand_id, it["cat_id"])

                    await conn.execute("""
                        INSERT INTO stock (product_id, supplier_id, price_buy, price_sell,
                                           quantity, in_stock, delivery_days, updated_at)
                        VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
                        ON CONFLICT (product_id, supplier_id) DO UPDATE
                          SET price_buy=EXCLUDED.price_buy, price_sell=EXCLUDED.price_sell,
                              quantity=EXCLUDED.quantity, in_stock=EXCLUDED.in_stock,
                              delivery_days=EXCLUDED.delivery_days, updated_at=NOW()
                    """, product_id, SUPPLIER_ID, it["price"], price_sell,
                         qty, qty > 0, it["days"])
                    written += 1
        return written

    # ══════════════════════════════════════════════════════════════════════════
    # РЕЖИМ DISCOVER: обходим каталог по поисковым запросам
    # ══════════════════════════════════════════════════════════════════════════
    async def run_discover(self, queries: list[str], limit: int = 0, skip_known: bool = True):
        """
        skip_known=True — не запрашивать цены для артикулов, уже есть в hash_cache.
        Ускоряет повторные запуски в ~3x.
        """
        total_written = 0
        start = time.time()
        seen_artids: set = set()
        write_lock = asyncio.Lock()

        # Если skip_known — загружаем уже известные ARTIDs через поиск по article
        known_pins: set = set(self._hash_cache.keys()) if skip_known else set()

        print(f"🔍 DISCOVER: {len(queries)} запросов, "
              f"query_concurrency={QUERY_CONCURRENT}, api_concurrency={CONCURRENT}")
        if known_pins:
            print(f"  Пропускаем уже известные: {len(known_pins)} артикулов")

        query_sem = asyncio.Semaphore(QUERY_CONCURRENT)

        async def process_query(qi: int, query: str):
            nonlocal total_written
            async with query_sem:
                articles = await self.search_articles(query)
                # Пропускаем уже виденные в этом запуске
                new_arts = []
                for a in articles:
                    aid = a.get("ARTID")
                    pin = str(a.get("PIN", "")).strip().upper()
                    if aid in seen_artids:
                        continue
                    seen_artids.add(aid)
                    # Пропускаем known в режиме skip_known
                    if skip_known and pin in known_pins:
                        continue
                    new_arts.append(a)

                if not new_arts:
                    return

                # Параллельно получаем цены
                tasks = [self.process_article(a, query) for a in new_arts]
                results = await asyncio.gather(*tasks)
                batch = [r for r in results if r is not None]

                if batch:
                    async with write_lock:
                        w = await self.upsert_batch(batch, mode="full")
                        total_written += w
                        elapsed = time.time() - start
                        rate    = total_written / elapsed if elapsed > 0 else 0
                        print(f"  [{qi+1}/{len(queries)}] '{query}': "
                              f"+{w} новых | итого {total_written} ({rate:.1f}/сек)")

        # Запускаем все запросы параллельно (ограничено query_sem)
        await asyncio.gather(*[process_query(i, q) for i, q in enumerate(queries)])

        if limit and total_written >= limit:
            print(f"  Достигнут лимит {limit}")

        elapsed = time.time() - start
        print(f"\n✅ DISCOVER завершён за {elapsed/60:.1f} мин: {total_written} товаров")

    # ══════════════════════════════════════════════════════════════════════════
    # РЕЖИМ DELTA: обновляем только цену+наличие для известных артикулов
    # ══════════════════════════════════════════════════════════════════════════
    async def run_delta(self, since_hours: float = 4):
        async with self.db.acquire() as conn:
            cutoff = datetime.utcnow() - timedelta(hours=since_hours)
            rows = await conn.fetch(
                "SELECT p.article FROM products p "
                "JOIN stock s ON s.product_id = p.id "
                "WHERE s.supplier_id = $1 AND s.updated_at < $2",
                SUPPLIER_ID, cutoff)
        pins = [r["article"] for r in rows]
        print(f"⚡ DELTA: {len(pins)} артикулов для обновления (старше {since_hours}ч)")
        if not pins:
            print("  Все данные актуальны.")
            return

        # Для delta: ищем каждый артикул точно, получаем ARTID, потом цены
        total = 0
        start = time.time()
        batch_buf = []

        async def process_pin(pin: str):
            arts = await self.search_articles(pin)
            if not arts:
                return
            item = await self.process_article(arts[0])
            if item:
                batch_buf.append(item)

        for i in range(0, len(pins), BATCH_SIZE):
            chunk = pins[i:i + BATCH_SIZE]
            await asyncio.gather(*[process_pin(p) for p in chunk])
            w = await self.upsert_batch(batch_buf, mode="delta")
            total += w
            batch_buf.clear()
            elapsed = time.time() - start
            rate    = (i + len(chunk)) / elapsed if elapsed > 0 else 0
            print(f"  [{i+len(chunk)}/{len(pins)}] обновлено {total} | {rate:.0f}/сек")

        elapsed = time.time() - start
        print(f"\n✅ DELTA завершён за {elapsed/60:.1f} мин: {total} обновлено")

    # ══════════════════════════════════════════════════════════════════════════
    # РЕЖИМ CHECK
    # ══════════════════════════════════════════════════════════════════════════
    async def run_check(self):
        async with self.db.acquire() as c:
            total    = await c.fetchval("SELECT COUNT(*) FROM products")
            w_stock  = await c.fetchval(
                "SELECT COUNT(*) FROM stock WHERE supplier_id=$1", SUPPLIER_ID)
            fresh    = await c.fetchval(
                "SELECT COUNT(*) FROM stock WHERE supplier_id=$1 AND updated_at > NOW()-INTERVAL '4h'",
                SUPPLIER_ID)
            in_stock = await c.fetchval(
                "SELECT COUNT(*) FROM stock WHERE supplier_id=$1 AND quantity > 0",
                SUPPLIER_ID)
            no_cat   = await c.fetchval(
                "SELECT COUNT(*) FROM products WHERE category_id IS NULL")
        print(f"📊 БД:")
        print(f"   Товаров всего:      {total}")
        print(f"   Армтек позиций:     {w_stock}")
        print(f"   В наличии:          {in_stock}")
        print(f"   Свежих (<4ч):       {fresh}")
        print(f"   Без категории:      {no_cat}")


# ══════════════════════════════════════════════════════════════════════════════
async def create_indexes():
    pool = await asyncpg.create_pool(DB_URL, min_size=2, max_size=5)
    async with pool.acquire() as c:
        sqls = [
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_article  ON products (article)",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_brand    ON products (brand_id)",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category ON products (category_id)",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active   ON products (is_active) WHERE is_active",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stock_ps          ON stock (product_id, supplier_id)",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stock_qty         ON stock (quantity) WHERE quantity > 0",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stock_updated     ON stock (updated_at)",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_fts      ON products "
            "USING gin(to_tsvector('russian', COALESCE(name,'') || ' ' || COALESCE(article,'')))",
        ]
        for sql in sqls:
            try:
                await c.execute(sql)
                name = sql.split("idx_")[1].split(" ")[0] if "idx_" in sql else "fts"
                print(f"  ✓ {name}")
            except Exception as e:
                print(f"  ✗ {e}")
    await pool.close()
    print("✅ Индексы готовы")


# ══════════════════════════════════════════════════════════════════════════════
async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["discover", "delta", "check", "index"],
                    default="check")
    ap.add_argument("--limit",  type=int, default=0,   help="Макс. товаров (0=без лимита)")
    ap.add_argument("--since",  default="4h",           help="Delta: старше X (4h, 12h)")
    ap.add_argument("--query",  default="",             help="Один запрос вместо полного списка")
    args = ap.parse_args()

    if args.mode == "index":
        await create_indexes()
        return

    p = ArmtekParser()
    await p.connect()
    try:
        if args.mode == "check":
            await p.run_check()

        elif args.mode == "discover":
            queries = [args.query] if args.query else DISCOVER_QUERIES
            await p.run_discover(queries, limit=args.limit)

        elif args.mode == "delta":
            h = float(args.since.replace("h", "").replace("ч", ""))
            await p.run_delta(since_hours=h)
    finally:
        await p.close()


if __name__ == "__main__":
    asyncio.run(main())
