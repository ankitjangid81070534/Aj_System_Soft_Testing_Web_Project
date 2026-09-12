# Phase 6 — motion evidence

All screenshots are independent Chromium captures of the source-rendered app, not live-iframe captures. Motion behavior is established by real gestures and assertions, not still images. The hidden preview screenshot result was not counted as a visual pass.

## Captures

| View | Image |
|---|---|
| Current short tablet service scene, after keyboard/resize verification | [919px service scene](images/current-tablet-service.png) |
| Phone hero after repeated scrolling | [390px hero](images/phone-hero.png) |
| Current tablet hero after repeated scrolling | [919×499 hero](images/current-tablet-hero.png) |
| Phone platform gallery | [390px platforms](images/phone-platforms.png) |
| Current tablet platform gallery | [919px platforms](images/current-tablet-platforms.png) |
| Desktop hero | [1440px hero](images/desktop-hero.png) |
| Desktop platforms | [1440px platforms](images/desktop-platforms.png) |

The first three captures were visually reviewed through a uniquely named temporary gallery. An older cached response for a reused gallery URL was rejected. The temporary gallery is stopped after verification. Fixed dock overlap in a capture is a scroll-position effect, not evidence that every control fits above the fold; the 499px-high view requires scrolling. Accepted settled hero/nav geometry matches the Phase 5 baseline.

## Checks

- [Scroll results](scroll-results.json): three complete top→bottom→top cycles each at 390×844, 320×740 and 919×499 (nine total); tall/short desktop, tall/reduced tablet and no-JS cases. All pass after the final fix.
- [Keyboard result](focus.json): real Tab/Shift+Tab between horizontal scenes, with the focused link visible. The original failure was a nested native scrollLeft, fixed in source before this passing run.
- [Existing journeys](browser-results.json): 21 real-gesture journeys and three runtime/business-write guards pass. No form submissions or business mutations; existing external ad telemetry remains separate.
- [Preservation](preservation.json) / [current measurements](current.json): four exact final comparisons against [Phase 5 current measurements](../phase-5/current.json), covering text, links, headings, section order and settled hero/nav rectangles.
- [260 tests](tests.txt), [typecheck](typecheck.txt), [lint](lint.txt), [isolated production build](build.txt).

Actual live-preview gesture checks separately passed Services→Home navigation, short-height stacked mode, the hero service anchor, delivery selection/description and restoration. The initial transient import error is documented in the phase report; the final preview check returned no errors or failed requests. In-iframe screenshot capture was unavailable. No field performance/AA/integration/release certification is implied; see the [phase report](../../PHASE_6_MOTION.md).
