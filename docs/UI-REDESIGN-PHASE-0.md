# UI Redesign — Phase 0: Repository Audit + Safe Plan
**Source spec:** `Universal_Premium_3D_UI_UX_Master_Prompt.txt` (Warmwind-inspired universal system)
**Date:** 2026-08-30 · **No production code changed in this phase**
**Pre-redesign backup:** `Ajsystemsoft_backup/AJS_website_full_backup_2026-08-30.rar`
(4.9 MB, 561 files, integrity tested — includes full source, docs, migrations and .git history;
excludes only regenerable `node_modules` and `.next`)

## 1. Architecture summary

Next.js 16 + React 19 + TypeScript strict · Tailwind CSS 4 (CSS-first `@theme` tokens in
`website/src/app/globals.css`) · Supabase (RLS-protected) · Server Components by default with
16 verified client islands · Vitest (71 tests) · Playwright QA scripts.

## 2. Page inventory (all server-rendered unless noted)

- Public: Home (16 sections), Services + 15 detail pages, Projects + case studies, Blog + articles,
  About, Team, Contact (+ consultation form), Request Quote, Privacy, Terms, 404, sitemap, robots, RSS.
- Admin (`/ajadmin`): dashboard, brand settings, home builder (+section editor), generic resource
  CRUD ×12, media library, leads inbox (+ detail), users, audit logs, login.

## 3. Component inventory

`ui/`: Button, IconButton, Input/Textarea/Select/Field, Card, Badge/StatusPill, Skeleton,
SectionHeader, MediaFrame, ProjectCard, ServiceCard, TeamCard, Empty/Error States, CTA,
Tabs, Accordion, Dialog, Drawer, Toast, MarketingHeader, MobileMenu, Footer, BrandIcons.
`site/`: Hero + composition, TrustStrip, ServicesOverview, PlatformsShowcase, FeaturedProjects,
Process, Industries, TechCapabilities, WhyUs, Testimonials, TeamSection, Reveal, Breadcrumbs,
ProjectFiltersBar, GallerySection, LeadForms. `admin/`: AdminNav, ResourceForm, ResourceList,
LeadEditForm, SetupNotice. `seo/`: JsonLd.

## 4. What ALREADY conforms to the universal spec (built in Phases 3–15)

Floating pill nav with glass + compact-on-scroll · light neutral canvas + white surfaces +
near-black type · blue accent used as controlled accent · rounded cards with hairline borders +
soft layered shadows (e1–e4 + soft-3D) · CSS soft-3D hero with layered product panels ·
IntersectionObserver reveals with reduced-motion support · MediaFrame device frames ·
native-dialog modals/drawers with focus management · toasts · branded 404/empty/error states ·
fluid type scale · 320–1600 verified (0 overflow) · contrast-verified AA · 6–20 KB compressed
HTML per page.

## 5. Gap analysis (the actual redesign work, ranked by impact)

| # | Gap | Spec section | Effort | Risk |
|---|---|---|---|---|
| 1 | **Dark theme** (elegant, token-driven) + **theme switcher** + FOUC-free boot script | §3, §6 | Medium | Medium — needs contrast re-verification (Phase 13 methodology) and a sweep for hardcoded whites |
| 2 | **Admin software-mode density**: compact topbar variant, sticky table headers, density toggle, saved column visibility | §11, §18 | Medium | Low — additive |
| 3 | **Motion system upgrade**: tab sliding indicator, skeleton shimmer, card micro-tilt on showcase only, section parallax restraint | §9, §7 | Low-Med | Low (transform/opacity only) |
| 4 | **Component library expansion**: Avatar, Tooltip, DropdownMenu (account menu), MetricCard, Stepper, InlineValidation, lightbox gallery, FileUpload polish | §12 | Medium | Low |
| 5 | **Hero refinement**: light noise texture (CSS), multi-layer micro-parallax on panels | §7, §8 | Low | Low |
| 6 | **Command palette** for admin (search across modules) | §6, §12 | Medium | Low |
| 7 | **Print styles** for public pages | §10 report | Low | Low |
| 8 | Mobile **bottom nav** for admin quick actions | §6 | Low | Low — only if genuinely useful |

Not planned (with reason): WebGL/Three.js (CSS soft-3D already meets the spec; performance rule),
framework migration (none needed), route/logic changes (forbidden), bottom nav on marketing site.

## 6. Dependencies

**Recommendation: add none.** Dark theme via existing CSS variables + `html.dark` class +
a tiny inline boot script (FOUC prevention). Tooltip/Dropdown via existing Dialog primitives or
small custom components. This keeps the dependency count at 12.

## 7. Safety plan (per spec §19)

- All routes, contracts, RLS, server actions, env handling stay untouched.
- Theme change is additive (new tokens + class), never destructive.
- After every phase: build + typecheck + lint + 71 tests + Playwright responsive-qa +
  contrast re-verification in BOTH themes.
- The backup RAR + GitHub history are the rollback path (`git revert` / restore archive).

## 8. Exact phase order for implementation

1. **Phase 1** — Dark theme tokens + `ThemeToggle` + FOUC boot script + contrast sweep (both themes)
2. **Phase 2** — Admin software-mode pass (compact topbar, sticky headers, density toggle, MetricCard)
3. **Phase 3** — Component expansion (Avatar, Tooltip, DropdownMenu account menu, lightbox, Stepper)
4. **Phase 4** — Motion upgrade (tab indicator, shimmer, showcase micro-tilt, hero micro-parallax + noise)
5. **Phase 5** — Command palette + mobile bottom actions for admin
6. **Phase 6** — Final QA: both themes × 9 breakpoints × key flows, no-regression release
