# Phase 2 — visitor journeys and decision paths

Date: 2026-09-12. Planning hypotheses grounded in existing source/routes, not interviews, analytics or proof of buyer demand. Read alongside [IA/movement ledger](PHASE_2_INFORMATION_ARCHITECTURE.md) and [benchmark evidence](PHASE_2_BENCHMARKS.md).

**Shared value proposition:** AJ System Soft Technology builds software around the client's requirements. Visitors should not need to identify a programming language before finding a relevant service. Preserve every current capability and existing route; do not create seven new persona landing pages.

## Seven required perspectives

| Visitor | Wants to know in the first 5 seconds | What they should see next | Proof/questions needed before commitment | Available CTA / existing destination | Page answering the detailed question |
|---|---|---|---|---|---|
| Small business owner | Can you replace our spreadsheets/disconnected tools with something that fits us? | Requirements-led working principles, business-system capability, relevant workflow examples described as capabilities | Who owns the software? Can existing data/tools be considered? What is the scoped delivery/support process? Show actual comparable work only if approved/public | Start Your Project → `/request-quote`; unsure of scope → `/contact` | `/services/erp-business-software`; `/services/custom-software-development`; planning article `/blog/what-erp-digitization-actually-means-for-small-businesses` |
| Hospital/clinic owner | Do you understand clinic workflows rather than just offer a generic website? | Healthcare capability and service detail, then a real healthcare project if one exists | Workflow fit, roles/privacy, migration/support responsibilities and actual evidence; no unsupported medical/security compliance certification | Request a Consultation → `/contact`; defined requirements → `/request-quote` | `/services/hospital-clinic-software`; pharmacy needs → `/services/pharmacy-software` |
| Retailer/shop owner | Can this cover stock, billing and day-to-day shop work? | Retail POS/inventory service; distinguish in-store operations from an online storefront | Relevant screens/workflow evidence if approved; ask about stock, hardware, data import, offline needs and support without promising unverified integration | Start Your Project → `/request-quote`; discovery conversation → `/contact` | `/services/retail-pos-inventory`; online selling → `/services/ecommerce-development`; local-machine needs → `/services/desktop-software-development` |
| Startup | Can you turn an idea into a scoped first product without assuming every feature at once? | Custom software/platform options and the existing discovery/proposal process | Clear scope/iterations, ownership/handover, real applicable project evidence, trade-offs before an estimate; no guaranteed launch date or funding outcome | Start Your Project → `/request-quote`; still comparing → `/contact` | `/services/custom-software-development`; `/services/web-application-development`; `/blog/how-to-plan-a-custom-software-project` |
| SaaS founder | Can you build a maintainable product around our roles, users and business model? | SaaS service → relevant real work → delivery/technical capability → ownership/support | Discussion of tenancy, access, integration and operations; real architecture/project evidence when publishable; subscriptions are a capability topic, not a verified payment integration in this app | Start Your Project → `/request-quote`; architecture discovery → `/contact` | `/services/saas-development`; `/services/api-system-integrations`; `/services/cloud-deployment-maintenance` |
| Client needing a website | Do you build a professional site, not only complex enterprise software? | Website service first; distinguish a business website, web application and ecommerce | Relevant real designs if available; content/responsiveness/accessibility/hosting responsibilities and maintenance scope; no ranking guarantees | Start Your Project → `/request-quote`; see work → `/projects` | `/services/website-development`; `/services/ecommerce-development` when selling online |
| Client needing custom software | Will you understand our unusual workflow and choose the right platform? | Requirements-first process → custom software detail → platform choices → applicable real work | Problem/scope/deliverables, five delivery stages, handover/source ownership, maintenance and estimate process; no one-size-fits-all price promise | Start Your Project → `/request-quote`; Request a Consultation → `/contact` | `/services/custom-software-development`; `/services/api-system-integrations`; `/blog/web-app-or-mobile-app-choosing-the-right-platform` |

## Concrete paths — no new behavior implied

1. **Small business:** `/` → `/services` → `/services/erp-business-software` → inspect relevant public project if available → `/request-quote` or `/contact`.
2. **Clinic:** `/` → `/services` → `/services/hospital-clinic-software` → review actual scope/process → `/contact`.
3. **Retail:** `/` → `/services/retail-pos-inventory` through the existing service index → compare ecommerce/desktop options only when relevant → `/request-quote`.
4. **Startup:** relevant existing planning article or `/` → custom software/web-application detail → real project proof if present → `/contact` or `/request-quote`.
5. **SaaS:** `/services/saas-development` → relevant integrations/support detail → `/projects` if useful → `/request-quote`.
6. **Website:** `/services/website-development` → `/projects` → `/request-quote`.
7. **Custom workflow:** `/services/custom-software-development` → existing delivery/process information and relevant related service → `/contact` or `/request-quote`.

