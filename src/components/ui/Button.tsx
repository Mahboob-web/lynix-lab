import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "lime" | "dark" | "outline" | "outlineLight" | "ghost";

const base =
  "group inline-flex items-center justify-center gap-3 rounded-[var(--radius-sm)] px-5 py-3 text-[1rem] font-semibold leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  lime: "bg-lime text-graphite hover:bg-ivory",
  dark: "bg-graphite text-ivory hover:bg-graphite-2",
  outline: "border border-graphite text-graphite hover:bg-graphite hover:text-ivory",
  outlineLight: "border border-ivory/50 text-ivory hover:border-ivory hover:bg-ivory hover:text-graphite",
  ghost: "text-graphite underline decoration-2 underline-offset-4 hover:decoration-lime px-0",
};

/** A small square that nudges on hover — the brand's "block" in place of an arrow. */
function Block({ variant }: { variant: Variant }) {
  if (variant === "ghost") return null;
  const color = variant === "lime" ? "bg-graphite" : variant === "dark" ? "bg-lime" : "bg-current";
  return <span aria-hidden className={`size-2 shrink-0 ${color} transition-transform group-hover:translate-x-1`} />;
}

export function ButtonLink({
  href,
  variant = "dark",
  children,
  className = "",
  ...rest
}: { href: string; variant?: Variant; children: ReactNode; className?: string } & Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
      <Block variant={variant} />
    </Link>
  );
}

export function Button({
  variant = "dark",
  children,
  className = "",
  ...rest
}: { variant?: Variant; children: ReactNode; className?: string } & ComponentProps<"button">) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
      <Block variant={variant} />
    </button>
  );
}
