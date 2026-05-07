-- Add service scheduling fields to orders table
-- Run in Supabase SQL Editor

alter table orders
  add column if not exists scheduled_at timestamptz,
  add column if not exists ready_at     timestamptz;

create index if not exists orders_scheduled_at_idx on orders(scheduled_at)
  where scheduled_at is not null;
