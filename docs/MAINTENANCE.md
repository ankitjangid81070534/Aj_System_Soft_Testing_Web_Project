# Maintenance & Customization Guide

Everything a developer (human or AI) needs to safely change this project.
Read top-to-bottom once; then use it as a reference.

**Golden rules**
1. Read before editing; never rename DB columns or API fields without adapting contracts.
2. Real content only — never invent clients, numbers, testimonials or people.
3. Never put secrets in code, and never let the service-role key reach the browser.
4. After any change: `npm run typecheck && npm run lint && npm run test && npm run build` inside `website/`.
5. Pre-redesign reference backup: `../Ajsystemsoft_backup/AJS_website_full_backup_2026-08-30.rar`.

---

## 1. Project architecture (10-minute tour)

```
website/
├─ src/
│  ├─ app/                      # Routes (Next.js App Router)
│  │  ├─ (public)/              # Marketing site — shared shell: floating header + footer
│  │  │  ├─ page.tsx            # Home — composed from components/site/* sections
│  │  │  ├─ services/ projects/ blog/ about/ team/ contact/ request-quote/
│  │  │  └─ privacy/ terms/
│  │  ├─ ajadmin/               # Admin — separate shell, noindex, auth-gated by src/proxy.ts
│  │  │  ├─ c/[resource]/       # GENERIC CRUD UI driven by src/lib/admin/resources.ts
│  │  │  ├─ home/ brand/ media/ users/ audit/ leads/ login/
│  │  ├─ blog/rss.xml/route.ts  # RSS feed handler
│  │  ├─ sitemap.ts robots.ts opengraph-image.tsx icon.tsx
│  │  └─ globals.css            # ALL design tokens (@theme) — single source of visual truth
│  ├─ components/
│  │  ├─ ui/                    # Reusable primitives (Button, Cards, Dialog, Toast…)
│  │  ├─ site/                  # Page-section components + Reveal/Breadcrumbs/LeadForms
│  │  ├─ admin/                 # Admin-specific components (forms, nav, notices)
│  │  └─ seo/JsonLd.tsx
│  ├─ lib/
│  │  ├─ env.ts / env.server.ts # Public env (validated) / service-role key (server-only)
│  │  ├─ supabase/              # 3 clients: browser (anon), server (RLS), admin (service, server-only)
│  │  ├─ data/                  # ALL content queries live here — pages never call Supabase directly
│  │  ├─ auth/                  # session (getCurrentUser/requireStaff), permissions (can()), login actions
│  │  ├─ admin/                 # Resource configs + generic CRUD actions + builder/media/user actions
│  │  ├─ leads/                 # Public form actions + admin lead actions
│  │  ├─ email/                 # Resend integration (templates, escape helpers, sender)
│  │  ├─ seo/                   # site.ts (brand constants), metadata.ts, jsonld.ts, overrides.ts
│  │  ├─ validation/            # Zod schemas (leads, auth, sections)
│  │  └─ utils/cn.ts            # class-name joiner
│  ├─ types/database.ts         # Hand-written DB types (regenerate when schema changes)
│  └─ middleware → src/proxy.ts # Edge gate: /ajadmin auth + slug redirects (5-min cache)
└─ supabase/migrations/         # 0001–0010, ordered, idempotent SQL
```

**The three-layer rule:** pages render from `lib/data/*`; `lib/data/*` is the only place
that talks to Supabase; Zod (`lib/validation/*`) validates everything crossing a boundary.

## 2. Design tokens

Live in `src/app/globals.css` under `@theme` (Tailwind v4). Changing a token value
re-themes every component automatically — components never hardcode colors.

- Colors: `brand-50…950`, neutrals (`canvas/surface/ink/ink-muted/line`), semantic
  (`success/warning/danger/info` + `-soft` variants).
