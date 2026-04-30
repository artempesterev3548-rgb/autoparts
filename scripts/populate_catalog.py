"""
Наполнение каталога: категории (с иерархией) + марки авто (легковые и спецтехника)
Структура взята с топовых конкурентов: Exist, Autodoc, Autopiter
"""
import psycopg2

DB = "postgresql://postgres:vocrer-ryhfy8-vYhnuz@db.wsnbtfuurxinoonyjhxh.supabase.co:5432/postgres"

# ── КАТЕГОРИИ (родитель → дочерние) ─────────────────────────────────────────
# Структура: (name, slug, section, sort_order, markup_percent)
# section: 'car' | 'truck' | 'all'
CATEGORIES = [
    # ── Двигатель ──
    {
        "name": "Двигатель",
        "slug": "dvigatel",
        "section": "both",
        "sort": 1,
        "markup": 30,
        "children": [
            ("Поршневая группа",         "porshnevaya-gruppa",        35),
            ("ГРМ (ремни, цепи, шестерни)", "grm",                   30),
            ("Прокладки и уплотнения",   "prokladki-uplotneniya",     35),
            ("Система смазки",           "sistema-smazki",            30),
            ("Масляные насосы",          "maslyanye-nasosy",          30),
            ("Головка блока цилиндров",  "golovka-bloka-tsylindrov",  25),
            ("Блок цилиндров и картер",  "blok-tsylindrov",           25),
            ("Коленвал и распредвал",    "kolenvaly-raspredy",        25),
        ],
    },
    # ── Трансмиссия ──
    {
        "name": "Трансмиссия",
        "slug": "transmissiya",
        "section": "both",
        "sort": 2,
        "markup": 30,
        "children": [
            ("Сцепление",                "sceplenie",                 35),
            ("КПП и МКПП",              "kpp-mkpp",                  25),
            ("АКПП и вариатор",         "akpp-variator",              25),
            ("Карданный вал и ШРУСы",   "kardannyy-val-shrusy",      30),
            ("Дифференциал и мосты",    "differentsial-mosty",        25),
            ("Раздаточная коробка",     "razdatochnaya-korobka",      25),
        ],
    },
    # ── Подвеска и рулевое ──
    {
        "name": "Подвеска и рулевое",
        "slug": "podveska-rulevoe",
        "section": "both",
        "sort": 3,
        "markup": 32,
        "children": [
            ("Амортизаторы и стойки",   "amortizatory-stoyki",        35),
            ("Пружины и рессоры",       "pruzhiny-ressory",            30),
            ("Шаровые опоры",           "sharovye-opory",              40),
            ("Сайлентблоки и втулки",   "saylentbloki-vtulki",         40),
            ("Рулевые тяги и наконечники", "rulevye-tyagi",            35),
            ("Рулевые рейки и насосы",  "rulevye-reyki-nasosy",        25),
            ("Ступицы и подшипники",    "stupitsy-podshipniki",        35),
            ("Стабилизаторы и стойки",  "stabilizatory-stoyki",        35),
        ],
    },
    # ── Тормозная система ──
    {
        "name": "Тормозная система",
        "slug": "tormoznaya-sistema",
        "section": "both",
        "sort": 4,
        "markup": 35,
        "children": [
            ("Тормозные колодки",       "tormoznye-kolodki",           40),
            ("Тормозные диски",         "tormoznye-diski",             35),
            ("Тормозные барабаны",      "tormoznye-barabany",          30),
            ("Суппорты и цилиндры",     "supperty-tsylindry",          30),
            ("Главный тормозной цилиндр", "gtts",                      25),
            ("Вакуумный усилитель",     "vakuumnyy-usilitel",          25),
            ("Тормозные шланги и трубки", "tormoznye-shlagi",          35),
            ("ABS и датчики",           "abs-datchiki",                30),
        ],
    },
    # ── Электрооборудование ──
    {
        "name": "Электрооборудование",
        "slug": "elektrooborudovanie",
        "section": "both",
        "sort": 5,
        "markup": 30,
        "children": [
            ("Генераторы и стартеры",   "generatory-startery",         30),
            ("Аккумуляторы",            "akkumulyatory",               20),
            ("Датчики и реле",          "datchiki-rele",               40),
            ("Катушки и свечи зажигания", "katushki-svechi",           35),
            ("Освещение (фары, лампы)", "osveshchenie",                35),
            ("Проводка и разъёмы",      "provodka",                    35),
            ("Бортовые компьютеры",     "bortovye-kompyutery",         20),
        ],
    },
    # ── Топливная система ──
    {
        "name": "Топливная система",
        "slug": "toplivnaya-sistema",
        "section": "both",
        "sort": 6,
        "markup": 32,
        "children": [
            ("Топливные насосы",        "toplivnye-nasosy",            35),
            ("Форсунки и инжекторы",    "forsunki-inzhektory",         30),
            ("Топливные фильтры",       "toplivnye-filtry",            40),
            ("Регуляторы давления",     "regulyatory-davleniya",       30),
            ("Топливные баки",          "toplivnye-baki",              20),
            ("ТНВД (для дизелей)",      "tnvd-dizel",                  20),
        ],
    },
    # ── Система охлаждения ──
    {
        "name": "Система охлаждения",
        "slug": "sistema-ohlazhdeniya",
        "section": "both",
        "sort": 7,
        "markup": 30,
        "children": [
            ("Радиаторы охлаждения",    "radiatory-ohlazhdeniya",      30),
            ("Термостаты",              "termostaty",                  40),
            ("Водяные насосы (помпы)",  "pompy",                       35),
            ("Вентиляторы и муфты",     "ventilyatory-mufty",          30),
            ("Патрубки и шланги",       "patrutby-shlangi",            40),
            ("Расширительные бачки",    "rasshiritelnye-bachki",       35),
        ],
    },
    # ── Выхлопная система ──
    {
        "name": "Выхлопная система",
        "slug": "vykhlopnaya-sistema",
        "section": "both",
        "sort": 8,
        "markup": 30,
        "children": [
            ("Глушители и резонаторы",  "glushiteli",                  35),
            ("Выпускные коллекторы",    "vypusknye-kollektory",        25),
            ("Катализаторы и сажевые",  "katalizatory",                20),
            ("Гофры и хомуты",          "gofry-khomyty",               45),
            ("Кислородные датчики",     "kislorodny-datchik",          35),
        ],
    },
    # ── Кузов и стекло ──
    {
        "name": "Кузов и стекло",
        "slug": "kuzov-steklo",
        "section": "cars",
        "sort": 9,
        "markup": 25,
        "children": [
            ("Бамперы",                 "bampery",                     30),
            ("Крылья и пороги",         "krylya-porogi",               25),
            ("Капоты и двери",          "kapoty-dveri",                25),
            ("Стекла и лобовые",        "stekla",                      20),
            ("Зеркала",                 "zerkala",                     35),
            ("Уплотнители и молдинги",  "uplotnitely-moldinghi",       40),
        ],
    },
    # ── Фильтры ──
    {
        "name": "Фильтры",
        "slug": "filtry",
        "section": "both",
        "sort": 10,
        "markup": 40,
        "children": [
            ("Масляные фильтры",        "maslyanye-filtry",            45),
            ("Воздушные фильтры",       "vozdushnye-filtry",           40),
            ("Топливные фильтры",       "toplivnye-filtry-2",          40),
            ("Фильтры салона",          "filtry-salona",               45),
            ("Сепараторы (для дизелей)","separatory",                  35),
        ],
    },
    # ── ТО и расходники ──
    {
        "name": "ТО и расходники",
        "slug": "to-rashkodniki",
        "section": "both",
        "sort": 11,
        "markup": 35,
        "children": [
            ("Свечи зажигания",         "svechi-zazhiganiya",          40),
            ("Свечи накаливания",       "svechi-nakalivaniya",         40),
            ("Ремни приводные",         "remni-privodnye",             40),
            ("Моторные масла",          "motornye-masla",              25),
            ("Трансмиссионные масла",   "transmissionnye-masla",       25),
            ("Тормозные жидкости",      "tormoznye-zhidkosti",         35),
            ("Антифриз и охлаждающие",  "antifriz",                    30),
        ],
    },
    # ── Спецтехника: гидравлика ──
    {
        "name": "Гидравлика",
        "slug": "gidravlika",
        "section": "special",
        "sort": 12,
        "markup": 30,
        "children": [
            ("Гидронасосы и моторы",    "gidronasosy",                 25),
            ("Гидроцилиндры",           "gidrotsylindry",              25),
            ("Гидрораспределители",     "gidropasprediliteli",          25),
            ("Гидравлические шланги",   "gidravlicheskie-shlangi",     35),
            ("Фильтры гидравлические",  "gidravlicheskie-filtry",      35),
        ],
    },
    # ── Пневматика (грузовики) ──
    {
        "name": "Пневматика",
        "slug": "pnevmatika",
        "section": "special",
        "sort": 13,
        "markup": 30,
        "children": [
            ("Компрессоры",             "kompressory",                  25),
            ("Осушители воздуха",       "osushiteli",                   30),
            ("Клапаны и краны",         "klapany-krany",                35),
            ("Пневмошланги и фитинги",  "pnevmoshlangi",                40),
            ("Ресиверы",                "resivery",                     25),
        ],
    },
]

