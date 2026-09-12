# Phase 5 — homepage structure and section presentation

Date: 2026-09-12. Starting HEAD: `389ae9d4cbda91d2afe7597e61de4afa04fffdf2`. Branch: `upgrade-desktop-navbar`.

**COMPLETE; STOPPED before Phase 6.** The owner said `start next phase safly`, then `continue phase 5`. No explicit approval of the Phase 2 material reorder was received. This phase therefore used the ledger's permitted safe alternative: **retain the current order** and refine presentation. It does not authorize moving benefits, industries, principles or ownership later.

## Delivered

- Introduced focused `home-sections.module.css`, applied only by `HomeExperience` (Home and the existing noindex design preview). Small data attributes provide stable presentation hooks without replacing components or changing their data/interaction logic.
- Platform gallery: colored soft-3D paper surfaces, existing jewel icons, left-aligned introduction; desktop has an editorial introduction column alongside six platform cards rather than another identical full-width grid.
- Industries: compact, clearly descriptive icon tiles, all eight labels retained; one column on phones, two on tablet, four on large desktop. No fake filters or invented industry links.
- Technology: contrasting dark capability band, four readable groups and existing technology chips/marquee. Its dark presentation works in both user themes; existing motion/reduced-motion behavior is retained.
- Working principles: wider two-column reading cards with colored edge accents rather than four narrow desktop columns.
- Standardized section-heading rhythm and improved service, delivery, ownership and closing-enquiry copy sizes. Service links now have at least 44px height without changing their destinations.
- Kept conditional projects, benefits, reviews, team and article rendering, their data order/limits, descriptions, covers, metadata, links and original headings. No fabricated public records or new proof claims.

## Preserved boundaries

- Accepted navbar, mobile/tablet dock, Phase 4 hero, section sequence, route/anchor names, footer and business logic remain unchanged.
- All heading text, accessible homepage text, links and section order match the Phase 4 baseline at four before/after configurations.
- No new dependency, image, animation loop, Server Action, database/schema migration, environment change or secret request.
- Existing shared components gain attributes only; the new CSS requires the homepage root class and does not redesign inner pages.
- No PR was requested/opened, no merge/deployment performed, and the app remains unpublished. The prior unsupported assistant PR message was corrected in chat.

## Tests and checks

### Source/build

- **31 test files / 245 tests PASS** (13 new homepage contracts).
- New tests render the actual component tree to verify complete section order, optional-section absence, retained descriptions/routes/anchors, five delivery controls, no-script content and descriptive industry tiles.
- Synthetic fixtures are test-only; none were seeded into or displayed by the app.
- **Typecheck, lint, whitespace check and isolated default production build PASS.** The live development build was not overwritten. Optional historical webpack issues remain outside this result.

### Independent browser journeys

**21/21 journey checks pass across 390, 919 and 1440 widths**, plus three clean runtime/business-write guards:

| Real gesture | Post-gesture assertion |
|---|---|
| Hero service-discovery anchor → service detail link | Hash jump, ≥44px service target, correct detail route and heading |
| All five delivery buttons | Each selected state, exactly one pressed button and five distinct descriptions |
| Keyboard Enter on delivery control | Selection returns to the first stage |
| Ownership services link | Existing `/services` route |
| Closing Start Your Project | Existing `/request-quote` route with form |
| Closing Request a Consultation | Existing `/contact` route |
| Existing article card | Real currently rendered article destination and heading |
| Theme menu/toggle/close | Dark theme applied, readable platform-copy color, menu closed |

The delivery click and keyboard checks are grouped into one journey per width. No form was submitted. No application/business mutation or page exception was observed in the final suite. Existing AdSense `/pagead/ping` and `csi.gstatic.com/csi?s=pagead` telemetry are recorded separately. An initial overly broad no-write guard counted the latter as a business write; the checker was corrected, not the app or analytics.

Additional checks:
- Real mouse-wheel input changes the selected stage in the existing normal-motion desktop pinned delivery section.
- Independent browser through the **public preview proxy**, not just localhost: hero discovery → custom-software service detail passes; returning Home yields HTTP 200, nonempty main, no module failures/page exceptions, no overlay and no open dialogs.
- 320px reduced-motion and 1440px normal-motion layout checks pass with no horizontal overflow. All service copy boxes remain smaller than their containing scenes in sampled layouts.

### Visual evidence and preview-tool limits

- Four exact baseline/current comparisons: 390×844, 919×1024, 1440×1000 and 919×1024 dark. Accessible text, link sequence, heading text, section sequence and hero/nav rectangles are unchanged in all four.
- Eight tablet before/after section pairs are retained (platforms, industries, technology, principles in light/dark). Six additional current phone/desktop section captures are retained.
- Independently captured tablet light/dark sections, desktop platform composition and phone industry/delivery layouts were visually reviewed. Fixed navigation can overlap part of an element screenshot at its capture scroll position; real delivery gestures verify that controls remain reachable by scrolling.
- The live iframe's initial/final health checks pass: no console errors or failed requests, no overlay, main has two children, Home hero present, no open dialog.
- **In-iframe screenshots were unavailable** (`iframe_hidden`). Navigation helper attempts also reported delayed-content failures; an early click assertion read the old heading too soon. Those attempts are **not** claimed as passing in-iframe journey verification. Successful journey/visual evidence is explicitly from independent browsers.
- No full-site AA certification, field performance/INP claim, measured conversion uplift or Phase 5 asset-size comparison.

## Deferred gates and next phase

Phase 1 remains **INCOMPLETE / DEFERRED**. Successful hosted auth, role-gated admin/client journeys, RLS/CRUD/storage, saved lead/email delivery, schema reconciliation, configured redirects and Home Builder/public composition remain unverified or unresolved. The owner's rejection of Supabase/Resend configuration remains in force; no substitute credentials or project switches.

Phase 6 may start only after fresh owner authorization. Preserve this section order and the accepted hero/navigation; any material moves still require explicit approval. Phase 6 is motion refinement, not permission to delete content or rewrite business behavior.

Evidence: [index](evidence/phase-5/SCREENSHOTS.md), [browser checks](evidence/phase-5/browser-results.json), [preservation](evidence/phase-5/preservation.json), [extra layout/scroll checks](evidence/phase-5/extra.json), [public preview check](evidence/phase-5/public-preview.json). One-off runners remain in `/tmp`.
