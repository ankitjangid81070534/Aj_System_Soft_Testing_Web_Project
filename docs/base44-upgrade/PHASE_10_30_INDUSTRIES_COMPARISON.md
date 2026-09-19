# Phase 10 — Industries + Solution Comparison

Date: 2026-09-19 UTC. Starting HEAD `bab198501f1aeb8368802258a620d70d1082dacd`, branch `system-upgrade`.

**Complete at public guidance/UI scope. STOP before Phase 11.** After being shown the Phase 9 blockers and continuation choices, the owner delegated the decision: “AAPKE HISAB SE CONTIUEN KRO OK”. Proceed with this independent public phase while carrying Phase 9 forward as PARTIAL, not passing or waiving its backend/consent/media gates. No credentials, connection, schema, records, PR, merge or deployment were authorized or attempted.

## Audit and scope

- Industries already exists on Home (and the shared design preview), with eight editorial capability tiles. There is no `/industries` page. Preserve all eight labels, icons, section order, styling, native scrolling and existing shared shell; do not create doorway pages or a second industry CMS.
- Existing service matcher helps select a goal, but does not compare trade-offs. Existing service copy/FAQs support the five comparisons requested in the master plan. A compact native helper on `/services` is useful and needs no business persistence.
- Industry examples are workflow discussion starters, not client work, regulatory certification or guaranteed packaged scope. Healthcare/privacy/integration requirements still need explicit project review.
- Related links intersect editorial slugs with `getServicesIndex()` results. CMS names remain authoritative; unavailable or renamed slugs are not guessed or resurrected by importing fallback records. Existing reader/fallback semantics are untouched.

## Implementation

1. `Industries`: eight semantic headings with short practical workflow examples. Separate explanatory text distinguishes capability examples from completed work/compliance. Two >=44px links lead to existing service matcher/comparison fragments. Tiles remain descriptive, not fake links. No Home reorder.
2. `SolutionComparison` plus focused editorial module: Website vs Web App; SaaS vs Internal Tool; Mobile App vs Responsive Web App; ERP vs CRM; Custom vs Off-the-shelf. Each has two “Useful when” / “Plan for” descriptions and an “Ask first” prompt. No price, deadline, universal winner or unsupported outcome promise.
3. Five server-rendered native `details`/`summary` disclosures share a name for single-open behavior. Stack on small viewports, paired columns from the existing md breakpoint. No custom state, storage, animation, API call or package. Existing public service links plus a quote-form exit; honest text when no related public service exists.
4. Existing Services hero adds an explicit comparison shortcut, without removing matcher/categories/catalogue/CTA. No new route or metadata/schema changes.
5. Reproduced repeated-fragment issue: after Back to `/services#solution-comparison`, clicking the same hero shortcut left the new section offscreen in five responsive cases. `SectionJumpLink` keeps Next Link/router history and native no-JS href; a minimal client click handler scrolls only for an already-current fragment and an unmodified primary click. No router override, preventDefault, timers or state. Scoped to the new shortcut; existing matcher is unchanged.

## Verification

| Check | Fresh result |
|---|---|
| Full unit suite | **513 tests / 59 files PASS** (11 added tests) |
| Typecheck, lint, whitespace | PASS |
| Isolated production build | PASS — `/tmp/aj-phase10-production`, port 3112 inside web container; source dev `.next` untouched |
| Source/public-proxy browser suite | **35/35 PASS** — new comparison cases plus existing service/header/navigation coverage |
| Isolated-production browser suite | **35/35 PASS**, same suite |
| Independent theme/layout matrix | **6/6 PASS** — 390×844, 662×580, 1440×900, light/normal + actual dark-control/reduced-motion |
| Matrix health | No console/page errors or non-cancelled same-origin failures; cancellations retained separately in JSON |
| Visual review | Reviewed actual phone light, 662px dark and desktop light captures of both changed sections via temporary image viewer; desktop displayed half-scale |
| Live source health | Healthy source-mounted Next dev, external-host `/services` HTTP 200; all six optional integration names absent in managed file/process |

### Interaction ledger

- **PASS, independent source and production:** Home industries → comparison; Home industries → matcher; Services shortcut → comparison, including repeated same-fragment click after Back.
- **PASS:** all five comparisons open and replace prior open choice; native collapse; keyboard Enter/Space, focus → related link; no-JS related ERP link at 390/1440.
- **PASS:** Website comparison → real Website service heading; Back → comparison content; Discuss your workflow → visible quote form; browser Back. Existing service catalogue/detail/quote journeys and header/navigation regression pass too.
- **PASS, independent matrix:** actual theme toggle/closed-dialog assertions; eight industry tiles with no local horizontal overflow, no document overflow, comparison summaries >=44px at sampled sizes. No form submitted; persistence is not claimed.
- **Partial iframe only:** actual Services navigation and comparison-open click/assertion pass with no captured errors/failed requests/overlay and populated main. Initial navigate helper changed only URL. Final related-link click was performed, but its heading helper matched while returned path was still `/services`; do NOT count that as a verified detail transition. Independent suites supply that evidence.
- **Iframe screenshot UNVERIFIED:** `iframe_hidden`; no retry or healthy-service restart. Independent capture review is not user-iframe visual acceptance. No temporary dialog left open.

### Initial findings retained

- Initial full suite: 512 pass / 1 failure. Historical Home preservation test prohibited every anchor in Industries; updated to require two explicit new section exits while still forbidding clickable tile wrappers/buttons. This is a changed requirement, not an app regression.
- Initial source suite: 29 pass / 6 fail. Five new same-fragment scrolling failures reproduced the app issue above; repaired, then all nine focused cases and full source/production suites passed.
- Sixth failure was an existing catalogue test's two consecutive Back calls (`ERR_ABORTED`). Added destination heading/catalogue waits between Back gestures; no application change attributed to that harness correction.

## Limits / next gate

Phase 9 gallery/client assignment, consent evidence, publication date/SEO parity and real-record/admin persistence checks remain open. Phase 1 RLS/atomicity and all existing hosted/auth/upload/email/legal/content/native-device/release gates remain. No fake work, schema or business database. Comparison editorial content is source-managed, not a new admin-save claim. Unknown service slugs retain normal catalogue access but no inferred related recommendation.

The fixed dock can cross tall element screenshots; native scrolling is still needed, and real control gestures passed. Only the visible capture portions were human-reviewed; six full element captures per section remain temporary, not full-site visual/accessibility certification. No field CWV, speedup, conversion or production-release claim.

Evidence: [verification.json](evidence/phase10-30/verification.json) and associated logs/matrix. One-off scripts, production copy and PNGs stay in `/tmp`; screenshot viewer stopped. Compose/environment unchanged. Stop here; Phase 11 — Project Requirement Wizard — requires a new continuation and an existing-persistence contract before any save feature.
