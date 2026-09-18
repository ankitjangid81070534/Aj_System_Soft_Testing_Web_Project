# Phase 1 — Data / Save / API / Backend Architecture Audit (30-phase program)

Date: 2026-09-18 UTC. Authorized by **START NEXT PHASE SAFELY**; the interrupted first inspection had not completed Phase 1. Baseline: `a3fb93421d052217dbce84d68e3b9c3558a16d27`, branch `initial-setup`.

**Source audit and one narrowly scoped authorization repair complete. Hosted functional sign-off remains BLOCKED.** No redesign, schema execution, new backend, credential request, business-data mutation, publication or deployment. Phase 2 is not started.

## 1. Source of truth and evidence boundaries

- The existing application uses **Supabase Postgres, Auth and Storage**, accessed through Next Server Actions; Resend is optional email delivery. There is no replacement Base44 business database or browser-local saving layer.
- All six optional integration names remain absent from both the managed environment file and running process (presence-only inspection). The existing public fallback is healthy, not a functioning authenticated backend.
- Fresh inventory: **39 exported actions in 10 modules; 17 generic CMS resources; 16 committed SQL migrations**. `evidence/phase1-30/source-inventory.json` records action definitions, source references, and 90 source digests. Static references are not proof that a control is accessible for every role.
- `supabase/admin.ts` is server-only and uses service-role credentials, bypassing RLS. Every privileged entry therefore needs its own authorization. Public client is cookie-free/anonymous; server/browser clients use the visitor session and RLS. `getCurrentUser` uses request-scoped React cache, not a shared cross-user cache.
- Anonymous protected-page checks see setup/expired-session notices or login redirects. **None of the 17 resource rows below has a passed FORM → WRITE → PERSISTED ROW → RELOAD → PUBLIC EFFECT test here.** No hosted schema, applied migration, trigger, grant, policy, backup or role behavior was inferred from a local build.

## 2. Generic save chain — all 17 resources

`/ajadmin/c/[resource]`, `/new`, `/[id]` → `ResourceList` / `ResourceForm` / `ConfirmButton` / `AdminActionForm` → `admin/actions.ts` → `admin/crud.ts` + existing service-role client → existing table → explicit mutation result → feedback/create redirect and route/tag invalidation → edit/list/public readers.

`upsertResourceAction` checks resource/capability, builds the resource Zod schema, strips unknown fields, normalizes the allowlisted payload, and confirms a returned row ID. Update reads the existing row and refuses missing/trashed records where supported. Publication permission is now derived from the presence of a status field, not whether the UI exposes a quick Publish button. Editor updates omit `status` even if it matched the earlier read.

Quick actions: `setResourceStatusAction`, `toggleResourceActiveAction`, `deleteResourceAction`, `restoreResourceAction`, `reorderResourceAction`. The first four confirm affected rows. Reorder confirms both writes but its compensation is **not a transaction**. `getResourceRow` conflates read failure with absence; `uniqueSlug` ignores lookup errors and may issue many sequential requests. Database constraints still decide conflicts.

Legend: P = quick publish; A = activation; T = soft trash/restore; O = ordering; all rows have create/update/delete subject to capability. “Reload” below describes the source path, not a completed hosted check.

