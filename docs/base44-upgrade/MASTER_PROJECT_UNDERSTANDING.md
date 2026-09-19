# Master project understanding — current 30-phase baseline

## Current checkpoint — Phase 15 admin UI audit (2026-09-19)

Owner explicitly requested [Audit Phase 15](PHASE_15_30_ADMIN_UI_AUDIT.md). Documentation-only review preserves the existing admin shell, shared components, all seventeen generic resources and backend. Isolated actual-component rendering confirms missing active markers on exact non-dashboard module routes. Source findings cover drawer naming/breakpoint cleanup, uncontrolled error recovery, required-indicator/schema parity, bespoke labels/filter/table semantics, false-empty/silent outcomes, misleading Builder public-effect copy and the populated media page's server/client event-handler boundary.

Fresh 578 tests/64 files, typecheck/lint, twelve anonymous HTTP probes and four independent read-only browser cases pass at stated scope. Five isolated nav renders reproduce the active-route defect. Staff UI is unavailable without configuration; six optional values remain absent/deferred. Initial harness heading/presence-command errors corrected, not app fixes. Iframe navigation/recovery unverified; no screenshots, fresh build, private gestures or persisted-save claims. Full Phase 15 PARTIAL; recommended first implementation is bounded navigation/accessibility correctness. STOP before implementation/Phase 16. Phase 14/13/12/11/9/1 gates remain unresolved; no credentials/data/SQL/config/dependency/PR/merge/deploy changes.

## Historical checkpoint — Phase 14 auth feedback repair (2026-09-19)

Owner explicitly selected [Fix auth-form feedback](PHASE_14_30_AUTH_FEEDBACK.md). Auth forms now retain non-password entries after resolved errors, clear/re-mask passwords, guard pending retries and focus fresh feedback. Login query errors use safe local copy. Existing actions/schemas, native validation, role/session/recovery gates, consent and backend remain unchanged; account save forms are outside scope.

578 tests/64 files, type/lint/build and 13 source + 13 fresh-production browser cases pass. Three staff cases skipped per target; configured-only form is intentionally absent. Live login/retry and error-state screenshot pass at actual available width (~919px); no new app runtime errors, an older AdSense failure remains. Initial harness hydration/locator and stale production-port failures retained. Genuine hosted success, staff submission, enabled recovery and saved reload are not verified. All prior gates remain open; STOP before Phase 15. No credentials/data/SQL/config/dependency/PR/merge/deploy changes. Do not repeat implemented feedback or declined credentials.

## Historical checkpoint — Phase 14 read-only auth audit (2026-09-19)

After Phase 13 blocker disclosure and three next-scope choices, owner delegated safe judgment. Chosen [Phase 14 auth/portal audit](PHASE_14_30_AUTH_AUDIT.md) maps existing login/signup/Google/recovery/account/profile/logout without changing application code. First proposed bounded repair is non-sensitive auth-form error recovery/feedback; passwords need an explicit reset policy. Recovery provenance/origins, exact agreement identity, partial writes and logout outcomes remain separately reviewed functional risks. No UI polish before functionality acceptance.

Fresh 567 tests/62 files, typecheck/lint, eight anonymous pages and live Client Login link/password show-hide pass. Two token-free callback GETs return 307 with internal direct-probe locations retained as a finding. Initial navigate-helper failure recovered through a real link; no new screenshot/build or authenticated saving/delivery claim. Six optional values absent/deferred. Full Phase 14 PARTIAL; STOP before Phase 15. Phase 13/12/11/9/1 gates remain open, not passed by advancement. Documentation only; no credentials/data/SQL/config/PR/merge/deploy.

## Historical checkpoint — Phase 13 bounded form safety (2026-09-19)

Exact continuation implemented [contact/consultation recovery, validation and accessibility](PHASE_13_30_FORM_SAFETY.md). Keyed attempts reset action-state ownership; resolved errors retain input and focus generic feedback; pending guards, native/trim minimums and instance-specific spam IDs preserve the existing action/schema/payload/consent contracts. Quote wizard, Home/nav/auth/SEO and backend remain unchanged.

