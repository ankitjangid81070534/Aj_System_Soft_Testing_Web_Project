# September 2026 visual repairs

## Scope and source
- Reviewed sampled frames across the supplied 36.267-second reference video: white orbital hero, dark horizontal scenes, lit delivery stage, bento, cylindrical orbit, radial finale and footer. Section ordering, geometry, content and scroll choreography are retained.
- `website/public/images/login-sculpture.webp` is a 20 KB decorative crop from the user's supplied login reference (`3e4957757_image.png`), excluding its surrounding interface, third-party branding and example credentials. It is served locally, not loaded from an external image host.

## Root cause
`RevealObserver` observed the icon entrance itself. Translating that entrance out of the viewport immediately triggered exit/cancel/rearm and restarted its own animation. The live preview recorded individual cycle counters exceeding 6,000 while idle.

Orbit entrances now observe their unanimated parent slot while still animating the child. The original CSS first entrance, easing, duration, stagger, floating loop and actual scroll-away/re-entry replay remain. Other reveal variants use the original observation target. No timers, removal of motion, or hidden-content workarounds were added.

## Presentation boundaries
- Sapphire primary tokens, teal delivery lighting, amber/coral/cobalt decorative accents. Existing white/dark sections and layout remain.
- `navigation.module.css` owns sculpted desktop/drawer controls. Do not restore the homepage override that removes their backgrounds/shadows. Active-link semantics and native links remain; the mobile dialog ignores queued stale Strict Mode close events.
- `LoginSurface` is shared by `/login` and the native portal dialog. `AuthCard` remains unchanged for signup and recovery. Actual login/Google actions, redirect validation, field requirements and feedback are unchanged. A separate `LoginPasswordField` supplies an accessible visibility toggle. No pretend remember-me or authenticated UI was added.
- Admin changes are presentational: blue/teal surfaces and sidebar palette, stationary forms, existing role gates intact. Without credentials only staff-entry/setup surfaces are viewable.
- Metadata no longer uses `any` casts to attach article fields; tests retain the same article/website distinction. Unused imports/lint suppression were removed without changing behavior.

## Verification
In the running web container:
- `npm run typecheck`, `npm run lint`, `npm test`: pass, 112 tests.
- `node scripts/verify-presentation.mjs`: desktop/tablet/mobile repeat-scroll reveals, native wheel journey, five delivery controls, card links, accordion, theme persistence, drawer, 16 additional routes, reduced-motion and no-JS checks pass.
- `node scripts/verify-visual-repairs.mjs`: 1440, 1004 and 390 widths; real wheel exit/re-entry followed by a full floating cycle with stable reveal counters and full opacity; actual navigation clicks; popup open/reopen/close/Escape; visibility toggle; reference image loaded; login/contact/consultation required-field validation; light/dark theme persistence; no horizontal overflow or page exceptions. No real records submitted.
- Optional `SCREENSHOT_DIR` and `APP_URL` configure the browser scripts. Browser binaries and dependencies must be installed inside the container (`npx playwright install --with-deps chromium`).

Authenticated CMS operations, successful sign-in/OAuth, lead saving and email delivery remain unverified: external credentials were declined. Never bypass authorization to preview the dashboard.
