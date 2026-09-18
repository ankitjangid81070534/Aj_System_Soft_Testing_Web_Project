# Phase 2 — Customer journeys, friction and no-change contract

2026-09-18 UTC. **Planning only, complete at stated scope.** See [benchmarks](PHASE_2_30_BENCHMARKS.md). Baseline `74cc17e7bde0bd32bcf859058132e1ef044066a1`; no frontend, backend, schema, records, dependencies, credentials or configuration changed.

## Existing shared journey

Home offers `Start Your Project` → `/request-quote`, `Explore Projects` → `/projects`, and `Explore what we build` → `#home-services`. `/services` links to existing details. A detail's `Discuss your project` links to `/request-quote` and `See our work` to `/projects`. Service context is not passed to the form: `q-type` remains empty. `/contact` contains a message form, settings-dependent direct channels and a separate consultation form. None requires creating a portal account merely to open it.

The measured journey starts at `/services`, not a timed first impression on Home. Each buyer below used a real service-card click then the detail's quote CTA at **390×844, 662×900, 820×1180 and 1440×900**: 32 successful navigation cases. This establishes access to the form, not understanding, form completion, saved data or conversion. Startup and custom-software buyers intentionally share a route; there are eight perspectives but seven distinct tested service destinations.

## Eight buyer perspectives

Proposals below are hypotheses for later phases, not changes made or newly approved capabilities.

| Buyer / question | Current route after `/services` | Existing useful content | Friction / uncertainty | Proposed journey (later) | Preserve |
|---|---|---|---|---|---|
| Startup: how do I scope a first useful product? | `/services/custom-software-development` → quote | Requirements specification, phased delivery, platform breadth, preparation FAQ | Must choose among custom/web/SaaS; blank generic enquiry loses the chosen starting point | Need/first-release guidance → existing relevant service → editable context in enquiry → human scope review | No startup-only duplicate page, mandatory signup or invented fixed MVP price/date |
| Shop/retail: can billing and stock work together? | `/services/retail-pos-inventory` → quote | Counter billing, inventory, closing, hardware FAQs | Hardware/offline/location details go into free text; POS versus ERP needs interpretation | Workflow choice → existing retail page → prompts for counters/devices/offline needs → enquiry | Existing retail slug, real hardware discovery rather than blanket compatibility guarantees |
| Hospital/clinic: will this fit staff/patient workflows? | `/services/hospital-clinic-software` → quote | OPD/IPD, appointments, records, roles, billing and process | No approved healthcare proof here; free-form upload may invite sensitive patient records | Existing service → anonymised workflow preparation → enquiry → secure scoped discovery | No patient records in test enquiries, certification invention or medical/compliance guarantee |
| Pharmacy: can batches, expiry and billing work at my counter? | `/services/pharmacy-software` → quote | Batch/expiry, purchase/stock, printer/scanner pilot FAQ | Counter hardware/migration detail not carried into a structured brief; no case proof available | Existing pharmacy service → non-sensitive stock/hardware questions → enquiry | No fabricated product demo, medical advice, guaranteed substitution safety or fake project |
| Business owner: do I need ERP, CRM or an integration? | `/services/erp-business-software` → quote | Staged modules, migration/acceptance FAQs, packaged-versus-custom guidance | Overlapping service vocabulary; integration-only need may be over-scoped | Lightweight comparison → ERP or existing API/integration route → phased requirements → enquiry | Existing buy-versus-build advice, no mandatory full-system replacement |
| SaaS founder: what needs scoping beyond the screens? | `/services/saas-development` → quote | Tenancy, onboarding, subscriptions, roles and pilot process | Form does not prompt tenancy/integration needs; a subscription capability is not a quote | Existing SaaS page → approved preparation prompts → enquiry → discovery | No gateway credentials in forms, billing-provider promise or automatically priced package |
| Website customer: can I get a credible business site? | `/services/website-development` → quote | Brand/responsive design, CMS, enquiry and technical SEO detail | Website versus web-app choice can be unclear; detailed general form may feel disproportionate | Existing website page → concise brief with optional detail → enquiry; offer comparison only if unsure | Indexed URL, existing CMS precedence, no ranking guarantee or forced portal registration |
| Custom-software customer: can you understand our existing systems? | `/services/custom-software-development` → quote | Workflow problems, deliverables, ownership, integration and handover FAQs | Attachments/long brief need reliable save and capacity checks; context is restarted at quote | Existing detail → workflow/users/integration brief → safe attachment → human feasibility review | Current source of truth, optional budget, no unsupported deadline or silent platform commitment |

## Cross-journey friction ledger

