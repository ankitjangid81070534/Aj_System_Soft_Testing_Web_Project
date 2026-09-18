# Phase 4 — Visible acceptance completion

2026-09-18 UTC. Starting branch `initial-setup`, HEAD `df300a37c0` (not a completion commit).

## Outcome and scope

**Phase 4 foundation work is complete at its scoped public-UI regression level.** The previously unavailable mobile visual review and live enquiry/field gestures now pass. This is not a claim that the owner's browser has a clean console, every breakpoint has a fresh visual review, or the app is release-ready. No application fix was made in this continuation. Phase 5 is not started; await a new `START NEXT PHASE SAFELY`.

Only checkpoint documentation/evidence changes this turn. No refactor is warranted by the observed external attribute injection or intermittent hidden preview. Preserve all application code, approved geometry/content, routes, actions, data/auth architecture, environment, dependencies and security. No submissions, records, SQL, credentials, restart, PR, merge or deployment.

## Fresh evidence

| Check | Result / exact scope |
|---|---|
| Live Home at 374×666 | Visible. Screenshot reviewed: legible heading/copy, sharp action icons, light header action and blue primary hero action; no horizontal clipping in the captured view. |
| Real primary enquiry click | `performed: true`; destination `/request-quote` and visible form textarea asserted in the same call. No new console errors or failed requests during the gesture; no document overflow. |
| Live quote at 374×666 | Screenshot reviewed: heading, introduction, card border and first field render legibly. This is above-fold evidence, not the whole form. |
| Requirements field | Real fill and value assertion pass; test text cleared through the UI. No submit. |
| Return Home | Real bottom Home click and mounted hero-link assertion pass in the same call; zero open dialogs, new errors or failed requests. |
| Wider Home screenshot | Tool requested `desktop` but actual viewport was **919×499**, below the app's 1024px desktop breakpoint. Reviewed as short tablet only, not desktop. The fixed dock covers part of hero CTAs at this resting scroll position; earlier geometry parity does not make this a new Phase 4 regression. Preserve as a Phase 5 short-height reachability check, not a full unobstructed-layout sign-off. |
| Extra wider live journey | Timed out. Subsequent passive check found Home mounted at 919×499, visibility `hidden`, zero dialogs/overflow/failed requests and only the same two initial errors. This additional gesture is **unverified**, not attributed to the passing mobile run. No repeated attempts or service restart. |
| Independent fresh public-proxy browser | Six Home → quote → field-fill/clear journeys: widths 374/919/1440, each with light/dark browser preferences. All pass with no injected markers, console/page errors, failed requests or document overflow. Browser preferences were requested; actual application theme was not recorded, so do not label these six cases a confirmed two-theme visual audit. |
| Quality suite | Fresh **460 tests / 53 files**, typecheck and lint pass. |
| Runtime | Existing source-mounted dev healthy; Home HTTP 200. No new production build needed for documentation-only work; prior Phase 4 build remains historical evidence. |

Independent raw results: [visible-acceptance-browser.json](evidence/phase4-30/visible-acceptance-browser.json). One-off runner and logs remain `/tmp/phase4-visible-recheck.cjs`, `/tmp/phase4-visible-browser.json`, `/tmp/phase4-visible-quality.log` on the host; runner copied into container `/tmp`. Screenshots are visible conversation evidence; tool returned no CDN URLs to archive.

## Console diagnosis and remaining limits

Initial live errors were an AdSense script-load failure and an attribute hydration warning. Reading the actual development error's component diff—not only its truncated console summary—shows extra body attributes `__processed_…__`, `bis_status` and `bis_frame_id`. These match the earlier [browser-injection diagnosis](HYDRATION_DIAGNOSIS.md). Clean independent browsers have no markers or warning. The exact injector/vendor is not established. Do not add hydration suppression, strip attributes, disable SSR/ads or weaken security.

Owner-side follow-up remains: reload in an extension-free browser profile and identify/disable the injecting extension's access to the preview. The warning has **not** been fixed in the owner's browser. Third-party ad delivery is not repaired. Neither appeared anew during the two successful mobile interaction checks.

The earlier writable-stream errors are absent from this fresh live buffer and did not recur during the successful mobile gestures or six independent journeys. This supplies the previously missing positive enquiry evidence; it **does not establish root cause or a code repair**. Keep R16 as a monitored, unreproduced historical runtime issue, not a claimed fix or a reason to rewrite unrelated code.

This scoped acceptance combines the earlier foundation unit/build/32-pair regression evidence with newly reviewed mobile/short-tablet images and live mobile gestures. It does not certify fresh desktop visuals, dark-theme visuals, below-fold completeness, native devices, authenticated CMS layouts, backend saves or production. Existing backend/RLS/consent/content/credentials/release gates remain deferred, not passed.

## Stop

Next is **Phase 5 — Responsive Brand Header + Navigation**, only on a new exact continuation. Carry forward the accepted desktop one-row geometry, mobile dock semantics, and short-height CTA reachability check. No Home content moves, RGB-edge Phase 6 work or backend activation is implicitly approved.
