-- ============================================================
-- CRM Migration: contractors, vehicles, service_orders
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Контрагенты
create table if not exists contractors (
  id              bigserial primary key,
  name            text not null,
  inn             text,
  phone           text,
  email           text,
  contact_person  text,
  notes           text,
  created_at      timestamptz default now()
);

-- 2. Автомобили
create table if not exists vehicles (
  id             bigserial primary key,
  contractor_id  bigint references contractors(id) on delete set null,
  make           text,
  model          text,
  year           text,
  vin            text,
  plate          text,
  notes          text,
  created_at     timestamptz default now()
);

create index if not exists vehicles_contractor_id_idx on vehicles(contractor_id);

-- 3. Карты сервиса
create table if not exists service_orders (
  id               bigserial primary key,
  order_number     text unique not null,
  contractor_id    bigint references contractors(id) on delete set null,
  vehicle_id       bigint references vehicles(id) on delete set null,
  linked_order_id  bigint,  -- ref to orders table (public requests)

  client_name      text,
  client_phone     text,
  client_email     text,

  vehicle_make     text,
  vehicle_model    text,
  vehicle_year     text,
  vehicle_vin      text,
  vehicle_plate    text,

  works            jsonb default '[]',
  parts            jsonb default '[]',

  check_in_at      timestamptz,
  check_out_at     timestamptz,

  status           text not null default 'new',
  payment_status   text not null default 'unpaid',
  payment_amount   numeric(12,2) default 0,

  manager_notes    text,
  created_at       timestamptz default now()
);

create index if not exists service_orders_contractor_id_idx on service_orders(contractor_id);
create index if not exists service_orders_vehicle_id_idx on service_orders(vehicle_id);
create index if not exists service_orders_status_idx on service_orders(status);
create index if not exists service_orders_created_at_idx on service_orders(created_at desc);
