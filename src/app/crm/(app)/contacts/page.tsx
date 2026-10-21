import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { can, ownerScope } from "@/lib/auth/permissions";
import { createContactAction } from "@/lib/crm/actions";
import { formatDate } from "@/lib/crm/format";
import { ActionForm } from "@/components/crm/ActionForm";
import { DataTable, EmptyState, Field, PageTitle } from "@/components/crm/ui";

export const metadata = { title: "Contacts" };

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const q = (await searchParams).q?.trim().slice(0, 100) ?? "";
  const db = getDb();
  const where = {
    ...ownerScope(user),
    ...(q
      ? { OR: [{ firstName: { contains: q, mode: "insensitive" as const } }, { lastName: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }] }
      : {}),
  };
  const [contacts, companies] = await Promise.all([
    db.contact.findMany({ where, orderBy: { createdAt: "desc" }, take: 100, include: { company: { select: { name: true } }, owner: { select: { name: true } } } }),
    can(user, "crm:write") ? db.company.findMany({ where: ownerScope(user), select: { id: true, name: true }, orderBy: { name: "asc" }, take: 500 }) : [],
  ]);

  return (
    <>
      <PageTitle title="Contacts" description="People you work with. Converted leads become contacts automatically." />
      {can(user, "crm:write") ? (
        <details className="mb-6 border border-line bg-white">
          <summary className="cursor-pointer px-5 py-3 font-semibold">Add a contact</summary>
          <div className="border-t border-line p-5">
            <ActionForm action={createContactAction} submitLabel="Add contact" resetOnSuccess>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="First name" htmlFor="firstName"><input id="firstName" name="firstName" required maxLength={80} className="field" /></Field>
                <Field label="Last name" htmlFor="lastName"><input id="lastName" name="lastName" maxLength={80} className="field" /></Field>
                <Field label="Email" htmlFor="email"><input id="email" name="email" type="email" maxLength={200} className="field" /></Field>
                <Field label="Phone" htmlFor="phone"><input id="phone" name="phone" maxLength={30} className="field" /></Field>
                <Field label="Job title" htmlFor="jobTitle"><input id="jobTitle" name="jobTitle" maxLength={120} className="field" /></Field>
                <Field label="Company" htmlFor="companyId">
                  <select id="companyId" name="companyId" className="field" defaultValue="">
                    <option value="">None</option>
                    {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>
            </ActionForm>
          </div>
        </details>
      ) : null}
      <form role="search" className="mb-5 flex gap-3">
        <label htmlFor="q" className="sr-only">Search contacts</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search name or email" className="field" />
        <button className="rounded-[var(--radius-sm)] border border-graphite px-4 font-semibold hover:bg-graphite hover:text-ivory">Search</button>
      </form>
      {contacts.length === 0 ? (
        <EmptyState title={q ? "No contacts match" : "No contacts yet"} text={q ? "Try another name or email." : "Convert a lead or add a contact to get started."} />
      ) : (
        <DataTable>
          <thead><tr><th scope="col">Name</th><th scope="col">Company</th><th scope="col">Email</th><th scope="col">Phone</th><th scope="col">Owner</th><th scope="col">Added</th></tr></thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td className="font-semibold">{[c.firstName, c.lastName].filter(Boolean).join(" ")}<span className="block font-normal text-muted">{c.jobTitle ?? ""}</span></td>
                <td>{c.company?.name ?? "—"}</td>
                <td>{c.email ? <a href={`mailto:${c.email}`} className="underline underline-offset-2">{c.email}</a> : "—"}</td>
                <td>{c.phone ?? "—"}</td>
                <td>{c.owner?.name ?? "—"}</td>
                <td className="whitespace-nowrap">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
