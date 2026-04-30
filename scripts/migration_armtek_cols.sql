-- Миграция: добавить колонки для отслеживания источника товаров (Armtek scraper)
-- Запустить в Supabase Dashboard → SQL Editor

-- 1. Уникальный индекс на article (нужен для ON CONFLICT upsert)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_article_unique ON products(article);

-- 2. Расширенные колонки источника
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS source       text    DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_slug  text,
  ADD COLUMN IF NOT EXISTS source_artid bigint;

-- 3. Индекс для быстрого поиска по artid
CREATE INDEX IF NOT EXISTS idx_products_source_artid ON products(source_artid);

-- Проверка
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('source', 'source_slug', 'source_artid', 'article')
ORDER BY column_name;
