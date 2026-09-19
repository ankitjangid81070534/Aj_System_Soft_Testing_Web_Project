# Phase 17 (30-phase program) — Blog / Article CMS

Scope: article management on the existing persistence (`blog_posts`, `blog_categories`,
`blog_tags`, `blog_post_tags`) — draft/publish, SEO, categories/tags, author, cover,
dates, preview. No schema change, no new backend, no invented authority content.

Authenticated acceptance remains BLOCKED (no staff session, no configured Supabase).

## Audit — what already exists

| Capability | State | Evidence |
|---|---|---|
| Draft / publish | EXISTS — `status` field, Publish/Unpublish quick action, editors cannot change status | `resources.ts` posts config, `upsertResourceAction` |
| SEO | EXISTS — `seo_title`, `seo_description`, `og_image_url` on the post form; saves revalidate `/blog` and the sitemap | posts `fields`, `refreshResource` |
| Categories | EXISTS — own resource plus `category_id` on the post | `categories` config |
| Tags | EXISTS as a resource; **assigning tags to a post is not possible in admin** (`blog_post_tags` has no admin writer) | `tags` config, `getPostBySlug` reads the join |
| Author | Column `author_id` exists and the article page shows it, but **the post form has no author field**; authorship falls back to `created_by` | `blog_posts` row type, `getPostBySlug` |
| Cover image | EXISTS — `cover_image_url` (+ media library URL copy) | posts `fields` |
| Dates | EXISTS — `published_at` datetime, list column, ordering | posts `fields` |
| Public index respects publication | **BROKEN → FIXED** (see below) | `getPublishedPosts` |
| Draft preview from admin | **MISSING → FIXED** (see below) | `ResourceForm` |

## Root causes fixed this phase

1. **P17-01 — drafts leaked onto the public blog index.** `getPublishedPosts` filtered
   only `deleted_at is null`, so every draft and deactivated post appeared on `/blog`
   and in the homepage article teasers, while the article detail page and the sitemap
   correctly required `status = 'published'` and `is_active = true`. The index query now
   applies the same two filters. The category filter, pagination, ordering, teaser
   projection and the fallback-content behaviour are unchanged. New
   `src/lib/data/blog-publication.test.ts` pins both filters, including the
   category-filtered path.
2. **P17-02 — a draft article could not be previewed from admin.** The preview button in
   `ResourceForm` appeared only for published rows, even though the public detail
   readers for posts, services and projects all grant staff with `content:read` access
   to unpublished records. The button now appears for any saved row with a slug and
   reads "Preview draft" until the record is published. No permission, action or route
   changed — the preview link is the existing public detail route, which still refuses
   anonymous visitors.

## Still open (deliberately not done here)

- **Tag assignment per post** needs a writer for the `blog_post_tags` join table; that
  is a new multi-row write with its own atomicity and authorization design. Proposed as
  the next Phase 17 slice, not improvised now.
- **Author selection** needs a staff-user option source for the `author_id` select (the
  generic select fields carry no options today — the same gap as `category_id`).
- Scheduling a future `published_at` is not enforced by the index (a future date still
  shows once published); that belongs with Phase 18 scheduling.
- No authenticated create/publish/preview/save was executed, and no article records
  exist here, so the repaired index/preview are verified at source and unit scope only.

## Verification performed

- `npm run typecheck`, ESLint on all changed files, full unit suite: 596 tests / 66
  files pass (two new).
- `/blog` returns HTTP 200 on the source dev server (anonymous, fallback content).
- No SQL, migration, data write, dependency, secret, PR, merge or deployment.
