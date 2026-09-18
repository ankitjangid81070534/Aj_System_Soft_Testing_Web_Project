# Retained risks and blockers — 30-phase program

## Phase 4 acceptance update (2026-09-18, later)

[Visible acceptance](PHASE_4_30_VISIBLE_ACCEPTANCE.md) closes the scoped foundation checkpoint, not whole-app release. Mobile screenshots and live enquiry/field/return checks pass; fresh six independent journeys and 460 tests/type/lint pass. R16 is now monitored/unreproduced in these checks, not fixed. Current full hydration diff shows external `bis_*`/processed body attributes; clean independent browsers have none. Owner browser cleanup and AdSense delivery remain unresolved. Actual wider screenshot is 919×499, not desktop; fixed dock covers part of hero CTAs at rest, to verify for short-height reachability in Phase 5. An additional wider gesture timed out while hidden and stays unverified. No fresh desktop/dark/full-page/private visual acceptance. All backend/release gates persist.

## Historical initial Phase 4 checkpoint (2026-09-18)

[Foundation refinement](PHASE_4_30_DESIGN_SYSTEM.md) preserves business behavior, Home order and component APIs. Local tests/type/lint/build and independent browser cases pass; these do not prove hosted saves or private CMS layouts. R16: live preview produced three new Next client writable-stream close/write errors after a timed-out enquiry click. Quote still mounts with no failed requests/overlay; fresh independent dev/production contexts do not reproduce it. Cause is unestablished; runtime sign-off remains pending, no repair claimed. Screenshot also returned iframe_hidden: human visual acceptance is unavailable. **Hold Phase 4 acceptance before Phase 5.**

R17: screenshot comparisons require visible-image decoding, not fonts/heading readiness alone. Initial light Login differences reached 8.69% and are retained as inconclusive. Corrected source-matched isolated-production captures differ <=0.833% with content/order/sampled geometry preserved; automated pixel comparison is not human visual or full-page/private-data approval. Temporary PNGs remain in container /tmp, not durable Git images. Semantic status colors, forced-color focus and reduced-motion tests do not certify whole-site WCAG conformance. Six optional credentials and all previous backend/release gates remain deferred.

## Phase 3 update (2026-09-18)

[Home inventory/proposal](PHASE_3_30_HOMEPAGE_PLAN.md) is documentation only; no repair or order change. R14: launch benefits' universal heading coexists with eligibility/where-applicable qualifications and unpublished fallback agreement terms; owner must approve exact promises before copy changes. R15: Home finale and shared footer both contain large project CTAs; proposed Home-only compaction needs approval and must not remove unique consultation/navigation/legal content or alter inner-page footer behavior. These are source/content findings, not measured conversion failures.

Material moves, new help content and Builder activation remain separately gated. Old IA orders are not current instructions. Source confirms Builder defaults omit benefits/ownership/articles; adopting them would risk content loss. Fresh tests/type/lint and live Home DOM checks pass, but screenshot returned iframe_hidden: no visual or multi-breakpoint/gesture sign-off. Existing backend, proof/consent, channels, upload and release blockers remain unchanged.

## Phase 2 update (2026-09-18)

Planning only; no repairs. [Journey ledger J01–J08](PHASE_2_30_CUSTOMER_JOURNEYS.md) distinguishes observed form/navigation friction from inferred buyer difficulty. Quote loses service context; contact requires phone/company while consultation promises a call with phone optional. Required agreement points to unpublished fallback terms; direct contact settings and approved portfolio records are unavailable here. None establishes production absence or a measured conversion loss. Do not drop consent or invent contacts/proof/response promises to hide these gates.

Fresh resumed tests/type/lint pass; recovered independent journey evidence is scoped by runtime. Current live iframe route helper failed to render and real-link retry timed out: no iframe/visual sign-off. External-host service remains healthy. Earlier save/RLS/upload/data gates stay blocked. Phase 3 must propose only; do not activate Builder defaults, duplicate useful Home sections or copy competitor claims.

## Phase 1 update (2026-09-18)

