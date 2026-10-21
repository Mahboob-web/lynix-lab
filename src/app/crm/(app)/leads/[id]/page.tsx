import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { can, ownerScope } from "@/lib/auth/permissions";
import { addLeadNoteAction, assignLeadAction, convertLeadAction, createTaskAction, deleteLeadAction, updateLeadStatusAction } from "@/lib/crm/actions";
import { formatDate, formatDateTime, humanize } from "@/lib/crm/format";
import { ActionForm } from "@/components/crm/ActionForm";
import { TaskStatusButton } from "@/components/crm/TaskStatusButton";
import { Badge, Field, PageTitle, Panel } from "@/components/crm/ui";
import { LeadStatus } from "@/generated/prisma/enums";

export const metadata = { title: "Lead" };

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const db = getDb();
  const lead = await db.lead.findFirst({
    where: { id, ...ownerScope(user) },
    include: {
      owner: { select: { id: true, name: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 50, include: { actor: { select: { name: true } } } },
      tasks: { orderBy: [{ status: "asc" }, { dueAt: "asc" }], include: { assignee: { select: { name: true } } } },
      deals: { select: { id: true, title: true, stage: { select: { name: true } } } },
    },
  });
  if (!lead) notFound();

  const canWrite = can(user, "crm:write");
  const canAssign = can(user, "crm:assign");
  const team = canAssign ? await db.user.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }) : [];

  const details: [string, React.ReactNode][] = [
    ["Email", <a key="e" href={`mailto:${lead.email}`} className="underline underline-offset-2">{lead.email}</a>],
    ["Phone", lead.phone ? <a key="p" href={`tel:${lead.phone}`} className="underline underline-offset-2">{lead.phone}</a> : "—"],
    ["Company", lead.companyName ?? "—"],
    ["Service", lead.serviceInterest ?? "—"],
    ["Budget", lead.budget ?? "—"],
    ["Source", humanize(lead.source)],
    ["Owner", lead.owner?.name ?? "Unassigned"],
    ["Received", formatDateTime(lead.createdAt)],
    ["Consent", lead.consent ? "Given on the contact form" : "Added by team"],
  ];

  return (
    <>
      <Link href="/crm/leads" className="text-sm font-semibold text-muted hover:text-graphite">
        All leads
      </Link>
      <div className="mt-3">
        <PageTitle title={lead.name} description={lead.companyName ?? lead.email} actions={<Badge value={lead.status} />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {lead.message ? (
            <Panel title="Message">
              <p className="whitespace-pre-line leading-relaxed">{lead.message}</p>
            </Panel>
          ) : null}

          {canWrite ? (
            <Panel title="Log an interaction">
              <ActionForm action={addLeadNoteAction.bind(null, lead.id)} submitLabel="Add to timeline" resetOnSuccess>
                <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                  <Field label="Type" htmlFor="type">
                    <select id="type" name="type" className="field">
                      <option value="NOTE">Note</option>
                      <option value="CALL">Call</option>
                      <option value="EMAIL">Email</option>
                      <option value="MEETING">Meeting</option>
                    </select>
                  </Field>
                  <Field label="Details" htmlFor="content">
                    <textarea id="content" name="content" rows={3} required maxLength={5000} className="field" />
                  </Field>
                </div>
              </ActionForm>
            </Panel>
          ) : null}

          <Panel title="Timeline">
            {lead.activities.length === 0 ? (
              <p className="text-muted">No activity yet.</p>
            ) : (
              <ol className="space-y-4">
                {lead.activities.map((a) => (
                  <li key={a.id} className="grid grid-cols-[auto_1fr] gap-3">
                    <span aria-hidden className={`mt-1.5 size-2.5 ${a.type === "STATUS_CHANGE" ? "bg-lime ring-1 ring-graphite" : "bg-graphite"}`} />
                    <div>
                      <p className="whitespace-pre-line">{a.content}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {humanize(a.type)}, {a.actor?.name ?? "System"}, {formatDateTime(a.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Details">
            <dl className="space-y-2.5 text-sm">
              {details.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6rem_1fr] gap-2">
                  <dt className="text-muted">{k}</dt>
                  <dd className="break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          {canWrite ? (
            <Panel title="Status">
              <ActionForm action={updateLeadStatusAction.bind(null, lead.id)} submitLabel="Update status" inline className="flex flex-wrap items-center gap-3">
                <label htmlFor="status" className="sr-only">
                  Status
                </label>
                <select id="status" name="status" defaultValue={lead.status} className="field !w-auto">
                  {Object.values(LeadStatus).map((s) => (
                    <option key={s} value={s}>
                      {humanize(s)}
                    </option>
                  ))}
                </select>
              </ActionForm>
            </Panel>
          ) : null}

          {canAssign ? (
            <Panel title="Owner">
              <ActionForm action={assignLeadAction.bind(null, lead.id)} submitLabel="Assign" inline className="flex flex-wrap items-center gap-3">
                <label htmlFor="ownerId" className="sr-only">
                  Owner
                </label>
                <select id="ownerId" name="ownerId" defaultValue={lead.owner?.id ?? ""} className="field !w-auto">
                  <option value="">Unassigned</option>
                  {team.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </ActionForm>
            </Panel>
          ) : null}

          <Panel title="Follow-ups">
            {lead.tasks.length > 0 ? (
              <ul className="mb-4 divide-y divide-line text-sm">
                {lead.tasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2 py-2">
                    <span className={t.status === "DONE" ? "text-muted line-through" : ""}>
                      {t.title}
                      <span className="block text-xs text-muted">
                        {t.dueAt ? formatDate(t.dueAt) : "No due date"}, {t.assignee?.name ?? "Unassigned"}
                      </span>
                    </span>
                    {canWrite && t.status !== "DONE" ? <TaskStatusButton taskId={t.id} status="DONE" label="Done" /> : <Badge value={t.status} />}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-muted">No follow-ups scheduled.</p>
            )}
            {canWrite ? (
              <ActionForm action={createTaskAction} submitLabel="Schedule follow-up" resetOnSuccess>
                <input type="hidden" name="leadId" value={lead.id} />
                <input type="hidden" name="type" value="FOLLOW_UP" />
                <div className="space-y-3">
                  <Field label="What needs to happen" htmlFor="title">
                    <input id="title" name="title" required maxLength={200} className="field" placeholder="Call back about the proposal" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Due" htmlFor="dueAt">
                      <input id="dueAt" name="dueAt" type="date" className="field" />
                    </Field>
                    <Field label="Priority" htmlFor="priority">
                      <select id="priority" name="priority" defaultValue="MEDIUM" className="field">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </ActionForm>
            ) : null}
          </Panel>

          {canWrite ? (
            <Panel title="Convert to deal">
              {lead.convertedAt ? (
                <div className="text-sm">
                  <p>Converted on {formatDate(lead.convertedAt)}.</p>
                  <ul className="mt-2 space-y-1">
                    {lead.deals.map((d) => (
                      <li key={d.id}>
                        <Link href="/crm/pipeline" className="font-semibold underline underline-offset-2">
                          {d.title}
                        </Link>{" "}
                        <span className="text-muted">({d.stage.name})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <ActionForm action={convertLeadAction.bind(null, lead.id)} submitLabel="Create contact and deal">
                  <p className="mb-3 text-sm text-muted">Creates a contact{lead.companyName ? " and company" : ""}, and a deal in the first pipeline stage.</p>
                  <div className="space-y-3">
                    <Field label="Deal title" htmlFor="dealTitle">
                      <input id="dealTitle" name="dealTitle" required maxLength={160} defaultValue={`${lead.companyName ?? lead.name}: ${lead.serviceInterest ?? "project"}`} className="field" />
                    </Field>
                    <Field label="Estimated value (USD)" htmlFor="dealValue">
                      <input id="dealValue" name="dealValue" type="number" min={0} step={50} defaultValue={0} className="field" />
                    </Field>
                  </div>
                </ActionForm>
              )}
            </Panel>
          ) : null}

          {can(user, "crm:delete") ? (
            <details className="border border-line bg-white p-5 text-sm">
              <summary className="cursor-pointer font-semibold text-danger">Delete this lead</summary>
              <p className="mt-3 text-muted">This permanently removes the lead, its timeline and follow-ups. Use it for spam or data-deletion requests. The deletion is recorded in the audit log.</p>
              <ActionForm action={deleteLeadAction.bind(null, lead.id)} submitLabel="Delete permanently" pendingLabel="Deleting…" buttonClassName="!bg-danger" />
            </details>
          ) : null}
        </div>
      </div>
    </>
  );
}
