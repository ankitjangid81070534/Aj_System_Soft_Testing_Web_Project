# Phase 7 evidence — 2026-09-19

See ../../PHASE_7_30_HERO.md for interpretation and limits.

- `checks-final.log`: final 469 tests, typecheck and lint.
- `build-final.log`: isolated final production build, never live `.next`.
- `source-final.json`, `production-final.json`: 33 cases each; source/proxy and isolated loopback production are separate runtimes.
- `browser-final.json`: 14 light/dark responsive cases, real CTA clicks; cancelled RSC prefetches explicitly retained.
- `browser-initial.json`: 10 initial layout/CTA passes, two strict console assertions fail on external Google report-only CSP. Also visually showed desktop decoration crossing labels; later source edit fixes that separate visual finding.
- `source-initial.json`, `production-initial.json`: 29 cases each before expanded widths/desktop clearance checks.
- `baseline-recovered.json`: historical Phase 7 pre-change geometry, not a fresh baseline. Short-tablet primary CTA overlapped the dock then.

Raw browser-test summaries omit no failed cases. Public preview origins are normalized to `[preview-origin]` in durable JSON; no credentials/data scripts/binary screenshots are committed. One-off scripts, PNGs, isolated build directories and viewer remain temporary. Live iframe gesture/health/screenshot outcomes are in the report and conversation, not conflated with independent evidence.
