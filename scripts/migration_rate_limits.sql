create table if not exists rate_limits (
  key        text        primary key,
  count      integer     not null default 1,
  reset_at   timestamptz not null
);

-- Auto-cleanup: delete expired rows older than 1 day (run periodically via pg_cron or manual cleanup)
create index if not exists rate_limits_reset_at_idx on rate_limits(reset_at);
