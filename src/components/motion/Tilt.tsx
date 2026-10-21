"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { LazyMotion, domAnimation, m, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * Gentle pointer-driven perspective tilt (max ~3.5°) with a soft lift. Mouse and pen only:
 * touch devices and reduced-motion users get a plain wrapper.
 */
export function Tilt({ children, className, max = 3.5 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 160, damping: 20, mass: 0.6 });
  const ry = useSpring(useMotionValue(0), { stiffness: 160, damping: 20, mass: 0.6 });
  const lift = useSpring(useMotionValue(0), { stiffness: 160, damping: 22, mass: 0.6 });

  if (reduce) return <div className={className}>{children}</div>;

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
    lift.set(-6);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    lift.set(0);
  };

  return (
    <LazyMotion features={domAnimation}>
      <div style={{ perspective: 900 }} className={className}>
        <m.div
          ref={ref}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          style={{ rotateX: rx, rotateY: ry, y: lift, transformStyle: "preserve-3d" }}
          className="size-full transition-shadow duration-300 hover:shadow-[0_28px_40px_-26px_rgba(23,27,25,0.55)]"
        >
          {children}
        </m.div>
      </div>
    </LazyMotion>
  );
}
