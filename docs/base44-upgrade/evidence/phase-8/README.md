# Phase 8 evidence

Scope and limits: [Phase 8 report](../../PHASE_8_AUTH_PORTAL.md). Auth UI implementation does not certify private portal access or successful authentication.

## Verification

- [Final browser run](browser-results.json): **50/50 PASS**, across five viewport/theme configurations. Includes 25 layouts and 25 journey/runtime checks. Only read-only Google readiness actions were sent; empty invalid forms did not send business writes.
- [Initial harness run](initial-browser-results.json): **43/50**, retained unchanged. An overbroad alert selector matched Next's route announcer; two transient write-count assertions also failed. This is not treated as a passing run.
- [Pending and origin protection](pending-security-results.json): disabled/announced pending state, actual readiness feedback, unrelated-Origin rejection and deliberate transport-abort recovery. No fake success response.
- [Preservation](preservation.json): exact account session/query block and auth input contracts retained.
- [Tests](tests.txt): 35 files / 294 tests. [Typecheck](typecheck.txt), [lint](lint.txt), [isolated production build](build.txt): PASS.

## Visually reviewed independent source captures

These are fresh Chromium captures of the running source app through its real preview origin with reduced motion. They were visually reviewed using a temporary evidence viewer, then that viewer was removed. They are **not actual iframe phone/desktop passes**. The later actual iframe screenshot was hidden; its signup interaction script timed out. Actual iframe login/password/Google assertions and final clean signup health are separately recorded in the report.

| View | Phone 390×844 | Tablet 919×499 | Desktop 1440×1000 |
|---|---|---|---|
| login | [Phone](images/login-390.png) | [Tablet](images/login-919.png) | [Desktop](images/login-1440.png) |
| login-form | [Phone](images/login-form-390.png) | [Tablet](images/login-form-919.png) | [Desktop](images/login-form-1440.png) |
| signup | [Phone](images/signup-390.png) | [Tablet](images/signup-919.png) | [Desktop](images/signup-1440.png) |
| signup-passwords | [Phone](images/signup-passwords-390.png) | [Tablet](images/signup-passwords-919.png) | [Desktop](images/signup-passwords-1440.png) |
| forgot-password | [Phone](images/forgot-password-390.png) | [Tablet](images/forgot-password-919.png) | [Desktop](images/forgot-password-1440.png) |
| reset-password | [Phone](images/reset-password-390.png) | [Tablet](images/reset-password-919.png) | [Desktop](images/reset-password-1440.png) |
| account | [Phone](images/account-390.png) | [Tablet](images/account-919.png) | [Desktop](images/account-1440.png) |

Reviewed dark tablet (919×900): [login form](images/login-form-919-dark.png), [signup header](images/signup-919-dark.png), [password/address fields](images/signup-passwords-919-dark.png), [forgot password](images/forgot-password-919-dark.png), [expired reset](images/reset-password-919-dark.png), [account setup](images/account-919-dark.png).

Reviewed [Google unavailable feedback](images/google-feedback-919.png). A dark login top capture is retained but was not separately reviewed; the dark login form is the reviewed view.

The account captures show only the existing unconfigured state, **not a populated/private portal**. Short viewports require scrolling around the unchanged fixed dock. No whole-site accessibility certification, production deployment, authenticated persistence, real password-reset or OAuth success is claimed.
