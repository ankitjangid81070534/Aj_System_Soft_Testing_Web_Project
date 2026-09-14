# Phase 16 — Full system regression: partial verification, release blocked

Date: 2026-09-13 UTC / 2026-09-14 Asia/Calcutta. Authorized command: **START NEXT PHASE SAFELY**. Starting clean HEAD: `6f2aca0c14b12159bd4a10c751cdff1ffc63235c` on `system-upgrade-phase`.

**Phase 16 is NOT fully complete.** Available anonymous/local verification has been performed and one demonstrated keyboard bug fixed. Credentials, real authenticated sessions, populated CMS data and visual/manual approval remain unavailable. Do not substitute source/unit checks for hosted behavior, or start Phase 17/release automatically.

## Demonstrated defect and minimal repair

**F16-01 — first Escape does not close populated navigation search (medium, FIXED).** With `privacy` entered in the desktop native search input, the first Escape cleared the input but left More open and focus inside it. Reproduced at 1024px and 1440px on the original source. The new durable browser tests also failed specifically at the expected closed-dialog assertion on the pre-fix production build; their mobile control passed.

Added an eight-line key handler to the existing search input: for non-composing Escape, prevent native search clearing and invoke the existing `closeMenu`. Query reset, body-scroll restoration and return focus remain in the existing paths. IME composition is not intercepted. No navigation layout, labels, routes, auth, search matching, state architecture or business operation was changed.

`website/e2e/navigation.spec.ts` adds three reusable browser tests: populated-search Escape/focus/reset at 1024 and 1440px, and mobile More → Privacy navigation/close. All three pass against both live development and the final isolated production build. No new application dependency or package script was needed.

Run against an already-running server, without adding test artifacts to the repo:

```sh
docker compose -f docker-compose.base44.yml exec -T web sh -c \
  'npx playwright test e2e/navigation.spec.ts --workers=1 --reporter=line --output=/tmp/navigation-e2e'
```

Set `PLAYWRIGHT_BASE_URL` when testing a different local production port. These tests neither provision nor mutate business data.

## Fresh verification matrix

| Area | Actual coverage | Outcome / limit |
|---|---|---|
| Source quality | Full existing unit suite, TypeScript, lint, whitespace | **415 tests / 51 files PASS**, typecheck/lint pass. Separate browser tests: **3 PASS**. |
| Build/edit loop | Fresh initial and final isolated production builds, copied dependencies, production NODE_ENV; live source-mounted dev retained | PASS. Localhost:3000 HTTP 200. No replacement of live `.next`, dependency changes or service/config edits. |
| Public routes/responsive | 38 anonymous routes × 20 configurations, including all 15 service and 3 article details, legal/auth pages, portrait/landscape and explicitly simulated reflow | **760 cases PASS**: HTTP 200, heading/main, no page-wide overflow, missing-alt attribute or broken completed visible image; zero uncaught page errors or failed local requests. This full scan preceded the keyboard-only fix; final candidate was then retested via the following interaction/endpoint checks. |
| Navigation/CTAs/content | Three widths: 390/919/1440. All default destinations plus legal links, More, search/no-results, theme storage, Escape/focus, service cards, FAQ open/close, service quote CTA, blog card/contents anchor, homepage quote CTA | Included in **86 final production gesture assertions, all PASS**. This is the rendered fallback dataset, not every possible CMS record. |
| Forms | Empty contact, consultation, quote, login, signup and recovery submits; password reveal/hide | Required fields block requests; password value retained while visibility toggles. Native invalid submits produced no POST. Successful signup/login/lead persistence are NOT verified. |
| Safe server-action failure paths | Real Google readiness click, recovery submit and contact submit with temporary `.invalid` fixture | Expected unconfigured feedback and successful transport responses, not success messages for unavailable integrations. Exactly three application POSTs recorded; these are rejected/readiness actions, **not persisted business writes**. No email/account/lead created. |
| Admin/account routes | 48 static/resource route probes including all 17 generic resource keys | Expected anonymous redirect/setup/denial states and noindex verified. `/ajadmin/users` redirects in the browser; `/ajadmin/leads` shows its existing session-expired denial. Not authenticated menu/CRUD verification. |
| Route handlers | All three committed `route.ts` handlers inventoried; 15 endpoint/negative probes | Missing-token/code callback/confirmation paths return expected login/recovery redirects; RSS returns 3 existing articles; sitemap has 32 public URLs; robots disallows preview crawling. Unknown slugs/pages return 404. No 5xx in these probes. Valid-token/provider behavior remains blocked. |
| SEO/internal links | 32 public marketing/content routes plus 6 noindex auth/admin surfaces; rendered JSON-LD parsed; 35 unique internal links fetched | Public canonicals path-correct, titles/descriptions present, JSON-LD parseable; private pages noindex; **35 links have no HTTP 4xx/5xx**. No private/unsupported offer/update sitemap URLs. Canonical origin intentionally remains the existing local configuration, not a fabricated published URL. |
| Security contracts | Existing auth/permission/redirect/header tests, production response headers and fresh production dependency advisory audit | Existing protections preserved; **zero reported production dependency advisories**. Not a penetration test, real RLS test or provider-configuration verification. |
| Performance | Final production homepage, service listing, article, contact and login at 390/919/1440: 15 bounded unthrottled samples | Zero observed CLS/page overflow in this short observation. **390px login produced no LCP entry**; do not interpret it as 0ms. Other samples are local diagnostics, not field CWV/INP, mobile-device performance or a speedup guarantee. |
| Live owner iframe | More open performed and visible; final runtime/cleanup inspection returned Home, zero open dialogs, nonempty main/root, no overlay/failed requests | PASS for those limited observations. Legal-link interaction calls timed out; **live legal-navigation re-verification is NOT claimed this phase**, despite independent browser passes. Only the two historical pre-edit console errors remain buffered. |
| Visual/manual | Requested 919px post-change menu screenshot | **BLOCKED: `iframe_hidden`**. Native zoom, physical devices, non-Chromium, screen-reader speech/complete contrast and populated private tables are NOT signed off. |

