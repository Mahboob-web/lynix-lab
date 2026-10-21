import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ContactForm } from "@/components/sections/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: `Talk to ${siteConfig.name} about your project. ${siteConfig.contact.responseTime}`,
  alternates: { canonical: "/contact" },
};

type Props = { searchParams: Promise<{ service?: string; plan?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const { service, plan } = await searchParams;
  const { contact, contactForm } = siteConfig;
  const validService = siteConfig.services.find((s) => s.name === service)?.name ?? "";
  const planName = siteConfig.pricing.plans.find((p) => p.id === plan)?.name;
  const defaultMessage = planName ? `I'm interested in the ${planName} package.\n\n` : "";

  return (
    <section className="bg-ivory lg:bg-[linear-gradient(to_right,var(--color-graphite)_50%,var(--color-ivory)_50%)]">
      <div className="container-site grid lg:grid-cols-2">
        <div className="-mx-5 bg-graphite px-5 text-ivory md:-mx-8 md:px-8 lg:mx-0 lg:bg-transparent lg:px-0">
          <div className="py-14 md:py-20 lg:pr-16">
            <h1 className="display !text-[clamp(2.5rem,5vw,4.25rem)]">{contactForm.heading}</h1>
            <p className="lede mt-6 text-ivory/80">{contactForm.intro}</p>
            <ul className="mt-12 space-y-5">
              <li className="flex gap-4">
                <Mail className="mt-0.5 size-5 shrink-0 text-lime" aria-hidden />
                <a href={`mailto:${contact.email}`} className="font-semibold underline decoration-lime decoration-2 underline-offset-4">
                  {contact.email}
                </a>
              </li>
              {contact.phone ? (
                <li className="flex gap-4">
                  <Phone className="mt-0.5 size-5 shrink-0 text-lime" aria-hidden />
                  <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a>
                </li>
              ) : null}
              {contact.whatsapp ? (
                <li className="flex gap-4">
                  <MessageCircle className="mt-0.5 size-5 shrink-0 text-lime" aria-hidden />
                  <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    Message us on WhatsApp
                  </a>
                </li>
              ) : null}
              <li className="flex gap-4 text-ivory/80">
                <MapPin className="mt-0.5 size-5 shrink-0 text-lime" aria-hidden />
                {contact.location}
              </li>
              <li className="flex gap-4 text-ivory/80">
                <Clock className="mt-0.5 size-5 shrink-0 text-lime" aria-hidden />
                {contact.hours}
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div className="py-14 md:py-20 lg:pl-16">
            <h2 className="sr-only">Contact form</h2>
            <ContactForm defaultService={validService} defaultMessage={defaultMessage} />
          </div>
        </div>
      </div>
    </section>
  );
}
