import { getDb } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guards";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { createUserAction, resetUserPasswordAction, updateUserAction } from "@/lib/crm/actions";
import { formatDateTime } from "@/lib/crm/format";
import { ActionForm } from "@/components/crm/ActionForm";
import { Field, PageTitle, Panel } from "@/components/crm/ui";
import { Role } from "@/generated/prisma/enums";

export const metadata = { title: "Team" };

const roleHelp: Record<Role, string> = {
  ADMIN: "Everything, including team and audit log",
  MANAGER: "All records, assigning owners, reports",
  SALES: "Only records they own or tasks assigned to them",
  VIEWER: "Read-only access to all records",
};

export default async function UsersPage() {
  const me = await requirePagePermission("users:manage");
  const users = await getDb().user.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, lockedUntil: true, _count: { select: { sessions: true } } },
  });

  return (
    <>
      <PageTitle title="Team and permissions" description="Who can sign in to the CRM and what they can do. Role changes sign the person out so new permissions apply at once." />

      <Panel title="Roles" className="mb-6">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {Object.values(Role).map((r) => (
            <div key={r}>
              <dt className="font-semibold">{ROLE_LABELS[r]}</dt>
              <dd className="text-muted">{roleHelp[r]}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <div className="space-y-3">
        {users.map((u) => (
          <details key={u.id} className="border border-line bg-white">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-5 py-3">
              <span>
                <span className="font-semibold">{u.name}</span> {u.id === me.id ? <span className="text-sm text-muted">(you)</span> : null}
                <span className="block text-sm text-muted">{u.email}</span>
              </span>
              <span className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-semibold">{ROLE_LABELS[u.role]}</span>
                {!u.isActive ? <span className="text-danger">Deactivated</span> : null}
                {u.lockedUntil && u.lockedUntil > new Date() ? <span className="text-danger">Locked</span> : null}
                <span className="text-muted">Last sign-in {formatDateTime(u.lastLoginAt)}</span>
              </span>
            </summary>
            <div className="grid gap-6 border-t border-line p-5 md:grid-cols-2">
              <ActionForm action={updateUserAction.bind(null, u.id)} submitLabel="Save access">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Role" htmlFor={`role-${u.id}`}>
                    <select id={`role-${u.id}`} name="role" defaultValue={u.role} className="field">
                      {Object.values(Role).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </Field>
                  <Field label="Access" htmlFor={`active-${u.id}`}>
                    <select id={`active-${u.id}`} name="isActive" defaultValue={String(u.isActive)} className="field">
                      <option value="true">Active</option>
                      <option value="false">Deactivated</option>
                    </select>
                  </Field>
                </div>
                <p className="mt-2 text-xs text-muted">{u._count.sessions} active {u._count.sessions === 1 ? "session" : "sessions"}</p>
              </ActionForm>
              <ActionForm action={resetUserPasswordAction.bind(null, u.id)} submitLabel="Reset password" resetOnSuccess>
                <Field label="New temporary password" htmlFor={`pw-${u.id}`} hint="At least 12 characters with a number. Signs the user out everywhere.">
                  <input id={`pw-${u.id}`} name="password" type="password" autoComplete="new-password" minLength={12} required className="field" />
                </Field>
              </ActionForm>
            </div>
          </details>
        ))}
      </div>

      <Panel title="Invite a team member" className="mt-8">
        <ActionForm action={createUserAction} submitLabel="Create account" resetOnSuccess>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="name"><input id="name" name="name" required maxLength={100} className="field" /></Field>
            <Field label="Email" htmlFor="email"><input id="email" name="email" type="email" required maxLength={200} className="field" /></Field>
            <Field label="Role" htmlFor="role">
              <select id="role" name="role" defaultValue="SALES" className="field">
                {Object.values(Role).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </Field>
            <Field label="Temporary password" htmlFor="password" hint="Share it privately. They can change it from their account page.">
              <input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required className="field" />
            </Field>
          </div>
        </ActionForm>
      </Panel>
    </>
  );
}
