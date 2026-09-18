# Route and feature matrix — Phase 0

Baseline `421447d827a2f5ec60acd2cc05e830b3acbbc92f`. Source patterns and anonymous isolated-production observations; this is not a completed Phase 1 mutation audit.

Current action-by-action expected/actual/status matrix: [Phase 1 functional audit](PHASE_1_FUNCTIONAL_AUDIT.md). That report supersedes verification status only; this Phase 0 source/route inventory remains the immutable baseline. Full Phase 1 is still blocked, not completed.

## Source route patterns

| Route | Source | Feature/data boundary | Observation |
|---|---|---|---|
| `/about` | `website/src/app/(public)/about/page.tsx` | Public layout/settings/content; imported modules in source inventory | HTTP 200 → /about |
| `/account` | `website/src/app/(public)/account/page.tsx` | Client auth/profile/recovery; cookies + Supabase | HTTP 200 → /account |
| `/ai-methods` | `website/src/app/(public)/ai-methods/page.tsx` | Public layout/settings/content; imported modules in source inventory | HTTP 200 → /ai-methods |
| `/blog/[slug]` | `website/src/app/(public)/blog/[slug]/page.tsx` | Posts/taxonomy/RSS; CMS or existing articles | Dynamic pattern; representative/fallback routes below, authenticated records blocked |
| `/blog` | `website/src/app/(public)/blog/page.tsx` | Posts/taxonomy/RSS; CMS or existing articles | HTTP 200 → /blog |
| `/contact` | `website/src/app/(public)/contact/page.tsx` | Public layout/settings/content; imported modules in source inventory | HTTP 200 → /contact |
| `/forgot-password` | `website/src/app/(public)/forgot-password/page.tsx` | Client auth/profile/recovery; cookies + Supabase | HTTP 200 → /forgot-password |
| `/login` | `website/src/app/(public)/login/page.tsx` | Client auth/profile/recovery; cookies + Supabase | HTTP 200 → /login |
| `/` | `website/src/app/(public)/page.tsx` | Public layout/settings/content; imported modules in source inventory | HTTP 200 → / |
| `/privacy` | `website/src/app/(public)/privacy/page.tsx` | Public layout/settings/content; imported modules in source inventory | HTTP 200 → /privacy |
| `/projects/[slug]` | `website/src/app/(public)/projects/[slug]/page.tsx` | Public-only projects/media; empty when CMS absent | Dynamic pattern; representative/fallback routes below, authenticated records blocked |
| `/projects` | `website/src/app/(public)/projects/page.tsx` | Public-only projects/media; empty when CMS absent | HTTP 200 → /projects |
| `/request-quote` | `website/src/app/(public)/request-quote/page.tsx` | Public layout/settings/content; imported modules in source inventory | HTTP 200 → /request-quote |
| `/reset-password` | `website/src/app/(public)/reset-password/page.tsx` | Client auth/profile/recovery; cookies + Supabase | HTTP 200 → /reset-password |
| `/reviews` | `website/src/app/(public)/reviews/page.tsx` | Public layout/settings/content; imported modules in source inventory | HTTP 200 → /reviews |
| `/service-agreement` | `website/src/app/(public)/service-agreement/page.tsx` | Public layout/settings/content; imported modules in source inventory | HTTP 200 → /service-agreement |
| `/services/[slug]` | `website/src/app/(public)/services/[slug]/page.tsx` | Services + FAQs; anonymous published CMS or existing fallback | Dynamic pattern; representative/fallback routes below, authenticated records blocked |
| `/services` | `website/src/app/(public)/services/page.tsx` | Services + FAQs; anonymous published CMS or existing fallback | HTTP 200 → /services |
| `/signup` | `website/src/app/(public)/signup/page.tsx` | Client auth/profile/recovery; cookies + Supabase | HTTP 200 → /signup |
| `/team` | `website/src/app/(public)/team/page.tsx` | Public layout/settings/content; imported modules in source inventory | HTTP 200 → /team |
| `/terms` | `website/src/app/(public)/terms/page.tsx` | Public layout/settings/content; imported modules in source inventory | HTTP 200 → /terms |
| `/update-password` | `website/src/app/(public)/update-password/page.tsx` | Client auth/profile/recovery; cookies + Supabase | HTTP 200 → /update-password |
| `/ajadmin/agreements` | `website/src/app/ajadmin/agreements/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | HTTP 200 → /ajadmin/login |
| `/ajadmin/audit` | `website/src/app/ajadmin/audit/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | HTTP 200 → /ajadmin/login |
| `/ajadmin/brand` | `website/src/app/ajadmin/brand/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | HTTP 200 → /ajadmin/login |
| `/ajadmin/c/[resource]/[id]` | `website/src/app/ajadmin/c/[resource]/[id]/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | Dynamic pattern; representative/fallback routes below, authenticated records blocked |
| `/ajadmin/c/[resource]/new` | `website/src/app/ajadmin/c/[resource]/new/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | Dynamic pattern; representative/fallback routes below, authenticated records blocked |
| `/ajadmin/c/[resource]` | `website/src/app/ajadmin/c/[resource]/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | Dynamic pattern; representative/fallback routes below, authenticated records blocked |
| `/ajadmin/home/[id]` | `website/src/app/ajadmin/home/[id]/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | Dynamic pattern; representative/fallback routes below, authenticated records blocked |
| `/ajadmin/home/new` | `website/src/app/ajadmin/home/new/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | HTTP 200 → /ajadmin/home/new |
| `/ajadmin/home` | `website/src/app/ajadmin/home/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | HTTP 200 → /ajadmin/home |
| `/ajadmin/leads/[kind]/[id]` | `website/src/app/ajadmin/leads/[kind]/[id]/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | Dynamic pattern; representative/fallback routes below, authenticated records blocked |
| `/ajadmin/leads` | `website/src/app/ajadmin/leads/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | HTTP 200 → /ajadmin/leads |
| `/ajadmin/login` | `website/src/app/ajadmin/login/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | HTTP 200 → /ajadmin/login |
| `/ajadmin/media` | `website/src/app/ajadmin/media/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | HTTP 200 → /ajadmin/login |
| `/ajadmin` | `website/src/app/ajadmin/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | HTTP 200 → /ajadmin |
| `/ajadmin/users` | `website/src/app/ajadmin/users/page.tsx` | Staff/CMS; proxy + server capability checks; Supabase required | HTTP 200 → /ajadmin/login |
| `/auth/callback` | `website/src/app/auth/callback/route.ts` | Client auth/profile/recovery; cookies + Supabase | HTTP 200 → /login |
| `/auth/confirm` | `website/src/app/auth/confirm/route.ts` | Client auth/profile/recovery; cookies + Supabase | HTTP 200 → /login |
| `/blog/rss.xml` | `website/src/app/blog/rss.xml/route.ts` | Posts/taxonomy/RSS; CMS or existing articles | HTTP 200 → /blog/rss.xml |
| `/design-preview` | `website/src/app/design-preview/page.tsx` | Public layout/settings/content; imported modules in source inventory | HTTP 200 → /design-preview |

