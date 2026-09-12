# Phase 3 — before/after screenshot evidence

Source baseline `9483231aebb7066f82e348cd83150e539895c9a1`; captured 2026-09-12. Images are full-page captures except the tablet viewport pair, losslessly converted to WebP. No app artwork was generated or replaced.

The live iframe screenshot tool was unavailable (`iframe_hidden`). The five main pairs were captured in independent browser contexts against the running cloned-source preview origin, with reduced motion for stable comparisons. Tablet baseline comes from an isolated production build of the exact starting HEAD; current tablet is the dev source. Main content/link/nav comparisons are in [preservation.json](preservation.json), tablet dimensions in [tablet-baseline.json](tablet-baseline.json).

| View | Size/theme | Before | After |
|---|---|---|---|
| Homepage desktop | 1214×900, light | [Before](before/home-desktop.webp) | [After](after/home-desktop.webp) |
| Services desktop | 1214×900, light | [Before](before/services-desktop.webp) | [After](after/services-desktop.webp) |
| Services mobile | 390×844, light | [Before](before/services-mobile.webp) | [After](after/services-mobile.webp) |
| Contact mobile | 390×844, light | [Before](before/contact-mobile.webp) | [After](after/contact-mobile.webp) |
| Services desktop | 1214×900, dark | [Before](before/services-dark.webp) | [After](after/services-dark.webp) |
| Services tablet | 768×1024, light | [Before](before/services-tablet.webp) | [After](after/services-tablet.webp) |

Independent desktop light screenshots and side-by-side views of the saved mobile/contact and dark images were visually reviewed: structure and content remain intact, highlights/shadows are more restrained and text remains legible. Geometry/interaction assertions are separate evidence, not inferred from screenshots. Full-page captures place fixed navigation at the captured viewport position; that is not a claim that the dock moves with the document.

No authenticated admin/client screenshots or successful form submissions were performed. The temporary read-only image-review server was tooling only and was removed; it is not an app deployment or a permanent public gallery.
