import type { ReactNode } from "react";

export function Tag({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" | "lime" }) {
  const styles = {
    light: "border-line text-graphite bg-white",
    dark: "border-line-dark text-ivory bg-graphite",
    lime: "border-transparent bg-lime text-graphite",
  }[tone];
  return <span className={`inline-flex items-center rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-semibold ${styles}`}>{children}</span>;
}
