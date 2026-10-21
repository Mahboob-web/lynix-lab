import Link from "next/link";
import type { ReactNode } from "react";
import { humanize } from "@/lib/crm/format";

export function PageTitle({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ title, children, className = "", actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`border border-line bg-white ${className}`}>
      {title ? (
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
          <h2 className="font-semibold">{title}</h2>
          {actions}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

const statusTone: Record<string, string> = {
  NEW: "bg-lime text-graphite",
  CONTACTED: "bg-gray text-graphite",
  QUALIFIED: "bg-graphite text-ivory",
  PROPOSAL: "bg-graphite text-lime",
  WON: "bg-[#d9f7b0] text-[#24520a]",
  LOST: "bg-[#fde4e1] text-[#8a1c12]",
  UNQUALIFIED: "bg-[#eceeea] text-muted",
  OPEN: "bg-gray text-graphite",
  IN_PROGRESS: "bg-graphite text-ivory",
  DONE: "bg-[#d9f7b0] text-[#24520a]",
  CANCELLED: "bg-[#eceeea] text-muted",
  HIGH: "bg-[#fde4e1] text-[#8a1c12]",
  MEDIUM: "bg-gray text-graphite",
  LOW: "bg-[#eceeea] text-muted",
};

export function Badge({ value }: { value: string }) {
  return <span className={`inline-flex whitespace-nowrap rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-semibold ${statusTone[value] ?? "bg-gray text-graphite"}`}>{humanize(value)}</span>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="border border-dashed border-line bg-white px-6 py-12 text-center">
      <span aria-hidden className="mx-auto flex w-fit gap-1">
        <span className="size-3 bg-lime ring-1 ring-graphite" />
        <span className="size-3 bg-graphite" />
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LinkButton({ href, children, tone = "dark" }: { href: string; children: ReactNode; tone?: "dark" | "lime" | "outline" }) {
  const cls = {
    dark: "bg-graphite text-ivory hover:bg-graphite-2",
    lime: "bg-lime text-graphite hover:brightness-95",
    outline: "border border-line bg-white text-graphite hover:border-graphite",
  }[tone];
  return (
    <Link href={href} className={`inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-semibold ${cls}`}>
      {children}
    </Link>
  );
}

export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function Pagination({ page, pages, makeHref }: { page: number; pages: number; makeHref: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm">
      <span className="text-muted">
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? <LinkButton href={makeHref(page - 1)} tone="outline">Previous</LinkButton> : null}
        {page < pages ? <LinkButton href={makeHref(page + 1)} tone="outline">Next</LinkButton> : null}
      </div>
    </nav>
  );
}

/** Table wrapper that scrolls horizontally on small screens instead of breaking the layout. */
export function DataTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-semibold [&_th]:text-muted [&_thead]:border-b [&_thead]:border-line [&_thead]:bg-ivory [&_tr+tr]:border-t [&_tr+tr]:border-line">
        {children}
      </table>
    </div>
  );
}
