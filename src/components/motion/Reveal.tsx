"use client";

import type { ReactNode } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

type Tag = "div" | "section" | "li" | "span" | "p" | "article";

/**
 * Scroll reveal, the one entrance used below the fold.
 *  - "rise": fade + short upward move (text, cards)
 *  - "clip": a wipe from the top edge (images / project covers)
 * Plays once. Does nothing for reduced-motion users. Above-the-fold content uses the CSS
 * `.rise-in` utility instead so it is never hidden waiting for JavaScript.
 */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  variant = "rise",
  as = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  variant?: "rise" | "clip";
  as?: Tag;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const Comp = m[as] as typeof m.div;

  if (reduce) return <Comp className={className}>{children}</Comp>;

  const hidden = variant === "clip" ? { clipPath: "inset(0 0 100% 0)" } : { opacity: 0, y };
  const shown = variant === "clip" ? { clipPath: "inset(0 0 0% 0)" } : { opacity: 1, y: 0 };

  return (
    <LazyMotion features={domAnimation} strict>
      <Comp
        data-reveal=""
        className={className}
        initial={hidden}
        whileInView={shown}
        viewport={{ once: true, margin: "0px 0px -12% 0px" }}
        transition={{ duration: variant === "clip" ? 0.95 : 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {children}
      </Comp>
    </LazyMotion>
  );
}