Fresh 567 tests/62 files, type/lint/build, 15 distinct source browser cases and 13 production read-only cases pass. Four genuine unconfigured error POSTs verify failure/retry retention, not persistence. Independent light form crops at 390/662/1440 reviewed; live trim-validation/focus/cleanup/runtime pass, screenshot hidden and first native-minimum helper check inconclusive. Full Phase 13 remains PARTIAL: actual save/admin readback/success-reset and all separately gated business/legal/transport decisions remain unverified. Six optional values absent/deferred. STOP before Phase 14; do not repeat the implemented slice or credentials.

## Historical checkpoint — Phase 13 form audit (2026-09-19)

After Phase 12 unfinished-gate disclosure, owner delegated safe scope; chosen [Phase 13 audit](PHASE_13_30_FORM_AUDIT.md) is read-only. Existing contact/quote/consultation actions, lead tables, consent/evidence and authorized admin read paths remain unchanged. Source identifies contact/consultation action-state reset and error-retention risks; live Contact checks confirm missing browser minimum and duplicate honeypot IDs. Recommended next slice repairs only form recovery/validation/accessibility, not business or save semantics.

Fresh 564 tests/61 files, typecheck/lint, four HTTP probes and live Contact link/fill/clear pass. Initial navigate-helper failure retained; no new screenshot/build or hosted acceptance. All six optional values remain absent/deferred. Phase 12 configuration/hosted acceptance, Phase 11 saving and earlier gates remain partial, not passed. STOP before Phase 14; next continuation resumes bounded Phase 13 implementation, without repeating this audit or credentials. Documentation only; no application/config/schema/data/deployment changes.

## Historical checkpoint — Phase 12 navigation-only hub (2026-09-19)

Exact continuation resumed the audit contract and implemented [one bounded public contact hub](PHASE_12_30_CONTACT_HUB_UI.md). It reuses already-loaded contact/global CTA settings, validates legacy targets, hides unavailable channels, avoids duplicate destinations and uses a native popover on discovery pages only. Existing forms/private/legal routes are excluded. No business persistence/admin action/schema, AI, dependency, credentials or Home/nav changes.

Fresh 564 unit tests/61 files, type/lint/isolated build and 8 source + 8 production browser cases pass. Live opening/close/focus/reopen/consultation/runtime pass; screenshot hidden. Independent 390/662/1440 light and short 662 dark visual review completed. Full Phase 12 remains PARTIAL: dedicated hub settings and hosted saved/reloaded/public effect are unverified, as are Phase 11 and earlier hosted gates. STOP before Phase 13. Do not repeat the implementation/audit or credential request.

## Historical checkpoint — Phase 12 audit only (2026-09-19)

After Phase 11 blocker disclosure, owner delegated safe next work. The chosen [Phase 12 contact-hub audit](PHASE_12_30_CONTACT_HUB_AUDIT.md) maps existing contact/global CTA settings and their full-form save/read path. Floating hub and its dedicated configuration are not implemented; AI Methods is not live chat. Do not submit a partial settings form: missing allowlisted keys become empty strings. A navigation-only first slice is proposed, with no new persistence and no claim of full admin configurability.

Fresh unchanged-source 516 tests/60 files, typecheck/lint and three HTTP probes pass. Documentation only; no new browser/visual/build or hosted-save acceptance. Phase 11 stays partial; Phase 12 implementation and Phase 13 are not started. Current status supersedes older stop notes; no credentials, SQL, data, configuration, PR, merge or deployment changes.

## Historical checkpoint — Phase 11 source-only UI / hosted acceptance blocked (2026-09-19)

