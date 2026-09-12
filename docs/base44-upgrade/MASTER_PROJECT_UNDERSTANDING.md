# AJ System Soft Technology — Phase 0 project understanding

Date: 2026-09-12. Baseline source commit: `421447d827a2f5ec60acd2cc05e830b3acbbc92f`. Branch: `upgrade-desktop-navbar`.
Authority: [the supplied master plan](MASTER_UPGRADE_PLAN.md), current user instructions and [PHASE_STATUS](PHASE_STATUS.md). This is a NEW 0–17 program; older `docs/PHASE-*` and UI audit reports are historical evidence, not completion of this program.

## Current progress

Phase 1 source fixes and current verification levels are recorded in [PHASE_1_FUNCTIONAL_AUDIT](PHASE_1_FUNCTIONAL_AUDIT.md). The original Phase 0 snapshot below is retained: dashboard lead access and supported slug redirect matching have since been repaired, and publication permission checks added to generic/Builder saves. Full backend verification remains blocked. The owner explicitly deferred those checks to proceed with documentation-only Phase 2; see [information architecture](PHASE_2_INFORMATION_ARCHITECTURE.md), [visitor journeys](PHASE_2_USER_JOURNEYS.md) and [benchmark evidence](PHASE_2_BENCHMARKS.md). The live composition is unchanged and proposed material moves still require approval. [Phase 3](PHASE_3_DESIGN_SYSTEM.md) subsequently refined shared presentation tokens, contrast, focus, shadows and component classes; 210 regression tests and an isolated production build passed at that phase. [Phase 4](PHASE_4_NAVBAR_HERO.md) subsequently extracted/refined the hero, clarified existing service coverage, preserved accepted navigation and added portal disclosure/focus restoration; 232 tests, 15 independent browser journeys and a final isolated production build pass. Current 919px tablet light/dark captures were reviewed. [Phase 5](PHASE_5_HOMEPAGE_SECTIONS.md) then refined homepage-only section presentation while retaining the entire current sequence and copy: 245 tests, 21 independent browser journeys plus runtime guards, public-proxy navigation and isolated production build pass. Its live iframe health checks pass, but hidden screenshot and navigation-helper limitations required independent visual/journey evidence. Auth/backend blockers remain deferred.

## Scope and evidence honesty

- All **337 tracked files** were read for an inventory/hash baseline; **239 TS/TSX/CSS source modules** indexed for imports, exports and literal database/storage references. See [source-inventory.json](evidence/source-inventory.json).
- Critical composition, auth, authorization, data loaders, mutations, SQL definitions, navigation, motion, SEO and deployment configuration were inspected. The route/handler/resource maps cover the repository, including fallback and private surfaces.
- Indexing is not exhaustive manual line-by-line security proof. Phase 1 must deepen action-by-action, role-by-role verification. No claim that every button, configured backend or database policy works is made here.
- Phase 0 is **documentation and baseline only**: no shipped TS/TSX/CSS/config/dependency/migration changes; no secrets added; no database writes, seeds, destructive actions, auth bypass or deployment.
- The Base44 app is **not published**. `https://www.ajsystemsoft.in` appears in the owner's plan as a target/existing-site reference, not a verified deployment of this branch.

## Architecture

| Layer | Actual implementation |
|---|---|
| Runtime | Node 22 Docker development service; repository `website/` bind-mounted at `/app`; Next dev/Turbopack on port 3000 |
| Frontend/server | Next.js 16.3.3 App Router, React 19.2.8, TypeScript 5.9.3; server-rendered public routes with small client islands |
| Styling | Tailwind v4, CSS Modules, root tokens in `src/app/globals.css`; surface/accent/action styles imported by root layout |
| UI primitives | `src/components/ui`; `@/components/ui` aliases; Lucide icons; shadcn-style config; no replacement stack |
| Animation | CSS/WAAPI reveal-once + IntersectionObserver; SceneMotion native-scroll depth, fine-pointer SurfaceMotion; Framer Motion shared-layout navbar lamp |
| Backend | Supabase Postgres/Auth/Storage called by Next server components, Server Actions and two auth handlers; no separate custom REST API service |
| Data validation | Zod, resource field allowlists, typed mappers and generated-style database definitions |
| Email | Optional Resend server integration; lead persistence and delivery are separate outcomes |
| SEO | Metadata helpers + CMS overrides; generated robots, sitemap, RSS, icon/OG; JSON-LD |
| Tests | Vitest: 23 test files / 146 assertions; ESLint; TypeScript; browser evidence in this folder |

