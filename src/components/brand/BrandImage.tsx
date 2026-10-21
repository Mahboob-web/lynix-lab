import Image from "next/image";
import manifest from "@/config/brand-images.json";
import { Reveal } from "@/components/motion/Reveal";

export type BrandImageName = keyof typeof manifest.images;

/** The photo for a service: its own (named after its slug), else its pillar's. */
export function serviceImage(slug: string, pillar: string): BrandImageName {
  if (slug in manifest.images) return slug as BrandImageName;
  return (pillar in manifest.images ? pillar : "key") as BrandImageName;
}

/**
 * One of the site photos (public/brand/<name>.jpg, fetched at build time, see brand-images.json).
 * Decorative by default (empty alt): the text next to each photo already says what it shows.
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
        src={`/brand/${name}.jpg`}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`photo object-cover ${parallax ? "parallax-img" : ""}`}
      />
    </div>
  );
  return reveal ? <Reveal variant="clip">{frame}</Reveal> : frame;
}
