# Base44 Dev Environment

## What this is
A Next.js 16 (App Router, Turbopack) company website for AJ System Soft Technology.
The app lives in `website/`. It uses **Supabase** (Postgres + Auth + Storage) as its
backend, but is designed to **boot and render public pages with fallback content**
when Supabase is not configured — the env parser returns `null` and data layers fall
back to real capability copy (no invented facts).

## Running it
```bash
docker compose -f docker-compose.base44.yml up -d
```
- Web entry point: **host port 3000** (mapped to Next.js dev server).
- The compose uses `node:22-bookworm-slim`, bind-mounts `website/` at `/app`, and runs
  `npm install && npm run dev` with Turbopack. Edits hot-reload live.
- `node_modules` lives in a named volume (`web_node_modules`) to avoid host conflicts.

## Supabase credentials (external service)
The app degrades gracefully without them, so they are **not required to boot**.
For full functionality (database content, auth, admin CMS, lead capture), provide:
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, paired)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, admin CMS)
- `RESEND_API_KEY` / `EMAIL_FROM` / `EMAIL_ADMIN_TO` (optional, transactional email)

Migrations live in `website/supabase/migrations/` (0001–0016), applied in numeric order
to a Supabase project. Apply them in the Supabase SQL editor or via `supabase db push`.

## Preview origin
Next.js `allowedDevOrigins` is derived from `BASE44_PUBLIC_HOST_SUFFIX` in
`website/next.config.ts` so the preview proxy can access dev assets and HMR.

## Key files
- `website/src/lib/env.ts` — public env parsing (returns null when Supabase unset)
- `website/src/lib/env.server.ts` — server-only service-role key
- `website/src/proxy.ts` — edge middleware (admin auth gate, SEO redirects)
- `website/src/lib/data/*-fallback.ts` — fallback content used without Supabase

## Verify
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` → 200 with real HTML
- Dev assets under `/_next/static/chunks/...` → 200 to the external host
- `/ajadmin` renders a setup notice (Supabase not configured) rather than crashing
