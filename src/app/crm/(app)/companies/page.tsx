import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { can, ownerScope } from "@/lib/auth/permissions";
import { createCompanyAction } from "@/lib/crm/actions";
import { ActionForm } from "@/components/crm/ActionForm";
import { DataTable, EmptyState, Field, PageTitle } from "@/components/crm/ui";

export const metadata = { title: "Companies" };

export default async function CompaniesPage() {
  const user = await requireUser();
  const companies = await getDb().company.findMany({
    where: ownerScope(user),
    orderBy: { name: "asc" },
    take: 200,
    include: { owner: { select: { name: true } }, _count: { select: { contacts: true, deals: true } } },
  });
  return (
    <>
      <PageTitle title="Companies" description="Organisations behind your contacts and deals." />
      {can(user, "crm:write") ? (
        <details className="mb-6 border border-line bg-white">
          <summary className="cursor-pointer px-5 py-3 font-semibold">Add a company</summary>
          <div className="border-t border-line p-5">
            <ActionForm action={createCompanyAction} submitLabel="Add company" resetOnSuccess>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor="name"><input id="name" name="name" required maxLength={160} className="field" /></Field>
                <Field label="Website" htmlFor="website"><input id="website" name="website" type="url" placeholder="https://" maxLength={300} className="field" /></Field>
                <Field label="Industry" htmlFor="industry"><input id="industry" name="industry" maxLength={120} className="field" /></Field>
                <Field label="Phone" htmlFor="phone"><input id="phone" name="phone" maxLength={30} className="field" /></Field>
              </div>
            </ActionForm>
          </div>
        </details>
      ) : null}
      {companies.length === 0 ? (
        <EmptyState title="No companies yet" text="Companies are created when you convert a lead with a company name, or add one here." />
      ) : (
        <DataTable>
          <thead><tr><th scope="col">Company</th><th scope="col">Industry</th><th scope="col">Contacts</th><th scope="col">Deals</th><th scope="col">Owner</th></tr></thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id}>
                <td className="font-semibold">
                  {c.name}
                  {c.website ? <a href={c.website} target="_blank" rel="noopener noreferrer" className="block font-normal text-muted underline underline-offset-2">{c.website.replace(/^https?:\/\//, "")}</a> : null}
                </td>
                <td>{c.industry ?? "—"}</td>
                <td className="tabular-nums">{c._count.contacts}</td>
                <td className="tabular-nums">{c._count.deals}</td>
                <td>{c.owner?.name ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
