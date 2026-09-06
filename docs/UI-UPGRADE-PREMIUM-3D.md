# UI Upgrade — Premium 3D (2026-09-03)

Visual-only upgrade. **No routes, data, Supabase, auth, forms, admin or SEO logic changed.**
Typecheck ✓ · ESLint ✓ · Vitest 89/89 ✓ · `next build` 39/39 pages ✓.

## What changed (all under `website/src`)
- `app/globals.css` — new premium tokens: electric-blue brand + violet/cyan accents, cool navy
  neutrals, layered 3D shadows, glass, gradients, aurora/grid textures, new utilities
  (`card-3d`, `glass`, `glass-strong`, `icon-tile`, `icon-bead`, `bg-brand-gradient`,
  `text-gradient(-animated)`, `bg-grid`, `bg-dots`, `aurora`, `shine`, `tilt-3d`, `marquee`,
  `divider-glow`), slim scrollbar, refined dark theme. All motion is transform/opacity only,
  respects `prefers-reduced-motion`.
- `components/ui/` — Button (gradient + sheen + glow), Card, ServiceCard, ProjectCard, CTA
  (navy→blue 3D panel), SectionHeader (pill eyebrow), TeamCard (gradient avatar ring), ReviewCard,
  Input (soft focus glow), MarketingHeader (glass nav), Footer (premium), MobileMenu (staggered).
- NEW `components/ui/ScrollProgress.tsx` — 3px gradient reading-progress bar (rAF, no re-renders).
- NEW `components/site/PageHero.tsx` — premium inner-page header (grid + aurora + breadcrumbs).
- `components/site/` — Hero (3D glass video frame, animated gradient headline, orbit ring),
  TrustStrip (floating glass strip), ServicesOverview, PlatformsShowcase, Process (gradient rail),
  Industries, TechCapabilities (CSS marquee), WhyUs, BlogPreview, Testimonials, TeamSection.
- `app/(public)/about|services|projects|team/page.tsx` — use PageHero; card styling upgraded.

## Not changed (still original)
Blog, Contact, Request-Quote, Reviews, Legal, Auth/Account, Admin pages — they inherit the new
tokens/primitives automatically but their layout markup is untouched.

## Rollback
`git revert` the UI commits, or restore `website/src` from your previous backup.
