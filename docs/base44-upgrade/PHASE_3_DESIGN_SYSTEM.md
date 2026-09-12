# Phase 3 — design-system foundation

Date: 2026-09-12. Starting HEAD: `9483231aebb7066f82e348cd83150e539895c9a1`; branch `upgrade-desktop-navbar`.

**COMPLETE within the presentation-only scope; STOPPED before Phase 4.** The owner authorized this phase with `START NEXT PHASE SAFELY`. Phase 1 remains incomplete/deferred. The Phase 2 homepage movement proposal is neither approved nor implemented.

## Changes and preservation

| Foundation | Implementation | Preservation boundary |
|---|---|---|
| Typography | Added named label/body/card-title sizes alongside the existing fluid display scale. CardTitle and Badge consume the matching title/label tokens | Existing font families, display scale, heading copy and effective component sizes retained; no global type redesign |
| Spacing | Card-body and badge inset tokens used by shared components | Same existing insets; no section reordering or density change |
| Radii / borders | Named control, card, compact-card, field and tile radii; shared border-width token | Current pill controls, 24px display cards/20px compact cards, 12px fields; navbar geometry unchanged |
| Elevation | Moved shared neutral surface recipes into `foundation-tokens.css`; added restrained jewel-card and tile shadows | Preserve surface roles, stable service colors and form/table neutrality |
| Mobile depth | Smaller bounded card shadows at 700px and below | Hit areas/dock unchanged; no permanent hover animation on touch |
| Color contrast | Darkened light-theme muted text, success and danger tokens; reduced bright card highlight contribution and darkened its base | Existing accent identities retained; no invented brand palette or content |
| Focus | Independent theme-aware 3px outlines with 4px offset for focus-ring controls; shared fields adopt the same utility | Native input constraints, aria-invalid, navigation and submission behavior unchanged |
| Buttons | Tokenized existing dimensions/motion; corrected dark ghost-face text and faint process-stage numerals | Loading/disabled/link semantics, action labels, destinations and icon choices untouched |
| Badges | Shared typography/radius/inset tokens plus improved semantic contrast | Tone/status maps and unknown-status fallback unchanged |
| Icon tiles | Shared depth token; existing `filter: none`/opaque SVG foreground retained | Highlights remain in the tile/card background and shadow, not a blur on foreground strokes |
| Card variants | Preserve neutral `flat` and display-card variants; constrain white display-copy styling to eligible display surfaces | Form/table/nested cards must not inherit unconditional white paragraph/title overrides |
| Motion | Shared 220ms control / 320ms surface durations and existing ease-soft; reduced motion resolves durations/lift to zero | No new observers, animation package, scroll scene or runtime behavior |

### Why this is a foundation refactor, not a redesign

One focused token stylesheet is imported by globals. Existing surface styles now consume its recipes rather than redeclaring them. Button, Badge, Card and Input/Select/Textarea changes are class-string changes only: no prop API, handler, native semantics or business logic changes. New code tests these existing contracts.

Unchanged: HomeExperience order/content, route files/slugs, navigation components/styles, CTA copy, public data loaders, admin actions/auth, migrations, dependencies, compose and secret configuration. No fabricated projects, testimonials, people, metrics or images. No provider calls or test-data writes.

## Verification and evidence

Evidence directory: [phase-3](evidence/phase-3/SCREENSHOTS.md).

| Check | Result / evidence |
|---|---|
| Regression suite | **28 files / 210 tests PASS** — 181 existing + 29 focused foundation cases; [tests](evidence/phase-3/tests.txt) |
| Types and lint | **PASS** — [typecheck](evidence/phase-3/typecheck.txt), [lint](evidence/phase-3/lint.txt). Initial new-test typing/lint issues were corrected before final runs |
| Production build | **PASS** — isolated source/dependency copy under `/tmp`, default production build; live `.next` untouched. [build](evidence/phase-3/build.txt) |
| Before/after source rendering | Five same-size/light-dark views: main text, links, card counts and navbar rectangle preserved; zero page errors or overflow. [preservation](evidence/phase-3/preservation.json) |
| Tablet baseline | Clean pre-edit HEAD built separately: both versions at 768×1024 give x149/y914.8125, 470×93.1875 dock. [comparison](evidence/phase-3/tablet-baseline.json) |
| Desktop/mobile navigation geometry | 1214×900: 1182×64 at x16/y16. 390×844: 362×84 at x14/y744. Unchanged in light/dark capture comparisons |
| Real browser scenarios | **8/8 PASS**, no page errors, zero POST requests. [results](evidence/phase-3/browser-results.json) |
| Live iframe health | No console errors, failed requests or error overlay; main has two children. Real Services/detail/quote/Home navigation gestures passed; Home restored |
| Screenshot evidence | Six before/after pairs captured, including tablet; lossless WebP evidence. Desktop light, dark and mobile service/contact comparisons visually reviewed using independent captures |
| Production entry points | Both baseline/current `/`, `/services`, `/contact` returned 200 without overflow. [production comparison](evidence/phase-3/production-check.json) |
| Change-scope / whitespace | `git diff --check` PASS; runtime edits limited to shared CSS/component presentation classes and focused tests |

