# Phase 14 — Bounded auth-form feedback repair

Date: 2026-09-19 UTC. Branch: `system-upgrade`. Starting HEAD: `4b03e8183e` (not the automatic completion commit).

Owner explicitly selected **Fix auth-form feedback** after the Phase 14/15 gate was disclosed. This implements the audit's bounded error-recovery slice only. **Full Phase 14 remains PARTIAL / BACKEND-DEPENDENT; STOP before Phase 15.**

## Changed and preserved

- Added a small `useAuthFormFeedback` hook to client login, signup, recovery request, password update and staff login forms. A resolved error cancels React's automatic reset, retaining non-password fields only in the mounted form. Genuine success retains native reset behavior. Pending submissions cannot queue another attempt through Enter.
- Password and confirmation values clear on reset even when revealed (`type=text`); `PasswordField` masks its visibility on the same native reset event. No credentials/drafts enter state snapshots, browser storage or a new persistence layer.
- Pending feedback hides the previous result; completed errors regain focus, including retries with identical messages. Staff form reuses the existing portal feedback component.
- Login query codes `oauth_callback` and `invalid_email_link` map to safe local copy; unknown codes receive a generic message instead of echoing arbitrary/provider text.
- Server Actions, schemas, action payloads, native validation, recovery/session/role gates, redirect destinations, consent, OAuth start and callback logic, password requirements and backend architecture are unchanged. Account/profile/avatar/review forms are outside this slice. No CSS, navigation, Home, dependency, environment, SQL, data or secret changes.

## Reproduction and verification

Before edits, a genuine unconfigured login POST demonstrated `emailRetained=false`, `passwordCleared=true`, `feedbackFocused=true`. The initial probe's alert locator matched the framework route announcer too; scoped retry reproduced the actual field reset. Both were test probes, not successful login.

- **578 unit tests / 64 files pass**, including safe-code mapping, reset/credential-clearing policy, duplicate-submission guard and stale-feedback suppression. These include pure callback/component tests, not successful Auth evidence.
- **Typecheck, lint, isolated production build and whitespace check pass.** Production copy `/tmp/aj-phase14-feedback-production`; fresh production server on internal loopback **3214**. Source-mounted development remains on 3000.
- **13 source-browser + 13 fresh-production browser cases pass**, with three staff-submission cases explicitly skipped on each target. Nine cases exercise genuine login/signup/recovery-request errors twice each at **390/662/1440**: retained email/name/address/company/consent/hidden destination, cleared and masked passwords, pending/stale-feedback behavior, focused identical-error retries, one POST per attempt and no page errors/overflow. Other cases cover safe query messages, native validation, disabled recovery controls and no-JS native controls at 390/1440. No-JS submissions/retention are not certified.
- Configuration presence checks confirmed all six optional backend/mail values absent in the running process and no matching managed-file entries. `AUTH_UNCONFIGURED_TESTS=1` is strictly opt-in after confirming the target too. Final source and production matrices each issue 18 genuine failure-only POSTs, not account creation, recovery delivery or saved records. Pre-fix/initial probes also issued only unconfigured failures.
- **Live iframe:** navigation helper changed URL without rendering; a real Client Login link recovered. Fill → reveal → submit produced the genuine unconfigured error, retained email and focused feedback. A second real submission confirmed retry, retained detail, empty masked credentials and feedback focus. Test values cleared. Home click performed but immediate returned URL was still `/login`; no Home-navigation assertion claimed.
- Live error-state screenshot was successfully reviewed at the actual available viewport (approximately 919px), not mislabelled a 662px capture. Error and buttons are readable; independent browser assertions cover the other widths, not full visual/native-device acceptance.
- Runtime: no failed requests, module overlay or empty main. One buffered AdSense script-load error predates edits (`1789826671474`); no new application runtime error. Existing third-party failure was not repaired or suppressed.

### Initial checks retained, not app-fix claims

Initial source harness incorrectly attempted the intentionally absent staff form and clicked the recovery form before hydration. The corrected harness records the staff setup notice/skips and waits for observable navigation readiness. Initial log `/tmp/phase14-feedback-browser-initial.log`; final logs `/tmp/phase14-feedback-browser-final.log` and `/tmp/phase14-feedback-nojs.log`.

First production launch on 3116 failed with EADDRINUSE; HTTP health alone accidentally reached an older isolated build. Its failing retention/message tests are not regressions in this patch. Fresh 3214 was checked for availability and the new safe error copy before verification; final logs `/tmp/phase14-feedback-production-final.log` and `/tmp/phase14-feedback-production-nojs.log`. Old server/source was not modified. Build log `/tmp/phase14-feedback-build.log`; all temporary scripts/builds/artifacts remain outside Git.

## Still unverified / blocked

- Real successful/invalid hosted login, OAuth, password delivery/update/session revocation, successful signup/reset, persistence/reload and account/profile/file flows.
- Staff form failure/retry in a browser: the form is intentionally not rendered without configuration. Hook wiring/type/unit evidence is not staff authentication acceptance.
- Enabled password-update submission: no genuine recovery session; disabled controls were verified, not bypassed.
- Genuine-success reset policy has unit/source evidence only; no mocked browser success or fabricated saved account.
- Recovery provenance/hash handling/origins, exact agreement identity, partial writes, read errors, body limits and ignored sign-out errors remain the audit's separately reviewed functional gates. Account-form error retention remains outside this repair.
- Phase 13/12/11/9/1 hosted acceptance and all native/field/release gates stay open. No secret request, new connection, PR, merge, branch switch or deployment. Base44 app remains **not published**.

Next continuation must acknowledge these remaining gates rather than repeat the shipped feedback slice or silently mark Phase 14 complete.
