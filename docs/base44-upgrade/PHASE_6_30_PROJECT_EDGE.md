# Phase 6 — RGB moving-edge primary CTA (recovered checkpoint)

Implementation: `9354b3dccf248dc3c5feece7c4492da081fa6d8f`. Work performed 2026-09-18; report/evidence recovered 2026-09-19 while finishing interrupted Phase 7. This is not a new Phase 6 execution.

## Implemented scope

Reusable server-rendered `ProjectEdge` plus scoped CSS decorates existing mobile/tablet masthead, desktop/More project links, Home hero and Home finale. Fixed masked ring contains a transform-only conic-gradient color layer; text/icons/control geometry remain still. A four-second sweep settles to a static edge; hover/focus can replay it. No perpetual JS loop, canvas, WebGL, dependency or new client state. Reduced motion keeps a static edge; forced colors remove decoration. Plain controls remain the unsupported-gradient/mask fallback (source-reviewed, not tested on legacy devices).

Links, names, CMS labels/URLs, close handlers, focus, auth and persistence are unchanged. Ordinary cards/footer/offers are not decorated. The optional admin highlight variant was not implemented; no schema/settings changes were justified in this public-CTA scope.

## Recovered evidence, not fresh claims

Conversation history and container `/tmp` records establish:
- Prior 468 unit tests, typecheck/lint, isolated production build passed.
- Final historical source and production browser reports each show 20/20 passing tests, no skips/flakes; 14/14 independent responsive/theme cases passed.
- Historical independent visual review covered phone/tablet/desktop. No available iframe tab then; no historical iframe pass.
- Early repaint-heavy implementation was replaced by the current fixed-mask, transform-only layer. Initial/stale-target/precision/repaint harness reports are retained with the recovered final reports.
- Three paired 4× CPU-throttled production samples have mixed task durations and no remaining edge animations after the bounded window. This does **not** prove no CPU cost, field CWV or a speedup. Avoid perpetual animation or an animated gradient custom property.

The current Phase 7 verification reruns the 10 project-edge browser cases on both final source and production builds; see its report for fresh totals. Historical 468-test numbers are not the current 469-test suite.

No backend writes, integration setup, migration, PR, merge or deployment. This public-CTA phase is complete at documented scope. The subsequent continuation already authorized Phase 7; current `PHASE_STATUS.md` supersedes the old unsaved Phase 5/6 gate. Recovered JSON/log evidence is under `evidence/phase6-30/`; temporary screenshots and one-off scripts remain outside Git.
