# PHASE 0 — Repository Audit + Safe Architecture Plan
**Project:** AJ System Soft Technology — Company Website
**Date:** 2026-08-30 · **Status:** Plan only — no production code changed
**Master spec:** `AJ_System_Soft_Technology_Company_Website_Master_Prompt.txt`

---

## 1. Repository Audit (current state)

| Item | Finding |
|---|---|
| Repository contents | Only `AJ_System_Soft_Technology_Company_Website_Master_Prompt.txt` (52 KB) — **NEW/EMPTY project** |
| Framework / runtime | None yet — must be proposed |
| Package manager | **npm 11.19.0** installed (no pnpm/yarn/bun present) |
| Node runtime | **v26.7.0** — supports the latest Next.js line |
| Git | 2.55.0.windows.4 available — repo not yet initialized |
| Auth / DB / APIs | None — Supabase will be added in Phase 2 |
| Styling | None — Tailwind CSS v4 proposed |
| Existing pages / broken areas | None (greenfield) |

### Verified latest stable versions (npm registry, checked 2026-08-30)
`next 16.3.3` · `react 19.2.8` · `tailwindcss 4.3.3` · `typescript 5.9.3` (7.0.2 exists but deferred — see Risks) · `@supabase/supabase-js 2.112.4` · `@supabase/ssr 0.12.5` · `zod 4.5.4` · `lucide-react 1.37.0` · `eslint 10.9.1` + `eslint-config-next 16.3.3` · `vitest 4.1.11` · `playwright 1.62.1`

---

## 2. Architecture Summary

**Stack decision (production-safe, latest stable):**

- **Next.js 16 (App Router)** — server-first, React Server Components by default, route groups for public vs admin, built-in image/font/metadata/SEO tooling.
- **React 19 + TypeScript strict (5.9 line)** — `strict: true`, no `any` leakage.
- **Tailwind CSS v4** — CSS-first `@theme` design tokens (colors, spacing, radius, shadows, easing). Satisfies the "strongly structured CSS token system" requirement without runtime JS.
- **Supabase** — PostgreSQL + Auth (cookie sessions via `@supabase/ssr`) + Storage + RLS. Service-role key server-only, enforced by `import 'server-only'` guard + lint rule.
- **Zod v4** — one schema source of truth for public forms AND admin content (including home-page section JSONB).
- **Server Actions** for public form submissions and admin mutations (less JS than API routes); minimal REST surface.
- **CSS-based soft-3D only** — transforms/perspective/shadows; no WebGL, no animation library at start. A tiny IntersectionObserver reveal utility + `prefers-reduced-motion` support.
- **Testing** — Vitest (unit: validation, data mappers, SEO builders); Playwright added at Phase 16 for E2E release QA.
- **npm** as package manager (already installed; zero friction on Windows; fully supported by Vercel/Netlify/Cloudflare).

**App location decision:** the Next.js app will live in a **`website/` subfolder** of this workspace, with git repo at workspace root. Reason: the workspace path contains spaces (`Aj System Technology Company`), which some tooling handles poorly — a subfolder isolates the app; the master prompt stays at root as reference; `/docs` holds project documentation.

---

## 3. Repository Map (planned, after Phase 1)

```
Aj System Technology Company/          ← git repo root
├─ AJ_System_..._Master_Prompt.txt     (reference, stays)
├─ docs/
│  ├─ PHASE-0-ARCHITECTURE-PLAN.md     (this file)
│  └─ … phase reports, deployment guide, maintenance guide (Phase 18)
└─ website/                            ← Next.js app root
   ├─ public/                          favicon, default OG image, static assets
   ├─ src/
   │  ├─ app/
   │  │  ├─ layout.tsx                 root layout (fonts, metadata base)
   │  │  ├─ (public)/                  marketing route group + shared shell
   │  │  │  ├─ page.tsx                Home
   │  │  │  ├─ services/page.tsx      services/[slug]/page.tsx
   │  │  │  ├─ projects/page.tsx      projects/[slug]/page.tsx
   │  │  │  ├─ about/  team/  contact/  request-quote/
   │  │  │  ├─ blog/page.tsx          blog/[slug]/page.tsx
   │  │  │  └─ privacy/  terms/  (+ conditional cookie-policy, refund-policy, security)
   │  │  ├─ ajadmin/                   admin group — noindex, auth-gated
   │  │  │  ├─ login/
   │  │  │  └─ (dashboard)/ dashboard, brand, home, navigation, services,
   │  │  │                 clients, projects, team, testimonials, blog,
   │  │  │                 media, inquiries, quotes, appointments, payments,
   │  │  │                 seo, users, audit
   │  │  ├─ sitemap.ts  robots.ts  not-found.tsx  error.tsx  loading.tsx
   │  ├─ components/
   │  │  ├─ ui/                        design-system primitives (Phase 3)
   │  │  ├─ site/                      public page sections (Phase 4+)
   │  │  └─ admin/                     admin module UI (Phase 9)
   │  ├─ lib/
   │  │  ├─ env.ts                     Zod-validated environment access
   │  │  ├─ supabase/                  browser client, server client, service client (server-only), middleware helper
   │  │  ├─ data/                      typed server data-access layer (all Supabase queries)
   │  │  ├─ validation/                Zod schemas (forms + CMS content)
   │  │  ├─ seo/                       metadata builders, JSON-LD builders
   │  │  └─ utils/
   │  ├─ types/                        generated DB types + domain types
   ├─ supabase/
   │  ├─ migrations/                   ordered SQL migrations
   │  └─ seed/                         DEMO-ONLY seed (clearly labelled)
   ├─ .env.example                     placeholders only
   ├─ next.config.ts  tsconfig.json  eslint.config.mjs  postcss.config.mjs
   └─ package.json                     scripts: dev, build, start, lint, typecheck, test
```

