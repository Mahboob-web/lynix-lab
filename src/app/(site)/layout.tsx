import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { siteConfig } from "@/config/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.contact.email,
    ...(siteConfig.contact.phone ? { telephone: siteConfig.contact.phone } : {}),
    description: siteConfig.description,
    slogan: siteConfig.tagline,
    sameAs: siteConfig.social.filter((s) => s.href).map((s) => s.href),
  };
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-lime focus:px-4 focus:py-2 focus:font-semibold focus:text-graphite"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
