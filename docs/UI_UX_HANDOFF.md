# UI/UX handoff — branch `fix-ui-responsiveness`

Read this before merging/replacing the main project with this branch. This branch is
**presentation only** (CSS, motion, header layout). It does **not** change data, Supabase
queries, server actions, auth, forms, admin CMS, routes, SEO output or environment config.

## Scope of change (what is safe to overwrite)
| Area | Files | Business logic touched? |
| --- | --- | --- |
| Header (mobile drawer via portal, 960px desktop switch) | `website/src/components/site/SiteHeader.tsx`, `site-header.module.css` | No — same CMS links, same portal/session handlers |
| Homepage hero / journey strip / gallery responsive rules | `website/src/components/juspay-demo/*.css`, `DemoJourney.tsx`, `JuspayHome.tsx` | No |
| Inner-page hero 3D scene + accent title | `website/src/components/site/PageHero.tsx`, `HeroScene.tsx`, `hero-scene.module.css`, `page-hero.module.css`, `(public)/*/page.tsx` (only `scene`/`tone`/`accent` props) | No — same loaders, same `notFound()` handling |
| Motion policy (no OS reduced-motion gating; in-site opt-in via `localStorage["ajs-motion"]`) | `website/src/components/motion/*`, `RevealObserver.tsx`, `ScrollProgress.tsx`, `HeroVideo.tsx`, `app/layout.tsx` (boot script only), global CSS | No |
| Design tokens / surfaces | `website/src/app/*.css` | No |

Nothing under `website/src/lib/`, `website/src/app/actions*`, `website/supabase/`,
`website/src/proxy.ts`, `next.config.ts`, `package.json` dependencies or `.env*` changed.

## Verification already done on this branch
```bash
cd website
npm run typecheck   # clean
npm run lint        # 0 errors, 0 warnings
npm test            # 598 tests / 67 files pass
NODE_ENV=production npm run build   # passes (all routes prerender/compile)
```
All public routes (`/ /services /projects /about /contact /blog /team /reviews /ai-methods
/request-quote /ajadmin`) return HTTP 200. Header navigation, drawer open/close and the
960px breakpoint were exercised in a real browser at 900/960/1000/1009/1100/1280px.

## Checklist for the agent/person pushing to the main repo
1. `git diff --stat main...fix-ui-responsiveness` — confirm only the files above changed.
2. Run the four commands above **in the main project** after replacing files; all must pass.
3. Keep the main project's own `.env*`, Supabase keys and `website/supabase/migrations/`
   exactly as they are — this branch needs no new env var, table or migration.
4. Smoke-test live after deploy: homepage animates/3D core rotates, header collapses below
   960px, mobile drawer opens/closes, Client Login modal opens, contact/quote forms still submit,
   `/ajadmin` login still works.
5. If a browser shows the site static: it is NOT the OS "reduce motion" setting anymore — check
   `localStorage["ajs-motion"]` (remove it) and hard-refresh.

## Do not
- Re-add `@media (prefers-reduced-motion: reduce)` to public-site styles (root cause of
  "animations missing on other PCs").
- Change the 960px header/hero breakpoint in one file only — it lives in
  `site-header.module.css`, `SiteHeader.tsx` (matchMedia) and `juspay-demo.module.css`.
- Move the drawer back inside the header `.band` (transform makes it the containing block;
  the menu gets clipped on real devices).
