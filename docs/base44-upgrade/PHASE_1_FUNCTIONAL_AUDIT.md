# Phase 1 — functional/backend audit progress

Date: 2026-09-12. Starting commit: `5e5a85a4a70e09baf078adf32811394644d4e22d`; branch `upgrade-desktop-navbar`.
**Status: local audit and confirmed fixes implemented; full Phase 1 remains INCOMPLETE / BLOCKED. Phase 2 is NOT started.**

The owner declined all Supabase/Resend secret setup. No retry, placeholder generation, project switch, auth bypass, migration, real DB write, email delivery or deployment was performed. Test adapters below are isolated unit mocks, not replacement app data and not configured credentials.

## Confirmed fixes and verification levels

| Finding | Minimal fix | Verification | Still unverified |
|---|---|---|---|
| Dashboard service-role lead read bypassed the editor capability boundary | Check content access before dashboard queries; gate lead query, panel and inbox CTA on leads:read | Actual dashboard server component tested with mocked session/query adapters: guest/client no privileged query, editor no quote query or lead data/controls, admin/super-admin retain access | Real staff sessions and hosted DB/RLS |
| Failed dashboard quote query appeared as an empty inbox | Explicit error message instead of No quote requests yet | Server-render assertion for adapter error | Real outage rendering |
| Generic Save could publish/unpublish without content:publish even though the dedicated status action was gated | Enforce publication permission on create/changed status; omit protected status from editor updates to avoid overwriting concurrent publisher changes | Actual Save action regression tests: denied transitions, allowed draft creation/unchanged-status content edits, preserved admin/super-admin create and update publication, no-row writes not success | Real CMS form→DB→reload→public sync |
| Home Builder status action and Save had the same publication bypass | Require content:publish for status action; compare stored state before Save; omit status from editor update payload | Actual builder action regression tests, editor denials and legitimate admin/editor content paths | Real builder CMS writes and public rendering |
| Slug redirects did not run on service/project/blog URLs | Add those three route families to proxy matcher; return public content without an additional Auth round trip | Framework's matcher + real NextRequest/NextResponse with mocked redirect provider; 308 and query preserved, public provider failure tolerated, account/admin gates retained | Actual configured redirect records; arbitrary legacy paths outside current matcher |

Runtime edits are limited to four existing files: `app/ajadmin/page.tsx`, `lib/admin/actions.ts`, `lib/admin/builder-actions.ts`, `proxy.ts`. Four focused regression-test files were added. **No public visual component, navbar/mobile CSS, company copy, route slug, dependency or database migration was changed.**

## Test evidence

- Before permission fixes: **9 failures / 16 passes** in 25 new regression cases; [red evidence](evidence/phase-1/before.txt).
- Before redirect fix: **5 failures / 5 passes** after correcting the standalone framework test harness; [red evidence](evidence/phase-1/proxy-before.txt).
- Final suite: **27 files / 181 tests PASS** (146 prior + 35 new); [output](evidence/phase-1/tests.txt).
- Final TypeScript and ESLint PASS: [typecheck](evidence/phase-1/typecheck.txt), [lint](evidence/phase-1/lint.txt).
- Final default Turbopack production build PASS in `/tmp/phase1-production`, with separate source/dependency/output copies; [build](evidence/phase-1/build.txt). Live dev `.next` was not overwritten.
- **15/15 local production browser scenarios passed**, no page errors: [gesture/response evidence](evidence/phase-1/browser-results.json). Additional signup/consultation required-field gestures and five endpoint probes: [evidence](evidence/phase-1/extra-results.json).
- Live preview actual gestures passed: search opened, Services filter reported one result, real link changed route/active state; theme toggled/persisted/restored; Client Login modal opened/closed; real Home link returned `/`. All gestures reported `performed: true`, all waits matched. No console errors/failed requests; no overlay; main root had two children. These verify public controls, not authenticated permissions.
- The permission/publishing fixes are **unit/server-render verified only** with isolated adapters. Their real authenticated browser gestures/persistence remain **UNVERIFIED**; no claim that a mock role test logs into Supabase.

### Test-harness issues kept separate from app bugs

