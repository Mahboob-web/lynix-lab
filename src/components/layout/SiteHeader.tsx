"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // Close the mobile menu after navigation and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-line-dark bg-graphite/95 text-ivory backdrop-blur supports-[backdrop-filter]:bg-graphite/85">
      <div className="container-site flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
        <Logo tone="onDark" />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {siteConfig.navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="relative py-2 text-[0.98rem] font-medium text-ivory/80 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-ivory/60 after:transition-transform after:duration-300 hover:text-ivory hover:after:scale-x-100 aria-[current=page]:text-ivory aria-[current=page]:after:scale-x-100 aria-[current=page]:after:bg-lime"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block">
            <ButtonLink href={siteConfig.primaryCta.href} variant="lime" className="!py-2.5">
              {siteConfig.primaryCta.label}
            </ButtonLink>
          </span>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] border border-line-dark lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      <div id={menuId} hidden={!open} className="border-t border-line-dark bg-graphite lg:hidden">
        <nav aria-label="Mobile" className="container-site flex min-h-[calc(100dvh-4rem)] flex-col py-6">
          <ul className="flex flex-col">
            {[{ label: "Home", href: "/" }, ...siteConfig.navigation].map((item) => (
              <li key={item.href} className="border-b border-line-dark">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex items-center justify-between py-4 text-2xl font-bold tracking-tight aria-[current=page]:text-lime"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink href={siteConfig.primaryCta.href} variant="lime" className="mt-8 w-full">
            {siteConfig.primaryCta.label}
          </ButtonLink>
          <p className="mt-auto pt-8 text-sm text-ivory-dim">{siteConfig.contact.email}</p>
        </nav>
      </div>
    </header>
  );
}
