# SEO baseline — 30-phase Phase 0

Fresh anonymous rendered titles/canonical/robots/schema per route are in [browser evidence](evidence/phase0-30/browser.json). No SEO runtime/content/config changes were made.

- Existing root and route metadata helpers, CMS overrides, OG/Twitter, sitemap, robots, RSS and structured-data components are present. Home emits Organization, WebSite and ProfessionalService. Contact includes BreadcrumbList and ContactPage. Fifteen service and three article fallback detail routes exist.
- Sandbox canonical uses `http://localhost:3000`; preview outputs deliberately say `noindex, nofollow` and preview robots disallows crawling. Do NOT substitute the public production domain blindly into the sandbox.
- The user-provided **https://www.ajsystemsoft.in** independently returned HTTP 200, canonical `https://www.ajsystemsoft.in`, robots `index, follow`. That is a read-only public reference, not proof of this branch's deployment or production save correctness.
- Private/account/admin/auth surfaces retain noindex; protected renders may be redirects/setup. Current sitemap excludes private routes and fabricated offer/update detail URLs. Historical redirect/preview-indexing fixes are retained rather than reopened from stale reports.
- Home title is `AJ System Soft Technology | Custom Software Development Company India`. Accessible text should be checked rather than treating MotionWords' hidden/aria-hidden copies as duplicate accessible headings.
- Existing `seo-keywords-5000.csv` already contains **5,000 rows and 5,000 unique normalized queries**: English 1,680, Hindi 1,660, Hinglish 1,660. Preserved byte-for-byte. Demand/volume/rankings not verified; current Phase 26 must re-evaluate evidence/mapping, not generate a competing second corpus.
- Existing [SEO_KEYWORD_MAP](SEO_KEYWORD_MAP.md) and old SEO reports remain historical inputs. No 5,000 pages, hidden keywords, metadata stuffing, auto-published content or ranking guarantees.

## Open gates

Actual CMS SEO saves and cache propagation, real project schemas/media, production-wide canonicals/robots/redirects/404s, Search Console/CrUX/sitemaps acceptance, indexing/traffic, useful maintained Hindi content and owner-approved article facts. Read-only Home metadata does not replace a production technical SEO audit. Phase 25 owns technical checks; Phase 26 research; Phase 27 roadmap.
