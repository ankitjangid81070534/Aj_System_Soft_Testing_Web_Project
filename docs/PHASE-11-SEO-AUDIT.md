# PHASE 11 — Technical SEO Audit Report
**Site:** AJ System Soft Technology · **Audited:** 2026-08-30 (production build, live checks)
**Note:** URLs below resolve against `NEXT_PUBLIC_SITE_URL`; on localhost the
canonical base is `http://localhost:3000`. No search-engine ranking is
guaranteed — this report covers technical readiness only.

## Checklist results (master spec → status)

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 1 | Unique metadata per public page | ✅ | Every page exports generateMetadata; titles verified unique (see Titles) |
| 2 | Metadata title template | ✅ | `%s \| AJ System Soft Technology` root template confirmed in served `<title>` |
| 3 | Unique descriptions | ✅ | Per-page descriptions; admin can override via SEO Manager |
| 4 | Canonical URLs | ✅ | `<link rel="canonical">` verified on all 10 core public routes |
| 5 | sitemap.xml | ✅ | 23 URLs (home, 6 section pages, 15 services, projects, blog, posts) — revalidates hourly |
| 6 | robots.txt | ✅ | `Allow: /`, `Disallow: /ajadmin`, sitemap declared |
| 7 | OG/Twitter metadata | ✅ | og:×6 + twitter:×3 tags verified on sampled pages; branded OG image (`/opengraph-image`) |
| 8 | Organization JSON-LD | ✅ | Present site-wide (public layout) |
| 9 | alternateName values | ✅ | AJS Technology + both alternate names in Organization & WebSite JSON-LD |
| 10 | WebSite structured data | ✅ | Added this phase, site-wide |
| 11 | BreadcrumbList | ✅ | Services, projects, blog detail pages |
| 12 | Article/BlogPosting | ✅ | BlogPosting JSON-LD on articles (author, datePublished, publisher) |
| 13 | Service structured data | ✅ | Service JSON-LD on service detail pages (provider = Organization) |
| 14 | Semantic headings | ✅ | One `<h1>` per page (verified), logical h2/h3 order |
| 15 | Descriptive internal links | ✅ | Related services/projects/posts, nav/footer, CTA links |
| 16 | Descriptive alt text | ✅ | All images carry alt (admin-managed, enforced with hints in forms) |
| 17 | Stable clean slugs | ✅ | Slug pattern enforced (`/^[a-z0-9-]+$/`), uniqueness checks |
| 18 | Redirect support for changed slugs | ✅ | `redirects` table + edge proxy with 308 permanent redirects (5-min cache) |
| 19 | Branded 404 | ✅ | HTTP 404 status + branded page (verified) |
| 20 | noindex admin/preview/private | ✅ | `/ajadmin*`: robots.txt + meta robots + X-Robots-Tag header; drafts render staff-only with noindex |
| 21 | Public pages indexable | ✅ | No noindex on any public route (draft previews excepted) |
| 22 | robots doesn't block assets | ✅ | Only `/ajadmin` disallowed; `/_next/*` assets allowed by default |
| 23 | Core content server-rendered | ✅ | All sampled pages contain full `<h1>`/content in HTML (verified via curl) |
| 24 | GSC verification support | ✅ | `GOOGLE_SITE_VERIFICATION` env → verification meta tag |
| 25 | Post-launch GSC guide | ✅ | `docs/PHASE-11-SEARCH-CONSOLE.md` |
| 26 | SEO audit report | ✅ | This document |

## Verified page titles (samples)

- Home: `AJ System Soft Technology | Custom Software, SaaS, Web & App Development` (spec direction, exact)
- Services: `Services — Custom Software, SaaS, Web, Mobile & Business Systems | …`
- Projects: `Projects & Case Studies | …` · Blog: `Insights — …` · About/Team/Contact: branded templates
- No keyword stuffing: each title carries one page-specific phrase only.

## Structured data inventory (sampled)

- Home: Organization + WebSite (+ skip-link, SSR content)
- Service detail: Organization + WebSite + BreadcrumbList + Service
- Blog article: Organization + WebSite + BreadcrumbList + BlogPosting

## Remaining launch-time items (owner actions)

1. Set `NEXT_PUBLIC_SITE_URL` to the production domain (canonicals/sitemap follow it).
2. Set `GOOGLE_SITE_VERIFICATION` after verifying the property (see guide).
3. Run migrations on the production Supabase project so sitemap includes real posts/projects.
4. Optional: Search Console → submit sitemap (guide below).

Known limitations (honest):
- Ranking/indexing speed is Google's decision — nothing here guarantees either.
- `favicon.ico` remains the framework default alongside the generated branded icon; replace the .ico file when brand assets exist.
- seo_metadata overrides apply to static routes; entity pages (services/projects/posts) use their own SEO fields (admin-managed) — by design.
