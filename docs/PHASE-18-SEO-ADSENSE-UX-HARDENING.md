# Phase 18 — SEO, AdSense readiness and header/mobile UX hardening

Date: 4 September 2026 · Scope: `website/` only · No schema or env changes required.

## Bugs fixed

| Issue | Root cause | Fix |
| --- | --- | --- |
| Empty pill button next to **Portal** in the header (broken shape/layout) | `site_settings.global_cta_label` in Supabase is an empty string. The header only fell back when the prop was `undefined`, so an `<a href=""></a>` with no text rendered. | `lib/data/cta.ts` sanitises label/href at the data layer (blank → `Start Your Project` / `/request-quote`; href must be `/...` or `https://`). `MarketingHeader` also has its own defensive fallback. Unit-tested in `cta.test.ts`. **Optional:** in `/ajadmin/brand` set a real CTA label so the DB value matches. |
| Header clipped at 1024–1279px (lg) | 7 nav links + brand + Portal + CTA did not fit. | Short brand name and tighter nav padding at `lg`; full layout at `xl+`. Portal is icon-only at `lg`, labelled at `xl`. Verified at 320/390/768/1024/1180/1280/1440 — no clipping. |
| Scroll animations invisible on mobile | `.reveal-pending` on mobile used opacity 0.96 + 12px shift (imperceptible); `hero-rise` only ran ≥768px; observer `rootMargin` of 20% pre-revealed cards before they entered a short mobile viewport. | Pending state is now opacity 0 + 24–32px lift, hero entrance runs on all viewports, observer margins tuned per breakpoint, page-end fallback reveals last items. CSS fail-safe animation forces visibility after 5s if JS ever fails. Reduced-motion still disables everything. |
| Page could be dragged horizontally on desktop (aurora blobs / marquee) | `overflow-x: clip` was on `<body>` only; the viewport scroller is `<html>`. | Added `html { overflow-x: clip }`. Sticky header verified still working. |

## SEO upgrades (Google Search visibility)

- **Metadata**: `keywords` (23 curated head terms from the 5,000-keyword research — one per cluster, no stuffing), `authors`, `publisher`, `category`, OG locale `en_IN` (+ `en_US`, `en_GB` alternates), `googleBot` directives `max-snippet:-1`, `max-image-preview:large`, `max-video-preview:-1`.
- **Structured data** (`lib/seo/jsonld.ts`): stable `@id` graph (`/#organization`, `/#website`, `/#business`); Organization now has `logo`, `image`, `founder`, `slogan`, `knowsAbout`, and a `contactPoint` when admin has set email/phone; WebSite has `inLanguage: en-IN`, `publisher`, `keywords`, `SearchAction`; ProfessionalService has `addressCountry: IN`, real email/phone/address/hours/map/sameAs only when configured in `/ajadmin/brand`.
- **Sitemap**: hub pages (`/`, `/services`, `/projects`, `/blog`) inherit the newest child `lastmod`; hubs marked `weekly`.
- **robots.txt**: explicit `Googlebot`, `Mediapartners-Google` (AdSense crawler) and `AdsBot-Google` groups; `/update-password`, `/api/` disallowed; `Host` directive.

## AdSense readiness

- **CSP** (`next.config.ts`) now allows the full Google AdSense/Funding Choices/ad-traffic-quality origin set for script/frame/child/img/connect. Previously only `pagead2.googlesyndication.com` was allowed for scripts, so consent frames and quality pings would have been blocked.
- **Privacy policy** now includes the sections AdSense policy requires: Cookies, Advertising (Google AdSense, DART cookie, opt-out links), third-party services, children.
- `ads.txt`, `google-adsense-account` meta and the AdSense loader script were already correct and are unchanged.

### What still needs Google / Ankit (cannot be done in code)

1. **Wait for review** — site was added to AdSense on 1 Sept 2026; "Getting ready" typically takes 2–4 weeks. Do not resubmit repeatedly.
2. **Content depth** — AdSense rejects "low value content". Publish the 9 planned blog articles (`website/docs/seo/keyword-map.md` backlog) and add real project case studies. More indexed pages with original text = higher approval odds and more search impressions.
3. **Search Console** — after deploy, in Search Console: *Sitemaps → resubmit* `https://www.ajsystemsoft.in/sitemap.xml`, then *URL Inspection → Request indexing* for `/services`, `/projects`, `/about`, `/contact`, each `/services/*` page.
4. **Google Business Profile** — create one for "AJ System Soft Technology" (free). It is the fastest way to appear for brand + "software company" local searches.
5. **Backlinks** — list the company on JustDial, IndiaMART, Clutch, GoodFirms, LinkedIn company page; add those URLs in `/ajadmin/brand → social links` so they flow into `sameAs`.
6. **Optional** — in `/ajadmin/brand`, fill phone, email, address, business hours and map URL; they are now emitted as structured data automatically.

## Verification performed

- `tsc --noEmit`, `eslint`, `vitest` (97/97 pass, 3 new tests), `prettier`, `next build` (39 static pages) — all green.
- Playwright: header at 7 breakpoints (no clipping, CTA labelled, no horizontal scroll, sticky header OK); mobile 390px reveal: 48 pending → 0 pending after scrolling to bottom; pending opacity confirmed `0`.
- Rendered HTML checked for keywords/robots/OG locale meta, 3 JSON-LD nodes, robots.txt groups, CSP header, sitemap `lastmod`.

## Deploy

No env changes. Push to `main` → Vercel builds automatically. After deploy, check `https://www.ajsystemsoft.in/robots.txt` shows the `Mediapartners-Google` group and validate `https://www.ajsystemsoft.in/` in Google's Rich Results Test.
