import Link from "next/link";
import { getServicesByPillar, siteConfig } from "@/config/site";
import { ServiceIcon } from "@/components/ui/ServiceIcon";

/** Three columns — Create, Build, Automate — each listing its services. */
export function PillarServices({ headingLevel = "h2", withAnchors = false }: { headingLevel?: "h2" | "h3"; withAnchors?: boolean }) {
  const H = headingLevel;
  return (
    <div className="depth-grid grid gap-px border border-line bg-line md:grid-cols-3">
      {siteConfig.pillars.map((pillar) => (
        <section key={pillar.id} id={withAnchors ? pillar.id : undefined} className="depth-card scroll-mt-24 bg-ivory p-6 md:p-8" aria-labelledby={`pillar-${pillar.id}`}>
          <div className="flex items-center gap-3">
            <span aria-hidden className={`size-4 ${pillar.id === "automate" ? "bg-lime ring-1 ring-graphite" : "bg-graphite"}`} />
            <H id={`pillar-${pillar.id}`} className="text-2xl font-bold">
              {pillar.name}
            </H>
          </div>
          <p className="mt-2 text-muted">{pillar.description}</p>
          <ul className="mt-6 divide-y divide-line border-t border-line">
            {getServicesByPillar(pillar.id).map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="group flex gap-3 py-4">
                  <ServiceIcon name={s.icon} className="mt-0.5 size-5 shrink-0 text-graphite" />
                  <span>
                    <span className="block font-semibold underline-offset-4 group-hover:underline group-hover:decoration-lime group-hover:decoration-2">{s.name}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-muted">{s.summary}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
