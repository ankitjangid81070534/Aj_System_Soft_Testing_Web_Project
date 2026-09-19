# Phase 13 — Contact, quote and consultation audit

Date: 2026-09-19 UTC. Branch: `system-upgrade`. Starting HEAD: `dfd083d184` (not the automatic completion commit).

**AUDIT COMPLETE; IMPLEMENTATION AND HOSTED ACCEPTANCE PENDING. Full Phase 13 is not complete.** After disclosure of Phase 12's unfinished configuration/hosted gates and three continuation choices, the owner delegated safe scope: “jo aapko shi lage vo update kro safle hre vo ok”. Chosen scope is the recommended Phase 13 read-only form audit, not a settings schema, another Phase 12 audit or Phase 14. Phase 12 remains partial and Phase 11 hosted acceptance remains blocked.

## Existing contract — preserve it

| Entry | UI / handler | Existing persistence / readback |
|---|---|---|
| `/contact` | `ContactForm` in `components/site/LeadForms.tsx` → `submitContactAction` | `contact_submissions`; `data/admin-leads.ts` messages reader behind `leads:read` |
| `/request-quote` | `QuoteFormAttempt` + `QuoteWizard` → `submitQuoteAction` | `quote_requests`, optional private `lead-attachments`; authorized quotes reader preserves multiline Requirements |
| `/contact#consultation` | `AppointmentForm` → `requestAppointmentAction` | `appointment_requests`; authorized appointments reader. This is a request, not confirmed calendar booking |
| Direct channels | `/contact/page.tsx` → `getSiteSettings` / `whatsappLink` | Existing `site_settings` contact fields; unavailable values are omitted, never invented |
| Consent/evidence | Contact/quote agreement checkbox → conditional server agreement gate → `recordAgreementAcceptance` | Separate acceptance row, private PDF and lead version link after lead creation; consultation currently has no such checkbox/evidence path |
| Notification | Lead actions → `sendLeadEmails` | Optional Resend admin/visitor delivery after DB insertion. A notification failure is not proof that the lead failed to save |

Source reviewed: both public route files; `components/site/LeadForms.tsx`, `QuoteWizard.tsx`; `components/ui/Button.tsx`; `lib/leads/actions.ts`; `lib/validation/leads.ts` and tests; `lib/data/admin-leads.ts`, `settings.ts`; `lib/agreements/data.ts`, `acceptance.ts`; `lib/email/email.ts`; `next.config.ts`. No code/schema/configuration refactor is justified for this audit-only slice.

## Findings and evidence strength

| ID | Finding | Evidence and safe boundary |
|---|---|---|
| F13-01 | Contact/consultation success reset changes only a form key, not the action state | `useLeadForm.reset` increments `formKey`; the success branch does not render that keyed form. Source indicates “Send another message” / “Request another slot” would remain on success. No genuine successful hosted submission was performed, so this is source evidence, not a reproduced success gesture. Quote already uses a correctly keyed attempt wrapper; do not regress it. |
| F13-02 | Contact/consultation lack quote's resolved-error input-retention guard | Their uncontrolled forms do not cancel automatic action reset. Quote explicitly prevents reset and focuses errors. Candidate repair must test genuine error → retained values, not fabricate a successful response or infer retention from mere field presence. No POST this turn. |
| F13-03 | Browser/server validation minimums differ | Contact name and consultation name omit the server's two-character minimum; contact message omits its ten-character minimum. Live Contact link → fill `A` returned browser validity true, then field was cleared; source schema rejects a one-character name. Native minimums alone do not cover whitespace trimming. Preserve phone/company requiredness and optional fields. |
| F13-04 | Contact name can be marked invalid for unrelated action errors | Its `invalid` prop guesses a field from whether the general message contains lowercase “message”. There is no structured field-error contract; avoid labelling the name invalid for readiness/rate-limit errors. Source finding only. |
| F13-05 | Duplicate honeypot IDs on Contact | Shared `GuardFields` hardcodes `website-hp`, and Contact renders two forms. Live page confirms two IDs. Make IDs instance-specific while keeping the submitted `website` field name and spam checks unchanged. |
| F13-06 | Expiry message offers a retry that does not refresh the timestamp | Both routes create `startedAt` per request; `assertNotSpam` rejects age over one hour. Mounted retries reuse that prop. A blind reload would erase the visitor's brief; automatic timestamp renewal would alter anti-spam behavior. Plan an explicit recovery contract separately. |
| F13-07 | Preferred channel and consultation expectations need a business decision | Quote permits phone/WhatsApp preference without the corresponding number. Consultation phone is optional, yet page copy promises a call; preferred date/time are text-limited server-side, not confirmed availability or timezone. Do not silently make phone required, create a calendar or promise booking confirmation. |
| F13-08 | Legal/version gate remains unresolved | UI requires contact/quote agreement even without published terms; server skips the agreement gate if no current version exists. Acceptance resolves the current version separately, not a version bound to what the visitor read. Consultation has different consent behavior. Do not add/remove consent or assert legal compliance without an approved contract. |
| F13-09 | Upload and save-integrity gates carry forward | Quote copy/validator permit 10 MB; config does not raise Server Action body limit. Upload precedes insert; lead, evidence and email are separate operations. Contact/quote success checks insertion error, not a nonempty returned ID. Appointment does not select an ID. No transport increase, transaction, cleanup or retry policy was invented. |
| F13-10 | Unavailable direct channels are not an effective fallback here | Six optional configuration values are absent, so readiness failure asks users to reach out directly while actual channels are unavailable in this preview. Source also only shows the settings notice when settings is null, not when a settings row has no channels. Do not copy migration contacts or infer that production has no contacts. |
| F13-11 | Pending and response promises need scoped acceptance | Shared Button disables during pending; contact/consultation fields remain editable and lack quote's synchronous submit guard/error focus. Shared success copy promises replies usually within one business day; consultation advertises a free 30-minute call. Preserve existing wording pending operational confirmation; do not claim those commitments verified. |

