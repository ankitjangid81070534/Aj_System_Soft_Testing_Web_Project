# PHASE 12 — Performance Report
**Audited:** 2026-08-30 · Production build (`next build`, Turbopack) served via `next start`.
All numbers below are **real measurements** from this machine — none are estimated or invented.
Server-side compression (gzip) is active in the measurements.

## 1. Route composition (build output)

- Public pages: **static (○) or SSG (●)** — home, services (15 prerendered), projects, blog, about, team, not-found, sitemap, robots, RSS.
- Only genuinely dynamic routes are on-demand (ƒ): forms, admin, lead inbox.
- Admin routes are dynamic + route-segmented; **admin-only chunks never load on public pages** (verified: 9 shared framework chunks, 2 admin-only chunks on the services admin page, zero admin chunks on `/`).

## 2. Wire sizes (gzip, measured via curl --compressed)

| Page | HTML (compressed) | Notes |
|---|---|---|
| / | 20.3 KB | Full 16-section landing, all SSR |
| /services | 12.3 KB | 15 services prerendered |
| /services/custom-software-development | 12.8 KB | |
| /blog | 11.5 KB | 3 articles |
| /blog/[article] | 9.0 KB | Markdown rendered server-side (react-markdown runs in RSC — zero client JS for markdown) |
| /about | 9.8 KB | |
| /team | 6.2 KB | |

## 3. JavaScript budget on `/` (compressed, measured)

| Chunk | Size (gz) | Content |
|---|---|---|
| vendor | 73.3 KB | react-dom |
| framework | 39.6 KB | Next runtime |
| 27ohy… | 35.9 KB | app runtime |
| 3u9lw… | 12.1 KB | router |
| others (7) | ~26.7 KB | app islands |
| **Total** | **~186 KB gz** | 11 chunks |

**Client component count: 16** — every one is a verified interactive island (header/menu, reveals, forms, dialogs, toasts, admin tables). No listing page, article, or service page needs client JS for its core content.

## 4. What is already optimal (verified this pass)

- **Fonts:** one variable font (Geist) self-hosted via the `geist` package with `next/font` — zero CLS, preloaded, no font JS.
- **Images:** `next/image` everywhere with AVIF-first (`formats: ["image/avif", "image/webp"]`), explicit dimensions, responsive `sizes`, `priority` only on hero covers; blog teasers converted from `<img>` to `next/image` this phase.
- **Icons:** lucide-react via `optimizePackageImports` — tree-shaken, only used icons ship.
- **3D/motion:** CSS transforms + keyframes only (float, panel-in, reveal). No WebGL, no animation library. The hero composition is pure CSS with `aria-hidden`.
- **Third-party scripts:** zero at launch.
- **Data:** React `cache()` dedupes per-request fetches; explicit column selects; server-side pagination (20/page admin, 9/page blog); DB indexes per migrations 0001–0008.
- **Loading behavior:** public routes render blocking (no Suspense shell) → fast LCP + correct 404 statuses; admin has its own loading UI.

## 5. Changes made this phase

1. `next.config`: explicit AVIF/WebP image formats + `optimizePackageImports: ["lucide-react"]`.
2. Blog index covers switched from `<img>` to optimised `next/image` (priority on the first card only).
3. Dependency audit: 11 runtime dependencies, every one used; no animation/3D/carousel libraries shipped.
4. Verified admin/public chunk isolation (no admin code in public bundles).

## 6. Honest limitations

- No Lighthouse/CrUX run inside this environment (no browser automation set up for it in this phase); Phase 16's release QA includes real-browser E2E where Core Web Vitals can be sampled with Lighthouse if available on the deployment platform (Vercel reports them natively).
- The ~186 KB JS budget is dominated by React/Next runtime — the floor for any App Router site. Interactive islands are already minimal; the next meaningful reduction would be dropping client components (at a UX cost), which is not worth it.
- Compression on Vercel/Netlify is brotli, which will beat these gzip numbers further.
