# Safe premium finishing pass

## Baseline and preservation contract

The attachment was read in full. This is a refinement of the existing design, not a redesign. No reference video or separate card-style image accompanied this request; existing reference-motion notes and current implementation are preserved rather than inventing those references.

Baseline: existing `verify-presentation.mjs` passed at desktop, tablet and mobile before edits, including repeat-scroll animations, native-wheel storytelling, five delivery buttons, pointer tilt, service accordion/navigation, theme persistence, mobile menus, 16 additional routes, reduced motion and no-JS. Baseline screenshots are retained in the running container at `/tmp/ajs-before`. The embedded screenshot tool failed (timeout, then unavailable/hidden preview), so these captures do NOT constitute an assistant visual sign-off.

| Route | Section / component | Status | Evidence / safe action |
| --- | --- | --- | --- |
| All public | Navigation, footer, active chips, primary CTA | A — preserve | Existing interaction suite passes; retain layout, labels, destinations and typography. |
| Home | Native-scroll services, delivery, ownership, finale | A — preserve | Wheel progression and all delivery buttons pass; keep scene motion. |
| All public | Ordinary reveal lifecycle | D/E — fix | Observer rearms on every viewport exit and animates opacity again; attachment now explicitly requests one-shot reveals. Animate once, retain visibility, unobserve completed targets. |
| Home | Hero copy | E — refine | Parent opacity entrance plus animated heading words delay immediately readable copy. Keep transform-only entrance and skip hero-word reveals. |
| Public | Icon tiles, platform and technology icons | B/D — refine | Scale/rotation and nested 3D transforms soften vector strokes. Keep shadows on tile; remove foreground scale/rotation and direct SVG filter. |
| Home | Platform icon contrast | D — fix | Legacy rule overrides white glyph color with brand blue on saturated tiles. Restore foreground contrast without changing icons. |
| Services / home | Platform and service card surfaces | B — refine | Generic blue surface overwrites existing varied tile colors. Introduce scoped semantic accents; retain all content, geometry and links. |
| Home | Benefit cards | B — refine | Small copy and permanently tilted icon tiles. Improve readable copy and level tiles, retain bento and featured card. |
| Login / portal dialog | Left artwork | C — replace asset only | Source is 468×542, displayed up to roughly 535×590 before DPR. Supply original resolution-independent vector master and optimized image variants; preserve proportions/forms. |
| Signup / reset | Auth card | A — preserve | Existing responsive form structure, focus, labels and safe unconfigured state work. Do not unify by replacing layout. |
| Projects, AI methods, reviews, about, team, contact, quote, blog, policies | Route content / forms | A — preserve | Existing route checks pass. Leave content, data, form actions and SEO untouched. |
| Admin | Authenticated shell, tables, CRUD | Not visually auditable without access | Secrets declined. No auth bypass, invented records or business-logic edits; do not claim authenticated QA. Shared field/icon improvements may apply. |

## Do not regress

- Keep every route, section, real data source, service link, form action and auth control.
- Keep metadata, canonicals, structured data, robots, sitemap, verification and server-rendered text unchanged.
- Preserve floating navigation, blue CTAs, original font, bright surfaces and dark storytelling moments.
- Keep native scrolling, five delivery controls, keyboard navigation, theme persistence and mobile drawer behavior.
- Keep content visible without JavaScript and under reduced motion; ordinary reveals must no longer replay after exit.
- No new runtime dependencies, no WebGL, no secret placeholders, no Supabase/Admin/Auth logic changes.
- No credentialed login, CMS writes, contact/quote submissions or email delivery claimed as verified.

## Changes delivered

1. Intentionally untouched: navigation geometry, footer, original typeface, all public routes/data/forms, signup/reset layouts, storytelling scenes, business/auth/admin code and all SEO source.
2. Icon corrections: removed service-tile fractional scale/rotation, technology/platform/trust/why-us icon scale and rotation, permanent benefit-tile perspective, direct orbit SVG drop-shadow and forced SVG Z translation. Removed legacy brand-color overrides on saturated platform tiles. Decorative scene perspective remains deliberately preserved; no claim that every decorative icon at every angle is pixel-perfect.
3. Login artwork: original multi-color dimensional vector master, rendered to a 2400×3000 WebP (109,192 bytes). Next Image delivers responsive AVIF/WebP; lab image transfer was about 11–17 KB. Existing login/modal proportions, inputs and actions preserved. Login entrance no longer fades the LCP surface from invisible.
4. Colors/cards: six semantic accent families, selectively used on service links and platform cards, with tinted borders and soft shadow depth. No text/icon blur and no new runtime dependencies.
5. Motion/flicker: ordinary reveals are 600 ms desktop / 420 ms mobile, 20 / 10 px translation, one entrance per mounted node, no blur or rotating text. The previous exit/rearm observer caused repeated opacity resets; targets are now consumed and unobserved at first entry. Hero copy is immediately visible with a transform-only entrance. JS tilt is limited to existing showcase opt-ins; ordinary cards lift 4 px without rotation.
6. Spacing/type: benefit descriptions increased to 13 px, titles to semibold with 1.3 line height. Existing page spacing and grid proportions intentionally retained rather than globally restyled.
7. Admin: no authenticated shell or CRUD visual modifications; insufficient access to diagnose a real defect safely. Shared styles remain available, but authenticated visual QA is pending.