## Recommended first implementation slice — not shipped

Limit the next continuation to **contact and consultation form recovery/validation/accessibility**, reusing current components and server actions:

1. Give each form a keyed attempt boundary so genuine success → another enquiry creates idle state. Reuse the quote pattern without rewriting the wizard or building a general form framework.
2. Retain values on a resolved error; provide focusable generic feedback; prevent pending duplicate submission and avoid misleading per-field error guesses. Preserve actual server outcomes.
3. Align existing minimum lengths and trim-aware feedback with the unchanged schemas; retain all field names, requiredness, options, consent text and payloads.
4. Give spam-input IDs unique per-form values, keeping `name="website"`, timestamps and server anti-abuse checks intact.
5. Add focused regressions for each repaired behavior. No new route, dependency, business storage, settings form or backend architecture.

**Not included in that slice:** phone/WhatsApp policy, consultation scheduling/timezone, SLA/copy changes, agreement version binding, timestamp renewal, upload/body limits, insert/transaction/idempotency semantics or hosted schema changes. These need separate bounded decisions and existing-system evidence. Do not re-audit the same findings or re-request declined credentials on continuation.

## Acceptance matrix

| Scenario | Method / gate |
|---|---|
| Name/message validation, keyboard focus, unique IDs | Unit/component checks plus real browser fill/submit-invalid gestures at 390/662/1440; no network write for native-invalid submission |
| Contact and consultation resolved-error retention | Genuine failure only against confirmed unconfigured sandbox, explicitly scoped before testing; retain original values and focus feedback. Never equate it with a saved record |
| Pending guard and controls | Browser gesture with observed request/pending state; no simulated React callbacks |
| Genuine success → another enquiry | Unit evidence can test state ownership, but real browser acceptance requires approved existing-backend save and disposable-record authorization; keep marked unverified until available |
| Quote regression | Existing wizard suite: step validation, Back/Edit, preserved fields, consent, no-JS; do not enable unconfigured POST test against a configured backend |
| Hosted acceptance | Each form → action → actual stored row → authorized admin detail → reload; attachment access, accepted version/evidence and notification outcomes separately checked |
| Visual/accessibility | Actual phone/662px/desktop screenshots after any UI change; reduced motion, no-JS and relevant focus behavior. Automated checks are not native-device/screen-reader certification |

## Fresh verification this turn

- Healthy existing source-mounted Next dev container on port 3000; live route compilation/rendering in logs. Compose, env manifest and origin configuration unchanged; no restart or new setup needed.
- Six optional configuration names checked by presence only in managed env and running process: all absent. No values printed, credentials requested/generated, provider connected or record written.
- **564 tests / 61 files PASS**, typecheck PASS, lint PASS on unchanged application source. Temporary container logs: `/tmp/phase13-audit-tests.log`, `/tmp/phase13-audit-types.log`, `/tmp/phase13-audit-lint.log`.
- External-Host HTTP probes: `/`, `/contact`, `/request-quote`, `/service-agreement` each **200** with HTML. HTTP success is not persistence acceptance.
- Live iframe initial navigation helper changed URL without content: failed, not passed. One recovery using the actual Contact link succeeded; Contact form mounted, name fill/validity inspection/clear passed, consent remained unchecked, two honeypot IDs confirmed, captured errors and failed requests were empty. No form submission or test data left in the field.
- No new interactions implemented; no screenshot/visual sign-off, independent responsive sweep, fresh production build, successful submission, saved-record/admin-reload, upload, email, performance or release claim.

## Stop gate

Remain at **Phase 13 audit complete / implementation pending**, not full phase completion. Next `START NEXT PHASE SAFELY` resumes the bounded form-safety slice above, **not Phase 14**. Phase 12 configuration/hosted acceptance, Phase 11 saving and all Phase 1/9 legal/content/private/release blockers remain deferred, not passed. App/backend/auth/Home/navigation/SEO and dependencies are unchanged. No PR, merge, migration, deployment or publication.
