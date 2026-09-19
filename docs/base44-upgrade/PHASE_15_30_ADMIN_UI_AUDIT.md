# Phase 15 — Admin UI system audit

Date: 2026-09-19 UTC. Branch: `system-upgrade`. Starting HEAD: `a86640f2b6`.
Authority: current [0–29 master](MASTER_PLAN_30_PHASES.md); owner explicitly requested **“Audit Phase 15”**.

## Outcome and boundaries

**Read-only audit complete; full Phase 15 PARTIAL / implementation and authenticated acceptance pending.** No application, styling, action, schema, configuration, dependency or data changes. No automatic Phase 16, credential request, PR, merge or deployment. Phase 14/13/12/11/9/1 acceptance gates remain unresolved, not passed by this audit.

The existing admin system should be refined, not rebuilt. It already has a desktop sidebar, mobile native drawer, page labels, grouped navigation, shared field/button/status tokens, loading UI, GET search, filtering/pagination, accessible generic table regions, confirmation dialogs, pending states and returned-action feedback. No new UI framework or business persistence is warranted.

## Coverage and existing system

Paths below are relative to `website/src/`.

| Area | Existing implementation / classification | Audit disposition |
|---|---|---|
| Shell / header / sidebar | `components/admin/AdminShell.tsx`, `AdminNav.tsx`, `admin-surface.module.css`; EXISTS_NEEDS_POLISH | Preserve compact workspace, skip link, role label, theme and existing destinations. No global admin search exists; resource search already exists. Cross-module search is a separate product/data scope, not assumed necessary. |
| Generic lists | `ResourceList.tsx`, `app/ajadmin/c/[resource]/page.tsx`; EXISTS_AND_GOOD at source scope | GET search retains status/trash; pagination and error-versus-empty distinction exist. Named, keyboard-focusable table region and contextual row action labels should be reused. |
| Generic editors | `ResourceForm.tsx`, `lib/admin/resources.ts`; EXISTS_NEEDS_POLISH | Seventeen existing configured resources, shared validation metadata and server actions. Source identifies recovery/requiredness/preview limitations below. |
| Settings / lead edits | `BrandSettingsForm.tsx`, `LeadEditForm.tsx`; EXISTS_NEEDS_POLISH | Shared pending/feedback exists; uncontrolled error recovery and dirty-state behavior need a bounded review. Keep complete settings payload. |
| Quick / destructive actions | `AdminActionForm.tsx`, `ConfirmButton.tsx`; EXISTS_AND_GOOD at source scope | Keep returned outcomes, disabled pending fieldset, confirmation and framework redirect handling. Do not rewrite into optimistic success. |
| Home Builder | `app/ajadmin/home/page.tsx`, `lib/admin/builder-actions.ts`; EXISTS_BUT_BUGGY / BACKEND_DEPENDENT | Existing feedback, public-effect and ordering gaps remain; no activation or save repair authorized. |
| Leads / audit / users / agreements | Corresponding `app/ajadmin/*/page.tsx`; EXISTS_NEEDS_POLISH | Shared patterns have not been applied consistently; labels, filter semantics and table access need refinement. Private populated layouts not available here. |
| Media | `app/ajadmin/media/page.tsx`; EXISTS_BUT_BUGGY / BACKEND_DEPENDENT | Client clipboard interaction is placed in an async Server Component; content-type preview and truthful loading states need follow-up. |
| Loading / errors / empty | `app/ajadmin/loading.tsx`, generic list, bespoke pages | Generic list distinguishes failures; several bespoke readers collapse them into empty results. A loading spinner is not proof of accessible/error-complete workflows. |

Resource inventory: services, clients, projects, team, testimonials, posts, categories, tags, navigation, payments, SEO, redirects, offers, announcements, benefits, AI Methods and socials. This is UI/source coverage, not an authenticated CRUD pass for these modules. Builder create/edit internals and every server mutation are not exhaustively re-audited; retain earlier functional reports.

## Findings and priorities

### P15-01 — Exact module routes lack active navigation (medium, reproduced isolated render)

`AdminNav` marks Dashboard by equality, but other items only with `pathname.startsWith(href + "/")`. Thus `/ajadmin/c/services` and `/ajadmin/leads` have **zero** `aria-current="page"` markers; their child routes have one. `adminPageLabel` already handles equality, so the header and sidebar disagree.

Fresh isolated rendering of the actual component, with only pathname and class-merging imports substituted, confirmed:

| Route | Current markers | Header |
|---|---:|---|
| `/ajadmin` | 1 | Dashboard |
| `/ajadmin/c/services` | 0 | Services |
| `/ajadmin/c/services/new` | 1 | Services — New |
| `/ajadmin/leads` | 0 | Leads |
| `/ajadmin/leads/quotes/example` | 1 | Leads — Details |