Owner delegated safe credential-free implementation after rejecting setup again. [Phase 11 wizard UI](PHASE_11_30_WIZARD_UI.md) now groups the existing quote controls into four accessible steps with review/Edit, field/file retention, validation/focus and pending/error handling. One native form, unchanged action/schema/admin reader, existing multiline requirements, optional budget and explicit consent; no new columns, browser storage or backend. Six optional values remain absent and actual submit → stored/admin-reloaded brief is unverified. Prior preflight is historical, not authority to claim the wizard is still unimplemented.

Fresh 516 tests/60 files, type/lint/isolated build, 9 source browser cases and 8 production read-only cases pass. The source POST verifies genuine unconfigured failure and retained input, not saving; production POST test skipped. Live iframe step/validation/review/Edit/Back/Home gestures and runtime pass after real-link recovery. Iframe screenshot hidden; independent first-step light views at 390/662/1440 reviewed. Real success/reset, upload/email, hosted acceptance and existing integrity/legal/body-limit risks remain open. Phase 10 is last completed scoped phase; STOP before Phase 12. No secrets/SQL/data/PR/merge/deployment.

## Historical checkpoint — Phase 10 public guidance complete (2026-09-19)

See [current status](PHASE_STATUS.md) and [Phase 10](PHASE_10_30_INDUSTRIES_COMPARISON.md). Owner delegated safe continuation after the [Phase 9](PHASE_9_30_PROJECTS.md) blocker disclosure; project/admin scope remains PARTIAL, not passed. Existing Industries gains practical workflow examples and existing Services exits; five native comparison disclosures supplement—not replace—the matcher/catalogue. No industry pages, invented proof, CMS module, persistence or Home reorder. Only the new repeated-fragment shortcut needs a small client Link scroll handler.

Fresh 513 tests/59 files, type/lint/build, 35 source + 35 production browser cases and six theme/layout cases pass. Independent visible-scope phone/662px/desktop capture review completed; iframe comparison-open passes but detail transition/hidden screenshot are not proven. All six optional integrations remain absent/deferred. Existing backend/media/client/consent/date/SEO/private/release gates remain. STOP before Phase 11; no PR/merge/deployment.

## Historical checkpoint — Phase 8 complete (2026-09-19)

[PHASE_STATUS](PHASE_STATUS.md) and [Phase 8 service discovery](PHASE_8_30_SERVICE_DISCOVERY.md) supersede earlier stop gates. The existing Services hub now offers a native one-question/nine-choice matcher, intersecting editorial route guidance with public-index records, without collecting answers or adding persistence. Category counts, full card summaries and scoped Next Link fragment-history repair preserve all service readers/routes, Home order, navbar, auth and backend contracts.

Fresh 487 tests/56 files, typecheck/lint/build, 26 source + 26 production browser cases and 14 independent responsive/theme cases pass. Actual phone/tablet/desktop service captures reviewed; live iframe goal/detail-heading/return gestures are partial, final catalogue jump and hidden screenshot unverified. Initial failures retained. Six optional values remain absent/deferred; no credentials/data/SQL/config/dependency/SEO changes, PR, merge or deployment. STOP before Phase 9 pending exact continuation.

## Historical checkpoint — Phase 7 complete (2026-09-19)

[PHASE_STATUS](PHASE_STATUS.md) supersedes historical gates below. Interrupted Phase 7 is now finished; Phase 6 implementation was already in `9354b3d` while its report/status were missing. Both phase reports and evidence are now durable. No reset, repeat implementation or Phase 8 work.

Hero copy stays server-rendered/still, capability labels remain factual, and next-step guidance describes existing quote fields. Short-tablet primary CTA clearance and desktop decoration separation are scoped to the hero. Native links, shared navigation, Home order, auth, backend and data contracts are preserved. Fresh 469 tests, type/lint/build, 33 source + 33 production browser cases and 14 independent responsive/theme cases pass. Phone/tablet/desktop images independently reviewed; iframe primary/anchor gestures passed, projects retry and iframe screenshot remain unverified. Six optional values remain absent/deferred. STOP before Phase 8 until exact continuation; no PR/merge/deployment.