| Resource → table | Capability / operations | Reload / public reader and cache effect | Audit outcome |
|---|---|---|---|
| services → services | content; P/A/T/O | Admin list; Home, services list/detail; `/services`, old/new slug, `/sitemap.xml` | Existing status guards retained; fallback/count distinction depends on backend reads. |
| clients → clients | content; P/A/T/O | Admin list; related public project names; `/projects`, Home | Portal linkage and public permission are editable content fields; identity-link authorization needs policy review. |
| projects → projects | content; P/A/T/O | Admin list; projects list/detail, Home, sitemap | Public/active/published readers preserved; gallery/client relations are not fully managed by generic fields. |
| team → team_members | content; P/A/T/O | Admin list; `/team`, `/about`, Home | Public visibility and email consent rely on existing readers/RLS. |
| testimonials → testimonials | content; P/A/T/O | Admin list; `/reviews`, Home | Moderation/public/verified fields retained; real client evidence remains required. |
| posts → blog_posts | content; P/A/T/O configured | Admin list; `/blog`, detail, sitemap; RSS freshness needs separate verification | **Ordering mismatch:** config orders by `created_at`, helper requires a numeric value; no schema/order change made. |
| categories → blog_categories | content; basic CRUD | Category options/list and `/blog` | FK behavior must be verified; basic resource is not a post-assignment workflow. |
| tags → blog_tags | content; basic CRUD | Blog tag joins and `/blog` | Generic tag management does not assign `blog_post_tags`. |
| navigation → navigation_items | settings; A/O | `navigation` tag + root layout | Existing destinations retained; no nav redesign. |
| payments → payment_links | settings; A | Admin list/root refresh; authenticated account reader requires reload check | External HTTPS payment URLs only, not a payment processor implementation. |
| offers → offers | content; A/O; status in Save | `offers` tag, Home; `/offers` invalidation is not an implemented route | **Fixed Save publication bypass**; placement/scheduling/actor audit gaps remain. |
| announcements → announcements | content; A; status in Save | `announcements` tag + root layout; `/updates` invalidation is not an implemented route | **Fixed Save publication bypass**; not all placement choices have renderers. |
| benefits → launch_benefits | content; A/O | `launch-benefits` tag, Home | Existing activation-only model unchanged. |
| ai-methods → ai_methods | content; A/O | `ai-methods` tag, `/ai-methods` | No committed table creation found; hosted existence unknown. Not a chat agent. |
| socials → social_links | settings; A/O | `social-links` + `site-settings` tags, root layout | HTTPS read filter; legacy JSON fallback claim differs from current reader. |
| seo → seo_metadata | settings; basic CRUD | Static metadata routes, Home, sitemap | Route overrides retained; actual post-save metadata needs remote records. |
| redirects → redirects | settings; A | Admin list/root; proxy has a separate process-local 5-minute map | Save does not invalidate that map; route matcher limits where redirects apply. |

All 17 remain **BACKEND_DEPENDENT** for actual saving/reload/public synchronization. Plain table names and source contracts are not database inspection results.

## 3. Dedicated action-by-action trace

Paths below are under `website/src/`. “Result” describes existing behavior, including its gaps.

