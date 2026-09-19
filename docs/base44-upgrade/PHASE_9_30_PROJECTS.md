# Phase 9 — Projects / Case-study Experience

Date: 2026-09-19 UTC. Authorized by exact `START NEXT PHASE SAFELY` after Phase 8. Starting HEAD `9cbe0a12158c9dc4751e943c093fe573ae5246e0`, branch `system-upgrade`.

**Public presentation/source checkpoint complete; full Phase 9 remains PARTIAL / BACKEND-DEPENDENT. STOP before Phase 10.** No invented projects, new persistence, credential request, database write, migration, PR or deployment.

## Existing system and safe scope

The repository already has `/projects`, shareable platform/industry filters, `/projects/[slug]`, featured/related cards, case-study sections and the generic Projects admin resource. Reuse them rather than create a second portfolio. The current preview has no configured backend or public project records. That is not proof that the owner's production portfolio is empty.

### Admin / persistence audit

| Requirement | Existing source | Disposition |
|---|---|---|
| Title, slug, summary, industry, platform, problem, solution, features, technologies | `RESOURCES.projects` → ResourceForm → `upsertResourceAction` → existing `projects` table | EXISTS; write/reload/public-effect remains unverified |
| Draft/published, active/public, featured, order | Existing fields/actions; public reader uses published + active + public predicates | Preserved; mock query contracts are not hosted RLS verification |
| Client identity | `projects.client_id` and separate clients `public_permission` exist; reader resolves permitted names | Generic project form does not expose client assignment; do not infer permission or invent identity |
| Screenshots/gallery | `project_media` schema and ordered reader exist | No project-specific gallery writer in the generic form; media upload indexes `media_assets`, not `project_media` |
| Cover / standalone video | Existing project URL fields | Preserved; repaired standalone-video presentation dependency on gallery rows |
| Consent / publication approval evidence | Visibility booleans and separate client permission exist | These are not an explicit project-consent evidence workflow; owner/schema review needed |
| Publication date | `project_year`, created/updated timestamps exist | No project `published_at` in inspected type/initial schema or generic fields; do not substitute creation date or run SQL |
| SEO | SEO title/description/OG fields exist in generic project resource | Detail reader/metadata currently use name/summary, not those override fields; recorded parity gap, not changed in this presentation phase |
| Draft preview | Staff detail reader supports it; generic Preview control is published-only | Existing mismatch retained as a scoped admin follow-up, not permission to change auth |

No admin save was attempted. FORM → HANDLER → PERSISTENCE → RESPONSE → RELOAD → PUBLIC EFFECT remains blocked by previously deferred credentials and approved records/sessions. Existing non-atomic reorder, RLS, upload and content/operational gates persist. No dummy records or credentials were used to conceal these gaps.

## Changes

1. Projects empty state now says **“No public case studies yet”**, without asserting that case studies are actively being prepared. Existing services/contact exits and final project CTA remain. A missing client identity now reads **“Not publicly listed”**, rather than inventing a specific confidentiality request.
2. Project cards retain the same media, image loading hints, native single link, featured/status indicators and surfaces. Summaries remain fully readable, supplied metadata uses compact labelled-list chips without orphan separators, and linked cards say **“Read case study”**. No invented metrics, clients or proof. The shared card also affects its existing Home/related consumers when real records exist; Home composition remains unchanged.
3. Project filters now retain a clear-filter escape for stale query parameters even if the current portfolio has no facets. Clear filters is a >=44px native link outside the result status, within a labelled navigation region. Selected-chip toggling now matches the existing case-insensitive selection/filter semantics.
4. Extracted `ProjectGallery` from the detail page. A supplied walkthrough link now renders even without screenshot rows; no-media still renders nothing. Clips are labelled as media rather than screenshots, use existing shared Button/new-tab protections, do not auto-play/embed, and reveal delays are capped. No new client state, animation loop, package or data contract.

## Reproduction and verification

