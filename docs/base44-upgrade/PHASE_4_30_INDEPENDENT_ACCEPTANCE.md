# Phase 4 — independent acceptance closure

2026-09-18 UTC. Starting branch `system-upgrade`, clean HEAD `eeeab3f4dc10538cc5caa2a5b037dcdb5dada333`.

## Decision

After being offered a wider live preview, independent desktop review, or explicit deferral, the owner delegated the safe/professional choice. Chose **independent desktop review**, not a waiver of testing. This replaces the unavailable desktop-editor capture as the acceptance method; it does not claim that the editor iframe resized successfully.

**Phase 4 design-foundation scope is accepted.** Combine the original implementation/regression evidence, the prior successful tablet/mobile live-preview reviews and gestures, and the fresh desktop visuals/clean-context checks below. This is not full-site production, authenticated backend, or every-device sign-off. Phase 5 is next, NOT implemented in this acceptance turn; stop for the next exact continuation.

## Fresh visual review

`fetch_website` screenshot captures of the current source-dev public preview origin produced separate **1920×1080 image canvases** for Home and `/request-quote`, visible in the conversation and reviewed directly. These are independent browser captures, not editor-iframe screenshots and not production URLs.

- Home: desktop brand, eight navigation labels, legal links, login/search/CTA, two-line headline, primary/secondary controls and value strip are visible without clipping in the reviewed viewport. Existing decorative orbit art remains; no new styling or hero rework was performed.
- Quote: desktop header and breadcrumb, heading/description and two-column form layout are visible; field labels, boundaries and controls remain legible and aligned.
- Scope is the visible desktop viewport, not every below-fold section or private populated CMS. These new light-theme images complement the original regression comparisons and previous tablet/mobile reviews; they do not establish a new dark-theme visual review.

## Fresh clean-browser runtime and real gestures

The existing Playwright package was used with Chromium installed only inside the running development container. No application dependency, lockfile, compose or source changes. Test script remained in `/tmp`. No extensions, user cookies, authentication state, route interception, security bypass or suppressed errors. Requests used the current public preview origin so the existing development allowlist remained intact.

Final matrix: **1024, 1440, 1920 CSS px × light/normal motion and explicitly selected dark/reduced motion**, height 900. Six new contexts; dark selected through the real Appearance control and verified after reload. Each records actual viewport dimensions and uses real gestures with destination/state assertions.

| Check | Result |
|---|---|
| Home initial HTTP response and heading | 6/6 pass, HTTP 200 |
| Scroll response / navigation readiness | 6/6 pass |
| Search click → fill privacy → visible matching link → Escape → closed dialog and restored focus | 6/6 pass |
| Start Project click → quote URL → visible form | 6/6 pass |
| Full-name fill → matching value → clear, without submission | 6/6 pass |
| Home click → Home URL and heading | 6/6 pass |
| Theme toggle → dark class → reload retains dark | 3/3 dark scenarios pass |
| Home and quote document overflow | None in all six scenarios |
| Initial-load/navigation console errors, page errors, HTTP errors, failed requests | Empty in final six scenarios |
| `bis_size` attributes / open dialogs at recorded Home and quote states | Zero |

Evidence: `evidence/phase4-30/independent-acceptance-final.json`.

### Initial harness limitation retained

The first run passed all three normal-motion contexts but attempted search after only heading/font readiness in reduced-motion contexts; those clicks did not expose the search field before timeout. Heading/font readiness does not prove navigation hydration. The corrected harness first observes the navigation's existing `data-scrolled` response to real scrolling, then executes the same click/fill/Escape journey. All six pass with that readiness condition. **No application fix was made, and immediate pre-hydration response is NOT verified.** Phase 5 should retain this early-click observation when checking immediate navigation responsiveness.

The first run also only emulated an OS dark preference, which does not select this app's intentionally light-default theme. The corrected run uses the actual theme control and reload assertion. Initial results are preserved in `independent-acceptance-initial.json`, including one external Google report-only CSP/ORB failure. No ads or protections were disabled to obtain the final result.

## Tests and limits carried forward

The latest unchanged-source unit/type/lint run from the previous continuation remains **460 tests / 53 files, typecheck and lint pass**. It was not redundantly rerun here. Original isolated production build, 32-pair comparisons and accessibility/no-JS checks remain historical evidence in `PHASE_4_30_DESIGN_SYSTEM.md`, not newly run checks.

Earlier browser-injection and writable-stream warnings did not reproduce in the final clean contexts. This closes the scoped clean-browser acceptance requirement; it is not a claim that the user's extension/environment was repaired. The editor iframe's width/visibility limitation remains a tool limitation, not a source defect or reason to repeat Phase 4 indefinitely.

Existing persistence architecture, auth, permissions, routes, copy, Home ordering and design implementation are unchanged. Earlier hosted auth/save/RLS/upload/email, content/legal, private-layout, Builder and release gates remain open. No submissions, SQL, business records, credentials, PR, merge or deployment. Existing theme preference storage was tested in disposable contexts only; no new storage mechanism was created. The app remains unpublished.

## Next

**Phase 5 — Responsive Brand Header + Navigation**, only on the next `START NEXT PHASE SAFELY`. Preserve the accepted compact desktop row and existing mobile dock; audit existing brand/CTA/menu behavior before making minimal targeted refinements. Do not restart Phase 4 solely because the editor stays at tablet width. RGB moving-edge work still belongs to Phase 6.
