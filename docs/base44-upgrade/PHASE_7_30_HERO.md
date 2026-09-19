# Phase 7 — Hero + above-the-fold conversion

Date: 2026-09-19 UTC. Branch: `system-upgrade`. Starting HEAD: `9354b3dccf248dc3c5feece7c4492da081fa6d8f` (Phase 6 implementation, not this phase's completion commit).

## Recovery and scope

The preceding exact continuation began Phase 7 but left three modified hero files and an untracked browser test; Phase 6/7 reports and current status were not saved. This continuation **finishes Phase 7**, rather than skipping an unfinished checkpoint or rebuilding Phase 6. Phase 6 source and historical evidence were recovered separately in [its report](PHASE_6_30_PROJECT_EDGE.md). Old 0–17 reports do not control this 0–29 program.

**Complete at public-hero scope. STOP before Phase 8.** No backend, auth, data, navigation, SEO, config, dependency or unrelated-section changes. Existing backend/content/legal/release gates are not waived.

## Changes

- Kept the requirement-led H1, existing capability description, delivery promises and all three native destinations. Replaced unverified “available for new projects” with factual “software development.”
- Hero copy no longer has its entrance transform or stagger hooks: server-rendered heading, description and actions remain immediately visible. Decorative motion remains separate.
- Added “Tell us your goals, platforms and key features.” and associated it with the primary CTA through `aria-describedby`; this describes the existing quote form, not a new wizard or response-time promise.
- Added fine borders to existing capability labels, not a duplicate service catalogue.
- Short tablets (701–1023px wide, <=600px high) use tighter hero-only spacing and type. At 919×499 the primary CTA now clears the unchanged fixed dock by more than 12px. Historical baseline overlapped it.
- Independent visual review caught desktop orbit artwork crossing capability labels and the services link. A desktop-only reserved decorative area below the copy fixes this; mobile/tablet decoration and navigation are untouched. New browser assertions cover the copy/artwork separation at 1024 and 1440px in both motion preferences.
- Expanded `e2e/home-hero.spec.ts` to 320×568, 390×844, 662×580, 919×499, 1024×768 and 1440×900 plus no-JS. Reused the existing server component/CSS module; no new client state or animation runtime.

## Verification

Final source:
- **469 unit tests / 55 files**, typecheck, lint, whitespace review: PASS.
- Isolated production build at `/tmp/aj-phase7-final`, explicit production mode: PASS. Live source-mounted Next dev on port 3000 remains healthy and hot-reloading.
- **33/33 source-dev public-proxy browser tests + 33/33 final production browser tests**: PASS. Includes 13 hero cases, 10 existing navigation/header cases and 10 project-edge cases. No skipped/flaky cases.
- **14/14 independent production layout/theme/CTA cases**, 320/390/662/919/1024/1440/1920 widths in light and dark: PASS. All hero links >=44px, no document overflow, heading opacity 1, copy animation none, dialogs closed, real primary clicks reach the quote form. No final console/page errors or failed non-cancelled same-origin requests. Eighteen cancelled RSC prefetch requests are explicitly retained, not hidden failures.
- Independent image review: 390px phone, 662px current-preview size, 919px short tablet, and 1440px desktop, light/dark. Initial desktop decoration collision was edited and the final desktop images reviewed again; final screenshots are not iframe captures. Temporary PNGs/viewer stay outside Git and the viewer is removed.
- Earlier production matrix: 10/10 layout/CTA outcomes passed, but only 8/10 strict all-console-clean assertions passed; two contexts logged Google's external report-only frame-ancestors diagnostic. Retained as initial evidence; no app/CSP/ads fix claimed. Final 14 cases did not reproduce it.

### Interaction ledger

| Interaction | Result |
|---|---|
| Hero Start Your Project → quote form | PASS in live iframe and independent source/production real clicks |
| Explore Projects → project heading | PASS independent source/production; iframe first assertion raced the old H1, one corrected retry timed out, so iframe result UNVERIFIED |
| Explore what we build → services anchor | PASS live iframe (hash and section at y=20) and independent source/production |
| Hero CTA without JavaScript | PASS isolated browser context, native link reaches quote form |
| Reduced-motion hero/native links | PASS at all six browser-test widths |
| Header/menu/project-edge regression | PASS 20 reusable cases on each final runtime |

Latest iframe passive check after the CSS repair: empty error and failed-request buffers, no overlay, mounted main with two children, path `/`. Iframe screenshot failed `iframe_hidden`, so **no live-iframe visual sign-off**. Independent review is the visual acceptance method, not a repair of the editor/browser. No new submission/save interaction was introduced or tested.

## Limits and stop gate

This is not measured LCP/CLS/INP improvement, native-device/zoom certification, authenticated Portal validation, hosted CRUD/RLS/email verification or deployment. Very short/mobile windows still scroll; the fixed dock can cross lower non-primary hero content in the first fold. Actual service-anchor and CTA reachability pass; the entire hero is not promised to fit every viewport.

All six optional integration values remain absent. No new provider, secret, database, SQL, business record or browser-local persistence. Existing ownership/support copy is preserved, not newly legally certified. Current Home order is unchanged; no material movement ledger was enacted.

Evidence: `evidence/phase7-30/`. Final commit is recorded by the platform at turn end; do not fabricate a completion hash or manually commit/push. Next exact `START NEXT PHASE SAFELY` authorizes **Phase 8 — Services / Capability Discovery**. No PR, merge or release in this turn.
