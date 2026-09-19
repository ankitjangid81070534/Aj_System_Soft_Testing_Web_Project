# Phase 8 — Services / Capability Discovery

Date: 2026-09-19 UTC. Authority: exact `START NEXT PHASE SAFELY` after completed Phase 7, current [0–29 plan](MASTER_PLAN_30_PHASES.md). Starting HEAD: `bf4ea21a580157666c20d6085b1bd327c163a22e`, branch `system-upgrade`.

**COMPLETE at scoped public-service UI level. STOP before Phase 9.** Hosted persistence and release gates remain deferred, not passed.

## Audit and scope

- Services hub, four default categories, fifteen detail routes, sharp Lucide icons, shared dimensional cards, related services and enquiry destinations already exist. Preserve them rather than introduce a second catalogue.
- A guided service matcher was missing. It now lives on `/services`, above the unchanged category order, with a hero entry link and a bypass to the full catalogue. No Home section moved and no extra route was added.
- Existing public service loader remains the source of displayed records. No database/client/auth/action/schema/SEO/config/dependency changes.

## Changes

1. `ServiceMatcher.tsx`: one question, nine native disclosure choices covering website/store, web app, custom business software, ERP/CRM/POS, industry software, mobile, SaaS, desktop and uncertainty. Existing industry pages cover hospital/clinic, pharmacy and hotel. Browser-native disclosure semantics work before hydration and without JavaScript; no state hooks, client island, timers, animation loop or new package.
2. `service-matcher.ts`: small editorial route map, intersected with the actual public index. Results use supplied CMS names/records and never manufacture a route for a missing service. All fifteen current fallback capabilities are covered. Unknown/custom slugs remain available in the full catalogue; no keyword guessing or claim of AI matching. Empty matches and “Not sure yet” offer the existing requirement form. Choices are transient UI, not stored leads, so there is no new persistence contract.
3. Services hub: live category counts, clear matcher/catalogue entry points and an honest empty-catalogue message. Existing metadata, category names/order, icons, service readers and footer CTA stay intact.
4. Shared `ServiceCard`: full descriptions instead of three-line truncation; explicit “Explore service” action. Existing card colors, icon rendering, elevation, single-link semantics and destinations retained. Related-service consumers receive the same small presentation improvement.
5. Service fragment links use the existing Next Link component, retaining native anchor HTML while integrating with App Router history. This fixes a reproduced navigation problem below.

## Reproduced issue and repair

Initial source run: 30/32 cases passed; an unchanged hero anchor and a service category viewport assertion failed. Retry: two hero cases passed, while the desktop service case timed out returning from quote.

An independent production diagnostic recorded:

- `/services#service-matcher` had `history.state === null` after the original plain anchor.
- Following the matcher’s Next Link rendered the quote form.
- Browser Back restored the services hash in the URL but left the quote H1/content mounted, with null history state and no console errors.

This is not a successful back-navigation assertion or merely a cosmetic screenshot problem. The Phase 8 service hub/matcher fragments were changed from plain anchors to Next Link. The targeted desktop case then passed, followed by **26/26 source and 26/26 final production cases**, including browser Back after matcher navigation and category jumps. Existing hero source was not changed; the initial hero observation is retained, not labelled an unrelated repair.

The initial production batch exceeded the shell tool’s 300-second transport limit, continued in the container, and was explicitly stopped after evidence capture. Ten failure contexts were preserved; there is no complete initial-production suite total. Final tests ran separately against the rebuilt isolated server. Initial failures were not erased.

## Verification

| Check | Result and scope |
|---|---|
| Unit suite | **487 passed / 56 files**, including 18 new matcher/card/history contracts |
| Typecheck / lint / whitespace | PASS |
| Production build | PASS in `/tmp/aj-phase8-production`; development source and its `.next` untouched |
| Source browser regression | **26/26**: 16 service discovery, 3 navigation, 7 brand/header |
| Production browser regression | **26/26**, same cases, isolated loopback port 3110 |
| Independent layout/theme matrix | **14/14**: 320×568, 390×844, 662×580, 820×1180, 919×499, 1024×768, 1440×900, each light/normal-motion and dark/reduced-motion |
| Visual review | Independently captured matcher and first-category images reviewed at 390 light, 662 dark, 1440 light; correct actual browser dimensions, not iframe desktop simulation |
| Browser health, independent matrix | No console/page errors or non-cancelled same-origin request failures; 14 cancelled requests retained separately |
| Source runtime | External-host `/services` HTTP 200; existing source-mounted development server healthy |
| Optional integrations | All six recorded keys absent in managed file and running process; no new setup request, placeholder or connection |

### Interaction ledger

- **PASS:** all nine goal disclosures open, show relevant links/guidance, switch with native exclusive behavior, and preserve >=44px summary targets across six widths and both motion modes.
- **PASS:** Android recommendation → correct detail H1; website recommendation → correct page with JavaScript disabled at phone/desktop sizes.
- **PASS:** “Not sure yet” → existing quote form; no submission made and no saved-record claim.
- **PASS:** all fifteen catalogue cards → correct detail H1 → existing enquiry form.
- **PASS:** matcher entry, browse-all and all category fragments; browser Back through service journeys after the fragment repair.
- **PASS:** keyboard Enter opens, Tab reaches the recommendation, Enter navigates, and Space closes after returning.
- **PASS:** theme control via existing More/search dialog, actual dark class asserted, dialogs closed; all matrix layouts fit horizontally and sampled summary/link targets are >=44px.
- **PARTIAL live iframe:** mobile goal opening/recommendation visibility/Android H1, return to hub and website disclosure gestures passed. The first destination script returned the old pathname despite the correct destination heading, so URL timing is not a complete iframe route assertion. Final catalogue jump returned before its hash settled; one retry timed out. That iframe jump is **UNVERIFIED**, not substituted by a screenshot.
- **UNVERIFIED live screenshot:** `iframe_hidden`; independent review above is not an iframe visual pass. Earlier passive iframe health was clean. The final buffer contained only transient compile errors from the two-part opening/closing-tag edits, already corrected before the passing build/tests; no failed requests/overlay/empty main or open dialogs. No owner-browser repair claimed.

## Boundaries and follow-up

- Native scrolling remains necessary on short screens. Element captures taller than the viewport include the unchanged fixed dock crossing lower content; actual gestures reached the controls. This is not a claim that the entire matcher fits above the dock, or that whole-site/native-device accessibility is certified.
- Explicit mapping intentionally does not infer support for newly renamed/custom CMS slugs. They remain in the catalogue, with a human-contact fallback; future editorial mapping needs an approved service fit. Actual custom-CMS records and private layouts remain unverified.
- No collected answers, browser-local business database, data writes, quote prefill, wizard, AI, invented proof, pricing/timing promise or legal/benefit rewrite.
- Existing hosted auth/CRUD/RLS/upload/email, Builder/atomicity, consent/content and deployment blockers remain. No field CWV, conversion uplift, performance-speedup or zero-overhead claim. New guidance adds server HTML, not a client matching engine.
- Scripts, PNGs, temporary viewer and builds remain in `/tmp`; temporary viewer stopped. Durable text/JSON evidence: [phase8-30](evidence/phase8-30/verification.json).
- No manual Git commit/push, PR, merge, branch switch or deployment. Starting HEAD is not an automatic completion commit.

**Next: Phase 9 — Projects / Case-study Experience, only after the next exact continuation.**
