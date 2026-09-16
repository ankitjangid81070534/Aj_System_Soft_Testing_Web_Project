# Design baseline — 30-phase Phase 0

No design/feature changes were authorized or made. Preserve current AJ identity and prior accepted work. Reference images mentioned in the new prompt were **not supplied as separate image attachments this turn**; do not claim they were inspected.

## Current system

- Server-rendered requirement-led H1 with supporting platforms/capabilities; strong project and secondary project-discovery actions. Geist typography, controlled violet/blue accents, pale warm/cyan hero lighting, sharp Lucide icons and layered rounded surfaces already exist.
- Tokens/surfaces: `src/app/globals.css`, `foundation-tokens.css`, `surface-system.css`, `accent-surfaces.css`; homepage hero/sections/motion CSS Modules; shared PageHero/admin recipes.
- Desktop navigation from 1024px: accepted compact row, left visible brand, central eight links, search/login/project CTA and legal links. Mobile/tablet use a compact masthead plus one Home/Services/More/Projects/Contact dock with emphasized center More.
- Mobile screenshot showed short brand “AJS Technology”; tablet showed full company name. This is a baseline, not permission to replace it before Phase 5.
- Existing primary buttons have depth/glow; no verified travelling RGB masked-edge implementation exists. Future Phase 6 must respect reduced motion and foreground sharpness.
- Reveals run once; native scrolling/depth and some existing pointer/scene behavior are already present. Retain existing behavior pending measured Phase 24 audit; no new animation library required now.

## Captures and evidence limits

Local isolated-production captures exist in the web container at `/tmp/aj-phase0-mobile.png` (390×844), `/tmp/aj-phase0-tablet.png` (919×499), `/tmp/aj-phase0-desktop.png` (1440×900). Dimensions and no-page-overflow checks are persisted in [browser JSON](evidence/phase0-30/browser.json). These temporary PNG files are **not durable repository artifacts** and were not committed as binaries.

User-preview screenshots in this conversation visually show the tablet Home and mobile Home. The first requested “desktop” capture actually rendered the current 919px tablet; it is NOT desktop visual approval. Independent 1440px desktop capture succeeded but was not visually reviewed through a returned image. Later live browser access became unavailable. No all-device/accessibility/full-page visual sign-off is claimed.

Observed: clear requirement-led hero and visible single dock on the reviewed views; short tablet height places the fixed dock across the hero-action area until scrolling. Mobile actions wrap naturally; no new layout fix made. Admin/portal are only unconfigured notices here, not real populated visual baselines. Preserve the existing earlier audit captures as historical evidence.

Later design phases should compare identical routes/data/theme/viewport, verify controls by actual gestures and respect the exact phase gate. No homepage moves, asset replacement or refactoring in Phase 0.
