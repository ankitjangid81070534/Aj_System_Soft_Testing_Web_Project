# Phase 10 — technical SEO foundation

Date: 2026-09-12 (UTC). Pre-edit HEAD: `b0794fad6552c953cee6c65e3e372ec568483a1c`; branch: `system-upgrade-init`.

## Gate and outcome

The owner explicitly requested **“CONTINUE NEXT PHASE SAFLY”** after being informed that Phase 9 authenticated verification was pending. Proceeded with Phase 10's independent technical SEO scope, carrying Phase 1/8/9 integration and authenticated checks as **DEFERRED, NOT PASSED**. Phase 10 local implementation and server-rendered verification are complete; this is not publication, real-domain indexing confirmation, or authenticated CMS sign-off. **STOP before Phase 11.**

No new routes, keyword research/pages, UI redesign, material content moves, credentials requests, substitute credentials, database schema/data mutations, role changes, deployment or automatic merge.

## Audit and focused fixes

| Area | Finding / outcome |
| --- | --- |
| Titles/descriptions | All 31 available sitemap public pages render distinct titles and nonempty descriptions. Existing brand template, copy and correct SEO remain. |
| Canonical / metadataBase | Retained the shared `NEXT_PUBLIC_SITE_URL` source. One path-correct canonical per public page and matching OG URL. Root URLs with or without a trailing slash are equivalent. No published domain was invented. |
| OG / Twitter | Required social title, description, URL/image and card fields render on all public pages. Generated share image returns HTTP 200. Article OG author now matches its existing displayed/JSON-LD author. |
| Robots inheritance | Production audit demonstrated that `robots: undefined` in child metadata removed root directives. Public production metadata now omits that field so root index/follow and rich-snippet preferences survive. |
| Preview indexing | Base44 sandbox and Vercel previews emit noindex/nofollow at both root and page levels and robots disallow-all. A CMS false override cannot undo explicit private noindex. Published/non-preview output remains indexable. |
| Private routes | All nine available auth/account/admin/design-preview responses tested emit noindex. Every production crawler rule now excludes all auth/private paths, including the design preview. No auth bypass was used. |
| Sitemap | Removed offer/update detail URLs because those routes do not exist. Kept public service/project/article readers and their existing publication/privacy filters. Invalid/missing modification dates are omitted, not invented. Explicit noindex static routes are excluded. |
| SEO overrides / refresh | Legal metadata now uses the same existing override mechanism as other static public routes, matching sitemap exclusions. SEO saves refresh all 13 static public pages; service/project/post/SEO writes also refresh sitemap output. No mutation payload or authorization change. |
| Headings / crawlable links / alt | All 40 audited responses have exactly one H1 and no image missing its alt attribute. Public response HTML includes real anchor links. Existing presentation is unchanged; this is not an exhaustive editorial alt-text/accessibility review. |
| Breadcrumbs / entities | Existing visible breadcrumbs and truthful Organization, WebSite, BreadcrumbList, Service, BlogPosting and ContactPage/AboutPage graphs retained. Person authorship uses actual existing author names; no invented profiles, clients, certifications, ratings or prices added. |
| Schema accuracy | Removed unsupported project free-text SearchAction and hardcoded `$$` priceRange. Service industries now describe business audiences, not geography; service area comes from the existing India/worldwide brand facts. Missing/invalid article dates no longer become fabricated render-time dates. |
| JSON-LD safety | Escaped `<` in serialization so CMS text containing a script-closing sequence cannot break out of its JSON-LD script. Round-trip text is preserved. |

## Fresh verification

- **PASS — 377 tests / 41 files**, including 14 new SEO regression tests. Typecheck, lint and whitespace checks pass.
- **PASS — final isolated production build**, with preview environment flags unset only in the isolated copy. The source-mounted development server was not replaced or restarted.
- **PASS — development HTTP/HTML crawl:** 31 public sitemap pages + 9 private/setup pages; two intentional nonexistent service/offer routes return 404. Preview pages remain noindex, robots disallows crawling, XML parses, and generated share image returns 200.
- **PASS — independent production HTTP/HTML crawl:** the same 31 public + 9 private responses; two expected 404s. Public pages inherit explicit index/follow; private pages remain noindex. Canonicals, unique titles, descriptions, OG/Twitter fields, one H1, alt attributes and parseable JSON-LD asserted. No fake hosted content was inserted. The temporary production process was stopped afterward.
- **PASS at adapter scope only:** real SEO-save action triggers the required cache refresh calls on success and does not access the privileged database for an unauthenticated actor. These are mocked identity/database/cache adapters, not UI gestures or hosted writes.
- Initial in-preview check at 919px showed nonempty admin setup, no overlay or failed requests, and retained a hydration warning timestamped 18:20 UTC (before this phase). **Final browser check NOT automatically verified:** tool returned `No browser tab available`; independent final HTTP and production checks still pass. No fresh visual/hydration sign-off or fixes to the old warning are claimed.

One-off crawl/build scripts and raw output remained in `/tmp`; durable regression tests live in `website/src/lib/seo/`. Verification did not use an external search provider or fabricate indexing results.

## Files

- SEO helpers/tests: `website/src/lib/seo/{metadata,indexing,jsonld,foundation.test,refresh.test,sitemap.test,metadata.test,jsonld.test}.ts`.
- `website/src/components/seo/JsonLd.tsx`, `website/src/app/{robots,sitemap}.ts`.
- Metadata only in public blog detail/privacy/terms/service-agreement page files.
- SEO-related cache invalidation only in `website/src/lib/admin/actions.ts`.
- This report, `PHASE_STATUS.md`, `AGENTS.md`.

## Remaining release gates / next phase

1. App is **NOT PUBLISHED**. Set the real production `NEXT_PUBLIC_SITE_URL` in deployment configuration, publish, then verify canonical/share/sitemap hostnames, production crawler behavior and Search Console ownership/indexing on that real domain. The sandbox's localhost canonical is not a live URL.
2. Existing-project credentials remain declined. Real authenticated SEO save → persisted override → fresh public metadata/sitemap, hosted publication/privacy filters, private gestures and RLS tests remain unverified. No fresh credentials request was made.
3. Reproduce the earlier hydration warning in an available browser before claiming it resolved; do not use this SEO phase as a visual/auth sign-off.
4. Phase 11 (5,000-query research) requires separate continuation authorization. No research dataset or new keyword landing pages were generated.

Per the standing owner request, open a managed working-branch PR for this completed local phase; the branch also carries the earlier Phase 9 checkpoint with its private gates still deferred. Do not merge or deploy automatically.
