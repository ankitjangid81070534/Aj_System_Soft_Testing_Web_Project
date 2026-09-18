# Retained risks and blockers — 30-phase program

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
