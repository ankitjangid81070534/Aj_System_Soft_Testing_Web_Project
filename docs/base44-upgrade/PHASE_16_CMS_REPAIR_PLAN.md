# Phase 16 — CMS repair plan (proposal only)

Date: 2026-09-14 UTC. Owner request: **Plan CMS repairs**.
Source: `06c3cfe1039d5d88b31b5998d628270f4db662da`, branch `system-upgrade-phase`; starting worktree clean.

**Planning is complete; repairs are NOT implemented or authorized by this document. Phase 16 remains PARTIAL/BLOCKED. Phase 17 has not started.** No application code, SQL, records, credentials, permissions, layout or deployment changed. Prior Supabase/Resend configuration deferral remains in effect.

## 1. Findings and repair priority

All paths below are relative to `website/`. Source evidence is not a hosted reproduction.

| Priority / ID | Source evidence | Proposed outcome |
|---|---|---|
| P1 / R01 | `src/app/(public)/page.tsx` loads home content, settings and benefits but not `getHomeSections`. `HomeExperience.tsx` renders a fixed composition. | Connect only an owner-approved section contract; do not simply replace the page with the older Builder defaults. |
| P1 / CMS-01 | `src/app/ajadmin/home/page.tsx` claims published/visible sections drive Home, although they currently do not. It ignores the listing query error and can show “No sections yet” after a failed read. | Truthful integration/readiness copy and a distinct query-failure state, retaining saved records and existing page layout. |
| P1 / CMS-02 | `builder-actions.ts` visibility/status/reorder actions return silently on several failures, log write errors without returning feedback, and do not confirm affected rows. Builder list uses ordinary forms rather than the existing `AdminActionForm`. | Reuse the existing mutation-result and pending/error presentation patterns; never equate a request finishing with a successful write. |
| P1 / CMS-03 | Builder reorder performs two separate updates. Failure after the first write can leave a partial swap; equal sort values and concurrent edits are not resolved. | Transactional, conflict-aware ordering after schema review; explicit confirmed boundary versus read failure. |
| P1 / R02 | `resources.ts`, `src/types/database.ts` and `data/ai-methods.ts` require `ai_methods`. Phase 16's committed migration inventory found no table creation. The loader returns an empty list on table/service errors. | Reconcile real schema before an additive migration; preserve honest public empty state and expose admin failures. Remote table absence is NOT established. |
| P1 / CMS-04 | Migration 0002's `page_sections_staff_all` permits editor-level writes without a publication predicate, while application capabilities reserve status transitions to admin/super-admin. Builder visibility and content edits can affect already-published rows. | Review effective hosted grants/policies/triggers and agree the publication model before integration. Test direct authenticated access as well as actions; application guards alone do not prove RLS parity. |
| P2 / CMS-05 | Migration 0016 and `validation/sections.ts` include `benefits`, `offers`, `updates`; Builder creation/edit lists and `Database.page_sections` still expose only the earlier 14 types. `HomeSection` omits saved `variant`/`accent`. | Align supported types and presentation metadata only after their renderers/ownership are approved; no speculative new sections. |
| P2 / CMS-06 | Only gallery has a structured payload validator; other section content accepts any JSON object. Gallery URL validation currently requires only a nonempty string. | Define per-supported-type schemas, safe link/media rules and size limits before rendering saved content. Do not treat arbitrary JSON acceptance as proof of safe rendering. |
| P2 / R07 | Older setup/test instructions target earlier migrations. `supabase/tests/rls-checks.sql` assumes seed counts and privileged role simulation. Migration 0016 contains conditional data updates/seeds despite its additive description. | Verify applied migration history and explicitly review data effects. Do not blindly run old setup, demo seed, or privileged RLS script against the existing project. |

## 2. Recommended repair sequence and approval gates

### A — Small source-only reliability repair (recommended first)

Requires owner approval to implement; does not require changing the public composition or schema.

- Correct Builder guidance to distinguish **stored successfully** from **rendered on public Home** until integration actually ships. Show load errors separately from a genuinely empty list.
- Return `AdminMutationResult` for quick actions and reuse `AdminActionForm`; keep save/create redirects and framework redirect control flow intact.
- Report unauthorized/invalid/missing-row/read/write failures explicitly; confirm returned row IDs before reporting success or refreshing caches. Keep database persistence and cache-refresh failure separate: a committed write must not be relabeled as an unsaved record, and public synchronization must not be guaranteed if refresh failed.
- Validate the intended page scope for Builder operations. Edit/save currently look up by ID without `page='home'`; confirm whether About/Team gallery editing relies on this before narrowing shared behavior. Do not silently make those rows uneditable.
- Preserve editor Save behavior that omits publication status from the payload. Do not loosen the dedicated publish guard to make tests pass.
- Add focused failure/feedback tests without attempting a large generic CMS rewrite. Do not describe clearer reorder errors as an atomicity fix; CMS-03 stays open until step C.