### Entrypoints and composition

- `src/app/layout.tsx`: self-hosted Geist Sans via installed `geist`, root metadata, pre-paint user-selected theme, global CSS, AdSense script, RevealObserver, SceneMotion and SurfaceMotion.
- `(public)/layout.tsx`: parallel settings/navigation/announcement/offer reads; PublicSiteFrame; Organization/WebSite JSON-LD; skip link; MarketingHeader; Footer; optional announcement/popup.
- `(public)/page.tsx`: static/300s revalidation, parallel home/settings/benefits reads, LocalBusiness JSON-LD and `HomeExperience`.
- Current home order: hero/CTAs → trust → optional launch benefits → service intro/journey → platform/project proof → delivery process → ownership/support → industries/technology/why-us/reviews/team/blog → final CTA. Preserve all current content; Phase 2 documents proposals before Phase 5 implementation.
- `HomeExperience` is shared with noindex `/design-preview`. It renders a fixed composition and does **not** call the existing `getHomeSections` CMS builder reader. This is a documented Phase 1 issue, not silently fixed in Phase 0.
- Public inner pages use PageHero/SectionHeader, shared cards, breadcrumbs and Markdown for real detail content. There are **38 page files**, **3 route handlers**, **36 client modules**, **10 Server Action modules**.
- `MotionWords` intentionally has one screen-reader string plus `aria-hidden` visual words. Raw `h1.textContent` therefore repeats some headings; that alone is NOT proof of duplicated accessible H1s.

### Navigation baseline — explicit owner constraints

- Desktop starts at **1024px**, one row only, **64px tall / 60px scrolled**; eight default labels: Home, Services, Projects, AI Methods, Reviews, About, Team, Contact.
- Brand name is always visible at the left; links are centered as a compact group with **2px inter-item gaps**; login, search and project CTA stay on the right. No desktop More.
- Below 1440px desktop links are text-only. Below 1200px only the redundant AJ mark disappears, never the brand name; link type/padding compact slightly.
- Mobile/tablet keep the prior bottom dock: Home, Services, More, Projects, Contact; native More dialog exposes overflow/utilities. Do not treat Phase 4 as approval to break or replace this accepted behavior.
- Native dialog search, Ctrl/Command-K, Escape/focus restoration, route-derived active lamp, login handler and theme must survive later phases.

## Backend and data flows

1. `lib/env.ts` treats absent paired Supabase public values as unconfigured; partial configuration throws. `lib/env.server.ts` is server-only. None of the six documented integration keys is present in the current runtime.
2. `supabase/public.ts`: anonymous/RLS-bound public reads without session; `server.ts`: request cookies; `client.ts`: browser singleton/session; `admin.ts`: **server-only service-role clients which bypass RLS**, requiring explicit authorization at callers.
3. `proxy.ts`: cookie session refresh and login redirects for configured admin/client paths; safe recovery redirect from root; soft-failing cached SEO redirect lookup. Current matcher does not cover all public service/project/blog URLs, so changed-slug redirect coverage needs Phase 1/10 review.
4. `auth/session.ts`: request-cached `getUser` + profile. Missing profile falls back to **client**, never staff. Roles: super_admin > admin > editor > client; capability checks in `permissions.ts`, route/action guards, SQL RLS.
5. Generic CMS CRUD is schema-driven in `admin/resources.ts`, `crud.ts`, `actions.ts`: allowlisted fields, Zod, capability checks, returned row-id confirmation, conflict states, publication/activation/soft deletion/restore/reorder, path/tag revalidation. Service-role bypass means RLS alone cannot protect these calls.
6. Dedicated modules cover home builder, settings, media, users, leads, agreements/PDF/versioning. These are real integrations, not mocked persistence.
7. Lead forms → Zod/honeypot/minimum fill time/rate limiter/consent → Supabase insert/upload → optional agreement acceptance and email. Missing configuration returns a failure, not fake success. Rate limiting is process-local, not a distributed production abuse-control guarantee.
8. Client portal → validated server actions for login/signup/profile/address/avatar/review/password flows; browser Google OAuth → server callback; client documents/messages and linked enquiries use user-scoped access. Successful auth/OAuth/recovery/data persistence is **blocked** pending real configuration/test accounts.
9. Auth callbacks exchange PKCE code or verify token hash; safe redirect helpers and recovery cookie constrain password-reset flow. No-token callback/confirm probes redirect to login error states. No real token flow was attempted.
10. Public service/blog fallback copy is already in the repository (15 service slugs, 3 blog slugs in this baseline). Projects/team/reviews/AI resources use honest empty states without CMS. Existing real content must not be replaced by invented data.

