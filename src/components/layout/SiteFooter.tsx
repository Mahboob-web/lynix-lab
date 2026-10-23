import Link from "next/link";
import { activeSocialLinks, siteConfig } from "@/config/site";
import { Logo } from "@/components/brand/Logo";
import { CurrentYear } from "@/components/ui/CurrentYear";

export function SiteFooter() {
  const social = activeSocialLinks();
  const { contact } = siteConfig;
  return (
    <footer className="bg-graphite text-ivory">
      <div className="container-site grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Logo tone="onDark" />
          <p className="tagline-spaced mt-5 text-sm text-ivory-dim">{siteConfig.tagline}</p>
          <address className="mt-8 space-y-1.5 not-italic text-ivory/85">
            <a href={`mailto:${contact.email}`} className="block text-lg font-semibold text-ivory underline decoration-lime decoration-2 underline-offset-4 hover:text-lime">
              {contact.email}
            </a>
            {contact.phone ? (
              <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="block hover:text-lime">
                {contact.phone}
              </a>
            ) : null}
            <p className="text-sm text-ivory-dim">{contact.location}</p>
          </address>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
          {siteConfig.footerNavigation.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-semibold text-ivory-dim">{group.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-ivory/90 hover:text-lime">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          {social.length > 0 ? (
            <nav aria-label="Social media">
              <h2 className="text-sm font-semibold text-ivory-dim">Follow</h2>
              <ul className="mt-4 space-y-2.5">
                {social.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-ivory/90 hover:text-lime">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </div>
      <div className="border-t border-line-dark">
        <div className="container-site flex flex-col gap-2 py-6 text-sm text-ivory-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {siteConfig.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2.5 bg-lime" />
            <span className="size-2.5 bg-ivory/40" />
            <span className="size-2.5 bg-ivory/15" />
          </div>
        </div>
      </div>
    </footer>
  );
}