## Checks and outcomes

- Existing environment reused and validated: source-mounted Next dev server, healthy port 3000, external Host accepted, dynamic allowedDevOrigins retained. User declined external secrets; no credentials or auth bypass added.
- TypeScript PASS; ESLint PASS; 119 unit tests PASS; isolated production builds before and after PASS. First isolated attempts exposed setup mistakes (out-of-root dependency symlink, inherited development NODE_ENV); corrected in the QA procedure, not in business code.
- Desktop/tablet/mobile: three scroll return visits stay fully visible without replay; native-wheel scene progression, five delivery buttons, ordinary card hover, service-card navigation/accordion, theme persistence, mobile menus, 16 further route entries, reduced-motion and no-JS PASS.
- Production browser interactions: portal open/reopen, close button, Escape, password show/hide, navigation, required-field validation, login image decoding, theme persistence and contact/consultation validation PASS. These validation tests intentionally submit no records.
- Eight important routes at 320×568, 360×800, 390×844, 400×818, 430×932, 768×1024, 981×900, 1024×768, 1280×800, 1366×768, 1440×900 and 1600×1000 PASS: no horizontal document overflow, one H1, no broken images, password toggle and forgot-password entry.
- DPR 1 / 1.25 / 1.5 / 2 / 3 PASS for computed level/unfiltered service glyphs and decoded login asset. Appearance/sharpness still needs human screenshot review.
- SEO comparison across 14 production routes: title, metadata, canonical, OpenGraph/Twitter, robots directives and JSON-LD unchanged. robots.txt and sitemap.xml unchanged.
- Live iframe health check after frontend edits PASS: no console errors, no failed requests, no error overlay and populated main content. Subsequent iframe interaction verification could not run reliably; standalone Chromium interactions above did pass. No visual sign-off inferred from DOM checks.

## Production lab comparison

Three samples per route/viewport on an unthrottled local Chromium browser at DPR 2; table shows medians. These are local timing/resource comparisons, NOT real-device field CWV, a Lighthouse TBT score or a guarantee of zero regression. Server image transformations warm across runs. Long-task blocking is the sum of observed task portions above 50 ms in the sample window.

| Width | Route | LCP before → after (ms) | CLS before → after | Long-task blocking before → after (ms) | JS encoded bytes before → after | Image bytes before → after |
| --- | --- | --- | --- | --- | --- | --- |
| 390 | / | 356 → 164 | 0 → 0 | 18 → 18 | 576358 → 576299 | 0 → 0 |
| 390 | /login | 128 → 128 | 0 → 0 | 0 → 0 | 577176 → 576267 | 8598 → 11159 |
| 981 | / | 336 → 176 | 0 → 0 | 15 → 0 | 576391 → 576267 | 0 → 0 |
| 981 | /login | 136 → 140 | 0 → 0 | 0 → 0 | 576358 → 576303 | 8598 → 17227 |
| 1440 | / | 364 → 168 | 0 → 0 | 21 → 32 | 576392 → 576300 | 0 → 0 |
| 1440 | /login | 132 → 136 | 0 → 0 | 4 → 12 | 576358 → 576267 | 8598 → 17227 |

Interpretation: no JS growth or measured layout shifts; immediately visible home copy removes its entrance delay. Optimized higher-resolution login artwork adds roughly 3–9 KB transferred in these samples. Small desktop long-task increases were observed (11/8 ms); no blanket claim of improved blocking or zero performance regression. Physical mobile scroll FPS/heat, throttled field LCP and standardized Lighthouse TBT were not measured.

## Outstanding release gates — not marked Complete

- Embedded screenshot attempts failed (timeout, then unavailable/hidden panel); final visual comparison cannot be claimed. Standalone captures reside in `/tmp/ajs-before`, `/tmp/ajs-after`, `/tmp/ajs-finishing` in the running container, including homepage sections, responsive routes and DPR captures. Open the preview for final visual review.
- Successful Supabase login, Google OAuth, signup persistence, CMS/admin CRUD, contact/quote persistence and email delivery remain unverified because credentials were declined. No working business feature was intentionally changed.
- AI Methods has no standalone public route in this checkout; do not invent `/ai-methods`. Its existing CMS configuration and any conditional rendering are untouched. Records-dependent project/review sections cannot be populated or audited without actual data.
- The attached brief's full release gate (including authenticated admin polish and complete visual/performance certification) is therefore still pending.
