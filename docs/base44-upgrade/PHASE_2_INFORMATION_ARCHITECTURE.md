# Phase 2 — information architecture plan

Date: 2026-09-12. Source HEAD: `a82b42bfbca4a4f4c370764696c0682a522243c0`. Branch: `upgrade-desktop-navbar`.

**Planning deliverable complete; no implementation or homepage reorder authorized by this document.** The owner selected “Start Phase 2 planning” after explicitly being told that this defers unresolved Phase 1 checks rather than marking them passed. Phase 1 remains incomplete. This is not a production-readiness waiver.

Companion documents: [visitor journeys](PHASE_2_USER_JOURNEYS.md), [external pattern research](PHASE_2_BENCHMARKS.md), [current phase gate](PHASE_STATUS.md), [deferred functional audit](PHASE_1_FUNCTIONAL_AUDIT.md).

## 1. First-five-seconds brief

A visitor should be able to answer:
1. **What is this company?** AJ System Soft Technology builds software around client requirements.
2. **Does it cover my need?** Custom software, websites/web applications, SaaS, mobile and business/industry systems.
3. **What is the working relationship?** Requirements-led delivery, source ownership and support after launch — existing working principles, not independent proof of completed projects.
4. **Where next?** “Start Your Project” for a defined need; “Explore Projects” for evidence; “Explore what we build” for service discovery.

Existing hero copy already communicates this: “Software built around your requirements.” The description names the principal platforms; the three hero points cover requirements, ownership and support. Preserve that substance. Improve comprehension later through hierarchy, not unsupported promises, extra claims or a new slogan in this phase.

The contact/quote destinations exist, but successful submission is blocked by missing integrations. A convincing CTA is not evidence of working lead capture. Keep current truthful error states until Phase 1 gates are resolved.

## 2. Existing architecture — source of truth

The public route `website/src/app/(public)/page.tsx` reads home content, settings and launch benefits, then renders `components/design-preview/HomeExperience.tsx`. That component is shared with `/design-preview`; changes to it can affect both routes. It is not currently composed from the Home Builder `page_sections` records.

The public layout owns navigation, skip link, announcement, footer and optional offer popup. Do not move those concerns into the homepage or bypass managed navigation/settings.

| ID | Current main-content order | Source / conditions | Content to preserve |
|---|---|---|---|
| H01 | Hero | HomeExperience; OrbitArtwork | Existing H1/description, availability badge, three delivery points, both CTAs, `#home-services` scroll link |
| H02 | TrustStrip | site/TrustStrip.tsx | Requirements-first process, ownership, maintenance/support, clear communication and descriptions |
| H03 | Launch Benefits | HomeExperience; only if benefits exist | Every returned benefit title/description and current `#included` anchor; no invented default records |
| H04 | Service introduction + ServiceJourney | HomeExperience + design-preview/ServiceJourney.tsx | `#home-services`, introduction/index CTA, service names/descriptions/categories and every existing detail link |
| H05 | PlatformsShowcase | site/PlatformsShowcase.tsx | All six platform categories and explanatory copy; currently descriptive cards, not clickable filters |
| H06 | FeaturedProjects | site/FeaturedProjects.tsx; hides when empty | Up to six real public projects, linked case studies, cover/client/platform/industry/summary and index link |
| H07 | DeliveryProcess | design-preview/DeliveryProcess.tsx | `#delivery`; all five stages, descriptions, selection controls and no-script alternative |
| H08 | Ownership/support feature | HomeExperience; OwnershipOrbit | “You own your software. We help it grow.”, handover/support details and service CTA |
| H09 | Industries | site/Industries.tsx | All eight industry labels; no invented industry landing pages |
| H10 | TechCapabilities | site/TechCapabilities.tsx | Existing web/mobile/backend/desktop/cloud groupings and technology entries |
| H11 | WhyUs | site/WhyUs.tsx | Requirements lead/code follows, end-to-end delivery, maintainability and all other existing principles/descriptions |
| H12 | TestimonialsSection | site/TestimonialsSection.tsx; hides when empty | Real returned reviews, author/project details, rating, response and current verification presentation; hosted provenance still requires audit |
| H13 | TeamSection | site/TeamSection.tsx; hides when empty | Up to four real members and full-team link when applicable; no fabricated staff profiles |
| H14 | BlogPreviewSection | site/BlogPreviewSection.tsx; hides when empty | Existing article teasers, covers when supplied, detail links and index CTA |
| H15 | Final project CTA | HomeExperience; CosmicBackdrop | Existing question, explanation, Start Your Project and Request a Consultation |

