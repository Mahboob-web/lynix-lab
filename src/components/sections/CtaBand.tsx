import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";

export function CtaBand({ heading = siteConfig.home.ctaHeading, text = siteConfig.home.ctaText }: { heading?: string; text?: string }) {
  return (
    <section className="bg-lime text-graphite" aria-labelledby="cta-heading">
      <div className="container-site grid items-end gap-8 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-8">
          <h2 id="cta-heading" className="h-section">
            {heading}
          </h2>
          <p className="lede mt-5">{text}</p>
        </div>
        <div className="flex flex-col gap-3 md:col-span-4 md:items-end">
          <ButtonLink href={siteConfig.primaryCta.href} variant="dark">
            {siteConfig.primaryCta.label}
          </ButtonLink>
          <a href={`mailto:${siteConfig.contact.email}`} className="font-semibold underline decoration-2 underline-offset-4">
            or email {siteConfig.contact.email}
          </a>
        </div>
      </div>
    </section>
  );
}