1. Live preview `navigate()` moved the URL without confirmed route rendering. Real in-app link clicks recovered the preview and then passed the complete live gesture script. Do not describe this as a navbar source fix: navbar source was not edited.
2. A first local dev browser run at `127.0.0.1:3000` received 403 on dev scripts because that loopback origin is outside the configured preview-origin allowlist. HTML/forms could work progressively while JS-only controls did not. The audit was rerun on isolated production (no dev-origin gate): 15/15 passed. The actual configured **preview-origin asset request returned HTTP 200**. No host/CSP/auth allowlist was weakened just for testing.
3. Next 16.3.3 exports `unstable_doesMiddlewareMatch`, not `unstable_doesProxyMatch`; standalone tests also supply Node AsyncLocalStorage normally installed by Next's server bootstrap. Those were harness corrections, not production changes.

## Route / feature / action matrix

Statuses: **LIVE PASS** = user-preview gesture; **LOCAL PASS** = isolated production gesture; **UNIT PASS** = real source with isolated adapters; **STATIC** = source inspection only; **BLOCKED** = no corresponding authorized real integration verification. An HTTP 200 Server Action response carrying an error is NOT a saved record.

| ROUTE | FEATURE | BUTTON/FORM | FRONTEND HANDLER | SERVER/API | DATABASE | AUTH/RLS | EXPECTED | ACTUAL | STATUS |
|---|---|---|---|---|---|---|---|---|---|
| All public | Desktop nav | Eight links | Next Link/pathname | Public route loaders | navigation_items or existing fallback | Public | Route and active state, compact layout | All eight local clicks; live Services/Home passed; 64px desktop baseline | LIVE + LOCAL PASS |
| All public | Search | Search pages/result | BottomNavigation query/dialog | None | None | None | Filter/empty/result/close | Local empty/one-result + real navigation passed; live one-result passed | LIVE + LOCAL PASS |
| All public | Theme | Toggle color theme | ThemeToggle | None | Preference only, not business data | None | Toggle/persist/restore | Real toggles + local reload persistence; original live preference restored | LIVE + LOCAL PASS |
| All public | Portal entry | Client Login / close | MarketingHeader/PortalLoginModal | Session lookup if configured | Supabase Auth | No bypass | Logged-out modal, safe close | Live/local modal opens and closes | LIVE + LOCAL PASS; real account entry BLOCKED |
| Mobile public | More navigation | More / About | BottomNavigation native dialog | Next route | navigation_items/fallback | Public | Open/choose/close; original dock | Local 390×844: route changed, closed, dock 362×84 | LOCAL PASS |
| /services | Service cards / CTA | Custom Software / Discuss your project | Link | Service detail reader | services/service_faqs or fallback | Public published filter/RLS when configured | Correct detail and quote form | Actual card→detail→quote gesture passed | LOCAL PASS; real CMS BLOCKED |
| /projects | Cards/filter | Project facets and links | ProjectFiltersBar | projects readers | projects/clients/project_media | Published+active+public RLS | Real records filter/navigate | Honest empty state; no cards/facets invented | Empty-state LOCAL PASS; data gestures BLOCKED |
| /blog | Article link | Planning article card | Link | blog readers | blog_posts/taxonomy or existing articles | Published content | Opens article | Real card→article gesture passed | LOCAL PASS |
| /login | Client login | Sign in submit | ClientLoginForm | clientLoginAction | Supabase Auth/profiles | Real session required | Truthful configuration failure or valid session | UI error: Client login is not configured yet; POST returned | Failure LOCAL PASS; successful auth BLOCKED |
| /signup | Signup | Empty submit | ClientSignupForm/native validity | clientSignupAction (not reached by invalid form) | Auth/profiles/addresses | Client default role | Required inputs block empty request | 13 invalid required fields; no account created | Validation LOCAL PASS; signup BLOCKED |
| /login | Google entry | Continue with Google | GoogleButton | googleOAuthReadyAction | Supabase readiness/Auth | Provider/redirect allowlist | Unavailable state without setup | Real click showed schema-readiness error; no external OAuth redirect | Failure LOCAL PASS; OAuth exchange BLOCKED |
| /forgot-password | Recovery | Send recovery link | ForgotPasswordForm | forgotPasswordAction | Auth/optional Resend | Provider required | No fake email success | Real submit showed configuration error | Failure LOCAL PASS; delivery/recovery BLOCKED |
| /reset-password, /update-password | Password update | Reset form | ResetPasswordForm | updatePasswordAction | Supabase Auth | Recovery session/cookie | Only legitimate recovery session updates | Source mapped; no recovery tokens supplied | BLOCKED |
| /contact | Contact | Send message | LeadForms | submitContactAction | contact_submissions/acceptance/email | Validation/honeypot/rate/consent | Validated request and truthful result | Empty submit blocked; valid fixture waited genuine minimum fill time then server rejected unavailable submissions | Failure LOCAL PASS; persistence BLOCKED |
| /request-quote | Quote | Request a quote | LeadForms | submitQuoteAction | quote_requests/attachments/acceptance/email | Consent/validation/private uploads | Persist then confirm | Valid fixture+consent rejected unavailable submissions; no fake success | Failure LOCAL PASS; uploads/persistence BLOCKED |
| /contact | Consultation | Request a consultation | LeadForms/native validity | requestAppointmentAction (not reached by invalid form) | appointment_requests | Validation/rate guard | Reject blank input | Required name invalid; no appointment created | Validation LOCAL PASS; persistence BLOCKED |
| /account | Profile/review/docs/address | AccountForms/history | Portal forms | portal actions/readers | profiles/addresses/testimonials/documents/messages | User ownership/RLS | Only own records; reload persistence | Setup screen, noindex observed; no authenticated account | BLOCKED |
| /ajadmin | Dashboard | Leads/panel/inbox | Server page | capability-gated query | quote_requests via service role | leads:read before query | Editors cannot receive leads | Server-component role/error tests pass; setup screen only in real app | UNIT PASS; real role sessions BLOCKED |
| /ajadmin/c/[resource] | CMS list/search/filter/CRUD | ResourceList/ResourceForm | generic form actions | lib/admin/actions + crud | Configured resource table | Capability + schema; service role bypass needs guards | Durable write; true status/publish rules; cache sync | Save/status tests pass; real listing/create/edit/save/delete/restore/reorder blocked | UNIT/STATIC; integration BLOCKED |
| /ajadmin/home | Builder | Save/publish/visibility/order | builder forms | builder-actions | page_sections | content:write vs content:publish | No editor publication bypass | Save/status guard tests pass; public home reader still disconnected | UNIT PASS for guards; persistence/render BLOCKED |
| /ajadmin/media | Media | Upload/delete | admin media forms | media-actions | Storage/media_assets | media:write + MIME/size | Stored object/index consistency | No real bucket operations authorized/configured | STATIC / BLOCKED |
| /ajadmin/brand | Settings | Save settings | BrandSettingsForm | settings-actions | site_settings | settings:write | Persist and public cache refresh | Source gate/schema/revalidation mapped; setup screen | STATIC / BLOCKED |
| /ajadmin/c/seo, /ajadmin/c/redirects | SEO admin | Save | ResourceForm | resource actions/proxy | seo_metadata/redirects | settings capability / anon redirect reads | Real metadata sync / permanent redirects | Proxy tests preserve 308/query on service/project/blog; real records unavailable | UNIT/STATIC; sync BLOCKED |
| /ajadmin/users | User management | Create/reset/role/username | admin users forms | user-actions | Auth admin/profiles/admin_usernames | users:manage | Super-admin-only changes | Guard source mapped; noindex/setup verified; no users mutated | STATIC / BLOCKED |
| /ajadmin/leads | Lead management | Status/notes | LeadEditForm | leads/admin-actions | contact/quote/appointment tables | leads:manage | Authorized persisted update | Source mapped, no real lead data or sessions | STATIC / BLOCKED |
| /ajadmin/agreements | Legal lifecycle | Version/activate/PDF/archive | admin agreements | agreement-actions | agreements/versions/acceptances/Storage | settings:write | Real evidence and published version | Source mapped, no versions/files changed | STATIC / BLOCKED |
| /ajadmin/login | Staff auth | Login/logout | login form | auth/actions | Auth/profiles/admin_usernames | Staff resolution + role check + rate limit | No client escalation | Source mapped; real staff authentication unavailable | STATIC / BLOCKED |
| /auth/callback, /auth/confirm | Auth handlers | No-token GET | Route handlers | PKCE/token-hash verification | Supabase Auth | Safe next/recovery state | Missing-token error redirect | Both real no-token GETs returned 307 to login errors | LOCAL PASS negative only; valid exchange BLOCKED |
| /blog/rss.xml, /robots.txt, /sitemap.xml | Crawl feeds | GET | Route/metadata handlers | Existing readers | Published CMS or fallback | No private indexing | Correct endpoint content type | HTTP 200 with expected RSS/text/XML types | LOCAL PASS fallback only |