| ID / priority | Observation and evidence level | Recommended later disposition / acceptance criterion |
|---|---|---|
| J01 / P1 | All 32 detail-to-quote gestures reach a form with empty project type; source CTA contains no context. | Phases 8/11/13: map only valid existing options, visibly editable and optional. Test each supported mapping, direct entry and browser back. Do not add business persistence to browser storage. |
| J02 / P1 | Quote is one form with three numbered fieldsets, not a multistep wizard. Required inputs: name, email, requirements, response consent and agreement. Budget is optional at all four tested sizes. | Phase 11: preserve minimum-input/direct route and optional budget; prove no field loss across steps and real existing-backend writes before calling a wizard complete. Numbered legends alone do not mean a wizard exists. |
| J03 / P1 | Contact requires phone and company as well as name/email/message/agreement. Consultation requires name/email; phone is optional despite call-oriented copy. Source and form inspection. | Phase 13: owner review of minimum useful fields/contact method and follow-up promise; do not silently weaken server validation or assume a booked slot. |
| J04 / P0 release | Contact has zero configured email/phone/WhatsApp links in this fallback environment. Source already conditionally supports them. | Approved settings and actual channels needed. No new contact system fixes absent configuration; never invent addresses/numbers or infer production absence. |
| J05 / P0 release | Required agreement acceptance links to an unpublished-agreement notice here. Existing Phase 1 consent-version semantics also unresolved. | Approved agreement/current version and readable public result must be verified with persisted evidence; no checkbox removal, invented legal text or SQL replay. |
| J06 / P1 content | Projects have no approved public records here. Honest empty state offers `Browse services` and `Contact us`. Four corrected Browse services gestures pass. | Phase 9: keep escape routes; add proof only with actual approved records/consent. No populated-filter/detail pass claimed. |
| J07 / P1 | Trust/support/preparation answers exist across service FAQs, Home and legal material, not one central help route. Source finding. | Phase 22: link/reuse maintained content; avoid repeating contradictory terms or inventing an SLA. |
| J08 / P0 release | Quote upload advertises 10 MB; Phase 1 found default action body limit conflict. Success-panel response-time copy is source-only; successful saved submissions unavailable. | Phases 11/13/16: prove supported upload and FORM → WRITE → ROW → RELOAD → PUBLIC EFFECT where relevant. Confirm the usual-one-business-day operational promise with owner. |

“P0 release” does not authorize repairs during Phase 2. Severity labels represent dependency/impact judgments, not measured abandonment or production failures.

## No-change areas (binding preservation contract)

- Keep current AJ identity, requirement-led hero, public content and all existing URLs/metadata/SEO rules. Do not copy reference branding, testimonials, statistics, wording or imagery.
- Preserve the compact desktop one-row brand/eight-link navbar and single mobile/tablet Home/Services/More/Projects/Contact dock, active states, search, Portal and legal links. No navigation redesign in this phase.
- Preserve service categories/detail FAQs, native links, optional quote fields, existing forms/actions, validation, consent, spam guards, role boundaries and Supabase source of truth. No replacement backend, fake records or local business database.
- Keep current project/team/review empty states honest; a lack of local records is not proof production has none. Preserve confidentiality/publication conditions.
- Keep reveal-once, reduced-motion/no-JS behavior, native scrolling and existing performance safeguards. No new widget, animation, asset, dependency or analytics code.
- Do not wire `getHomeSections`, replay migrations, change editor policies, activate integrations, write records, publish/deploy, open/merge a PR or advance phases automatically.

## Verification and limitations

- Recovered same-day [browser evidence](evidence/phase2-30/browser.json): 32 service-to-quote gestures through source-mounted dev/public proxy; four contact form inspections; four portfolio-empty recovery gestures using the existing isolated Phase 1 production build (source/config/lock parity was checked during the interrupted run). These are mixed runtime scopes, explicitly recorded in JSON. No application submissions.
- Retained [initial results](evidence/phase2-30/browser-initial.json): portfolio harness wrongly expected a heading for an empty-state paragraph and used an immediate visibility check. Corrected exact-text/bounded destination waits passed; this was a harness correction, not an app fix. A public-proxy recovery attempt stalled and was terminated before the isolated retry.
- Fresh resumed unit/type/lint checks: **431 tests / 52 files passed**, TypeScript and ESLint passed. Same-day existing navigation suite: **3 passed** on loopback isolated production. Raw [quality log](evidence/phase2-30/quality.txt). No new production build claimed for this documentation-only phase; prior Phase 1 passing build was reused for stated checks.
- Live iframe check on continuation: navigation helper changed URL without rendering; one retry through real links timed out. **User-preview gesture and visual sign-off NOT automatically verified.** No screenshot claim, app patch or security weakening was used to hide this. Healthy external-host HTTP 200 and dev route logs remain independent service evidence.
- All six optional integration values remain absent in managed file and running process. No credential request/generation, migration, upload, saved enquiry, email or authenticated action was attempted. Production inspection/deployment, conversion analytics and performance/field-CWV claims are out of scope.

## Phase 3 handoff — not started

After exact continuation, inventory the **current** Home section order and conditional visibility; propose a move/add/change/no-change ledger tied to J01–J08. Preserve useful content and distinguish unavailable proof from missing sections. Do not enact hierarchy changes or activate Builder defaults. Full backend gates remain blocked independently of planning progress.
