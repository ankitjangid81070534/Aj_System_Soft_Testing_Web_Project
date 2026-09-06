# PHASE 13 — Accessibility & Security Hardening Report
**Date:** 2026-08-30 · Target: WCAG 2.2 AA · All fixes verified with typecheck/lint/tests/build.

## Accessibility (WCAG 2.2 AA)

| Criterion | Status | Evidence / fix |
|---|---|---|
| Keyboard navigation | ✅ | All interactive elements are native `<button>/<a>/<input>`; tabs implement roving tabindex + arrow keys; dialogs use native focus trap |
| Visible focus | ✅ | `focus-ring` utility (2px offset ring) on every interactive element; verified in tokens |
| Logical tab order | ✅ | DOM order matches visual order; no positive tabindices (grep: none) |
| Screen-reader labels | ✅ | All icon-only controls carry `aria-label`; decorative visuals `aria-hidden`; landmarks labelled (`aria-label` on nav/regions) |
| Form labels | ✅ | Every input via `Field` (explicit `htmlFor`/`id`) |
| Validation announcements | ✅ | Errors: `role="alert"` + `aria-live="polite"`; success: `role="status"`; admin forms `role="alert"` panels |
| Modal/drawer focus management | ✅ | Native `<dialog>.showModal()` — focus trap, ESC, restoration; backdrop click closes |
| Contrast | ✅ **fixed** | Computed WCAG ratios for 10 token pairs; **danger token darkened** `#dc2626 → #d31f1f` (was 4.41:1 on soft background, now 4.82:1; white-on-danger 5.27:1). All other pairs pass 4.5:1 (body 17.3:1, muted 5.49:1, brand links 6.96:1) |
| Reduced motion | ✅ | Global `prefers-reduced-motion` guard zeroes all animations/transitions |
| Heading hierarchy | ✅ | One `<h1>` per page (verified across routes); sections use h2; cards h3 — no skipped levels |
| Touch target sizing | ✅ | Buttons ≥36px, icon buttons ≥28px (above the 24px 2.5.8 minimum), mobile nav rows ≥44px |
| Accessible tables | ✅ | Admin/audit tables: `<caption>` (sr-only), `scope="col"` headers |
| Skip-to-content | ✅ | First focusable element; target `#main-content` |
| Nav state | ✅ **fixed** | Header links now expose `aria-current="page"` + active colour |
| Fixed this phase | — | Header `aria-current`, danger contrast token |

## Security

| Control | Status | Evidence |
|---|---|---|
| RLS enabled | ✅ | 23 `enable row level security` statements across migrations; policy verification script at `supabase/tests/rls-checks.sql` |
| Admin authorization server-side | ✅ | Every admin action calls `authorize()` → `getCurrentUser` + `can()`; role gates verified in code (`content:write`, `leads:manage`, `users:manage`, `audit:read`, `settings:write`) |
| Private media | ✅ | `private-media` + `lead-attachments` buckets: no anon policies; staff read via `has_role('admin')`; admin views use 30-min signed URLs |
| Service-role key server-only | ✅ | Only in `lib/env.server.ts` (guarded by `server-only` package); used exclusively by `lib/supabase/admin.ts`; never `NEXT_PUBLIC_`-prefixed; grep confirmed |
| Public writes validated server-side | ✅ | Zod schemas on contact/quote/appointment (lengths, formats, consent) + honeypot + time-trap + rate limits |
| Upload validation | ✅ | MIME allow-lists + size caps enforced by bucket settings and re-checked server-side |
| Safe rich-content rendering | ✅ | react-markdown (raw HTML not rendered); page_sections JSONB Zod-validated; **hardened**: JSON-LD script escapes `<` → `\u003c` (prevents `</script>` breakout from admin-authored strings) |
| Safe external links | ✅ **fixed** | All `target="_blank"` anchors now carry `rel="noopener noreferrer"` — including raw anchors and the Button component's same-origin new-tab path |
| Rate-limit strategy | ✅ | Per-IP + per-email in-memory limiter on login/contact/quote/appointment; documented per-instance serverless caveat; INSERT-only RLS + honeypot as base layer |
| Production-safe errors | ✅ | Generic user messages ("Invalid email or password"), opaque digest references only; no stack traces rendered |
| No sensitive logs | ✅ | Zero `console.log` in source; `console.error` logs only failure messages server-side |
| No secrets in Git | ✅ | `.env*` untracked (except `.env.example` placeholders); secret-pattern grep clean |
| Audit of destructive ops | ✅ | DB triggers record actor/action/entity for all sensitive tables, including soft deletes and role changes |
| Dependency security | ✅ | `npm audit`: **0 vulnerabilities** |

## Fixed this phase

1. **Danger colour contrast** — token darkened to pass AA in both text-on-soft and white-on-danger directions.
2. **Header `aria-current`** — active nav link now announced to screen readers.
3. **JSON-LD script breakout hardening** — `<` escaped in serialised structured data.
4. **`rel="noopener noreferrer"`** — completed on every new-tab path (raw anchors, attachments, admin preview, live-product links).

## Known limitations

- Full screen-reader + keyboard user testing requires human sessions (recommended at Phase 16 release QA with Playwright + a manual pass).
- CSP is intentionally deferred to Phase 14 (deployment) with documented Supabase origins.
- In-memory rate limiting is per-instance on serverless; the platform WAF/Supabase limits remain the primary defence until a shared store (e.g. Upstash) is added if needed.
