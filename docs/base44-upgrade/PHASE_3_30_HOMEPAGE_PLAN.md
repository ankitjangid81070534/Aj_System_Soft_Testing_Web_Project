# Phase 3 — Information architecture + homepage plan

2026-09-18 UTC. **Planning complete; no implementation.** Authorized by the new `START NEXT PHASE SAFELY` after Phase 2 completion. Branch: `initial-setup`; pre-documentation baseline: `7ae88b822249f6a8884ba1ab28d452843a433f1d`.

Authority: [current 0–29 master](MASTER_PLAN_30_PHASES.md). Inputs: [Phase 2 benchmarks](PHASE_2_30_BENCHMARKS.md), [J01–J08 journeys/preservation contract](PHASE_2_30_CUSTOMER_JOURNEYS.md), [Phase 1 backend gates](PHASE_1_30_DATA_SAVE_AUDIT.md). The old `PHASE_2_INFORMATION_ARCHITECTURE.md` belongs to the earlier program: its proposed order and phase numbers are historical, not approval. No source, styles, configuration, dependencies, data or routes changed here.

## 1. Purpose and current composition authority

Home should answer what AJ builds, which service fits, what real proof is available, how delivery works, what ownership/support means, and how to enquire. The existing requirement-led hero already does the first job. The proposal improves reading order and reduces competing messages; it does not replace the accepted identity or promise a measured conversion improvement.

`website/src/app/(public)/page.tsx` reads Home content, settings and benefits in parallel and renders `components/design-preview/HomeExperience.tsx`. Metadata/JSON-LD and the 300-second static revalidation contract stay with the route. `/design-preview` shares this composition, so later changes require checking both surfaces.

The public layout owns announcements, skip link, header, footer and popup offer through `PublicSiteFrame`. They are not Home Builder sections. `lib/data/sections.ts:getHomeSections` is **not called by Home**; its twelve defaults omit accepted benefits, ownership and articles. Wiring it in is not a shortcut for this plan. Existing saved rows, hidden/error semantics, variants, publication and cross-page gallery usage require separately approved reconciliation.

## 2. Current Home inventory — preserve every useful unit

Paths below are relative to `website/src/`. H01–H15 intentionally retain the historical inventory IDs for comparison, but the table was checked against current source and the live Home document. These are content units, not an assertion of fifteen rendered HTML sections: H04 has an intro and journey; conditional units can be absent.

