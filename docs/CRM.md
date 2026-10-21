# CRM

The CRM lives at `/crm` in the same Next.js app. It shares the database layer, auth and permissions with the website, so a website enquiry becomes a lead instantly.

## Data model (`prisma/schema.prisma`)

```
User ─┬─ Session                    auth
      └─ owns → Lead, Contact, Company, Deal, Project; assigned Tasks

Lead ──convert──▶ Contact ──▶ Company
  │                  │
  └──────────────▶ Deal ─▶ PipelineStage ─▶ Pipeline
                     └─▶ Project
Task      → may link to Lead | Contact | Company | Deal | Project
Activity  → timeline entry on any of the above (note, call, email, meeting, status change, system)
AuditLog  → security trail (who did what, from where)
RateLimit → shared rate-limit counters
```

- **Lead statuses:** New → Contacted → Qualified → Proposal → Won / Lost / Unqualified
- **Default pipeline (seeded):** Discovery 10% → Proposal sent 35% → Negotiation 60% → Verbal yes 85% → Won / Lost. Probabilities drive the weighted forecast. Add pipelines and stages in the database; the UI reads them dynamically.

## What's built

| Module | Status |
|---|---|
| Website contact form → Lead (with timeline entry, audit log and optional webhook) | ✅ |
| Leads: list, search, filter (status/owner), pagination, detail, manual add, status change, assignment, notes/calls/emails/meetings, follow-ups, convert to contact + company + deal, delete (admin) | ✅ |
| Pipeline: board by stage, add deal, move between stages (won/lost syncs back to the lead), totals | ✅ |
| Contacts and companies: list, search (contacts), add | ✅ basic |
| Tasks and follow-ups: views for open, overdue, mine and done; add, assign, complete and reopen | ✅ |
| Dashboard / reports: KPIs, leads by status and source, my tasks, recent activity, pipeline value and weighted forecast | ✅ basic |
| Team: invite, roles, deactivate, reset password, session revocation | ✅ |
| Audit log viewer (filter by action) | ✅ |
| Account: change password, list signed-in devices | ✅ |
| Projects | 🟡 database model only (no screens yet) |
| Edit and delete for contacts, companies and deals; contact/company detail pages | 🟡 next phase |

## Roadmap (suggested phases)

1. **Records:** detail and edit pages for contacts, companies and deals; merge duplicates; CSV import and export.
2. **Projects:** list, board and detail pages, created from won deals, with tasks per project.
3. **Follow-up automation:** daily reminder email or WhatsApp for due tasks (needs a scheduler: a VPS cron job or an external cron hitting a signed endpoint); email new leads to the owner.
4. **Reports:** conversion by source, win rate, sales cycle length, revenue by month (charts).
5. **AI and automation:** lead scoring and summaries, auto-drafted replies, a chatbot or voice agent that writes leads through an authenticated API (`/api/v1/leads` with per-integration API keys and scopes), and outbound webhooks for every event.
6. **Multi-tenant (white-label CRM for clients):** add an `Organization` model, put `organizationId` on every record, and scope every query by it, the same way `ownerScope` works today.
7. **Auth:** TOTP 2FA, password reset by email, SSO.

## Conventions for new modules
- Put server actions in `src/lib/crm/` (`"use server"`): `requirePermission` → zod parse → scope check → write → `Activity` + `audit()` → `revalidatePath`.
- Use `ownerScope(user)` and `taskScope(user)` in **every** query.
- Pages go under `src/app/crm/(app)/…`. Build forms with `<ActionForm>`, and use `Panel`, `DataTable`, `Badge` and `EmptyState` from `components/crm/ui.tsx`.
