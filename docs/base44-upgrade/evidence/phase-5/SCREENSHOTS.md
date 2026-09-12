# Phase 5 — section evidence

Date: 2026-09-12. Before source HEAD: `389ae9d4cbda91d2afe7597e61de4afa04fffdf2`.

All images are independent Chromium screenshots of actual source-rendered sections, captured with reduced motion. They are **not screenshots from the user's iframe**: that tool reported `iframe_hidden`. A temporary gallery was used to inspect the images, then stopped. Gallery titles are not app content.

## Tablet comparisons — 919×1024 browser viewport

| Section / theme | Before | Final |
|---|---|---|
| Platforms — light | [Before](before/tablet-platforms.png) | [Final](after/tablet-platforms.png) |
| Platforms — dark | [Before](before/tablet-dark-platforms.png) | [Final](after/tablet-dark-platforms.png) |
| Industries — light | [Before](before/tablet-industries.png) | [Final](after/tablet-industries.png) |
| Industries — dark | [Before](before/tablet-dark-industries.png) | [Final](after/tablet-dark-industries.png) |
| Technology — light | [Before](before/tablet-technology.png) | [Final](after/tablet-technology.png) |
| Technology — dark | [Before](before/tablet-dark-technology.png) | [Final](after/tablet-dark-technology.png) |
| Principles — light | [Before](before/tablet-principles.png) | [Final](after/tablet-principles.png) |
| Principles — dark | [Before](before/tablet-dark-principles.png) | [Final](after/tablet-dark-principles.png) |

## Additional final captures

| Section | Phone — 390px | Desktop — 1440px |
|---|---|---|
| Platforms | [Final](after/phone-platforms.png) | [Final](after/desktop-platforms.png) |
| Industries | [Final](after/phone-industries.png) | [Final](after/desktop-industries.png) |
| Delivery | [Final](after/phone-delivery.png) | [Final](after/desktop-delivery.png) |

Element screenshots can include the fixed nav at the capture scroll position. They do not imply that every section/control fits one phone viewport; five delivery-button gestures and keyboard selection were verified independently. Tablet light/dark sections, desktop platforms and phone industries/delivery received visual review.

## Machine evidence

- [Baseline](baseline.json) / [current](current.json): complete accessible text, headings, link list, section sequence and hero/nav rectangles at 390, 919, 1440 and dark 919.
- [Preservation assertions](preservation.json): all four comparisons pass; no horizontal overflow/page exceptions.
- [Browser results](browser-results.json): 21 real-gesture journeys plus three runtime/business-write guards pass. External AdSense telemetry is separated from business writes; no ads integration changes.
- [Extra checks](extra.json): 320px layout, desktop normal/reduced motion, service-copy containment and real wheel-triggered delivery progression.
- [Public proxy](public-preview.json): actual public-preview service-link navigation passes, then clean Home response/structure.
- [245 tests](tests.txt), [typecheck](typecheck.txt), [lint](lint.txt), [isolated production build](build.txt).

The live iframe's final health check also passed (no console errors/failed requests/overlay; two main children; Home hero present; zero dialogs). In-iframe screenshot and journey attempts are not counted as visual/interaction passes. Hosted authentication, persistence/email and release checks remain deferred; see the [phase report](../../PHASE_5_HOMEPAGE_SECTIONS.md).