# ── МАРКИ ЛЕГКОВЫХ АВТОМОБИЛЕЙ ────────────────────────────────────────────────
BRANDS_CAR = [
    # Популярные в России
    ("Toyota",          "Япония"),
    ("Lada (ВАЗ)",      "Россия"),
    ("Kia",             "Корея"),
    ("Hyundai",         "Корея"),
    ("Volkswagen",      "Германия"),
    ("Renault",         "Франция"),
    ("Nissan",          "Япония"),
    ("Ford",            "США"),
    ("Mazda",           "Япония"),
    ("Honda",           "Япония"),
    ("Skoda",           "Чехия"),
    ("Mitsubishi",      "Япония"),
    ("BMW",             "Германия"),
    ("Mercedes-Benz",   "Германия"),
    ("Audi",            "Германия"),
    ("Opel",            "Германия"),
    ("Peugeot",         "Франция"),
    ("Chevrolet",       "США"),
    ("Citroen",         "Франция"),
    ("Suzuki",          "Япония"),
    ("Subaru",          "Япония"),
    ("Volvo",           "Швеция"),
    ("Land Rover",      "Великобритания"),
    ("Jeep",            "США"),
    ("Lexus",           "Япония"),
    ("Infiniti",        "Япония"),
    ("Daewoo",          "Корея"),
    ("Geely",           "Китай"),
    ("Chery",           "Китай"),
    ("Haval",           "Китай"),
    ("УАЗ",             "Россия"),
    ("ГАЗ (Волга)",     "Россия"),
    ("SsangYong",       "Корея"),
    ("Seat",            "Испания"),
    ("Fiat",            "Италия"),
    ("Datsun",          "Япония"),
    ("Porsche",         "Германия"),
    ("Jaguar",          "Великобритания"),
    ("Cadillac",        "США"),
    ("Москвич",         "Россия"),
]