Likely files: `src/lib/admin/builder-actions.ts`, `src/app/ajadmin/home/page.tsx`, narrowly related edit-page guidance, new focused Builder result tests. Existing `AdminActionForm`/`mutation-result.ts` should be reused, not duplicated.

### B — Read-only existing-project reconciliation

Blocked until renewed owner authorization for configuration/access and a narrowly approved data scope. No secrets are requested or generated by this plan.

Collect securely, without committing credentials, private records or raw dumps:

1. Applied migration versions plus actual definitions, constraints, indexes, grants, RLS policies and triggers for `page_sections` and `ai_methods`; include dependencies on profiles, role helpers and audit functions.
2. An owner-approved inventory of Home section IDs/types/order/status/visibility/variant/accent and sanitized payload shapes, including duplicates, malformed content and unsupported types. Review About/Team gallery use too.
3. Approved staff/client test sessions and reversible record scope; separate read-only inspection approval from permission to create/update/delete fixtures.
4. Owner-approved snapshot/backup and rollback procedure before any future schema/data mutation.

A sanitized schema-only export can support design review without reconnecting credentials. It does not replace authenticated end-to-end testing. Summarize differences; do not switch Supabase projects or copy production data into a replacement database.

### C — Reconcile schema, policies and ordering

Requires reviewed schema diff and separate migration approval. Author new migrations only after B; leave 0001–0016 history untouched. Select the next unused migration identifier at implementation time.

**AI Methods contract:** current app expects UUID `id`; required `title`, `url`; nullable `description`, `image_url`; boolean `is_active`; integer `sort_order`; nullable profile actor IDs; creation/update timestamps. This is an application requirement, not proof of the hosted table's shape or defaults.

- If table absent: propose a minimal additive definition with appropriate keys/indexes, RLS/grants and compatible actor/audit triggers. If present: reconcile only verified differences; `CREATE TABLE IF NOT EXISTS` alone does not repair drift.
- Public/ordinary client reads must expose only active resources and never permit writes. Authorized staff access must match the agreed capability model. `is_active` is the current publication switch; do not invent a new draft/status workflow or soft-delete contract without approval.
- Keep HTTPS validation and current `/ai-methods` route. The public projection deliberately does not render `image_url`; saving that optional field is not currently a broken image pipeline. Image rendering would be a separate UI decision.
- Review actual nulls/invalid URLs/order ties before adding stricter constraints. Do not truncate values, seed fake resources, or rewrite existing records automatically.

**Builder ordering:** prefer one narrow transaction/RPC which validates Home membership, locks the relevant rows/order scope consistently, checks stale expectations, and swaps both values atomically. Define deterministic tie handling without an unsolicited bulk renumber. A failed second write must roll back the first. Restrict function execution appropriately; never grant a service-role-style write path to public callers. Caller authorization remains mandatory, and supplied actor IDs cannot be trusted on a public RPC. Do not expand this into a generic arbitrary-table SQL function.

**Publication boundary:** settle whether editors may modify content/visibility/order already live, separately from status transitions. Then enforce the approved behavior consistently through actions and direct database access. Avoid a simplistic `status='draft'` policy that silently breaks the existing approved editor content-edit workflow. No permission changes are authorized now.

### D — Connect Home Builder without redesigning Home

Requires B plus owner approval of an explicit CURRENT → PROPOSED → REASON → RISK ledger. Recommended direction: retain the exact accepted layout and components by default; introduce a small server-side section resolver/renderer only for approved, typed CMS controls. Do not enable takeover merely because one legacy draft row exists.

Preservation map to review:

| Existing Home surface | Candidate Builder mapping / constraint |
|---|---|
| HomeHero, TrustStrip | `hero`, `trust_strip`; preserve H1, anchor IDs and current content unless edits are approved. |
| Conditional Launch Benefits | `benefits`; retain `launch_benefits` as the data source, avoid duplicated content ownership. |
| Services intro + ServiceJourney | `services_overview` as one coordinated group, retaining real service data and links. |
| PlatformsShowcase + FeaturedProjects | `platforms`, `featured_projects`; keep wrappers/styles and real public-data filtering. |
| DeliveryProcess | `process`; keep all stages and motion/reduced-motion behavior. |
| Ownership/support section | No current matching type; preserve as an explicit fixed section, not an accidental omission. |
| Industries, TechCapabilities, WhyUs | Corresponding existing types; preserve sequence and copy. |
| Testimonials, Team | Existing types; retain real-data/empty-state behavior. |
| BlogPreviewSection | No current matching type; preserve as fixed content unless a new type is separately approved. |
| Final project CTA | `cta`; preserve both destinations and motion. |
| Gallery, FAQ, Offers, Updates | Do not insert automatically; renderer, safe content and placement need explicit approval. |

