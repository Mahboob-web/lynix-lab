import Link from "next/link";
import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { can, taskScope } from "@/lib/auth/permissions";
import { createTaskAction } from "@/lib/crm/actions";
import { formatDate, humanize } from "@/lib/crm/format";
import { ActionForm } from "@/components/crm/ActionForm";
import { TaskStatusButton } from "@/components/crm/TaskStatusButton";
import { Badge, DataTable, EmptyState, Field, PageTitle } from "@/components/crm/ui";
import { TaskType } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export const metadata = { title: "Tasks" };

const views = [
  { id: "open", label: "Open" },
  { id: "overdue", label: "Overdue" },
  { id: "mine", label: "Assigned to me" },
  { id: "done", label: "Done" },
] as const;

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const user = await requireUser();
  const requested = (await searchParams).view;
  const view = views.find((v) => v.id === requested)?.id ?? "open";
  const open = { status: { in: ["OPEN", "IN_PROGRESS"] } } as Prisma.TaskWhereInput;
  const filter: Record<typeof view, Prisma.TaskWhereInput> = {
    open,
    overdue: { ...open, dueAt: { lt: new Date() } },
    mine: { ...open, assigneeId: user.id },
    done: { status: "DONE" },
  };
  const db = getDb();
  const [tasks, team] = await Promise.all([
    db.task.findMany({
      where: { ...taskScope(user), ...filter[view] },
      orderBy: view === "done" ? { completedAt: "desc" } : [{ dueAt: { sort: "asc", nulls: "last" } }, { priority: "desc" }],
      take: 200,
      include: { assignee: { select: { name: true } }, lead: { select: { id: true, name: true } }, deal: { select: { title: true } }, company: { select: { name: true } } },
    }),
    can(user, "crm:assign") ? db.user.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }) : [],
  ]);
  const now = new Date();

  return (
    <>
      <PageTitle title="Tasks and follow-ups" />
      {can(user, "crm:write") ? (
        <details className="mb-6 border border-line bg-white">
          <summary className="cursor-pointer px-5 py-3 font-semibold">Add a task</summary>
          <div className="border-t border-line p-5">
            <ActionForm action={createTaskAction} submitLabel="Add task" resetOnSuccess>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2"><Field label="Task" htmlFor="title"><input id="title" name="title" required maxLength={200} className="field" /></Field></div>
                <Field label="Type" htmlFor="type">
                  <select id="type" name="type" className="field" defaultValue="TODO">
                    {Object.values(TaskType).map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
                  </select>
                </Field>
                <Field label="Due" htmlFor="dueAt"><input id="dueAt" name="dueAt" type="date" className="field" /></Field>
                <Field label="Priority" htmlFor="priority">
                  <select id="priority" name="priority" className="field" defaultValue="MEDIUM"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select>
                </Field>
                {team.length > 0 ? (
                  <Field label="Assign to" htmlFor="assigneeId">
                    <select id="assigneeId" name="assigneeId" className="field" defaultValue={user.id}>
                      {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </Field>
                ) : null}
              </div>
            </ActionForm>
          </div>
        </details>
      ) : null}

      <nav aria-label="Task views" className="mb-5 flex flex-wrap gap-2">
        {views.map((v) => (
          <Link
            key={v.id}
            href={`/crm/tasks?view=${v.id}`}
            aria-current={view === v.id ? "page" : undefined}
            className="rounded-[var(--radius-sm)] border border-line bg-white px-3 py-1.5 text-sm font-semibold aria-[current=page]:border-graphite aria-[current=page]:bg-graphite aria-[current=page]:text-ivory"
          >
            {v.label}
          </Link>
        ))}
      </nav>

      {tasks.length === 0 ? (
        <EmptyState title={view === "overdue" ? "Nothing overdue" : "No tasks here"} text="Schedule follow-ups from a lead page or add a task above." />
      ) : (
        <DataTable>
          <thead><tr><th scope="col">Task</th><th scope="col">Related to</th><th scope="col">Due</th><th scope="col">Priority</th><th scope="col">Assignee</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>
                  <span className={`font-semibold ${t.status === "DONE" ? "text-muted line-through" : ""}`}>{t.title}</span>
                  <span className="block text-muted">{humanize(t.type)}</span>
                </td>
                <td>
                  {t.lead ? <Link href={`/crm/leads/${t.lead.id}`} className="underline underline-offset-2">{t.lead.name}</Link> : t.deal?.title ?? t.company?.name ?? "—"}
                </td>
                <td className={`whitespace-nowrap ${t.status !== "DONE" && t.dueAt && t.dueAt < now ? "font-semibold text-danger" : ""}`}>{formatDate(t.dueAt)}</td>
                <td><Badge value={t.priority} /></td>
                <td>{t.assignee?.name ?? "—"}</td>
                <td className="text-right">
                  {can(user, "crm:write") ? (
                    t.status === "DONE" ? <TaskStatusButton taskId={t.id} status="OPEN" label="Reopen" /> : <TaskStatusButton taskId={t.id} status="DONE" label="Mark done" />
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