## Complete Server Action inventory and precise coverage

All 39 exported action functions in the 10 original action modules are listed below. Table names are direct literals in that function where present; dynamic/helper tables are explicitly labeled. The row is not a claim of hosted persistence testing.

| Action / source | Database or dependency | Phase 1 verification | Hosted persistence |
|---|---|---|---|
| `upsertResourceAction` — `website/src/lib/admin/actions.ts` | Dynamic resource table via config/helpers | UNIT PASS: actual action with mock adapters | BLOCKED |
| `setResourceStatusAction` — `website/src/lib/admin/actions.ts` | Dynamic resource table via config/helpers | UNIT PASS: actual action with mock adapters | BLOCKED |
| `toggleResourceActiveAction` — `website/src/lib/admin/actions.ts` | Dynamic resource table via config/helpers | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `deleteResourceAction` — `website/src/lib/admin/actions.ts` | Dynamic resource table via config/helpers | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `restoreResourceAction` — `website/src/lib/admin/actions.ts` | Dynamic resource table via config/helpers | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `reorderResourceAction` — `website/src/lib/admin/actions.ts` | Dynamic resource table via config/helpers | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `createAgreementAction` — `website/src/lib/admin/agreement-actions.ts` | agreements | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `createAgreementVersionAction` — `website/src/lib/admin/agreement-actions.ts` | agreement_versions, agreements | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `activateAgreementVersionAction` — `website/src/lib/admin/agreement-actions.ts` | agreement_versions, agreements | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `generateAgreementVersionPdfAction` — `website/src/lib/admin/agreement-actions.ts` | agreement_versions, agreements | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `archiveAgreementAction` — `website/src/lib/admin/agreement-actions.ts` | agreements | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `toggleSectionVisibilityAction` — `website/src/lib/admin/builder-actions.ts` | page_sections | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `reorderSectionAction` — `website/src/lib/admin/builder-actions.ts` | page_sections | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `setSectionStatusAction` — `website/src/lib/admin/builder-actions.ts` | page_sections | UNIT PASS: actual action with mock adapters | BLOCKED |
| `saveSectionAction` — `website/src/lib/admin/builder-actions.ts` | page_sections | UNIT PASS: actual action with mock adapters | BLOCKED |
| `createSectionAction` — `website/src/lib/admin/builder-actions.ts` | page_sections | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `uploadMediaAction` — `website/src/lib/admin/media-actions.ts` | media_assets | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `deleteMediaAction` — `website/src/lib/admin/media-actions.ts` | media_assets | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `updateSettingsAction` — `website/src/lib/admin/settings-actions.ts` | site_settings | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `createUserAction` — `website/src/lib/admin/user-actions.ts` | admin_usernames, audit_logs, profiles, user_addresses | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `resetUserPasswordAction` — `website/src/lib/admin/user-actions.ts` | Dynamic resource table via config/helpers | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `changeUserRoleAction` — `website/src/lib/admin/user-actions.ts` | profiles | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `updateAdminUsernameAction` — `website/src/lib/admin/user-actions.ts` | admin_usernames, profiles | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `signInAction` — `website/src/lib/auth/actions.ts` | profiles | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `signOutAction` — `website/src/lib/auth/actions.ts` | Auth/server client or helper-mediated access; see source | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `submitContactAction` — `website/src/lib/leads/actions.ts` | contact_submissions | LOCAL PASS: unavailable-config rejection through real UI; no success claim | BLOCKED |
| `submitQuoteAction` — `website/src/lib/leads/actions.ts` | quote_requests | LOCAL PASS: unavailable-config rejection through real UI; no success claim | BLOCKED |
| `requestAppointmentAction` — `website/src/lib/leads/actions.ts` | appointment_requests | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `updateLeadAction` — `website/src/lib/leads/admin-actions.ts` | appointment_requests, contact_submissions, quote_requests | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `clientLoginAction` — `website/src/lib/portal/actions.ts` | Auth/server client or helper-mediated access; see source | LOCAL PASS: unavailable-config rejection through real UI; no success claim | BLOCKED |
| `clientSignupAction` — `website/src/lib/portal/actions.ts` | Auth/server client or helper-mediated access; see source | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `googleOAuthReadyAction` — `website/src/lib/portal/actions.ts` | Auth/server client or helper-mediated access; see source | LOCAL PASS: unavailable-config rejection through real UI; no success claim | BLOCKED |
| `forgotPasswordAction` — `website/src/lib/portal/actions.ts` | Auth/server client or helper-mediated access; see source | LOCAL PASS: unavailable-config rejection through real UI; no success claim | BLOCKED |
| `updatePasswordAction` — `website/src/lib/portal/actions.ts` | Auth/server client or helper-mediated access; see source | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `updateProfileAction` — `website/src/lib/portal/actions.ts` | profiles | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `completeProfileAction` — `website/src/lib/portal/actions.ts` | agreement_acceptances, profiles, user_addresses | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `uploadAvatarAction` — `website/src/lib/portal/actions.ts` | profile-avatars, profiles | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `submitVerifiedReviewAction` — `website/src/lib/portal/actions.ts` | clients, profiles, projects, testimonials | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |
| `clientSignOutAction` — `website/src/lib/portal/actions.ts` | Auth/server client or helper-mediated access; see source | STATIC: located/guard-flow mapped; full branch testing not completed | BLOCKED |

