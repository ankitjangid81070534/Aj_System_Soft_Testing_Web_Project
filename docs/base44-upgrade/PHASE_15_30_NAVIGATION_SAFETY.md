# Phase 15 — bounded admin navigation safety

Date: 2026-09-19 UTC. Branch: `system-upgrade`. Starting HEAD: `cb29c7de54`.

## Authorization and outcome

After three continuation choices, the owner delegated safe judgment and explicitly requested no further questions. Choose the recommended navigation/accessibility slice, narrowed to the reproduced P15-01/P15-02 defects. Do not advance to Phase 16 or interpret delegation as permission for credentials, data writes, auth changes or deployment.

**This slice is implemented and isolated-component tested; full Phase 15 remains PARTIAL.** Authenticated navigation, populated layouts and visual acceptance remain unavailable. The earlier audit is historical evidence, not a current claim that these two repairs are still missing.

## Changes

- `AdminNav.tsx`: share exact-or-segment-descendant matching between sidebar current markers and page labels. Dashboard remains exact-only; unknown/prefix-collision routes do not select another module. All existing routes, labels and Next Links remain.
- `Drawer.tsx`: connect the native dialog to its visible heading with a unique React ID. Ignore a queued native close event if the dialog already reopened. The admin shell is its only current consumer.
- `AdminShell.tsx`: close the native modal when crossing the existing 1024px sidebar breakpoint; after native close, move focus to the existing main target when the mobile opener is hidden. Normal mobile Escape/close/backdrop retain native opener restoration. Add dialog/expanded semantics to the existing trigger. Remove the media listener on unmount.
- New `admin-navigation.test.ts`: twelve isolated render cases, including index/detail/new/unknown/prefix collisions and two distinct drawer heading associations.

No styling redesign, new dependency, API, route, provider, persistence, browser draft store or business logic. Auth layout, role checks, sign-out action, all save actions/schema/fields, public Home/header, proxy timing repair and consent remain unchanged. Bespoke filter/label/table corrections are not included; neither are admin draft recovery, clipboard/media, Builder outcomes or saved-success semantics.

## Reproduction and verification

1. Before repairs, the new unit file had **five failures / seven passes**: four exact module markers missing and drawer names absent.
2. Actual pre-fix AdminShell/Drawer in an isolated browser fixture reproduced resize failure: open at 919px, resize to 1440px → native `open=true` while CSS visibility is false, focus on body. No application auth bypass was used.
3. After repairs, **594 tests / 65 files PASS; TypeScript PASS; ESLint PASS; git diff --check PASS**. The twelve new cases pass.
4. Seven independent browser cases pass using actual client components and existing globals/admin CSS. Six start at 390/919/1023px in light/normal-motion and dark/reduced-motion; each opens the drawer, checks its name/current marker, tabs inside, closes via Escape/button/backdrop, verifies opener focus, checks link-triggered closing, crosses to 1024px, confirms native modal removal/main focus/background button interaction, then returns to mobile and reopens/closes. A 1440px case verifies active desktop marker, hidden opener and no modal. No page errors.
5. **Isolation limits:** the temporary fixture stubs Next Link/pathname and makes the sign-out stub throw. Link clicks prove the real component's close callback, **not routing**. No staff account, private record or success response was fabricated. This is component behavior, not authenticated end-to-end or visual certification.
6. Fresh real public-preview browser visit `/ajadmin/users` reaches `/ajadmin/login`, displays `Staff Administration`, has no private opener and no page errors. Home serves HTTP 200 through an external Host. Six optional configuration names remain absent in the running process; none requested/generated.
7. Live preview remains on Home, with content, no failed buffered requests or Vite overlay. Same-origin admin GET confirms no authorized shell. One old AdSense script error predates this edit; it is not fixed/suppressed. **Live admin gestures and screenshots are unverified**, because staff UI is unavailable.

No fresh production build, authenticated saves, visual screenshot review, full keyboard-cycle/screen-reader/native-device/no-JS certification or performance claim. Existing mobile no-JS drawer limitations are not silently declared fixed.

## Test-harness corrections retained

The first browser check observed native dialog close before the asynchronous React expanded-state update; it now waits for both. A desktop check initially used a visible-only role locator for the intentionally hidden opener; it now checks the actual attribute. An attempted temporary-script edit used unavailable container Python and did not apply; Node performed the edit. Initial test children-prop lint and TypeScript errors were fixed in test construction only. These are harness issues, not additional application repairs. The old lint log printed after a failed typecheck was stale; the final complete run above passes.

Temporary fixture/scripts/logs are under container `/tmp/phase15-navigation-fixture`, `/tmp/phase15-navigation-*.log` and `/tmp/phase15-navigation-browser.json`; no test route/service/dependency is committed. The fixture is loopback-only and stopped after verification. The normal source-mounted development server remains on port 3000 without restart.

## Remaining gate

Stop this bounded slice; **Phase 16 not started**. P15-03–09 and genuine authenticated/nav/visual acceptance remain open, as do Phase 14/13/12/11/9/1 hosted/legal/security/transport gates. Respect the owner's delegated safe scope and no-repeat-question preference; do not re-audit these repairs or request deferred credentials. No PR, merge, SQL/data mutation or deployment.
