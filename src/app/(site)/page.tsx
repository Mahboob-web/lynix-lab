import { siteConfig } from "@/config/site";
import { Hero } from "@/components/sections/Hero";
import { PillarServices } from "@/components/sections/PillarServices";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { Testimonials } from "@/components/sections/Testimonials";
import { CtaBand } from "@/components/sections/CtaBand";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

export default function HomePage() {
  const { home } = siteConfig;
  return (
    <>
      <Hero />

      <section aria-labelledby="services-heading" className="container-site py-20 md:py-28">
        <Reveal className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 id="services-heading" className="h-section md:col-span-7">
            {home.servicesHeading}
          </h2>
          <p className="lede text-muted md:col-span-5">{home.servicesIntro}</p>
        </Reveal>
        <Reveal className="mt-12" delay={0.1}>
          <PillarServices headingLevel="h3" />
        </Reveal>
      </section>

      <section aria-labelledby="process-heading" className="bg-gray">
        <div className="container-site py-20 md:py-28">
          <Reveal>
            <h2 id="process-heading" className="h-section max-w-2xl">
              {home.processHeading}
            </h2>
          </Reveal>
          <div className="mt-12">
            <ProcessSteps />
          </div>
        </div>
      </section>

      <section aria-labelledby="work-heading" className="container-site py-20 md:py-28">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="work-heading" className="h-section">
            {home.workHeading}
          </h2>
          <ButtonLink href="/portfolio" variant="outline">
            All projects
          </ButtonLink>
        </Reveal>
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {siteConfig.portfolio.slice(0, 3).map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      <Testimonials />
      <CtaBand />
    </>
  );
}
