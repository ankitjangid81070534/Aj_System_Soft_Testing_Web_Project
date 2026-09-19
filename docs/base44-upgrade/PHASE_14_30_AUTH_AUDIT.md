# Phase 14 — Auth / portal read-only audit

Date: 2026-09-19 UTC. Branch: `system-upgrade`. Starting HEAD: `9f2a0bb476` (not the automatic completion commit).

**Audit complete at source/anonymous scope; full Phase 14 remains PARTIAL / BACKEND-DEPENDENT. No auth or UI implementation this turn.** After Phase 13 acceptance blockers and three next-scope choices were disclosed, the owner delegated safe judgment (“jo aapko shi lage vo update kro safle hre vo ok”). Chosen scope is the recommended Phase 14 read-only audit, not permission to waive Phase 13, change authentication, connect services, or start Phase 15.

## Existing flow and acceptance matrix

Paths below are relative to `website/src/`.

| Flow | Existing source contract | Current evidence / remaining gate |
|---|---|---|
| Client login | `components/portal/AuthForms.tsx` → `clientLoginAction` in `lib/portal/actions.ts` → cookie-bound Supabase password sign-in → `safePortalPath` redirect | Page renders, password visibility gestures pass; actual successful/invalid login, cookies, refresh and destination require approved real-account checks |
| Signup | Signup schema → portal schema readiness → Auth signup → agreement evidence → session redirect or email verification notice | Required address/mobile/privacy/agreement already exist; no duplicate registration feature needed. Actual account, email, profile trigger and evidence consistency unverified |
| Google | `GoogleButton` → read-only schema readiness action → browser OAuth → `/auth/callback` code exchange | Schema readiness is not provider/callback readiness. No OAuth attempt, provider redirect or successful account tested this turn |
| Recovery request | `forgotPasswordAction` → optional branded token-hash mail; fallback provider reset mail → generic confirmation | Generic confirmation deliberately does not establish delivery. No mail sent; delivered/expired/reused/cross-device links require real acceptance |
| Recovery landing | `/reset-password` and `/update-password` forward code/token to callback/confirm; cookie gates password controls | Both pages render anonymously; no genuine token/session. Routes remain separate supported URLs, not removed |
| Recovery save | Recovery marker + validated current user → Auth password update → marker deletion + sign-out → login notice | Successful password change, session revocation and replay rejection unverified |
| Account | `getCurrentUser` → session/user-scoped queries → profile/projects/requests/documents/reviews/agreements | Unconfigured setup notice renders. No authenticated data, RLS, linked-client or populated layout evidence |
| Profile / completion | RLS-bound profile update; completion additionally writes address and agreement evidence | Source traced only; persisted reload, zero-row failure, partial-write recovery and role isolation remain gates |
| Avatar | MIME/3 MB checks → `profile-avatars` upload → profile URL update → account revalidation | Upload transport, ownership, old/orphan object handling and genuine reload unverified |
| Review | Session + active linked client + optional owned project → private draft testimonial | Source restrictions retained; hosted policy/moderation/public effect unverified |
| Logout | Client/staff sign-out action → existing login destination | Source traced; returned sign-out error is not checked. Actual session removal/back/refresh tests unverified |
| Staff login | Username/email lookup via server-only admin client → password auth → staff role check → safe admin destination | Login route renders; no staff session, username mapping or role-transition test |
| Portal entry | Existing header/native `PortalLoginModal` mounts `ClientLoginForm`; `/account` is the actual workspace | No new `/portal` or `/profile` page proposed. Existing modal focus/cleanup preserved; not re-tested this turn |

## Findings — no repair claimed

