import { siteConfig } from "@/config/site";

/**
 * A slow ticker of every service, between the hero and the services grid. Decorative (the
 * same services are listed, with links, right below it), so it is hidden from screen readers.
 * Pauses on hover; reduced-motion users see a static strip.
 */
export function ServiceMarquee() {
  const items = siteConfig.services.map((s) => s.name);
  const row = (
    <ul className="flex shrink-0 items-center">
      {items.map((name) => (
        <li key={name} className="flex items-center whitespace-nowrap">
          <span className="px-6 text-xl font-bold tracking-tight md:px-8 md:text-2xl">{name}</span>
          <span aria-hidden className="size-2.5 bg-graphite" />
        </li>
      ))}
    </ul>
  );
  return (
    <div aria-hidden className="marquee overflow-hidden border-y border-graphite bg-lime py-4 text-graphite md:py-5">
      <div className="marquee-track flex w-max">
        {row}
        {row}
      </div>
    </div>
  );
}
