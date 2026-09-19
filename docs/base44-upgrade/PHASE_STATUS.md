# Current phase status — 30-phase program (2026-09-19 UTC)

Authority: [MASTER_PLAN_30_PHASES](MASTER_PLAN_30_PHASES.md), current 0–29 program. Previous numbering remains historical.

CURRENT_PHASE: 17 — BLOG / ARTICLE CMS — AUDIT COMPLETE; TWO ROOT CAUSES FIXED; TAG ASSIGNMENT AND AUTHOR SELECTION OPEN
LAST_COMPLETED_PHASE: 10 at public guidance/UI scope. Completed: 0, 2, 3, 4, 5, 6, 7, 8, 10. Phase 1 hosted gates blocked; Phase 9 partial; Phases 11–17 implemented in bounded slices with full acceptance incomplete.
NEXT_PHASE: STOP before Phase 18 (Updates / Announcements / Offers). Remaining Phase 17 items (post tag assignment writer, author select options, future-date scheduling) and every earlier acceptance gate stay open; do not repeat this audit or repair.
LAST_PHASE_SUMMARY: Audited the existing article CMS against the phase contract — draft/publish, SEO, categories, cover and dates already exist on the blog_posts resource. Fixed two reproduced defects: the public blog index ignored publication state, so drafts and deactivated posts were listed publicly, and the admin preview button was hidden for drafts even though staff detail preview already exists. Tag assignment and author selection are documented as the next slice, not improvised. No schema, action, permission or route change.
FILES_CHANGED: lib/data/blog.ts; components/admin/ResourceForm.tsx; new lib/data/blog-publication.test.ts; PHASE_17_30_BLOG_CMS.md; PHASE_STATUS.md; AGENTS.md.
TESTS_RUN: Full unit suite; typecheck; ESLint on changed files; anonymous HTTP probe of /blog.
TEST_RESULTS: 596 tests/66 files, typecheck and lint PASS (two new publication-filter cases). /blog HTTP 200 on fallback content. No authenticated publish/preview, screenshot or production build.
KNOWN_RISKS: P17-01/P17-02 verified at source and mocked-unit scope only — no article records or staff session exist here. blog_post_tags has no admin writer; author_id and category_id selects carry no options; future-dated posts are not held back by the index. Phase 16 non-atomic reorder and Builder public-Home claim remain.
BLOCKERS: No authorized staff/role session or populated blog data; hosted create/publish/preview/public-effect acceptance remains unverified. No auth bypass, fabricated articles or credential requests.
OWNER_APPROVAL_REQUIRED: Existing remote-access/data-write/security/legal/SQL/material Home movement and PR/merge/deployment boundaries remain.
LAST_SAFE_COMMIT: 6fbd9cfbfa — starting implementation HEAD, not automatic completion commit.
CURRENT_BRANCH: system-upgrade — unchanged.
PRODUCTION_STATUS: Base44 app NOT PUBLISHED. Anonymous/source checks are not deployment or hosted backend acceptance.

## Stop gate

Read [blog CMS](PHASE_17_30_BLOG_CMS.md). **Phase 17 is PARTIAL: tag assignment and author selection remain; Phase 18 not started.** Then [admin save QA](PHASE_16_30_ADMIN_SAVE_QA.md). **Phase 16 is PARTIAL at authenticated acceptance; Phase 17 not started.** Then [navigation safety](PHASE_15_30_NAVIGATION_SAFETY.md) and the [historical audit](PHASE_15_30_ADMIN_UI_AUDIT.md). **Bounded slice implemented; full Phase 15 remains PARTIAL. Phase 16 not started.** Phase 14 feedback and all earlier unresolved acceptance gates remain open. Do not repeat this implementation, audit or declined credentials, or claim isolated browser gestures prove genuine staff routing/persistence.
