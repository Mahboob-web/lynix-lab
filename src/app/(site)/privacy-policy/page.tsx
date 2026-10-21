import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${siteConfig.name} collects, uses and protects personal data.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPage() {
  const { privacy } = siteConfig;
  return (
    <>
      <PageHeader title="Privacy policy" intro={`Last updated ${privacy.lastUpdated}`} />
      <article className="container-site py-16 md:py-24">
        <div className="max-w-[40rem]">
          <p className="text-lg leading-relaxed">{privacy.intro}</p>
          {privacy.sections.map((s) => (
            <section key={s.heading} className="mt-12">
              <h2 className="text-2xl font-bold">{s.heading}</h2>
              <div className="mt-4 space-y-3 leading-relaxed">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </>
  );
}