# ── МАРКИ ГРУЗОВИКОВ И СПЕЦТЕХНИКИ ───────────────────────────────────────────
BRANDS_TRUCK = [
    # Отечественные
    ("КамАЗ",           "Россия"),
    ("МАЗ",             "Беларусь"),
    ("Урал",            "Россия"),
    ("ЗИЛ",             "Россия"),
    ("КрАЗ",            "Украина"),
    ("ГАЗ (Газель)",    "Россия"),
    ("ПАЗ",             "Россия"),
    ("МТЗ (Беларус)",   "Беларусь"),
    # Двигатели
    ("ЯМЗ",             "Россия"),
    ("Д-260 (ММЗ)",     "Беларусь"),
    # Европейские
    ("Scania",          "Швеция"),
    ("Volvo Trucks",    "Швеция"),
    ("MAN",             "Германия"),
    ("Mercedes Actros", "Германия"),
    ("DAF",             "Нидерланды"),
    ("Renault Trucks",  "Франция"),
    ("Iveco",           "Италия"),
    # Строительная
    ("Komatsu",         "Япония"),
    ("Caterpillar",     "США"),
    ("Hitachi",         "Япония"),
    ("JCB",             "Великобритания"),
    ("CASE",            "США"),
    ("New Holland",     "Нидерланды"),
    ("Liebherr",        "Германия"),
    ("Volvo CE",        "Швеция"),
    ("Doosan",          "Корея"),
    ("Hyundai CE",      "Корея"),
    ("Bobcat",          "США"),
    ("Terex",           "США"),
    ("Manitou",         "Франция"),
]


def slugify(text):
    return text.lower().replace(" ", "-").replace("(", "").replace(")", "").replace(".", "")


def main():
    conn = psycopg2.connect(DB, sslmode='require')
    cur = conn.cursor()

    # ── Добавить колонку section в brands если нет ──────────────────────────
    cur.execute("""
        ALTER TABLE brands ADD COLUMN IF NOT EXISTS section VARCHAR(20) DEFAULT 'car';
    """)
    print("✓ Колонка section добавлена в brands")

    # ── Очистить старые данные ───────────────────────────────────────────────
    cur.execute("DELETE FROM categories")
    cur.execute("DELETE FROM brands")
    print("✓ Старые данные очищены")

    # ── Вставить категории ───────────────────────────────────────────────────
    total_cats = 0
    for cat in CATEGORIES:
        # Родительская категория
        cur.execute("""
            INSERT INTO categories (name, slug, section, sort_order, markup_percent, is_active)
            VALUES (%s, %s, %s, %s, %s, true)
            RETURNING id
        """, (cat["name"], cat["slug"], cat["section"], cat["sort"], cat["markup"]))
        parent_id = cur.fetchone()[0]
        total_cats += 1

        # Подкатегории
        for i, child in enumerate(cat["children"]):
            child_name, child_slug, child_markup = child
            cur.execute("""
                INSERT INTO categories (name, slug, section, parent_id, sort_order, markup_percent, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, true)
            """, (child_name, child_slug, cat["section"], parent_id, i + 1, child_markup))
            total_cats += 1

    print(f"✓ Категорий добавлено: {total_cats}")

    # ── Вставить марки легковых ──────────────────────────────────────────────
    for name, country in BRANDS_CAR:
        cur.execute("""
            INSERT INTO brands (name, country, section, is_active)
            VALUES (%s, %s, 'cars', true)
        """, (name, country))

    print(f"✓ Марок легковых: {len(BRANDS_CAR)}")

    # ── Вставить марки грузовиков ────────────────────────────────────────────
    for name, country in BRANDS_TRUCK:
        cur.execute("""
            INSERT INTO brands (name, country, section, is_active)
            VALUES (%s, %s, 'special', true)
        """, (name, country))

    print(f"✓ Марок грузовики/спецтехника: {len(BRANDS_TRUCK)}")

    conn.commit()
    conn.close()

    total = len(BRANDS_CAR) + len(BRANDS_TRUCK)
    print(f"\n🎉 Готово! {total_cats} категорий + {total} марок загружено в базу.")


if __name__ == "__main__":
    main()
