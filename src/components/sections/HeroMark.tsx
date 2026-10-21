import Link from "next/link";

/**
 * The logo mark at hero scale. Its blocks are the three pillars and slide into place once
 * on page load (disabled for reduced-motion users via globals.css).
 * Percentages come from the mark's 163 × 156 geometry.
 */
const blocks = [
  { id: "build", label: "Build", href: "/services#build", style: { left: "0%", top: "0%", width: "36.2%", height: "100%" }, tone: "ivory", from: ["-40px", "0px"], delay: 0 },
  { id: "automate", label: "Automate", href: "/services#automate", style: { left: "67.5%", top: "5.1%", width: "31.3%", height: "30.8%" }, tone: "lime", from: ["30px", "-40px"], delay: 160 },
  { id: "link", label: null, href: null, style: { left: "39.9%", top: "37.2%", width: "22.1%", height: "25.6%" }, tone: "ivory", from: ["0px", "30px"], delay: 260 },
  { id: "create", label: "Create", href: "/services#create", style: { left: "63.8%", top: "69.2%", width: "36.2%", height: "30.8%" }, tone: "ivory", from: ["40px", "20px"], delay: 360 },
] as const;

export function HeroMark() {
  return (
    <div className="relative mx-auto aspect-[163/156] w-full max-w-[17rem] sm:max-w-[22rem] lg:max-w-[26rem]">
      {blocks.map((b) => {
        const cls = `block-in absolute flex items-end p-3 sm:p-4 ${b.tone === "lime" ? "bg-lime" : "bg-ivory"} text-graphite`;
        const style = { ...b.style, ["--from-x" as string]: b.from[0], ["--from-y" as string]: b.from[1], ["--delay" as string]: `${b.delay}ms` };
        if (!b.href) return <span key={b.id} aria-hidden className={cls} style={style} />;
        return (
          <Link
            key={b.id}
            href={b.href}
            className={`${cls} group transition-[filter] hover:brightness-95`}
            style={style}
          >
            <span className="text-base font-bold leading-none tracking-tight sm:text-lg">{b.label}</span>
            <span aria-hidden className="absolute right-3 top-3 size-2 bg-graphite transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:right-4 sm:top-4" />
          </Link>
        );
      })}
    </div>
  );
}