Before repair, the new focused tests recorded **5 failed / 7 passed**: full-summary/action expectation, orphan separator, missing empty-facet escape, missing filter landmark, and case-mismatched selected-chip toggle. The standalone-video defect was established by source nesting; the new isolated presentation test confirms video-only rendering. It was not reproduced against a real hosted project.

| Check | Fresh result |
|---|---|
| Unit suite | **502 tests / 58 files PASS**, 15 additional tests covering presentation/filter/reader contracts |
| Typecheck / lint / whitespace | PASS |
| Isolated production build | PASS; `/tmp/aj-phase9-production`, loopback 3111; live source `.next` untouched |
| Source public-proxy browser suite | **25/25 PASS**: 15 project cases + 10 existing navigation/header cases |
| Isolated production browser suite | **25/25 PASS**, same cases |
| Independent responsive/theme/keyboard matrix | **14/14 PASS** at 320, 390, 662, 820, 919, 1024, 1440 widths; light/normal and dark/reduced motion |
| Independent browser health | No console/page errors or non-cancelled same-origin failures; 14 cancelled requests recorded separately |
| Visual review | Actual 390×844 light, 662×580 dark and 1440×900 light empty-portfolio captures reviewed; desktop capture displayed half-scale in temporary viewer |
| Source runtime | Existing source-mounted Next dev healthy, external-host projects HTTP 200; six optional integration names absent in file/process |

### Interaction ledger

- **PASS:** stale-filter Clear filters click → `/projects` without query → no filter bar; reload retains the cleared URL. Independent keyboard Enter and no-JS phone/desktop equivalents pass.
- **PASS:** Browse services → Services H1; Contact us → contact form; browser Back restores Projects. Tested at six responsive sizes in both source and isolated production.
- **PASS:** Projects final Start Your Project → request-quote form; actual theme-control gestures and closed-dialog checks across the independent matrix. No submission or saved lead claimed.
- **PASS, partial iframe scope:** actual Projects navigation → expected H1/empty state; Browse services → expected Services H1/path; return to Projects. Initial navigate helper changed only URL and failed; corrected with real site links. One tool call used an unsupported locator option, then was corrected, not an app bug.
- **UNIT/SOURCE ONLY, real-record gestures UNVERIFIED:** case-insensitive populated chip toggle, project card → real detail, video/gallery outbound clicks, actual CMS image/long-content layouts. No approved records exist here to exercise these; test fixtures stay inside unit tests, not the app/backend.
- **BLOCKED:** authenticated create/update/publish/deactivate/media/consent/reload/public-effect verification; no persistence claim.
- **Iframe screenshot UNVERIFIED:** `iframe_hidden`. Independent screenshots are not an iframe visual pass. Runtime buffer held historical Phase 8 tag-edit errors and a transient Phase 9 filter opening/closing-tag edit error; both files were corrected before final passing checks, with no failed requests/overlay/empty main in the later iframe check. No owner-browser repair claimed.

## Limits and next gate

The fixed mobile dock still requires native scrolling on short windows; the 390px capture shows the lower empty-state edge near the dock, while real link gestures pass. No whole-site accessibility/native-device/zoom, field CWV, conversion or performance-speedup claim. Empty state review cannot certify populated cards/detail galleries.

Evidence: [verification.json](evidence/phase9-30/verification.json). One-off scripts, builds, browser output directories and PNGs remain in `/tmp`; temporary screenshot viewer stopped after review. Source-dev remains on port 3000. All auth/data/cache/security/SEO configuration and admin handlers are preserved; only the filter URL helper changed in the data module.

**STOP at this Phase 9 checkpoint.** Phase 10 — Industries + Solution Comparison — is not started. Do not silently call the full project/admin system complete: either close the documented existing-backend/content gates with separately approved access, or obtain explicit owner acceptance to carry them forward before advancing. Respect credential deferral; do not re-prompt or generate replacements. PR/merge/release and material Home moves remain separately gated.
