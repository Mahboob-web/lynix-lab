import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { can, ROLE_LABELS } from "@/lib/auth/permissions";
import { logoutAction } from "@/lib/crm/auth-actions";
import { LogoMark } from "@/components/brand/LogoMark";
import { CrmNav, type CrmNavItem } from "@/components/crm/CrmNav";
import { siteConfig } from "@/config/site";

// Every CRM page reads the session cookie, so nothing here is statically cached.
export const dynamic = "force-dynamic";

export default async function CrmAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const items: CrmNavItem[] = [
    { href: "/crm", label: "Dashboard", icon: "dashboard" },
    { href: "/crm/leads", label: "Leads", icon: "leads" },
    { href: "/crm/pipeline", label: "Pipeline", icon: "pipeline" },
    { href: "/crm/contacts", label: "Contacts", icon: "contacts" },
    { href: "/crm/companies", label: "Companies", icon: "companies" },
    { href: "/crm/tasks", label: "Tasks", icon: "tasks" },
    ...(can(user, "users:manage") ? [{ href: "/crm/users", label: "Team", icon: "users" } as CrmNavItem] : []),
    ...(can(user, "audit:read") ? [{ href: "/crm/audit", label: "Audit log", icon: "audit" } as CrmNavItem] : []),
  ];
  const account = (
    <div className="space-y-3 text-sm">
      <Link href="/crm/account" className="block hover:text-lime">
        <span className="block font-semibold text-ivory">{user.name}</span>
        <span className="block text-ivory-dim">{ROLE_LABELS[user.role]}, {user.email}</span>
      </Link>
      <form action={logoutAction}>
        <button type="submit" className="font-semibold text-ivory/80 underline underline-offset-4 hover:text-lime">
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
      <div className="sticky top-0 z-30 bg-graphite lg:static">
      <aside className="flex h-14 items-center justify-between bg-graphite px-4 text-ivory lg:sticky lg:top-0 lg:h-dvh lg:flex-col lg:items-stretch lg:justify-start lg:gap-8 lg:px-3 lg:py-5">
        <Link href="/crm" className="flex items-center gap-2 px-1 lg:px-3">
          <LogoMark tone="onDark" className="h-6 w-auto" />
          <span className="font-extrabold tracking-tight">{siteConfig.name}</span>
          <span className="rounded-[var(--radius-sm)] bg-graphite-2 px-1.5 py-0.5 text-xs text-ivory-dim">CRM</span>
        </Link>
        <CrmNav items={items} footer={account} />
        <div className="mt-auto hidden px-3 lg:block">{account}</div>
      </aside>
      </div>
      <main id="main" className="min-w-0 px-4 py-8 md:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
