-- ============================================================================
-- 0006 — Blog: categories, tags, posts, post-tag joins
-- ============================================================================

create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

alter table public.blog_categories enable row level security;

drop policy if exists "blog_categories_public_read" on public.blog_categories;
create policy "blog_categories_public_read" on public.blog_categories
  for select to anon, authenticated using (true);

drop policy if exists "blog_categories_staff_all" on public.blog_categories;
create policy "blog_categories_staff_all" on public.blog_categories
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

create table if not exists public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.blog_tags enable row level security;

drop policy if exists "blog_tags_public_read" on public.blog_tags;
create policy "blog_tags_public_read" on public.blog_tags
  for select to anon, authenticated using (true);

drop policy if exists "blog_tags_staff_all" on public.blog_tags;
create policy "blog_tags_staff_all" on public.blog_tags
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

-- ---------------------------------------------------------------------------
-- blog_posts — content is stored as markdown/text and rendered safely by the
-- app; no raw HTML execution path.
-- ---------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_image_url text,
  author_id uuid references public.profiles (id) on delete set null,
  category_id uuid references public.blog_categories (id) on delete set null,
  reading_minutes integer,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  og_image_url text,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_public_idx on public.blog_posts (status, is_active, published_at);
create index if not exists blog_posts_featured_idx on public.blog_posts (is_featured, published_at)
  where is_featured = true;
create index if not exists blog_posts_category_idx on public.blog_posts (category_id);
create index if not exists blog_posts_author_idx on public.blog_posts (author_id);

alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts_public_read" on public.blog_posts;
create policy "blog_posts_public_read" on public.blog_posts
  for select to anon, authenticated
  using (
    status = 'published' and is_active = true
    and (published_at is null or published_at <= now())
  );

drop policy if exists "blog_posts_staff_all" on public.blog_posts;
create policy "blog_posts_staff_all" on public.blog_posts
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

drop trigger if exists blog_posts_audit_columns on public.blog_posts;
create trigger blog_posts_audit_columns
  before insert or update on public.blog_posts
  for each row execute function public.set_audit_columns();

create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  tag_id uuid not null references public.blog_tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

alter table public.blog_post_tags enable row level security;

drop policy if exists "blog_post_tags_public_read" on public.blog_post_tags;
create policy "blog_post_tags_public_read" on public.blog_post_tags
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.blog_posts bp
      where bp.id = post_id and bp.status = 'published' and bp.is_active = true
    )
  );

drop policy if exists "blog_post_tags_staff_all" on public.blog_post_tags;
create policy "blog_post_tags_staff_all" on public.blog_post_tags
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));
