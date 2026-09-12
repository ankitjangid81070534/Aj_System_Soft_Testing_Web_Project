# Regression baseline — Phase 0

Date: 2026-09-12. Source baseline `421447d827a2f5ec60acd2cc05e830b3acbbc92f`. App branch `upgrade-desktop-navbar`.

## Evidence and acceptance boundaries

| Check | Result | Evidence/limits |
|---|---|---|
| Clean starting worktree | PASS | `git status --short` empty before documentation |
| Running cloned source | PASS | Docker web healthy; Next dev on 3000; source bind mount; HTML HTTP 200 |
| TypeScript | PASS | `npm run typecheck`; [output](evidence/checks/typecheck.txt) |
| Repository-wide lint | PASS | `npm run lint`; [output](evidence/checks/lint.txt) |
| Unit tests | PASS | 23 files / 146 tests; [output](evidence/checks/tests.txt) |
| Default production build | PASS | Isolated source and **copied**, not symlinked, dependencies; `NODE_ENV=production npm run build`; [output](evidence/checks/build-default.txt) |
| Optional webpack build | FAIL—existing bundler compatibility issue | Global-only selectors in CSS Modules; [output](evidence/checks/build.txt). Does not invalidate successful default Turbopack production build |
| Production anonymous route/endpoint probes | 67 checked: 60 final HTTP 200, 7 HTTP 404 | [routes.json](evidence/routes.json). Three intentionally nonexistent detail slugs; four compatibility/growth probes listed below. No 5xx, browser page errors or observed horizontal overflow |
| Sitemap service/blog detail coverage | PASS in fallback dataset | 15 service and 3 blog slugs rendered; real CMS project details unavailable |
| Live preview nav | PASS interaction assertions | Real Services click → route/active item; Home click → home route/section. No console/network errors reported |
| Mobile More | PASS local production gesture | 390×844; button opens native dialog and close hides it; dock 362×84 at x14/y744 |
| Screenshots | 11 captured locally | [index](evidence/SCREENSHOTS.md). Admin/portal captures are setup/anonymous states, not authorized dashboards |
| Live preview visual capture | BLOCKED | Screenshot renderer returned a zero-size canvas timeout. Saved local captures are evidence, not a claim of live-preview visual review |
| Integration credentials | ABSENT | Six documented keys checked for presence only, no values printed |
| Real auth/admin/DB/RLS/uploads/email | BLOCKED | No configured Supabase, staff/client test sessions, remote DB or email provider; no bypass attempted |
| Source/config/migrations preserved | REQUIRED final invariant | Only docs/base44-upgrade artifacts and an AGENTS pointer may change |
| Published production | NOT VERIFIED / Base44 app NOT PUBLISHED | Local production smoke is not deployment verification |

## Baseline defect/risk register — do not fix in Phase 0