| UI entry → action(s) | Authorization / validation → persistence | Response → reload / limits |
|---|---|---|
| Builder list → `toggleSectionVisibilityAction` | content:write; UUID → read + update `page_sections` | Silent failures/no affected-row confirmation; refresh `home-sections`, Builder, `/`. |
| Builder list → `reorderSectionAction` | content:write; UUID/direction → Home list + two independent updates | Can partially swap; read/write failures may be silent. Not repaired by feedback alone. |
| Exported `setSectionStatusAction` (no non-test caller found) | content:publish; UUID/status → section update | Guards direct invocation, but silent failure path remains. |
| Builder edit → `saveSectionAction` | content:write; status-change guard; JSON/type/layout/order validation → section read/update/select ID | Redirect notice/error; editor status omission retained. Save-by-ID also supports non-Home gallery records. |
| Builder new → `createSectionAction` | content:write; section-type enum → last order/read + draft insert | Redirect; ignores ordering-read error; ordering creation can race. |
| BrandSettingsForm → `updateSettingsAction` | settings:write; allowlisted Zod → singleton `site_settings` upsert/select ID | Mutation state; `site-settings` tag + layout and brand path; reload required. |
| Media page → `uploadMediaAction` | media:write; bucket/MIME/file → Storage upload + `media_assets` insert | Redirect; removes object after index failure but does not verify compensation success. |
| Media page → `deleteMediaAction` | media:write; UUID → library read/delete then object remove | Storage failure only logged after row deletion; no row-count confirmation or reference-usage check. |
| Users page → `createUserAction` | users:manage (super admin); user/password/staff username schemas → Auth create + profile + staff mapping + optional address + audit | Redirect; best-effort Auth rollback is not verified, optional address/audit insert errors ignored. |
| Users page → `resetUserPasswordAction` | users:manage; UUID/strong password → Auth admin update | Redirect + best-effort audit; no browser reset verified. |
| Users page → `changeUserRoleAction` | users:manage; rejects own role change; role/UUID → profiles update | Redirect + users path + audit; no affected-row check. |
| Users page → `updateAdminUsernameAction` | users:manage; staff target + username validation → admin_usernames upsert | Redirect + users path + audit; constraints/role transitions require hosted QA. |
| Agreements page → `createAgreementAction` | settings:write; title/type + slug → agreements insert/select ID | Inactive agreement; audit + `agreements` tag + admin/public paths + redirect. |
| Agreements page → `createAgreementVersionAction` | settings:write; body/title/parent → max version + draft insert/checksum | Audit/refresh/redirect; version-number race resolved only by DB uniqueness, read errors not distinct. |
| Agreements page → `activateAgreementVersionAction` | settings:write; UUID → version update, then agreement current pointer | Non-atomic two-write operation; partial activation possible. |
| Agreements page → `generateAgreementVersionPdfAction` | settings:write; UUID/reads → generated PDF/private Storage + version path | Redirect inside broad try can be caught as generic PDF failure; storage/row consistency not atomic. |
| Agreements page → `archiveAgreementAction` | settings:write; UUID → agreements inactive | Audit/refresh/redirect; zero-row update can appear successful. |
| LeadEditForm → `updateLeadAction` | leads:manage; kind/status → **session/RLS client** updates contact/quote/appointment + select ID | Mutation state; inbox/detail revalidation. IDs/assignee and notes have weaker server validation than UI. |
| ContactForm → `submitContactAction` | schema, conditional agreement gate, honeypot/rate limit → optional current user + privileged contact insert | Lead state after optional acceptance/PDF/email; requires actual row/reload verification. |
| QuoteForm → `submitQuoteAction` | schema + consent + agreement + attachment + abuse guards → private upload + quote insert | Failed insert can orphan attachment; optional evidence/email awaited after write. |
| AppointmentForm → `requestAppointmentAction` | schema + abuse guards → appointment insert | Lead state + optional email; no returned-row verification. |
| Admin login form → `signInAction` | schema/rate limit; privileged staff identifier resolution → Auth password login + role check | Generic failure or safe admin redirect; real session unverified. |
| AdminShell/dashboard → `signOutAction` | cookie-bound Auth signOut | Redirect to admin login; signOut error is not checked. |
| AuthForms → `clientLoginAction` | configured backend; schema/rate limit → Auth password login | Portal error state or sanitized portal redirect. |
| AuthForms → `clientSignupAction` | schema-readiness + signup schema + username check + limiter → Auth signup/profile trigger | Optional agreement evidence; account redirect or verification-email state. Multi-system success not established. |
| GoogleButton → `googleOAuthReadyAction` | read-only portal schema probe | Readiness only; browser separately starts OAuth. It does not prove provider setup. |
| AuthForms → `forgotPasswordAction` | schema/limiter → branded recovery link/email or Supabase recovery | Generic anti-enumeration response deliberately does not prove email delivery. |
| AuthForms → `updatePasswordAction` | schema + HTTP-only recovery flag + authenticated user → Auth password update/signOut | Clear flag + login redirect; real token/session gates unverified. |
| ProfileForm → `updateProfileAction` | schema + authenticated self → session-bound profiles update | Success + account refresh; no affected-row check. |
| CompleteProfileForm → `completeProfileAction` | schema + self + readiness/username check → profile, address, acceptance | Sets profile_completed before address succeeds; partial-save/retry contract needs review. |
| AvatarForm → `uploadAvatarAction` | self + MIME/3MB → own Storage object + profile URL update | Account state/refresh; profile failure leaves uploaded file; no row confirmation. |
| ReviewForm → `submitVerifiedReviewAction` | self, confirmed client + linked project, review schema → session-bound testimonial insert | Always private draft for moderation; account refresh; actual RLS denial/approval unverified. |
| Account page → `clientSignOutAction` | configured cookie-session client → Auth signOut | Login redirect; provider failure unchecked. |

Six generic actions above + 33 dedicated actions here = 39 exports. `setSectionStatusAction` remains part of the direct server boundary despite its absent UI reference.

### HTTP handlers and external boundaries

- `/auth/callback`: PKCE code exchange or allowlisted token type; copies session cookies and recovery marker on successful exchange, safe next-path redirect; missing/invalid credentials are not authentication evidence.
- `/auth/confirm`: token-hash verification, same session/recovery boundary. Missing-token cases redirect safely in the anonymous smoke test; real tokens were never supplied.
- `/blog/rss.xml`: read-only content output; not a save API. CRUD uses Server Action POSTs, not a separate REST server created in this phase.
- Existing exact development-origin handling is retained. No CORS/auth/header relaxation. No payment/AI provider added.

