import Image from "next/image";
import manifest from "@/config/brand-images.json";
import { Reveal } from "@/components/motion/Reveal";

export type BrandImageName = keyof typeof manifest.images;

/** Services that share a pillar render instead of having their own. */
const SHARED: Record<string, BrandImageName> = {
  "graphic-design": "create",
  "cloud-devops": "build",
  "business-automation": "automate",
};

/** The render for a service: its own image (named after its slug), a shared one, or its pillar's. */
export function serviceImage(slug: string, pillar: string): BrandImageName {
  if (slug in manifest.images) return slug as BrandImageName;
  if (SHARED[slug]) return SHARED[slug];
  return (pillar in manifest.images ? pillar : "key") as BrandImageName;
}

/**
 * One of the brand renders (public/brand/<name>.png, fetched at build time).
 * The renders are abstract, so they are decorative (empty alt) unless `alt` is given.
 * `parallax` drifts the image inside its frame while the frame scrolls through the viewport
 * (CSS scroll-driven animation; no JavaScript, off for reduced-motion users).
 */
export function BrandImage({
  name,
  className = "",
  sizes = "100vw",
  priority = false,
  parallax = true,
  reveal = true,
  alt = "",
}: {
  name: BrandImageName;
  className?: string;
  sizes?: string;
  priority?: boolean;
  parallax?: boolean;
  reveal?: boolean;
  alt?: string;
}) {
  const frame = (
    <div className={`relative overflow-hidden bg-graphite ${className}`}>
      <Image
        src={`/brand/${name}.png`}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${parallax ? "parallax-img" : ""}`}
      />
    </div>
  );
  return reveal ? <Reveal variant="clip">{frame}</Reveal> : frame;
}
