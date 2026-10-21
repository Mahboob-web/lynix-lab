# Security

How the site and CRM protect data, and where each control lives in the code.

## Authentication
- **Email + password** (`src/lib/crm/auth-actions.ts`). Passwords are hashed with **bcrypt (cost 12)**. The password policy requires at least 12 characters, letters and a number (`src/lib/validation/password.ts`).
- **No account enumeration:** unknown emails get the same message and similar timing (a dummy bcrypt comparison runs).
- **Brute-force protection:** sign-in is rate-limited to 20 attempts per IP and 10 per email per 15 minutes, and an account **locks for 15 minutes after 5 wrong passwords**. Every attempt is audit-logged.
- **No self-registration.** Admins create accounts in **CRM → Team**. The first admin comes from `npm run db:seed` using environment variables, so no credentials are hardcoded.

## Sessions (`src/lib/auth/session.ts`)
- A random 256-bit token is stored in a cookie named `__Host-lynix_session` in production, with `HttpOnly`, `Secure`, `SameSite=Lax` and `Path=/`.
- The database stores only `HMAC-SHA256(token, AUTH_SECRET)`, so a leaked database can't be replayed into a login.
- **Absolute lifetime 7 days, idle timeout 12 hours**, with server-side revocation:
  - Logout deletes the session row.
  - Changing your password signs out every other device.
  - An admin changing someone's role, deactivating them or resetting their password ends all of that user's sessions immediately.
- `src/middleware.ts` only redirects visitors without a cookie. **Every page and action re-validates the session against the database.**

## Authorisation and data isolation (`src/lib/auth/permissions.ts`)
| Permission | Admin | Manager | Sales | Viewer |
|---|:-:|:-:|:-:|:-:|
| `crm:read` | ✅ | ✅ | own records | ✅ |
| `crm:write` | ✅ | ✅ | own records | — |
| `crm:assign` (choose owners) | ✅ | ✅ | — | — |
| `crm:delete` | ✅ | — | — | — |
| `reports:read` | ✅ | ✅ | own data | ✅ |
| `users:manage` | ✅ | — | — | — |
| `audit:read` | ✅ | — | — | — |

- **Row-level scope:** SALES users only see records where `ownerId` is their own (`ownerScope`), and tasks assigned to or created by them (`taskScope`). Every query and mutation applies the scope. A record outside it returns *not found* rather than *forbidden*, so its existence isn't leaked.
- Pages call `requirePagePermission()`. Server actions call `requirePermission()` and re-check ownership before writing. The UI hides buttons with `can()`, but the server is the authority.
- Admins can't remove their own admin role or deactivate themselves.

## Input validation
- Every input is validated with **zod** on the server: the contact API (`src/lib/validation/contact.ts`) and all CRM actions (`src/lib/crm/actions.ts`). The same contact schema runs in the browser for instant feedback.
- Select fields are checked against allow-lists (services, budgets, enums). Lengths are capped, and the contact API rejects bodies over 16 KB.
- Prisma parameterises every query. The one raw query (rate limiter) uses tagged-template parameters.
- React escapes all output. JSON-LD is serialised with `<` escaped.

## Public form protection (`src/app/api/contact/route.ts`)
- **Same-origin check** (rejects cross-site POSTs). Server Actions get Next.js' built-in Origin/Host check.
- **Rate limits stored in PostgreSQL** (`src/lib/rate-limit.ts`): 5 per IP per 10 minutes, 20 per IP per day, and 3 per email per hour. They survive restarts and work across instances.
- **Spam traps:** a hidden honeypot field and a minimum fill time. Bots receive a fake success and the event is audit-logged.
- **Client IP** is read from the *right-hand* end of `X-Forwarded-For` (`TRUSTED_PROXY_HOPS`), so clients can't spoof their way around limits.
- An explicit consent checkbox is required, and the consent is stored on the lead.

## Audit logging (`src/lib/audit.ts`)
Logged events include sign-in success, failure, lock-out and rate-limiting; logout; password changes and resets; user creation and role or active changes; lead creation (public and manual), status change, assignment, conversion and deletion; task, deal, contact and company changes; and blocked spam. Each entry has the actor, entity, IP, user agent and minimal metadata. Passwords, tokens and message bodies are never logged. Admins can view the log in **CRM → Audit log**.

## HTTP hardening (`next.config.ts`)
CSP (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `form-action 'self'`), HSTS (production), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` and COOP. `X-Powered-By` is removed. `/crm` and `/api` are `no-store`, and `/crm` is `noindex` and disallowed in robots.txt.

**CSP note:** Next.js needs `'unsafe-inline'` for scripts unless you switch to nonce-based CSP, which generates a nonce in middleware and makes every page dynamic. That is a worthwhile upgrade on a VPS; it's left off here so the public pages stay static and fast on shared hosting.

## Secrets
- Secrets are read only in `src/lib/env.ts` (validated, server-only) and never sent to the browser. `.env*` is git-ignored, and `.env.example` documents every variable.
- In production, `AUTH_SECRET` is required; the CRM refuses to run without it.
- Database credentials live only in Hostinger's encrypted environment variables.

## Operational checklist
- [ ] Strong, unique `AUTH_SECRET` and database password; DB user scoped to this database
- [ ] HTTPS only; domain SSL active
- [ ] Daily database backups (Neon/Supabase point-in-time restore, or `pg_dump` on a VPS) and a tested restore
- [ ] Review **Audit log** and **Team** monthly; deactivate leavers the same day
- [ ] `npm audit` and dependency updates monthly (Hostinger also flags vulnerable dependencies for Git deployments)
- [ ] Data-deletion requests: delete the lead (Admin) and any converted contact

## Known limits / next steps
- No 2FA yet. TOTP is the next auth upgrade (add `totpSecret` to `User` and verify it after the password step).
- No password-reset-by-email flow (needs an email provider); admins reset passwords in **Team**.
- Audit log rows are append-only from the app but not cryptographically chained. Export them to external storage if you need tamper evidence.
