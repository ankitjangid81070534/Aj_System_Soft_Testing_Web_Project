# Current phase status — 30-phase program (2026-09-19 UTC)

Authority: [MASTER_PLAN_30_PHASES](MASTER_PLAN_30_PHASES.md), current 0–29 program. Previous 0–17 numbering remains [historical](archive-pre-30-phase/PHASE_STATUS.md).

CURRENT_PHASE: 8 — SERVICES / CAPABILITY DISCOVERY — COMPLETE AT DOCUMENTED PUBLIC-UI SCOPE
LAST_COMPLETED_PHASE: 8. Completed at documented scope: 0, 2, 3, 4, 5, 6, 7, 8. Phase 1 source audit/repair complete but hosted gates remain blocked, not fully complete.
NEXT_PHASE: 9 — PROJECTS / CASE-STUDY EXPERIENCE — NOT STARTED; WAIT FOR NEXT EXACT CONTINUATION
LAST_PHASE_SUMMARY: Added a one-question, nine-choice native service matcher on the existing Services hub, using only available public-index records; added category counts, empty guidance and full service-card summaries. Repaired reproduced service-fragment/browser-back navigation with existing Next Link. Preserved Home order, navigation, service routes/readers and backend.
FILES_CHANGED: website/src/app/(public)/services/page.tsx; website/src/components/site/ServiceMatcher.tsx; website/src/components/ui/ServiceCard.tsx; website/src/lib/service-matcher.ts; website/src/lib/service-matcher.test.ts; website/e2e/service-discovery.spec.ts; docs/base44-upgrade/PHASE_8_30_SERVICE_DISCOVERY.md; PHASE_STATUS.md; DECISIONS.md; RISKS.md; MASTER_PROJECT_UNDERSTANDING.md; evidence/phase8-30/; AGENTS.md.
TESTS_RUN: Final unit/type/lint/whitespace checks; isolated production build; source and production service/header/navigation suites; independent responsive light/dark/motion matrix and screenshot review; partial live iframe gestures/runtime checks; optional-key presence and source-dev HTTP health.
TEST_RESULTS: PASS — 487 tests/56 files, typecheck, lint, isolated build, 26/26 final source and 26/26 final production cases, 14/14 independent layout/theme cases. No matrix console/page errors or non-cancelled failed same-origin requests; 14 cancelled requests retained. Initial source/retry failures and ten incomplete pre-fix production timeout contexts preserved. Independent phone/tablet/desktop service images reviewed. Iframe goal/detail-heading/return gestures passed; final catalogue jump and hidden screenshot UNVERIFIED. Buffered transient tag-edit compile errors were corrected before final passing build/tests.
KNOWN_RISKS: Hosted auth/CRUD/RLS/upload/email/custom-CMS, Builder/atomicity/content/legal/release gates persist. Explicit matcher mapping does not infer newly renamed/custom service slugs; catalogue and human enquiry remain available. Native scrolling remains necessary below the fixed dock. No field CWV/conversion improvement, full native-device/zoom or owner-environment repair claim.
BLOCKERS: No blocker for scoped public-services acceptance with independent visual/browser checks. Hosted FORM → WRITE → ROW → RELOAD → PUBLIC EFFECT remains blocked/unverified under credential deferral. No backend connection or substitute credentials permitted.
OWNER_APPROVAL_REQUIRED: Next exact START NEXT PHASE SAFELY starts Phase 9 only. Separate approval remains for material content moves, legal/benefit claims, schema/policy/data work, Builder activation, integrations, PR, merge or deployment. Do not re-prompt for deferred credentials.
LAST_SAFE_COMMIT: bf4ea21a580157666c20d6085b1bd327c163a22e — starting Phase 8 HEAD / prior Phase 7 checkpoint; not the automatic end-of-turn completion commit.
CURRENT_BRANCH: system-upgrade — no branch switching.
PRODUCTION_STATUS: Base44 app NOT PUBLISHED. No production mutation/deployment/branch-parity claim.

## Stop gate

See [Phase 8 outcome and interaction ledger](PHASE_8_30_SERVICE_DISCOVERY.md). **STOP after Phase 8.** Await the next exact continuation before Phase 9 — Projects / Case-study Experience. Preserve compact desktop navigation, mobile dock, auth/data logic and current Home order; the [movement ledger](PHASE_3_30_HOMEPAGE_PLAN.md) is still an unimplemented proposal.