## Historical checkpoint — Phase 5 complete (2026-09-18)

[PHASE_STATUS](PHASE_STATUS.md) is authoritative over historical continuation gates below. Phase 4 was independently accepted, then exact continuation authorized and completed [Phase 5 public-header refinement](PHASE_5_30_HEADER_NAVIGATION.md): full phone brand, >=44px masthead targets, always-visible desktop links, honest hydration-ready dialog controls and breakpoint focus recovery. Existing navigation, CMS settings, auth/session architecture, Home order and persistence remain. No RGB edge yet; STOP before Phase 6 until the next exact continuation.

Fresh 464 tests/54 files, typecheck/zero-warning lint/build, 10 source and 10 production reusable browser cases, 24 independent responsive/theme/no-JS cases and four short-window cases pass. Independent desktop and phone/tablet light/dark captures were reviewed; no live iframe tab was available. All six optional values are still absent, with no credentials or backend mutations. Hosted/private/content/native/field-metric/release gates persist. Starting Phase 5 HEAD `996e02810a0192a40d02286e190f923c421f1534` is not its automatic completion commit.

Date: 2026-09-16 UTC / 2026-09-17 IST. Branch `initial-setup`; pre-edit commit `b566a40deb4f3e68fc0cbdfc82a534025aeaff73`. Authority: [latest full prompt](MASTER_PLAN_30_PHASES.md), [current gate](PHASE_STATUS.md). Historical understanding is preserved in [archive](archive-pre-30-phase/MASTER_PROJECT_UNDERSTANDING.md).

## Scope and evidence

All **658 tracked files** were read for SHA-256/size inventory; **285 TS/TSX/CSS source modules** indexed for imports and literal table/bucket references. Critical composition, auth/data boundaries, actions, CMS configuration, SEO, motion, tests and deployment guidance were inspected alongside existing detailed audits. This is repository-wide ingestion, **not a claim of exhaustive manual line-by-line security review**. [Inventory](evidence/phase0-30/inventory.json) includes all 39 page patterns, three handlers and 39 exported actions across ten modules.

## Actual architecture

| Layer | Existing implementation |
|---|---|
| Runtime | Node 22 in Docker; `website/` bind-mounted at `/app`; Next dev/Turbopack on 0.0.0.0:3000, not a production image |
| Application | Next 16.3.3 App Router, React 19.2.8, TypeScript 5.9.3; server-first pages with client islands |
| Presentation | Tailwind 4, CSS Modules, self-hosted Geist, Lucide, existing Framer Motion navbar lamp; shared UI in `website/src/components/ui` |
| Existing backend | **Supabase Postgres + Auth + Storage**; Next Server Actions, server readers and auth handlers; optional Resend notification delivery |
| Local fallback | Public service/article copy and honest empty/setup states; no replacement business database |
| Validation/security | Zod, capability allowlists, cookie sessions, proxy + action/route checks; service-role clients server-only; RLS for ordinary clients |
| Deployment | Existing Vercel-compatible Next app; website README/Netlify hints retained. This Base44 branch is not published |
| Tests | Vitest 415 tests/51 files; TypeScript/ESLint; three reusable Playwright navigation tests |

**The editing workflow is not connected to Supabase, but the repository already uses it.** Preserve that architecture; do not migrate to a different project or require a new connection for public preview. All six recorded optional integration names are absent in both managed file and running process. No placeholder/secret was generated or requested; owner deferral is respected. Data-dependent success remains blocked rather than faked.

## Source map and data paths

