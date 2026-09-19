# Users redirect development-timing repair — 2026-09-19

## Scope and cause

Owner requested repair of the logged `Performance.measure` negative timestamp for `UsersPage`, not progression of Phase 15.

The error was current: five fresh independent Chromium visits to `/ajadmin/users` reproduced it after reaching `/ajadmin/login`. The stack points to Next 16.3.3's bundled React Server Component development `flushComponentPerformance`, whose rejected-component measurement clamps the start but not the end timestamp. Related upstream issue: https://github.com/vercel/next.js/issues/86060.

Without backend configuration, the proxy previously passed this request to UsersPage, which always redirects because `getCurrentUser()` returns null. This streamed redirect triggered the measurement error; the page itself does not call the Performance API.

## Repair

Only in the existing unconfigured proxy branch, `/ajadmin/users` now returns the same staff-login destination before component streaming. Query feedback is discarded as in the existing page redirect. Other scaffold routes remain available. Configured session routing, UsersPage role guards and all user-management actions are unchanged. No performance monkey-patch, error suppression, dependency change, credentials or database writes.

An initial trial moving `await searchParams` below access guards did not solve the error (five of five reproduced); it was fully reverted. An initial browser harness used the wrong heading `Staff login`; corrected to the actual `Staff Administration` before reproducing the error. Neither is a passing fix.

## Verification

- After the proxy repair, five fresh Chromium visits through the public preview proxy all reached `/ajadmin/login`, displayed `Staff Administration`, returned final HTTP 200 and had zero page errors.
- Four new proxy tests cover the early 307, login-loop prevention, configured anonymous return-path preservation and signed-in pass-through to page authorization.
- All 582 tests / 64 files pass; TypeScript and targeted ESLint pass; `git diff --check` passes.
- Post-fix service logs have no new negative-timestamp errors. Expected unconfigured-auth warnings remain.
- Live preview Home has content, no visible error dialog, no failed buffered requests and no Vite error overlay. One older AdSense load error remains buffered and is unrelated/not repaired.
- No authenticated persistence, production build, visual redesign or new interaction is claimed. Phase 15 and earlier hosted acceptance gates are unchanged.