## Coverage inventory and explicit exclusions

`evidence/phase16-inventory.json` records **39 page patterns, 17 generic admin resources, three route handlers and 39 exported server actions**. This is an inventory, not 39 successful hosted action tests.

| Server-action family | Count | Available evidence | Still required |
|---|---:|---|---|
| Generic admin CRUD/quick actions | 6 | Existing action/authorization/ordering/result unit tests with mocked adapters | Real saves, activate/publish/deactivate/delete/reorder, failure handling, cache/public sync and concurrent access |
| Agreements | 5 | Source inventory; shared guards/types compile | Authorized version create/activate/archive/PDF and persistence |
| Home Builder | 5 | Existing publication/authorization contracts | Real saved sections, visibility/reordering and public composition sync |
| Media | 2 | Source/validation contracts | Real upload/delete/storage authorization and failure compensation |
| Settings | 1 | Source/permission/cache contracts | Real save and public delivery |
| Users/roles | 4 | Source and permission/validation contracts | Approved staff accounts, role boundaries, resets and hosted RLS |
| Staff auth | 2 | Source/permission/validation contracts, anonymous login surface | Real login/session/logout |
| Public leads | 3 | Empty-form validation; contact unconfigured rejection | Contact/quote/consultation writes, agreement acceptance, attachment upload and email delivery |
| Lead admin | 1 | Source/capability contracts; anonymous denial | Authorized inbox filters/update/persistence |
| Portal | 10 | Existing validation tests; Google readiness/recovery failures; public form controls | Signup/Google exchange/login/recovery session/profile/avatar/review/logout/private ownership |

Project facets, real project cards/media, populated CMS categories/pagination, authenticated admin menus and client records are absent, not fabricated. Existing production secret names were checked in the managed file and service process **by presence only**: all six documented Supabase/email entries remain absent. The prior credential refusal/deferment is respected; no placeholder credentials, new project, fake account or security bypass was introduced.

## Final defects and release gates

