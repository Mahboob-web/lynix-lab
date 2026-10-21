import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getPillar, getService, getServicesByPillar, siteConfig } from "@/config/site";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { ButtonLink } from "@/components/ui/Button";
import { CtaBand } from "@/components/sections/CtaBand";
import { ProjectCard } from "@/components/sections/ProjectCard";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return siteConfig.services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: `${service.name} | ${siteConfig.name}`, description: service.summary },
  };
}

export default async function ServicePage({ params }: Props) {
  const service = getService((await params).slug);
  if (!service) notFound();
  const pillar = getPillar(service.pillar)!;
  const related = getServicesByPillar(service.pillar).filter((s) => s.slug !== service.slug);
  const projects = siteConfig.portfolio.filter((p) => p.services.includes(service.name)).slice(0, 2);
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    serviceType: pillar.name,
  };

  return (
    <>
      <section className="bg-graphite text-ivory">
        <div className="container-site pb-16 pt-10 md:pb-24 md:pt-14">
          <nav aria-label="Breadcrumb" className="text-sm text-ivory-dim">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link href="/services" className="hover:text-lime">
                  Services
                </Link>
                <span aria-hidden> /</span>
              </li>
              <li>
                <Link href={`/services#${pillar.id}`} className="hover:text-lime">
                  {pillar.name}
                </Link>
                <span aria-hidden> /</span>
              </li>
              <li aria-current="page" className="text-ivory">
                {service.name}
              </li>
            </ol>
          </nav>
          <div className="mt-10 flex size-14 items-center justify-center bg-lime text-graphite">
            <ServiceIcon name={service.icon} className="size-7" />
          </div>
          <h1 className="display mt-6 max-w-4xl">{service.name}</h1>
          <p className="lede mt-6 text-ivory/80">{service.summary}</p>
          <div className="mt-9">
            <ButtonLink href={`/contact?service=${encodeURIComponent(service.name)}`} variant="lime">
              Talk to us about {service.name}
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="container-site grid gap-12 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-6">
          <h2 className="text-3xl font-bold">What it involves</h2>
          <p className="mt-4 max-w-[36rem] text-lg leading-relaxed">{service.description}</p>
          <h3 className="mt-10 text-xl font-bold">Ideal for</h3>
          <p className="mt-2 max-w-[36rem] text-muted">{service.idealFor}</p>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <h2 className="text-3xl font-bold">What you get</h2>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {service.deliverables.map((d) => (
              <li key={d} className="flex items-start gap-3 py-3.5">
                <Check className="mt-1 size-4 shrink-0" aria-hidden />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {projects.length > 0 ? (
        <section className="container-site pb-20 md:pb-28" aria-labelledby="related-work">
          <h2 id="related-work" className="text-3xl font-bold">
            Related work
          </h2>
          <div className="mt-8 grid gap-10 sm:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-gray" aria-labelledby="related-services">
        <div className="container-site py-16 md:py-20">
          <h2 id="related-services" className="text-3xl font-bold">
            More in {pillar.name}
          </h2>
          <ul className="mt-8 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <li key={s.slug} className="bg-white">
                <Link href={`/services/${s.slug}`} className="group flex h-full gap-3 p-5">
                  <ServiceIcon name={s.icon} className="mt-0.5 size-5 shrink-0" />
                  <span>
                    <span className="block font-semibold group-hover:underline group-hover:decoration-lime group-hover:decoration-2 group-hover:underline-offset-4">{s.name}</span>
                    <span className="mt-1 block text-sm text-muted">{s.summary}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