## 4. Confirmed repair — P1-F01

**Problem:** `upsertResourceAction` used `config.supports.publish` as its authorization switch. Offers and announcements have a validated draft/published field and public published-only readers, but no quick Publish button. An editor could therefore create published rows, change publication state, or overwrite a concurrent publisher's status through Save.

**Change:** In `admin/actions.ts`, derive `hasPublicationStatus` from the resource's configured fields and use it for all three existing Save guards. This enforces the existing `content:publish` capability; it does not grant a new permission, add a button, change schemas, change activation-only resources, or block same-status editor content edits.

**Reproduction and verification:** New `growth-authorization.test.ts` executes the real action with real resource schemas and mocked adapters. Before the fix: **10 failed / 6 passed**. After: **16/16 passed**, covering both resources, editor published-create denial, publish/unpublish denial, draft creation, same-status updates omitting status, and admin/super-admin publish/unpublish. Existing 12 CMS authorization tests also pass. These are NOT real database writes or authenticated UI tests.

**Important remaining security boundary:** Migration 0016's offers/announcements staff write policies allow editor-level writes without a publication predicate; 0002 has the analogous Builder policy. The action fix does **not** secure direct database writes or prove effective hosted RLS parity. Release remains blocked pending approved schema/policy reconciliation. Do not replay historical migrations to make this pass.

## 5. Remaining findings / priorities

| ID | Severity and evidence | Disposition |
|---|---|---|
| P1-F02 | High: RLS versus action publication mismatch (above); editor identity-link fields in clients also merit permission review | Read-only sanitized existing schema/grants/triggers and owner policy decision first; no speculative permission/migration changes. |
| P1-F03 | High: Builder saves do not drive fixed public Home; silent quick actions/read-as-empty; two-write reorder | Retain prior repair plan; enabling Builder could remove accepted Home content. Requires explicit composition/data contract. |
| P1-F04 | High: generic reorder non-atomic; blog reorder requires numeric `created_at` despite timestamp configuration | Do not swap creation timestamps or invent a sort column. Approve ordering semantics/schema before repair; compensation is not atomicity. |
| P1-F05 | High: quote UI permits 10MB, avatar action 3MB, while Next Server Actions default body limit is 1MB and next.config sets no bodySizeLimit | Source/framework-confirmed limit mismatch; no actual large-upload test. Reconcile platform limits, per-bucket limits and abuse protection before raising a global cap. |
| P1-F06 | Medium: several dedicated updates report success from error=null without returned row; multi-step user/profile/agreement/media flows can partially persist | Future save QA must inject failure at each boundary, check actual rows and distinguish saved/secondary-failure states. Never retry blindly. |
| P1-F07 | Medium: agreement version is resolved again during acceptance, not bound to the text seen by the visitor; failed read is treated as no current agreement | Legal/consent contract review required. Best-effort acceptance/PDF is not guaranteed evidence. No legal or transaction-policy change made. |
| P1-F08 | Medium: cache refresh failures logged but mutation still returns saved; detail-form reset and fresh edit props need authenticated verification; redirects have independent 5-minute map | A saved response is not proof of public synchronization. Do not report committed writes as unsaved after cache failure. |
| P1-F09 | Medium: lead success “another” controls change formKey but retain success action state; notes lack matching server length check; reviewing option lacks a label | Source findings, not newly exercised success gestures. Phase 13/16 scoped follow-up; no UI rewrite during audit. |
| P1-F10 | High reconciliation blocker: ai_methods has no committed create-table; 0016 includes conditional updates/seeds despite its header | Hosted table absence is unknown. No SQL/seed execution, backend replacement or data copying. |
| P1-F11 | Medium: service-role writes for growth resources omit actor columns in config; audit fallback may record null/stale identity; audit writes are best effort | Reconcile triggers and actor policy in existing schema; not a guaranteed audit trail. |
| P1-F12 | Medium: datetime-local values lack explicit timezone conversion on submit; numeric/date validation lacks several cross-field rules; CMS search escapes only %/_ | Review schedule/timezone, FK/UUID, numeric ranges and PostgREST filter syntax with scoped tests. Not SQL interpolation; do not claim SQL injection. |
| P1-F13 | Medium: public author fallback can render profile email; storage deletion does not check in-use URLs; file type checks trust supplied MIME | Privacy/ownership/content validation review; no credentials/private data were fetched. |
| P1-F14 | Medium: fallback readers can collapse database failure into empty/default state; settings reader no longer implements documented legacy social JSON fallback | Public continuity is intentional, but not a backend health signal. Existing SetupNotice already advises confirming migration history; earlier claim that this component lists 0001–0012 is stale. |