## Observed URL probes

HTTP status is the **final response after browser redirects**, not a claim of no redirects. Setup/empty screens are not working dashboards or persisted CMS data. Three intentionally nonexistent detail slugs returning 404 are expected. `/offers`, `/updates`, `/portal`, `/profile` are compatibility/growth probes, not currently working routes.

| URL | Final path | HTTP | State |
|---|---|---|---|
| `/about` | `/about` | 200 | Read-only render/endpoint checked |
| `/account` | `/account` | 200 | Setup-only / authenticated workflow blocked |
| `/ai-methods` | `/ai-methods` | 200 | Read-only render/endpoint checked |
| `/blog` | `/blog` | 200 | Read-only render/endpoint checked |
| `/contact` | `/contact` | 200 | Read-only render/endpoint checked |
| `/forgot-password` | `/forgot-password` | 200 | Rendered; real auth blocked |
| `/login` | `/login` | 200 | Rendered; real auth blocked |
| `/` | `/` | 200 | Read-only render/endpoint checked |
| `/privacy` | `/privacy` | 200 | Read-only render/endpoint checked |
| `/projects` | `/projects` | 200 | Read-only render/endpoint checked |
| `/request-quote` | `/request-quote` | 200 | Read-only render/endpoint checked |
| `/reset-password` | `/reset-password` | 200 | Rendered; real auth blocked |
| `/reviews` | `/reviews` | 200 | Read-only render/endpoint checked |
| `/service-agreement` | `/service-agreement` | 200 | Read-only render/endpoint checked |
| `/services` | `/services` | 200 | Read-only render/endpoint checked |
| `/signup` | `/signup` | 200 | Rendered; real auth blocked |
| `/team` | `/team` | 200 | Read-only render/endpoint checked |
| `/terms` | `/terms` | 200 | Read-only render/endpoint checked |
| `/update-password` | `/update-password` | 200 | Rendered; real auth blocked |
| `/ajadmin/agreements` | `/ajadmin/login` | 200 | Setup-only / authenticated workflow blocked |
| `/ajadmin/audit` | `/ajadmin/login` | 200 | Setup-only / authenticated workflow blocked |
| `/ajadmin/brand` | `/ajadmin/login` | 200 | Setup-only / authenticated workflow blocked |
| `/ajadmin/home/new` | `/ajadmin/home/new` | 200 | Setup-only / authenticated workflow blocked |
| `/ajadmin/home` | `/ajadmin/home` | 200 | Setup-only / authenticated workflow blocked |
| `/ajadmin/leads` | `/ajadmin/leads` | 200 | Setup-only / authenticated workflow blocked |
| `/ajadmin/login` | `/ajadmin/login` | 200 | Setup-only / authenticated workflow blocked |
| `/ajadmin/media` | `/ajadmin/login` | 200 | Setup-only / authenticated workflow blocked |
| `/ajadmin` | `/ajadmin` | 200 | Setup-only / authenticated workflow blocked |
| `/ajadmin/users` | `/ajadmin/login` | 200 | Setup-only / authenticated workflow blocked |
| `/auth/callback` | `/login` | 200 | Read-only render/endpoint checked |
| `/auth/confirm` | `/login` | 200 | Read-only render/endpoint checked |
| `/blog/rss.xml` | `/blog/rss.xml` | 200 | Read-only render/endpoint checked |
| `/design-preview` | `/design-preview` | 200 | Read-only render/endpoint checked |
| `/services/custom-software-development` | `/services/custom-software-development` | 200 | Read-only render/endpoint checked |
| `/services/saas-development` | `/services/saas-development` | 200 | Read-only render/endpoint checked |
| `/services/web-application-development` | `/services/web-application-development` | 200 | Read-only render/endpoint checked |
| `/services/website-development` | `/services/website-development` | 200 | Read-only render/endpoint checked |
| `/services/ecommerce-development` | `/services/ecommerce-development` | 200 | Read-only render/endpoint checked |
| `/services/android-app-development` | `/services/android-app-development` | 200 | Read-only render/endpoint checked |
| `/services/ios-app-development` | `/services/ios-app-development` | 200 | Read-only render/endpoint checked |
| `/services/desktop-software-development` | `/services/desktop-software-development` | 200 | Read-only render/endpoint checked |
| `/services/erp-business-software` | `/services/erp-business-software` | 200 | Read-only render/endpoint checked |
| `/services/hospital-clinic-software` | `/services/hospital-clinic-software` | 200 | Read-only render/endpoint checked |
| `/services/pharmacy-software` | `/services/pharmacy-software` | 200 | Read-only render/endpoint checked |
| `/services/retail-pos-inventory` | `/services/retail-pos-inventory` | 200 | Read-only render/endpoint checked |
| `/services/hotel-management-software` | `/services/hotel-management-software` | 200 | Read-only render/endpoint checked |
| `/services/api-system-integrations` | `/services/api-system-integrations` | 200 | Read-only render/endpoint checked |
| `/services/cloud-deployment-maintenance` | `/services/cloud-deployment-maintenance` | 200 | Read-only render/endpoint checked |
| `/blog/how-to-plan-a-custom-software-project` | `/blog/how-to-plan-a-custom-software-project` | 200 | Read-only render/endpoint checked |
| `/blog/web-app-or-mobile-app-choosing-the-right-platform` | `/blog/web-app-or-mobile-app-choosing-the-right-platform` | 200 | Read-only render/endpoint checked |
| `/blog/what-erp-digitization-actually-means-for-small-businesses` | `/blog/what-erp-digitization-actually-means-for-small-businesses` | 200 | Read-only render/endpoint checked |
| `/ajadmin/c/services` | `/ajadmin/c/services` | 200 | Setup-only / authenticated workflow blocked |
| `/ajadmin/c/services/new` | `/ajadmin/c/services/new` | 200 | Setup-only / authenticated workflow blocked |
| `/ajadmin/c/services/00000000-0000-0000-0000-000000000000` | `/ajadmin/c/services/00000000-0000-0000-0000-000000000000` | 200 | Setup-only / authenticated workflow blocked |
| `/ajadmin/c/ai-methods` | `/ajadmin/c/ai-methods` | 200 | Setup-only / authenticated workflow blocked |
| `/offers` | `/offers` | 404 | Missing route; review references |
| `/updates` | `/updates` | 404 | Missing route; review references |
| `/portal` | `/portal` | 404 | Missing route; review references |
| `/profile` | `/profile` | 404 | Missing route; review references |
| `/projects/phase0-nonexistent` | `/projects/phase0-nonexistent` | 404 | Expected missing-slug 404 |
| `/services/phase0-nonexistent` | `/services/phase0-nonexistent` | 404 | Expected missing-slug 404 |
| `/blog/phase0-nonexistent` | `/blog/phase0-nonexistent` | 404 | Expected missing-slug 404 |
| `/robots.txt` | `/robots.txt` | 200 | Read-only render/endpoint checked |
| `/sitemap.xml` | `/sitemap.xml` | 200 | Read-only render/endpoint checked |
| `/ads.txt` | `/ads.txt` | 200 | Read-only render/endpoint checked |
| `/opengraph-image` | `/opengraph-image` | 200 | Read-only render/endpoint checked |
| `/icon` | `/icon` | 200 | Read-only render/endpoint checked |

