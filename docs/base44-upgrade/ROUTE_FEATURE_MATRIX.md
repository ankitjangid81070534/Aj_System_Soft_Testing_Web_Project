# Route and requested-feature matrix — 30-phase baseline

2026-09-16; pre-edit `b566a40`. Classifications describe observed/source scope, not authenticated persistence approval. Historical matrix is [archived](archive-pre-30-phase/ROUTE_FEATURE_MATRIX.md).

## Requested feature classification

| Feature | Classification | Evidence / boundary |
|---|---|---|
| Requirement-led hero, brand, primary CTA | EXISTS_AND_GOOD | HomeHero/HomeExperience; rendered source and baseline captures. Preserve current message. |
| Service hub + 15 service detail pages | EXISTS_AND_GOOD | Existing service/fallback loaders and routes; anonymous render checked. |
| Launch benefits | EXISTS_NEEDS_POLISH | Existing growth data/CMS and conditional Home section; real record behavior unverified. |
| Industries/process/technology/ownership | EXISTS_AND_GOOD | Existing Home sections; do not duplicate. Operational claims still need owner verification. |
| Real projects/case studies | BACKEND_DEPENDENT | Existing /projects and /projects/[slug], substantial CMS fields; real approved records unavailable. |
| Team/reviews/proof | BACKEND_DEPENDENT | Existing public routes, moderation/publication and empty states; never invent records. |
| Blog/insights/articles | EXISTS_NEEDS_POLISH | Existing CMS/fallback articles and RSS; author/tag/canonical editing gaps require audit. |
| Contact/quote/consultation/WhatsApp/call/email | BACKEND_DEPENDENT | Existing routes/actions/direct links; save/email success not verified. |
| Service agreement/privacy/terms/disclaimer | EXISTS_NEEDS_POLISH | Routes and links exist; current service agreement is an unpublished notice in this sandbox. |
| Login/signup/recovery/Google/portal | BACKEND_DEPENDENT | Existing Auth architecture and /account; setup states are not authenticated success. |
| Mobile bottom nav and More | EXISTS_AND_GOOD | Existing single dock; independent mobile More→Privacy and close test passes. |
| Desktop search and active navigation | EXISTS_AND_GOOD | Existing one-row navbar; search/fill/Escape/focus/reset tests pass at 1024/1440. |
| RGB moving-edge Start Your Project | MISSING | Existing sharp CTA/glow is not the requested travelling conic-gradient masked edge; no implementation now. |
| A — Smart floating contact hub | MISSING | Existing direct contacts and navigation are not one six-action/admin-configurable hub. |
| B — Multistep requirement wizard | MISSING | Existing single quote form and durable quote table; future structured fields need schema compatibility review. |
| C — Guided service matcher | MISSING | Existing service catalogue is not a 1–3-question recommender. |
| D — Solution comparison helper | MISSING | Some comparison article content exists; no guided reusable comparison interface found. |
| E — Central trust/project-readiness center | MISSING | Ownership/process/legal/help material is distributed; do not duplicate content blindly. |
| F — Full case-study management upgrade | EXISTS_NEEDS_POLISH | Most project narrative/SEO/publication fields exist; explicit client consent, screenshot workflow and publish-date parity need verification. |
| G — Blogs/engineering notes/updates management | EXISTS_NEEDS_POLISH | Posts/taxonomy and announcement update types exist; no separate notes resource required unless justified. |
| H — Offers/announcements | EXISTS_NEEDS_POLISH | Existing schedule, active, priority, CTA, placement and popup frequency fields; not all advertised placements have public renderers. |
| I — AI company-support text/voice agent | BACKEND_DEPENDENT | No secure chat/provider/retrieval path found. /ai-methods is a links directory, not AI chat; microphone header denies voice. |
| J — Searchable customer-help hub | MISSING | Service FAQs/articles exist; no central searchable admin-backed help hub found. |
| K — Quick project/callback CTA | EXISTS_NEEDS_POLISH | Project/contact/consultation CTAs already exist; unify hierarchy rather than duplicate. |
| Home Builder public save effect | EXISTS_BUT_BUGGY | Source-confirmed disconnect and silent/non-atomic quick actions; hosted reproduction blocked. |
| Selective depth/reveal-once motion | EXISTS_NEEDS_POLISH | Already implemented; full scroll/mobile CPU/reduced-motion regression remains future scope. |
| Technical SEO and 5,000-query research | EXISTS_NEEDS_POLISH | Existing safeguards and exact corpus; validate current maps in phases 25–27, no mass publishing. |
| New backend / business browser database | NOT_NEEDED | Explicitly prohibited: preserve existing production persistence. |
| Duplicate bottom dock, thousands of SEO pages | NOT_NEEDED | Avoid duplicate nav, doorway pages, hidden keywords and fabricated claims. |

## Complete route-pattern inventory

39 pages and three handlers. Dynamic patterns are not all instantiated here. See [65 fresh anonymous route probes](evidence/phase0-30/browser.json); protected routes may redirect or show setup/session notices despite HTTP 200. No authenticated dashboard is certified.

