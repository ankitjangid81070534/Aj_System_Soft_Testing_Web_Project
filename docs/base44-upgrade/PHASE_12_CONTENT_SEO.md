# Phase 12 — existing-page content SEO / buyer intent

Date: 2026-09-12. Starting HEAD: `db04052b0aa8ac720ac9e69699db272f16b34898`, branch `system-upgrade-init`; initial worktree clean.

## Authorization and boundary

Owner command: **“START NEXT PHASE NAVBAR OPTION VALA WORK MT KRNA OK PHASE WALA WORK KRO SAFLY”**.

This authorizes Phase 12 only and explicitly cancels the queued navbar work for this phase. **No navbar, mobile More, Privacy/Disclaimer navigation, layout or styling changes.** Do not carry that old request into Phase 13 automatically. New service/article URLs still require proposal review. Stop before Phase 13 pending `START NEXT PHASE SAFELY`.

## Changes grounded in the existing plan

The fifteen service pages already have descriptions, problems, deliverables, platforms, features, process, industries, FAQs and enquiry CTAs. Rather than rewriting every page or publishing the research corpus, this phase addresses the concrete existing-page gaps in `PHASE_11_CONTENT_PROPOSALS.md`.

| Existing route | Buyer question answered | Change |
|---|---|---|
| `/services/custom-software-development` | What do I bring to discovery, what should handover cover, and do I need a bespoke build? | Three appended FAQs: anonymised inputs, written assumptions, account/licence/support questions and balanced packaged-tool comparison |
| `/services/erp-business-software` | Who prepares records and how do we accept a module? | Two appended FAQs: data ownership/cleaning/trial import/cutover and scoped operational acceptance checks |
| `/services/cloud-deployment-maintenance` | What is covered and can we recover the application? | Two appended FAQs: coverage hours/escalation, acknowledgement vs resolution, exclusions and backup/restore questions; no invented SLA |
| `/blog/how-to-plan-a-custom-software-project` | How can I prepare a usable brief and compare estimates? | A practical one-page brief checklist, scope/estimate comparison questions and contextual links to existing service/guide/enquiry routes |
| `/blog/web-app-or-mobile-app-choosing-the-right-platform` | How do I decide from actual work rather than technology fashion? | Workflow-based comparison, representative device/offline uncertainty checks and scoped next-step links |
| `/blog/what-erp-digitization-actually-means-for-small-businesses` | How do we verify stages and prepare a safe rollout? | Acceptance examples, migration responsibilities and next-step scope choices without a fixed timetable or price |

Guidance distinguishes questions to agree from contractual promises. No new clients, prices, certifications, statistics, guarantees, CRM modules, languages, offerings or author identities were invented. No mass-generated articles, extra keyword targets, meta keywords or hidden copy. Original text, original FAQ entries, page IDs/slugs, metadata and publication dates are preserved; the new text is appended.

## Data ownership and implementation

- Changes live in the repository's **existing default-content sources**, `services-fallback.ts` and `blog-fallback.ts`. These are existing company content, not replacement mock records.
- Public services/blog loaders, CMS precedence, managed draft/publish behavior, auth/permissions/RLS, cache and database queries are byte-unchanged.
- The default articles/FAQs render in this sandbox. If a hosted CMS already owns one of these slugs, its content still wins: this phase does **not** overwrite it or claim the hosted record changed. Applying reviewed copy there is a separate authorized CMS operation.
- Existing Markdown, ArticleContents, Accordion, JSON-LD and CTA rendering are reused. No additional runtime dependency, component, client state, bundle feature, styling rule or schema was necessary.
- Focused content regression coverage is in `buyer-intent-content.test.ts`. The earlier catalogue assertion now requires at least three FAQs rather than exactly three; the new tests assert the precise expanded counts and appended questions.
- The 5,000-row research file is byte-unchanged and all source excerpts still exist. Phase 11 source digests describe its earlier source snapshot; new digests are recorded in Phase 12 evidence, not retroactively substituted into history.

## Fresh verification

See [verification summary](evidence/phase12-verification.json), [independent browser assertions](evidence/phase12-browser.json) and [isolated production responses](evidence/phase12-production.json).

- **392 tests / 45 files PASS**; typecheck PASS; lint PASS; isolated copied-source production build PASS; whitespace check PASS.
- **102 independent Chromium checks PASS** at **390, 919 and 1440px**: 21 FAQ open/answer/close assertions, 27 new contents-anchor clicks, 36 article-body link clicks to the expected real page/H1, and 18 render/horizontal-fit checks. The actual gestures and post-gesture assertions ran together; no React internals or optimistic mocks were used.
- FAQ schema agrees with the current displayed questions on all three edited service templates at each tested width. Public pages keep one H1 and preview noindex.
- Six isolated production-built pages return HTTP 200 with the updated content already server-rendered, one H1 and preview noindex. This is not deployment or live-domain indexing evidence.
- Independent browser results: zero page errors, zero failed requests, zero application/backend writes. Three POSTs were existing AdSense `pagead/ping` calls; the initial zero-total-POST assertion was too broad, not an application defect. Advertising was neither removed nor blocked to make the check pass.
- Preservation comparison: original article text is an unchanged prefix; all other article fields are unchanged. Original service FAQ blocks are unchanged prefixes; all other service fields are unchanged. No navbar/auth/API/config/schema files changed.

## Verification limits and release gates

The required user-preview checks returned `iframe_unavailable`, then **No browser tab available**. User-iframe behavior and visual screenshot review are **not automatically verified**. Independent captures were taken in temporary storage but not visually reviewed; measured horizontal fit is not a visual sign-off. No new visual system/layout changes are claimed.

No authenticated admin/CMS, Google OAuth, portal, form submission or remote persistence was exercised. Earlier private gates remain deferred, not passed. No production deployment, observed keyword demand, ranking claim, field INP/LCP/CLS or formal performance sign-off. No useful content, routing, SEO protections or third-party integrations were removed to pass tests.

## Completion and next phase

Phase 12's scoped existing-source content work is complete with the limits above. The owner requests a managed PR alongside each completed phase; keep the current branch/PR workflow, not direct main edits or branch consolidation.

**Next: Phase 13 — performance / Core Web Vitals. STOP until separately authorized. Navbar work remains excluded.**