| ID | Severity | Status | Finding / required action |
|---|---|---|---|
| F16-01 | Medium | **FIXED; browser regression tests pass** | Populated search consumes first Escape. Minimal handler described above. |
| B01 / F16-02 | Release blocker | **BLOCKED** | Real Supabase/email configuration and approved staff/client sessions unavailable. Complete hosted auth, CRUD, uploads, RLS, integration and public-sync checks before full system sign-off. |
| R01 | High, existing functional risk | **OPEN; source-confirmed** | Public HomeExperience still does not call `getHomeSections`; builder writes cannot be assumed to drive accepted public composition. Inspect actual saved sections and agree the integration before changing layout/content. |
| R02 | High, existing schema risk | **OPEN; remote state unknown** | No committed `CREATE TABLE ai_methods` migration found. Compare existing hosted schema/migration history before proposing any additive SQL; no speculative migration applied. |
| F16-03 | Release/manual gate | **BLOCKED** | Post-change screenshots unavailable; native-device, screen-reader and complete manual visual checks outstanding. Open preview for visual review. |
| F16-04 | Diagnostic gap | **OPEN** | Older truncated iframe hydration/AdSense console entries remain unexplained; no new entries in final check. Navigation helper calls time out when preview is hidden; do not call this an application fix. |
| F16-05 | Performance verification gap | **OPEN** | One absent LCP sample; real-device/field CWV/INP and populated-template performance not measured. No blanket performance certification. |
| R06 | Existing portability risk | **RETAINED, not retested here** | Optional webpack/CSS compatibility is historical; default production build passes. Do not claim an alternate-bundler fix. |
| R07 | Setup/release risk | **OPEN** | Older setup copy references earlier migration endpoints; full 0016-era hosted migration application must be confirmed before signup/admin use. |
| Phase 15 operational gates | Owner confirmation | **OPEN** | Existing retention, regional consent and hosted logging promises, distributed rate limits and deployed OAuth/domain allowlists require real operational confirmation. |
| R03 / R04 / R05 / R08 | Previously repaired at stated scope | **PRESERVED, not blanket remote passes** | Unsupported offer/update URLs removed in Phase 10; dashboard/redirect regression contracts remain; preview noindex/disallow-all confirmed. Hosted publication, redirects and real-domain indexing still need deployment tests. |

## Harness corrections — not application fixes

- Global `networkidle` waited on third-party activity and stalled a repeat service navigation. Gesture setup now uses concrete heading/font readiness and bounded action waits; ads/CSP/network routes were not blocked or modified.
- The first development E2E invocation used a different loopback origin and raced readiness before reaching assertions. Tests now use localhost/default or explicit production base URL and font readiness. The subsequent production pre-fix run demonstrated **two actual Escape assertion failures and one passing mobile control**; the final dev/production runs each pass all three.
- Endpoint harness initially used Playwright's `status()` shape on a Fetch response; corrected only the temporary script to use `.status`.
- The generic heading assertion incorrectly treated the existing anonymous leads denial as a content page. It now explicitly asserts the exact denial rather than pretending an authorized inbox rendered.
- Canonical equality belongs to public content, not deliberately noindex auth pages with no canonical. Initial results are retained; final SEO assessment separates 32 public pages from six private/auth surfaces. No SEO source was changed.

## Evidence and stop boundary

Evidence: `phase16-routes.json`, `phase16-gestures.json`, `phase16-gestures-before-fix.json`, `phase16-escape.json`, `phase16-endpoints.json`, `phase16-endpoints-initial.json`, `phase16-seo-perf.json`, `phase16-seo-perf-initial.json`, `phase16-inventory.json`, `phase16-npm-audit.json`, `phase16-checkpoint.json` under `evidence/`. Temporary runners, build copies, browser error contexts and logs remain in `/tmp`; only the reusable focused regression test is added to the app repository.

Auth/API/data/schema/RLS, business copy, legal dates, SEO, AdSense/CSP, dependency files, 5,000-query corpus, compose and secrets are unchanged. No remote business-data mutation, manual commit/push, branch switch/deletion, merge or deployment.

**STOP: Phase 16 remains PARTIALLY VERIFIED / BLOCKED for full sign-off. Last fully scoped completed phase remains 15. Phase 17 is NOT started; Base44 app is NOT published.** A progress/fix PR must not be described as release approval.