| Route | Type | Source |
|---|---|---|
| `/about` | page | `website/src/app/(public)/about/page.tsx` |
| `/account` | page | `website/src/app/(public)/account/page.tsx` |
| `/ai-methods` | page | `website/src/app/(public)/ai-methods/page.tsx` |
| `/blog/[slug]` | page | `website/src/app/(public)/blog/[slug]/page.tsx` |
| `/blog` | page | `website/src/app/(public)/blog/page.tsx` |
| `/contact` | page | `website/src/app/(public)/contact/page.tsx` |
| `/disclaimer` | page | `website/src/app/(public)/disclaimer/page.tsx` |
| `/forgot-password` | page | `website/src/app/(public)/forgot-password/page.tsx` |
| `/login` | page | `website/src/app/(public)/login/page.tsx` |
| `/` | page | `website/src/app/(public)/page.tsx` |
| `/privacy` | page | `website/src/app/(public)/privacy/page.tsx` |
| `/projects/[slug]` | page | `website/src/app/(public)/projects/[slug]/page.tsx` |
| `/projects` | page | `website/src/app/(public)/projects/page.tsx` |
| `/request-quote` | page | `website/src/app/(public)/request-quote/page.tsx` |
| `/reset-password` | page | `website/src/app/(public)/reset-password/page.tsx` |
| `/reviews` | page | `website/src/app/(public)/reviews/page.tsx` |
| `/service-agreement` | page | `website/src/app/(public)/service-agreement/page.tsx` |
| `/services/[slug]` | page | `website/src/app/(public)/services/[slug]/page.tsx` |
| `/services` | page | `website/src/app/(public)/services/page.tsx` |
| `/signup` | page | `website/src/app/(public)/signup/page.tsx` |
| `/team` | page | `website/src/app/(public)/team/page.tsx` |
| `/terms` | page | `website/src/app/(public)/terms/page.tsx` |
| `/update-password` | page | `website/src/app/(public)/update-password/page.tsx` |
| `/ajadmin/agreements` | page | `website/src/app/ajadmin/agreements/page.tsx` |
| `/ajadmin/audit` | page | `website/src/app/ajadmin/audit/page.tsx` |
| `/ajadmin/brand` | page | `website/src/app/ajadmin/brand/page.tsx` |
| `/ajadmin/c/[resource]/[id]` | page | `website/src/app/ajadmin/c/[resource]/[id]/page.tsx` |
| `/ajadmin/c/[resource]/new` | page | `website/src/app/ajadmin/c/[resource]/new/page.tsx` |
| `/ajadmin/c/[resource]` | page | `website/src/app/ajadmin/c/[resource]/page.tsx` |
| `/ajadmin/home/[id]` | page | `website/src/app/ajadmin/home/[id]/page.tsx` |
| `/ajadmin/home/new` | page | `website/src/app/ajadmin/home/new/page.tsx` |
| `/ajadmin/home` | page | `website/src/app/ajadmin/home/page.tsx` |
| `/ajadmin/leads/[kind]/[id]` | page | `website/src/app/ajadmin/leads/[kind]/[id]/page.tsx` |
| `/ajadmin/leads` | page | `website/src/app/ajadmin/leads/page.tsx` |
| `/ajadmin/login` | page | `website/src/app/ajadmin/login/page.tsx` |
| `/ajadmin/media` | page | `website/src/app/ajadmin/media/page.tsx` |
| `/ajadmin` | page | `website/src/app/ajadmin/page.tsx` |
| `/ajadmin/users` | page | `website/src/app/ajadmin/users/page.tsx` |
| `/auth/callback` | handler | `website/src/app/auth/callback/route.ts` |
| `/auth/confirm` | handler | `website/src/app/auth/confirm/route.ts` |
| `/blog/rss.xml` | handler | `website/src/app/blog/rss.xml/route.ts` |
| `/design-preview` | page | `website/src/app/design-preview/page.tsx` |

Generated metadata endpoints also include `/robots.txt`, `/sitemap.xml`, `/icon`, `/opengraph-image`; static `/ads.txt` remains. `/offers` and `/updates` have no public page files; existing announcement/offer controls are not permission to add routes. `/portal` and `/profile` have no page files; use `/account`. Source absence is distinct from this turn’s route probes.

## Complete Server Action inventory

All successful writes are BACKEND_DEPENDENT/unverified here. Full form → handler → persistence → reload → public-result audit belongs to Phase 1.

| Module | Actions |
|---|---|
| `website/src/lib/admin/actions.ts` | `upsertResourceAction`, `setResourceStatusAction`, `toggleResourceActiveAction`, `deleteResourceAction`, `restoreResourceAction`, `reorderResourceAction` |
| `website/src/lib/admin/agreement-actions.ts` | `createAgreementAction`, `createAgreementVersionAction`, `activateAgreementVersionAction`, `generateAgreementVersionPdfAction`, `archiveAgreementAction` |
| `website/src/lib/admin/builder-actions.ts` | `toggleSectionVisibilityAction`, `reorderSectionAction`, `setSectionStatusAction`, `saveSectionAction`, `createSectionAction` |
| `website/src/lib/admin/media-actions.ts` | `uploadMediaAction`, `deleteMediaAction` |
| `website/src/lib/admin/settings-actions.ts` | `updateSettingsAction` |
| `website/src/lib/admin/user-actions.ts` | `createUserAction`, `resetUserPasswordAction`, `changeUserRoleAction`, `updateAdminUsernameAction` |
| `website/src/lib/auth/actions.ts` | `signInAction`, `signOutAction` |
| `website/src/lib/leads/actions.ts` | `submitContactAction`, `submitQuoteAction`, `requestAppointmentAction` |
| `website/src/lib/leads/admin-actions.ts` | `updateLeadAction` |
| `website/src/lib/portal/actions.ts` | `clientLoginAction`, `clientSignupAction`, `googleOAuthReadyAction`, `forgotPasswordAction`, `updatePasswordAction`, `updateProfileAction`, `completeProfileAction`, `uploadAvatarAction`, `submitVerifiedReviewAction`, `clientSignOutAction` |
