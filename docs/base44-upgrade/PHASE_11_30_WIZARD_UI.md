# Phase 11 — source-only requirement wizard

Date: 2026-09-19 UTC. Branch `system-upgrade`; starting HEAD `9cdc2fbea5`.

**UI IMPLEMENTED / HOSTED SAVE ACCEPTANCE BLOCKED — not full phase completion.** After declining credential setup again, the owner delegated the safe credential-free scope: “jo aapko shi lage vo update kro safle hre vo ok”. This authorizes this source-only stepper, not backend configuration, records, SQL, migration, Phase 12 or release. The [persistence preflight](PHASE_11_30_REQUIREMENT_WIZARD.md) remains the source audit and risk baseline.

## Changed

- Existing `/request-quote` now progressively enhances to four steps: Project → Requirements → Contact → Review & consent. Dedicated `QuoteWizard.tsx` owns navigation/validation/review, not business persistence. Shared field/Button styles are reused; no new animation, dependency, route or global CSS.
- All existing controls stay mounted and named in one native form. Back and review Edit preserve answers and file selection. Current-step validation moves focus to the first invalid field; transitions focus/announce the step heading. Enter in a text input advances/validates rather than submitting early; textarea Enter remains a newline.
- Final submission validates every step; consent and agreement remain unchecked/required. Pending controls are disabled and a synchronous submit guard prevents re-entry. React's automatic form reset is cancelled so a resolved server error does not erase uncontrolled inputs or the selected file. The existing server error receives focus. Genuine success still comes only from the unchanged action; a quote-scoped keyed attempt resets its action state for another request.
- Review shows every existing business field plus attachment name, with escaped text, preserved line breaks and long-word wrapping. Optional budget remains optional; timeline/budget are explicitly preferences, not commitments. Brief help prompts business problem, users, key features and integrations in the **existing 20–8000-character requirements field**. No extra structured columns, JSON, generated/auto-filled brief or truncation. Admin already renders this text; actual saved/admin-reloaded content is not verified.
- Before/without JavaScript, all fieldsets and native submission remain visible. The step UI appears only after hydration. Answers are transient mounted-form values, never localStorage/sessionStorage/IndexedDB or autosaved business data; the UI explains leave/reload loss.

## Preserved and deliberately deferred

`submitQuoteAction`, server schemas, `quote_requests`, admin readers, private upload handling, spam/rate guards, auth, consent/version semantics and email behavior are unchanged. ContactForm and AppointmentForm are byte-identical to starting HEAD. Home, nav, SEO, routes, configuration, compose, dependencies and migrations are untouched.

Attachment capability was not expanded or certified: existing 10 MB copy versus the unraised action body limit remains an unresolved audit risk. Existing insert-ID confirmation, separate upload/lead/evidence/email outcomes, agreement-version timing, real upload authorization and idempotency across completed requests remain open. There is no fake successful save, placeholder credential, new backend or production mutation.

## Verification

- **516 tests / 60 files PASS**, TypeScript PASS, lint PASS; isolated production build PASS in `/tmp/aj-phase11-wizard-production`. Source-mounted development remains on 3000; isolated production serves internal 3113.
- **9/9 source browser tests PASS** through the preview public proxy: six widths 320/390/662/820/1024/1440 (662 reduced motion), two no-JS cases at 390/1440, and one explicitly opted-in unconfigured submission failure case.
- **8/8 production read-only cases PASS**; the unconfigured POST test is skipped unless explicitly enabled. Never run that opt-in against a real backend. Its source run returned the genuine unchanged action message: `Online submissions are not enabled yet. Please reach us directly.` Exactly one POST was observed, pending submit/Back disabled, server alert focused, brief and file retained. This proves error handling, **not storage/upload/email success**.
- Browser journeys assert trim-aware requirements validation, required name/email validation, input Enter versus textarea newline, Back/Edit preservation, updated review, optional budget, both explicit consent gates, >=44px visible buttons and no document overflow/page errors. Read-only cases have zero same-origin POSTs.
- Live iframe real-link navigation, Continue, required validation, contact fill, review, Edit and Back retention passed; final Home return and runtime health passed (no errors/failed requests/overlay, main root has children). Initial navigate helper failed on a previously unrendered route; one real-link recovery worked. No router patch was needed.
- Iframe screenshot failed `iframe_hidden`; **not an iframe visual pass**. Independently captured production first-step views at actual 390/662/1440 were visually reviewed via a temporary read-only image viewer; labels, fields and Continue are readable, with native scrolling on phone and the preserved dock. This is scoped first-step/light-theme review, not whole-flow/theme/native-device certification. PNGs/scripts are in `/tmp`; the temporary viewer is stopped.
- Final external-Host quote HTTP 200 and six optional names absent in running process. `git diff --check` passes. No hosted save/admin reload, successful upload/email, real success/reset, screen-reader, native zoom, performance or deployment certification.

Reusable tests: `website/e2e/requirement-wizard.spec.ts`, `website/src/components/site/QuoteWizard.test.ts`. Durable summary: `evidence/phase11-30/wizard-verification.json`. Detailed ephemeral logs: `/tmp/phase11-wizard-{unit,e2e,build,production-e2e}.log` in the web container.

## Next gate

STOP before Phase 12. Phase 11 remains partial until actual existing-backend submit → stored row → authorized admin read → reload is verified, including integrity/attachment/legal concerns as scoped by the owner. Do not re-request declined credentials or loop over identical audits. No PR, merge or deployment is authorized by this checkpoint.
