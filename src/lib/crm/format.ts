/** Display helpers shared by CRM pages (safe on server and client). */
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export const formatDate = (d?: Date | string | null) => (d ? dateFmt.format(new Date(d)) : "—");
export const formatDateTime = (d?: Date | string | null) => (d ? dateTimeFmt.format(new Date(d)) : "—");

export function formatMoney(value: number | string | { toString(): string } | null | undefined, currency = "USD") {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

export function timeAgo(d: Date | string) {
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24);
  return days < 30 ? `${days} d ago` : formatDate(d);
}

export const humanize = (v: string) => v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, " ");

/** <input type="date"> value from a Date. */
export const toDateInput = (d?: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");
