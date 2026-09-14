# Phase 15 — Accessibility, security and trust

Date: 2026-09-13 UTC (2026-09-14 Asia/Calcutta). Starting commit: `f995cddf7283b0928e8f88b604c47600b91d2fa8`. Branch: `system-upgrade-phase`; working tree was clean before this phase.

Authorization: **START NEXT PHASE SAFELY**, including the preceding explicitly approved Privacy/Disclaimer navigation placement. This phase does not repeat Phase 14, start Phase 16, change auth architecture or deploy anything.

## Implemented, deliberately narrow changes

1. **Existing legal destinations are now in navigation.** Privacy and Disclaimer appear under the brand inside the desktop top navbar, without squeezing two extra pills into the existing central link row. At mobile/tablet widths they appear inside More, not in the four primary dock positions. Desktop search includes them; active states use the existing route matcher. Original eight defaults, CMS labels/order/custom URLs, portal triggers and primary CTA are retained. Existing CMS legal entries are not duplicated. Sparse CMS navigation still keeps legal pages in More.
2. **Notifications have valid accessibility semantics.** The shared polite live notification container had a label on an unnamed-role `div`, detected on `/ajadmin/login`. Added `role="region"` so the existing label is valid. Toast creation/dismissal/timing/announcements and backend actions are unchanged.
3. **Desktop accent text contrast corrected.** Resting dark-theme checks measured the search-panel eyebrow at 4.3:1 and Start Project at 4.4:1. Increasing the dark mix in the existing desktop accent text token from 30% to 40% resolves those automated failures, without changing brand colors, motion, surfaces or layout structure.
4. Added six navigation/semantics regression tests and four contracts for existing production security headers/server-only boundaries. No security headers were relaxed or redesigned.

## Accessibility audit and evidence

| Check | Result and boundary |
|---|---|
| Baseline: 18 anonymous routes, 919px, reduced motion | One serious `aria-prohibited-attr` notification-container issue; no other automated A/AA violations at this scope. Gradients and other inconclusive checks still require manual review. |
| Final: 18 routes × 390/919/1440px, plus three dark More and three portal states | **60 scans, zero reported automated WCAG A/AA violations**. Active dialogs are evaluated after finite transitions settle; inert background is not treated as active dialog content. |
| Supplementary resting-state More, dark homepage, portal | **9 scans, zero reported violations after contrast fix**. Incomplete rules retained, not converted to passes. |
| Navigation and keyboard | **61 real gesture assertions pass** across 17 widths, 320–2560px. Includes both legal links, More/desktop search, Tab/Escape focus containment/restoration, theme toggle, skip link and portal open/close. |
| Production short screens | **12 legal-link gestures pass** at 320×568, 360×800, 430×932, 844×390, 1024×768 and 1280×720. Links scroll into view when necessary, fit, navigate and close More; no page overflow. |
| Live owner iframe | At 919px, More → Privacy and More → Disclaimer clicks performed and destination headings rendered; menu close restores More focus; footer Home returns to homepage. No new errors, failed requests, overlay or empty root. Final state is homepage with no open dialog. |
| Visual review | A pre-edit footer viewport was captured. The post-edit More screenshot returned `iframe_hidden`; **new desktop/mobile visual screenshot approval is NOT claimed**. |
| Screen-reader/manual conformance | NOT certified. Automated checks do not cover full spoken announcements, reading order, all gradients/contrast, native device zoom or physical input devices. |

The initial dynamic scan ran against the entire document during modal transitions and reported additional background/closing-menu contrast findings. These are retained in `phase15-initial-verification.json`. Resting active-dialog checks excluded the native modal's inert background and isolated the two genuine dark-desktop failures, then the source token was edited and checks rerun. This is not hiding active content or disabling a rule; final audits still run all selected WCAG A/AA rules. `incomplete` results remain explicit.

The notification role is verified by markup tests and the actual admin-login accessibility scan. No authenticated admin action or real toast-producing CRUD gesture was executed. Existing live-preview buffered hydration/AdSense errors from before edits are not diagnosed or claimed fixed; post-change gestures introduce no new errors.

