import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { LogoMark } from "@/components/brand/LogoMark";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.about.intro,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const { about, pillars } = siteConfig;
  return (
    <>
      <PageHeader title={about.heading} intro={about.intro} />

      <section className="container-site grid gap-12 py-20 md:grid-cols-12 md:py-28">
        <div className="prose-site max-w-[36rem] text-lg leading-relaxed md:col-span-7">
          {about.story.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <aside className="md:col-span-4 md:col-start-9">
          <LogoMark className="w-28" />
          <ul className="mt-10 space-y-6">
            {pillars.map((p) => (
              <li key={p.id} className="border-t border-line pt-4">
                <p className="text-xl font-bold">{p.name}</p>
                <p className="text-muted">{p.line}</p>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section aria-labelledby="values-heading" className="bg-gray">
        <div className="container-site py-20 md:py-28">
          <h2 id="values-heading" className="h-section max-w-2xl">
            How we work
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
            {about.values.map((v) => (
              <div key={v.title} className="bg-white p-6 md:p-8">
                <span aria-hidden className="block size-3 bg-lime ring-1 ring-graphite" />
                <h3 className="mt-5 text-2xl font-bold">{v.title}</h3>
                <p className="mt-2 max-w-md text-muted">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
