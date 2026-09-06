# Reference review and implementation boundaries

The supplied video is 36.267 seconds, 720 × 540, 30 fps. It was sampled at every
integer second **00–36 inclusive (37 images)**, not just at the opening scene.
The labelled images were reviewed as six six-frame sheets plus the final frame.
These are observations of the reference, not new website content.

| Second | Observed composition / movement |
| --- | --- |
| 00 | Light investing bento from the preceding scene; translucent raised cards. |
| 01 | Transition into hero; headline resolves and objects enter from the right. |
| 02 | Centered hero headline, small pill and first orbit objects. |
| 03 | Curved particle ribbon fills the lower half; colored objects separate in depth. |
| 04 | Hero holds with soft object movement and restrained CTA. |
| 05 | Orbit settles; clear whitespace around the headline. |
| 06 | Scroll transitions the light hero to a dark pinned presentation. |
| 07 | First glass interface panel rises/rotates into the foreground. |
| 08 | Panel settles beside readable supporting copy; oversized faint background word. |
| 09 | Dark scene holds with fine particles and circular depth guides. |
| 10 | Horizontal movement introduces the second word/panel; outgoing copy recedes. |
| 11 | Second panel faces the camera and its supporting copy resolves. |
| 12 | Third transition shows the panel nearly edge-on. |
| 13 | Third panel rotates toward the viewer; next copy arrives. |
| 14 | Third scene holds; bottom progress indicator reaches the final position. |
| 15 | Dark scene gives way to a bright split delivery section. |
| 16 | Purple illuminated room, floating interface and first active stage. |
| 17 | Panel crossfade/rotation; emphasis moves to the second stage. |
| 18 | Second interface settles with floating decorative objects around it. |
| 19 | Third-stage transition; camera-like depth and moving foreground objects. |
| 20 | Third interface settles over the perspective floor. |
| 21 | Third stage holds; underline and secondary controls remain visible. |
| 22 | Next light section starts; large heading resolves above fanned cards. |
| 23 | Cards spread into a balanced bento composition. |
| 24 | Bento holds; varied card elevations, highlights and purple accents. |
| 25 | Scroll reveals lower cards and small in-card chart movement. |
| 26 | Full bento composition just before the next transition. |
| 27 | Cards rotate into depth while the background transitions to dark. |
| 28 | Vertical light lines and a cylindrical ring of glass cards. |
| 29 | Ring continues rotating; central supporting message resolves. |
| 30 | Radial 3D burst grows from the center and replaces the cylinder scene. |
| 31 | Colored shapes spread around a glowing center; final heading arrives. |
| 32 | Final heading settles with strong depth separation. |
| 33 | Primary CTA appears underneath the heading. |
| 34 | Light footer enters below the dark finale. |
| 35 | Footer columns, social links and legal content settle. |
| 36 | Footer completes; a final gradient action band is visible. |

## Translation into this project

- Retain AJ System Soft Technology's original software/service content, records,
  links, forms, consent rules, route metadata, permissions and data sources.
  Do not import financial claims, prices, trading charts or provider branding.
- Use a soft violet surface system across public/account pages and the CMS shell.
  Keep working admin tables/forms level rather than applying playful tilt to inputs.
- Reuse one global entry observer, rearming on complete viewport exit. The old
  one-shot `unobserve` and pending-content timeout caused missing repeat effects.
- Add native-scroll panel rotation, stage depth, bento assembly, cylindrical cards
  and a radial finale. Decorative representations use existing capability labels.
- Use small pointer-responsive tilts, bounded at 3.5 degrees per axis. Touch and
  reduced-motion users get readable static layouts, not simulated wheel inertia.
- Motion is reference-inspired CSS/DOM geometry, not the reference's original
  rendered 3D assets or an assertion of a pixel-identical recreation.

## Verification limits

The browser regression script is read-only. It covers three viewport sizes,
re-entry, pointer tilt, buttons, links, menu/theme controls, additional public and
account routes, reduced motion and no JavaScript. The live preview additionally
checks contact required-field validation and opening/closing client login.
Supabase is not configured here: the admin setup screen is testable, but actual
staff dashboards, CMS writes, uploads and successful remote submissions require
a configured project and authorized session. No authorization bypass is used.
