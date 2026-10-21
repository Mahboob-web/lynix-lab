# Lynix Lab: agency website and CRM

The marketing website and internal CRM for **Lynix Lab**, a digital, technology and AI agency (*Build. Automate. Create.*).

- **Public site:** Home, Services (15 service pages), Work/portfolio (with case-study pages), Pricing, About, Contact and Privacy Policy
- **CRM** (`/crm`): leads, contacts, companies, sales pipeline and deals, tasks and follow-ups, activity timeline, dashboard reports, team management with role-based permissions, and an audit log
- **Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Prisma 7 + PostgreSQL, zod

| Doc | What's in it |
|---|---|
| [docs/DEPLOYMENT-HOSTINGER.md](docs/DEPLOYMENT-HOSTINGER.md) | Hostinger requirements, database setup, environment variables, migrations, step-by-step deploy, VPS alternative |
| [docs/SECURITY.md](docs/SECURITY.md) | Auth, sessions, RBAC, rate limiting, audit log, headers, data isolation |
| [docs/CRM.md](docs/CRM.md) | CRM data model, permissions matrix, what's built and the roadmap |

---

## Quick start (local)

**Requirements:** Node.js 20.9 or later (22 LTS recommended), npm 10, and PostgreSQL 14 or later (local, Docker or a free Neon/Supabase database).

```bash
# 1. Install dependencies (also runs `prisma generate`)
npm install

# 2. Configure environment
cp .env.example .env
#    then edit .env: DATABASE_URL, DIRECT_URL, AUTH_SECRET (openssl rand -base64 48),
#    NEXT_PUBLIC_SITE_URL=http://localhost:3000, ADMIN_EMAIL, ADMIN_PASSWORD

# 3. Create the database tables
npm run db:deploy          # applies prisma/migrations

# 4. Create the default sales pipeline + your first admin user
npm run db:seed            # add `-- --demo` for a few clearly-labelled demo records

# 5. Run
npm run dev                # http://localhost:3000   CRM: http://localhost:3000/crm
```

Need a local Postgres fast?
`docker run -d --name lynix-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=lynix -p 5432:5432 postgres:16`
→ `DATABASE_URL="postgresql://postgres:dev@localhost:5432/lynix"`

The public website works without a database. Only the contact form and the CRM need it, and they show a clear message if it isn't configured.

## Deploying on Vercel with Supabase

1. **Database:** the Supabase project's schema comes from `prisma/migrations` (`npm run db:deploy`), and `npm run db:seed` creates the pipeline and first admin.
2. **Connect it to Vercel:** in Supabase go to Project Settings → Integrations → Vercel and connect the `lynix-lab` Vercel project. That sets `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`, which the app reads as fallbacks for `DATABASE_URL` / `DIRECT_URL`. Alternatively set `DATABASE_URL` (Transaction pooler, port 6543) and `DIRECT_URL` (Session pooler, port 5432) yourself. Vercel can't use Supabase's direct host because it is IPv6-only.
3. **Also set** `AUTH_SECRET` (`openssl rand -base64 48`), `NEXT_PUBLIC_SITE_URL` and `DATABASE_POOL_MAX=1` (serverless functions each hold their own pool).
4. **Redeploy**, then check that `/api/health` returns `"database":"ok"`.

`sslmode=require` URLs get libpq semantics (`uselibpqcompat=true`): the connection is encrypted but the certificate is not verified. For full verification, use `sslmode=verify-full&sslrootcert=…` with Supabase's CA certificate.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | `prisma generate` + production build (standalone output) |
| `npm start` | Start the production server (`next start`) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks |
| `npm run db:migrate` | Create a new migration after editing `prisma/schema.prisma` (development) |
| `npm run db:deploy` | Apply pending migrations (production, CI) |
| `npm run db:seed` | Default pipeline + first admin from `ADMIN_*` env vars (safe to re-run) |
| `npm run db:studio` | Browse the database in Prisma Studio |

## Editing content