**Persistent shell:** managed announcement → accepted header → skip-link target/main → footer → optional managed offer popup. These remain outside the numbered main-content sequence. No announcement, popup, legal link or utility is removed by the proposed IA.

Conditional visibility is not deletion: a proposed sequence must keep the same conditions and existing data ordering/limits. With no real projects/reviews/team/benefits, no empty proof panel or substitute testimonials should appear. Existing blog/service fallback copy is not a new case-study dataset.

## 3. Proposed narrative and explicit movement ledger

**Recommended future narrative:** understand the offer → recognize the right service/platform → inspect real work → recognize industry fit → understand why/how delivery works → examine technical capability and ownership → see genuine people/feedback → read further → enquire.

Proposed main-content sequence:

`H01 → H02 → H04 → H05 → H06 → H09 → H11 → H07 → H10 → H08 → H03 → H12 → H13 → H14 → H15`

Header/footer remain in place. This retains every existing component/content unit; it does not add a second service catalogue or new industry route. Launch Benefits stays conditional. Reviews/team stay conditional and retain their relative order.

| CURRENT → PROPOSED | REASON | RISK | APPROVAL / IMPLEMENTATION STATUS |
|---|---|---|---|
| H01 hero first → first | Maintain first-five-second orientation | Low if content/actions remain intact; avoid conflating decorative art with product evidence | Preserve; no change now |
| H02 principles second → second | Answer working-relationship concerns immediately | Calling these “client proof” would overstate evidence | Preserve and classify correctly |
| H03 benefits before services → after ownership/support | Keep detailed inclusions with handover/care instead of delaying service recognition | **Material move:** lowers benefits in reading order; active offers/benefit prominence may matter commercially | **Needs owner approval before reorder** |
| H04 service introduction/journey fourth → third | Reach the relevant solution earlier | Fewer intervening sections may alter scroll scenes/anchor offsets | Material order proposal; preserve every service/link |
| H05 platform breadth fifth → fourth, still after services | Answer “which platform?” without replacing service detail | Repetition with services; descriptive cards must not falsely imply interactivity | Keep both blocks; no merge/removal authorized |
| H06 projects sixth → fifth, still after platforms | Real evidence before lengthy delivery explanation | Currently empty without CMS; no invented outcomes to fill the slot | Keep current conditional rendering |
| H09 industries ninth → sixth | Help clinic/retail/business owners recognize relevance sooner | **Material move:** changes reading/scroll order; no new claims of specialist compliance | **Needs owner approval before reorder** |
| H11 working principles eleventh → seventh | Explain selection rationale before process detail | **Material move:** repetition with TrustStrip; consolidation could remove content | **Needs owner approval; do not delete repeated content** |
| H07 delivery seventh → eighth | Explain execution after fit and principles | Scroll-pinned stage activation and `#delivery` alignment may be affected | Covered by reorder approval; later gesture/reduced-motion tests required |
| H10 technology tenth → ninth, after delivery | Technical validation after business meaning | Avoid promoting technology badges into certification claims | Preserve all entries; no stack change |
| H08 ownership eighth → tenth, then H03 | Keep handover and inclusions together | **Material move:** flagship artwork and promise become later content | **Needs owner approval before reorder** |
| H12 reviews → twelfth | Genuine social evidence only when present | Must not infer verification merely from a component label | Preserve; provenance is a deferred integration gate |
| H13 team → thirteenth | Human reassurance without disrupting primary discovery | No placeholder names/headshots | Preserve |
| H14 insights → fourteenth | Research path before closing CTA | Must retain current article URLs/covers/excerpts | Preserve |
| H15 closing CTA → fifteenth | Offer a next step after detailed consideration | Enquiry delivery remains unverified | Preserve routes and honest failure states |

