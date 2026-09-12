# Performance baseline — Phase 0

Source `421447d827a2f5ec60acd2cc05e830b3acbbc92f`. See [raw samples](evidence/performance.json).

## Method and limits

- Next default production build, isolated server on container loopback 3100; warm server, fresh browser context each run. No CPU/network throttling. Normal motion. Three samples per template/viewport. Five-second observation window after load.
- These are diagnostic lab numbers, not Lighthouse scores, field Core Web Vitals or real-device/production network claims. Supabase is absent, so no real query waterfall/TTFB impact was measured.
- LCP is the latest observed candidate; CLS is observed shift sum in that window. INP field data is unavailable. `observedBlockingMs` is summed long-task excess above 50ms in the observation window, **not standardized Lighthouse TBT**. JS transfer uses Resource Timing, so cross-origin resources without timing access and later loads may be undercounted. No detailed JS execution trace was taken.

## Median of three runs

| Template | Viewport | LCP ms | CLS | TTFB ms | JS transfer KiB | JS encoded KiB | Observed blocking ms | Load ms |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `/` | 1214×900 | 448.0 | 0.0000 | 13.1 | 609.9 | 605.2 | 45.0 | 955.4 |
| `/` | 390×844 | 196.0 | 0.0000 | 6.2 | 609.8 | 605.1 | 7.0 | 741.7 |
| `/services` | 390×844 | 168.0 | 0.0000 | 6.4 | 610.9 | 605.9 | 0.0 | 646.4 |
| `/contact` | 390×844 | 148.0 | 0.0000 | 17.8 | 609.8 | 605.1 | 0.0 | 613.3 |

## Repository/runtime facts and budgets

- Development Home curl: HTTP 200, 356,835 response bytes, warm TTFB ~217ms for the recorded probe. Do not compare dev compilation/HMR output with production transfer numbers.
- Shared root ships theme bootstrap, AdSense, reveal/scene/surface motion. Navbar Framer Motion is already installed; no new dependencies were added in this phase.
- Images: Next AVIF/WebP config and remote allowlists; self-hosted Geist via the package. Raw resource counts/transfers are retained in evidence. Real uploaded media weight and third-party delivery remain unknown.
- CSS-first artwork rather than WebGL is the current preferred approach. Root scroll/pointer observers and public data fetches should be measured before adding motion.
- No field INP, Search Console/CrUX, trace-based JS execution, distributed TTFB, mobile CPU/network-throttled score or real CMS query timing was available; do not mark those targets passed.
- Later targets remain LCP ≤2.5s, CLS ≤0.1, field INP ≤200ms on representative users. Low loopback samples do not prove those targets.
- Require same-template before/after runs and no content removal to manufacture speed. Phase 13 must obtain realistic mobile conditions and identify the true LCP element before optimization.

## Build baseline

- `npm run typecheck`, `npm run lint`, `npm test`: pass.
- `NODE_ENV=production npm run build` in isolated directory with copied dependencies: pass (default Turbopack, compiled ~10.7s in the successful output).
- `npm run build -- --webpack`: existing CSS-module purity incompatibility; optional-bundler issue tracked separately, no production-source fix in Phase 0.
- No production deploy/publish was performed.
