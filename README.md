# SSS Food World — Storefront (Vercel + Supabase)

Customer storefront. Full-stack Vercel deployment:
- Frontend: React 18 + esbuild, built to `/public`, served as static
- Backend: Fastify wrapped in a Vercel serverless function (`/api/[...path].mjs`)
- Database: Supabase Postgres (pooled + direct)
- Prisma ORM

## Deploy on Vercel

1. In Vercel "New Project", set:
   - **Application Preset** → `Other` (NOT Next.js — we have our own `vercel.json`)
   - **Build Command** → leave default (`npm run build`)
   - **Output Directory** → `public`
   - **Install Command** → default
2. Add the env vars below (Settings → Environment Variables)
3. Click **Deploy**

### Required env vars

| Var | Value |
|---|---|
| `DATABASE_URL` | Supabase **Transaction Pooler** URI (port `6543`), with `?pgbouncer=true&connection_limit=1` suffix |
| `DIRECT_URL` | Supabase **Direct connection** URI (port `5432`) — for Prisma migrations |
| `JWT_SECRET` | 32+ char random string. Generate: `openssl rand -hex 32` |
| `ADMIN_EMAIL` | (optional) Seeded admin email. Default `admin@artisangroc.com` |
| `ADMIN_PASSWORD` | (optional) Seeded admin password. Default `Admin@123` |

### Where to find Supabase strings

Supabase Dashboard → **Project Settings → Database → Connection string**:
- **Transaction pooler** (port 6543) → `DATABASE_URL` (append `?pgbouncer=true&connection_limit=1`)
- **Direct connection** (port 5432) → `DIRECT_URL`

Replace `[YOUR-PASSWORD]` in both with your Supabase DB password.

## What happens on Vercel build

`npm run build` runs:
1. `prisma generate` (generates the Prisma client)
2. `prisma db push` (syncs schema to Supabase — creates tables)
3. `node prisma/seed.mjs` (seeds admin + sample categories/products — idempotent)
4. Builds frontend with esbuild into `web/dist`
5. Copies into `/public` (dropping `admin.html` since this repo only serves the storefront)

API calls hit `/api/[...path].mjs` which boots Fastify on cold start and reuses it.

## Local development

```bash
# Run the full Docker stack (Postgres + Redis + Fastify + Nginx)
docker compose up --build
# Storefront → http://localhost:8080/
```

## Layout

```
shopfront/
├── api/
│   └── [...path].mjs       # Vercel serverless function wrapping Fastify
├── server/
│   └── src/routes/         # auth, products, categories, orders, settings
├── prisma/
│   ├── schema.prisma
│   └── seed.mjs
├── web/                    # React frontend (esbuild)
│   ├── src/js/
│   ├── src/styles/
│   ├── src/assets/
│   └── build.mjs
├── vercel.json
├── package.json
└── docker-compose.yml      # local-only
```
