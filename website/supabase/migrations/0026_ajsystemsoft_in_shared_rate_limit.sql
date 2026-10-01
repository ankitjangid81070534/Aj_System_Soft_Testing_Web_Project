-- Shared (cross-instance) rate limiting for public lead forms.
-- Additive + idempotent. Service role only; the app falls back to its
-- in-memory limiter until this migration is applied.

create table if not exists public.ajsystemsoft_in_rate_limits (
  key text primary key,
  count integer not null default 0,
  window_started_at timestamptz not null default now()
);

alter table public.ajsystemsoft_in_rate_limits enable row level security;
revoke all on public.ajsystemsoft_in_rate_limits from anon, authenticated;
grant all on public.ajsystemsoft_in_rate_limits to service_role;

create index if not exists ajsystemsoft_in_rate_limits_window_idx
  on public.ajsystemsoft_in_rate_limits (window_started_at);

-- Atomically records one hit and returns true when the key is over its limit.
create or replace function public.ajsystemsoft_in_rate_limit_hit(
  p_key text,
  p_window_seconds integer,
  p_max integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.ajsystemsoft_in_rate_limits as r (key, count, window_started_at)
  values (p_key, 1, now())
  on conflict (key) do update
    set count = case
          when r.window_started_at < now() - make_interval(secs => p_window_seconds) then 1
          else r.count + 1
        end,
        window_started_at = case
          when r.window_started_at < now() - make_interval(secs => p_window_seconds) then now()
          else r.window_started_at
        end
  returning count into v_count;

  -- Light housekeeping: drop rows older than a day.
  delete from public.ajsystemsoft_in_rate_limits
  where window_started_at < now() - interval '1 day';

  return v_count > p_max;
end;
$$;

revoke all on function public.ajsystemsoft_in_rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.ajsystemsoft_in_rate_limit_hit(text, integer, integer) to service_role;
