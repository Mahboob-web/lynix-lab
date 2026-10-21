"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Building2, ClipboardList, Inbox, LayoutDashboard, Menu, ScrollText, SquareKanban, UserCog, Users, X } from "lucide-react";

const icons = { dashboard: LayoutDashboard, leads: Inbox, pipeline: SquareKanban, contacts: Users, companies: Building2, tasks: ClipboardList, users: UserCog, audit: ScrollText };
export type CrmNavItem = { href: string; label: string; icon: keyof typeof icons };

export function CrmNav({ items, footer }: { items: CrmNavItem[]; footer: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/crm" ? pathname === "/crm" : pathname.startsWith(href));
  const list = (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const Icon = icons[item.icon];
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active(item.href) ? "page" : undefined}
              className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-ivory/75 hover:bg-graphite-2 hover:text-ivory aria-[current=page]:bg-graphite-2 aria-[current=page]:text-ivory"
            >
              <Icon className="size-4" aria-hidden />
              {item.label}
              {active(item.href) ? <span aria-hidden className="ml-auto size-1.5 bg-lime" /> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="crm-nav-mobile"
        className="inline-flex size-10 items-center justify-center rounded-[var(--radius-sm)] border border-line-dark text-ivory lg:hidden"
      >
        <span className="sr-only">{open ? "Close navigation" : "Open navigation"}</span>
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>
      <nav aria-label="CRM" className="hidden lg:block">
        {list}
      </nav>
      <div id="crm-nav-mobile" hidden={!open} className="fixed inset-x-0 bottom-0 top-14 z-40 overflow-y-auto bg-graphite p-4 lg:hidden">
        <nav aria-label="CRM mobile">{list}</nav>
        <div className="mt-6 border-t border-line-dark pt-4">{footer}</div>
      </div>
    </>
  );
}
