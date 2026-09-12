# Phase status — new master upgrade program

CURRENT_PHASE: 6 — PREMIUM 3D MOTION / SCROLL — COMPLETE; STOPPED
LAST_COMPLETED_PHASE: 6 — motion refinement and scroll/focus safety; Phase 1 remains INCOMPLETE / DEFERRED
NEXT_PHASE: 7 — INNER PUBLIC PAGES — only after fresh explicit authorization
LAST_COMMIT_HASH: 5eacef7c794b1ff3eeaa71da2cb9484511467b8b
PRODUCTION_STATUS: Base44 app NOT PUBLISHED. Final isolated default production build passes; no deployment or release sign-off.

The hash is the actual pre-edit HEAD for Phase 6. Base44 commits/pushes automatically at turn end; no post-turn hash is invented. Read actual Git HEAD/diff before continuing. No manual commit/push, branch switch, PR, merge or deployment.

## Owner authorization / execution gate

On 2026-09-12 the owner explicitly selected Phase 2 planning after being told Phase 1 checks would be deferred, not passed. Phase 3 was subsequently authorized and completed. `START NEXT PHASE SAFELY` authorized Phase 4, and `CONTINUE SAFLY PHASE 4` authorized finishing its checks.

The owner subsequently said `start next phase safly` and `continue phase 5`. No material-reorder approval was received, so Phase 5 retained the current order as permitted by the Phase 2 ledger. The owner then authorized Phase 6 with `continue next phase safly`. Phase 6 is complete and **STOPPED before Phase 7**. Preserve the accepted compact desktop navbar, visible left brand/eight centered links and unchanged mobile/tablet dock. Do not infer permission to replace accepted navigation, remove content, rename URLs or apply the proposed material homepage moves.

Completed: Phase 0 baseline with recorded limits, Phase 2 planning, Phase 3 presentation foundation, Phase 4 hero/conversion UX, Phase 5 homepage section presentation, Phase 6 motion/scroll refinement. Phase 1 is still incomplete/deferred. Later UI work is not a waiver of integration/release gates.

Before continuing, read this file, MASTER_PROJECT_UNDERSTANDING, REGRESSION_BASELINE, MASTER_UPGRADE_PLAN, PHASE_2_INFORMATION_ARCHITECTURE and PHASE_6_MOTION.

## Phase 6 result

See [PHASE_6_MOTION](PHASE_6_MOTION.md); prior presentation remains recorded in [PHASE_5_HOMEPAGE_SECTIONS](PHASE_5_HOMEPAGE_SECTIONS.md).

- Finite layered hero/CTA entrance; bounded phone stage cue; preserved existing artwork, depth, pointer tilt and native storytelling.
- Reveal-once ownership, no compounded word/block opacity fades, focus/visibility cancellation, batched registration and visible-scene/header reads.
- Short-height/reduced-motion stacked services, correctly synchronized restoration/resize and cleared stale progress state.
- Fixed genuine keyboard offscreen-link bug caused by a second native horizontal scroll container; Tab/Shift+Tab now keep links visible.
- No accepted layout/content/route/backend/secret changes or material reordering.

## TESTS_LAST_PHASE

- PASS: **33 files / 260 tests**, typecheck, lint, whitespace and final isolated default production build.
- PASS: **9 complete top→bottom→top cycles** (three each at 390×844, 320×740, 919×499), with no restarted entrances, unconsumed targets, hidden reveal text or overflow.
- PASS: eight independent scroll/layout/no-JS cases; desktop/tall-tablet wheel progression, reduced-motion reset and short-height stacking; real forward/backward keyboard focus.
- PASS: **21 browser journeys + 3 runtime/write guards** for preserved links, delivery controls, final actions and themes; no business writes.
- PASS: four exact final Phase 5/6 comparisons preserve text, heading/link/section order and settled hero/navbar rectangles.
- PASS: actual iframe Services→Home navigation, short-screen stacked mode, service anchor and delivery-selection/description/restoration. Final preview check has no errors, failed requests, overlay or open dialogs; the initial temporary import error is documented separately.
- VISUAL: independent phone/tablet hero and short-screen service captures reviewed. Live screenshot unavailable (`iframe_hidden`); independent captures are not labeled as iframe evidence.
- UNVERIFIED / DEFERRED: hosted auth/admin/client success, RLS/CRUD/storage, lead/email persistence, hosted schema, Home Builder composition, redirects and deployment. No field FPS/INP/conversion or whole-site AA claims.

Evidence: [report](PHASE_6_MOTION.md), [screenshots](evidence/phase-6/SCREENSHOTS.md), [cycles](evidence/phase-6/scroll-results.json), [keyboard](evidence/phase-6/focus.json), [journeys](evidence/phase-6/browser-results.json), [preservation](evidence/phase-6/preservation.json).

## KNOWN_RISKS

- The Phase 2 movement ledger materially relocates benefits/industry/principles/ownership content. It is proposed, not approved or applied. Phase 5 retained the current sequence; explicit approval is still required for any future material move.
- Home Builder does not drive the fixed public homepage (R01); unknown real saved content prevents a speculative rewrite.
- Missing committed ai_methods migration versus unknown hosted schema (R02), conditional offers/updates gaps (R03), legacy redirects and other Phase 1 findings remain unresolved.
- Some legacy hardcoded styles remain. Selected hero/token checks do not certify every surface, image, state or authenticated page.
- At 320×740 supplementary hero content needs scrolling. The current 919×499 viewport also requires scrolling around the preserved fixed dock; not all actions fit above the fold.
- Do not invent project/review/team records or present process/capability statements as independent proof.

## BLOCKERS — deferred, not passed

- Existing-project Supabase configuration and approved staff/client sessions/data scope unavailable: actual auth, roles, RLS, CMS persistence, storage and public revalidation unverified.
- Resend configuration unavailable: delivery, notifications and recovery-email success unverified.
- Hosted schema/migration history and Home Builder records unavailable: no speculative schema/composition repair authorized.
- Phase 1 authorization/publication fixes have unit/source evidence, not hosted/persistent success evidence.
- App not published; no deployed release, field INP/CrUX/Search Console or conversion data verified.

## Secret rejection — preserve

The owner declined NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, EMAIL_FROM and EMAIL_ADMIN_TO setup on 2026-09-12. Phases 4–6 did not request/generate/change secrets, switch projects or bypass auth. Do not repeat prompts or create substitutes without renewed owner authorization.

## APPROVALS_NEEDED

- Fresh authorization before starting Phase 7.
- Explicit approval before material homepage moves/removal or URL renames; planning approval is not implementation approval.
- Real data writes, destructive operations, production migrations/deployment, PR and merge need appropriate explicit authorization.
- Preserve accepted navigation/business behavior and maintain transparent deferred gates.

## FILES_CHANGED_LAST_PHASE

- `website/src/components/design-preview/{HomeExperience,HomeHero,ScrollJourney}.tsx`
- `website/src/components/design-preview/reference.module.css` — stage clips without a scroll container
- `website/src/components/design-preview/home-motion.module.css` (new)
- `website/src/components/motion/{SceneMotion.tsx,motion-utils.ts}`
- `website/src/components/motion/{frame-scheduler.ts,frame-scheduler.test.ts,motion-lifecycle.test.ts}` (new)
- `website/src/components/site/RevealObserver.tsx`
- `AGENTS.md`, `docs/base44-upgrade/{MASTER_PROJECT_UNDERSTANDING,README,PHASE_STATUS}.md`
- `docs/base44-upgrade/PHASE_6_MOTION.md`, `docs/base44-upgrade/evidence/phase-6/` (new)