These are desired decision sequences through existing destinations, not a claim that every suggested contextual cross-link or filter already exists. Homepage industry/platform cards are currently descriptive, not clickable persona selectors. Do not present those cards as working navigation in a handoff. Any later link additions must be explicit, point to real matching routes, preserve copy and be tested as real gestures.

## Staged decisions and honest failure handling

| Stage | Visitor task | Content/route responsibility | If evidence/integration is missing |
|---|---|---|---|
| Orient | Understand company and platform fit | Existing hero, TrustStrip and Services entry | Retain real capability copy; no fabricated customer numbers |
| Select | Find a relevant service without technical jargon | Service index/detail plus platform explanation | Full index remains reachable when the six-item home feed lacks a particular service |
| Validate | Decide whether to trust delivery capability | Real projects, real feedback, delivery process, ownership, genuine team | Omit unavailable home proof sections under their existing conditions; preserve honest index empty states; capabilities are not claimed outcomes |
| Clarify | Resolve scope, platform and handover concerns | Service detail, planning article, contact/legal routes | State questions for discovery rather than invent a price, SLA, legal certification or stack guarantee |
| Enquire | Share a requirement or request a conversation | Existing quote/contact/consultation flows | Display actual validation/configuration failures; configured email/phone/WhatsApp only if settings supply them |
| Confirm | Know whether the enquiry was saved and what happened next | Real server result; later verified delivery behavior | An HTTP 200 action response or a button click is not success. Saved record and email delivery are separate outcomes |
| Return | Manage a genuine client relationship | Portal login/account and recovery | Keep signup/auth out of the enquiry path; respect real sessions and current unavailable-configuration states |

### Conversion contract

- Header project CTA and hero/finale project CTA remain the primary intent; current label differences are preserved, not silently standardized.
- The secondary proof path `/projects` remains available even while the dataset is empty. Do not relabel “Explore Projects” as “See proven results” without real evidence.
- Contact is the low-commitment alternative, but it is not automatically a working external channel: current settings may have no email/phone/WhatsApp, and forms cannot persist without configuration.
- Quote entry must not force authentication. Portal is a separate returning-client task.
- No field is removed, consent bypassed, attachment handling changed or hidden tracking introduced in this phase.
- Prospective cost/timeline/support statements must be scoped through the actual agreement/estimate, not borrowed from benchmark companies.

## Gaps and later actions

| Observed gap or risk | Planning response | Owner of later work / gate |
|---|---|---|
| Extensive service breadth can delay recognition | Reach service selection earlier in the proposed narrative; retain platform explanation as a distinct question | Phase 5 only after material movement approval |
| ServiceJourney shows a subset; a visitor's niche may not be among those services | Preserve an obvious full Services destination; group the complete 15-route taxonomy only as a finding aid | Phases 4/5/7; do not alter home data limits now |
| Projects/reviews/team unavailable in current unconfigured state | Use genuine process/capability information without claiming it is independent proof; keep conditional rendering | Resolve Phase 1 data provenance and later content approvals |
| Startup/SaaS questions may exceed current case-study evidence | Treat architecture, scale and subscription needs as discovery questions | Actual scope/project evidence required; no invented metrics or guarantees |
| Healthcare and retail imply operational/security expectations | Explicitly discuss requirements before promising integrations/compliance | Owner-approved service scope and real implementation evidence |
| Moving process/support may change scroll comprehension | Preserve all five stages and descriptions; do not make motion a reading prerequisite | Phase 6 keyboard/mobile/reduced-motion checks after approved composition changes |
| No live enquiry success without integrations | Preserve truthful failures and mark funnel completion blocked | Deferred Phase 1 auth/DB/email verification, not cosmetic work |
| Home Builder does not drive the public composition | Do not pretend the proposed order is a working CMS configuration | Separate functional integration decision with real saved section inventory |

## Proposed evaluation protocol (not run)

Recruit representatives of the seven audiences; avoid treating teammates or generated personas as actual research participants. Ask first-five-second comprehension, a first-click service task and a proof/contact task without telling them where to click. Record misinterpretations, route taken, whether proof actually exists and whether they understand what happens after submitting. Do not collect patient/customer datasets as sample requirements.

Future success criteria: visitors can describe the service fit and source-ownership relationship, choose an existing matching service or an honest discovery path, distinguish capability statements from case studies, and recognize genuine success versus failure. Measure task results before setting conversion-rate claims. No experiments, analytics, user sessions or successful submissions were created during Phase 2.
