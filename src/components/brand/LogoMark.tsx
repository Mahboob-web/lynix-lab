/**
 * The Lynix Lab mark: one tall block and three smaller blocks forming an "L/K".
 * Geometry is traced from the identity board (viewBox 163 × 156).
 */
type Tone = "onLight" | "onDark" | "mono";

const fills: Record<Tone, { base: string; accent: string }> = {
  onLight: { base: "var(--color-graphite)", accent: "var(--color-lime)" },
  onDark: { base: "var(--color-ivory)", accent: "var(--color-lime)" },
  mono: { base: "currentColor", accent: "currentColor" },
};

export function LogoMark({ tone = "onLight", className, title }: { tone?: Tone; className?: string; title?: string }) {
  const { base, accent } = fills[tone];
  return (
    <svg viewBox="0 0 163 156" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <rect x="0" y="0" width="59" height="156" fill={base} />
      <rect x="110" y="8" width="51" height="48" fill={accent} />
      <rect x="65" y="58" width="36" height="40" fill={base} />
      <rect x="104" y="108" width="59" height="48" fill={base} />
    </svg>
  );
}
