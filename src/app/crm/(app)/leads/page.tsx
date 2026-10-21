import Link from "next/link";
import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { can, ownerScope } from "@/lib/auth/permissions";
import { formatDate, humanize } from "@/lib/crm/format";
import { Badge, DataTable, EmptyState, LinkButton, PageTitle, Pagination } from "@/components/crm/ui";
import { LeadStatus } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export const metadata = { title: "Leads" };
const PAGE_SIZE = 25;

type Props = { searchParams: Promise<{ q?: string; status?: string; owner?: string; page?: string }> };

export default async function LeadsPage({ searchParams }: Props) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) ?? "";
  const status = Object.values(LeadStatus).includes(sp.status as LeadStatus) ? (sp.status as LeadStatus) : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.LeadWhereInput = {
    ...ownerScope(user),
    ...(status ? { status } : {}),
    ...(sp.owner === "me" ? { ownerId: user.id } : sp.owner === "none" && user.role !== "SALES" ? { ownerId: null } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { companyName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const db = getDb();
  const [total, leads] = await Promise.all([
    db.lead.count({ where }),
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, name: true, email: true, companyName: true, serviceInterest: true, status: true, source: true, createdAt: true, owner: { select: { name: true } } },
    }),
  ]);
  const pages = Math.ceil(total / PAGE_SIZE);
  const href = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (sp.owner) params.set("owner", sp.owner);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/crm/leads${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageTitle
        title="Leads"
        description={`${total} ${total === 1 ? "lead" : "leads"}${user.role === "SALES" ? " assigned to you" : ""}`}
        actions={can(user, "crm:write") ? <LinkButton href="/crm/leads/new" tone="lime">Add a lead</LinkButton> : null}
      />

      <form className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]" role="search">
        <label className="sr-only" htmlFor="q">
          Search leads
        </label>
        <input id="q" name="q" defaultValue={q} placeholder="Search name, email or company" className="field" />
        <label className="sr-only" htmlFor="status">
          Status
        </label>
        <select id="status" name="status" defaultValue={status ?? ""} className="field">
          <option value="">All statuses</option>
          {Object.values(LeadStatus).map((s) => (
            <option key={s} value={s}>
              {humanize(s)}
            </option>
          ))}
        </select>
        {user.role !== "SALES" ? (
          <>
            <label className="sr-only" htmlFor="owner">
              Owner
            </label>
            <select id="owner" name="owner" defaultValue={sp.owner ?? ""} className="field">
              <option value="">Any owner</option>
              <option value="me">Mine</option>
              <option value="none">Unassigned</option>
            </select>
          </>
        ) : (
          <span className="hidden sm:block" />
        )}
        <button className="rounded-[var(--radius-sm)] border border-graphite px-4 py-2 font-semibold hover:bg-graphite hover:text-ivory">Filter</button>
      </form>

      {leads.length === 0 ? (
        <EmptyState
          title={q || status ? "No leads match these filters" : "No leads yet"}
          text={q || status ? "Clear the search or pick another status." : "Enquiries from the website contact form land here automatically."}
          action={q || status ? <LinkButton href="/crm/leads" tone="outline">Clear filters</LinkButton> : null}
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th scope="col">Lead</th>
              <th scope="col">Interest</th>
              <th scope="col">Status</th>
              <th scope="col">Source</th>
              <th scope="col">Owner</th>
              <th scope="col">Received</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-ivory">
                <td>
                  <Link href={`/crm/leads/${l.id}`} className="font-semibold underline-offset-2 hover:underline">
                    {l.name}
                  </Link>
                  <span className="block text-muted">{l.companyName ?? l.email}</span>
                </td>
                <td>{l.serviceInterest ?? "—"}</td>
                <td>
                  <Badge value={l.status} />
                </td>
                <td>{humanize(l.source)}</td>
                <td>{l.owner?.name ?? <span className="text-muted">Unassigned</span>}</td>
                <td className="whitespace-nowrap">{formatDate(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
      <Pagination page={page} pages={pages} makeHref={href} />
    </>
  );
}