### Database and storage inventory

- **16 numbered SQL migrations**, 0001–0016; **34 distinct public tables** with literal RLS-enable statements in repository SQL. Presence in SQL is not proof of applied migrations or working policies.
- Domains: profiles/admin usernames/addresses; site settings/navigation/sections/SEO/redirects; services/FAQs; clients/projects/media; team/testimonials; blog taxonomy/posts; contact/quote/appointments/payment links; media/audit; portal documents/messages; offers/announcements/benefits/socials; agreements/versions/acceptances.
- Migration 0001 historically defaults profiles to editor; later 0011/0012 introduce client role and explicitly default new users to client. Do not enable public signup against a partially migrated project.
- Storage includes public media and private lead attachments, profile avatars and agreement-related assets. Bucket policies, upload limits/MIME validation and signed/private access need configured testing.
- `ai_methods` is typed, queried and configured as a CMS resource but has **no CREATE TABLE in the committed migrations**. `lead-attachments` and `profile-avatars` from the literal-reference report are storage buckets, not missing SQL tables.
- No migration/seed was run; existing remote data/project selection was not changed.

## SEO, assets and performance

- Preserve route slugs, canonical helpers, metadata overrides, sitemap, RSS, JSON-LD and true noindex private surfaces. Do not paste research keywords into page/meta text.
- Existing keyword notes: `website/docs/seo/keyword-map.md`; no exactly-5,000 candidate CSV exists in this baseline. Phase 11 alone creates/validates that research file; current SEO map is an inventory, not research completion.
- Root contains a small curated `SITE_KEYWORDS` metadata array; its existence is not an effective ranking strategy and is not permission to expand it. Owner approvals, useful content and measured intent guide later SEO work.
- Existing external integrations include global AdSense and an optional legacy decorative-video CDN component. CSS-first current home artwork and self-hosted fonts avoid requiring decorative WebGL. Presence of a legacy component is not proof it is mounted on the home route.
- Current sandbox and isolated build use `NEXT_PUBLIC_SITE_URL=http://localhost:3000`; canonical/sitemap hostname is consequently localhost. This is **not** production SEO verification.
- Public loaders use a mixture of request cache, 300s data/tag caches and parallel composition. Database latency/caching/invalidation cannot be benchmarked while unconfigured.
- See [PERFORMANCE_BASELINE](PERFORMANCE_BASELINE.md) for measured lab-only values, not field CWV or a performance promise.

## Important existing risks

See [REGRESSION_BASELINE](REGRESSION_BASELINE.md) for severity, evidence, blockers and next-phase ownership. In particular: missing integrations, missing AI schema, disconnected Home Builder, missing offers/updates routes, redirect matcher coverage and dashboard lead visibility/capability mismatch require review before declaring end-to-end correctness.

## Continuation and rollback

- Read MASTER_UPGRADE_PLAN, this document, PHASE_STATUS and REGRESSION_BASELINE before every phase. Compare current `git rev-parse HEAD`/diff; read the previous recorded baseline commit in context rather than overwriting newer owner edits.
- The platform commits/pushes at turn end. Do not manually commit, force-push, switch branches or invent a post-turn commit hash. Open/merge a PR only on explicit user approval.
- Phase 0 app rollback is unnecessary: app code/config/DB were not modified. Its documentation is additive; removing it would remove audit memory only, not runtime features.
- Next command advances **only Phase 1**. No design-system, SEO research or route repair has been executed here.
