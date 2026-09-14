# Phase 14 recovery — interrupted branch handoff

Date: 2026-09-13. Working branch: `system-upgrade-phase`.
Starting HEAD: `49e16e4330` (full hash in `evidence/phase14-recovery-checkpoint.json`).

## Why the newer work was missing

A fresh `git fetch origin --prune` showed that the working branch and `origin/main` had the same tip, `49e16e4`. The Phase 14 commit, **`d5be8b3` — Complete phase 14 responsive fixes**, existed only on `origin/system-upgrade-init`. Every other fetched feature-branch tip was already an ancestor of the current main. The local main reference was also four commits behind the remote, but it was not used as the editing branch.

The unique Phase 14 patch was read, checked with `git apply --check`, then applied to this working tree without a branch switch, commit/cherry-pick, history rewrite, branch deletion or direct main write. This recovers the two original presentation fixes, their tests, and all original reports/evidence. It does not indiscriminately merge obsolete branches or revert the newer main history. The three recovered application/test files have exactly the original Phase 14 hashes.

This explains the repository-level version discrepancy; it does not prove the cause of every previously observed stale browser view. Use the managed PR to integrate this recovered work into main. No merge or deployment occurred in this turn.

## Scope and authorization

The owner requested checking Phase 14 and completing missing work before advancing. Because the current branch lacked the fixes and Phase 14 still had verification gaps, this turn is **Phase 14 recovery only**, not Phase 15. No feature redesign or additional business-logic work was performed.

The owner's latest message explicitly supersedes the old navbar exclusion: **include the existing Privacy and Disclaimer pages in the desktop top navigation and mobile More menu alongside the next phase**. This is recorded for Phase 15; it was not implemented during recovery. Do not remove or rewrite the existing pages. Continue one phase per `START NEXT PHASE SAFELY`, with the standing managed PR-per-phase workflow. Direct main updates and automatic branch deletion are not the platform workflow.

## Restored changes

- Privacy policy sections permit long URL wrapping; copy, dates and destinations are unchanged.
- Account-card workspace illustration has more room at the first two-column breakpoint; `xl` spacing is preserved.
- Two presentation-contract tests and the original Phase 14 evidence/report are recovered, not presented as fresh measurements.

No auth/RLS, API, database, SEO, content, dependency, navbar, configuration or secret changes. No application/database writes or fabricated CMS records.

## Fresh verification

- **405 tests / 49 files**, typecheck, lint and whitespace checks pass.
- Isolated production build passes with copied source/dependencies and explicit `NODE_ENV=production`. The initial temporary build inherited the development service's `NODE_ENV` and failed prerendering; correcting the temporary build environment fixed the test harness, not app source. Live development `.next` output was not replaced.
- **760 anonymous route-size cases**: 38 routes across the same 20 configurations, including all 15 master-plan sizes, 769px tablet, landscape and two clearly labelled zoom-reflow equivalents. All return 200 with an H1; no document-wide overflow, failed fixed-content geometry or uncaught page error.
- **20 fresh gesture assertions** across 320, 390, 769, 1024 and 1440px: footer Privacy navigation, unsent signup email input, navigation dialog open/fit and Escape close. All pass. No submit or database persistence is claimed.
- The first temporary Privacy assertion compared literal `innerText` against a lower-case single title, incorrectly counting the decorative `aria-hidden` MotionWords copy. All gestures were rerun using the heading's accessible name and destination. Initial results are retained in the fresh evidence; there was no app change or navigation bug fix between those runs.
- Independent localhost console checks at five widths and a real public-preview-proxy footer click are clean. Production `/privacy` at 320px and `/signup` at 1024px return 200, fit horizontally and retain preview noindex.
- The user's iframe initially timed out, then became available for a real footer Home → Privacy journey: both gestures performed, both destination headings appeared, Privacy paragraphs fit, no overflow, new error, failed request or error overlay, and the root was populated.
- The iframe retained an earlier truncated hydration-attribute warning and an AdSense-load error. Fresh independent browser checks did not reproduce them, and the live gesture check added no new error. The original buffered warning is **not diagnosed or claimed fixed**.

Fresh raw browser evidence: `evidence/phase14-recovery-browser.json`. Scope/checkpoint and source hashes: `evidence/phase14-recovery-checkpoint.json`. One-off runners, browser installation logs and build output stay in `/tmp`, outside version control.

## Remaining gates — not a full Phase 14 or release sign-off

The post-change screenshot failed because the preview surface was hidden/zero-size. **No new visual screenshot review is claimed.** The owner must open the preview for a visible review. DOM fit and independent browser checks are not a substitute for visual approval.

Still unverified: native 125%/150% browser zoom/OS scaling (only reflow equivalents measured), physical-device keyboards/browser chrome, Safari/Firefox, authenticated portal/admin tables/dialogs, populated CMS images/filters, inactive offers, remote CRUD persistence and prior Phase 1/8/9 private gates. Supabase/email credentials are absent; the existing optional unconfigured startup mode was preserved, not replaced by mock records or a different Supabase project.

The source-mounted development service is healthy on port 3000 with live compilation. Existing Base44 compose/environment metadata remain valid and were reused. The Base44 app is **not published**. Local production checks are not a production deployment, field Core Web Vitals result or ranking claim.

**STOP after Phase 14 scoped recovery.** Phase 15 is the next phase, with the newly authorized legal navigation additions; preserve and explicitly carry all outstanding gates rather than silently marking them passed.
