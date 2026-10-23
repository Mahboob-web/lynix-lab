import Link from "next/link";
import { siteConfig } from "@/config/site";
import { LogoMark } from "./LogoMark";

/** Mark + wordmark. The last word of the name is set in lime, as on the identity board. */
export function Logo({ tone = "onLight", className = "" }: { tone?: "onLight" | "onDark"; className?: string }) {
  const parts = siteConfig.name.split(" ");
  const last = parts.length > 1 ? parts.pop() : "";
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label={`${siteConfig.name} home`}>
      <LogoMark tone={tone} className="h-7 w-auto" />
      <span
        translate="no"
        className={`text-[1.375rem] font-extrabold whitespace-nowrap leading-none tracking-[-0.04em] ${tone === "onDark" ? "text-ivory" : "text-graphite"}`}
      >
        {parts.join(" ")}
        {last ? <span className="text-lime"> {last}</span> : null}
      </span>
    </Link>
  );
}
