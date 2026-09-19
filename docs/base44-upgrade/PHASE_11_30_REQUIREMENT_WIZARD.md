# Phase 11 — Project Requirement Wizard: persistence preflight

> Historical preflight. The owner subsequently authorized safe source-only UI work after declining credentials again; see [current wizard checkpoint](PHASE_11_30_WIZARD_UI.md). The implementation-stop wording below describes this earlier checkpoint, not the current UI. Hosted saving remains unverified.

Date: 2026-09-19 UTC. Branch `system-upgrade`. Starting HEAD `e1b2ce4ec48ffe9a666312461d79f6cf062938dd`.

**STARTED / BLOCKED before wizard implementation — not complete.** Owner's `START NEXT PHASE SAFELY` authorizes Phase 11 only. The master requires existing lead persistence, an admin-readable brief and real saved/reloaded verification; if persistence cannot be established safely, report the blocker rather than substitute browser storage. This checkpoint audits that contract without claiming a working wizard or changing the existing quote form. Phase 12 has not started.

## Existing flow, not a new backend

| Layer | Current source and behavior |
|---|---|
| Public entry | `/request-quote/page.tsx` renders `QuoteForm` and a per-request spam timestamp. Existing Start Project destinations already reach this route. |
| Form | `components/site/LeadForms.tsx`: one form with About you, About the project and Consent fieldsets. Not a stepper. Includes project type, platform, industry, optional budget/timeline, requirements, contact preferences and attachment. |
| Handler | `lib/leads/actions.ts` → `submitQuoteAction`, through React `useActionState`. No separate wizard API. |
| Validation | `lib/validation/leads.ts`: full name >=2 characters, valid email, requirements 20–8000 characters; optional text limits; explicit data-use consent, agreement gate, attachment allowlist, spam age/honeypot and process-local rate limits. |
| Readiness | `isSupabaseConfigured` covers the public URL/anon pair only. The writer additionally requires the server-only service role. With configuration absent the action returns `Online submissions are not enabled yet. Please reach us directly.` before storage/database calls. |
| Upload/write | Optional private `lead-attachments` upload precedes a `quote_requests` insert using the existing privileged server client; requests select the inserted ID. No public browser database writer is needed. |
| Identity/consent | Existing session user is attached when available; agreement acceptance is recorded separately after the lead insert. Optional email notifications follow. |
| Admin read | `lib/data/admin-leads.ts`: authenticated `leads:read` check → existing row → named detail entries. `/ajadmin/leads/quotes/[id]` renders escaped text with `whitespace-pre-wrap`; requirements already support a readable multiline brief. |
| Schema evidence | Committed `0007_leads_ops_audit.sql` defines quote fields; `0009_lead_attachments.sql` defines a private bucket. These files are evidence of intended schema, NOT proof of the applied hosted schema and NOT permission to run SQL. |

### Proposed field contract — not implemented

Reuse `/request-quote`, `submitQuoteAction`, `quote_requests` and the existing admin inbox; no duplicate route/table or migration proposed.

| Wizard information | Existing destination | Boundary |
|---|---|---|
| What to build | `projectType` → `project_type` | Preserve existing options and optionality; no inferred price/package. |
| Industry, platform | `industry`, `platform` | Keep current named fields and limits. |
| Business problem, users, features, integrations | Labelled sections of existing `requirements` text | No dedicated fields currently exist for these. A future formatter must preserve all answers, validate the aggregate 20–8000 limit, and never silently truncate. Do not claim queryable structured columns/JSON. |
| Timeline preference | `timeline` | Preference only, never a promised date. |
| Budget | Existing optional `budgetRange` | Preserve optionality per D10; no new estimator or required budget. |
| Contact | Existing name/email/company/phone/WhatsApp/location/preference fields | Preserve validation and server/session contracts. |
| Attachment | Existing file input/private upload | Keep gated until actual transport limit and upload verification are resolved. |
| Review and consent | Existing `consent`, `agreementAccepted` and final action | Review is not a save. Explicit unchecked consent remains mandatory in the UI. |

