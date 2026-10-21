import Link from "next/link";
import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { can, ownerScope, taskScope } from "@/lib/auth/permissions";
import { formatDate, formatMoney, humanize, timeAgo } from "@/lib/crm/format";
import { Badge, EmptyState, LinkButton, PageTitle, Panel } from "@/components/crm/ui";
import { LeadStatus } from "@/generated/prisma/enums";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const db = getDb();
  const scope = ownerScope(user);
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [newLeads, openLeads, byStatus, bySource, openDeals, myTasks, overdue, recent] = await Promise.all([
    db.lead.count({ where: { ...scope, createdAt: { gte: weekAgo } } }),
    db.lead.count({ where: { ...scope, status: { in: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL"] } } }),
    db.lead.groupBy({ by: ["status"], where: scope, _count: { _all: true } }),
    db.lead.groupBy({ by: ["source"], where: scope, _count: { _all: true } }),
    db.deal.findMany({ where: { ...scope, status: "OPEN" }, select: { value: true, stage: { select: { probability: true } } } }),
    db.task.findMany({
      where: { assigneeId: user.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
      orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }],
      take: 6,
      include: { lead: { select: { id: true, name: true } } },
    }),
    db.task.count({ where: { ...taskScope(user), status: { in: ["OPEN", "IN_PROGRESS"] }, dueAt: { lt: new Date() } } }),
    db.activity.findMany({
      where: user.role === "SALES" ? { OR: [{ actorId: user.id }, { lead: { ownerId: user.id } }, { deal: { ownerId: user.id } }] } : {},
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { name: true } }, lead: { select: { id: true, name: true } }, deal: { select: { title: true } } },
    }),
  ]);

  const pipelineValue = openDeals.reduce((s, d) => s + Number(d.value), 0);
  const weighted = openDeals.reduce((s, d) => s + (Number(d.value) * d.stage.probability) / 100, 0);
  const statusCounts = Object.values(LeadStatus).map((s) => ({ status: s, count: byStatus.find((b) => b.status === s)?._count._all ?? 0 }));
  const maxStatus = Math.max(1, ...statusCounts.map((s) => s.count));
  const showReports = can(user, "reports:read") || user.role === "SALES";

  const kpis = [
    { label: "New leads (7 days)", value: String(newLeads), href: "/crm/leads?status=NEW" },
    { label: "Open leads", value: String(openLeads), href: "/crm/leads" },
    { label: "Open pipeline", value: formatMoney(pipelineValue), href: "/crm/pipeline" },
    { label: "Weighted forecast", value: formatMoney(weighted), href: "/crm/pipeline" },
    { label: "Overdue tasks", value: String(overdue), href: "/crm/tasks?view=overdue", alert: overdue > 0 },
  ];

  return (
    <>
      <PageTitle
        title={`Hello, ${user.name.split(" ")[0]}`}
        description={user.role === "SALES" ? "Your leads, deals and tasks." : "Team overview across leads, deals and tasks."}
        actions={can(user, "crm:write") ? <LinkButton href="/crm/leads/new" tone="lime">Add a lead</LinkButton> : null}
      />

      <div className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line md:grid-cols-5">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="bg-white p-4 hover:bg-ivory">
            <p className="text-sm text-muted">{k.label}</p>
            <p className={`mt-2 text-2xl font-bold tabular-nums ${k.alert ? "text-danger" : ""}`}>{k.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="My open tasks" className="lg:col-span-2" actions={<Link href="/crm/tasks" className="text-sm font-semibold underline underline-offset-4">All tasks</Link>}>
          {myTasks.length === 0 ? (
            <EmptyState title="No open tasks" text="Follow-ups you schedule on leads appear here." />
          ) : (
            <ul className="divide-y divide-line">
              {myTasks.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span>
                    <span className="font-medium">{t.title}</span>
                    {t.lead ? (
                      <Link href={`/crm/leads/${t.lead.id}`} className="ml-2 text-sm text-muted underline underline-offset-2">
                        {t.lead.name}
                      </Link>
                    ) : null}
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    <Badge value={t.priority} />
                    <span className={t.dueAt && t.dueAt < new Date() ? "font-semibold text-danger" : "text-muted"}>{t.dueAt ? formatDate(t.dueAt) : "No due date"}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {showReports ? (
          <Panel title="Leads by status">
            <ul className="space-y-2">
              {statusCounts.map((s) => (
                <li key={s.status}>
                  <Link href={`/crm/leads?status=${s.status}`} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-2 text-sm hover:underline">
                    <span>{humanize(s.status)}</span>
                    <span className="h-2.5 bg-gray">
                      <span className="block h-full bg-graphite" style={{ width: `${(s.count / maxStatus) * 100}%` }} />
                    </span>
                    <span className="text-right tabular-nums">{s.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {bySource.length > 0 ? (
              <>
                <h3 className="mt-6 text-sm font-semibold text-muted">By source</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {bySource.map((s) => (
                    <li key={s.source} className="border border-line px-2 py-1 text-sm">
                      {humanize(s.source)} <span className="font-semibold tabular-nums">{s._count._all}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </Panel>
        ) : null}
      </div>

      <Panel title="Recent activity" className="mt-6">
        {recent.length === 0 ? (
          <EmptyState title="No activity yet" text="Website enquiries, notes and stage changes will show up here." />
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((a) => (
              <li key={a.id} className="flex flex-col gap-1 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <Badge value={a.type} /> <span className="ml-1">{a.content}</span>{" "}
                  {a.lead ? (
                    <Link href={`/crm/leads/${a.lead.id}`} className="font-semibold underline underline-offset-2">
                      {a.lead.name}
                    </Link>
                  ) : a.deal ? (
                    <span className="font-semibold">{a.deal.title}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-muted">
                  {a.actor?.name ?? "System"}, {timeAgo(a.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