- `src/app/layout.tsx`: fonts, theme preference, AdSense, global CSS, reveal/scene/surface observers. `src/app/(public)/layout.tsx`: settings/navigation/growth reads and public frame.
- `src/app/(public)/page.tsx`: parallel home/settings/benefits reads, existing metadata/JSON-LD, fixed `HomeExperience`. It **does not invoke `getHomeSections`**. Preserve accepted content before future Builder integration.
- `src/lib/supabase/`: anonymous public client, cookie-bound server/browser clients, privileged server-only admin client. Privileged writes need explicit caller capability checks; RLS alone is not enough.
- `src/lib/admin/resources.ts` + `actions.ts` + `crud.ts`: 17 configured CMS resources, allowlisted validation, existing mutation results and cache refresh. Separate Builder/settings/media/users/agreements/leads modules remain.
- `LeadForms` → lead Server Actions → validation/spam/consent → existing Postgres rows/private attachments → optional agreement evidence/email. Contact, quote and consultation exist. At baseline quote was not a wizard; Phase 11 now progressively enhances that **single native form** into four steps while preserving optional budget and the same action/schema.
- `AuthForms`/portal actions → existing Supabase Auth/session/profile. `/auth/callback` exchanges codes; `/auth/confirm` verifies tokens. Actual portal is `/account`, not a new `/portal` page.
- Roles: super_admin/admin/editor/client. Editor cannot be silently upgraded. Publication/visibility and effective hosted RLS require deeper Phase 1 review.
- Sixteen SQL migrations (0001–0016) and storage policies are committed; applied hosted versions are unknown. No migrations/seeds/backups/restores/data writes were run. `ai_methods` resource exists without committed table creation; remote absence is NOT proved.
- Browser storage only remembers theme and announcement/offer dismissal frequency; **not business persistence**.

## Accepted public experience to retain

Home: requirement-led hero → trust → conditional launch benefits → services/journey → platforms/real projects → delivery process → ownership/support → industries/technology/why-us → genuine reviews/team → articles → final project/contact CTA. Conditional empty data is not permission to invent proof.

Desktop: compact one-row navbar from 1024px, visible left company name, eight central destinations, existing search/login/project action and legal links. Mobile/tablet: brand masthead and one bottom Home/Services/More/Projects/Contact dock. Existing search keyboard handling and legal links must survive.

Reveal-once content, reduced motion, native scrolling and no-JS visibility are existing work. Keep CSS-first decoration; old reports are not permission to rebuild the homepage. The new RGB-edge/contact hub/matcher/wizard/AI agent are future gated work, not Phase 0 changes.

## SEO and performance

Metadata, canonical helpers, noindex private/preview rules, robots/sitemap/RSS and factual schema already exist. This sandbox uses localhost canonical and deliberate noindex, not production SEO settings. Owner-domain read-only probe is separate from deployment validation. Existing 5,000-candidate CSV already has 5,000 unique normalized queries (en 1680, hi 1660, hi-Latn 1660); preserve it and reassess only in new Phase 26, not regenerate now.

[Performance](PERFORMANCE_BASELINE.md) records fresh **unthrottled loopback** numbers; no field INP/CWV, real backend latency, ranking or production speed claim. Root AdSense load failure was observed in the user preview, not fixed or hidden.

## Phase 1 update (2026-09-18)

[Current data/save audit](PHASE_1_30_DATA_SAVE_AUDIT.md) traces 39 actions/10 modules and every generic resource, without a backend connection or migration. Offers/announcements Save publication checks now use the existence of a status field rather than quick-action visibility, closing a reproduced editor bypass. Existing editor content edits/drafts and admin publishing remain allowed; direct hosted RLS publication enforcement is **not** established. New tests: 16 permission regressions; full suite now 431 tests/52 files. Typecheck, lint, isolated build and three navigation tests pass. Twenty anonymous route/redirect checks are not saved-record verification.

Other newly documented risks include blog timestamp-order mismatch, global action body limit versus advertised upload sizes, partial multi-step saves, missing affected-row confirmation, consent-version timing and audit attribution. No redesign, new business database, SQL, real data writes or credentials. Live source dev and all prior approved UI remain intact.

## Phase 2 update (2026-09-18)

