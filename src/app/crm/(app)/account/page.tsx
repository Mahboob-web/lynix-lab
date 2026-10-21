import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { changePasswordAction } from "@/lib/crm/auth-actions";
import { formatDateTime } from "@/lib/crm/format";
import { ActionForm } from "@/components/crm/ActionForm";
import { Field, PageTitle, Panel } from "@/components/crm/ui";

export const metadata = { title: "Your account" };

export default async function AccountPage() {
  const user = await requireUser();
  const sessions = await getDb().session.findMany({ where: { userId: user.id }, orderBy: { lastSeenAt: "desc" }, select: { id: true, lastSeenAt: true, ip: true, userAgent: true } });
  return (
    <>
      <PageTitle title="Your account" description={`${user.email}, ${ROLE_LABELS[user.role]}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Change password">
          <ActionForm action={changePasswordAction} submitLabel="Change password" resetOnSuccess>
            <div className="space-y-3">
              <Field label="Current password" htmlFor="current"><input id="current" name="current" type="password" autoComplete="current-password" required className="field" /></Field>
              <Field label="New password" htmlFor="password" hint="At least 12 characters, including a number."><input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required className="field" /></Field>
              <Field label="Repeat new password" htmlFor="confirm"><input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required className="field" /></Field>
            </div>
          </ActionForm>
        </Panel>
        <Panel title="Signed-in devices">
          <ul className="divide-y divide-line text-sm">
            {sessions.map((s) => (
              <li key={s.id} className="py-2.5">
                <span className="block truncate">{s.userAgent ?? "Unknown device"}</span>
                <span className="text-muted">{s.ip}, last active {formatDateTime(s.lastSeenAt)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Changing your password signs out every other device.</p>
        </Panel>
      </div>
    </>
  );
}
