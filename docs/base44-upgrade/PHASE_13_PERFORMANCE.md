# Phase 13 — performance / Core Web Vitals

Date: 2026-09-13. Starting HEAD: `9f4dfb9d96` (full SHA in evidence). Owner authorized **“continue”** after the Phase 12 checkpoint and stale-error check. Scope: Phase 13 only; **navbar work remains excluded**. No publication or remote data writes authorized/performed.

## Delivered changes

1. **Precise blog queries:** replace `*` with only the inputs used by the teaser/detail mappers, plus the existing category relation. Keep `content` because posts without stored reading minutes still calculate the same value. Detail reads retain both `author_id` and `created_by`. All projected fields exist in the checked-in schema/types; no migration is required.
2. **Independent requests run together:** start article and recent-public-post reads together; after a post resolves, start tags and authorship together. Post-dependent reads still wait for the post. Publication filters, public/server/admin-client boundaries, draft preview, author fallback, empty/error behavior and genuine 404 handling are preserved.
3. **Lazy below-fold galleries:** About/Team galleries no longer force their first three images eager. Native lazy loading keeps images near the viewport eligible for fetching; content, alt text, captions and reserved 4:3 geometry are unchanged.
4. **Bounded image size hints:** gallery, homepage blog previews and project teaser images now cap the declared display slot at 384px once their 1216px maximum-width containers reach their three-column limit. The browser still selects an appropriate high-DPR source. No image files, frame CSS, aspect ratios, priority flags, links or content were removed.
5. **Focused tests:** new query projection/concurrency/access fallback tests, article scheduling/404 tests and responsive-image prop/frame tests. Fixtures are test-only; no public records or fallback content were populated.

No new runtime dependencies or client components were required. Changes affect five existing runtime files and three focused test files, not navbar/layout/CSS/auth/schema/config.

## Audit decisions: preserve what already works

| Area | Finding and decision |
|---|---|
| Actual LCP | All 18 measured homepage loads identified `h1#home-hero-title`, not an image/video. It is server-rendered with no animation gate; live inspection confirms opacity 1 and animation `none`. Do not preload unrelated imagery or add a fake hero asset. |
| Fonts | One self-hosted Geist font request per measured run. Existing variable font and fallback are retained; no blocking external font stylesheet was introduced. |
| Images | Existing Next image configuration already supports AVIF/WebP, responsive source sets and reserved frames. Improve delivery hints only; no visual redesign or image replacement. Optional CMS image end-to-end verification remains unavailable without real published media. |
| JavaScript | Homepage/server sections are already server components with client interaction islands. Measured first-party encoded script bytes are effectively unchanged (~364 kB). Navbar motion/portal/search code is explicitly outside this phase; no functionality or dependency was deleted to make a score look better. |
| Public data | Homepage/layout already use parallel request groups. Retain existing request-scoped caching, revalidation and permission boundaries; optimize the specific article waterfalls instead. |
| Database indexes | Checked-in blog migrations already index publication, feature, category and author paths. No live query plans or configured database were available; do not invent additional indexes or claim remote latency/RLS validation. |
| Third parties | Existing AdSense is asynchronous and appears exactly once in each measured DOM. It was not removed, delayed into a different integration contract, blocked during benchmarks or duplicated. Auth/analytics/security configuration is unchanged. |

## Reproducible local measurement conditions

Baseline was the existing isolated Phase 12 production build; its `src` directory was confirmed identical to the starting source. The new version was copied and built separately under `/tmp/phase13-build`. Neither production build replaced the source-mounted dev server on port 3000.

- Independent Chromium; production Next server on a temporary container-loopback port.
- Cold browser cache; CPU slowdown 4×; latency 40ms; download 200,000 bytes/sec; upload 100,000 bytes/sec.
- Three runs per width at **390, 919, 1440px**, 900px height, both before and after.
- Observe for five seconds after the load event. Third-party requests remain enabled in both groups.
- Record LCP candidates, session-window CLS, navigation timing, resource sizes and long tasks. The excess-over-50ms long-task sum is **not INP and not Lighthouse TBT**.

| Width | Before LCP median | After LCP median | Before / after CLS median |
|---|---:|---:|---:|
| 390 | 1.608s | 1.536s | 0.002366 / 0.002366 |
| 919 | 1.600s | 1.616s | 0.003845 / 0.003845 |
| 1440 | 1.692s | 1.772s | 0.003789 / 0.003789 |

**Interpretation:** timings are mixed, including a higher desktop LCP and long-task sum after the changes; no causal homepage speedup or bundle reduction is claimed. CLS is unchanged. This small, non-interleaved sandbox sample with live third parties is not a field-CWV sign-off. The deterministic changes mainly benefit configured CMS queries and CMS media, which are absent here; local fallback-home measurements cannot measure their real-world savings. No real INP dataset, CrUX/Search Console access, published URL or production p75 measurement exists.

Raw results: [before](evidence/phase13-before-lab.json), [after](evidence/phase13-after-lab.json), [verification summary](evidence/phase13-verification.json), [production routes](evidence/phase13-production.json).

## Verification and interaction status

- **403 tests / 48 files PASS**, typecheck PASS, lint PASS, isolated production build PASS, whitespace PASS.
- Mocked concurrency tests hold both responses unresolved until both requests start; original sequential behavior would fail. Tests retain stored/calculated reading time, anonymous filters, staff draft preview, creator fallback, optional lookup failures and 404 behavior.
- Six production-built service/article pages return HTTP 200, contain the existing Phase 12 content server-side, and keep one H1 plus preview noindex.
- All 18 homepage lab runs: HTTP 200, zero page errors, no measured horizontal overflow, no H1 animation and one AdSense script.
- **Live iframe PASS:** real footer blog link → article card; new contents anchor → matching fragment; body service link → expected service/FAQ; FAQ open → correct answer → close; home link → hero. These had `performed: true` plus their result assertions in one script.
- Projects destination was reached through its real link and unique heading wait. The final helper omitted `performed` in its serialized result, so it is not counted as a separately proven gesture-completion assertion.
- No errors after completed edits, failed module requests or error overlay; the application root/main is nonempty. A duplicate `authorName` existed briefly between targeted edits around 06:00:40 UTC; the final source removed it at 06:00:43 UTC, before passing tests/build. Do not mistake that historical log for a current compilation error.
- Baseline tablet hero and post-change homepage footer screenshots were reviewed. The final hero capture was blocked by the preview-call budget, so **complete before/after visual sign-off is not claimed**. No CSS/class/frame markup changed. Optional CMS image rendering remains unit-tested, not live-data visually verified.
- The preview `navigate()` helper changed the URL without rendering the target once; real site links recovered navigation. No router workaround or security bypass was added to the app.

## Remaining gates and stop

Supabase URL/anon key are absent in this sandbox. Query tests use isolated unit fixtures, not authenticated or remote database verification. Prior Phase 1/8/9 private gates remain deferred. Field performance, real CMS media savings, remote query latency/RLS and complete visual review remain release checks; no ranking, production-performance or deployment guarantee is made.

**Phase 13 scoped code optimization and local measurement complete. STOP before Phase 14 — responsive/all-screen-size audit — until the owner authorizes continuation.** Do not resume navbar changes automatically. Use the standing managed PR workflow; no manual commit/push, branch switch, direct main edit or merge.
