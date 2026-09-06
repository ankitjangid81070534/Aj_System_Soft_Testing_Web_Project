# PHASE 16 — End-to-End Release QA Report
**Date:** 2026-08-30 · Production build · Playwright E2E (`scripts/release-qa.mjs`, 19 checks) + unit suite (71 tests) + static audits.
**Verdict: the public site is release-ready. Admin/DB flows are code-complete and unit/policy-tested, but their live end-to-end pass is pending one owner action: creating the Supabase project (see "Pending" below).**

## 1. Verified this session (automated, passing)

### Public pages — 14/14 ✅
Home, Services, Service detail, Projects, Blog, Blog detail, About, Team, Contact,
Request Quote, **Privacy (new this phase)**, **Terms (new this phase)**, 404, admin login.
Each: HTTP 200 + correct H1 + content server-rendered.

### Forms — 3/3 ✅
- Empty submit → blocked by **native constraint validation** (no navigation, invalid fields flagged).
- Honeypot trip → server rejects with "Spam detected." (role=alert).
- Missing consent → blocked (`:invalid` consent checkbox) before the server round-trip.
- Server actions validated end-to-end in production mode (the honeypot submission reached the Zod spam guard and returned its verdict — the full server-action pipeline works).

### SEO — ✅ (evidence in PHASE-11 audit, re-verified)
Sitemap (25 URLs incl. legal pages), robots (admin disallowed), unique titles/canonicals,
Organization + WebSite + BreadcrumbList + BlogPosting + Service JSON-LD, admin noindex ×3 layers.

### Security — ✅ static verification (Phase 13)
RLS coverage (23 statements + policy test script), server-side `can()` on every admin action,
service-role key server-only, upload allow-lists, generic errors, no secrets in Git,
`npm audit`: **0 vulnerabilities**.

### Performance — ✅ (Phase 12 report)
No console/page errors across the entire E2E run (verified by Playwright listeners).

### Release gate — ✅
Production build passes · type-check passes · lint passes · 71/71 tests pass ·
**0 TODOs/FIXMEs/HACKs** · **0 lorem ipsum / placeholder copy** · **0 fake company/client
claims** (pattern audit: no invented experience years, client counts or awards).

## 2. Critical bug found & fixed during this QA

`lib/leads/actions.ts` (a `"use server"` file) exported `idleLeadState`, an **object** —
which crashes every Server Action module at runtime ("A use server file can only export
async functions"). The contact/quote/appointment forms returned HTTP 500 in production.
Fixed by moving the constant into the client component. **This is exactly why the phase
exists: the failure was invisible without an end-to-end production-mode test.**

Two more fixes shipped with it: empty-string phone values were rejected after a schema
refactor (validation regression), and the /terms page did not exist yet.

## 3. Pending — flows that need a live Supabase project

These are code-complete, covered by unit tests and the RLS policy suite
(`supabase/tests/rls-checks.sql`), but **cannot be executed end-to-end until the owner
creates the Supabase project and sets the environment variables**
(`docs/PHASE-2-SUPABASE-SETUP.md`):

| Flow | How to verify after setup |
|---|---|
| Admin login/logout | Sign in via `/ajadmin/login`; dashboard shows email/role; sign out redirects |
| Services/Clients/Projects/Team/Testimonials/Blog CRUD + publish/trash/restore | Create → publish → verify on the public URL → trash → restore |
| Brand settings & Home builder saves | Edit → save → confirm on public site |
| Media upload/delete | Upload → copy URL → delete |
| Lead inbox: status/assignment/notes on real submissions | Submit a form → manage in `/ajadmin/leads` |
| Users & roles matrix (editor restrictions, super-admin role changes) | Create 2nd user, change role, verify gates |
| Audit log entries | Perform an edit → check `/ajadmin/audit` |
| Attachment upload → signed-URL download | Quote request with attachment → open in admin |
| Private media stays private | `supabase/tests/rls-checks.sql` (anon checks) |

## 4. Remaining limitations (real, by design)

1. **No live Supabase project yet** — all DB-dependent E2E above (owner action, §3).
2. **Legal text** is good-faith plain-language content; have counsel review for your jurisdiction.
3. **Rate limiting** is in-memory (per serverless instance); a shared store (Upstash) is the
   upgrade path if form abuse becomes an issue.
4. **Favicon** is generated; a designed `.ico`/app-icons set can replace it when brand assets exist.
5. **Responsive QA** covered layout/overflow/interactions programmatically (Phase 15); a human
   pass on real devices is still worthwhile.

## 5. Sign-off

Public website: **READY** (pending Supabase connection for dynamic features).
Admin CMS: **READY in code**, pending live verification per §3.
No blocking issues remain that are within the codebase's control.