### Interaction outcomes (preservation tests, not new features)

1. **Service card keyboard focus → Enter → actual detail:** PASS; 3px solid outline, correct detail URL and heading.
2. **Project CTA click → quote form:** PASS; `/request-quote` and actual form visible.
3. **Field focus + blank submit:** PASS; clear outline, invalid required field focused, no network write. This is NOT a successful enquiry-persistence test.
4. **Theme toggle → reload → restore light:** PASS; dark focus token `#93c5fd` persisted and original light state restored.
5. **Mobile More open/close:** PASS; dialog opens/closes; dock rectangle unchanged.
6. **Reduced motion / sharp icons:** PASS; card transition `0s`, SVG filter `none`, opacity `1`; compact shadow confirmed.
7. **Tablet layout:** PASS against actual pre-edit source baseline, not a guessed mobile height.
8. **Pointer hover:** PASS; -4px lift and unfiltered foreground icon.

No interactive feature was added. Existing shared control behavior was exercised; authenticated admin/portal gestures remain unverified because Phase 1 configuration/test-session gates remain unresolved. Ghost/loading/status rendering has unit/source coverage, not an authenticated admin screenshot or persistence claim.

### Honest corrections and tool limits

- The first tablet assertion incorrectly reused the phone's 84px height. It failed at 93.1875px. A separate build of the exact starting HEAD confirmed that 93.1875px was already correct at tablet width. Only the test expectation changed; no app fix was invented. [Initial result retained](evidence/phase-3/browser-initial.json).
- One live navigation script read the URL before the new detail page finished rendering. A retry awaited the detail-specific third breadcrumb, then confirmed the correct heading/URL. The independent browser also verified keyboard navigation. No additional source edit was needed for that readiness correction.
- The live screenshot tool reported `iframe_hidden`; it was not retried. Independent browsers captured the running cloned source through its preview origin. Desktop/mobile/dark comparisons were reviewed separately, not misrepresented as successful in-iframe captures.
- Reusing the same external screenshot URL returned a stale image; a cache-busted request showed the updated surface. Saved before/after files come from fresh browser contexts, not that stale response.

## Contrast and performance boundaries

The new tests calculate WCAG contrast for muted text on light/dark neutral surfaces, light semantic badge surfaces, neutral-theme focus colors, and white paragraph copy at the brightest modeled endpoint of all 12 existing card accent/highlight pairs. The card calculation includes the existing 0.92 paragraph opacity. It locks the actual gradient coefficients to avoid silently testing a different recipe.

These are **selected design-token AA contracts**, not a claim of whole-site WCAG certification, all image/gradient pixel combinations, authenticated page coverage or every legacy component. Existing hardcoded styles elsewhere remain for subsequent scoped audits. Native validation, consent, access control and email behavior were not changed.

Production byte comparison (encoded resource bytes, one sample per route/version): CSS **42,263 → 42,777 bytes** (+514); scripts increased **139–141 bytes** depending on route. No new runtime dependency or animation loop. This small measured increase is disclosed, not described as zero cost. It is not field Core Web Vitals, INP, a conversion experiment or an assurance that all production performance gates have passed.

## Next phase / approvals

Next: **Phase 4 — Navbar + Hero + Primary Conversion UX**, only on a fresh phase command. Preserve the approved compact desktop navbar, eight centered links, visible brand and mobile/tablet dock. Phase 4 must not become an unapproved new navigation design or change successful/failed backend behavior.

Phase 5 material homepage moves still require explicit owner approval of the Phase 2 ledger. Do not bypass the disconnected Home Builder or invent schema/content. Do not repeat rejected Supabase/Resend prompts without the owner's explicit request. No PR, merge, deployment or data migration was performed or authorized here.
