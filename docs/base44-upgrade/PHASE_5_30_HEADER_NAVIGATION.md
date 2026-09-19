# Phase 5 — Responsive brand header + navigation

Date: 2026-09-18 UTC. Branch: `system-upgrade`. Starting HEAD: `996e02810a0192a40d02286e190f923c421f1534` (not the automatic completion commit).

## Authorization and outcome

The owner's exact `START NEXT PHASE SAFELY` authorizes Phase 5 after independently accepted Phase 4. **Phase 5 complete at the public-header scope below. STOP before Phase 6.** No template replacement, content reordering or backend work.

## Changes

- Phone masthead now displays the full company name, with wrapping available, rather than switching to the abbreviation. Existing CMS full/short-name props and blank-setting fallbacks remain; the short-name node remains hidden. The compact AJ mark uses existing violet/theme tokens.
- Masthead brand link and project CTA have at least 44px-high targets. CTA can wrap managed text within its allocated width. A phone masthead minimum of 72px replaces 64px; tablet minimum remains 76px and the desktop spacer remains 100px. Existing shared Button, icon, CTA copy and destination remain.
- Desktop navigation labels no longer fade/stagger on entrance. Route links are present and visible in server HTML, independent of decoration; the existing route lamp and reduced-motion behavior remain.
- More, search and desktop portal buttons are disabled in server HTML until React can handle events, using `useSyncExternalStore`'s server/client hydration snapshots. No timer, animation gate, subscription loop or new dependency. Native links remain usable without JavaScript. This prevents the reproduced lost **enabled-looking** first clicks; it does not make dialogs operate before JavaScript loads or eliminate network/hydration time.
- Closing More/search across the 1024px breakpoint restores focus to the visible counterpart instead of the hidden old trigger/body. Existing close/reset/native-dialog paths are retained; the effect captures its trigger nodes for safe cleanup.

Application changes: `MarketingHeader.tsx`, `BottomNavigation.tsx`, `bottom-navigation.module.css` only. Reusable coverage: `phase5-header.test.ts` and `e2e/brand-header.spec.ts`. Existing navigation tests remain unchanged.

## Preserved

Compact, non-wrapping desktop link row, visible desktop company name, all eight default destinations, CMS navigation precedence, Privacy/Disclaimer, direct Services/Projects links, desktop sticky/compact behavior, mobile/tablet bottom dock geometry/order/safe-area treatment, active route state, search semantics, Portal/session/account handlers, auth forms and persistence. No business-action, SQL/schema, data, security, SEO, configuration or dependency changes. No new navigation system or business storage.

The mobile masthead remains non-sticky: adding a second fixed bar would reduce space in short viewports. Phase 6 moving RGB edge is **not implemented**. Home/hero content and ordering are untouched.

## Evidence and results

Durable results: [`evidence/phase5-30/`](evidence/phase5-30/).

| Check | Fresh result |
|---|---|
| Baseline | 460 tests / 53 files passed before edits |
| Final unit/component suite | **464 tests / 54 files passed** |
| Typecheck / lint | **Pass; zero lint warnings** on final source |
| Production build | **Pass** in copied-source/copied-dependency `/tmp/aj-phase5-production`, production NODE_ENV; live dev `.next` untouched |
| Reusable browser suite | **10/10 source-dev/public-proxy and 10/10 isolated-production passed**: four phone/tablet brand/CTA journeys, breakpoint close/focus in both directions, two desktop motion/Portal journeys, three existing Escape/Privacy regressions |
| Independent responsive matrix | **24/24 passed**: 11 widths × actual light/dark selection (dark also reduced motion), plus two no-JS project-link journeys |
| Short windows | **4/4 passed** at 320×568, 919×499, 844×390, 1024×500: menu/Escape/focus, desktop shortcut, real wheel → hero project link → quote form |
| Source-dev health | External Host `/` HTTP 200; source-mounted Next dev remains healthy on port 3000 |
| Integrations | Six optional names still absent in managed env and process; no request/generation or connection |

Matrix widths: 320, 360, 390, 430, 768, 919, 1023, 1024, 1280, 1440, 1920. Height 900 except actual short tablet 919×499. Each enhanced case performs first-enabled menu click without the historical scroll-readiness workaround, close/Escape/focus, actual theme selection, Services active state/Home return and Portal open/close/focus. Mobile checks also navigate More → Privacy. Desktop checks exercise sticky scroll. Final cases contain no captured page/console errors or same-origin failed requests, no injected `bis_size`, and no document overflow. These are independent browser assertions, not editor-iframe verification.

### Visual review

Reviewed a fresh independent 1920×1080 desktop Home capture, plus actual 390×900 light/dark phone and 919×499 light/dark tablet captures. Brand/CTA remain distinct and readable; desktop preserves its one-row links and mobile retains the existing bottom dock. A temporary read-only screenshot viewer showed the independently captured PNGs at their real dimensions; it was removed after review. Scripts and PNGs remain only in `/tmp`, not the app/repository. The captured dev indicator is development chrome, not a new site control.

The fixed dock naturally crosses first-fold content at 919×499; its geometry is unchanged. Real wheel/CTA tests in four short windows confirm content remains reachable, rather than claiming no on-screen overlap anywhere. This phase does not redesign the hero to fit that short editor window.

### Initial failures retained, not erased

- `navigation-initial.json`: 8/10 passed; search at 1024px and mobile More timed out after a pre-hydration click. **Application fix:** server-disabled/hydration-ready control states. Unchanged tests then pass in both source and production. This is not a claim of universally instantaneous Portal/auth/network response.
- `browser-initial.json`: 20/24 passed. Four normal-motion desktop failures were a **harness locator race** during dialog close transition: both Client Login buttons briefly matched. Final harness waits for dialog closure and scopes the trigger to Main. No app fix claimed for this test correction.
- Initial new SSR unit test required a Portal modal mock to avoid importing server-only actions; a second assertion initially mistook the `disabled:` CSS class for a disabled attribute. Corrected to test the actual attributes; final four new tests pass. An intermediate ref-cleanup lint warning was fixed by capturing the search trigger alongside More; final lint is clean.

## Limits / retained gates

Both embedded-preview calls returned **No browser tab available**. Requested live-iframe gesture/runtime/visual checks therefore remain **not automatically verified**; healthy curl is not an iframe pass. Independent browser runtime checks and visual review were used instead, as accepted for Phase 4. No restart/security weakening to work around the tool.

No authenticated account, remote form submission/save/RLS/upload/email, populated custom-CMS navigation, real-device assistive technology/native zoom or production-release sign-off. Deferred credentials, Builder/source/schema/content/legal/approval gates persist. No field CWV/INP, performance speedup or global accessibility certification: no dependency/continuous-loop addition, removed navigation entrance delays, and passing local interactions are the narrower findings.

## Next gate

**Phase 6 — RGB moving-edge primary CTA**, only after the next exact `START NEXT PHASE SAFELY`. Keep the existing backend, routes, Home order, desktop row and mobile dock. No PR, merge, publish or production mutation is authorized by this phase continuation.
