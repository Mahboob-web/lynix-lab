import { getDb } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guards";
import { formatDateTime } from "@/lib/crm/format";
import { DataTable, EmptyState, PageTitle } from "@/components/crm/ui";

export const metadata = { title: "Audit log" };

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ action?: string }> }) {
  await requirePagePermission("audit:read");
  const action = (await searchParams).action?.trim().slice(0, 60) ?? "";
  const entries = await getDb().auditLog.findMany({
    where: action ? { action: { startsWith: action } } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { name: true, email: true } } },
  });
  return (
    <>
      <PageTitle title="Audit log" description="Security-relevant events: sign-ins, permission changes, record changes and deletions. Latest 200." />
      <form role="search" className="mb-5 flex gap-3">
        <label htmlFor="action" className="sr-only">Filter by action</label>
        <input id="action" name="action" defaultValue={action} placeholder="Filter by action, e.g. auth. or lead." className="field" />
        <button className="rounded-[var(--radius-sm)] border border-graphite px-4 font-semibold hover:bg-graphite hover:text-ivory">Filter</button>
      </form>
      {entries.length === 0 ? (
        <EmptyState title="No matching events" text="Try a shorter filter such as auth or lead." />
      ) : (
        <DataTable>
          <thead><tr><th scope="col">When</th><th scope="col">Action</th><th scope="col">Who</th><th scope="col">Record</th><th scope="col">IP</th></tr></thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap">{formatDateTime(e.createdAt)}</td>
                <td><code className="text-xs">{e.action}</code>{e.metadata ? <span className="block max-w-xs truncate text-xs text-muted">{JSON.stringify(e.metadata)}</span> : null}</td>
                <td>{e.actor ? e.actor.name : <span className="text-muted">Public / system</span>}</td>
                <td className="text-xs">{e.entityType ? `${e.entityType} ${e.entityId?.slice(-6)}` : "—"}</td>
                <td className="text-xs text-muted">{e.ip ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