- Type: fluid `text-display-sm…xl` + `text-eyebrow` (clamp-based — resize safely).
- Shadows: `e1–e4` elevation + `shadow-3d`. Easing: `ease-soft/ease-spring`.
- Containers: `max-w-narrow/content/wide`. Motion: `animate-panel-in/drawer-in/float`.

**How to change brand color safely:** edit only the `--color-brand-*` ramp (keep 50→950
ordered by lightness), then re-run the contrast check methodology from
`docs/PHASE-13-A11Y-SECURITY.md` for every pair where brand text sits on brand-soft
backgrounds (and white-on-brand for buttons). Never edit component class strings.

**How to change typography safely:** swap the font file/import in `src/app/layout.tsx`
(`geist/font/sans` → your variable font via `next/font`), update `--font-sans` in
`@theme inline`, and keep the `text-display-*` clamp values — the whole type scale then
follows. Avoid changing sizes per-component.

## 3. Reusable UI components

`src/components/ui/` — each is self-contained, server-first unless marked `"use client"`.
Conventions: variants via a `variants` map + `cn()`; sizes map; focus ring on everything;
content components (cards) accept optional fields and simply omit what's missing.

**Adding a component:** create `src/components/ui/Name.tsx`, accept `ComponentProps<"…">`
plus variant props, use tokens/classes only, add `focus-ring`, and reuse it from both
public and admin shells. Components with state get `"use client"` at the top.

## 4. Public content data flow

```
Page (RSC) → lib/data/home|services|projects|blog|team (RLS-bound server client)
           → Supabase (anon role — RLS returns only published+active+public rows)
           → pure mappers (lib/data/mappers.ts, lib/data/services.ts)
           → section components → graceful omission when a field is empty
```

Rules:
- Pages use `revalidate = 300` (ISR). Admin saves trigger `revalidatePath("/", "layout")`
  so changes appear immediately.
- Fallbacks: services and blog have code-level fallbacks
  (`lib/data/services-fallback.ts`, `lib/data/blog-fallback.ts`) used only while Supabase
  is unconfigured/empty. **CMS content overrides fallbacks automatically.**
- Never fetch Supabase inside a component; add a function to `lib/data/`.

## 5. Supabase tables (schema by domain)

Identity: `profiles` (1:1 auth.users, `app_role` enum) · Config: `site_settings`
(singleton), `navigation_items`, `page_sections`, `seo_metadata`, `redirects` ·
Content: `services`+`service_faqs`, `clients`, `projects`+`project_media`,
`team_members`, `testimonials`, `blog_posts`+`categories`+`tags`+`post_tags` ·
Leads: `contact_submissions`, `quote_requests`, `appointment_requests` ·
Ops: `payment_links`, `media_assets`, `audit_logs`.

Conventions on every content table: uuid PK, `created_at/updated_at`, `created_by/
updated_by` (trigger-maintained), `status` (draft/published), `is_active`, `sort_order`,
`deleted_at` (soft delete on the six main content tables), `seo_title/seo_description/
og_image_url` where relevant.

## 6. Migrations

Numbered files in `supabase/migrations/`, applied in order, **all idempotent**
(re-runnable). Apply via Supabase SQL editor (paste + run) or CLI
(`npx supabase db push`). After changing the schema, regenerate types:

```bash
npx supabase gen types typescript --linked > website/src/types/database.ts
```

…then `npm run typecheck` and reconcile. Current migrations: 0001 identity/RLS helpers →
0002 site config → 0003 services → 0004 clients/projects → 0005 team/testimonials →
0006 blog → 0007 leads/audit → 0008 storage → 0009 lead attachments → 0010 admin CMS
(soft delete + builder columns + audit attribution).

## 7. Row Level Security (RLS)

- Anonymous can SELECT only `status='published' AND is_active AND public-flag` rows.
- Staff write access flows through `public.has_role(app_role)` / `public.my_role()`
  SECURITY DEFINER helpers (avoid recursion): editor < admin < super_admin.
