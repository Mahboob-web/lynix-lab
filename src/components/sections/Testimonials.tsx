import { siteConfig } from "@/config/site";
import { Tag } from "@/components/ui/Tag";

export function Testimonials() {
  const items = siteConfig.testimonials;
  if (items.length === 0) return null;
  return (
    <section className="bg-graphite text-ivory" aria-labelledby="testimonials-heading">
      <div className="container-site py-20 md:py-28">
        <h2 id="testimonials-heading" className="h-section max-w-2xl">
          {siteConfig.home.testimonialsHeading}
        </h2>
        <div className="mt-12 grid gap-px bg-line-dark md:grid-cols-3">
          {items.map((t, i) => (
            <figure key={i} className="flex flex-col bg-graphite p-6 md:p-8">
              <span aria-hidden className="mb-6 flex gap-1">
                <span className="size-3 bg-lime" />
                <span className="size-3 bg-ivory/30" />
              </span>
              <blockquote className="text-lg leading-relaxed text-ivory/90">“{t.quote}”</blockquote>
              <figcaption className="mt-auto pt-8">
                <span className="block font-semibold">{t.name}</span>
                <span className="block text-sm text-ivory-dim">{t.role}</span>
                {t.placeholder ? (
                  <span className="mt-3 inline-block">
                    <Tag tone="dark">Sample</Tag>
                  </span>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
