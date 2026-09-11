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
- The latest finishing brief supersedes the old replay requirement: `RevealObserver` now animates ordinary content ONCE per mounted element, then unobserves it. `data-reveal-cycle="1"` prevents viewport exits, Strict Mode and mutations from restarting opacity. Content remains visible without JS, on interruption and under reduced motion. Orbit entrances remain CSS-owned; native-scroll storytelling still progresses in both directions.
- `SceneMotion` uses one idle-when-settled loop for visible decorative scenes and adapts navigation contrast over dark sections. `SurfaceMotion` is now opt-in ONLY for `[data-tilt="on"]` showcase cards; ordinary cards use CSS hover lift, and admin controls, forms, dialogs and touch inputs remain level. Both clean up listeners and frames.
- `ScrollJourney` uses native scrolling with an eased horizontal track and panel rotation above 700px. Mobile, reduced-motion and no-JS stack the scenes. Delivery stages also follow native scroll on large/tall screens only; all five buttons and the no-JS description list remain available.
- Native dialog close events can be queued during React Strict Mode cleanup. The portal ignores stale close events when its dialog has already reopened; keep this guard.
- `npm run typecheck` and `npm run test` (139 tests, rechecked September 2026) run in the web container. With Chromium installed, `node scripts/verify-presentation.mjs` checks three repeat-scroll visits without replay, native-wheel panels, five delivery buttons, level card hover, links, accordion, theme persistence, menus, 16 extra routes, reduced motion and no-JS. `verify-visual-repairs.mjs` covers native portal open/close/Escape, password toggles, form validation and orbit stability; use DOM readiness rather than network-idle (production background requests can keep the network busy). `verify-finishing.mjs` covers 12 viewports and five DPRs. All are read-only; `APP_URL` and `SCREENSHOT_DIR` are optional.
- Login artwork now uses the original `public/images/client-workspace-master.svg` (resolution-independent) and its optimized 2400×3000 WebP, served responsively by Next Image. Regenerate with the existing Sharp dependency, not by enlarging the old 468×542 image. `accent-surfaces.css` supplies selective semantic colors; do not restore legacy foreground overrides on saturated icon tiles.
- To test production without breaking live reload, copy the app (excluding `.next` and `node_modules`) to a container `/tmp` directory and COPY dependencies there. An out-of-root node_modules symlink fails Turbopack. Explicitly run `NODE_ENV=production npm run build` and `NODE_ENV=production npm run start -- -p 3101`; compose intentionally sets development mode. `measure-finishing.mjs` reports three local lab samples per route/viewport, not field CWV or Lighthouse TBT. See `docs/premium-finishing-audit.md` for limitations and comparison results.
- Wait for newly entered finite animations after scrolling before screenshots; disabling animations before the entry observer fires can capture a mid-reveal frame. Authenticated CMS editing, uploads and successful remote form submissions remain unverified without configured Supabase/staff access.
- Readability adjustments cover tablets at 701–1023px and desktops from 1024px in the homepage CSS modules; wider navigation starts at 1440px. Tablet benefits use two columns; delivery stacks below 851px. They do not change root font-size/zoom, phone columns, or scroll distances. Offer sizing is scoped to `offer-popup.module.css`, not all dialogs. `node scripts/verify-responsive-scale.mjs` checks twelve widths (360–2560px, including 1004×554), header overlap, two-line tablet/desktop hero, card copy sizes, Benefits→Services order, delivery clicks and mobile menu open/Escape. These use a separate local browser when the embedded preview tab is unavailable; they do not prove live-preview visual appearance. Optional offer rendering still needs actual configured offer data.
