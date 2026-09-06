# PHASE 17 — Post-Launch SEO Report
**Status: PENDING PRODUCTION DEPLOYMENT** — the site is not deployed yet (no domain, no
live Supabase), so domain-dependent checks cannot pass today. The entire Phase 17
checklist is now **executable in one command** the moment the site is live:

```bash
BASE_URL=https://your-domain.com node website/scripts/seo-verify.mjs
```

Exit code 0 = launch-ready. The script prints PASS/FAIL per item with details.

## Dry-run (localhost, 2026-08-30) — 9/14 passed

| # | Check | Dry-run | Why it fails locally / resolves at launch |
|---|---|---|---|
| 1 | Production domain configured | ❌ | Set `NEXT_PUBLIC_SITE_URL=https://domain` |
| 2 | HTTPS | ❌ | Provided by Vercel/Netlify automatically |
| 3 | Home 200 | ✅ | — |
| 4 | 11 important routes 200 | ✅ | — |
| 5 | Sitemap reachable + domain + populated | ❌→✅ | 25 URLs exist; domain comes from `NEXT_PUBLIC_SITE_URL` |
| 6+7 | robots: allow public / block admin / sitemap | ✅ | — |
| 8 | /ajadmin noindex (meta + header) + gated | ✅ | — |
| 9 | Canonicals on production domain | ❌→✅ | Same env var as #1 |
| 10 | Organization JSON-LD: primary + 3 alternateNames | ✅ | — |
| 11a | Default OG image | ✅ | Generated `/opengraph-image` (fixed this phase — was missing from meta) |
| 11b | Real contact details configured | ❌→✅ | Fill **Brand Settings** in /ajadmin (needs Supabase) |
| 12 | GSC verification meta | ❌→✅ | Set `GOOGLE_SITE_VERIFICATION`, redeploy |
| 13 | Custom 404 status | ✅ | — |
| 14 | RSS content-type | ✅ | — |

## Launch steps (owner)

1. Deploy (README §4) with `NEXT_PUBLIC_SITE_URL`, Supabase keys, and
   `GOOGLE_SITE_VERIFICATION` set.
2. Complete Supabase setup + Super Admin bootstrap (PHASE-2 guide).
3. Fill **Brand Settings** in /ajadmin (phone, WhatsApp, email, socials).
4. Run `BASE_URL=https://domain node website/scripts/seo-verify.mjs` → all 14 must pass.
5. Search Console: verify → submit `sitemap.xml` → URL-inspect home + top services
   (full steps: `docs/PHASE-11-SEARCH-CONSOLE.md`).

## Ongoing monitoring (Search Console)

- **Page Indexing** — weekly; expect /ajadmin "excluded by noindex" (correct), watch for
  soft-404s on real pages.
- **Core Web Vitals** — after traffic; the site targets LCP ≤ 2.5s / CLS ≤ 0.1 / INP ≤ 200ms
  (Phase 12 budget).
- **Enhancements** — Breadcrumbs and structured data should appear once indexed.
- **Manual Actions / Security Issues** — must stay empty; investigate immediately otherwise.

## Content recommendations (real gaps, no keyword spam)

1. **Blog has 3 starter articles** — publish one genuinely useful article every 2–4 weeks;
   topics that match actual services (POS automation, hospital workflows, modernisation
   case learnings) beat generic SEO posts.
2. **Team profiles are empty** — add real people with photos; the section is hidden until
   then (by design, no invented staff).
3. **Testimonials are empty** — add only real client quotes with permission; consider
   asking past clients at project handover.
4. **Case studies** — publish public ones as clients permit; even one strong case study
   with real outcomes outperforms a dozen thin pages.
5. **Privacy/Terms** — good-faith drafts; have counsel review for your jurisdiction.
6. Do NOT create separate pages for brand aliases — Organization alternateName already
   covers the search identity.

**Reminder:** none of this guarantees rankings or indexing speed — it makes the site
technically ready, which is the developer's whole job.