## Remaining defects / decisions — not silently repaired or waived

- **R01 Home Builder:** public home still uses the accepted fixed HomeExperience, not getHomeSections. Restoring CMS structure without real saved sections could materially move/remove content. Remains unresolved; no redesign or invented CMS state.
- **R02 AI schema:** committed migrations still lack ai_methods. Real schema/history cannot be compared without owner access; no speculative migration or project change was applied.
- **R03 Offers/updates:** conditional sitemap/detail-route mismatch remains. No speculative landing pages/content were created.
- **R04 dashboard capability mismatch:** code fix + regression tests complete; hosted verification blocked.
- **R05 redirects:** supported service/project/blog families fixed and unit-tested; arbitrary old paths outside matcher and configured map/cache behavior remain for real verification.
- **R06 alternate webpack CSS compatibility:** unchanged; default production build passes. Not a Phase 1 design-system rewrite.
- Further action failure/transaction scenarios (storage compensation, lead agreement/email partial failures, reorder concurrency, settings cache delivery, role escalation through real RLS) remain explicitly unverified. Presence of a static capability call is not proof those operations succeed.
- No live/production publication, Search Console/CrUX, payment checkout or provider account integration was tested or added.

## Performance comparison (diagnostic only)

Same Phase 0 loopback method: isolated production, fresh browser contexts, normal motion, unthrottled, 5-second post-load window, median of 3. Database and external-provider latency remain unmeasured. No dependency/CSS/client-component changes. Raw [samples](evidence/phase-1/performance.json).

| Template / width | Phase 0 LCP ms | Phase 1 LCP ms | Phase 0 JS KiB | Phase 1 JS KiB | Phase 1 CLS | Phase 1 TTFB ms |
|---|---:|---:|---:|---:|---:|---:|
| `/` / 1214 | 448.0 | 352.0 | 609.9 | 609.8 | 0.0000 | 11.2 |
| `/` / 390 | 196.0 | 220.0 | 609.8 | 609.8 | 0.0000 | 9.8 |
| `/services` / 390 | 168.0 | 148.0 | 610.9 | 610.9 | 0.0000 | 8.0 |

Timing variation in these small unthrottled samples is not a field-performance certification or proof of all-scenario non-regression. The redirect feature necessarily adds a cached map lookup on its newly covered routes when configured, but no extra Auth call there; real remote timing remains blocked.

## Stop / handoff

Phase 1 is held at its unresolved integration/functional gates. Do not advance to Phase 2 or relabel blocked checks as passes. No more secret prompts unless the owner explicitly reopens configuration. Further `START NEXT PHASE SAFELY` commands resume this unfinished phase; changing the acceptance scope or deferring its blockers requires an explicit owner decision, not an automatic skip.