| ID / order now | Component / current content | Source, visibility and links | Disposition |
|---|---|---|---|
| H01 / 1 | `design-preview/HomeHero.tsx`; “Software built around your requirements.”, capability description, three delivery points, five additional-service chips | Always rendered. `Start Your Project` → `/request-quote`; `Explore Projects` → `/projects`; explore → `#home-services`. Availability is company copy, not verified capacity. | Keep first; no new slogan, proof counters, video or hero delay. |
| H02 / 2 | `site/TrustStrip.tsx`; requirements-first process, ownership, maintenance/support, clear communication | Static four-item “How we work” region; no links. Company value statements, **not client proof**. | Keep immediately after hero; do not duplicate as a second trust strip. |
| H03 / 3 | `HomeExperience.tsx`; “What's included with every project” and all returned benefit titles/descriptions | `#included`; only when benefits nonempty. `lib/data/growth.ts` returns six defaults when unconfigured/error, up to twelve active ordered rows when configured, and `[]` for a successful empty query. | Keep early in this proposal; retain eligibility qualifications and all content. Claims need owner/legal confirmation before copy changes. |
| H04 / 4 | Home services intro + `design-preview/ServiceJourney.tsx` | Intro/`#home-services` always exists; `/services` index CTA. Journey/`#capabilities` absent if services empty; existing detail links and descriptions/categories, up to six Home services grouped into scenes. | Keep together; do not turn the six-item teaser into a duplicate fifteen-service hub. |
| H05 / 5 | `site/PlatformsShowcase.tsx`; “One team, every platform” | Six static descriptive cards: Websites & Web Apps, SaaS Platforms, Android & iOS Apps, Windows Desktop & EXE, ERP/CRM/Admin, Industry-Specific Software. Currently **not clickable filters**. | Retain as platform breadth within the capability region, not a second service catalogue. |
| H06 / 6 | `site/FeaturedProjects.tsx`; “Featured projects” | Hides when empty; up to six active/public/published projects, featured-first then sort order. Client names resolve through permitted public reads. Detail links + `/projects`. | Keep real-work slot after capabilities; no placeholder work. Home hides it, while `/projects` retains its honest empty state/exits. |
| H07 / 7 | `design-preview/DeliveryProcess.tsx`; “From your requirement to a working product” | `#delivery`; five selectable stages and descriptions, native-scroll enhancement, no-script list. Always present. | Retain every stage and behavior; proposed location follows industry fit. |
| H08 / 8 | Ownership feature in HomeExperience; “You own your software. We help it grow.” | Always rendered; source/documentation handover and ongoing care; `/services` CTA. OwnershipOrbit is decoration, not product proof. | Retain after technology in proposed order; later link to approved terms/help, not another ownership panel. |
| H09 / 9 | `site/Industries.tsx`; “Software for the way your industry works” | Eight static labels: healthcare, pharmacy, retail, hospitality, manufacturing, logistics, education, professional services. Currently non-interactive. | Move before delivery, subject to approval. No new industry routes or compliance claims. |
| H10 / 10 | `site/TechCapabilities.tsx`; “A modern, maintainable stack” | Four technology groups; decorative duplicated marquee is aria-hidden. Always rendered. | Follow delivery, before ownership. Preserve entries, reduced-motion behavior and factual qualification. |
| H11 / 11 | `site/WhyUs.tsx`; “Why teams choose AJ System Soft Technology” | Four static principles: requirements, end-to-end delivery, maintainability, security/ownership. | Retain useful descriptions after ownership; future editorial differentiation from H02 is not deletion approval. |
| H12 / 12 | `site/TestimonialsSection.tsx`; “Real reviews from real software projects” | Hides when empty; loader limits three published/active/public/verified rows. Displays supplied author/project/rating/response. | Keep conditional and genuine. Source filters/labels do not independently establish provenance or hosted RLS. |
| H13 / 13 | `site/TeamSection.tsx`; “The people behind AJS Technology” | Hides when empty; Home requests up to eight, component shows first four, full-team link only if more than four returned. | Keep all real member fields and current link condition; never fabricate people. |
| H14 / 14 | `site/BlogPreviewSection.tsx`; “Engineering & architecture notes” | Hides if posts empty; Home uses first three returned posts, with existing fallback guides. Article detail links and `/blog` index CTA. | Keep before optional preparation/help and final CTA. Do not republish research keywords. |
| H15 / 15 | Home finale; “Ready to build software around your requirements?” | Always rendered; `Start Your Project` → `/request-quote`; `Request a Consultation` → `/contact`. Not a direct scroll to a booked appointment. | Retain as Home's main closing action. Post-enquiry expectations require operational confirmation. |

### Public shell — also part of the inventory

- **Before main:** eligible top-bar announcement, existing metadata scripts/skip link and accepted header. Retain CMS navigation precedence, eight default desktop destinations, Privacy/Disclaimer supplements, search, Portal and CTA.
- **Mobile/tablet:** one Home/Services/More/Projects/Contact dock, existing masthead and safe-area clearance. No new navigation system in this plan.
- **Footer (`components/ui/Footer.tsx`):** an additional full-width “Software built around your requirements.” CTA → `/request-quote`, then brand/social content and Build, Company, Portal & Legal groups (managed Explore links substitute the first group when configured). Registration/legal copy remains unchanged; inspection is not verification of its claim.
- **After footer:** optional eligible offer popup, with existing selection/frequency behavior. No homepage announcement/offer grid is mounted by HomeExperience merely because CMS placement options exist.
- **Not present on Home:** dedicated FAQ/help block, live AI help, requirement wizard or floating contact hub. Existing service-detail FAQs, contact/consultation and articles are not missing features to recreate. Later phases own any genuinely new entry surface.

## 3. Observed current fallback versus possible data states

Live preview at **662×580** on `/` contained thirteen Home section elements: hero, value strip, benefits, services intro, service journey, platforms, delivery, ownership, industries, technology, principles, insights, finale. Projects, reviews and team were absent, consistent with unconfigured data; this is **not proof they are absent in production**. There was no dedicated FAQ block. Raw heading text includes accessible text plus aria-hidden MotionWords duplicates; do not misreport that as two visible headings or delete accessible spans.

No errors/failed requests/error overlay were captured by the live diagnostic; main contained two children and Home was mounted. A screenshot attempt returned `iframe_hidden`; **visual appearance and responsive/gesture regression are not newly signed off**. The earlier Phase 2 iframe navigation failure is historical, not this phase's result.

State contracts for any later implementation:

1. No backend configured: keep existing real-capability service/benefit/article fallbacks and hide optional proof; do not manufacture records.
2. Configured public rows: preserve publication/activity/privacy filters, ordering/limits, every supplied field and approved client attribution. Never use staff/private reads as public proof.
3. Configured all-hidden/empty: retain each reader's existing semantics. Services can intentionally return empty when records exist but none are public; intro/index CTA remains. Benefits may intentionally be empty. Do not replace deliberate hides with defaults.
4. Read failures: source currently falls back/hides by reader. This is continuity, not backend health. Any change to error-versus-empty behavior is separately scoped backend work.
5. Scheduled growth: preserve eligible top bar/popup only; current cache timing/placement limitations remain Phase 1/18 gates, not new promises of instantaneous changes.

## 4. Proposed hierarchy — recommendation, NOT applied

**Hero → existing value strip → launch benefits → services + platforms → real projects (if available) → industries → process → technology → ownership/support → existing selection principles → real reviews + team (if available) → articles → compact help/preparation entry (future, approved) → final CTA → footer.**

Content-ID order: `H01 → H02 → H03 → H04 → H05 → H06 → H09 → H07 → H10 → H08 → H11 → H12 → H13 → H14 → [A01] → H15 → shell footer`.

This consciously differs from the older program's proposal: **do not move launch benefits below ownership** or move WhyUs ahead of delivery by following an old ledger. The current recommendation keeps benefits early as in the new master. All existing units survive. A01 is only a future content proposal, not a new route or component implemented now.

| Ledger | Move / add / change / keep | Why / journey connection | Risk and approval gate |
|---|---|---|---|
| M01 | H09 industries: after ownership → before delivery | Clinic/pharmacy/retail/business buyers recognize fit before detailed process; Phase 2 J01/J07. | Material move: native-scroll geometry, focus and anchors must follow actual DOM order; owner approval before implementation, likely Phase 10. |
| M02 | H07 delivery follows industries; H10 technology follows delivery; H08 ownership follows technology | Fit → execution → technical reassurance → handover. J07/J08. | Material relative-order changes; retain all five stage controls, no-JS text and existing scenes. No assumption of improved conversion/performance. |
| K01 | Keep H01–H06 in present relative order, including early H03 benefits | Current hero already states offer; retain commercial inclusions, service discovery and real-proof slot. | Do not promote values/capability art into proof or invent projects to fill the conditional gap. |
| K02 | Keep H11–H14 content and conditional H12/H13 | Preserve selection rationale, genuine people/reviews and educational paths. | Repetition alone is not permission to remove descriptions; proof/consent gates persist. |
| C01 | Differentiate H02 summary from H08 ownership detail and H11 selection rationale in a later copy review | Reduce repeated requirements/ownership/support messaging without losing meaning; J07. | Proposed editorial work only. Record exact before/after copy and retained destination before approval; no legal rewrite. |
| C02 | Review H03 universal heading versus qualified benefit descriptions | “Every project” coexists with “Eligible”, “Where applicable” and offer terms; J05. | Owner must confirm actual inclusions, six-month terms and Android offer eligibility. Do not broaden/withdraw benefits or fabricate agreement text. |
| C03 | Keep H15; consider compacting the shared footer CTA on Home only | Current Home finale is immediately followed by a second large enquiry CTA. Avoid two competing closing pitches; J02/J07. | **Separate approval required** for any removal/compaction. Retain all unique Home consultation copy/action and footer navigation/legal/social content; inner-page footer behavior untouched. |
| A01 | Add a compact, nonduplicative preparation/help entry before H15 in Phase 22, only after content approval | Reuse existing service FAQs, useful guides and agreement/privacy/contact destinations for unsure buyers; J05/J07. | Not a second full FAQ library or new `/help` route by default. Approved maintained answers/links first; legal gaps cannot be solved with improvised summaries. |
| K03 | Keep current header, mobile dock, legal links, utility actions, announcement and popup | Existing navigable shell; Phase 2 no-change contract. | New phase-specific refinements must preserve functionality; no shell redesign or extra floating widget now. |
| C04 | Later clarify expectation/context at enquiry entry, not by adding another Home form | Service context and form follow-up belong to existing journeys; J01–J03/J08. | Phases 8/11/13 own editable context, optional budget and verified saved responses. No handler/validation/consent change under IA approval. |

A hierarchy approval is **not** approval for Builder activation, migrations, new schema, hidden form prefill, contact/provider configuration or publication. Until approved, current live order remains the safe default, including in Phase 4.

## 5. Route / CTA / anchor contract