- Leads: anonymous INSERT-only; admins read/update. `audit_logs`: admin read-only,
  written by triggers. Role changes: guarded by trigger (super admin or JWT-less
  maintenance session only).
- Soft-deleted rows are excluded from every public policy.

**Verifying:** run `supabase/tests/rls-checks.sql` after any policy change (it simulates
anon/editor/admin/super_admin sessions and expects specific outcomes).

## 8. Storage

Buckets: `public-site`, `project-media`, `team-media`, `client-media`, `blog-media`
(public) and `private-media`, `lead-attachments` (private). Each bucket enforces MIME
allow-lists and size caps; SVG is intentionally banned (stored-XSS). Public buckets are
readable by URL; private ones need staff-signed URLs (see `getAttachmentSignedUrl`).
Uploads always happen **server-side** via the service-role client after validation.

## 9. /ajadmin modules

Driven by two patterns:
- **Config-driven resources** (`src/lib/admin/resources.ts`): 12 resources with field
  definitions → generic list/form/actions (`lib/admin/actions.ts`). Adding a field to a
  resource = add it to the config + DB column + Zod picks it up automatically.
- **Bespoke pages**: dashboard, brand settings, home builder, media, leads (Phase 8),
  users, audit.

Permissions: every action calls `authorize(capability)` → `getCurrentUser` + `can()`
(`lib/auth/permissions.ts`). Content capability for content resources, settings for
config, leads for inbox. The DB's RLS is the second layer; audit triggers are the third.

## 10. How to add a service

1. `/ajadmin/c/services` → **New** → fill fields (name auto-generates the slug if left
   blank; problems/features/deliverables/process are one-per-line lists).
2. Add FAQs in `service_faqs` (currently via SQL or the Phase-9 admin extension point).
3. Set **Status: Published** (+ Active) → it appears on `/services`, `/services/[slug]`
   and the sitemap within seconds (revalidate + tag refresh).
No code changes required — layout, SEO, JSON-LD and breadcrumbs are automatic.

## 11. How to add a field to projects (or any resource)

1. `supabase/migrations/00XX_add_field.sql`:
   `alter table public.projects add column if not exists my_field text;`
2. `src/types/database.ts`: add `my_field` to Row/Insert/Update (or regenerate types).
3. `src/lib/admin/resources.ts`: add the field to the `projects` config (type, label).
4. If it must show on the public case study: add it to the select list in
   `lib/data/projects.ts::getProjectCaseStudy`, the `CaseStudy` type, and render it in
   `app/(public)/projects/[slug]/page.tsx`.
5. Apply the migration → typecheck → build.

## 12. How to create a safe new home-page section type

1. `supabase/migrations/00XX…`: add the new value to the `page_sections.section_type`
   CHECK list (or a new migration alters it).
2. `src/lib/validation/sections.ts`: define a Zod schema for the content payload
   (see `galleryContentSchema`) and register it in the type union.
3. `src/lib/admin/builder-actions.ts::validateSectionContent`: route the type to its
   schema so invalid content is rejected on save.
4. Build a `components/site/MySection.tsx` (props = parsed content) and render it on the
   home page **only when a published section exists**.
Never render raw HTML from `content` — structured data only.

## 13. How SEO metadata works

- Every page calls `buildMetadata()` or `buildRouteMetadata()` (`lib/seo/metadata.ts`)
  → title (root template `%s | AJ System Soft Technology`), description, canonical
  (`NEXT_PUBLIC_SITE_URL` + path), OG/Twitter (auto OG image `/opengraph-image`),
  optional RSS, robots.
- `buildRouteMetadata` merges **admin overrides** from the `seo_metadata` table
  (SEO Manager module wins for title/description/no-index).
- Dynamic entities (services/projects/posts) carry their own `seo_title`/
  `seo_description` columns — the SEO Manager table is for static routes.