Existing `admin-ui.test.ts` uses only a nested pathname for its active-navigation assertion; label tests alone do not cover this defect. Proposed fix: exact-or-descendant matching with a segment boundary, preserving Dashboard exactness and avoiding prefix collisions. No fix applied.

### P15-02 — Drawer accessible name / breakpoint cleanup (medium, source)

`components/ui/Drawer.tsx` renders an H2 but no dialog `aria-label`/`aria-labelledby`. `AdminShell` hides the drawer with `lg:hidden` without clearing `open` when crossing to desktop. An open native modal can retain modal state while CSS hides its surface; breakpoint focus/inert behavior needs a real browser reproduction before repair. There is no explicit opener focus handoff for a now-hidden mobile trigger. These are source findings, not an authenticated browser failure. Check other Drawer consumers before a shared change.

### P15-03 — Admin form error retention and pending feedback (high draft-loss risk, source)

Resource, BrandSettings and LeadEdit forms use uncontrolled defaults and action state without a resolved-error reset guard. React's resolved-action reset can discard edited answers even for `{ok:false}`. Auth/lead repairs from prior phases do not cover these admin forms. `ResourceForm` additionally calls native reset after success; freshness of the saved baseline needs actual save/revalidation/reload evidence. Existing feedback remains rendered while pending, unlike the recent auth slice.

Resource/settings dirty protection covers `beforeunload`, not ordinary client-side navigation; LeadEdit has no dirty guard. Do not claim universal unsaved-change protection. A future focused admin-only recovery helper may be justified, but blindly reusing auth password policy or changing successful save baselines would be unsafe. Preserve actions, field names, submit payloads and real-success semantics.

### P15-04 — Required indicators are not native validation (medium, source)

`ResourceForm` passes `required` to `Field` (an aria-hidden visual star), not to `FieldControl` inputs/selects/textareas. Server validation remains authoritative, so this is UX/accessibility parity, not a server-validation bypass. **Do not indiscriminately forward all required flags:** the schema explicitly permits blank slugs for automatic server generation, despite their configured star. Inventory actual schema semantics before adding native requirements. Error IDs exist; optional hints are not consistently linked by `aria-describedby`.

### P15-05 — Bespoke admin accessibility patterns diverge (medium, source)

- Leads uses links with `role="tab"` inside a tablist without a corresponding tab-panel/keyboard model, and `aria-pressed` on status links. Audit also uses `aria-pressed` on ordinary links. Prefer normal navigation/filter semantics for GET routes rather than introducing a client tab widget.
- Users' create-role select and Agreements' agreement-type select lack explicit accessible labels; several other inputs rely on placeholders rather than persistent labels. Preserve field names and validation while adding labels.
- Users, audit and agreement tables have plain overflow wrappers, unlike `AdminTableRegion`. Leads hides Status below `sm` and Received below `md`; long names/emails and available detail access need populated narrow-screen review. Do not assert clipping from source alone.

### P15-06 — False-empty and silent-result paths (high trust risk, source; functional gate)

Builder, media, users, agreements and audit destructure data without surfacing query errors. `lib/data/admin-leads.ts:listLeads` returns empty rows/counts on errors/catches and only searches its most recent 200-row result. Counts reflect that filtered/capped dataset, not proven global totals. Generic list already provides a useful error-state reference.

Builder quick visibility/reorder/status actions can return silently; reorder uses two writes. Presenting reliable outcomes requires a separately reviewed action-result/read contract, not just a toast. UI feedback cannot make the reorder atomic. Carry this to the later functional/save QA scope; do not start Phase 16 now.

### P15-07 — Builder describes a public effect it does not drive (high trust risk, reconfirmed source)

Builder tells staff published/visible sections drive Home and adding a section overrides built-in content. The public `app/(public)/page.tsx` still loads `getHomeContent`, settings and benefits and renders fixed `HomeExperience`; it does not consume `getHomeSections`. Preserve approved Home composition. Correcting explanatory copy is separable from activating Builder; do not wire legacy defaults to make the copy true.

### P15-08 — Populated media branch crosses server/client boundary (high runtime risk, source)

The async media page has no client boundary but renders a native button with `onClick={() => navigator.clipboard?.writeText(url)}` for public assets. This is incompatible with a Server Component event-handler boundary and can fail only when that populated branch renders; the unconfigured build/anonymous route cannot exercise it. It also lacks copy-success/failure feedback. A small dedicated client Copy URL control is the likely bounded repair, not converting the whole authenticated server page to client code. Verify against the installed framework guidance and real populated data before acceptance. Public PDF/MP4 assets are also rendered with `<img>` rather than media-kind-specific previews. No populated failure was reproduced and no fix was made.