---

## 4. Public Route Map

| Route | Purpose | Notes |
|---|---|---|
| `/` | Landing page | 16-section order per master spec; CMS-driven, graceful empty states |
| `/services` | Services index | grouped by category |
| `/services/[slug]` | Service detail | H1, problems solved, deliverables, platforms, FAQ, CTA, breadcrumbs |
| `/projects` | Portfolio | filters by platform/category/industry where data exists |
| `/projects/[slug]` | Case study | full model; only published+active+public |
| `/about` | Company | primary + short + alternate names used naturally |
| `/team` | Team | real people only, CMS-managed |
| `/contact` | Contact | details + inquiry form |
| `/request-quote` | Quote form | fields per master spec; server-validated, rate-limited |
| `/blog` · `/blog/[slug]` | Insights | categories, tags, author, Article schema |
| `/privacy` · `/terms` | Legal | required |
| `/cookie-policy` | Conditional | only if analytics/cookies actually used |
| `/refund-policy` | Conditional | only if payment flows actually used |
| `/security` | Optional | professional practices page |
| `/sitemap.xml` · `/robots.txt` | SEO | generated via app routes |
| 404 / error / loading | States | branded, all routes |

## 5. /ajadmin Route Map

| Route | Module |
|---|---|
| `/ajadmin` | Dashboard (counts, drafts/published, latest inquiries, quick actions, storage overview) |
| `/ajadmin/login` | Login (Supabase Auth; noindex) |
| `/ajadmin/brand` | Brand & website settings (names, logo, contact, social, hours, footer, OG default, accent preset) |
| `/ajadmin/home` | Home Page Builder (validated section types, order, visibility, draft/publish) |
| `/ajadmin/navigation` | Navigation items CRUD |
| `/ajadmin/services` | Services CRUD (+FAQs) |
| `/ajadmin/clients` | Clients CRUD (incl. public_client_permission) |
| `/ajadmin/projects` | Projects CRUD (+features, technologies, media, public/private, draft/publish) |
| `/ajadmin/team` | Team CRUD (+photos, skills, social links) |
| `/ajadmin/testimonials` | Testimonials CRUD (real only) |
| `/ajadmin/blog` | Blog CRUD (categories, tags, draft/publish/schedule, SEO) |
| `/ajadmin/media` | Media library (buckets, alt text, upload validation) |
| `/ajadmin/inquiries` | Contact submissions inbox (status pipeline, notes) |
| `/ajadmin/quotes` | Quote requests inbox (status pipeline, notes, assignment) |
| `/ajadmin/appointments` | Optional appointment requests |
| `/ajadmin/payments` | Optional admin-managed external payment links (no card data) |
| `/ajadmin/seo` | Per-page SEO metadata + redirect manager |
| `/ajadmin/users` | Users & roles (Super Admin only; server-enforced) |
| `/ajadmin/audit` | Audit log viewer |

Middleware redirects unauthenticated `/ajadmin/*` to login (UX layer); **real authorization is enforced server-side in every query/mutation + Supabase RLS**.

---

## 6. Supabase Schema Plan

**Conventions:** uuid PKs (`gen_random_uuid()`), `created_at`/`updated_at` timestamptz, `created_by`/`updated_by` → `profiles.id` where useful, unique slugs, status enums, `is_active`, `is_public`, `sort_order`, soft-delete `deleted_at` on content tables, safe FK cascades (RESTRICT on content, CASCADE on join tables), indexes on slug/status/featured/sort_order/timestamps.

