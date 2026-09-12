# Phase 4 screenshot evidence

Captured 2026-09-12 from the running cloned source with independent Chromium, reduced motion, and explicit viewport/theme settings. Images are lossless WebP conversions of browser screenshots. Starting source HEAD: `0e9f0a14dd05f34b750fafbf96ce90a774321372`.

These are **not screenshots from the user's iframe**: the platform preview bridge reported no browser tab. A temporary image-review surface allowed visual inspection of the independent captures and was removed afterward. Its gallery headings are not application UI.

| View | Before | Final |
|---|---|---|
| Small phone, 320×740 | [Before](before/phone-small.webp) | [Final](after/phone-small.webp) |
| Phone, 390×844 | [Before](before/phone.webp) | [Final](after/phone.webp) |
| Tablet, 768×1024 | [Before](before/tablet.webp) | [Final](after/tablet.webp) |
| Current tablet, 919×1024 | No exact-width baseline | [Final light](after/current-tablet.webp) |
| Current tablet dark, 919×1024 | No exact-width baseline | [Final dark](after/current-tablet-dark.webp) |
| Desktop, 1214×900 | [Before](before/desktop.webp) | [Final](after/desktop.webp) |
| Wide, 1440×1000 | [Before](before/wide.webp) | [Final](after/wide.webp) |
| Desktop dark, 1214×900 | [Before](before/dark.webp) | [Final](after/dark.webp) |

## Results and limits

- Final 919 light/dark and phone/small-phone layouts visually reviewed; desktop comparison reviewed during implementation. Intermediate overlap/cropping was corrected before these final captures.
- Eight final layouts have no overflow or page exceptions. Six before/after comparisons retain exact navigation geometry, all non-hero text/links, heading and conversion destinations.
- Both primary conversion actions are above the fold at every sampled size; all hero links have at least 44px target height. The smallest phone needs scrolling for supplementary content, and the discovery-link gesture is separately verified.
- No claim of authenticated iframe verification, full-site accessibility, real backend persistence or production deployment.

[Preservation assertions](preservation.json) · [Baseline observations](baseline.json) · [Current observations](current.json) · [15 passing journey checks](browser-results.json) · [Final clean source-browser health](health.json)

`telemetry-classification-initial.json` retains an earlier failed no-write assertion caused by existing external AdSense pings. The final checker records that exact telemetry endpoint separately rather than changing the app or masking application writes. See the [phase report](../../PHASE_4_NAVBAR_HERO.md) for the earlier genuine focus repair and test corrections.

Final check outputs: [232 tests](tests.txt), [typecheck](typecheck.txt), [lint](lint.txt), [isolated production build](build.txt). One-off capture/inspection scripts remain in `/tmp` and are not committed.