No claim of exhaustive security certification. These unresolved items remain explicit, not silently counted as fixed by the permission patch.

## 6. Slow/duplicate calls and cache audit

- Home content already launches services/projects/team/testimonials/posts in parallel. Site settings and social links are parallel; blog tags/author are parallel. Preserve these existing improvements.
- `uniqueSlug` can perform up to 48 serial collision reads before timestamp fallback; last-version/order allocation is also read-then-write, not concurrency-safe allocation. No latency claim without backend access.
- Generic update reads existing row then writes; toggles read then invert; concurrent toggles can lose intent. Ordering loads the entire allowed list (subject to provider row limits), then neighbor read + two writes and possible compensation. Do not replace with unapproved generic SQL/RPC.
- Profile/signup readiness checks make privileged table probes; password/staff resolution involves sequential Auth/profile queries. Some are deliberate security checks, not removable duplicates.
- Acceptance can perform agreement/version reads, evidence insert/PDF upload/link update before response; email pair runs in parallel but is awaited. A durable outbox/idempotency contract would require existing-backend design, not a fire-and-forget workaround.
- Public tagged caches generally use 300 seconds; time-window filtering for offers/announcements runs inside the cache, so schedule transitions are not guaranteed instant without refresh. Redirect map has its own process TTL. No background job or shared cache was added.
- Request-scoped React cache must not be replaced with global caching of cookie-bound records. Keep public anonymous reads and staff draft preview boundaries distinct.
- Local process rate limiting is not distributed abuse protection or deduplication. Public leads have no durable request-id/idempotency key; pending UI alone cannot prevent all duplicate submissions.

## 7. Verification and safe stop

Fresh results in `evidence/phase1-30/`:

- **431 tests / 52 files PASS**, including 16 new permission regressions; typecheck and lint PASS.
- Isolated `NODE_ENV=production npm run build` PASS using copied dependencies at container `/tmp/aj-phase1-production`; live `/app` source dev server untouched.
- **3 existing Playwright navigation tests PASS** at 1024/1440px and 390px. These preserve public behavior, not admin persistence.
- **20 anonymous production entry-point checks PASS after waiting for streamed login redirects**; zero page errors. Initial early-read evidence is retained: three protected pages briefly had empty body text before redirect. Harness wait-state correction, not an app repair.
- Live user preview `/`: two main children, no captured console errors, no failed requests, no error overlay. No new screenshots needed because no presentation changed; no new visual sign-off claimed.
- Six optional integrations absent; healthy source-mounted dev service on 3000, external-host Home HTTP 200. No service restart, secret change or preview reload needed.

Changed interaction: **offers/announcements Save authorization** — action-level regression assertions PASS; **real staff gesture, persisted row, reload and public result UNVERIFIED/BLOCKED**. No auth bypass or mocked UI success was used to claim otherwise.

To close the hosted gates later: separately approve read-only schema review (a sanitized schema export is sufficient for planning), then approved role sessions/reversible test records and data-write scope. Test anon/client/editor/admin/super-admin both through the actual forms and direct RLS-bound access. Confirm persisted row, reload, anonymous public effect, denial paths, concurrency and partial failures. Credential deferral remains respected; this report does not ask for a new connection.

Rollback of this source slice is the ordinary reviewed revert of the action patch/test; no data/schema rollback is needed because none changed. Do not weaken the guard to resolve a hosted policy failure.

**STOP. Next: Phase 2 — Professional Site / Customer-Journey Benchmark (planning only), only after the next exact START NEXT PHASE SAFELY.** Advancing planning does not close these backend/release blockers. Base44 app remains unpublished; no PR opened, merged or production released. Baseline hash above is not a new completion commit; Base44 records this turn automatically.