A future four-step presentation can group **Project → Requirements → Contact → Review & consent**. Required interaction acceptance: Next validates only current inputs; Back/Edit preserves values and file selection; focus moves to the step heading/error; step status is announced; Enter cannot accidentally submit early; final submit validates all steps, prevents duplicates while pending and preserves the brief on errors. Keep a usable non-JavaScript full-form path and existing routes. Temporary mounted-form state is not persistence; no localStorage, sessionStorage, IndexedDB, autosave claim or fake success. Reuse shared field/Button styles; no new form library is justified.

## Why implementation stopped here

1. **Confirmed environment blocker:** all six optional integration names are absent from both the managed file and running process. Public fallback rendering is healthy but cannot save an enquiry here. No required-at-boot variable is missing; no placeholder is appropriate. Previous owner credential deferral remains respected.
2. **Hosted acceptance blocker:** no approved existing-backend test context, staff session or disposable-record/cleanup authorization. Cannot prove submit → stored row → authorized admin read → reload, or private attachment access. This does not establish that the owner's production system is broken or that the code cannot support a wizard.
3. **Existing save-integrity risks, not new regressions:** success is checked against insert error but not a nonempty returned ID; an uploaded file can be orphaned if insert fails; lead, agreement evidence and optional email are separate operations. No idempotency contract is apparent in this action. Preserve Phase 1 findings rather than silently invent transactions or retry semantics.
4. **Existing agreement gate:** current version is looked up at submit/evidence time, not bound to the version read by the visitor. The UI requires acceptance even when fallback terms are unpublished; server gate allows no-agreement cases. Version consistency and partial evidence outcomes need explicit existing-system verification, not a new legal assumption.
5. **Existing upload gate:** validator and copy allow 10 MB, while `next.config.ts` has no raised Server Action `bodySizeLimit`. The earlier 1 MB transport-limit finding remains; no global limit/security change was made as part of this preflight.

Source-only wizard work is technically possible using the mapping above, but it would remain unverified for its central save requirement. This checkpoint deliberately does not present that as a functional phase completion. Do not require migration or a new Supabase project/connection; any eventual testing must use the owner's existing approved persistence environment. Do not repeat the declined credential request automatically.

## Fresh verification

- Reused unchanged Base44 compose; `up -d --build` retained the already healthy source-mounted development container. Port 3000 quote entry returned real HTML, HTTP 200 with an external Host. Next dev logs show live application rendering; `allowedDevOrigins` remains environment-derived.
- **513 tests / 59 files PASS**, TypeScript PASS, lint PASS on unchanged app source. Raw logs alongside this report. No fresh production build was needed or run for this documentation-only checkpoint; Phase 10's build evidence remains historical.
- **3/3 independent read-only browser checks PASS** on source/public proxy at actual 390, 662 and 1440 widths: name fill/retain/clear, invalid then valid email validity, unchecked consent/agreement, optional budget, populated form, no document overflow/page errors, no same-origin POST. No submit, fabricated record or remote save.
- **Iframe interaction UNVERIFIED:** route helper reported changed URL without changed content. One real-link recovery attempt found no matching quote link; stopped rather than patch/restart a healthy app. Independent browser results are not iframe results.
- No UI changes, screenshot/visual sign-off, new interaction implementation, hosted save, admin record read, email, upload, production build, performance or release claim.

## Resume and stop gate

Remain on **Phase 11**, with Phase 10 the last completed scoped phase. A repeat continuation must read this checkpoint, not skip to Phase 12 or re-audit identical blockers indefinitely. Next useful work is either explicitly scoped source-only wizard implementation with the save gate retained, or authorized testing of the existing backend workflow and its integrity issues. Neither requires replacing persistence. Do not claim completion until the wizard interactions and actual stored/admin-reloaded brief are verified.

No application refactor was made because this was a persistence preflight; adding a dormant stepper or reworking unrelated forms would enlarge risk without establishing the required save outcome. Existing Home order, navigation, quote/contact/consultation behavior, SEO, auth, data, security, schema, dependencies and settings are unchanged. All Phase 1/9 and earlier content/private/release blockers carry forward. No PR, merge or deployment. Evidence: `evidence/phase11-30/`.