### P15-09 — Publication / preview affordances are incomplete (medium, source)

Generic Preview exists only for a published record with slug and `publicBase`, not a private draft preview. Offers/announcements have status fields but no `supports.publish`, so generic Published/Drafts filter controls are absent. Navigation and some quick controls are not tailored to the viewer's capabilities, even though server/page authorization exists. These are affordance gaps, not proof of an authorization bypass. Preserve server enforcement and prior editor status-omission protections; no draft exposure or permission change for visual convenience.

## Recommended first implementation slice — proposal only

**Navigation and accessibility correctness**, retaining the current design:

1. Fix exact/descendant active matching and add index/nested/prefix-collision tests.
2. Name the admin drawer and review mobile-to-desktop modal close/focus behavior with a reproducible browser case.
3. Normalize GET filter semantics, persistent labels and existing table-region reuse where contracts are unchanged.

Then separately scope admin non-sensitive error recovery and the client-only clipboard control. Read-error propagation, Builder outcomes/atomicity, upload transport limits, permission/publication semantics and true persisted-success baselines need their own reviewed functional slice. Do not combine these into a speculative shared-form rewrite.

No new global search, redesign, dependency, schema, browser draft database, local business backend, fake media/records or credential substitutes. Existing branded tokens/components remain the starting point.

## Acceptance contract for future work

| Scenario | Required evidence |
|---|---|
| Sidebar index/detail/new routes | Actual rendered current marker and contextual heading; prefix-collision regression |
| Mobile drawer | Open/close/Escape/backdrop, focus return, resize across 1024px, no residual inert background; keyboard, reduced motion, no-JS fallback decision |
| Search/filter/pagination | Real GET gestures, URL/visible records/back-reload continuity; no unintended POST |
| Tables / fields | 390/662/1440 light/dark plus long real content, keyboard scroll, persistent labels and error association; genuine staff session for private views |
| Failed form save | Approved failure scenario retains edits and focuses feedback, repeated retry/pending behavior; never spoof returned success |
| Successful save | Form → existing action → stored record → reload → public effect where applicable; a toast alone is insufficient |
| Media copy / preview | Populated authorized render, successful/rejected clipboard permission, image/PDF/video/private handling without exposing private URLs |
| Permissions | Editor/admin/super-admin role-appropriate affordances and unchanged server denial behavior; no bypass for testing |

## Fresh verification and limits

- Existing source-mounted development container healthy on port 3000; no restart/configuration changes. Twelve anonymous external-Host HTTP probes returned 200 with Next source chunks: Home, admin root/login, services list/new, Builder, brand, leads, media, users, agreements, audit. Five include streamed login redirects; **HTTP 200 is not authenticated success**.
- All six optional integration values absent in managed file and running process (names/presence only checked). Prior credential deferral stands; no secret requested/generated.
- **578 tests / 64 files PASS; typecheck PASS; lint PASS.** These are unchanged-source regressions, not authenticated admin acceptance. No fresh production build.
- Five isolated actual AdminNav renders confirm P15-01; no staff session or write involved.
- Independent Chromium: staff configuration notice and absence of private navigation/password input at **390, 662, 1440**; no page errors in those cases. `/ajadmin/users` settles at `/ajadmin/login`. Four read-only cases pass, not populated layouts, screenshots or admin gestures.
- Initial browser harness incorrectly expected “Staff login”; corrected using source's “Staff Administration”. Initial process-presence command had an extra parenthesis, corrected without printing values. Neither is an app regression/fix.
- Live iframe route helper changed URL without rendering, leaving Home behind `/ajadmin/login`. Existing staff-link recovery found no matching link; subsequent Home click performed but immediate URL remained mismatched. **No live admin interaction or recovery pass claimed.** No open dialogs were observed. Do not restart healthy services or change auth/router to work around this tool result.
- Temporary evidence: container `/tmp/phase15-admin-audit-{tests,types,lint}.log`, `...-nav.json`, initial `...-browser.json`, final `...-browser-final.json`; host `/tmp/phase15-admin-audit-http.json`. Core findings/results are durable in this report; temporary artifacts are not guaranteed across sandbox recreation.
- No screenshots, visual sign-off, native-device/screen-reader/zoom, authenticated actions, uploads, actual saved reload, field performance or deployment acceptance.

## Stop gate

**STOP after audit.** Next work requires approval of a bounded Phase 15 implementation or acceptance scope. Do not repeat this audit or declined credentials, declare the full phase complete, or automatically begin Phase 16. Base44 app remains **not published**.
