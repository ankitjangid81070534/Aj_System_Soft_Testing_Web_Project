# AJ System Soft Technology (AJS Technology) — Company Website

Official repository for the company website of **AJ System Soft Technology**
(short brand: **AJS Technology**) — *"Software built around your requirements."*

## Repository layout

| Path | What it is |
| --- | --- |
| `website/` | The Next.js 16 application (deploy this folder) |
| `website/README.md` | Full setup, scripts and **deployment guide** (Vercel / Netlify / Cloudflare) |
| `website/supabase/migrations/` | Ordered, idempotent SQL migrations (0001–0010) |
| `docs/` | Phase-by-phase architecture, setup, audit and launch reports |

## Quick start

```bash
cd website
npm install
cp .env.example .env.local   # fill in real values (never commit them)
npm run dev
```

Full instructions: [`website/README.md`](website/README.md) ·
Deployment: [`website/README.md#deployment-guide`](website/README.md) ·
Supabase setup: [`docs/PHASE-2-SUPABASE-SETUP.md`](docs/PHASE-2-SUPABASE-SETUP.md) ·
Post-launch SEO: [`docs/PHASE-11-SEARCH-CONSOLE.md`](docs/PHASE-11-SEARCH-CONSOLE.md) ·
**Maintenance & customization: [`docs/MAINTENANCE.md`](docs/MAINTENANCE.md)**

## Rules this project follows

- Real content only — no invented clients, ratings, testimonials or results.
- The Supabase service-role key is server-only and never ships to the browser.
- Public data is protected by Supabase RLS: anonymous reads see only published + active + public records.
- `/ajadmin` is protected by real authentication (edge gate + server-side role checks + RLS), never by obscurity.
# Aj_System_Soft_Testing_Web_Project