## Security audit — preserve, do not weaken

- Production responses retain CSP `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, no production `unsafe-eval`, HSTS, `X-Frame-Options: DENY`, MIME sniffing protection, referrer and permissions policies. Sandbox embedding remains development-only.
- Existing Supabase HTTPS/WSS, Google AdSense/Funding Choices/reporting, Google avatar and hero-media allowances remain intact. No attempt to make tests pass by blocking ads, weakening CSP or bypassing authentication.
- Service-role modules retain `server-only`; public environment code never reads the service-role key. Config, auth/session/permission code, Supabase clients and migrations are byte-unchanged by this phase.
- Source role checks, safe redirect helpers, generic login errors and per-operation permissions were reviewed. Existing migration RLS declarations/search-path constraints remain unchanged. This is source review, **not remote RLS verification**.
- Production anonymous `/ajadmin/users` resolves in a real browser to `/ajadmin/login`, with no user-management form. A raw fetch may report HTTP 200 for Next streamed redirects; raw status alone is not authorization proof. Unconfigured `/ajadmin` and `/account` intentionally show setup notices, not authenticated data.
- Missing-code `/auth/callback` returns the existing safe login error route. A real Google OAuth exchange is not tested without the owner's configuration/account.
- `npm audit --omit=dev`: **zero reported production-dependency advisories** at this run. This is not a penetration test or assurance against undisclosed vulnerabilities. No package/lockfile update was made; axe-core exists only in a temporary container directory for testing.

### Retained security/owner gates

The in-memory limiter is explicitly per-process/best-effort; production WAF/Supabase enforcement and distributed limits require owner deployment verification. Existing CSP uses inline script/style allowances because there is no nonce pipeline; a CSP architecture change was not introduced during this safe audit. Hosted Supabase RLS/storage, real staff/client authorization, persisted CRUD, Google OAuth, mail and authenticated admin accessibility remain deferred because credentials/sessions are absent.

## Trust audit

- Original company identity, contact destinations, service agreement, privacy, terms, disclaimer, legal dates, public authorship/content, structured data and 5,000-query research corpus are unchanged.
- Existing legal pages and contact links remain crawlable; no new indexable routes, fake proof, ratings, certifications, customers, statistics or claim changes.
- Owner confirmation is still needed for **operational** promises already in the Privacy policy (12-month lead deletion/retention process and regional ad-consent delivery), and hosted access-log/audit retention. Repository code alone does not prove those deployed/manual processes. Do not invent confirmation, rewrite legal promises without approval or treat configured Google/Supabase policies as locally tested.

## Quality and performance

**415 tests / 51 files**, typecheck, lint, whitespace and the final isolated production build pass. Builds use copied dependencies and `NODE_ENV=production` in `/tmp`; the source-mounted development server and its live `.next` output remain intact.

The local production comparison has 18 cold-browser-context, unthrottled homepage samples: three runs per revision at 390/919/1440px. Median LCP before→after is approximately **396→228ms / 280→256ms / 360→336ms**; CLS is zero in both sample sets. Script transfer differences are under 0.3KB. These fast local timings and variable long-task measurements are **not field Core Web Vitals, INP, real-user speedup or causal optimization evidence**. No substantial local regression was observed; no heavy runtime library or scroll work was added.

## Evidence and final boundary

`evidence/phase15-before-a11y.json`, `phase15-initial-verification.json`, `phase15-verification.json`, `phase15-dialog-before-contrast.json`, `phase15-dialog-a11y.json`, `phase15-small-screen.json`, `phase15-production.json`, `phase15-npm-audit.json`, `phase15-checkpoint.json`.

One-off scripts/logs/builds stay in `/tmp`. No business-data writes, new secrets, RLS/schema changes, destructive branch operations, direct main edits, manual commit/push or deployment. Managed PR-per-phase workflow remains required.

**Phase 15 scoped work complete. STOP before Phase 16 — Full System Regression — pending `START NEXT PHASE SAFELY`.** Carry all previous visual/native-device/private gates forward. Base44 app is not published; no production release or blanket accessibility/security certification is claimed.