1. **Error retention needs a separate bounded UI contract.** `AuthForms.tsx`, `AccountForms.tsx` and staff `login-form.tsx` use uncontrolled action forms without the lead forms' reset guard. A resolved error can trigger React's form reset; profile fields can return to defaults. Source evidence only this turn, not a newly reproduced POST. Preserve non-sensitive answers on genuine errors; decide password clearing separately rather than blindly reusing `useLeadForm` for credentials. Do not store credentials or drafts in browser storage.
2. **Recovery paths are not equivalent.** `ResetPasswordForm` accepts hash tokens with `setSession`, but does not create the HTTP-only recovery marker or change server-provided `recoveryReady`; that legacy path can leave controls disabled. It also lacks a rejection handler for this promise. Do not enable password changes client-side to work around the server gate. Confirm supported provider templates and real token behavior first.
3. **Recovery provenance requires review.** Callback sets the recovery marker after a successful code exchange based on `flow`, token type, or destination path; those hints are request-controlled. The marker is a literal value plus a valid current session, not proof of recovery intent by itself. Source-level risk, not an authenticated exploit test or security certification. Preserve current protection until a reviewed provider-compatible contract exists.
4. **Return origins need deployment acceptance.** Email/OAuth starts use canonical `siteUrl` except loopback; compose intentionally uses localhost for this preview. Callback/confirm redirects use `request.url` origin. Fresh direct-container no-token probes returned `http://0.0.0.0:3000/login?...` locations. This demonstrates internal-origin behavior for those probes, not an externally reproduced OAuth failure; verify trusted forwarded/public origin and provider allowlist before auth integration. Do not trust arbitrary Origin/Host or hardcode this sandbox's host.
5. **Read failures can resemble missing data.** Account's extended reads degrade to null/empty, while privileged client construction occurs outside those query fallbacks. Public Supabase configuration alone does not guarantee the server-role configuration needed by this page. Main queries also discard errors. Distinguish service-read failures from a genuinely empty account before changing UI; no broader privileged queries.
6. **Multi-write truthfulness remains open.** Signup, profile completion and avatar workflows have separate Auth/profile/address/evidence/storage writes. Profile updates check error, not affected-row confirmation. A success notice does not prove stored/reloaded data. Existing Phase 1 risks are confirmed in current source, not fixed or new backend permission.
7. **Agreement matching needs identity, not just a number.** Account `acceptedCurrent` compares nested `version_number` against the current number rather than the exact current version ID; potentially different agreements can share a version number. Do not change legal semantics or schema without scoped review and real acceptance fixtures.
8. **Validation/message parity is incomplete.** Signup's browser username pattern permits terminal punctuation rejected by the schema; some trimmed minimums are server-only. Login maps only `oauth_callback`; confirm's `invalid_email_link` currently passes through as raw error text. Unknown query error strings are also rendered as text (not HTML). A future safe message-map slice must preserve action outcomes and avoid exposing raw provider messages.
9. **Logout outcome is not confirmed.** Both sign-out actions ignore the returned provider error and redirect. Do not claim a failed sign-out removed a session; separately verify provider behavior, cookie clearance and re-entry before repair.
10. **Existing transport/abuse constraints persist.** Advertised 3 MB avatar cap exceeds the unraised default Server Action request limit; rate limits are process-local. Do not silently raise limits or introduce an auth/rate-limit service as UI polish.

## Recommended next bounded slice (not implemented)

Start with non-sensitive auth-form recovery/feedback, **not a redesign or authentication rewrite**:

- Reproduce current error/reset behavior against a confirmed-unconfigured target before any failure-only POST test; never test signup/recovery against an unknown configured target.
- Keep email/name/address values only in the mounted form on resolved failure; explicitly define password/file clearing and success behavior. Do not generalize the lead hook blindly or cancel all resets globally.
- Map known login query error codes to safe, actionable messages and give unknown codes a generic fallback; retain current role/action/session/redirect/consent contracts.
- Add focused regression tests and browser failure/retry/focus checks, preserving native validation and no-JS behavior. Test successful state transitions only with approved real evidence, not mocked browser success.
- Defer recovery provenance/origins, agreement identity, transactional saves and sign-out outcome changes to separately reviewed functional slices. Per the master, visual polish waits for functionality acceptance.

No implementation is authorized implicitly by this proposal. Next continuation should explicitly scope that repair or resume genuine acceptance; do not repeat this audit/credential request. **STOP before Phase 15.**

## Fresh verification and limits

- Existing source-mounted development service on port 3000 remains healthy; Home response contains Turbopack source markers. Compose/config/dependencies unchanged; no restart required.
- `npm test`: **567 tests / 62 files pass**. `npm run typecheck` and `npm run lint`: pass. Logs in container `/tmp/phase14-auth-audit-{tests,types,lint}.log`. No fresh production build, screenshot, responsive or performance claim for this documentation-only audit.
- External-Host direct HTTP probes: eight pages (`/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/update-password`, `/account`, `/ajadmin/login`) return 200; seven auth/account pages carry noindex headers. `/account` contains its honest setup notice.
- Two token-free handler GETs: callback → 307 `login?error=oauth_callback`; confirm → 307 `login?error=invalid_email_link`. Internal-origin locations above retained as a finding, not a successful externally routed callback claim. No tokens fabricated, accounts created, forms submitted or email delivered.
- Live preview navigation helper initially changed URL without rendering. One recovery via the real **Client Login** link succeeded. In one script: Show password performed=true and input type=text; Hide password performed=true and input type=password; console errors=[], failed requests=[], open dialogs=0. Only the existing visibility interaction is verified, not sign-in.
- All six optional Supabase/email variables remain absent in managed file and running process (presence only checked). No secrets requested/generated and no auth bypass, migrations, SQL or business writes.
- Phase 13 actual save/reset/admin readback, Phase 12 settings/hosted acceptance, Phase 11 save and earlier Phase 1/9/private/native/release gates remain unresolved. Unit/source/anonymous evidence cannot close them.

App code and behavior, backend, Home/nav, routes, legal/consent, SEO configuration and auth architecture were preserved. Documentation only; no PR, merge, branch switch or deployment. Base44 app remains **not published**.