| Visitor intent | Reuse existing destination | Boundary |
|---|---|---|
| Defined project | `/request-quote` | No mandatory account, fixed price or timeline; preserve direct form access, optional budget and required consent/agreement. |
| Need service guidance | `#home-services`, `#capabilities`, `/services`, `/services/[slug]` | No duplicate persona/industry pages; service matcher remains Phase 8. Preserve current detail slugs and CMS ordering. |
| Need evidence | `/projects`, existing project detail; `/reviews` | Keep truthful empty routes; no logos, metrics, testimonials or stock imagery portrayed as work. |
| Need a person / consultation | `/contact` | Existing contact and appointment forms; approved settings-dependent phone/email/WhatsApp only. Not confirmation of a booked call. |
| Prepare / learn | `/blog`, existing article/service FAQ destinations | A01 should link to maintained content; no automatic new FAQ route, keyword pages or AI answers. |
| Terms / trust | `/service-agreement`, `/privacy`, `/terms`, `/disclaimer` | HTTP 200 agreement notice does not mean published approved terms. No dropped acceptance or new legal interpretation. |
| Existing client | `/login` and existing `/account` flow | Separate from prospect enquiry; preserve auth/recovery/Portal and staff boundaries. |

Retain `#main-content`, `#home-services`, `#capabilities`, `#included` when rendered, `#delivery`, and the stage description/control relationship `#delivery-description`. No renamed URLs, new navigation entries, redirected service slugs, altered canonical/noindex/sitemap/schema or widened permissions. Do not link proposed actions to nonexistent `/offers`, `/updates`, `/help` or chat endpoints. `/ai-methods` is an existing links directory, **not** AI support.

## 6. Implementation handoff / acceptance gates

- **Phase 4 design-system foundation is next, not started.** Refine shared tokens/components only when newly authorized; it must not quietly enact M01/M02, C02/C03 or A01. Assess refactoring against a real implementation request; documentation-only planning requires no code refactor.
- **Phases 5–7:** retain accepted navigation/actions; moving-edge CTA and hero polish require their own phase commands. Do not slow/hide H1 or add dependencies as part of this IA plan.
- **Phases 8–10:** reuse existing service/projects/industries. Implement a material move only with explicit ledger approval; projects require approved existing-backend records/consent, not seeded proof.
- **Phases 11–13:** carry forward J01–J05/J08 and actual lead/upload/consent gates. No successful conversion claim until FORM → HANDLER → EXISTING WRITE → RESPONSE → ROW/RELOAD is tested with approved scope.
- **Phases 15–18:** keep CMS/data repair separate from order changes. Builder activation needs a full preservation map for all H units and shell, effective existing schema/publication review, explicit hidden/error rules and real saved/public verification.
- **Phase 22:** approve maintained support/ownership/preparation material before A01; links to existing content first, human escalation always available through approved channels.
- **Phases 24/28/29:** compare actual before/after mobile/tablet/desktop, dark/light, keyboard, reduced-motion and no-JS. Keep native scroll, reveal-once, no hidden content, focus and safe-area clearance. Test actual menu/search/Portal/CTA/service/process gestures, not just URL presence.

Before an approved move: capture current screenshots at actual reported sizes (include owner width 662, plus phone/tablet/desktop); snapshot text, hrefs, data conditions and anchors; test populated/empty/hidden/error states with safe existing fixtures, not remote business writes. After: compare DOM order/content and captures; assert every real gesture, route and form contract preserved. Record production-build and controlled performance evidence then; do not turn development response timings into CWV claims.

## 7. Fresh verification and safe stop

- **431 tests / 52 files PASS; typecheck PASS; lint PASS.** Raw output: [quality.txt](evidence/phase3-30/quality.txt).
- Existing source-mounted dev healthy on port 3000; external-host Home HTTP 200 and live route compilation logs confirmed. No rebuild/restart/config change needed for documentation.
- Ten existing destination routes returned HTTP 200: Home, services, projects, blog, contact, request-quote, service-agreement, privacy, terms, disclaimer. These are anonymous availability checks, **not clicks, readable approved agreement, successful submissions, auth or persisted saves**.
- Current live iframe Home inventory confirmed at 662×580; no captured runtime errors/failed requests/overlay. Screenshot unavailable (`iframe_hidden`); no visual, multibreakpoint or gesture-regression pass claimed. No interactions implemented in this phase.
- Six optional integration values absent in both managed file and running process. No credential request/generation, connection, SQL, data write, upload, email, new dependency, production build, PR, merge or deployment.
- Final source/config diff and whitespace review are recorded in [verification.json](evidence/phase3-30/verification.json). Pre-documentation baseline above is not a completion commit; Base44 records/pushes the turn automatically.

**Phase 3 planning complete. STOP before Phase 4 — Design System Foundation until a new exact `START NEXT PHASE SAFELY`.** No material content moves approved/applied; all earlier backend/release gates remain blocked independently of planning completion. Base44 app remains unpublished.
