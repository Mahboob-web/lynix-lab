import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { PillarServices } from "@/components/sections/PillarServices";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata: Metadata = {
  title: "Services",
  description: `${siteConfig.services.length} services across creative, development and AI automation: ${siteConfig.services
    .slice(0, 6)
    .map((s) => s.name.toLowerCase())
    .join(", ")} and more.`,
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        title="Everything you need to launch, grow and automate"
        intro="Choose a single service or combine several. Each one is scoped and priced on its own, and built to connect with the rest."
      >
        <nav aria-label="Service groups" className="mt-10 flex flex-wrap gap-3">
          {siteConfig.pillars.map((p) => (
            <a key={p.id} href={`#${p.id}`} className="inline-flex items-center gap-2 border border-line-dark px-4 py-2 font-semibold hover:border-lime hover:text-lime">
              <span aria-hidden className={`size-2.5 ${p.id === "automate" ? "bg-lime" : "bg-ivory"}`} />
              {p.name}
            </a>
          ))}
        </nav>
      </PageHeader>

      <section className="container-site py-20 md:py-28" aria-label="All services">
        <PillarServices withAnchors />
      </section>

      <section aria-labelledby="process-heading" className="bg-gray">
        <div className="container-site py-20 md:py-28">
          <h2 id="process-heading" className="h-section max-w-2xl">
            {siteConfig.home.processHeading}
          </h2>
          <div className="mt-12">
            <ProcessSteps />
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
