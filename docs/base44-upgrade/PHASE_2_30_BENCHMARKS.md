# Phase 2 — Professional-site benchmark (30-phase program)

2026-09-18 UTC. Baseline `74cc17e7bde0bd32bcf859058132e1ef044066a1`, branch `initial-setup`. **Planning complete; no implementation.** This resumes the interrupted Phase 2 research, not Phase 3. Authority: [current master](MASTER_PLAN_30_PHASES.md). Older `PHASE_2_BENCHMARKS.md` belongs to the previous program and is unchanged.

## Method and limits

Read current AJ hero, service detail/fallback content, contact/quote forms, projects and agreement page source; recover the same-day browser journey evidence; recheck tests/typecheck/lint and runtime; inspect three public professional-company pages as text/links. External pages were fetched read-only on 2026-09-18. These are information-architecture observations, **not competitor UX tests, verified commercial claims, conversion analytics, visual comparisons or performance rankings**. Extracted markup can include repeated carousel items and hidden form states; do not interpret extraction order as exact visual layout. No external form was submitted.

## Reference observations → appropriate AJ pattern

| Reference / inspected page | Directly observed structure | Pattern worth adapting later | Do not copy / applicability limit |
|---|---|---|---|
| [Thoughtworks Home](https://www.thoughtworks.com/) | Distinct capability exploration, client-work entry, labelled articles/news/client stories and partner section. Observed labels include “Explore our capabilities” and “View client work”. | Let buyers distinguish capability, genuine proof and educational material; connect each to an appropriate next action. | Their AI-first positioning, client logos, partner badges, claims and video/carousel treatment are not AJ assets or requirements. AJ already has a requirements-first hero; retain it. |
| [Netguru services](https://www.netguru.com/services) | Services grouped by product stage/capability: “Ideation and evaluation”, “Product design”, “Web development”, “Mobile development”, “Support and management”; descriptive links to detail pages. | Offer clear entry routes for uncertain buyers and established requirements; make post-launch support discoverable. | Do not reproduce their large technology catalogue or time-to-delivery promises. AJ's existing fifteen services and four categories already do much of this job; no new catalogue required. |
| [Atomic Object portfolio](https://atomicobject.com/portfolio) | “All Case Studies”, “Filter by Industry”, industry-tagged named projects and “Read case study” links; project titles describe business problems/outcomes. | When approved records exist, present problem → approach → actual outcome with industry context and a clear enquiry next step. | No borrowing clients, screenshots, metrics or work. Text extraction shows a filter control, not proof that its interaction was tested. AJ already has project filtering/detail routes; preserve the honest empty state. |

## AJ comparison and priorities

| Buyer question | Current evidence | Planning conclusion |
|---|---|---|
| What do you build? | Hero explicitly names custom software, web platforms, SaaS, Android/iOS and automation; additional service chips and fifteen detail routes exist. | **Preserve.** This is not a missing-positioning problem. Improve optional discovery in Phase 8 rather than replace the message. |
| Can you understand my workflow? | Service details already contain business problems, deliverables, platforms, capabilities, process and FAQs. | **Preserve/reuse.** A later matcher can translate plain-language needs into these existing routes; avoid duplicate industry pages. |
| What have you really delivered? | Existing project CMS, filters and detail routes; no approved public project records in this environment. Empty-state services/contact exits exist. | **Content/backend gate.** Do not convert capability examples into case studies. Phase 9 needs approved evidence and consent. |
| What happens after enquiry? | Quote introduction promises a plan/estimate; service process explains discovery and scoped delivery; success component says usually one business day. | **Clarify later, subject to operational confirmation.** Put a concise next-step expectation near the form without inventing a response SLA or binding price. Success has not been observed from a real save. |
| How do I ask without technical knowledge? | Quote has optional project/platform/industry inputs and “Not sure — advise me” platform choice, but remains one long form. | **Polish later.** Preserve direct enquiry; optional guidance must not become a mandatory wizard or require a new account. |
| Can I contact a human? | Contact/consultation routes exist; direct channels depend on settings and none are configured here. | **Configuration gate, not a new-feature gap alone.** A future floating hub must use approved existing settings, not made-up contacts. |
| Can I trust the terms/support? | Existing ownership/support material, service FAQs and legal routes. Agreement is unpublished in fallback while enquiry requires acceptance. | **Release gate.** Do not remove consent or publish improvised legal terms. Reconcile the real agreement and operational commitments before claiming readiness. |

## Prioritization rules

1. **P0 before release, not implemented here:** actual lead persistence/reload/email evidence; readable approved agreement; approved human contact details; retained Phase 1 RLS/save/upload gates.
2. **P1 later gated work:** carry editable service context into an enquiry; clearer minimum-required versus optional fields; useful guidance for unsure buyers; verified post-submit expectations.
3. **P2 later gated work:** real case-study content, linked readiness/help material and optional quick-contact access. Reuse existing routes/components instead of creating overlapping entry points.
4. AI chat/voice is not needed to fix today's discovery gaps. Keep it in phases 19–21 behind provider/knowledge/privacy safety gates; `/ai-methods` is not a support agent.

No funnel metrics, abandonment rate, ranking improvement or business outcome can be inferred from these observations. Future measurement should separate anonymous service-view → enquiry-start → validated submission → persisted lead → human follow-up; personal message content must not be included in analytics. No tracking was added.

## Deliverables / stop

See [eight buyer journeys, friction and preservation contract](PHASE_2_30_CUSTOMER_JOURNEYS.md) and [verification manifest](evidence/phase2-30/verification.json). Next is **Phase 3 — Information Architecture + Homepage Plan**, only after a new exact **START NEXT PHASE SAFELY**. Phase 3 may propose a move/add/change ledger; it does not implement it or activate the disconnected Home Builder.