Decisions required before enabling:

- Is the Builder authoritative for the whole section list or only overrides at fixed slots? The recommendation is fixed-slot opt-in initially; unrestricted reorder is a later explicit layout decision, not implicitly removed functionality.
- What happens when a slot is missing, all managed rows are hidden/draft, rows duplicate a type, or data is invalid/unavailable? Decide and test each state separately. The current unused loader returns `[]` for existing all-hidden rows but defaults on errors/empty tables; its built-in default list does not preserve all accepted Home surfaces.
- How are variant/accent applied without reviving obsolete styling? Supported options must have real renderers before controls promise them.
- How does managed-mode activation happen without publishing drafts or hiding fixed content? Record an explicit owner-approved opt-in and reversible activation procedure.

Fetch the approved public section model alongside independent home queries. Keep anonymous published/visible filtering and tagged caching (`home-sections`, `/`). Review the loader's service-role count fallback: count errors currently collapse into defaults, so they must not be treated as evidence of a truly empty table. Never expose private row content or cache user-specific results globally. Preserve metadata/JSON-LD, navbar, legal links, routes, performance and preview noindex.

Suggested focused modules only if justified: a pure section resolver with unit tests, a small server renderer around existing components, and shared supported-type schemas. No new page-builder framework or heavy client dependency.

## 3. Acceptance checklist for future implementation

| Layer | Required evidence |
|---|---|
| Source/unit | Success, denial, missing row, read/write failure, cache-refresh failure, malformed payload, supported types, preserved editor status omission, explicit boundaries and stale ordering. |
| Schema | Reviewed diff, migration rehearsal/re-run on an approved disposable environment, RLS/grant/trigger checks and retained records. Local rehearsal is not hosted verification. |
| Authenticated integration | Real staff gestures → request → confirmed row → reload → anonymous public result for save/publish/hide/show/reorder and AI activate/deactivate. Draft/private content never leaks. |
| Direct access | Approved anon/client/editor/admin/super-admin matrix using real sessions; denial and permitted writes tested independently from service-role actions. Do not use privileged role simulation as browser-auth evidence. |
| Concurrency | Two administrators, stale row/missing target, duplicate sort values and forced second-step failure; no partial swap or success on failed read. |
| Home regression | Accepted content/order/anchors/CTAs intact in unmanaged mode; each agreed managed/empty/error state tested. Phone/tablet/desktop, dark/reduced motion, keyboard and real screenshots. |
| AI public sync | Approved real resource appears with correct title/link/order after activation and disappears after deactivation; reload and cache invalidation checked. No invented testimonials/resources. |
| Quality | Full unit suite, typecheck, lint, isolated production build and relevant browser regression tests. Keep the live source dev server intact. |

## 4. Rollback and stop boundaries

- Keep each implementation slice independently reviewable; source-only feedback changes first, schema and renderer enablement separately gated.
- If integration verification fails, retain/restore the accepted fixed renderer through the reviewed application rollback. Preserve saved rows, drafts and audit history; never clear the table to force fallback.
- Additive schema should normally remain during an application rollback; dropping tables/columns or rewriting data requires separate approval and verified backup recovery.
- Record exact before/after versions and approved activation state. Use normal managed PR flow; no automatic merge, history rewrite, branch deletion or publication.
- Phase 16 stays blocked until required hosted/manual gates pass; this proposal does not waive any release blocker.

## 5. Verification performed for this plan

- Re-read the public route/composition, Builder actions/list/edit, section reader/validation, resource configuration, AI reader, database type contracts, permissions and relevant migrations (0002, 0010, 0012, 0013, 0015, 0016), plus the legacy RLS checklist.
- Fresh existing scoped tests: **11 PASS / 2 files** — `builder-authorization.test.ts` (7), `ai-methods.test.ts` (4), run in the web container. These use mocked adapters and do not prove database persistence/RLS. Existing test-runner future-config warning remains; no configuration change made.
- No new interactive feature implemented. No fresh full build, all-route scan, visual review, authenticated workflow or migration run is claimed for this documentation-only request.

**Recommended next approval:** implement step A only (truthful Builder feedback and source tests), leaving all schema and public-composition changes gated. This recommendation is not permission to start it automatically.
