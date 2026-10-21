import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { can, ownerScope } from "@/lib/auth/permissions";
import { createDealAction, moveDealAction } from "@/lib/crm/actions";
import { formatDate, formatMoney } from "@/lib/crm/format";
import { ActionForm } from "@/components/crm/ActionForm";
import { EmptyState, Field, PageTitle } from "@/components/crm/ui";

export const metadata = { title: "Pipeline" };

export default async function PipelinePage() {
  const user = await requireUser();
  const db = getDb();
  const pipeline = await db.pipeline.findFirst({
    where: { isDefault: true },
    include: {
      stages: {
        orderBy: { order: "asc" },
        include: {
          deals: {
            where: ownerScope(user),
            orderBy: { updatedAt: "desc" },
            include: { company: { select: { name: true } }, owner: { select: { name: true } } },
          },
        },
      },
    },
  });
  if (!pipeline) {
    return <EmptyState title="No pipeline set up" text="Run `npm run db:seed` to create the default sales pipeline." />;
  }
  const canWrite = can(user, "crm:write");
  const [companies, contacts] = canWrite
    ? await Promise.all([
        db.company.findMany({ where: ownerScope(user), select: { id: true, name: true }, orderBy: { name: "asc" }, take: 500 }),
        db.contact.findMany({ where: ownerScope(user), select: { id: true, firstName: true, lastName: true }, orderBy: { firstName: "asc" }, take: 500 }),
      ])
    : [[], []];

  const openStages = pipeline.stages.filter((s) => !s.isWon && !s.isLost);
  const total = openStages.reduce((sum, s) => sum + s.deals.reduce((a, d) => a + Number(d.value), 0), 0);

  return (
    <>
      <PageTitle title={`${pipeline.name} pipeline`} description={`${formatMoney(total)} in open deals`} />

      {canWrite ? (
        <details className="mb-6 border border-line bg-white">
          <summary className="cursor-pointer px-5 py-3 font-semibold">Add a deal</summary>
          <div className="border-t border-line p-5">
            <ActionForm action={createDealAction} submitLabel="Add deal" resetOnSuccess>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Title" htmlFor="title">
                  <input id="title" name="title" required maxLength={160} className="field" />
                </Field>
                <Field label="Value (USD)" htmlFor="value">
                  <input id="value" name="value" type="number" min={0} step={50} defaultValue={0} className="field" />
                </Field>
                <Field label="Stage" htmlFor="stageId">
                  <select id="stageId" name="stageId" className="field">
                    {openStages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Company" htmlFor="companyId">
                  <select id="companyId" name="companyId" className="field" defaultValue="">
                    <option value="">None</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Contact" htmlFor="contactId">
                  <select id="contactId" name="contactId" className="field" defaultValue="">
                    <option value="">None</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {[c.firstName, c.lastName].filter(Boolean).join(" ")}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Expected close" htmlFor="expectedCloseDate">
                  <input id="expectedCloseDate" name="expectedCloseDate" type="date" className="field" />
                </Field>
              </div>
            </ActionForm>
          </div>
        </details>
      ) : null}

      <div className="-mx-4 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
        <ol className="flex gap-4" aria-label="Pipeline stages">
          {pipeline.stages.map((stage) => {
            const value = stage.deals.reduce((a, d) => a + Number(d.value), 0);
            return (
              <li key={stage.id} className="flex w-72 shrink-0 flex-col border border-line bg-gray/60">
                <div className="flex items-baseline justify-between gap-2 border-b border-line bg-white px-3 py-2.5">
                  <h2 className="font-semibold">
                    {stage.name} <span className="text-sm font-normal text-muted">({stage.deals.length})</span>
                  </h2>
                  <span className="text-sm tabular-nums text-muted">{formatMoney(value)}</span>
                </div>
                <ul className="flex flex-1 flex-col gap-2 p-2">
                  {stage.deals.length === 0 ? <li className="px-1 py-3 text-sm text-muted">No deals in this stage.</li> : null}
                  {stage.deals.map((deal) => (
                    <li key={deal.id} className="border border-line bg-white p-3">
                      <p className="font-semibold leading-snug">{deal.title}</p>
                      <p className="mt-1 text-sm text-muted">
                        {deal.company?.name ?? "No company"}, {deal.owner?.name ?? "Unassigned"}
                      </p>
                      <p className="mt-2 flex items-baseline justify-between text-sm">
                        <span className="font-semibold tabular-nums">{formatMoney(deal.value, deal.currency)}</span>
                        <span className="text-muted">{deal.expectedCloseDate ? `Close ${formatDate(deal.expectedCloseDate)}` : `${stage.probability}%`}</span>
                      </p>
                      {canWrite ? (
                        <ActionForm action={moveDealAction.bind(null, deal.id)} submitLabel="Move" inline className="mt-3 flex items-center gap-2" buttonClassName="!px-3 !py-1.5 !text-xs">
                          <label htmlFor={`stage-${deal.id}`} className="sr-only">
                            Move {deal.title} to stage
                          </label>
                          <select id={`stage-${deal.id}`} name="stageId" defaultValue={stage.id} className="field !py-1.5 !text-sm">
                            {pipeline.stages.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </ActionForm>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