## Shared UI and business-flow boundaries

| Feature/control | Frontend | Handler/server | Database or integration | Expected | Phase 0 actual |
|---|---|---|---|---|---|
| Desktop nav / active item | MarketingHeader, BottomNavigation, NavBar | Next Link / pathname | CMS navigation (fallback now) | Fast route + active state; one row | Live Services click and Home return passed; prior spacing baseline preserved |
| Mobile More / close | BottomNavigation native dialog | onOpen/onClose; search/filter | None for dialog gesture | Open/close, overflow links | Production mobile gesture passed; no mobile CSS changes |
| Portal entry / search / theme | MarketingHeader, PortalLoginModal, BottomNavigation, ThemeToggle | Existing auth callback + theme class/local preference | Supabase for successful account entry | Real account when authenticated; safe UI otherwise | Existing prior-turn tests retained; logged-out pages rendered; full session flow blocked |
| Contact / quote / consultation | LeadForms | submitContactAction / submitQuoteAction / requestAppointmentAction | contact_submissions / quote_requests / appointment_requests; storage; agreements; Resend | Validation → durable record → truthful outcome | UI/source mapped; successful writes/email blocked; no test leads created |
| Login/signup/recovery/Google | AuthForms / LoginExperience | portal actions + /auth/callback + /auth/confirm | Supabase Auth/profile; optional recovery email | Session/cookie + authorized redirect | Forms render; missing-token callbacks safe redirect; real identity flows blocked |
| Profile/address/avatar/review | AccountForms / account page | portal actions | profiles/user_addresses/testimonials/profile-avatars | Own-user write, reload persistence; moderated review | Setup-only screen; all real writes/ownership verification blocked |
| Resource list/search/filter/create/edit/save/publish/trash/restore/reorder | ResourceList / ResourceForm | admin/actions + crud + resources | Seventeen configured resource families | Capability check + allowlist + persisted row + public revalidation | Setup-only runtime; static boundary mapped, mutation verification blocked |
| Home builder | home routes | builder-actions | page_sections | Save should influence published home | Static disconnect: home does not use getHomeSections; database replay blocked |
| Media upload/delete | admin/media | media-actions | Storage + media_assets | Auth + type/size checks + upload/index consistency | Real bucket writes blocked |
| Settings / branding | BrandSettingsForm | settings-actions | site_settings + cached public layout | Validated save reflected publicly | Configuration and persistence blocked |
| User/role/username operations | admin/users | user-actions | Supabase admin API/profiles/admin_usernames | Super-admin capability, no escalation | Real users/role tests blocked |
| Agreements/PDF/version activation/acceptance | admin/agreements; AgreementsHistory | agreement-actions / agreements data+acceptance | agreements/versions/acceptances/storage | Version evidence and private access | Public agreement absent notice; real version/write tests blocked |
| SEO metadata/redirect editor | generic ResourceForm | admin resource actions | seo_metadata / redirects | Metadata public sync; safe old-slug redirect | Rendering mapped; matcher coverage risk; actual CMS sync blocked |
| Payment links | Generic CMS payment resource | generic CRUD | payment_links / external URL | Authorized link management | No checkout provider flow verified or added |

