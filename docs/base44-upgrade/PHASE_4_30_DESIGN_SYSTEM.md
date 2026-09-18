# Phase 4 — Design system foundation

2026-09-18 UTC. **Implementation and local regression complete; live-preview visual/runtime acceptance PENDING. Do not advance automatically.** Authorized by the new `START NEXT PHASE SAFELY` after Phase 3. Pre-edit commit: `9c348a82577b2b417334a2edb88922ff84898ab4`, branch `initial-setup`.

## Scope and preservation

The existing design foundation is already substantial. This phase refines it rather than introducing a second system or replacing approved typography/layout. Read the current 0–29 master, Phase 3 movement ledger, decisions and risks; the previous program's Phase 3 foundation is existing implementation, not a new completion claim. Next's installed CSS guide was reviewed: preserve root import order and distinguish global recipes from page-specific modules.

No Home reordering, content/claim edits, route/anchor changes, header redesign, new CTA animation, new feature, business logic, permission, schema, persistence, dependencies, environment or security configuration changes. Header/shared controls inherit the updated foundation, but their geometry and navigation behavior remain. Home Builder remains disconnected. No remote data writes, SQL, submissions, authentication bypass, credential requests or generated placeholders.

## Foundation decisions and implemented delta

| Area | Existing foundation retained | Phase 4 work |
|---|---|---|
| Color | Existing violet identity, blue links/focus, semantic success/danger and neutral text pairs; light action faces in both themes | Primary action icon accent now violet (`#6d28d9` / `#dfcaff`) rather than cyan-blue. Primary/secondary/success/danger/quiet action pairs centralized in `foundation-tokens.css`; existing non-primary values preserved. Not a whole-site palette replacement. |
| Typography | Geist, display/card/label/body scales, heading semantics, root font size | Action line-height moves from 1.3 to a shared 1.4. Existing sampled control heights/widths remain unchanged. No hero/title wrapping rewrite. |
| Spacing and radii | Card/field/pill radii, card padding, control padding and layout breakpoints | Shared control minimum heights, icon dimensions/padding/radii and action gap now named tokens, preserving effective dimensions. Mobile minimum remains 44 CSS px at default root size; desktop compact variants remain compact. |
| Shadows/elevation | Neutral form surfaces, existing display-card accents and local card-dependent shadow resolution | Replace colored action-icon outer glow with bounded neutral elevation. Shared surface hover lift reduces 4→3px. No blur on icon/text, pointer loop, canvas, animation dependency or glow added. |
| Buttons/cards | Native button/link APIs, disabled/loading behavior, hrefs and explicit variants | CSS recipe refactor only. Remove an overridden 380ms action-duration/11px-radius/weight rule from `surface-system.css`; existing action stylesheet remains authoritative. No TSX implementation changes. |
| Fields | Native validation, error/focus/disabled state and 16px phone input safeguard | Light/dark resting field shadow consolidated into a theme-aware token; field geometry and semantics unchanged. |
| Focus/accessibility | Existing 3px focus outline, 4px offset and neutral-theme contrast contracts | Add native forced-colors action/icon face, boundary and focus treatment using system colors; do not opt out of browser color adjustment. |
| Motion | 220ms control, 320ms surface, reveal-once, native scroll, no-JS and reduced-motion fallbacks | Preserve reduced-motion zero-lift/no-active-transform rules. No new interaction or entrance choreography. Phase 6 RGB-edge and Phase 24 motion work remain gated. |

Refactoring is deliberately small: three existing CSS files and one new focused test file, not a new component framework. Existing global card positional accents are retained, not retrospectively relabeled semantic; broader card/icon work belongs to Phase 23.

## Verification and evidence

All durable outputs are under `evidence/phase4-30/`; one-off scripts and PNGs remain container `/tmp`, not committed binaries.

- **Baseline:** 431 tests/52 files, typecheck and lint pass.
- **After:** 460 tests/53 files (29 new foundation/variant-size tests), typecheck and lint pass. New tests complement existing contrast/component contracts, not a full accessibility certification.
- **Fresh isolated production build PASS** in `/tmp/aj-phase4-production`; port 3104 is loopback-only for tests. Live source-mounted development remains port 3000. An initial build command used the wrong working directory and did not run; corrected absolute compose path built successfully. No app change was needed for that command error.
- **Source-dev public-proxy baseline and after:** Home, Services, Contact and Login at 390/662/820/1440 × light/dark = 32 cases per run. No captured page errors, failed same-origin requests or document overflow. All sampled headings, main-link text/hrefs, section order, nav styles/geometry and main-action width/height remain equal.
- **Eight real service→detail→quote and field-fill journeys PASS** across those widths/themes. Requirement field accepts input; budget remains optional. Contexts discarded without submission. This proves navigation/editability, not saving.
- **Three reusable navigation tests PASS** on fresh production: populated search opens, first Escape closes and restores focus at 1024/1440; mobile More→Privacy navigates and closes.
- **Eight keyboard/forced-colors/motion cases PASS** at four widths × normal/reduced motion. Real Tab/Shift+Tab restores the action's visible 3px solid outline; forced colors removes gradient while preserving solid outline. Reduced-motion card hover remains untransformed. Normal-motion computed action duration is 220ms. Plus **two no-JS Home→quote gestures PASS** at 390/1440; no captured production page errors.

### Screenshot comparison: results and limits

Initial source-dev captures waited for headings/fonts, not visible-image decoding. Login light captures differed by up to 8.69%; **these are retained as inconclusive initial image comparisons**, not presented as a design defect/fix. The screenshot harness was corrected to decode visible images before capture.

For the corrected comparison, the existing isolated Phase 1 production source was compared against the new Phase 4 production source: the only `src` differences are the three edited stylesheets and new test file. Both sides then captured the same 32 route/width/theme cases with reduced motion, loaded fonts and decoded visible images. All dimensions, headings, links, section order, sampled nav styles/geometry and control sizes match; no overflow. Pixel channel-delta >12 affects at most **0.833%** of each viewport. This bounds the change, **not human visual approval** or a full-page screenshot audit. It does not cover populated private CMS/real media, native device settings or every below-fold interaction.

### Live user preview: acceptance still pending

Before edits, live `/` at 662×580 had two main children and no captured errors/failed requests/overlay. Screenshot returned `iframe_hidden`; it was not retried. After edits, the live enquiry-click check timed out. A subsequent passive diagnostic found `/request-quote` mounted, two main children, no failed requests/overlay/open dialogs, but three **new Next client writable-stream close/write TypeErrors** were buffered. The timed-out call does **not** count as a verified gesture. Independent fresh dev and production browser runs did not reproduce those errors; their cause is not established. No speculative auth/security/runtime patch or service restart was made to conceal them. **Live-preview runtime and visual sign-off are NOT passed; no stream-error fix is claimed.**

## Retained gates and safe stop

Six optional integration values are still absent from both managed file and process. Public fallback renders; hosted auth/CRUD/RLS/uploads/email and saved-record/public-effect verification remain blocked. No performance/CWV/conversion improvement or production deployment claim. No new JS application code/dependency was added, but that alone is not a performance measurement.

**Phase 4 is implemented/local-test complete, not fully accepted.** Preserve this checkpoint and finish live-preview runtime/visual review before declaring full phase completion. Phase 5 Responsive Brand Header + Navigation is **not started** and requires its own new continuation after the Phase 4 acceptance gate. Material Home moves/claims, integrations, policy/data changes, PR, merge and deployment remain separately gated. The baseline hash is not the automatic end-of-turn commit.
