# Phase 7 evidence — visual sign-off pending

The saved images below are **independent Chromium captures of the source app**, using its real preview origin and reduced motion. They were captured after the heading correction but **not visually reviewed**. They are not iframe screenshot passes.

The actual iframe's first 919×499 service-detail screenshot exposed broken per-word title wrapping. The source was corrected to render normal-flow H1 text. Subsequent iframe geometry/health and independent layout checks passed. A post-fix screenshot was not obtained: the preview tool stopped accepting verification calls after eight attempts. Final visual sign-off remains open.

## Captures awaiting review

- [390px Services](images/390-services.png)
- [919×499 Services](images/919-services.png)
- [390px Contact](images/390-contact.png)
- [919×499 Contact](images/919-contact.png)
- [919px dark Contact](images/919-dark-contact.png)
- [919×499 Reviews](images/919-reviews.png)
- [390px article](images/390-article.png)
- [919×499 article](images/919-article.png)
- [919px dark article](images/919-dark-article.png)

The 919×499 fixed dock occupies the lower viewport as before; its appearance is not a claim that all controls fit above the fold. These are selected views, not full-page/whole-site certification.

## Assertions and limits

- [Initial browser report](browser-results.json): 35 index-layout passes, 15 service/contact/review-journey passes, five runtime/write-guard passes. Five combined article/category checks initially failed because the script assumed category records that do not exist. **Those entries remain failures in this raw report**, not rewritten as passes.
- [Separate article journeys](article-results.json): five passes for actual article links, native disclosure click/keyboard and section fragments; category filters explicitly unverified.
- [Preservation](preservation.json): seven index-page link lists, form descriptors and normalized text comparisons pass. The normalizer removes the previous decorative title duplicate and ignores whitespace boundaries.
- [Tests](tests.txt): 34 files / 276 tests, including 16 source-contract checks (not mocked hosted-success claims).
- [Typecheck](typecheck.txt), [lint](lint.txt), [production build](build.txt): pass.

Actual iframe service navigation and FAQ open/close pass separately. Its post-correction check returned no console errors, failed requests, overlay or empty main; it is health/geometry evidence, not final visual evidence.

Real project details, category/project filters, populated team/reviews, auth persistence and lead/email delivery remain unverified. See [Phase 7 report](../../PHASE_7_PUBLIC_PAGES.md).
