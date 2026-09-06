# Client Portal and Admin Authentication Upgrade

This guide covers additive migrations `0011` and `0012`. The upgrade preserves existing users,
content, leads, projects, Supabase storage, GitHub and Vercel connections.

## What changed

- New public accounts receive the non-staff `client` role. Existing staff roles are unchanged.
- `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback` and `/account`
  provide the client authentication and account flow.
- Authenticated enquiries are linked to the signed-in user and shown in their request history.
- Project and document access is available only when an administrator links the Auth user UUID to
  a real `clients` record and leaves `portal_enabled` on.
- Review submission requires that verified client link. Client reviews are always created as
  private drafts and require admin moderation before publication.
- `/ajadmin` accepts a private username mapping. Password verification and sessions remain in
  Supabase Auth; passwords are never copied into a public table.

## Safe production order

1. Take the normal Supabase backup or snapshot.
2. Apply `website/supabase/migrations/0011_client_portal_and_reviews.sql`.
3. Apply `website/supabase/migrations/0012_portal_auth_and_admin_security.sql`.
4. Confirm the Vercel project still has the existing Supabase public URL, anon key and server-only
   service-role key.
5. In Supabase Authentication → URL Configuration, use the live canonical host as the Site URL and
   allow `https://www.ajsystemsoft.in/auth/callback`. The apex domain currently redirects to `www`,
   so `NEXT_PUBLIC_SITE_URL` should also be `https://www.ajsystemsoft.in`. Add a matching Vercel
   preview callback only when preview authentication is intentionally required.
6. Enable email confirmation. Configure the Google provider in Supabase only if Google sign-in is
   wanted; its client secret belongs in Supabase, never in this repository.
7. Redeploy through the existing GitHub/Vercel connection.

The registration action fails closed until migration `0012` is visible, preventing the legacy
staff-role default from being assigned during a partial deploy.

## Create or update a staff username

1. Create/invite the staff account in Supabase Authentication and set its password there.
2. Promote its `profiles.role` deliberately to `editor`, `admin` or `super_admin` using the existing
   bootstrap process.
3. In `/ajadmin/users`, save a unique lowercase staff username; or run the reviewed template at
   `website/supabase/seed/admin-username-template.sql` after replacing both placeholders.
4. Test `/ajadmin/login` with username and password. Staff email remains a controlled bootstrap
   fallback, but the visible production form requests only a username.

## Link a verified client

1. Confirm the person’s identity and real project/client relationship outside the portal.
2. Copy their Supabase Authentication user UUID.
3. Open `/ajadmin/c/clients`, edit the correct real client, paste the UUID into **Portal Auth user
   UUID**, and enable **Client portal enabled**.
4. The account can then see linked private projects/documents and submit a verified review.

Never link a random signup merely because the email resembles a client address.

## Rollback notes

Application rollback is safe because the migration is additive. If an older deployment runs after
the migration, the new columns and tables remain unused. Avoid dropping the new schema in a live
system. To suspend the feature without deleting data, turn off portal links in navigation, disable
`portal_enabled` for affected clients, and set `admin_usernames.is_active = false` as needed.
