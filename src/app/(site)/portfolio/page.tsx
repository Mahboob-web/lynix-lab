import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects across branding, content, websites, apps and AI automation.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  return (
    <>
      <PageHeader title="Work that ships" intro="A selection of brand, build and automation projects, with what changed for each client." />
      {siteConfig.pillars.map((pillar) => {
        const items = siteConfig.portfolio.filter((p) => p.pillar === pillar.id);
        if (items.length === 0) return null;
        return (
          <section key={pillar.id} aria-labelledby={`work-${pillar.id}`} className="container-site border-b border-line py-16 last-of-type:border-0 md:py-20">
            <div className="flex items-baseline gap-3">
              <span aria-hidden className={`size-3.5 ${pillar.id === "automate" ? "bg-lime ring-1 ring-graphite" : "bg-graphite"}`} />
              <h2 id={`work-${pillar.id}`} className="text-3xl font-bold">
                {pillar.name}
              </h2>
              <span className="text-muted">{pillar.line}</span>
            </div>
            <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </section>
        );
      })}
      <CtaBand heading="Want results like these?" />
    </>
  );
}
