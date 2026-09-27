-- 0022 — First-party website analytics (real visitors only).
-- Additive + idempotent. Rows are written ONLY by the server route
-- /api/track with the service role (bots, prefetches and staff are filtered
-- out before insert). No anon/authenticated access: RLS on, no policies.

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null check (char_length(path) between 1 and 300),
  visitor_hash text not null check (char_length(visitor_hash) = 64),
  session_id text not null check (char_length(session_id) between 8 and 64),
  referrer_host text check (char_length(referrer_host) <= 200),
  device text not null default 'desktop' check (device in ('desktop', 'mobile', 'tablet')),
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_created_idx on public.page_views (path, created_at desc);

alter table public.page_views enable row level security;
revoke all on public.page_views from anon, authenticated;
grant select, insert on public.page_views to service_role;

-- One round trip for the admin dashboard. Days are bucketed in IST.
create or replace function public.analytics_report(p_from timestamptz, p_to timestamptz)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with v as (
    select *, to_char(created_at at time zone 'Asia/Kolkata', 'YYYY-MM-DD') as day
    from public.page_views where created_at >= p_from and created_at < p_to
  )
  select jsonb_build_object(
    'views', (select count(*) from v),
    'visitors', (select count(distinct visitor_hash) from v),
    'sessions', (select count(distinct session_id) from v),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', day, 'views', views, 'visitors', visitors) order by day)
      from (select day, count(*) views, count(distinct visitor_hash) visitors from v group by day) x
    ), '[]'::jsonb),
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object('path', path, 'views', views, 'visitors', visitors) order by views desc)
      from (select path, count(*) views, count(distinct visitor_hash) visitors from v group by path) x
    ), '[]'::jsonb),
    'referrers', coalesce((
      select jsonb_agg(jsonb_build_object('source', source, 'visitors', visitors) order by visitors desc)
      from (
        select coalesce(referrer_host, 'Direct') source, count(distinct visitor_hash) visitors
        from v group by 1 order by 2 desc limit 15
      ) x
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(jsonb_build_object('device', device, 'visitors', visitors) order by visitors desc)
      from (select device, count(distinct visitor_hash) visitors from v group by device) x
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.analytics_report(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.analytics_report(timestamptz, timestamptz) to service_role;