The [current data/save audit](PHASE_1_30_DATA_SAVE_AUDIT.md) contains P1-F01–P1-F14 and the full action/resource trace. **Fixed locally:** offers/announcements Save publication bypass; 16 new action tests pass. **Not fixed by that change:** direct RLS publication policies, Builder/public composition, atomic ordering, upload capacity, partial-save semantics or real persisted/reloaded results.

Additional source risks: blog reorder timestamp/numeric mismatch; default 1MB Server Action body limit versus 10MB quote/3MB avatar limits; zero-row-success paths; profile/address/agreement/media partial writes; agreement version resolved at submit time; growth actor attribution; independent redirect/schedule caches; incomplete server field validation. Hosted schema/role/data gates remain BLOCKED; no credentials were requested or generated and no SQL was run.

The retained table below originated in Phase 0. Older potential bugs with later source fixes must not be reported as still unfixed merely from old reports.

| ID | Severity / scope | Evidence | Required follow-up |
|---|---|---|---|
| B01 | Blocking hosted verification | Six optional Supabase/email values absent in file and process; no approved staff/client sessions | Preserve deferral; no fake successful saves or fresh connection requirement for public preview. |
| R01 | High: Home Builder public effect | Public Home ignores `getHomeSections`; fixed composition remains | Phase 1 mapping; real saved rows + owner-approved preservation/activation contract before future integration. |
| R02 | High: Builder feedback/order | Quick actions silently return or log failures; reorder uses two independent writes | Deeper source tests; scoped repair only with authorization. Atomic reorder requires reviewed existing schema/transaction contract. |
| R03 | High: schema/publication uncertainty | `ai_methods` has reader/types/resource but no committed table creation; Builder SQL/app publication boundaries need reconciliation | Inspect sanitized existing schema/grants/policies with approval; never assume remote table absent or run speculative SQL. |
| R04 | Medium: Builder type/content drift | Existing repair plan records section-type mismatch and discarded variant/accent | Reconcile supported controls/renderers without omitting accepted Home content or cross-page gallery uses. |
| R05 | Medium: CMS fields/placements | Blog author/tags/canonical assignment and case-study consent/media/date parity incomplete; offer/update placements not all rendered | New phases 9/16/17/18 audit existing persistence, don't duplicate modules. |
| R06 | Blocking AI readiness | No secure provider/retrieval chat handler; Permissions-Policy microphone=() | Phases 19–21 contract/safety first. No client API keys, fake answers or auto-listening. |
| R07 | Medium: stale historical setup guidance | Phase 1 correction: current shared SetupNotice already advises confirming existing migration history and does not list 0001–0012. Older docs/0016 header still make unsafe broad idempotence assumptions. | Confirm actual applied versions and data effects before any SQL; don't run legacy privileged test seeds. |
| R08 | Medium: production abuse/privacy | Process-local rate limits, root third-party ads; service-role writers bypass RLS | Role/validation/abuse/logging/privacy review; no blanket security certification. |
| R09 | Medium: runtime/visual evidence | User-preview AdSense load error; final browser tab unavailable; desktop screenshot not visually reviewed | Recheck actual user browser when available; don't suppress errors or rewrite auth/security as a workaround. |
| R10 | Content/legal gate | No approved projects/team/review/AI records available here; service agreement not published in fallback | Owner-approved real content/consent and operational promise validation; no invented proof. |
| R11 | Measurement gap | Unthrottled loopback metrics, absent hosted DB/media, variable third-party JS, no INP/TBT field data | Controlled Phase 28 measurement; no performance claim from these fast local numbers. |
| R12 | Release/state risk | Older 0–17 documents and current 0–29 program share phase numbers | Read current PHASE_STATUS/latest master; preserve archive, do not auto-run prior Phase 16 repairs or Phase 17 release. |
| R13 | Temporary capture retention | Screenshot PNGs are in container /tmp; tool supplied no persistent CDN URL | Conversation images and durable JSON remain; recapture before visual changes, do not claim archived durable desktop image. |

Old redirect matcher, dashboard lead capability, preview noindex and populated-search Escape repairs are present in source/current tests; not reopened as fresh defects. Historical optional webpack compatibility was not rerun; default production build passes. Base44 publication, production branch parity, real-device/native zoom/screen-reader and authenticated save regression remain unverified.
