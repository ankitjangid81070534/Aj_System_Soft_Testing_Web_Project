# Current phase status — 30-phase program (2026-09-20 UTC)

Authority: [MASTER_PLAN_30_PHASES](MASTER_PLAN_30_PHASES.md), current 0–29 program. Previous numbering remains historical.

CURRENT_PHASE: 18 — UPDATES / ANNOUNCEMENTS / OFFERS — AUDIT COMPLETE; TWO ROOT CAUSES FIXED; NON-TOP-BAR PLACEMENTS AND DETAIL/PREVIEW ROUTES OPEN
LAST_COMPLETED_PHASE: 10 at public guidance/UI scope. Completed: 0, 2, 3, 4, 5, 6, 7, 8, 10. Phase 1 hosted gates blocked; Phase 9 partial; Phases 11–18 implemented in bounded slices with full acceptance incomplete.
NEXT_PHASE: STOP before Phase 19 (AI customer support foundation). Remaining Phase 18 items (homepage/side/update-centre/footer placements, detail-preview destination, optional featured edge highlight), remaining Phase 17 items and every earlier acceptance gate stay open; do not repeat this audit or repair.
LAST_PHASE_SUMMARY: Audited the existing offers/announcements feature against the phase contract — records, scheduling fields, priority, placement enum, CTA, popup frequency, dismissal and admin editing already exist. Fixed two reproduced defects: the schedule window was evaluated inside the five-minute cached read, so expired items stayed live and scheduled items stayed hidden until revalidation; and the offer popup only stored its frequency marker on explicit close, so ignoring it re-showed the dialog on every navigation. Non-top-bar placements and public detail/preview routes are documented, not improvised.
FILES_CHANGED: src/lib/data/growth.ts; src/components/site/OfferPopup.tsx; new src/lib/data/growth-schedule.test.ts; PHASE_18_30_UPDATES_OFFERS.md; PHASE_STATUS.md; AGENTS.md.
TESTS_RUN: Full unit suite; typecheck; ESLint on changed files; anonymous HTTP probe of /.
TEST_RESULTS: 598 tests/67 files, typecheck and lint PASS (two new schedule-window cases). / HTTP 200 on fallback content. No authenticated publish, hosted popup/session or production build.
KNOWN_RISKS: P18-01/P18-02 verified at source and mocked-unit scope only — no offer/announcement records or staff session exist here. display_position values homepage/side_floating/update_center/footer are stored but never rendered; no public offer/update detail route exists, so those resources have no preview destination (Phase 10 forbids advertising them in the sitemap). Phase 17 tag/author gaps and Phase 16 non-atomic reorder remain.
BLOCKERS: No authorized staff/role session or populated growth data; hosted scheduling, popup frequency across real sessions and public effect remain unverified. No auth bypass, fabricated offers or credential requests.
OWNER_APPROVAL_REQUIRED: Existing remote-access/data-write/security/legal/SQL/material Home movement and PR/merge/deployment boundaries remain; rendering new Home/floating/footer placements needs placement approval.
LAST_SAFE_COMMIT: 0e6428dfea — starting implementation HEAD, not automatic completion commit.
CURRENT_BRANCH: system-upgrade — unchanged.
PRODUCTION_STATUS: Base44 app NOT PUBLISHED. Anonymous/source checks are not deployment or hosted backend acceptance.

## Stop gate

Read [updates and offers](PHASE_18_30_UPDATES_OFFERS.md). **Phase 18 is PARTIAL: non-top-bar placements, detail/preview destination and the optional featured highlight remain; Phase 19 not started.** Then [blog CMS](PHASE_17_30_BLOG_CMS.md). **Phase 17 is PARTIAL: tag assignment and author selection remain.** Then [admin save QA](PHASE_16_30_ADMIN_SAVE_QA.md). **Phase 16 is PARTIAL at authenticated acceptance; Phase 17 not started.** Then [navigation safety](PHASE_15_30_NAVIGATION_SAFETY.md) and the [historical audit](PHASE_15_30_ADMIN_UI_AUDIT.md). **Bounded slice implemented; full Phase 15 remains PARTIAL. Phase 16 not started.** Phase 14 feedback and all earlier unresolved acceptance gates remain open. Do not repeat this implementation, audit or declined credentials, or claim isolated browser gestures prove genuine staff routing/persistence.
