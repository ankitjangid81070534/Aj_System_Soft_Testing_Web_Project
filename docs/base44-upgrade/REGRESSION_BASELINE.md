# Regression baseline — 30-phase Phase 0

2026-09-16; clean starting branch `initial-setup`, baseline `b566a40deb4f3e68fc0cbdfc82a534025aeaff73`. Earlier baseline preserved in [archive](archive-pre-30-phase/REGRESSION_BASELINE.md).

| Check | Fresh result | Limits/evidence |
|---|---|---|
| Existing Base44 compose | PASS: healthy live source dev, HTTP 200 under external Host | Compose/environment manifest reused unchanged; dev origin derived from environment |
| Unit tests | PASS: 415 / 51 files | [log](evidence/phase0-30/tests.txt); mocked adapters are not hosted saves |
| Typecheck / lint | PASS | [typecheck](evidence/phase0-30/typecheck.txt), [lint](evidence/phase0-30/lint.txt) |
| Production build | PASS: default Next build | Isolated `/tmp/aj-phase0-production`, copied dependencies, explicit production mode; live `.next` untouched |
| Existing browser regression | PASS: 3 tests | [log](evidence/phase0-30/e2e.txt); desktop populated search/Escape/focus/reset at 1024/1440; mobile More→Privacy→closed |
| Anonymous route renders | PASS: 65 HTTP 200, no observed page errors | [raw evidence](evidence/phase0-30/browser.json); some are redirected/setup screens, not dashboards |
| Screenshots/geometry | Captured local 390×844, 919×499, 1440×900; no page-wide overflow in capture states | Reduced-motion stable captures; not all-page/device visual certification |
| User preview | Home/root render observed; mobile and tablet images reviewed | Requested first desktop capture actually showed 919px; live menu postcondition inconclusive, final call had no tab; NOT a passing iframe interaction |
| Runtime warning | Existing AdSense script-load failure observed in user preview | No source error overlay; not concealed/fixed; independent pageerror listeners do not measure all console failures |
| Performance | Nine unthrottled local samples | Not field CWV/INP or standardized TBT; see PERFORMANCE_BASELINE |
| Existing keyword research | PASS count/normalized uniqueness: 5000 | Existing corpus unchanged, not re-researched or keyword-demand validated |
| Owner production reference | Read-only HTTP 200 and canonical/index directives | Not this branch deployed; no production actions performed |
| Hosted auth/admin/DB/storage/email | BLOCKED / NOT VERIFIED | Six optional integration names absent; owner deferral respected |

## Do-not-break list

1. Accepted public text, routes/slugs, brand and honest empty states; no fabricated clients/reviews/prices/timelines.
2. Supabase source of truth, existing records, auth/cookies, role/capability checks, ownership/RLS and server-only privileged keys.
3. Public forms, consent/agreement semantics, truthful failure versus persistence/email success, attachments and cache/public sync.
4. Desktop one-row navbar with visible brand/eight central links, legal links/search/login/project CTA; exactly one mobile/tablet bottom dock.
5. Actual navigation/search/Escape/focus/active route/theme behavior; no motion-dependent controls.
6. Reveal-once/reduced-motion/no-JS visibility and native scrolling; no hidden-again content or new heavy background loops.
7. Metadata/canonical/JSON-LD/robots/sitemap/RSS; private and preview noindex; self-hosted fonts/security headers.
8. Existing 5,000-query corpus stays research-only. No new browser business database, new backend, speculative SQL, fake AI or automatic deployment.

No application interaction was implemented in Phase 0. Existing independent interactions above pass; final live-iframe interaction is explicitly unverified. Phase 1 must verify each permitted write through reload/public result using approved real sessions/data. No business write, account creation, migration, seed, remote mutation, manual commit/push, merge or branch switch occurred.
