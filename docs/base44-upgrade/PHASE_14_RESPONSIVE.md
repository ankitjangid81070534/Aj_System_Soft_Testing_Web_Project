# Phase 14 — Responsive / all screen sizes

Date: 2026-09-13. Starting HEAD: `6295e278c7e82bf21dada7d51f30bd7c006d700f`.
Owner authorization: **“Phase 14 safly”**. Existing navbar exclusion remains in force.

## Outcome and scope

**Scoped responsive fixes and anonymous browser audit complete; full visual/device/private-surface sign-off remains deferred. STOP before Phase 15.**

Only two presentation changes were needed:

1. **Privacy policy:** at 320px, the Google partner-sites URL made its paragraph 323px wide inside a 288px content box. Allow wrapping within policy sections instead of hiding the overflow. All legal wording, URLs, dates, metadata and destinations remain unchanged.
2. **Public account-card preview:** at the 1024px two-column breakpoint, workspace status labels exceeded their available width. Reduce illustration inset and tile padding below `xl`, retain the existing wider-screen spacing, and allow emergency wrapping inside shrinkable tiles. No form, session, recovery or account behavior changed.

Added two discovered Vitest presentation-contract tests in `responsive-layout.test.ts`; these guard markup, not browser geometry. No new interaction or refactor was necessary.

**Unchanged:** navbar/header/dock and links; homepage motion/layout; auth/actions/RLS; lead submission/validation/consent; content and SEO; CMS/database/schema; dependencies/config/compose/secrets; AdSense; research corpus. No remote application writes, authentication bypass, fabricated records, successful form submissions, deployment, merge or direct main edit.

## Responsive matrix

Independent Chromium ran the cloned live development source across **38 anonymous routes × 20 configurations = 760 cases**. Routes are the 32 existing mapped public pages plus login, signup, forgot-password, reset-password, update-password and admin login. Recovery/admin-login pages are anonymous states, not authenticated verification.

| Coverage | CSS viewport |
| --- | --- |
| Small phones | 320×568, 360×800, 390×844, 400×818, 430×932 |
| Tablets/current preview | 768×1024, **769×1024**, 820×1180, 1024×768 |
| Desktop | 1280×720, 1366×768, 1440×900, 1536×864, 1600×900, 1920×1080, 2560×1440 |
| Landscape | 844×390 phone, 1180×820 tablet |
| Scaling reflow equivalents | 1024×576 at DPR 1.25; 853×480 at DPR 1.5, representing reduced CSS space on a 1280×720 desktop |

**Important:** DPR plus a reduced viewport is a reflow simulation, **not native browser 125%/150% zoom or OS scaling**. Native zoom, real device keyboards, safe-area/browser-chrome behavior and Safari/Firefox still need release checks.

Every route returned HTTP 200 with a heading; no page-wide horizontal overflow or uncaught page errors were measured. Existing images in the scanned public main content were loaded in all 20 applicable cases. No tables or populated CMS galleries/projects existed in these anonymous results; do not extrapolate to real records.

### Raw scan findings, not hidden failures

- Before: policy URL overflow at 320px; workspace-label overflow on four account-card routes at 1024px. Both are absent after the edits, including isolated production measurements.
- Offscreen homepage storytelling scenes are intentionally translated inside a clipped stage. They are retained in raw evidence, not silently erased. Four real wheel-gesture checks reach the final scene and assert its final link fits; short screens/reduced motion render stacked scenes.
- Three Team navigation scans report `scrollWidth=46` versus `clientWidth=43`. Supplemental text-range measurements show the visible 31px label entirely inside the anchor; the decorative active indicator uses visible overflow. **Not a text-clipping defect; no navbar edit.**
- The full matrix recorded 38 Google CSP-report requests blocked by the browser's ORB protection and 24 ordinary AdSense POST pings. All 62 writes target Google advertising/reporting hosts, not application/CMS endpoints. Ads/security policies were not disabled to make checks green.

## Real interaction checks

**59 passing independent Chromium checks**, with actual tap/click/fill/select/wheel gestures and assertions:

- Menu opens and stays inside viewport: 7.
- Login modal opens/fits, accepts an unsent email value, and closes with no dialogs left open: 21.
- Contact fields accept input and consent toggles on/off, without submission: 7.
- Quote select/requirements fields retain chosen/typed values, without submission: 7.
- FAQ opens, exposes its answer, then closes: 7.
- Desktop navigation search filters to Team and clears: 2.
- Horizontal story reaches its final scene through wheel input: 4.
- Short-screen stacked story: 3; reduced-motion stacked story: 1.

Seven interaction sizes: 320×568, 390×844, 769×1024, 820×1180, 1024×768, 844×390 and 1440×900. Additional real footer → Privacy clicks pass through both localhost and the public preview proxy, with no captured console/page errors. These are **independent browser checks, not the user's iframe**.

## Quality and production checks

- **405 tests / 49 files**, TypeScript, ESLint and whitespace checks pass.
- Isolated production build passes with copied source **and copied dependencies** in `/tmp/phase14-build`; never replaces the live `.next` dev output. An initial out-of-root dependency symlink was rejected by the build tool; copying dependencies corrected only the temporary build harness.
- Production `/privacy` at 320×568 and `/signup` at 1024×768: HTTP 200, relevant text fits, preview noindex remains present, no console errors.
- Development service remains healthy, source-mounted and live-reloading on port 3000. Fresh service errors were not observed after verification.

## User-preview and remaining gates

The initial 769px homepage screenshot was visually reviewed. After edits, the live preview tab repeatedly became unavailable; one footer-click attempt reported performed but never reached Privacy, and its retry had no tab. Its buffered console included an AdSense script-load failure and a truncated hydration-attribute warning; inspection could not recover the warning detail before the tab disappeared. Independent fresh localhost and public-proxy navigation/console checks pass, but this does **not** resolve or visually approve the user's iframe state.

**Post-change visual review and user-iframe interactions are NOT verified.** Do not claim all-device or production readiness. Still deferred: native browser zoom/OS scaling, physical-device touch/keyboard review, authenticated portal/admin tables and dialogs, populated CMS cards/images/filters, inactive offer modal, remote persistence, and earlier Phase 1/8/9 private gates. No credentials were created or requested to bypass the owner's earlier deferrals.

## Evidence

- `evidence/phase14-before-layout.json`: 152 baseline boundary-size route scans.
- `evidence/phase14-after-layout.json`: all 760 post-edit scans, including raw intentional-animation/decorative overflow and external requests.
- `evidence/phase14-interactions.json`: 59 independent interaction assertions.
- `evidence/phase14-final.json`: production geometry, Team label/indicator diagnosis and local/public-proxy footer navigation.
- `evidence/phase14-verification.json`: checks, scope limits and source-preservation metadata.

One-off runners, logs and temporary builds stay in `/tmp`; no data-population scripts added. Use the standing managed PR workflow. **STOP before Phase 15 — Accessibility + Security + Trust — until the owner authorizes continuation.** Navbar changes, production publishing, remote mutations and merges require separate authorization.