| Group | Tables |
|---|---|
| Identity & access | `profiles` (1:1 auth.users, role ref), `roles`, `permissions`, `role_permissions`, `user_roles` |
| Site config | `site_settings`, `navigation_items`, `page_sections` (home builder), `seo_metadata`, `redirects` |
| Services | `services`, `service_faqs` |
| Portfolio | `clients`, `projects`, `project_features`, `project_technologies`, `project_media` |
| Team | `team_members`, `team_member_skills`, `team_media` |
| Social proof | `testimonials` |
| Blog | `blog_posts`, `blog_categories`, `blog_tags`, `blog_post_tags` |
| Leads | `contact_submissions`, `quote_requests`, `appointment_requests` |
| Ops | `payment_links`, `media_assets`, `audit_logs`, optional `content_revisions` |

**Home Page Builder model:** `page_sections` stores `section_type` (fixed enum: hero, trust_strip, services_overview, platforms, featured_projects, process, industries, tech_capabilities, why_us, testimonials, team, gallery, faq, cta) + `content JSONB` **validated by Zod per section type** — no arbitrary HTML/JS from admin. Section `sort_order`, `is_visible`, draft/publish per section + page-level publish.

**Audit logging:** PostgreSQL triggers on sensitive tables write `audit_logs` (user, action, entity, entity id, timestamp, safe summary) — DB-level, cannot be bypassed by the app; passwords/secrets never logged.

## 7. Auth / RLS / Storage Plan

- **Auth:** Supabase email+password; `@supabase/ssr` cookie sessions; middleware refresh; session data never trusted client-side for authorization.
- **Roles:** Super Admin / Admin / Editor (+ optional Content Manager, Lead Manager later). Role helper SQL functions (`public.current_role()`, `public.has_role(x)` as `SECURITY DEFINER STABLE`) prevent RLS recursion.
- **RLS rules:**
  - Anonymous (`anon`): SELECT **only** `status='published' AND is_active AND (is_public or visibility flag)` on content tables; no access to leads, users, audit, private media.
  - Authenticated staff: INSERT/UPDATE/DELETE gated by role helpers; Editors = content CRUD, no users/settings; Admins = all content + settings; Super Admin = users/roles/destructive ops.
  - Public write paths (contact/quote): INSERT-only policies + server-side Zod + rate limiting; no reads.
- **Storage buckets:** `public-site` (logos, OG), `project-media`, `team-media`, `client-media`, `blog-media`, `private-media` (signed URLs only). Upload validation server-side: MIME allow-list, size caps, filename sanitization; confidential client work must land in private buckets.
- **Key hygiene:** service-role key only in server env, used by a dedicated `lib/supabase/admin.ts` guarded with `import 'server-only'`; ESLint rule forbids importing it from client components.
- **Super Admin bootstrap:** documented one-time process (owner signs up, then promoted via SQL run by the owner) — no hardcoded credentials in repo.

## 8. Content / CMS Plan

- Every public page reads through `lib/data/*` typed query layer; sections/components handle missing optional content gracefully (no lorem ipsum, no fake data).
- Admin modules map 1:1 to schema tables with full lifecycle: create → draft → preview → publish → unpublish → deactivate → soft-delete → restore, plus search/filter/sort/pagination.
- Draft preview: unpublished records render only for authenticated staff via preview-safe queries (noindex).
- Seed data: explicitly DEMO-labelled, never presented as real company facts; no fake testimonials/results ever.

## 9. SEO Architecture

- Unique `generateMetadata` per route; title template `%s | AJ System Soft Technology`; canonical from `NEXT_PUBLIC_SITE_URL`.
- `sitemap.ts` = static routes + dynamic (published services/projects/posts); `robots.ts` disallows `/ajadmin`; admin pages additionally `noindex` meta + `X-Robots-Tag` header.
- JSON-LD builders in `lib/seo/`: **Organization** (name: AJ System Soft Technology; alternateName: AJS Technology, Ankit Jangid System Technology, Ankit System Technology; sameAs only real profiles), WebSite, BreadcrumbList, BlogPosting (blog), Service (only where semantically valid).
- One H1 per page, semantic heading order, descriptive alt text (admin-managed), internal linking via related sections, stable slugs + `redirects` table for changed slugs.
- Homepage title direction: "AJ System Soft Technology | Custom Software, SaaS, Web & App Development". No keyword stuffing. **No ranking guarantees — technical readiness only.**

## 10. Design-System Plan (TVC0 direction → original primitives)

The TVC0 direction is available as a written spec (not a codebase in this repo), so every primitive below is written **from scratch as original code** — no cloned assets/branding (per master rule).

