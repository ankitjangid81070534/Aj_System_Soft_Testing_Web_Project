# PHASE 2 — Supabase Setup & First Super Admin Bootstrap

Migrations live in `website/supabase/migrations/` (0001–0008, idempotent, run in order).
No credentials are hardcoded anywhere — you create the first admin yourself, on your
own Supabase project.

## 1. Create the Supabase project

1. Sign in at <https://supabase.com> → **New project**.
2. Choose a name (e.g. `ajs-technology`), a region close to your users, and a strong
   database password. Store that password in a password manager.

## 2. Apply the migrations

**Option A — SQL editor (no tooling needed):**
1. Open the project → **SQL Editor**.
2. Run each file in order: `0001_roles_and_profiles.sql` → `0002_site_config.sql` →
   `0003_services.sql` → `0004_clients_projects.sql` → `0005_team_testimonials.sql` →
   `0006_blog.sql` → `0007_leads_ops_audit.sql` → `0008_storage.sql`.
3. Every file is idempotent — if one partially fails, fix the cause and re-run it.

**Option B — Supabase CLI (when available):**
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

## 3. (Optional, development only) Load the demo seed

`supabase/seed/demo-seed.sql` inserts clearly-marked DEMO rows (services in draft,
a private demo client/project) so you can verify RLS filtering. It contains **no**
fake testimonials or results and must never be treated as real content.

## 4. Verify RLS with the check script

Open `supabase/tests/rls-checks.sql`, replace the `*_USER_UUID` placeholders with the
ids you create in step 5, and run it in the SQL editor. Every SELECT comment states
the expected count; the two statements marked "expect ERROR" must raise an error.
The script runs in one transaction and rolls back — nothing persists.

## 5. Bootstrap the FIRST Super Admin (no hardcoded credentials)

1. **Disable public sign-ups first:** Authentication → Providers → Email → turn off
   "Allow new users to sign up" (project setting; you create staff manually).
2. Authentication → **Users** → **Add user** → enter your real email + a strong
   password → enable *Auto Confirm User*.
3. The `on_auth_user_created` trigger creates the `profiles` row with the default
   role `editor`.
4. Promote yourself to Super Admin — run in the SQL editor (this is a
   JWT-less maintenance session, which the role-guard trigger permits):
   ```sql
   update public.profiles
   set role = 'super_admin'
   where email = 'your-real-email@example.com';
   ```
5. Delete this SQL from the editor history if your workflow keeps history; the
   credential itself never appears in any repository file.

## 6. Configure the website environment

Copy `website/.env.example` → `website/.env.local` and fill in:

| Variable | Source |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your canonical site URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key (**server-only, never commit**) |

Once these exist, `/ajadmin/*` is hard-gated by `src/proxy.ts`: unauthenticated
requests redirect to `/ajadmin/login`.

## 7. Verify the admin gate

- Signed out → visit `/ajadmin` → you must land on `/ajadmin/login`.
- Sign in with the Super Admin account → dashboard shows your email and role.
- Sign out → `/ajadmin` redirects to login again.

## 8. Keep types in sync (recommended)

The repository ships a hand-written `src/types/database.ts` matching these
migrations. When the project is live, regenerate the exact types:

```bash
npx supabase gen types typescript --linked > website/src/types/database.ts
```

Then run `npm run typecheck` in `website/` and reconcile any intentional drift.

## Storage layout (created by 0008)

| Bucket | Public | Max size | Types |
| --- | --- | --- | --- |
| public-site | yes | 10 MB | JPEG/PNG/WebP/AVIF |
| project-media | yes | 50 MB | + MP4 |
| team-media | yes | 10 MB | JPEG/PNG/WebP/AVIF |
| client-media | yes | 10 MB | JPEG/PNG/WebP/AVIF |
| blog-media | yes | 10 MB | + GIF |
| private-media | **no** | 50 MB | + PDF (signed URLs only) |

`public_client_permission = false` clients and confidential projects must use
`private-media` (or stay unpublished). SVG uploads are intentionally disallowed
(stored-XSS risk); use a raster format or a font icon instead.
