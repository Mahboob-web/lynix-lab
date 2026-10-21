import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPillar, getProject, siteConfig } from "@/config/site";
import { BlockCover } from "@/components/brand/BlockCover";
import { CtaBand } from "@/components/sections/CtaBand";
import { Tag } from "@/components/ui/Tag";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return siteConfig.portfolio.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return { title: project.title, description: project.summary, alternates: { canonical: `/portfolio/${project.slug}` } };
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const pillar = getPillar(project.pillar)!;
  const serviceLinks = project.services.map((name) => siteConfig.services.find((s) => s.name === name)).filter(Boolean);
  const sections = [
    { heading: "The challenge", body: project.challenge },
    { heading: "What we did", body: project.solution },
    { heading: "The result", body: project.outcome },
  ];
  return (
    <>
      <section className="bg-graphite text-ivory">
        <div className="container-site pb-12 pt-10 md:pt-14">
          <Link href="/portfolio" className="text-sm text-ivory-dim hover:text-lime">
            All work
          </Link>
          <p className="mt-8 text-ivory-dim">
            {project.client}, {project.year}
          </p>
          <h1 className="display mt-3 max-w-4xl !text-[clamp(2.25rem,5.5vw,4.25rem)]">{project.title}</h1>
          {project.sample ? (
            <p className="mt-5">
              <Tag tone="dark">Sample project</Tag>
            </p>
          ) : null}
        </div>
      </section>
      <div className="bg-graphite">
        <div className="container-site">
          <div className="relative aspect-[21/9] overflow-hidden">
            {project.image ? (
              <Image src={project.image} alt="" fill priority sizes="100vw" className="object-cover" />
            ) : (
              <BlockCover slug={project.slug} pillar={project.pillar} className="size-full" />
            )}
          </div>
        </div>
      </div>

      <section className="container-site grid gap-12 py-20 md:grid-cols-12 md:py-24">
        <aside className="md:col-span-4">
          <dl className="space-y-6 border-t border-line pt-6">
            <div>
              <dt className="text-sm text-muted">Pillar</dt>
              <dd className="mt-1 font-semibold">{pillar.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Services</dt>
              <dd className="mt-1">
                <ul className="space-y-1">
                  {serviceLinks.map((s) => (
                    <li key={s!.slug}>
                      <Link href={`/services/${s!.slug}`} className="font-semibold underline decoration-lime decoration-2 underline-offset-4 hover:decoration-graphite">
                        {s!.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </aside>
        <div className="space-y-12 md:col-span-7 md:col-start-6">
          <p className="text-2xl font-semibold leading-snug">{project.summary}</p>
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-2xl font-bold">{s.heading}</h2>
              <p className="mt-3 max-w-[36rem] text-lg leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
      <CtaBand heading="Have a similar project?" />
    </>
  );
}