- JSON-LD builders live in `lib/seo/jsonld.ts` (Organization, WebSite, BreadcrumbList,
  Service, BlogPosting) and render via `<JsonLd data={…} />`.

## 14. How sitemap/robots work

`src/app/sitemap.ts` merges static routes + `getServiceSlugs()` + `getProjectSlugs()` +
`getPostSlugs()` (published only), revalidates hourly. `src/app/robots.ts` allows
everything except `/ajadmin` and declares the sitemap. **Nothing to maintain** unless you
add a new top-level section — then add its route + slug source here.

## 15. How deployment works

Full guide: `website/README.md` (env vars table, Vercel/Netlify/Cloudflare steps, CSP
origins, caching, backups, post-deploy checklist). Short version: push to GitHub →
import on Vercel with **root directory `website`** → set the 5 env variables → deploy.
Redirects for changed slugs: add a row in the `redirects` table (SEO Manager) — the edge
proxy serves 308s within 5 minutes.

## 16. How to add a payment gateway later

The admin **Payment Links** module (external secure URLs) already covers manual invoicing.
For a real gateway (Razorpay for India, Stripe for international):
1. Add server-only credentials to env (`RAZORPAY_KEY_SECRET` etc. — never `NEXT_PUBLIC_`).
2. Create orders/checkout sessions **server-side** (Server Action or route handler).
3. Verify payment via **webhook signature verification** server-side; never trust the
   browser callback. Store only references/status (extend a `payments` table).
4. Add a role-protected admin view; sandbox/test mode first; update Terms/Privacy/Refund.

## 17. Email notifications (already integrated — Resend)

Set `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_ADMIN_TO`. Templates:
`lib/email/templates.tsx`; sender: `lib/email/email.ts`; wired after each successful
lead insert (non-blocking — a failed email never fails the lead save; failures are
logged server-side). Domain verification in Resend is required for production sending.

## 18. How to add analytics later

Recommended: **Umami Cloud** (cookieless, privacy-first). Set
`NEXT_PUBLIC_UMAMI_SRC` + `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, render the deferred script in
the public layout, and track the planned events (`start_project_click`,
`quote_form_start/submit`, `project_view`, `service_view`, `contact_click`) via a small
`window.umami` helper. Never send form contents. Document the tool in `/privacy` and
respect consent requirements. Defer the script (after load) to protect Core Web Vitals.

## 19. How to add multilingual support later

The cleanest path in App Router: introduce a `[locale]` segment with `generateStaticParams`
for locales, move strings into message files (`next-intl` is the standard choice), keep
Slugs per-locale in the CMS (add a `locale` column), and set `alternates.languages` in
`buildMetadata`. Plan it as its own project — it touches routes, CMS and SEO.

## 20. Backup & migration practices

- Before every migration: Supabase → Database → Backups → manual backup (or
  `npx supabase db dump --linked -f pre-migration.sql`).
- Storage buckets are **not** in DB backups — export periodically.
- Restore drill: restore into a staging project, point a dev branch at it, verify.
- Pre-redesign file backup: `../Ajsystemsoft_backup/AJS_website_full_backup_2026-08-30.rar`.
- GitHub holds full history; the `Ajsystemsoft_backup` RAR is the offline snapshot.

## 21. AI/developer handoff notes

- No proprietary AI-tooling dependencies — any competent developer or coding AI can work
  from this guide, the typed data layer and the test suite.
- Useful entry points for agents: `docs/PHASE-0-ARCHITECTURE-PLAN.md` (decisions),
  this guide, `src/lib/admin/resources.ts` (CMS surface), `lib/validation/*` (contracts).
- After any structural change: update this guide + `website/README.md` phase status.

## 22. Quality gates (run inside `website/`)

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

Plus `BASE_URL=<env> node scripts/seo-verify.mjs` (SEO), and the Playwright scripts
(`scripts/responsive-qa.mjs`, `scripts/release-qa.mjs`) with a running production server.
