# Performance baseline — 30-phase Phase 0

2026-09-16, source `b566a40`. [Fresh raw samples](evidence/phase0-30/browser.json); [previous baseline](archive-pre-30-phase/PERFORMANCE_BASELINE.md) is historical, not a before/after comparison.

## Method

Isolated production build on container loopback `127.0.0.1:3101`; warm server, fresh Chromium context for each sample, **no CPU/network throttling**, normal motion, five-second observation after load, three runs per size. Supabase is absent. Captures separately used reduced motion. No ads/third parties were disabled.

LCP = last observed candidate; CLS = shift sum excluding recent input (not a full field session-window metric). Observed blocking = sum of long-task duration above 50ms, **not Lighthouse TBT**. Resource Timing transfers can omit/collapse cached or opaque cross-origin sizes; images and third-party execution are not fully measurable from these entries. Variable third-party JS makes totals vary materially.

| Viewport | Median LCP ms | CLS | TTFB ms | JS transfer KiB | JS encoded KiB | Image transfer bytes* | Observed blocking ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| mobile 390×844 | 264 | 0.000 | 10.3 | 611.1 | 606.4 | 600 | 69 |
| tablet 919×499 | 228 | 0.000 | 9.7 | 1019.6 | 1015.0 | 300 | 27 |
| desktop 1440×900 | 320 | 0.000 | 7.9 | 1019.6 | 1015.0 | 600 | 58 |

*Low image transfer is an incomplete observation, **not the weight of production imagery**. Current Home uses CSS/SVG decoration and lacks real uploaded project records; entries may be cache hits or inaccessible cross-origin timing. JS transfer varied approximately 611–1020 KiB. Do not label this a stable bundle budget or causal improvement.

Development HTTP probe separately: 200, 360,974 bytes, ~211ms TTFB with live dev compilation. Do not compare that payload to production sizes.

## Open measurements / future gate

- Field INP/CrUX/Search Console and real-user LCP/CLS: unavailable.
- Standardized lab TBT and detailed JS execution traces: not measured; long-task list is retained only as diagnostic evidence.
- Real CMS query latency, save latency, storage imagery, network/CPU-throttled mobile, full scrolling and navigation timings: not measured here.
- Existing three navigation regressions pass functionally; they are not response-latency benchmarks.
- Targets remain LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; none is certified by fast unthrottled localhost numbers. Collect controlled same-content before/after conditions in Phase 28, keeping third-party variance explicit.
