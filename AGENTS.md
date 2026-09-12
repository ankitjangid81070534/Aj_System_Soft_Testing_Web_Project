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
- Readability adjustments cover tablets at 701–1023px and desktops from 1024px in the homepage CSS modules. Tablet benefits use two columns; delivery stacks below 851px. They do not change root font-size/zoom, phone columns, or scroll distances. Offer sizing is scoped to `offer-popup.module.css`, not all dialogs. Optional offer rendering still needs actual configured offer data.

## Bottom navigation (September 2026)
- `MarketingHeader` retains the existing session/portal logic. `BottomNavigation` owns the fixed dock and native More dialog; the old `MobileMenu` is no longer mounted. Below 1024px the original bottom dock and non-sticky brand masthead remain; from 1024px the masthead becomes a hidden layout spacer and the same navigation becomes a top floating white/soft-glow dock with warm orange accents (including in dark page themes, per the latest user request). Desktop More/search surfaces share that white palette; mobile/tablet colors and all geometry remain unchanged. Older presentation scripts expecting `.glass-strong`, `Open navigation menu`, `#mobile-menu`, or a 1440px desktop-nav breakpoint are stale for navigation assertions.
- Desktop navigation stays 24px from the top, compacts after 48px of scroll and respects reduced motion. `data-bottom-navigation` / `data-scrolled` are stable test targets. Desktop More uses a three-column panel; search filters only supplied CMS page labels (not site content). The search button and Ctrl/Cmd+K open the same native dialog with input focus; text-entry controls and other open dialogs keep their shortcuts. Escape, backdrop and close restore focus; crossing 1024px closes/reset searches to avoid hidden input focus. Services/Projects retain direct navigation rather than being repurposed as flyout triggers.
- Desktop-upgrade verification: local Chromium passed bounds and menu checks at 320, 393, 768, 1024, 1280, 1440, 1920, 2560 and short 1100×500, plus actual search/result-link clicks, both keyboard shortcuts, empty state, compact scroll, resize reset, theme persistence/restoration, login popup/Escape, mobile About/active state, CTA hover/navigation and backdrop/focus restoration. Browser runtime errors and failed source modules were empty. The original desktop upgrade had no available live preview tab. After the white-palette revision, the navbar was visually confirmed in the live 1214px preview; menu open/close and clean runtime checks also passed. The separate menu screenshot was blocked when the preview became hidden, so that panel has computed-style/interaction checks only. The nine local responsive checks were rerun successfully; pre-desktop CSS was verified byte-for-byte unchanged.
- `splitNavigation` preserves CMS labels/URLs: prefer Home, Services, Projects and Contact when supplied, fill available primary slots from configured links, and keep every remaining link in More. No new destination is invented. Footer padding and bottom scroll padding reserve space for the fixed dock; safe-area and short-landscape layouts are supported.
- Verified: 142 unit tests, typecheck and targeted ESLint; live preview More open/close, Projects/About navigation and active states, theme persistence and restoration, login popup open/close, and mobile dock/menu screenshots. A temporary Playwright check also passed at 320, 393, 768, 1280, 1920 and landscape 844px: bounds, repeated open/close, Escape, native modal keyboard containment (browser chrome remains reachable), focus restoration, backdrop dismissal, scroll stability and footer clearance. All seven existing public navigation destinations and the quote CTA passed real clicks.
- The pre-existing `/ai-methods` 404 is now repaired by a public page using the shared layout and the existing CMS `ai_methods` resource. Its anonymous loader requests only active records, ordered by `sort_order`, validates HTTPS links and uses the existing `ai-methods` cache tag. Without configured Supabase/resources it renders an honest empty state, not fabricated records. The repository currently has CMS types/config but no `ai_methods` table migration; real CMS data and outbound resource clicks remain unverified without a configured backing table.
- Repair verification: 146 unit tests, typecheck and targeted ESLint passed. A focused local browser test passed Services → More → AI Methods, HTTP 200, empty state, active navigation, Escape and focus restoration with no runtime errors. Live preview tools were unavailable/unrendered this turn, so no live-preview visual verification is claimed. The earlier `Cannot read properties of null (reading 'open')` log came from an obsolete temporary Playwright assertion during navigation, not shipped app code; temporary checks now guard absent dialogs and wait for the route to mount. Successful authenticated login/account operations remain unverified without Supabase credentials.

### Desktop tubelight integration
- `website/src/components/ui/tubelight-navbar.tsx` adapts the supplied component to the site's existing 1024px desktop breakpoint and white/orange palette. `BottomNavigation` passes the original CMS items through `renderItem`, preserving More's native button/ref, search, portal and CTA. Route-derived selection survives reload/back and overflow routes; the lamp is hidden below 1024px, shared-layout IDs are instance-scoped, and reduced motion disables its spring.
- The correct shadcn-style location is `website/src/components/ui`, resolved by `@/components/ui`; do not create a duplicate repository-root components directory. `website/components.json` records this structure and `src/app/globals.css` (Tailwind v4, already installed); `src/lib/utils.ts` re-exports the existing cn utility rather than changing global class-merging behavior. Only framer-motion was added; Lucide and TypeScript were already installed. No image assets are needed. The unmounted `tubelight-navbar-demo.tsx` uses real site routes.
- Verification: typecheck, targeted ESLint and 146 tests passed. Nine local responsive/menu/search checks passed; focused local real-click checks confirmed the moving lamp, Services/Projects/Contact navigation, back/reload, More → About, mobile-hidden lamp and both motion preferences. The white Home navbar and tubelight were visually seen in the live desktop screenshot. Live gesture assertions could not be completed reliably: navigation helpers reported stale content and the later iframe became unavailable; local browser results must not be described as live-preview interaction verification.
