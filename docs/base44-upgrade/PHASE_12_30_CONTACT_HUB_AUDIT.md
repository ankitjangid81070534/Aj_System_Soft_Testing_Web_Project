# Phase 12 — contact hub audit and safe implementation contract

Date: 2026-09-19 UTC. Branch `system-upgrade`; starting HEAD `4ea95af0b1`.

**AUDIT / PLANNING COMPLETE — HUB NOT IMPLEMENTED; FULL PHASE NOT COMPLETE.** Following the exact continuation command and disclosure of the Phase 11 gate, the owner delegated the safe next scope: “jo aapko shi lage vo update kro safle hre vo ok”. Chosen scope is the offered Phase 12 audit, not a waiver of wizard persistence acceptance. No new UI, settings save, database column, credential request or AI integration was introduced.

## Existing capabilities and gaps

| Requirement | Source evidence | Disposition |
|---|---|---|
| Public contact channels | `src/lib/data/settings.ts` reads `site_settings.phone`, `whatsapp`, `contact_email`; `/contact` renders configured channels | EXISTS; reuse this source of truth, not copied migration values or a second contact store |
| Admin contact editing | `BrandSettingsForm.tsx` → `updateSettingsAction` → singleton `site_settings` upsert → returned ID | EXISTS; source traced, hosted write/reload unverified |
| Primary project action | `src/lib/data/cta.ts` and settings provide configurable label/href, default `/request-quote` | EXISTS; preserve configured destination and avoid duplicate identical project/quote actions |
| Quote and consultation destinations | `/request-quote`, `/contact#consultation` | EXISTS; links do not certify successful enquiry saves |
| Floating contact hub | Public layout renders header/footer/announcements/offer popup; no mounted contact hub found | MISSING; use one public-shell instance, not a new global nav |
| Enable, position, action visibility, page scope, animation and independent hub label | Absent from inspected settings type, form, save schema and committed contact-hub search | BACKEND-DEPENDENT; cannot claim these are admin-configurable today |
| AI Help | `/ai-methods` is a directory of active HTTPS resources, not chat; route handlers found are auth callback/confirm and RSS | NOT READY; no fake AI action or relabelling directory as live help |

The committed migration `0002_site_config.sql` provides contact and global CTA fields, not a hub settings contract. Repository searches found no `contact_hub`/`floating_contact` contract. This is source evidence, **not a statement about the actual hosted schema**. Do not run migration 0016 to populate contacts: it has data effects, and source sample values do not establish current approved business channels.

## Existing save/read trace

1. `BrandSettingsForm` posts the existing complete settings form.
2. `updateSettingsAction` requires a signed-in user with `settings:write`.
3. Its Zod allowlist validates existing fields. Unsubmitted keys become empty strings: **do not attach a partial hub-only form to this action**, or unrelated brand/contact fields can be cleared.
4. The privileged server client upserts singleton `site_settings`, selects `id`, and rejects errors or an empty saved-row response.
5. It refreshes `/ajadmin/brand`, the `site-settings` cache tag and the root layout. Refresh exceptions are logged while the action still reports saved success; successful write and public freshness must be tested separately.
6. `getSiteSettings` uses the anonymous public client, caches for 300 seconds and returns null on absent configuration/read failure. The public layout already loads settings once alongside navigation/announcements/offers.
7. Real FORM → WRITE → STORED ROW → ADMIN RELOAD → PUBLIC EFFECT remains unverified; this turn made no write attempt.

## Recommended bounded first implementation slice — proposal only

- Add one focused public contact component and scoped styles, supplied with already-loaded public settings. No extra client fetch, dependency, storage or duplicated admin settings.
- Start with navigation-only actions supported by current data: validated WhatsApp/Call/Email, configured primary project CTA and existing contact/consultation. Hide unavailable channels. When primary CTA and quote have the same destination, show one action; do not fabricate differentiation.
- Validate legacy stored destinations before rendering: internal single-slash paths or parsed HTTPS URLs, valid phone/email targets; the existing CTA helper accepts any leading slash, so it alone is not a complete protocol-relative URL guard. Record this boundary rather than changing global navigation during an audit.
- Keep AI Help absent until Phases 19–21 establish secure provider and knowledge boundaries. Do not add a disabled decorative AI promise or a dead route.
- Recommended initial scope: public discovery pages; exclude quote/contact form pages and auth/account/admin paths to reduce obstruction. Public route-group membership is not sufficient protection because the shared frame also covers account experiences.
- Reuse accepted tokens, sharp icons and native links. One named trigger, explicit expanded state, labelled panel/close, Escape dismissal, predictable focus restoration and no automatic opening. Keep existing footer/contact links as the no-JS path.
- Reserve clearance above the existing mobile dock and safe area; bound panel height for short screens and keyboard-open layouts. Test alongside navigation, portal and offer dialogs, not just a blank page. Respect reduced motion; start with no continuous breathing animation.
- Do not label this source-only slice “fully admin configurable”: only existing contact values/global CTA would be managed. New hub enable/page/position/action/animation settings need a confirmed existing contract or separately approved narrow schema work, with real save/reload acceptance. Do not overload social links, Builder content or offer fields as hidden storage.

## Acceptance checklist for future implementation

- Unit checks: null/empty/malformed contact values; safe and rejected URLs; duplicate-destination suppression; excluded routes; no AI entry; no writes/browser storage.
- Browser gestures: open/close/reopen, Escape, outside dismissal if provided, focus return, internal navigation and history, route-change cleanup, modal coexistence. External channel tests must inspect targets without sending a message or initiating a call.
- Layout review at 320/390/662/820/1024/1440, including short height, light/dark, reduced motion, keyboard and no-JS fallback. Confirm no dock, content, consent or submit obstruction. Native device keyboard/zoom checks remain distinct from emulation.
- No hydration errors, failed source modules or layout shift attributable to the component. No field-performance claim from compilation/tests alone.
- Admin configuration acceptance remains real authorized save → row → reload → public effect, plus invalid/forbidden/failed/empty-row outcomes and cache freshness. Source mocks cannot complete this gate.

## Fresh verification of unchanged app

- `npm test`: **516 tests / 60 files pass**.
- `npm run typecheck`: pass. `npm run lint`: pass.
- HTTP `/`, `/contact`, `/request-quote`: **200**; Home checked with external Host. Existing source-mounted web container healthy.
- Logs are ephemeral in container `/tmp/phase12-audit-{tests,types,lint}.log`; HTML probes in host `/tmp/phase12-{home,contact,quote}.html`.
- No frontend edits or implemented interactions; no new browser/visual/build, hosted-save, AI, phone/email-delivery or performance certification claimed. Prior Phase 11 evidence remains historical.

## Stop boundary

Audit finished; stop before implementation/Phase 13. Next continuation resumes Phase 12 using this contract, not another identical audit or credential request. Phase 11 stays partial; Phase 1/9 hosted and earlier legal/integrity/release gates persist. No SQL, data, secret, config, dependency, PR, merge or deployment changes.