The interrupted benchmark is now complete as **planning only**: [three professional IA references](PHASE_2_30_BENCHMARKS.md), [eight buyer journeys, friction and no-change contract](PHASE_2_30_CUSTOMER_JOURNEYS.md). All eight perspectives reach existing relevant services and quote; service context is not carried into the form. Optional budget is preserved. Unconfigured direct contacts, agreement and real portfolio evidence remain distinct data/operational gates, not permission to invent content. No source or persistence changes.

Recovered same-day evidence records 32 source-dev service-to-quote gestures, four contact inspections, four corrected empty-portfolio exits and three existing navigation tests (the latter checks reused isolated Phase 1 production). Fresh resumed 431 tests/52 files, typecheck and lint pass. Initial harness results retained; live iframe navigation/real-link retry failed to complete, so no iframe or visual sign-off. No fresh build or successful submitted/saved enquiry claimed.

## Phase 3 update (2026-09-18)

[Current Home inventory and hierarchy proposal](PHASE_3_30_HOMEPAGE_PLAN.md) maps fifteen content units plus the shared shell, including the extra footer CTA. Current recommendation retains benefits early, proposes industries before delivery and technology before ownership, and preserves all other useful content. This is not an enacted reorder or approval of the older program's plan. Compact help/preparation and Home-only footer CTA compaction remain separately gated proposals; benefit eligibility wording needs owner confirmation. No code refactor, routes, data or configuration changed.

Fresh 431 tests/52 files, typecheck, lint and ten anonymous destination HTTP checks pass. Live Home document at 662x580 contains thirteen section elements (services has two, projects/reviews/team absent), with no captured runtime errors or failed requests. Screenshot failed iframe_hidden; no visual/responsive/gesture sign-off or fresh production build claimed. Six optional integration values remain absent. Builder activation and all hosted save/release gates remain blocked.

## Phase 4 checkpoint (2026-09-18)

[Design-system foundation](PHASE_4_30_DESIGN_SYSTEM.md) is implemented and locally tested: shared action semantic accents/dimensions, violet primary icon, readable action line-height, softer icon elevation, 3px shared card lift, theme-aware field shadows and native forced-colors treatment. Existing identity, type scale, geometry, component APIs, Home order/content, routes and business/persistence logic remain. No new dependencies, data, configuration or TSX implementation.

Fresh 460 tests/53 files, typecheck/lint/build, three navigation tests, eight service→quote/field journeys and ten focus/motion/forced-colors/no-JS cases pass. Four routes at four widths in two themes give 32 before/after source-dev cases, clean runtime and preserved sampled geometry/content. Corrected image-decoded production screenshot comparison differs by at most 0.833%; initial image-unsettled login comparisons are retained, not treated as application regressions.

**Live-preview acceptance remains pending:** screenshot hidden, click evaluation timeout, and three new Next client writable-stream errors despite a mounted quote page without failed requests/overlay. Independent browsers did not reproduce the errors; no live runtime repair or human visual sign-off claimed. Six optional integration values remain absent; all hosted save/RLS/release gates persist.

## Continuation

See [route/features](ROUTE_FEATURE_MATRIX.md), [admin](ADMIN_FEATURE_MATRIX.md), [regression](REGRESSION_BASELINE.md), [SEO](SEO_BASELINE.md), [design](DESIGN_BASELINE.md), [decisions](DECISIONS.md), [risks](RISKS.md). **Phase 15 admin UI audit is complete at read-only scope; full Phase 15 remains PARTIAL. STOP before implementation and Phase 16. Phase 14 auth feedback, Phase 13 form safety, Phase 12 navigation-only hub and Phase 11 source-only wizard remain implemented with their acceptance gates open.** Read the Phase 15 audit on next continuation and approve a bounded implementation or acceptance scope, not another identical audit or credential request. Earlier checkpoints are historical and superseded by current status. Phase 9 remains partial; continuation did not complete hosted checks. Current live Home order remains unchanged; material moves require separate approval. No PR, merge, production mutation or deployment.
