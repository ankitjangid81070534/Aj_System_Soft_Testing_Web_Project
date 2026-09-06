# AJ System Soft Technology — Company Website

Official website of **AJ System Soft Technology** (short brand: **AJS Technology**).

> Software built around your requirements.

Custom software, SaaS platforms, websites, web and mobile apps, desktop software and
industry-specific business systems (ERP, CRM, POS, hospital software and more).

## Stack

- **Next.js 16** (App Router, server-first, React Server Components by default)
- **TypeScript 5.9** (strict) · **Tailwind CSS 4** (CSS-first design tokens)
- **Supabase** — PostgreSQL, Auth, Storage, Row Level Security
- **Zod** validation · **Vitest** tests · **ESLint + Prettier**

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real values (never commit them)
npm run dev
```

## Scripts

| Script              | Purpose                    |
| ------------------- | -------------------------- |
| `npm run dev`       | Development server         |
| `npm run build`     | Production build           |
| `npm run start`     | Serve the production build |
| `npm run lint`      | ESLint                     |
| `npm run typecheck` | TypeScript, no emit        |
| `npm run test`      | Vitest (single run)        |
| `npm run format`    | Prettier write             |

## Routes

- Public: `/`, `/services`, `/projects`, `/about`, `/team`, `/contact`, `/request-quote`, `/blog`, legal pages.
- Admin: `/ajadmin` (protected, noindex) with `/ajadmin/login`.

---

# Deployment guide

The app is a standard Next.js (App Router) project with **no provider-specific runtime
code**, so it deploys unchanged to Vercel, Netlify or a Cloudflare-compatible path.

## 1. Environment variables (all platforms)

| Variable                                           | Public?                | Source                                                                                                |
| -------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                             | yes                    | Your canonical production URL, e.g. `https://your-domain.com` (no trailing slash)                     |
| `NEXT_PUBLIC_SUPABASE_URL`                         | yes                    | Supabase → Project Settings → API → Project URL                                                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                    | yes                    | Supabase → Project Settings → API → anon key (protected by RLS)                                       |
| `SUPABASE_SERVICE_ROLE_KEY`                        | **no — server only**   | Supabase → Project Settings → API → service_role key. Never commit, never prefix with `NEXT_PUBLIC_`. |
| `GOOGLE_SITE_VERIFICATION`                         | yes (public by design) | Search Console HTML-tag verification value (see `../docs/PHASE-11-SEARCH-CONSOLE.md`)                 |
| `RESEND_API_KEY` / `EMAIL_FROM` / `EMAIL_ADMIN_TO` | server only            | Optional — Resend transactional email for lead notifications (key is server-only)                     |

No other secrets exist. Provider credentials for deployments are configured in each
platform's dashboard, never in the repo.

## 2. Supabase production setup (one time)

1. Create the production project (or reuse the staging one).
2. Apply migrations **in order** (SQL editor or CLI):
   `supabase/migrations/0001_roles_and_profiles.sql` → the latest numbered migration,
   in numeric order. All migrations are designed to be safely re-applied.
3. Follow `../docs/PHASE-2-SUPABASE-SETUP.md`:
   disable public sign-ups → create the first user → promote to `super_admin` via SQL.
4. Authentication → URL Configuration: set Site URL to the production domain and add the
   domain to redirect allow-lists.

## 3. Migrations process (ongoing)

- New migrations are numbered files in `supabase/migrations/`, applied in order.
- CLI: `npx supabase link --project-ref <ref>` then `npx supabase db push`.
- SQL editor: paste-and-run each new file. Idempotency makes re-runs safe.
- When the schema changes, regenerate types:
  `npx supabase gen types typescript --linked > website/src/types/database.ts`.

## 4. Platform setup

### Vercel (primary)

1. Import the GitHub repo → Framework preset: **Next.js** (auto-detected).
2. Root directory: `website`. Build command `npm run build` (default). No overrides needed.
3. Add the environment variables from §1 → Deploy.

### Netlify

`netlify.toml` in the repo configures the build and the official Next.js runtime plugin.
Set the same environment variables (Site settings → Environment variables) → Deploy.

### Cloudflare

Use a Next.js-compatible path such as OpenNext (`@opennextjs/cloudflare`) or Cloudflare
Pages with the Next.js adapter. Note: the edge proxy (`src/proxy.ts`) and standard
`next build` output are supported; Next image optimisation runs differently on Cloudflare —
either keep the default loader on a Node host or switch `images.unoptimized` and serve
media from Supabase's transform endpoint. Validate the CSP headers still apply.

## 5. Security headers & CSP

Set in `website/next.config.ts` for every route: `Content-Security-Policy`,
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`.

**Required external origins (the only ones the site uses):** `https://*.supabase.co`
(REST/Auth/Storage/media) and `wss://*.supabase.co` (Realtime, only if enabled).
Adding any other third party (analytics, payments, chat) means extending the matching
CSP directive in `next.config.ts` — document it here when you do.

`/ajadmin/*` additionally serves `X-Robots-Tag: noindex, nofollow` and stays behind the
auth gate (proxy + server-side role checks + RLS) in production.

## 6. Caching

- Static assets: immutable caching by the platform/Next (content-hashed filenames).
- HTML: public pages are static or ISR (300s home/services/blog; feeds 1h).
- Edge redirect map: 5-minute cache in the proxy.

## 7. Backups & restore

- Supabase → Database → Backups: daily backups on paid plans; take a manual backup before
  every migration.
- CLI dump: `npx supabase db dump --linked -f backup.sql` (schema and data flags available).
- Storage: periodically export buckets (`supabase storage ls` / dashboard download) —
  object storage is not included in DB backups.
- Restore drill: restore the dump into a staging project and run the app against it once
  before relying on it (an untested backup is not a backup).

## 8. Post-deploy checklist

- [ ] `/` returns 200 and the correct production canonical URL (view source)
- [ ] `/ajadmin` redirects to `/ajadmin/login` when signed out
- [ ] `/sitemap.xml` and `/robots.txt` resolve against the production domain
- [ ] Security headers present (check `Content-Security-Policy`, `X-Frame-Options`)
- [ ] Lead forms submit end-to-end and appear in `/ajadmin/leads`
- [ ] `/login` renders and email/Google callbacks return through `/auth/callback`
- [ ] a linked real client can see `/account`; an unlinked signup cannot submit a verified review
- [ ] `/ajadmin/login` accepts the staff username mapping and never renders admin navigation first
- [ ] Then follow `../docs/PHASE-11-SEARCH-CONSOLE.md`

## Project status — phase plan

Phases 0–14 complete: scaffold → Supabase/RLS → design system → landing → services →
projects → about/team → contact/quote/leads → /ajadmin CMS → blog → SEO → performance →
a11y/security → deployment. Remaining per master plan: responsive QA (15), release QA (16),
Search Console (17), maintenance docs (18).

## Rules this project follows

- Real content only — no invented clients, ratings, testimonials or results.
- The Supabase service-role key is server-only and never ships to the browser.
- Public data is protected by Supabase RLS: anonymous reads see only published + active + public records.
- `/ajadmin` is protected by real authentication (proxy gate + server-side checks), never by obscurity.