## Complete Server Action export inventory

All listed functions were located in source. Status for successful integration/mutation paths: **BLOCKED—real Supabase/email/auth required**; static inspection is not persistence evidence.

| Module | Function exports | Literal table/storage references |
|---|---|---|
| `website/src/lib/admin/actions.ts` | `upsertResourceAction`, `setResourceStatusAction`, `toggleResourceActiveAction`, `deleteResourceAction`, `restoreResourceAction`, `reorderResourceAction` | Indirect/helper or dynamic resource table |
| `website/src/lib/admin/agreement-actions.ts` | `createAgreementAction`, `createAgreementVersionAction`, `activateAgreementVersionAction`, `generateAgreementVersionPdfAction`, `archiveAgreementAction` | agreement_versions, agreements, audit_logs |
| `website/src/lib/admin/builder-actions.ts` | `toggleSectionVisibilityAction`, `reorderSectionAction`, `setSectionStatusAction`, `saveSectionAction`, `createSectionAction` | page_sections |
| `website/src/lib/admin/media-actions.ts` | `uploadMediaAction`, `deleteMediaAction` | media_assets |
| `website/src/lib/admin/settings-actions.ts` | `updateSettingsAction` | site_settings |
| `website/src/lib/admin/user-actions.ts` | `createUserAction`, `resetUserPasswordAction`, `changeUserRoleAction`, `updateAdminUsernameAction` | admin_usernames, audit_logs, profiles, user_addresses |
| `website/src/lib/auth/actions.ts` | `signInAction`, `signOutAction` | admin_usernames, profiles |
| `website/src/lib/leads/actions.ts` | `submitContactAction`, `submitQuoteAction`, `requestAppointmentAction` | appointment_requests, contact_submissions, lead-attachments, quote_requests |
| `website/src/lib/leads/admin-actions.ts` | `updateLeadAction` | appointment_requests, contact_submissions, quote_requests |
| `website/src/lib/portal/actions.ts` | `clientLoginAction`, `clientSignupAction`, `googleOAuthReadyAction`, `forgotPasswordAction`, `updatePasswordAction`, `updateProfileAction`, `completeProfileAction`, `uploadAvatarAction`, `submitVerifiedReviewAction`, `clientSignOutAction` | admin_usernames, agreement_acceptances, clients, profile-avatars, profiles, projects, testimonials, user_addresses |

