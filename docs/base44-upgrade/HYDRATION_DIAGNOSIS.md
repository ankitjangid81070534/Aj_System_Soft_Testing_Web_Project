# Hydration warning diagnosis — 2026-09-14 UTC

Owner request: safely fix the reported hydration console warning and synchronize all current work to GitHub. Starting clean HEAD: `cd5ce7a49cbe5052e979e08e263cf4ab49d115f3` on `system-upgrade-phase`.

## Finding: browser-side attribute injection, not a reproduced app render mismatch

The user's live Home preview at 919px contained the React attribute-hydration warning. Its console summary was truncated, so the actual Next development overlay was inspected. Its component diff showed unexpected `bis_size` attributes on numerous elements, including footer links, list items, brand and legal text. The live body also contained `bis_status`, `bis_frame_id`, `bis_body_id`, `bis_depth`, `bis_chainid`, `bis_size` and an external `__processed_…__` marker.

No matching injection markers occur in tracked `website/src` or `website/public` (checked via `git grep`). Fresh independent browsers loaded both the local development server and the public preview origin with no such attributes and no hydration warnings. This isolates the observed warning to browser-side modification in the owner's browser environment. An extension/security or page-inspection tool is a likely source; the exact installed product was not identified. Do not claim a particular vendor caused it.

**No application fix is justified by this evidence.** No blanket `suppressHydrationWarning`, DOM-attribute stripping observer, client-only conversion, warning filtering, ad removal or security-header weakening was added. Existing root theme handling is unchanged. Do not label a clean browser run as a fixed owner browser: disabling the injector and reloading there is still required.

## Safe owner-side resolution

1. Open the Base44 editor/preview in a clean browser profile or private window with extensions disabled. Some extensions can run in private mode, so confirm they are actually disabled.
2. If the warning disappears, re-enable extensions individually to identify which injects `bis_*` attributes. Disable only that extension's access to the editor/preview as appropriate; do not disable system-wide security protection.
3. Fully reload the editor/preview after changing extension permissions. The old warning remains buffered until a new load; dismissing the overlay alone is not remediation.
4. If it persists in a confirmed extension-free profile, capture the new full component diff and inspect other browser/preview injection sources. Do not compensate with arbitrary app markup changes.

## Fresh verification

| Check | Result |
|---|---|
| Local source dev Home, 390/919/1440px × light/dark | Six cases: HTTP 200, nonempty main, expected theme, zero hydration warnings, zero uncaught page errors, no failed localhost requests, zero `bis_*` markers. |
| Public preview origin, 919px × light/dark | Two cases: HTTP 200, expected theme, zero hydration warnings/page errors and zero injected markers. These use clean independent browsers, not the owner's iframe session. |
| Navigation in each case | Actual More (phone/tablet) or Search (desktop) click opens the dialog; Close click hides it. All eight journeys pass and leave zero open dialogs. |
| Unit suite | 415 tests / 51 files pass. |
| TypeScript / lint | Both pass. |
| Owner iframe | Initial error and full-overlay inspection succeeded. A later diagnostic call became unavailable; post-remediation owner-browser verification is NOT claimed. |
| Production build / backend | Not rerun: no app source changes. Earlier build results remain historical; hosted auth/CMS/RLS and manual gates stay blocked. |

The original iframe also logged an AdSense script-load failure. One local 919px dark run logged a separate Google report-only frame-ancestor CSP message; both public-origin runs had no console errors. No ad requests or policies were blocked/modified by the checks. This diagnosis does not claim to repair third-party delivery or all historical console messages.

Temporary runners and raw outputs remain in `/tmp` (web container: `check-hydration.cjs`, `check-hydration-public.cjs`, `hydration-clean-browser.json`, `hydration-public-preview.json`, `hydration-unit-tests.log`, `hydration-typecheck.log`, `hydration-lint.log`). No test business data was created.

## GitHub synchronization and preserved scope

Fresh fetch and `git ls-remote` confirmed remote `system-upgrade-phase` already equals starting HEAD `cd5ce7a49cbe5052e979e08e263cf4ab49d115f3` (zero ahead/behind), including the latest CMS plan and prior phase changes. That is verification of the current branch, not every unrelated remote branch or a main merge.

Only this diagnosis and AGENTS/PHASE_STATUS pointers are added now. Base44 handles their commit/push at turn end; no new commit hash is invented before that operation. No manual commit/push, force push, branch switch/deletion, merge, secret changes, SQL, app code/config changes or publication. Phase 16 remains partial/blocked and the CMS repair plan remains proposal-only; this request does not start Phase 17 or authorize implementation of all planned work.
