import type { PillarId } from "@/types/site";

/**
 * Generated cover art for portfolio items without a photo: a field of blocks in the brand
 * palette, seeded by the project slug so each cover is unique but stable.
 */
function seeded(slug: string) {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) h = Math.imul(h ^ slug.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const bg: Record<PillarId, string> = {
  create: "var(--color-graphite)",
  build: "var(--color-gray)",
  automate: "var(--color-graphite)",
};

export function BlockCover({ slug, pillar, className = "" }: { slug: string; pillar: PillarId; className?: string }) {
  const rand = seeded(slug);
  const cols = 8;
  const rows = 5;
  const cells: { x: number; y: number; w: number; h: number; fill: string }[] = [];
  const dark = pillar !== "build";
  for (let i = 0; i < 9; i++) {
    const w = 1 + Math.floor(rand() * 2);
    const h = 1 + Math.floor(rand() * (i === 0 ? 4 : 2));
    const x = Math.floor(rand() * (cols - w + 1));
    const y = Math.floor(rand() * (rows - h + 1));
    const r = rand();
    const fill =
      i < 2 || r < 0.18 ? "var(--color-lime)" : dark ? (r < 0.6 ? "var(--color-ivory)" : "var(--color-graphite-3)") : r < 0.6 ? "var(--color-graphite)" : "var(--color-white)";
    cells.push({ x, y, w, h, fill });
  }
  return (
    <svg viewBox={`0 0 ${cols * 10} ${rows * 10}`} className={className} aria-hidden preserveAspectRatio="xMidYMid slice">
      <rect width={cols * 10} height={rows * 10} fill={bg[pillar]} />
      {cells.map((c, i) => (
        <rect key={i} x={c.x * 10 + 1} y={c.y * 10 + 1} width={c.w * 10 - 2} height={c.h * 10 - 2} fill={c.fill} />
      ))}
    </svg>
  );
}
