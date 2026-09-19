# Admin feature matrix — 30-phase program

## Phase 9 project checkpoint (2026-09-19)

[Current project audit](PHASE_9_30_PROJECTS.md) confirms existing generic project writes and public readers are preserved, not proven operational. `client_id` is absent from generic project fields; media upload indexes `media_assets`, not project gallery rows; explicit project-consent evidence and publication-date contracts are not present in the inspected model; project SEO fields are not consumed by detail metadata; generic Preview is published-only despite the staff reader's draft capability. These are deferred parity/access gates, not implemented repairs. No real admin save/media/publish/reload/public-effect test was possible, no schema or record was changed, and Phase 9 is not fully complete.

## Phase 1 audit checkpoint (2026-09-18)

See [the current data/save audit](PHASE_1_30_DATA_SAVE_AUDIT.md) for the UI → action → persistence → response → reload trace of all 39 actions and 17 resources. Offers/announcements Save now enforces the existing publication capability even without a quick Publish control; editor same-status edits omit status. All actual hosted saves remain BACKEND_DEPENDENT. Direct RLS parity, Builder integration, transactions, upload limits and affected-row checks remain open; 431 passing local tests do not close them.

All generic resources use `/ajadmin/c/[resource]`, `/new`, `/[id]`, `ResourceList`/`ResourceForm` and existing admin actions/CRUD. Existing list/search/field validation/status/loading/error patterns must be preserved. The table inventories **configured capability**, not a passed save. Actual list/create/update/delete/publish/media/reload/public effect is **BACKEND_DEPENDENT** for every row until approved existing-project sessions/data are available.

| Resource | Table | Existing operations | Public effect / concern |
|---|---|---|---|
| `services` | `services` | Publish/activate/trash/reorder | /services + detail |
| `clients` | `clients` | Publish/activate/trash/reorder | Public permission and portal link |
| `projects` | `projects` | Publish/activate/trash/reorder | /projects + approved detail |
| `team` | `team_members` | Publish/activate/trash/reorder | /team + Home |
| `testimonials` | `testimonials` | Publish/activate/trash/reorder | /reviews + Home |
| `posts` | `blog_posts` | Publish/activate/trash/reorder | /blog + detail/RSS |
| `categories` | `blog_categories` | Basic CRUD | Blog taxonomy |
| `tags` | `blog_tags` | Basic CRUD | Blog taxonomy |
| `navigation` | `navigation_items` | Activate/reorder | Header/footer |
| `payments` | `payment_links` | Activate | External payment link; not new checkout |
| `offers` | `offers` | Activate/reorder; status field | Conditional popup/Home; placement gaps |
| `announcements` | `announcements` | Activate; status field | Conditional bar; placement gaps |
| `benefits` | `launch_benefits` | Activate/reorder | Conditional Home benefits |
| `ai-methods` | `ai_methods` | Activate/reorder | /ai-methods; schema reconciliation |
| `socials` | `social_links` | Activate/reorder | Public social/contact links |
| `seo` | `seo_metadata` | Basic CRUD | Metadata/noindex overrides |
| `redirects` | `redirects` | Activate | Safe internal redirect lookup |

## Dedicated modules

| Route/module | Persistence | Classification / next verification |
|---|---|---|
| Home Builder `/ajadmin/home` | `page_sections` | EXISTS_BUT_BUGGY: fixed public Home ignores loader; silent quick-action failures and two-write reorder. Preserve content and editor guards. |
| Branding `/ajadmin/brand` | `site_settings` | BACKEND_DEPENDENT: confirm update + settings reload + public cache effect. |
| Media `/ajadmin/media` | Storage + `media_assets` | BACKEND_DEPENDENT: MIME/size/ownership/index consistency and reload. |
| Users `/ajadmin/users` | Auth admin API, profiles, usernames/addresses | BACKEND_DEPENDENT: real role matrix and safe username/reset workflow. |
| Leads `/ajadmin/leads` + kind/id | contact/quote/appointment tables | BACKEND_DEPENDENT: capability guard, status/notes and submitted-brief visibility. |
| Agreements `/ajadmin/agreements` | agreements/versions/acceptances + PDFs/storage | BACKEND_DEPENDENT: version activation, private links, acceptance evidence. |
| Audit `/ajadmin/audit` | audit_logs | BACKEND_DEPENDENT: visibility/role restrictions and real change evidence. |
| Dashboard `/ajadmin` | Capability-limited loaders | BACKEND_DEPENDENT: setup notice is not a working dashboard. |

## Requested-field gaps to revisit, not rebuild

- Projects already have name/slug/summary/overview/problem/solution/features/technology/integrations/platform/industry/cover/public+featured+status/SEO. Screenshot management, explicit consent relation, public client-name linkage and publication-date contract need comparison to actual schema.
- Posts already have title/slug/excerpt/Markdown/cover/category/reading time/publish date/featured/status/SEO/OG. A tags resource does **not** prove post-tag assignment UI; author and per-post canonical editing are not explicit generic fields. Avoid inventing an Engineering Notes table when existing articles may suffice.
- Offers/announcements already have schedules, imagery, CTA, activity and placement/priority fields; current `supports.publish` differs from their status fields. Check actual semantics rather than promising all quick actions.
- No contact-hub settings, structured wizard contract or secure AI knowledge/chat resource was found. Any new schema/UI requires later phase approval and existing-persistence compatibility.
- Do not run the old privileged RLS/seed scripts against real data. Source/mock tests are not hosted RLS evidence.

Detailed retained repair proposal: [prior CMS plan](PHASE_16_CMS_REPAIR_PLAN.md), **not implementation approval** under this new program. Phase 1 owns deeper action-by-action inspection; Phase 16 later owns comprehensive save QA. A toast never proves persistence.
