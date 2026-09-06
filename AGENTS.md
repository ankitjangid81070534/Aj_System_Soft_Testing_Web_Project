# Base44 Dev Environment

## What this is
A Next.js 16 (App Router, Turbopack) company website for AJ System Soft Technology.
The app lives in `website/`. It uses **Supabase** (Postgres + Auth + Storage) as its
backend, but is designed to **boot and render public pages with fallback content**
when Supabase is not configured — the env parser returns `null` and data layers fall
back to real capability copy (no invented facts).

## Running it
```bash
docker compose -f docker-compose.base44.yml up -d
```
- Web entry point: **host port 3000** (mapped to Next.js dev server).
- The compose uses `node:22-bookworm-slim`, bind-mounts `website/` at `/app`, and runs
  `npm install && npm run dev` with Turbopack. Edits hot-reload live.
- `node_modules` lives in a named volume (`web_node_modules`) to avoid host conflicts.

## Supabase credentials (external service)
The app degrades gracefully without them, so they are **not required to boot**.
For full functionality (database content, auth, admin CMS, lead capture), provide:
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, paired)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, admin CMS)
- `RESEND_API_KEY` / `EMAIL_FROM` / `EMAIL_ADMIN_TO` (optional, transactional email)

Migrations live in `website/supabase/migrations/` (0001–0016), applied in numeric order
to a Supabase project. Apply them in the Supabase SQL editor or via `supabase db push`.

## Preview origin
Next.js `allowedDevOrigins` is derived from `BASE44_PUBLIC_HOST_SUFFIX` in
`website/next.config.ts` so the preview proxy can access dev assets and HMR.
- The embedded preview cannot render with `X-Frame-Options: DENY` or CSP
  `frame-ancestors 'none'`. These are omitted ONLY in development with the Base44
  suffix present; production and ordinary local development keep both protections.
  `src/lib/preview-security.test.ts` covers all four mode/suffix combinations.
- Compose restarts the web service unless explicitly stopped. The managed env file
  is optional and last, so public fallback pages boot without external credentials
  and any later dashboard-provided credentials reach the process.
- No external credentials were provided during the preview repair. Successful
  form persistence, email delivery, and authenticated operations remain unverified.

## Key files
- `website/src/lib/env.ts` — public env parsing (returns null when Supabase unset)
- `website/src/lib/env.server.ts` — server-only service-role key
- `website/src/proxy.ts` — edge middleware (admin auth gate, SEO redirects)
- `website/src/lib/data/*-fallback.ts` — fallback content used without Supabase

## Verify
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` → 200 with real HTML
- Dev assets under `/_next/static/chunks/...` → 200 to the external host
- `/ajadmin` renders a setup notice (Supabase not configured) rather than crashing

## Presentation and motion
- `/` and `/design-preview` share `components/design-preview/HomeExperience.tsx`. The public route still fetches existing home/settings/benefits data and emits its original metadata/JSON-LD. `docs/reference-motion.md` records the complete 00–36s reference review.
- `PublicSiteFrame` shares the navigation/footer presentation across ALL public/account routes; homepage-only typography still uses `.page`. Shared tokens live in `globals.css`, surfaces in `surface-system.css`, inner-page composition in `page-hero.module.css`, and the CMS shell in `admin-surface.module.css`. Header/footer theme selectors must NOT be scoped only to `.page`.
- A single `RevealObserver` owns replay: entry animates, complete viewport exit rearms. Do not unobserve after first entry, restore the old five-second timer, or add a second homepage observer. Content stays visible without JS, on interruption and for reduced motion. `data-reveal-cycle` supports regression assertions.
- `SceneMotion` uses one idle-when-settled loop for visible decorative scenes and adapts navigation contrast over dark sections. `SurfaceMotion` only tilts fine-pointer, non-form cards; admin controls, forms, dialogs and touch inputs remain level. Both clean up listeners and frames.
- `ScrollJourney` uses native scrolling with an eased horizontal track and panel rotation above 700px. Mobile, reduced-motion and no-JS stack the scenes. Delivery stages also follow native scroll on large/tall screens only; all five buttons and the no-JS description list remain available.
- Native dialog close events can be queued during React Strict Mode cleanup. The portal ignores stale close events when its dialog has already reopened; keep this guard.
- `npm run typecheck` and `npm run test` (112 tests) run in the web container. With Chromium installed, `node scripts/verify-presentation.mjs` checks three repeat-scroll visits, native-wheel panels, five delivery buttons, pointer tilt, links, accordion, theme persistence, menus, 16 extra routes, reduced motion and no-JS at desktop/tablet/mobile. It is read-only and never signs in or writes records. Optional `APP_URL` and `SCREENSHOT_DIR` configure it.
- Wait for newly entered finite animations after scrolling before screenshots; disabling animations before the entry observer fires can capture a mid-reveal frame. Authenticated CMS editing, uploads and successful remote form submissions remain unverified without configured Supabase/staff access.
