# Phase 7 — inner public pages

Date: 2026-09-12. Starting HEAD: `7846c345e7` (actual pre-edit branch HEAD). Branch: `upgrade-desktop-navbar`.

Owner authorization: `continue next phase safly`.

**COMPLETE for the public UI scope; final responsive visual review passed. STOPPED before Phase 8.** See [final review](PHASE_7_FINAL_REVIEW.md) for the 282-test rerun and clearly labeled actual-iframe versus independent visual evidence. Phase 1 integration gates remain deferred, not passed. No publishing, PR, merge, secret setup, migration or business-data write was performed.

## Presentation changes

- Services, service detail, projects, case studies, reviews, about, team, contact, blog and articles now use the established `PageHero` system. Existing PageHero consumers inherit the same safe title wrapping; the shared AI-methods header also inherits this, without content or data changes.
- Added a small `beforeTitle` slot so existing icons, publication badges and category labels are retained rather than duplicated in bespoke detail headers. Case-study overview remains an aside; all metadata, cover/gallery media, related records and conditional sections remain in their original order.
- Plain-flow page H1s are immediately visible, wrap long CMS titles and do not animate one inline-block per word. The first screenshot exposed split words after adding overflow wrapping; replacing the title's per-word wrapper fixed the measured layout. This was an actual source correction, not a temporary browser patch.
- Preserved the accepted homepage, compact desktop navbar and mobile/tablet dock. No material content reorder or route rename. No new imagery, dependencies, invented people/projects/reviews or fabricated proof.
- Contact/reviews/blog now have matching public-page headers. Contact panels have bounded narrow-screen widths; handlers, inputs, required flags, spam stamp, settings and actions are unchanged.
- Articles show their existing excerpt as context. Extracted contents links now appear on phones/tablets as well as desktop, using a focused `ArticleContents` component with native disclosure, keyboard activation and normal fragment links. Desktop keeps the sticky reading aid. Articles without a contents list no longer reserve an empty sidebar column.
- Service category and article/project filter links have 44px minimum touch areas. Filter URLs/queries are unchanged; selected links use `aria-current` rather than button-only `aria-pressed`. Blog pagination wraps on small screens.
- Connected four existing service section labels to their rendered headings; corrected the empty-review heading level. FAQ behavior is unchanged. There is no standalone FAQ route to create.

## Verification

### Automated source/build checks

- **34 test files / 276 tests PASS**, including 16 new source-contract checks. These are not hosted integration or rendered fixture tests.
- Typecheck, lint and whitespace checks PASS.
- Isolated default **production build PASS**. Build source/dependencies were copied under `/tmp/phase7-build`, leaving the live source dev server on port 3000. Initial harness attempts failed because of an out-of-root dependency symlink and inherited `NODE_ENV=development`; using copied dependencies and `NODE_ENV=production` corrected the test setup. No app/config workaround was needed.
- Homepage, service detail, article and contact return HTTP 200; nonexistent service/project/article slugs still return real 404s.
- Seven index pages retain exact main-content link lists and form-control descriptors. Text matches after ignoring whitespace boundaries and removing the old decorative H1 duplicate. Existing sources/data functions, auth, migrations, metadata builders and form implementations were not edited.

### Independent source-browser checks

Five configurations: 320×740, 390×844, 919×499, 1440×1000, and dark 919×900. All use the real public preview origin, not mocked records or a bypassed allowlist.

- **35 layout checks PASS:** seven indices each have one H1, a breadcrumb, normal-flow title, no horizontal page overflow, and no title/description overlap.
- **15 journeys PASS:** service category anchor → service detail → FAQ click/open + keyboard close → existing quote form; invalid contact submit stays local; review submit link opens the existing login form. Each includes the gesture and resulting assertion.
- **5 runtime/write guards PASS:** no browser exceptions or same-origin business writes.
- **5 article journeys PASS:** real article link → native contents click/keyboard disclosure → fragment navigation; 44px section links, no page overflow. These were run separately after the initial broader script incorrectly assumed there were blog-category records. That initial assumption failed in all five configurations; it was not an app defect or a passing filter test.
- Native invalid contact submission is validation evidence only. It is NOT a successful lead save or email delivery.

### Actual iframe and visual status — initial implementation history

- Services → detail navigation and FAQ open/close passed in the actual iframe with gesture-plus-assertion checks.
- After the title fix the iframe reported a single-line 41.37px title at 919px, no word blocks, no console errors, no failed requests, no overlay and nonempty main content.
- The first actual tablet screenshot **FAILED visual review**: per-word title wrapping broke words and collided with the description. The source was corrected afterward and the geometry checks above passed.
- A post-fix screenshot and the remaining phone/desktop visual review were **not automatically verified**: the preview tool refused further calls after eight verification calls, including a rejected locator request. Independent post-fix screenshots were captured and saved, but not visually reviewed; they are not substituted for an iframe visual pass. Final visual sign-off remains pending.
- The fixed dock intentionally occupies part of the short 919×499 viewport. Actions may require scrolling; no claim that every action fits above the fold.

## Still blocked / not tested

- Real project details/gallery/live-product links, populated reviews/team, article categories/pagination and project facets cannot be verified without actual published records. Their conditional source paths and links remain intact; no records were invented. Filter selected-state changes have source checks only.
- Hosted auth/client/admin success, roles/RLS/storage/CRUD, lead persistence/email, Home Builder composition and hosted schema remain deferred. The owner declined credentials; none were requested or generated.
- No whole-site accessibility certification, field performance measurement, production domain/release or deployment claims.

## Earlier continuation review — historical

At HEAD `a7d0d0decd`, the owner's next `continue next phase safly` request resumed this unfinished gate. The source-mounted development service is healthy and the homepage returns HTTP 200. In the actual preview, `/services` eventually rendered the expected H1 with populated main content and no console errors, failed requests or error overlay; the initial navigation-helper failure is not credited as a passing gesture.

The requested screenshot returned `iframe_hidden`: the preview surface is hidden or zero-size. Visual verification remains **pending**, with no retry or app-source workaround. The owner must open the preview panel for the remaining visual review. No application code, secrets, schema, business records or auth behavior changed; prior tests/build were not rerun. Phase 8 remains unstarted.

## Next safe step

Final visual review is now complete: see [PHASE_7_FINAL_REVIEW](PHASE_7_FINAL_REVIEW.md). Preserve the unchanged navbar/dock and **wait for fresh authorization before Phase 8**. Data-backed checks remain separate owner-dependent release gates, not successful integration claims.

Evidence: [verification and captures](evidence/phase-7/SCREENSHOTS.md).
