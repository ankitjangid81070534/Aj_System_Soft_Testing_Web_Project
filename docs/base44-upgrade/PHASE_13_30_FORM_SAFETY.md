# Phase 13 — Bounded contact / consultation form safety

Date: 2026-09-19 UTC. Branch: `system-upgrade`. Starting HEAD: `e482831a27`, not the automatic completion commit.

**SOURCE IMPLEMENTATION / SCOPED LOCAL ACCEPTANCE COMPLETE; HOSTED ACCEPTANCE BLOCKED. Full Phase 13 remains PARTIAL.** Owner's exact `START NEXT PHASE SAFELY` resumes the first slice in [the form audit](PHASE_13_30_FORM_AUDIT.md), not Phase 14 or a repeated audit. Earlier Phase 12/11/9/1 gates are retained.

## Changes and preservation boundary

- `LeadForms.tsx`: Contact and Appointment now own action state inside keyed attempt children, matching Quote's existing state-ownership pattern. The success panel's another-enquiry button remounts the attempt rather than changing the key on an already-unmounted form. This is source-contract evidence; real successful save/reset remains unverified.
- Focused `useLeadForm.ts`: cancel React's automatic resolved-action reset, retain uncontrolled inputs on genuine error, focus generic error feedback after completion (including a repeated identical error), and synchronously guard pending submission. The existing submit button remains disabled while pending; editable fields remain as before. No global form framework or wizard rewrite.
- Existing name/message minimums are reflected in native markup. Trim-aware minimum checks and phone-format checks run before the existing action. Consultation phone remains optional; contact phone/company remain required. No server schema or action changes.
- Remove the unsupported guess that any generic failure belongs to Contact's name field. Error feedback is focusable and uses existing error/focus tokens.
- Instance-specific `useId` honeypots keep their existing `website` payload name, label, hidden treatment and unchanged `startedAt` value. Quote's only shared change is the honeypot identifier; wizard and keyed Quote attempt remain intact.
- Reusable `e2e/lead-form-safety.spec.ts` and three server-render/source-contract tests added. No new dependency, route, CSS layout, persistence, browser business storage or backend.

## Fresh verification

| Check | Result / evidence limit |
|---|---|
| Full unit suite | **567 tests / 62 files PASS** |
| Typecheck / lint / whitespace | PASS |
| Isolated production build | PASS in container `/tmp/aj-phase13-safety-production`; live source dev and its `.next` were not replaced |
| Source form safety | **7 distinct cases PASS** across two runs: three validation cases at 390/662/1440, two genuine unconfigured error/retry/pending cases, two no-JS cases at 390/1440 |
| Source quote regression | **8 read-only cases PASS**; opted-in quote POST test skipped |
| Production read-only regression | **13 cases PASS / 3 POST cases SKIPPED**, same form-safety + quote suites against isolated server on internal port 3115 |
| Responsive visual review | Independent actual 390/662/1440 light contact and consultation form captures reviewed; layouts/labels/controls fit at this scope. These are cropped form views, not full-page, dark-theme, success/error-state or native-device certification |
| Live iframe | Contact navigation and fill/submit-invalid/clear gestures pass for trim-aware name validation; error message `Please enter at least 2 characters.` and name focus asserted. Two unique guards, no captured runtime errors/failed requests, no overlay, five main children. Inputs cleared and consent restored unchecked |
| Service / configuration | Existing source-mounted dev healthy; final external-Host Contact HTTP 200. All six optional values absent in managed file and process (presence only); no secret request/generation |

### Genuine failure tests, not successful saving

The two opt-in source tests were run only after confirming absent backend configuration in file and process. Each honours the existing spam timer, submits through the real server action, observes pending/disabled submit, tries real Enter while pending, then releases the held request to the real server. No response is fabricated. Contact returns `Online submissions are not enabled yet. Please reach us directly.`; consultation returns `Online bookings are not enabled yet. Please reach us directly.`. Both keep all FormData values, focus generic feedback, re-enable submission and preserve an edited message across a second equal-error retry. Four genuine failure POSTs total, **no business record or email created**. Actual successful save, admin readback, notification and success-to-another-enquiry remain blocked.

### Retained initial / tool limitations

- Initial unit tests incorrectly assumed HTML attribute order; two new tests failed while 565 passed. Corrected assertions match complete input tags; application did not change to satisfy the harness.
- Initial browser readiness matchers guessed `More` / `Search pages`; real names are `More navigation options` / `Search navigation`. Three validation cases failed before gestures, then all passed after matcher correction. Initial source failure tests and eight quote cases already passed; no app fix claimed from correcting selectors.
- First iframe call used unsupported locator `exact` and failed before interaction. Corrected call navigated/fill/clicked, but programmatic one-character fill did not trip native minlength: it is **not an iframe minimum-length pass**. Independent Chromium fill/click does pass. A separate trim-aware whitespace scenario passes live; no source edit or claimed fix for the helper difference.
- Iframe screenshot returned `iframe_hidden`; no iframe visual sign-off. Independent Chromium captures plus a temporary read-only image viewer supplied the form review; viewer stopped. Capture scripts/PNGs stay in `/tmp`.
- Temporary logs in the web container: `/tmp/phase13-safety-unit.log` (initial), `-unit-final.log`, `-types-final.log`, `-lint-final.log`, `-e2e.log` (initial + passing real errors/quote), `-e2e-final.log` (corrected validation/no-JS), `-build.log`, `-production-e2e.log`. Prefix is `/tmp/phase13-safety` for all. Logs are temporary, not durable evidence files; this report records their scoped results.

## Remaining gates / next continuation

Do not repeat the shipped safety slice or call Phase 13 complete. Actual contact/quote/consultation submit → stored row → authorized admin detail → reload, successful another-enquiry reset, attachment/accepted-version evidence and delivery remain unverified. Respect declined credentials; no repeated setup request, replacement database, fabricated success or disposable record without permission.

The audit's expiry renewal, preferred-channel rules, consultation scheduling/timezone/promises, consent/version binding, upload/body limit, insert-ID confirmation and multi-step partial writes are **unchanged**, separately scoped decisions. Phase 12 dedicated settings/hosted acceptance and earlier gates remain open. **STOP before Phase 14**; next continuation resumes acceptance or explicitly chooses a separately authorized next slice, not automatic advancement. Home/nav/auth/SEO, actions/schemas/admin readers, compose/environment and dependencies remain unchanged. No SQL, secret, record mutation, PR, merge, deployment or publication.
