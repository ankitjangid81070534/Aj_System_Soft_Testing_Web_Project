# Phase 8 — auth / client portal UI + UX

Date: 2026-09-12. Starting HEAD: `bf40359d86`. Branch: `upgrade-desktop-navbar`.
Owner authorization: `continue next phase safly`, after Phase 7's public UI sign-off.

**UI IMPLEMENTED; PUBLIC AUTH SURFACES VERIFIED. AUTHENTICATED PORTAL VERIFICATION DEFERRED. STOPPED before Phase 9.** No complete auth/integration/release sign-off is claimed.

## Changes

- Login retains its existing artwork/composition while restoring shared bordered inputs and action styling, readable labels, larger recovery/account-link targets and safer tablet padding. Removed login card/dialog entrance motion; no new imagery or dependencies.
- Signup/recovery cards now have bounded tablet widths, more desktop form space and top-aligned columns. Phone inputs use 16px text; scoped native invalid styling and scroll margins improve feedback without changing validation rules.
- Extracted `PasswordField`: login, signup and recovery share named show/hide controls, pressed state, input association and linked password hints. Values, autocomplete, required/min/max rules and recovery-disabled controls are preserved.
- Extracted `PortalFeedback`: consistent error/success semantics and atomic announcements; returned action errors receive focus. Auth/profile forms expose pending state, retain their existing disabled submit buttons and use the same response contract.
- Google sign-in has clearer button/pending/error presentation. Moved the existing readiness call inside its try/catch so a transport failure cannot leave the button stuck on Connecting. Provider, callback construction and auth actions are unchanged.
- Private account presentation: native Profile/Projects/Requests/Agreements/Reviews links to existing sections, named section landmarks, safe long-name/email wrapping and bounded grids. Agreement tables gain a named keyboard-focusable horizontal scroll region and caption. Existing profile/avatar/review controls keep their actions and inputs.
- No homepage, public navbar/dock, admin UI, business rules, schema, route rename, data query, auth architecture or permission changes.

## Preview-specific bug fixed

The actual Google readiness gesture initially returned HTTP 500: Next rejected the public browser Origin because the preview proxy forwarded an internal `x-forwarded-host`. `allowedDevOrigins` alone does not configure Server Actions.

Added **only the exact environment-derived preview origin** to `experimental.serverActions.allowedOrigins`, gated to Base44 development. Production and ordinary local development retain the default protection; no wildcard or resolved sandbox hostname was committed. Four existing security tests now also assert this configuration boundary. A subsequent actual iframe gesture returned the app's real unconfigured-portal feedback without console/network errors. An independent replay from `https://untrusted.invalid` was rejected with HTTP 500, as expected.

## Verification

- **35 files / 294 tests PASS**, including 12 new pure component/source contracts. These do not certify authenticated behavior.
- Typecheck, lint and whitespace checks PASS.
- Isolated default **production build PASS** from `/tmp/phase8-build`, using copied source/dependencies and `NODE_ENV=production`. The live source-mounted dev server stayed healthy on port 3000.
- **50 independent source-browser checks PASS** over 320×740, 390×844, 919×499, 1440×1000 and dark 919×900: 25 route/layout checks, password/invalid-submit journeys, recovery-invalid-link journeys, Google-readiness feedback, modal toggle/dismissal and runtime/write guards.
- Additional controlled checks: actual readiness request held briefly to assert disabled/announced Connecting state; real response restores the button and focuses feedback. Deliberately aborted transport recovers to retryable feedback. These are read-only readiness tests, not OAuth success or fake successful responses.
- Preservation checks PASS: account session/query/derived-data block is byte-identical; auth input names, required/disabled/min/max/autocomplete/pattern/input-mode/default attributes are unchanged. Server actions, validation schemas, Supabase clients and auth callbacks were not edited.

### Actual iframe versus independent evidence

Actual iframe login show/hide, invalid login submit and post-fix Google-unavailable feedback passed with gestures and assertions. Final iframe health on `/signup`: no console errors, failed requests, overlay or empty main, and no open dialogs.

The initial iframe screenshot showed a scrolled login view with an anomalous dock capture; inspection placed the fixed dock at the correct viewport bottom. A subsequent screenshot returned `iframe_hidden`, and the signup verification script timed out. Neither is counted as a visual/gesture pass. Independent source-browser screenshots were freshly captured and visually reviewed through a temporary evidence viewer outside the app; they are explicitly **not substituted as iframe passes**.

Reviewed login/top and form, signup/top and password/address area, forgot-password, invalid reset-password and unchanged account setup state at phone/tablet/desktop, with selected dark tablet views and Google feedback. Forms wrap and remain readable; the preserved fixed dock still requires scrolling in short viewports. The account setup state is not a populated portal screenshot or successful protected-route test.

The first independent harness matched Next's hidden route announcer as well as the app alert, and included two transient write-count failures. That run is retained as **43/50**, not rewritten. Scoping the alert to the actual login form and rerunning produced **50/50**. No app fix is attributed to that harness correction.

## Interaction ledger and remaining limits

| Interaction | Outcome |
|---|---|
| Login password show/hide | PASS actual iframe and independent browser |
| Signup password/confirmation show/hide, value preservation | PASS independent browser; iframe attempt timed out |
| Empty login/signup/recovery submission | PASS native invalid state; no account creation or email sent |
| Expired reset controls and retry link | PASS disabled inputs/toggles and existing recovery destination |
| Google readiness, pending and retryable failure | PASS read-only feedback/state; Google OAuth success UNVERIFIED |
| Login dialog show/hide and dismissal | PASS independent browser; preserved focus restoration code |
| Private workspace section links | Source/component contracts only; authenticated gesture UNVERIFIED |
| Agreement-table scrolling with real records | Source contract only; authenticated gesture UNVERIFIED |
| Profile save, completion, avatar upload, review submit, sign out | Authenticated/persistent success UNVERIFIED |
| Successful signup/login, valid password reset, session/role enforcement | UNVERIFIED; no authorized configured session available |

Supabase/Resend configuration remains declined. No secrets generated/requested, accounts seeded, recovery sessions fabricated, roles bypassed, private fixtures served, business writes, email sends, migrations, PR, merge or deployment. The existing configured OAuth callback/site URL still needs validation against the owner's real deployment before release.

Phase 1 integration gates, Home Builder/hosted schema gaps, record-dependent public-page checks and production release gates remain deferred. Phase 9 requires fresh authorization with these limits acknowledged.

Evidence: [index](evidence/phase-8/README.md).

## Service-log follow-up — 2026-09-12, starting HEAD `69878865ff`

The owner supplied accumulated errors from the preceding edit/test session. Fresh service logs and browser verification did not reproduce the CSS chunk rejection, closed-stream/BuilderBridge errors, or preview-origin rejection. The earlier `untrusted.invalid` rejection and aborted-fetch message were deliberate security/transport tests; production protections were not relaxed to suppress those logs.

Fixed the remaining Next warning by declaring the existing smooth-scroll behavior with `data-scroll-behavior="smooth"` on the root HTML element. This lets Next temporarily disable smooth scrolling during route transitions, without removing anchor scrolling or reduced-motion CSS. Added a regression contract.

Actual iframe gestures PASS: Forgot password → recovery form → Back to sign in, followed by Google readiness → the real unconfigured-portal message. No browser errors, warnings, failed requests, overlay or empty main. Fresh service logs show GETs and the readiness POST returning 200, without new errors. **35 files / 295 tests**, typecheck, lint and whitespace PASS. No production build rerun for this attribute-only follow-up; the earlier build remains historical evidence. Successful authentication remains deferred, and Phase 9 is still untouched.
