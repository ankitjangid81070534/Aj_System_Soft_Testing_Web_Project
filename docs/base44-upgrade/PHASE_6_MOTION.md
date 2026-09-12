# Phase 6 — premium motion and scroll safety

Date: 2026-09-12. Starting HEAD: `5eacef7c794b1ff3eeaa71da2cb9484511467b8b`. Branch: `upgrade-desktop-navbar`.

**COMPLETE; STOPPED before Phase 7.** Owner authorization: `continue next phase safly`. Current homepage order, accepted navbar/hero layout, content, routes and business behavior remain preserved. Material reordering was not approved.

## Changes

- Added finite, transform-only hero text/action layers. The H1 is never hidden; focused hero controls stop moving. Phone entrances are shorter and the existing stage-change cue uses a small translation rather than a large perspective flight.
- Preserved existing hero settle/orbit, decorative depth, fine-pointer tilt, card stagger, heading reveals, CTA entrances and native desktop storytelling. No added engine or dependency.
- Nested desktop words retain their movement but do not add a second opacity fade inside an already-revealing block. Phones let that parent own the entrance, reducing simultaneous word effects.
- Reveal targets are still consumed once per mounted element. Focus cancels an animating ancestor; hiding the document cancels active entrances without rearming them.
- Added a tested event-driven frame scheduler. Scene/header geometry reads are batched before writes; dark-section lookups are cached between registrations. Decorative loops pause while hidden and stop when settled. Mutation registrations are coalesced rather than repeatedly scanning in the same frame.
- Native horizontal service storytelling remains on sufficiently tall screens; below 760px height, phones, reduced motion and no-JS retain readable stacked scenes. This specifically protects the current **919×499** preview. Resize/restoration snaps to the correct scene instead of flying through preceding panels; reduced-motion changes clear old transform/progress state.
- Keyboard testing found an actual nested-scroll conflict: the stage's `overflow: hidden` acquired a native `scrollLeft` in addition to the transformed track, placing a focused link offscreen. Changed it to `overflow: clip` and synchronized keyboard scene positioning immediately. Real Tab and Shift+Tab now keep the focused links in view.
- No wheel/touch interception, pointer capture, content deletion, new project/review/team records, backend/auth/schema/secret changes, PR, merge or deployment.

## Final verification

| Check | Result |
|---|---|
| Regression suite | **33 files / 260 tests PASS**; scheduler behavior and motion safety contracts added |
| Typecheck / lint / whitespace | PASS |
| Default production build | PASS, isolated copy; live dev build untouched |
| Phone 390×844 | Three complete native-wheel top→bottom→top cycles; 44 sampled scroll steps each |
| Small phone 320×740 | Three complete cycles; 56 sampled scroll steps each |
| Current tablet 919×499 | Three complete cycles; 56 sampled scroll steps each |
| Nine-cycle assertions | No restarted reveal animations on cycles 2/3, no unconsumed reveal targets after traversal, no hidden reveal text or horizontal overflow; returned to top every time |
| Tall tablet / desktop | Native wheel advances horizontal scene progress; reduced-motion preference clears state and stacks content |
| Short desktop / live resize | Stacked at 1440×600; tall→short transition succeeds |
| Reduced-motion tablet | Stacked, readable content |
| No JavaScript | H1 visible and all six service links present |
| Keyboard scene navigation | Real Tab to scene 1 and Shift+Tab to scene 0: focused links visible; forward progress ≈0.5 |
| Existing journeys | **21/21 PASS** at 390/919/1440, plus three runtime/business-write guards |
| Baseline preservation | **4/4 exact comparisons PASS** against final Phase 5: text, headings, links, section sequence, settled hero/nav rectangles; no page errors/overflow |

Existing journey checks include service discovery/detail links, five delivery buttons and Enter selection, ownership services link, final quote/consultation actions, article link and theme toggle/close. Forms were not submitted. Existing external AdSense telemetry is classified separately; no application mutation was observed.

### Live iframe and visual evidence

- PASS in the actual preview: Services navigation → Home, correct short-screen stacked mode, hero service anchor/hash, six service links, delivery selection/description update and restoration to Discovery.
- A temporary missing-CSS import error occurred while the new module was being created. Subsequent native route navigation refreshed the retained development effect; the fresh route shows the correct mode. No new errors/failed requests or overlay were seen in successful fresh-route checks. The final preview check returned no errors at all; the initial transient error is documented here rather than hidden.
- In-iframe screenshot capture remains **unavailable** (`iframe_hidden`). Independent Chromium captures of phone/tablet hero and short-screen services were reviewed; they are not claimed as live-iframe screenshots. A stale cached gallery response was rejected and a uniquely named gallery path used for the current images.
- The 499px-high viewport requires scrolling; preserved fixed navigation can overlap content at a particular screenshot scroll position. No claim that every hero action fits above the fold at this height.
- Browser instrumentation checks behavior, not field FPS/INP/CrUX or conversion uplift. No whole-site AA certification. Existing CSS ambient artwork is retained; this phase does not claim every CSS animation is suspended offscreen.

The initial browser checker sampled mode before hydration and, separately, began a progress assertion at the end of a scene. Those checks were corrected to wait for readiness/start from the section beginning. The real keyboard visibility failure required the CSS fix described above. All final recorded runs are after that fix.

## Deferred gates / next phase

Phase 1 remains **INCOMPLETE / DEFERRED**: actual hosted auth, admin/client role success, RLS/CRUD/storage, lead persistence/email, hosted schema/history, configured redirects and Home Builder composition are not certified by this UI phase. The rejected Supabase/Resend setup is unchanged. Conditional project/review/team data was not fabricated for motion demos.

The app remains unpublished. Stop before Phase 7 (inner public pages) until fresh owner authorization. Accepted navigation, content/URLs and the still-unapproved movement ledger remain protected.

Evidence: [index](evidence/phase-6/SCREENSHOTS.md), [scroll cycles](evidence/phase-6/scroll-results.json), [keyboard](evidence/phase-6/focus.json), [journeys](evidence/phase-6/browser-results.json), [preservation](evidence/phase-6/preservation.json). One-off runners remain in `/tmp`.