## Configured generic resource table map

| Resource | Table | Capability family |
|---|---|---|
| `services` | `services` | `content` (per-operation read/write/publish) |
| `clients` | `clients` | `content` (per-operation read/write/publish) |
| `projects` | `projects` | `content` (per-operation read/write/publish) |
| `team` | `team_members` | `content` (per-operation read/write/publish) |
| `testimonials` | `testimonials` | `content` (per-operation read/write/publish) |
| `posts` | `blog_posts` | `content` (per-operation read/write/publish) |
| `categories` | `blog_categories` | `content` (per-operation read/write/publish) |
| `tags` | `blog_tags` | `content` (per-operation read/write/publish) |
| `navigation` | `navigation_items` | `settings` (per-operation read/write/publish) |
| `payments` | `payment_links` | `settings` (per-operation read/write/publish) |
| `offers` | `offers` | `content` (per-operation read/write/publish) |
| `announcements` | `announcements` | `content` (per-operation read/write/publish) |
| `benefits` | `launch_benefits` | `content` (per-operation read/write/publish) |
| `ai-methods` | `ai_methods` | `content` (per-operation read/write/publish) |
| `socials` | `social_links` | `settings` (per-operation read/write/publish) |
| `seo` | `seo_metadata` | `settings` (per-operation read/write/publish) |
| `redirects` | `redirects` | `settings` (per-operation read/write/publish) |

Detailed observed page controls, canonical/robots/schema, images and runtime errors are in [routes.json](evidence/routes.json); direct imports/exports for every module are in [source-inventory.json](evidence/source-inventory.json). Phase 1 must add expected/actual UI → handler → database → reload/public-sync rows per action and role.
