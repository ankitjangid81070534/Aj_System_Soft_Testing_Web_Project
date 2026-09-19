# Phase 18 — Updates / Announcements / Offers (audit + bounded repair)

Program: [MASTER_PLAN_30_PHASES](MASTER_PLAN_30_PHASES.md), Phase 18. Branch `system-upgrade`.
Status: **PARTIAL.** Audit complete, two reproduced defects repaired. STOP before Phase 19.

## 1. Audit of the existing feature

Existing persistence and surfaces (no new schema, route, action or dependency):

| Contract item | Where it already lives | Verdict |
| --- | --- | --- |
| Offer records (price, discount, code, type, free/paid, tags, cover, SEO) | `offers` table, `toOffer` in `lib/data/growth.ts` | Present |
| Announcement / update records (type, badge, price label, icon, SEO) | `announcements` table, `toAnnouncement` | Present |
| Scheduling (`start_at` / `end_at`) | `withinWindow` filter | Present, defect P18-01 |
| Priority | `priority` (announcements), `popup_priority` / `is_featured` + `sort_order` (offers) | Present |
| Placement | `display_position`: `top_bar`, `homepage`, `side_floating`, `update_center`, `footer` | Only `top_bar` is rendered — gap |
| CTA (label + URL, https/path validated) | Both types, used by `AnnouncementBar` and `OfferPopup` | Present |
| Popup with frequency control | `OfferPopup`, `popup_frequency` / `popup_custom_hours` | Present, defect P18-02 |
| Dismissal | `is_dismissible`, per-id session key | Present |
| Admin editing | generic admin resources (`lib/admin/resources.ts`) | Present |
| Preview / detail routes | none — no `/offers` or `/updates` route exists | Deliberate: Phase 10 requires the sitemap not to advertise nonexistent detail routes. Not added in this slice. |

## 2. Defects reproduced and fixed

**P18-01 — scheduling frozen into the five-minute cache.** `withinWindow` ran *inside*
`unstable_cache`, so the live/expired decision was computed once per revalidation
window and then reused. An offer or announcement whose `end_at` passed stayed live,
and one whose `start_at` arrived stayed hidden, for up to five minutes.
Fix: the cached readers (`getPublishableOffers`, `getPublishableAnnouncements`) now
return published + active rows only, and `getLiveOffers` / `getLiveAnnouncements`
apply the schedule window per request. Query filters, ordering, limits, tags,
revalidate interval and every consumer signature are unchanged.

**P18-02 — popup re-shown on every navigation ("popup spam").** `OfferPopup` recorded
the frequency marker only in `handleClose`. A visitor who ignored the dialog and
navigated instead of closing it never wrote the marker, so the popup reopened two
seconds into every subsequent page. Fix: the marker is written when the popup is
actually shown (`recordShown`), keeping the same storage keys and the same
`every_visit` / `once_per_session` / `once_per_day` / `custom` semantics.

No change to popup priority selection (still one offer at a time, highest
`popup_priority`), dismissal storage, styling, or the optional animated-edge
highlight (not introduced).

## 3. Remaining Phase 18 work (not implemented here)

- `homepage`, `side_floating`, `update_center` and `footer` placements are stored but
  never rendered; deciding their surfaces needs owner approval on Home placement.
- No public update/offer detail or preview route; admin preview for these two resources
  therefore has no destination.
- Featured-item edge highlight is optional and deferred.

## 4. Verification and limits

- 598 tests / 67 files pass, including two new schedule-window cases
  (`lib/data/growth-schedule.test.ts`, mocked adapters only).
- `npm run typecheck` and ESLint on the changed files pass.
- Anonymous `GET /` returns 200 from the source dev server on 3000.
- **Not verified:** no offer or announcement records and no staff session exist in this
  environment, so hosted scheduling, popup frequency across real sessions, admin
  publishing and the public effect remain unverified. No screenshot, production build,
  SQL, data write, credential request, PR, merge or deployment.
