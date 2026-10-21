import { requirePagePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { createLeadAction } from "@/lib/crm/actions";
import { humanize } from "@/lib/crm/format";
import { ActionForm } from "@/components/crm/ActionForm";
import { Field, PageTitle, Panel } from "@/components/crm/ui";
import { LeadSource } from "@/generated/prisma/enums";
import { siteConfig } from "@/config/site";

export const metadata = { title: "Add a lead" };

export default async function NewLeadPage() {
  const user = await requirePagePermission("crm:write");
  const team = can(user, "crm:assign") ? await getDb().user.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }) : [];
  return (
    <>
      <PageTitle title="Add a lead" description="For enquiries that came in by phone, email, referral or events." />
      <Panel>
        <ActionForm action={createLeadAction} submitLabel="Add lead">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="name">
              <input id="name" name="name" required maxLength={100} className="field" />
            </Field>
            <Field label="Email" htmlFor="email">
              <input id="email" name="email" type="email" required maxLength={200} className="field" />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <input id="phone" name="phone" maxLength={30} className="field" />
            </Field>
            <Field label="Company" htmlFor="companyName">
              <input id="companyName" name="companyName" maxLength={120} className="field" />
            </Field>
            <Field label="Service" htmlFor="serviceInterest">
              <select id="serviceInterest" name="serviceInterest" className="field" defaultValue="">
                <option value="">Not specified</option>
                {siteConfig.services.map((s) => (
                  <option key={s.slug}>{s.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Budget" htmlFor="budget">
              <select id="budget" name="budget" className="field" defaultValue="">
                <option value="">Not specified</option>
                {siteConfig.contactForm.budgets.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label="Source" htmlFor="source">
              <select id="source" name="source" className="field" defaultValue="REFERRAL">
                {Object.values(LeadSource).map((s) => (
                  <option key={s} value={s}>
                    {humanize(s)}
                  </option>
                ))}
              </select>
            </Field>
            {team.length > 0 ? (
              <Field label="Owner" htmlFor="ownerId">
                <select id="ownerId" name="ownerId" className="field" defaultValue={user.id}>
                  {team.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
            <div className="sm:col-span-2">
              <Field label="Notes" htmlFor="message">
                <textarea id="message" name="message" rows={4} maxLength={4000} className="field" />
              </Field>
            </div>
          </div>
        </ActionForm>
      </Panel>
    </>
  );
}