**Approval boundary:** this is a proposal, not approval to move H03/H09/H11/H08 or implicitly shift neighboring content. Phase 5 must obtain approval for this explicit order (or retain the existing order). Phase 3 tokens/components must not quietly implement it. No approval is needed merely to retain the current live order.

## 4. Navigation and route architecture — preserve URLs

### Accepted global navigation

Exactly eight default desktop links remain: **Home, Services, Projects, AI Methods, Reviews, About, Team, Contact**. Preserve the visible left brand, centered compact group, login/search/project actions, 1024px desktop breakpoint and current 64px/60px height behavior. No new top-level Industries, Blog or Pricing link; no desktop More menu.

Below desktop, retain the dock **Home / Services / More / Projects / Contact** and existing overflow/utilities. “More” remains navigation, not a new lead funnel. Preserve keyboard search, Escape/focus restoration, active states, theme and Portal behavior.

The footer retains Build, Company, Portal & Legal groups; blog, quote, login, agreement, privacy and terms stay discoverable there. CMS-managed entries remain authoritative when configured; this is not permission to overwrite them with static defaults.

### Existing route responsibilities

| Route family | Visitor question / responsibility | Next step |
|---|---|---|
| `/` | What do you build, for whom, and how do I start? | Service discovery, real work, project enquiry |
| `/services` | Which capability fits my problem? | Existing service detail |
| `/services/[slug]` | Scope, deliverables, process, relevant FAQs and platform fit | `/request-quote`; related work/services where real data supports it |
| `/projects`, `/projects/[slug]` | What relevant work can you actually show? | Relevant service or quote; preserve confidential/public boundaries |
| `/ai-methods` | How is AI used in the work? | Explain only verified methods; existing schema/data blocker is not an invitation to invent content |
| `/reviews` | What do real clients say? | Existing approved feedback or truthful empty state, then contact |
| `/about`, `/team` | Who am I choosing? | Working principles/real people, then contact or service detail |
| `/blog`, `/blog/[slug]` | How should I plan or compare approaches? | Related existing service → quote/contact |
| `/request-quote` | I can describe a project | Existing validated enquiry flow; success only after actual persistence |
| `/contact` | I need a conversation or direct contact | Existing contact/consultation forms and configured direct channels |
| `/login`, `/signup`, recovery routes, `/account` | Existing/new client account tasks | Existing auth flows; never a mandatory gate for an enquiry |
| Legal routes | What terms and data practices apply? | Preserve current agreement/privacy/terms links and acceptance behavior |
| `/ajadmin/**` | Staff administration, not a marketing journey | Existing capability gates/noindex; separate from public IA |

`/offers` and `/updates` route gaps remain deferred from Phase 1. Do not link new conversion paths to them or create speculative content. `/design-preview` remains a noindex work surface, not a public navigation destination. Preserve all slugs/canonicals; no new indexed persona/industry pages or keyword expansion in Phase 2.

### Service finding aid (planning taxonomy, not new routes or runtime categories)

Retain the current six platform cards and all 15 existing service URLs. This taxonomy explains how a future service-finding layer could group them; it does not replace the six-item home feed, alter CMS ordering or remove descriptive copy.

- **Websites & Web Apps:** `/services/website-development`, `/services/web-application-development`, `/services/ecommerce-development`.
- **SaaS Platforms:** `/services/saas-development`.
- **Android & iOS Apps:** `/services/android-app-development`, `/services/ios-app-development`.
- **Windows Desktop & EXE:** `/services/desktop-software-development`.
- **ERP, CRM & Admin Panels:** `/services/erp-business-software`.
- **Industry-Specific Software:** `/services/hospital-clinic-software`, `/services/pharmacy-software`, `/services/retail-pos-inventory`, `/services/hotel-management-software`.
- **Cross-cutting needs, not new platform cards:** `/services/custom-software-development`, `/services/api-system-integrations`, `/services/cloud-deployment-maintenance`.