**All website content is in [`src/config/site.ts`](src/config/site.ts):** agency name, tagline, brand colours, contact details, navigation, the 15 services, the process, pricing plans and FAQ, testimonials, portfolio projects, social links and the privacy policy. Types live in `src/types/site.ts`.

Before launch, search `site.ts` for **`TODO`** and replace:

- [ ] `contact.email`, `contact.phone`, `contact.whatsapp`
- [ ] `social` links (empty links are hidden)
- [ ] `testimonials`: replace with real, approved quotes and set `placeholder: false` (sample quotes show a "Sample" tag)
- [ ] `portfolio`: replace with real case studies and set `sample: false` (add `image: "/portfolio/x.jpg"` to use a photo; images go in `public/`)
- [ ] `pricing`: confirm prices and currency
- [ ] `legalName` and `privacy`: have the privacy policy reviewed for your jurisdiction
- [ ] `NEXT_PUBLIC_SITE_URL` set to the live domain

Changing `brand.colors` re-themes the whole site (colours are injected as CSS variables).

## Project structure

```
prisma/
  schema.prisma          CRM data model
  migrations/            SQL migrations (commit these)
  seed.ts                default pipeline + first admin
prisma.config.ts         Prisma 7 config (datasource URLs from env)
src/
  config/site.ts         ← all editable website content
  types/site.ts          content types
  app/
    (site)/              public pages (shared header/footer layout)
    crm/login            sign-in
    crm/(app)/           authenticated CRM pages
    api/contact          contact form endpoint → creates CRM leads
    api/health           uptime check
    sitemap.ts robots.ts opengraph-image.tsx icon.svg
  components/
    brand/               logo mark, generated project covers
    layout/              site header and footer
    sections/            page sections (hero, services, pricing, contact form…)
    ui/                  buttons, tags, page header, icons
    crm/                 CRM shell, forms, tables
  lib/
    env.ts               validated server environment
    db.ts                Prisma client (pg driver adapter)
    auth/                passwords, sessions, permissions, guards
    crm/                 server actions, formatting
    validation/          shared zod schemas
    rate-limit.ts        PostgreSQL-backed rate limiter
    audit.ts             audit logging
  middleware.ts          fast redirect to login for /crm
```

## Adding things

- **A service:** add an object to `services` in `site.ts` (choose a `pillar` and an `icon`). Its page, sitemap entry, contact-form option and footer links are generated.
- **A page:** create `src/app/(site)/your-page/page.tsx`, export `metadata`, and add it to `navigation` in `site.ts`.
- **A CRM field:** edit `prisma/schema.prisma` → `npm run db:migrate -- --name add_x` → update the zod schema in `src/lib/crm/actions.ts` and the form.
- **A permission:** add it to `PERMISSIONS` and the role matrix in `src/lib/auth/permissions.ts`, then call `requirePermission("x")` in actions and `requirePagePermission("x")` in pages.

## Testing done

Verified on Node 22 with PostgreSQL 16:

- `tsc --noEmit`, `eslint .` and `next build` (standalone) pass
- All public routes return 200, unknown routes 404, sitemap/robots/OG image render; no horizontal overflow at 390 px and 1440 px
- Contact API: valid submission creates a lead; invalid fields return per-field messages; cross-origin POST → 403; malformed JSON → 400; honeypot and too-fast submissions are silently dropped and audit-logged; 6th submission from one IP within 10 minutes → 429
- CRM end-to-end (Playwright): login redirect with `next`, wrong password message, login rate limit, status change, notes, follow-up task, lead → contact + deal conversion, moving a deal between stages, completing tasks, creating a SALES user, logout
- Data isolation: a SALES user sees only their own leads, gets 404 on another user's lead, and is sent to `/crm/forbidden` for Team and Audit log
- Production standalone server: Prisma works from the traced bundle, `__Host-` session cookie is `HttpOnly; Secure; SameSite=Lax`, security headers present, `/crm` responses are `no-store` + `noindex`

Not yet covered by automated tests: there is no committed unit/e2e test suite. See the roadmap in docs/CRM.md.