| ID | Priority | Finding and evidence | Actual verification | Follow-up |
|---|---|---|---|---|
| B01 | Blocker for full backend QA | Supabase URL/anon/service-role absent; Resend/from/admin inbox absent | Runtime presence checks; account/admin setup states | Owner supplies existing project's configuration securely; Phase 1 tests with approved accounts/data. Do not change Supabase project or invent credentials |
| R01 | High, functional | `getHomeSections` defined in `lib/data/sections.ts` has no caller; home renders fixed HomeExperience; builder writes page_sections | Source-confirmed disconnect; live CMS round trip blocked | Phase 1 reproduce/repair only after preserving current accepted composition/content |
| R02 | High, schema | `ai_methods` resource/type/reader exists but no committed CREATE TABLE migration | All 16 migrations indexed; actual remote schema unknown | Phase 1 compare real schema before proposing additive migration; no speculative migration now |
| R03 | High, conditional SEO/routes | Sitemap/growth code constructs `/offers/[slug]`, `/updates/[slug]`; no corresponding page files. `/offers` and `/updates` probes are 404 | Source + local response evidence; current absent CMS produces no such sitemap rows | Phase 1/10 resolve real references/data; no unsolicited pages/content in Phase 0 |
| R04 | High, authorization review | Admin dashboard allows editor via layout, then service-role reads recent quote names/emails without explicit `leads:read`; editor capability list omits leads | Static potential permission mismatch, NOT exploited or reproduced with real sessions | Phase 1 role-matrix test; do not label all admin permissions verified |
| R05 | Medium, SEO | Redirect lookup lives in proxy, whose matcher omits service/project/blog detail routes | Matcher/read path inspected; configured redirect request untested | Phase 1/10 check real changed slugs and redirect coverage |
| R06 | Medium, portability | `next build --webpack` rejects pure-global selectors in reference.module.css and bottom-navigation.module.css | Isolated alternate build fails; default production build passes | Phase 3/17 evaluate safe global-style placement, not a Phase 0 change |
| R07 | Medium, setup/docs | Older docs/admin notice mention migrations ending at 0010/0012, while repository includes 0016; early role default must be superseded before public signup | SQL/history inspected, applied state unknown | Owner confirms complete migration history; do not run destructive or unapproved SQL |
| R08 | Medium, preview/indexing | Sandbox canonical/site URL is localhost; root preview noindex logic is tied to VERCEL_ENV, not every preview host | Local metadata/site config observed | Phase 10 assess preview safeguards and real production domain without changing canonical identity blindly |
| R09 | Medium, runtime/security | Process-local rate limiter is best-effort only; global AdSense executes from root layout including private route shells | Source inspection, no abuse or external integration tests | Phase 13/15 assess production WAF/distributed policy and private-page third-party/privacy needs |
| R10 | Compatibility note | `/portal` and `/profile` exist in proxy protected roots but have no page route; actual portal route is `/account` | 404 probes; no assertion these aliases were supported | Phase 1 verify inbound links/legacy expectations before redirects/new routes |
| R11 | Content availability | Projects, team, reviews and AI resources empty without CMS; public agreement not published | Honest rendered empty/setup notices | Real records/legal text require owner content, never fabricate proof/claims |
| R12 | Measurement limit | Unthrottled loopback lab LCP/CLS/TTFB cannot represent mobile field performance, real Supabase latency or INP | 12 samples documented | Phase 13 collect realistic lab traces and field data if available |

## Do-not-break list

- All current route slugs, accepted content, real business identity and honest missing-data behavior.
- Compact desktop single-row navbar; full brand at left; eight visible labels clustered centrally; desktop More absent. Existing mobile/tablet bottom dock and More behavior unchanged.
- Instant Link navigation, active indicator, native dialogs, search/shortcuts, keyboard focus restoration, theme preference and reduced-motion support.
- Reveal-once content remains visible; no flicker/re-arm on exit; no scroll hijacking or decorative heavy WebGL.
- Supabase project, data, RLS, role/capability boundaries, service-role server-only isolation and client ownership.
- Login, Google OAuth, signup/recovery, client portal, private uploads, agreements, CMS CRUD and cache/public sync. Blocked paths are not assumed safe merely because public pages render.
- Canonicals/metadata/schema/robots/sitemap/RSS, noindex private pages, self-hosted fonts and production headers.
- No fake clients/reviews/outcomes/rankings; no business database in localStorage; no bulk SEO pages or keyword stuffing.

## Baseline test methods and handoff

Local browser checks ran against an **isolated Next production server** on container loopback port 3100, copied from the baseline source; the user's dev server remained on 3000. No cookies were imported and no security control was bypassed. Screenshots used reduced motion for stable capture; performance runs used normal motion. No external account was created and no form/save/delete action wrote a record.

The first temporary default-build attempt used an out-of-root node_modules symlink and was rejected by Turbopack. That was an **audit isolation mistake**, not an app defect: replacing it with a real dependency copy yielded the passing default build. Production output never overwrote live `.next`.

Unit tests and rendering do not validate DB persistence. In Phase 1, use approved reversible test records and assert UI → handler → DB → reload → public result; include owner/client/editor/admin/super-admin denial cases and cache revalidation. Destructive cases need explicit safe scope.
