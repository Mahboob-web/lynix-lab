# Deploying to Hostinger

## 1. Does your plan fit?

This project uses dynamic Next.js features: API routes, Server Actions, middleware, server rendering for the CRM, and a database. Hostinger hosting splits like this (checked against Hostinger's docs, October 2026):

| Hostinger plan | Runs this Next.js app? | PostgreSQL on the plan? | Verdict |
|---|---|---|---|
| Single / Premium Web Hosting | No Node.js apps | No | ❌ Upgrade |
| **Business Web Hosting** | ✅ Node.js "Web Apps" (Next.js in server mode) | ❌ MySQL only | ✅ with an **external PostgreSQL** (this guide) |
| **Cloud Startup / Professional / Enterprise** | ✅ Node.js Web Apps | ❌ MySQL only | ✅ with an **external PostgreSQL** (this guide) |
| **VPS (KVM 1, 2…)** | ✅ (you manage Node, PM2/Docker, Nginx) | ✅ install it yourself or one-click Docker template | ✅ everything on one server (section 8) |

**This guide covers the chosen setup:** Next.js on a Hostinger **Business or Cloud** plan, with PostgreSQL hosted by a managed provider.

Hostinger facts this setup relies on:

- Node.js versions 18, 20, 22 (default) and 24 are available. **Use 22 LTS.** This project requires Node 20.9 or later.
- For the `next` application type Hostinger runs `npm install` (15-minute limit), runs the `build` script, applies `output: "standalone"`, and starts the standalone server. You don't set an entry file.
- `next.config.ts` must export a **plain object** (it does).
- Environment variables are injected at **build and run time**. `NEXT_PUBLIC_*` values must be set before the build.
- Apps **stop when idle and restart on the next request.** The first visit after a quiet period is slower (cold start). The rate limiter and sessions are stored in PostgreSQL, so restarts lose nothing.
- Hostinger doesn't run database migrations for you. You run them from your computer or CI (section 5).

## 2. Create the PostgreSQL database

Any managed PostgreSQL 14 or later works. Two good options with free tiers:

**Neon** (neon.tech)
1. Create a project in the region closest to your Hostinger data centre (for example *AWS Europe (Frankfurt)* for EU/PK traffic, or *Asia Pacific (Singapore)*).
2. From **Connection details**, copy:
   - the **pooled** connection string (host contains `-pooler`) → `DATABASE_URL`
   - the **direct** connection string → `DIRECT_URL`
3. Keep `?sslmode=require` on both.

**Supabase** (supabase.com)
1. Create a project in the nearest region and set a strong database password.
2. **Connect → ORMs / Connection string:**
   - **Session pooler** (port 5432) URI → `DATABASE_URL`
   - **Direct connection** URI → `DIRECT_URL` (if your network has no IPv6, use the session pooler URI for both)
3. Add `?sslmode=require`.

> Use a database user that owns only this database. Don't reuse superuser credentials anywhere else.

Keep `DATABASE_POOL_MAX` small (5 is the default). Hostinger runs one modest Node process, and free database tiers cap connections.

## 3. Environment variables

Set these in **hPanel → Websites → your site → Environment variables** (or **Import .env** during onboarding). Values are stored encrypted, and saving them triggers a redeploy.

| Variable | Required | Example / notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://www.yourdomain.com` (no trailing slash). Set before the first build. |
| `DATABASE_URL` | ✅ | Pooled Postgres URL with `sslmode=require` |
| `DIRECT_URL` | ✅ | Direct Postgres URL (used by migrations; can equal `DATABASE_URL`) |
| `AUTH_SECRET` | ✅ | `openssl rand -base64 48`. At least 32 characters; the CRM refuses to run without it in production. |
| `DATABASE_POOL_MAX` | optional | `5` |
| `TRUST_PROXY` / `TRUSTED_PROXY_HOPS` | optional | `true` / `1` (defaults, correct for Hostinger) |
| `LEAD_WEBHOOK_URL` | optional | n8n/Make/Zapier webhook to notify on new leads |

`ADMIN_EMAIL` / `ADMIN_PASSWORD` are **not** needed on Hostinger. They're only used by the seed script you run once from your computer.

Never commit `.env`. The repository's `.gitignore` already excludes it.

## 4. Deploy the app

### Option A: from GitHub (recommended)

1. Push this project to a **private** GitHub repository (commit `prisma/migrations/`).
2. hPanel → **Websites → Add website → Node.js Web App** (Hostinger may call it *Web App*).
3. Choose **Import Git repository**, authorise GitHub, pick the repo and the `main` branch.
4. Build settings:
   - **Application type / framework:** `Next.js` (`next`), usually auto-detected
   - **Node.js version:** `22`
   - **Root directory:** `/`
   - **Build script:** `build` (runs `prisma generate && next build`)
   - **Output directory:** `.next`
   - **Package manager:** `npm` (detected from `package-lock.json`)
5. Add the environment variables from section 3.
6. Deploy. Each push to the branch triggers a new deployment.

### Option B: upload an archive

Zip the project **without** `node_modules`, `.next` and `.env`, then upload it in the Node.js Web App wizard with the same settings. Hostinger installs dependencies and builds it.

### Domain and HTTPS

Connect your domain in hPanel and make sure the free SSL certificate is active. The app sends HSTS and `upgrade-insecure-requests` in production, so serve it **only** over HTTPS.

## 5. Run migrations and create the first admin

Run these from your own computer (or CI) against the **production** database:

```bash
# In the project folder, with production values in a local, uncommitted file:
cp .env.example .env.production.local     # fill DATABASE_URL, DIRECT_URL, ADMIN_EMAIL, ADMIN_PASSWORD

DOTENV_CONFIG_PATH=.env.production.local npm run db:deploy   # create/upgrade tables
DOTENV_CONFIG_PATH=.env.production.local npm run db:seed     # default pipeline + first admin
```

(`prisma.config.ts` and the seed script load env files through `dotenv`, which honours `DOTENV_CONFIG_PATH`.) On Windows PowerShell, or if you prefer, export the variables in your shell instead:

```bash
export DATABASE_URL="…" DIRECT_URL="…" ADMIN_EMAIL="you@yourdomain.com" ADMIN_PASSWORD="a-long-unique-password"
npm run db:deploy && npm run db:seed
unset ADMIN_PASSWORD
```

Then sign in at `https://yourdomain.com/crm/login`, open **Team**, and invite your colleagues.

**For every release that changes `prisma/schema.prisma`:**
1. Locally: `npm run db:migrate -- --name describe_change` (creates a migration file) → commit it.
2. Run `npm run db:deploy` against production **before or together with** the push that deploys the new code. Migrations generated by Prisma are additive by default; review any that drop or rename columns.

The included GitHub Actions workflow (`.github/workflows/ci.yml`) has a manual **"Run production migrations"** job. Add `PROD_DIRECT_URL` as a repository secret and trigger it from the Actions tab.

## 6. Verify the deployment

| Check | Expected |
|---|---|
| `https://yourdomain.com/` | Home page loads; view source shows your domain in `<link rel="canonical">` |
| `https://yourdomain.com/api/health` | `{"status":"ok","database":"ok"}` |
| Send the contact form | Success message; the lead appears in **CRM → Leads** |
| `https://yourdomain.com/crm` while signed out | Redirects to `/crm/login` |
| Sign in | Dashboard loads; **Audit log** shows `auth.login` |
| Response headers (`curl -I`) | `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY` |
| `https://yourdomain.com/sitemap.xml` | Lists all pages with your domain |

Point an uptime monitor (UptimeRobot, Better Stack) at `/api/health`. This also keeps the app from idling.

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails at `prisma generate` | Check the Node version is 20 or later. `prisma` is a regular dependency, so it is installed even if dev dependencies are skipped. |
| "Next.js build produced no standalone server" | `next.config.ts` must export an object, not a function |
| `/api/health` shows `database: unreachable` | Wrong `DATABASE_URL`, missing `sslmode=require`, or the provider restricts IPs. Allow all IPs or Hostinger's outbound IP. |
| `/api/health` shows `not_configured` | `DATABASE_URL` isn't set. Add it and save (this redeploys). |
| Contact form says "temporarily unavailable" | Same as above |
| CRM shows a server error after deploy | Migrations not applied: run `npm run db:deploy` |
| Everyone was signed out | `AUTH_SECRET` changed. That's expected; keep it stable. |
| Canonical/OG URLs show `localhost` | `NEXT_PUBLIC_SITE_URL` wasn't set before the build. Set it, then redeploy. |
| "Too many connections" | Lower `DATABASE_POOL_MAX`, or use the pooled URL for `DATABASE_URL` |

## 8. Alternative: Hostinger VPS (everything on one server)

Choose a VPS if you want PostgreSQL on the same machine, background jobs (scheduled follow-up reminders, AI agents), WebSockets, or no cold starts. KVM 2 (2 vCPU / 8 GB) is comfortable for the site, CRM and Postgres.

```bash
# Ubuntu 24.04 VPS, as a sudo user
sudo apt update && sudo apt install -y nginx postgresql ufw
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
sudo npm i -g pm2

# Database
sudo -u postgres psql -c "CREATE USER lynix WITH PASSWORD 'change-me-long-random';"
sudo -u postgres psql -c "CREATE DATABASE lynix OWNER lynix;"

# App
git clone <your-private-repo> /srv/lynix && cd /srv/lynix
cp .env.example .env    # DATABASE_URL/DIRECT_URL=postgresql://lynix:…@localhost:5432/lynix, AUTH_SECRET, NEXT_PUBLIC_SITE_URL, ADMIN_*
npm ci && npm run db:deploy && npm run db:seed && npm run build
cp -r .next/static .next/standalone/.next/ && [ -d public ] && cp -r public .next/standalone/ || true
pm2 start .next/standalone/server.js --name lynix --env production -- -p 3000 && pm2 save && pm2 startup

# Nginx reverse proxy → 127.0.0.1:3000, then HTTPS
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```

Nginx `server` block essentials: `proxy_pass http://127.0.0.1:3000;` plus `proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme;`. Keep PostgreSQL bound to localhost, and add daily `pg_dump` backups copied off the server.