All 15 are present in `lib/data/services-fallback.ts`; this verifies source routes, not live commercial availability, case-study results or a configured CMS record. Ambiguous needs should go to the existing service index or contact, not an invented “MVP development” or industry landing page.

## 5. CTA and content contracts

- Preserve current CTA strings/destinations. Header default **Start Project**, hero/finale **Start Your Project** → `/request-quote`; hero **Explore Projects** → `/projects`; finale **Request a Consultation** → `/contact`; **Explore all services** → `/services`.
- Proposed intent hierarchy: one dominant enquiry action; secondary proof action; contextual service/detail actions. Do not force account signup, add checkout, promise fixed prices/timelines or turn exploratory clicks into conversion success.
- Existing project proof can be sparse. Keep the project route/CTA and truthful empty states rather than fabricate examples, client logos, star ratings or metrics.
- TrustStrip, technology lists and delivery copy are company statements, not verified testimonials/certifications. External-company results from benchmarking must never appear as AJS results.
- Contact email/phone/WhatsApp/map links are conditional on settings. Do not invent a working channel when settings are absent; record the conversion blocker.
- Preserve agreements, consent, validation, uploads, rate limits and error handling. Do not shorten forms or prefill hidden selections as a side effect of IA changes.
- No public data records are added, edited, published or reordered here. No new promises such as free support forever, compliance certification or guaranteed response time.

## 6. Later-phase handoff and acceptance

| Later phase | Permitted handoff from this plan | Gate |
|---|---|---|
| 3: design-system foundation | Consistent tokens/shared primitives; sharpen icons, focus/contrast and mobile-safe elevation | Fresh phase command; preserve accepted navbar and all content order; capture required before/after views when implementing |
| 4: navbar/hero conversion UX | Improve clarity within accepted composition/actions | No nav item removal, link rename, auth regression or invented proof |
| 5: homepage structure/UI | Apply only an explicitly approved movement ledger | Owner approval for material moves; preserve conditional/data/link/anchor contracts; Home Builder integration is still unresolved |
| 6: motion | Support comprehension, not gate content behind scrolling | Retest service/process gestures, mobile, keyboard and reduced motion; do not lengthen journeys solely for effect |
| 7: inner public pages | Use persona paths and consistent service/proof/contact responsibilities | Existing routes only unless separately authorized; real proof before new claims |
| 8–9: portal/admin | Keep authenticated tasks separate from prospect navigation | Reopen deferred integration verification before claiming successful auth/CRUD |
| 10–12: technical/content SEO | Preserve route identity now; use this intent map later | No keyword-volume claims or thin persona pages from this planning exercise |
| 13–17: performance/regression/release | Verify source preservation, real behavior and accessibility | Phase 1 blockers remain release blockers; Phase 2 completion does not waive them |

### Planned evaluation (not executed user research)

- Five-second comprehension: representative visitors identify custom software focus, relevant capability, source ownership and an obvious next step in their own words. Do not quote a success percentage until tested.
- First-click tasks: each of the seven personas in the journey matrix can reach an existing relevant service without needing to understand technology terminology.
- Proof integrity: every visible project/review/member comes from approved public data; empty data never creates fabricated proof.
- Preserve `#main-content`, `#home-services`, `#included` when rendered, `#delivery`; keyboard focus/anchors follow any approved new order.
- Future analytics should distinguish service selection, proof view, enquiry intent, submission attempt, server-confirmed save and delivery failure. No analytics SDK/events installed here; no personal form content in event payloads.
- Before a later visual implementation, compare existing/planned order, source text, managed links and desktop/mobile/reduced-motion behavior. No visual or conversion-performance improvement is claimed by this documentation-only phase.

## Completion boundary

Done: current IA/source inventory, preserved route taxonomy, benchmarked patterns, seven persona journeys, first-five-second/CTA/proof requirements, CURRENT → PROPOSED → REASON → RISK ledger and later-phase gates. Not done: live reorder, redesign, user research, new features, provider setup or resolution of Phase 1 blockers. Stop here; Phase 3 requires the next explicit phase command.
