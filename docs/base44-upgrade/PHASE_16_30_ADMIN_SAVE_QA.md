# Phase 16 (30-phase program) — Admin functional / save QA

Scope: source-level QA of every admin module against list / create / update / save /
status / publish / delete-deactivate / media / reload / public-effect, plus repair of
reproduced root causes that do not need a hosted staff session.

Authenticated acceptance is still BLOCKED: no staff credentials, no configured
Supabase in this workflow. Nothing below claims a hosted save passed.

## Module matrix (source scope)

| Module | List | Create | Update/Save | Status/Publish | Delete / deactivate | Reload / public effect | Notes |
|---|---|---|---|---|---|---|---|
| Generic resources `/ajadmin/c/[resource]` (17 configs) | OK — `listResourceRows` returns `error: true` so a failed read never renders "no rows yet" | OK — schema-validated, unique slug | OK — row existence, trash and publish-capability guards | OK — `setResourceStatusAction` requires `:publish`; editors' `status` is dropped from update payloads | OK — soft delete / hard delete / restore, all verify affected rows | OK — `refreshResource` revalidates admin + public paths and cache tags, and never turns a successful write into a failure | Reorder is two writes with best-effort compensation — still NOT atomic (open risk) |
| Leads `/ajadmin/leads` | OK | n/a | OK via `LeadEditForm` | n/a (stage/status field) | n/a | n/a (private) | — |
| Users `/ajadmin/users` | OK | invite/role actions | OK | n/a | deactivate | n/a | Unconfigured access redirects in proxy (see USERS_REDIRECT_TIMING_FIX) |
| Brand / settings `/ajadmin/brand` | OK | n/a | OK — full allowlisted payload only | n/a | n/a | layout revalidate | Never post a partial settings form |
| Agreements `/ajadmin/agreements` | OK | OK | OK | n/a | n/a | n/a | Exact-version identity gap remains (Phase 14 finding) |
| Home Builder `/ajadmin/home` | OK | OK | OK | visibility | OK | **claims public Home integration that does not exist** | Carried over from the CMS repair plan; not repaired here |
| Media `/ajadmin/media` | **BROKEN → FIXED** | OK (upload + library row, storage rollback on index failure) | n/a (alt text only at upload) | n/a | OK (record first, orphan file logged) | `revalidatePath('/ajadmin/media')` + redirect feedback | Two defects fixed this phase |

## Root causes fixed this phase

1. **P16-01 — media library crashed as soon as it had rows.** The populated branch of
   the async Server Component passed an inline `onClick` (clipboard copy) to a
   `<button>`. React Server Components cannot serialise event handlers, so the whole
   module would fail to render exactly when it holds assets — i.e. never visible in an
   empty sandbox library. Fixed by extracting `components/admin/CopyUrlButton.tsx`
   (`"use client"`), which keeps the same label/styling and adds a short "Copied"
   confirmation. No action, upload, delete or permission logic changed.
2. **P16-02 — media listing hid read failures.** The page destructured only `data`, so
   a failed query rendered "No media uploaded yet" — the same false-empty class of bug
   `listResourceRows` already guards against. The error is now logged server-side and
   the grid area shows an alert explaining the library could not be loaded.

## Still open (not repaired here)

- Reorder remains two non-atomic writes with compensation only.
- Home Builder still describes a public Home integration that is not wired.
- Bespoke module label/filter/table semantics (P15-03–09).
- No authenticated create/save/publish/delete/upload was executed; public effect of a
  save is verified from `refreshResource` source only.
- Agreement version identity, partial-write and action body-limit findings persist.

## Verification performed

- `npm run typecheck`, ESLint on both changed files, full unit suite: 594 tests / 65
  files pass.
- `/` and `/ajadmin/media` return HTTP 200 on the source dev server (anonymous;
  `/ajadmin/media` streams its login redirect).
- No hosted staff session, no screenshot, no fresh production build, no data writes.
