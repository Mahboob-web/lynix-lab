import Link from "next/link";
import { getServicesByPillar, siteConfig } from "@/config/site";
import Image from "next/image";
import { BrandImage, serviceImage } from "@/components/brand/BrandImage";

/** Three columns — Create, Build, Automate — each listing its services. */
export function PillarServices({ headingLevel = "h2", withAnchors = false }: { headingLevel?: "h2" | "h3"; withAnchors?: boolean }) {
  const H = headingLevel;
  return (
    <div className="depth-grid grid gap-px border border-line bg-line md:grid-cols-3">
      {siteConfig.pillars.map((pillar) => (
        <section key={pillar.id} id={withAnchors ? pillar.id : undefined} className="depth-card scroll-mt-24 bg-ivory p-6 md:p-8" aria-labelledby={`pillar-${pillar.id}`}>
          <div className="-mx-6 -mt-6 mb-7 md:-mx-8 md:-mt-8">
            <BrandImage name={pillar.id as "create" | "build" | "automate"} className="aspect-[16/10]" sizes="(min-width: 768px) 33vw, 100vw" />
          </div>
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
                  <span className="relative mt-0.5 aspect-[16/10] w-20 shrink-0 overflow-hidden bg-graphite">
                    <Image src={`/brand/${serviceImage(s.slug, pillar.id)}.png`} alt="" fill sizes="80px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  </span>
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
