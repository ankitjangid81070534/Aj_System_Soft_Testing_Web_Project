# Master project understanding — current 30-phase baseline

Date: 2026-09-16 UTC / 2026-09-17 IST. Branch `initial-setup`; pre-edit commit `b566a40deb4f3e68fc0cbdfc82a534025aeaff73`. Authority: [latest full prompt](MASTER_PLAN_30_PHASES.md), [current gate](PHASE_STATUS.md). Historical understanding is preserved in [archive](archive-pre-30-phase/MASTER_PROJECT_UNDERSTANDING.md).

## Scope and evidence

All **658 tracked files** were read for SHA-256/size inventory; **285 TS/TSX/CSS source modules** indexed for imports and literal table/bucket references. Critical composition, auth/data boundaries, actions, CMS configuration, SEO, motion, tests and deployment guidance were inspected alongside existing detailed audits. This is repository-wide ingestion, **not a claim of exhaustive manual line-by-line security review**. [Inventory](evidence/phase0-30/inventory.json) includes all 39 page patterns, three handlers and 39 exported actions across ten modules.

## Actual architecture

| Layer | Existing implementation |
|---|---|
| Runtime | Node 22 in Docker; `website/` bind-mounted at `/app`; Next dev/Turbopack on 0.0.0.0:3000, not a production image |
| Application | Next 16.3.3 App Router, React 19.2.8, TypeScript 5.9.3; server-first pages with client islands |
| Presentation | Tailwind 4, CSS Modules, self-hosted Geist, Lucide, existing Framer Motion navbar lamp; shared UI in `website/src/components/ui` |
| Existing backend | **Supabase Postgres + Auth + Storage**; Next Server Actions, server readers and auth handlers; optional Resend notification delivery |
| Local fallback | Public service/article copy and honest empty/setup states; no replacement business database |
| Validation/security | Zod, capability allowlists, cookie sessions, proxy + action/route checks; service-role clients server-only; RLS for ordinary clients |
| Deployment | Existing Vercel-compatible Next app; website README/Netlify hints retained. This Base44 branch is not published |
| Tests | Vitest 415 tests/51 files; TypeScript/ESLint; three reusable Playwright navigation tests |

**The editing workflow is not connected to Supabase, but the repository already uses it.** Preserve that architecture; do not migrate to a different project or require a new connection for public preview. All six recorded optional integration names are absent in both managed file and running process. No placeholder/secret was generated or requested; owner deferral is respected. Data-dependent success remains blocked rather than faked.

## Source map and data paths

- `src/app/layout.tsx`: fonts, theme preference, AdSense, global CSS, reveal/scene/surface observers. `src/app/(public)/layout.tsx`: settings/navigation/growth reads and public frame.
- `src/app/(public)/page.tsx`: parallel home/settings/benefits reads, existing metadata/JSON-LD, fixed `HomeExperience`. It **does not invoke `getHomeSections`**. Preserve accepted content before future Builder integration.
- `src/lib/supabase/`: anonymous public client, cookie-bound server/browser clients, privileged server-only admin client. Privileged writes need explicit caller capability checks; RLS alone is not enough.
- `src/lib/admin/resources.ts` + `actions.ts` + `crud.ts`: 17 configured CMS resources, allowlisted validation, existing mutation results and cache refresh. Separate Builder/settings/media/users/agreements/leads modules remain.
- `LeadForms` → lead Server Actions → validation/spam/consent → existing Postgres rows/private attachments → optional agreement evidence/email. Contact, quote and consultation exist. Quote is a **single form**, not the requested multistep wizard; it already has optional budget.
- `AuthForms`/portal actions → existing Supabase Auth/session/profile. `/auth/callback` exchanges codes; `/auth/confirm` verifies tokens. Actual portal is `/account`, not a new `/portal` page.
- Roles: super_admin/admin/editor/client. Editor cannot be silently upgraded. Publication/visibility and effective hosted RLS require deeper Phase 1 review.
- Sixteen SQL migrations (0001–0016) and storage policies are committed; applied hosted versions are unknown. No migrations/seeds/backups/restores/data writes were run. `ai_methods` resource exists without committed table creation; remote absence is NOT proved.
- Browser storage only remembers theme and announcement/offer dismissal frequency; **not business persistence**.

## Accepted public experience to retain

Home: requirement-led hero → trust → conditional launch benefits → services/journey → platforms/real projects → delivery process → ownership/support → industries/technology/why-us → genuine reviews/team → articles → final project/contact CTA. Conditional empty data is not permission to invent proof.

Desktop: compact one-row navbar from 1024px, visible left company name, eight central destinations, existing search/login/project action and legal links. Mobile/tablet: brand masthead and one bottom Home/Services/More/Projects/Contact dock. Existing search keyboard handling and legal links must survive.

Reveal-once content, reduced motion, native scrolling and no-JS visibility are existing work. Keep CSS-first decoration; old reports are not permission to rebuild the homepage. The new RGB-edge/contact hub/matcher/wizard/AI agent are future gated work, not Phase 0 changes.

## SEO and performance

Metadata, canonical helpers, noindex private/preview rules, robots/sitemap/RSS and factual schema already exist. This sandbox uses localhost canonical and deliberate noindex, not production SEO settings. Owner-domain read-only probe is separate from deployment validation. Existing 5,000-candidate CSV already has 5,000 unique normalized queries (en 1680, hi 1660, hi-Latn 1660); preserve it and reassess only in new Phase 26, not regenerate now.

[Performance](PERFORMANCE_BASELINE.md) records fresh **unthrottled loopback** numbers; no field INP/CWV, real backend latency, ranking or production speed claim. Root AdSense load failure was observed in the user preview, not fixed or hidden.

## Continuation

See [route/features](ROUTE_FEATURE_MATRIX.md), [admin](ADMIN_FEATURE_MATRIX.md), [regression](REGRESSION_BASELINE.md), [SEO](SEO_BASELINE.md), [design](DESIGN_BASELINE.md), [decisions](DECISIONS.md), [risks](RISKS.md). Read current phase state before any edit. Phase 0 changes documentation only; next phase requires the exact command.
