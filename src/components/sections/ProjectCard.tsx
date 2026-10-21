import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/site";
import { getPillar } from "@/config/site";
import { BlockCover } from "@/components/brand/BlockCover";
import { Tag } from "@/components/ui/Tag";

export function ProjectCard({ project, headingLevel = "h3" }: { project: Project; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden border border-line">
        {project.image ? (
          <Image src={project.image} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <BlockCover slug={project.slug} pillar={project.pillar} className="size-full transition-transform duration-500 group-hover:scale-[1.03]" />
        )}
        {project.sample ? (
          <span className="absolute left-3 top-3">
            <Tag>Sample project</Tag>
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-sm text-muted">
        {project.client}, {project.year}
      </p>
      <H className="mt-1 text-xl font-bold leading-snug">
        <Link href={`/portfolio/${project.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-lime group-hover:decoration-2 group-hover:underline-offset-4">
          {project.title}
        </Link>
      </H>
      <p className="mt-2 text-[0.98rem] text-muted">{project.summary}</p>
      <p className="mt-3 text-sm font-semibold">{getPillar(project.pillar)?.name}: {project.services.join(", ")}</p>
    </article>
  );
}
