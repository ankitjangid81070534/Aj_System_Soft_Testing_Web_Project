# Phase 12 — bounded contact hub implementation

Date: 2026-09-19 UTC. Branch: `system-upgrade`. Starting HEAD: `d17f72a7e1` (not the automatic completion commit).

**NAVIGATION-ONLY UI IMPLEMENTED / LOCALLY VERIFIED. FULL PHASE 12 REMAINS PARTIAL.** Exact `START NEXT PHASE SAFELY` resumes the [audit contract](PHASE_12_30_CONTACT_HUB_AUDIT.md), not Phase 13 or another audit. Phase 11 hosted acceptance remains blocked.

## Implemented scope

- One focused `ContactHub` in the existing public layout, using already-loaded public settings. No new fetch, provider, dependency, route, write action, schema or business storage.
- Pure action builder validates configured phone/WhatsApp/email and primary CTA destinations. Malformed/missing channels are omitted; unsafe CTA destinations use the existing default with its accurate label. Suppress identical default quote/consultation destinations. Never copy migration contact values.
- Public discovery route allowlist: Home, about/team/reviews/AI Methods and service/project/blog index/detail pages. Exclude contact/quote forms, legal reading, auth/account/admin and unknown routes.
- Native auto popover: labelled trigger/region/close, expanded state, Escape/outside dismissal, keyboard traversal, explicit close focus restoration and keyed route cleanup. Native dialogs take precedence; observing their open state while the panel is open dismisses the hub without stealing modal focus.
- Scoped theme-aware surface/token styles, >=44px controls, mobile dock/safe-area clearance, viewport-bounded scrolling. Hide below/equal 360px viewport height rather than obstruct extremely short views. No automatic opening or animation loop; reduced motion needs no special animation override.
- No-JS/unsupported-popover browsers retain existing contact/footer links rather than receive an inert floating control. This enhancement does not replace site navigation.

## Preserved / deferred

Existing settings form/action/cache, contacts source, lead actions, wizard, consent, SEO, auth, Home order, navigation and persistence remain unchanged. No settings-only partial form was introduced. Only contact values and the global project CTA are backed by existing admin settings. Enable/position/actions/pages/animation/independent label controls still lack a confirmed persistence contract; **not fully admin configurable**. AI Help remains absent, not relabelled AI Methods. No credentials requested/generated, SQL/records, PR/merge/publish/deployment.

## Verification

- Full unit suite: **564 tests / 61 files pass**, including 48 new pure action/URL/route tests. Fixtures use test-only example contacts, never shipped contact values or network calls.
- Typecheck, lint, isolated production build: pass. Production copy at container `/tmp/aj-phase12-production`, internal port 3114; live source dev remains port 3000. No production deployment.
- Reusable `e2e/contact-hub.spec.ts`: **8 source + 8 isolated-production cases pass**. Widths 320/390/662/820/1024/1440; phone 568px height, remaining main cases 900px; reduced motion at 662. Additional actual dark 662x480 case and <=360px height hiding; no-JS and excluded-page checks.
- Interaction assertions: opening/reopening → visible panel and expanded state; Escape/close → hidden panel and trigger focus; outside click → hidden panel; Enter/Tab → open panel/close-button focus; existing More/search → open native dialog and hidden contact panel; project link → mounted quote form/no hub; Back → Services and closed hub; consultation link → mounted consultation target/no hub. Main journeys assert no same-origin POSTs or page errors.
- Six-width panel/trigger bounds and mobile dock clearance pass. Independent open-panel screenshots reviewed at 390x844, 662x900, 1440x900 light and actual dark 662x480. These are scoped visual checks, not every-page/native-device or full accessibility certification. Open popovers intentionally cover part of discovery content until dismissed; excluded forms are unobstructed.
- Live iframe opening, explicit close/focus return, reopening/expanded state and consultation navigation pass. Final captured runtime check: no console errors/failed requests/overlay; main has content. Initial immediate expanded-state read raced the browser's asynchronous toggle event; subsequent readiness assertion passed without a source fix.
- Live iframe screenshot returned `iframe_hidden`: **no iframe visual sign-off**. Independently captured PNGs/one-off capture script stay in `/tmp`; reviewed via a temporary read-only viewer, subsequently stopped.
- Initial harness findings retained: six case-sensitive Services heading mismatches (actual heading starts “Software services…”); production no-JS selector selected a hidden mobile copy; first theme test used `theme` instead of existing `ajs-theme`. Harness corrections use exact heading, visible accessible Contact locator and actual theme assertion. These are not claimed as app repairs. Final source/production reruns pass.
- Evidence: `evidence/phase12-30/verification.txt`; detailed temporary logs in host `/tmp/phase12-*`. Phone/WhatsApp/email targets have pure unit evidence only here; no external message/call or real configured channel browser launch attempted.

## Remaining gates / next continuation

Full admin save → stored row → admin reload → public effect remains unverified under existing credential deferral, as do actual offer-data/portal modal coexistence (existing More/search are tested), native keyboard/zoom/screen reader, populated contact settings/browser delivery and field performance. Do not claim conversion/speed gains from this work. All Phase 1/9/11 integrity/legal/upload/hosted gates persist.

**STOP before Phase 13.** Resume Phase 12 acceptance/configuration boundary on next continuation; do not reimplement the hub, repeat the audit/declined credential request or mark full Phase 12 complete. Any separate hub-settings schema or advancement with disclosed deferrals requires an explicit bounded decision.