| Direction item | Primitive to build |
|---|---|
| Floating rounded nav | `MarketingHeader` — sticky pill, compact-on-scroll, no layout shift, accessible mobile `MobileMenu` |
| Light neutral canvas | Tokens: `--bg`, `--surface`, `--ink` (near-black), brand blue accent scale |
| White rounded cards | `Card` (hover-lift variant), `ProjectCard`, `ServiceCard`, `TeamCard` |
| Soft shadows / soft-3D | Elevation token scale + CSS perspective/tilt utilities for `MediaFrame` (device/software frames) |
| Controlled glass/blur | Backdrop-blur utility limited to header/dialog (never animated blur) |
| Elegant typography | Self-hosted variable font via `next/font` (Geist Sans, fallback Manrope); fluid type scale |
| Subtle motion | `Reveal` (IntersectionObserver, CSS transitions, `prefers-reduced-motion` respected) |
| Layered product previews | `HeroComposition` — layered dashboard/mobile/desktop/ecommerce mock frames, pure CSS |
| Component set | Button, IconButton, Input, Textarea, Select/Combobox, SectionHeader, Badge, StatusPill, Tabs, Accordion, Dialog, Drawer, Toast, Skeleton, EmptyState, ErrorState, Footer, CTA |

## 11. Performance Strategy

- RSC by default; `use client` only on verified interactive islands (header menu, forms, dialogs, reorder).
- Fonts: one variable font, self-hosted, `next/font` (zero CLS, preloaded).
- Images: `next/image`, AVIF/WebP, explicit dimensions, `priority` hero-only, lazy below-fold.
- CSS-only reveals; no animation library; no autoplay video; no WebGL.
- Data: explicit column selects, server-side pagination, indexes per schema plan, request dedup via RSC caching.
- Admin edits → tag-based revalidation (`revalidateTag`) so public pages update without full-cache busts.
- Zero third-party scripts at launch; analytics deferred/optional later.
- Targets: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms; if any 3D effect hurts vitals → replace with CSS depth (master rule).

## 12. Deployment Plan

- Git init (Phase 1) → GitHub → **Vercel primary** (Next 16 first-class); Netlify and Cloudflare-documented as portable alternatives (no provider-specific runtime dependencies in core code).
- `.env.example`: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), plus placeholders for future email/analytics.
- Security headers in `next.config.ts`: CSP (with documented required Supabase origins so it doesn't break auth/storage), X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors 'none'.
- Migrations applied in order via Supabase CLI/SQL editor; backup/restore guidance in docs (Phase 14/18).
- Production checklist: /ajadmin still auth-gated + noindex in prod (verified at Phase 14/16).

## 13. Technical Risks

1. **Bleeding-edge versions** (Next 16, Tailwind 4, Zod 4): pin exact versions at scaffold; TypeScript **7.0 deferred** — TS 5.9 chosen for mature ecosystem compatibility (typed linting, editor tooling); revisit later.
2. **RLS recursion** on role checks → SECURITY DEFINER helper functions + dedicated policy tests (Phase 2).
3. **Windows path with spaces** → app isolated in `website/` subfolder; watch path length; consistent lowercase file names.
4. **Service-role key leakage** → server-only module guard + ESLint ban + env never prefixed `NEXT_PUBLIC_`.
5. **Stale public content after admin edits** → tag-based revalidation after every mutation; tested in Phase 9.
6. **Empty real content** (no real team/projects/testimonials yet) → all sections must degrade gracefully; NEVER fabricate content to fill pages.
7. **CSP vs Supabase origins** → required origins documented; prod-mode verification.
8. **Rate limiting on serverless** → platform-native/Upstash decision deferred to Phase 8; INSERT-only RLS + honeypot as baseline.
9. **Upload abuse** → MIME allow-list, size caps, server-side validation, private bucket defaults.
10. **No ranking guarantees** — Search Console readiness is the deliverable; indexing/ranking depends on Google.

## 14. Exact Next-Phase Order

Phase 1 scaffold → 2 Supabase/Auth/RLS/Storage → 3 design system → 4 landing → 5 services → 6 projects → 7 about/team → 8 contact/quote/leads → 9 /ajadmin CMS → 10 blog → 11 SEO pass → 12 performance pass → 13 a11y/security → 14 deployment portability → 15 responsive QA → 16 release QA → deploy → 17 Search Console → 18 maintenance docs. Optional: email → payments → analytics.

## 15. Likely Files to Create/Change in PHASE 1

`package.json` (pinned deps + scripts) · `next.config.ts` (headers, images) · `tsconfig.json` (strict) · `eslint.config.mjs` · `postcss.config.mjs` + `src/app/globals.css` (Tailwind 4 entry) · `.env.example` · `src/app/layout.tsx` · `src/app/(public)/layout.tsx` + placeholder `page.tsx` · `src/app/ajadmin/layout.tsx` + `login/page.tsx` placeholder · `not-found.tsx` `error.tsx` `loading.tsx` · `sitemap.ts` `robots.ts` (basic) · `src/lib/env.ts` · `src/lib/supabase/{client,server,admin}.ts` (typed, server-only guard) · folder skeleton per §3 · `README.md` (stub) · git init + first commit.

---
**PHASE 0 COMPLETE — awaiting PHASE 1 instruction.**
