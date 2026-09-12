# Phase 4 — navigation, hero and primary conversion UX

Date: 2026-09-12. Starting HEAD: `0e9f0a14dd05f34b750fafbf96ce90a774321372`. Branch: `upgrade-desktop-navbar`.

**Phase 4 complete; STOPPED before Phase 5.** Authorized by `START NEXT PHASE SAFELY`, then explicitly continued with `CONTINUE SAFLY PHASE 4`. Phase 1 remains incomplete/deferred; this is frontend completion, not release or integration sign-off.

## Scope delivered

- Extracted the existing hero into server-rendered `HomeHero.tsx` and a focused CSS Module, shared by Home and `/design-preview`.
- Preserved the exact heading, descriptive paragraph, availability statement, three delivery points and all three link destinations. Added explicit existing service families: websites/web apps, desktop software, ERP/CRM/POS, industry software and API integrations. These are capabilities supported by the existing service taxonomy, not fabricated client/project proof.
- Made the enquiry CTA visually dominant, retained the secondary Projects action, improved copy readability and provided at least 44px targets. Service discovery is now a readable inline link rather than a tiny bottom-positioned cue.
- Kept decorative artwork; reserved space below the copy on phone/tablet to prevent overlap. Current 919px light/dark layouts were specifically reviewed. No new images, dependencies, animation loop, route or data model.
- Preserved the accepted compact desktop navbar, brand, all eight centered destinations, labels, CMS-supplied CTA behavior, and phone/tablet dock geometry. Existing Next Link routing and active-state logic already met the phase requirements and were not rewritten.
- Added accurate signed-out portal disclosure attributes and a named dialog relationship. Authenticated account controls do not claim to open a dialog.
- Found and repaired actual lost focus after portal dismissal: cleanup now restores the connected, visible invoking element. Desktop Client Login and mobile/tablet More return focus after Escape. Authentication/session logic is unchanged.

## Verification

### Automated source checks

- **PASS: 30 test files / 232 tests**, including 22 new hero and navigation contracts.
- **PASS: typecheck and lint.**
- **PASS: final default production build** in an isolated source/dependency copy. Live development `.next` was never replaced. This is not a deployment; optional webpack baseline issues are not represented as fixed.
- **PASS: whitespace and source-scope checks.** No navigation stylesheet, database, Server Action, schema, secret, configuration or dependency change.

### Independent real-browser journeys — 15/15 pass

The preview bridge returned **No browser tab available** despite current-route/viewport context. These are independent Chromium/Playwright checks against the running cloned source, NOT checks in the user's authenticated iframe. Every journey drove real click/fill/keyboard gestures and asserted the result; no handlers, React state setters or auth bypasses were used.

| Interaction | Assertion / result |
|---|---|
| Eight desktop navigation destinations | Correct route, rendered heading and current-link state for each — PASS |
| Hero Start Your Project + Explore Projects, 390/919/1214 | Quote route with form; Projects route with real current content — PASS (3 checks) |
| Hero keyboard navigation and activation | Tab/Shift+Tab, visible 3px focus outline, Enter reaches quote — PASS |
| Explore what we build, 320/919 | Native hash jump; services heading visible — PASS (2 checks) |
| Desktop portal | Opens, accurate expanded/controls state, Escape closes, trigger regains focus — PASS |
| Phone/tablet More → portal, 390/919 | One modal at a time, Escape closes, More regains focus — PASS (2 checks) |
| Desktop search | Ctrl+K, empty search state, one-result filtering, Services click routes and closes menu — PASS |
| Header Start Project, 390/919/1214 | Existing quote destination and form — PASS (3 checks) |
| Theme + hover | Real toggle and reload persist dark; primary light/hover/dark backgrounds remain distinct — PASS |

No application/business mutation requests or page exceptions were observed in the final journeys. An earlier rerun caught existing AdSense POST pings; the checker was corrected to record that exact external telemetry endpoint separately, not misclassify it as an application write. Ads/analytics were not changed or blocked. An initial theme test used the wrong label and was corrected to the actual `Toggle color theme` label; no app fix is claimed for that test correction.

The real portal focus failure **did** require the source cleanup fix before it passed. Hero link layout and artwork spacing were also corrected before final screenshots/build.

### Layout and preservation

- Eight final captures: 320×740, 390×844, 768×1024, 919×1024 light/dark, 1214×900 light/dark, and 1440×1000.
- All eight: no horizontal overflow or page exceptions; every hero action is at least 44px high; both primary/secondary conversion actions are above the fold and clear of the dock.
- Six exact before/after comparisons: all non-hero homepage text and links, heading, hero destinations and navigation rectangles preserved. No homepage section was removed or reordered.
- Navigation remains 1182×64 at 1214; 362×84 at 390; 470×93.1875 at 768. The newly requested 919 view has current captures, not an invented before screenshot.
- Tablet light/dark and final phone/small-phone screenshots were visually reviewed independently. Desktop before/after was reviewed during implementation; final desktop captures retained.
- At 320×740, supplementary hero content/service discovery needs scrolling; both conversion actions remain visible, and the service-link gesture is verified. Do not claim the entire hero fits every initial viewport.
- Selected primary text/hover contrast contracts pass AA. This is not a full-site accessibility certification, field performance/INP measurement or measured conversion uplift. Phase 4 asset-size deltas were not measured.

## Deferred / unverified — unchanged

- Real successful authentication, role-gated admin/account journeys, hosted RLS/CRUD/storage, persisted lead submission, notifications/recovery email, hosted schema and configured redirects.
- Existing Home Builder/public composition mismatch and Phase 1 risks remain unresolved.
- In-iframe verification in the user's session was unavailable. Independent browser success must not be relabeled as that verification.
- App is not published. No PR, merge, deployment, production migration, new secrets, database write or external-service substitution was performed.
- The owner previously declined Supabase/Resend configuration. Do not repeat prompts or generate substitutes without renewed authorization.

## Evidence and next gate

See [screenshots](evidence/phase-4/SCREENSHOTS.md), [journey results](evidence/phase-4/browser-results.json), [preservation results](evidence/phase-4/preservation.json), and test/typecheck/lint/build logs in that directory. One-off runner scripts remain in `/tmp`, not the repository.

Next is Phase 5 only after fresh owner authorization. The Phase 2 material movement ledger remains a proposal: approval to start another phase does not silently approve removing content, changing URLs, or those material moves. Preserve the accepted navigation and all deferred Phase 1 gates.
