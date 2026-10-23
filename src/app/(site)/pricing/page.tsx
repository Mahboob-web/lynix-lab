import type { Metadata } from "next";
import { Check } from "lucide-react";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { FaqList } from "@/components/sections/FaqList";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata: Metadata = {
  title: "Pricing",
  description: siteConfig.pricing.intro,
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  const { pricing } = siteConfig;
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: pricing.currency, maximumFractionDigits: 0 });
  return (
    <>
      <PageHeader title={pricing.heading} intro={pricing.intro} />

      <section className="container-site py-20 md:py-28" aria-label="Packages">
        <div className="grid gap-6 lg:grid-cols-3">
          {pricing.plans.map((plan) => (
            <article
              key={plan.id}
              aria-labelledby={`plan-${plan.id}`}
              className={`relative flex flex-col border p-6 md:p-8 ${plan.featured ? "border-graphite bg-graphite text-ivory" : "border-line bg-white"}`}
            >
              {plan.featured ? <span aria-hidden className="absolute -right-px -top-px size-6 bg-lime" /> : null}
              <h2 id={`plan-${plan.id}`} className="text-2xl font-bold">
                {plan.name}
              </h2>
              <p className={`mt-2 ${plan.featured ? "text-ivory-dim" : "text-muted"}`}>{plan.description}</p>
              <p className="mt-8 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tight tabular-nums">{money.format(plan.price)}</span>
                <span className={plan.featured ? "text-ivory-dim" : "text-muted"}>{plan.cadence}</span>
              </p>
              <ul className="mb-10 mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className={`mt-1 size-4 shrink-0 ${plan.featured ? "text-lime" : ""}`} aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink href={`/contact?plan=${plan.id}`} variant={plan.featured ? "lime" : "dark"} className="mt-auto w-full">
                {plan.cta}
              </ButtonLink>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">{pricing.currencyNote}</p>

        <div className="mt-16 grid gap-8 border-t border-line pt-10 md:grid-cols-12">
          <h2 className="text-2xl font-bold md:col-span-4">Always included</h2>
          <ul className="grid gap-3 sm:grid-cols-2 md:col-span-8">
            {pricing.alwaysIncluded.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span aria-hidden className="mt-2 size-2 shrink-0 bg-lime ring-1 ring-graphite" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-gray" aria-labelledby="faq-heading">
        <div className="container-site grid gap-10 py-20 md:grid-cols-12 md:py-28">
          <h2 id="faq-heading" className="h-section md:col-span-4">
            Questions about pricing
          </h2>
          <div className="md:col-span-8">
            <FaqList items={pricing.faq} />
          </div>
        </div>
      </section>
      <CtaBand heading="Need something custom?" text="Larger builds, retainers and multi-service projects get a tailored quote. Tell us what you need." />
    </>
  );
}
