"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import type { SlabId } from "@/components/three/HeroScene";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

/**
 * The logo mark at hero scale. Its blocks are the three pillars and slide into place once on
 * page load. Percentages come from the mark's 163 × 156 geometry.
 *
 * Progressive enhancement: this flat, link-bearing version always renders first (server HTML,
 * no JavaScript needed). On capable devices the 3D scene is loaded after the page is idle and
 * fades in behind the same links, which stay as the real, keyboard-focusable controls.
 */
const blocks = [
  { id: "build", label: "Build", href: "/services#build", style: { left: "0%", top: "0%", width: "36.2%", height: "100%" }, tone: "ivory", from: ["-40px", "0px"], delay: 0 },
  { id: "automate", label: "Automate", href: "/services#automate", style: { left: "67.5%", top: "5.1%", width: "31.3%", height: "30.8%" }, tone: "lime", from: ["30px", "-40px"], delay: 160 },
  { id: "link", label: null, href: null, style: { left: "39.9%", top: "37.2%", width: "22.1%", height: "25.6%" }, tone: "ivory", from: ["0px", "30px"], delay: 260 },
  { id: "create", label: "Create", href: "/services#create", style: { left: "63.8%", top: "69.2%", width: "36.2%", height: "30.8%" }, tone: "ivory", from: ["40px", "20px"], delay: 360 },
] as const;

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function canUse3D() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory && nav.deviceMemory <= 2) return false;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function readColors() {
  const cs = getComputedStyle(document.documentElement);
  const ivory = cs.getPropertyValue("--brand-ivory").trim() || "#f5f7ef";
  const lime = cs.getPropertyValue("--brand-lime").trim() || "#a7f51b";
  return { ivory, lime };
}

export function HeroMark() {
  const wrap = useRef<HTMLDivElement>(null);
  const [wanted, setWanted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState<SlabId | null>(null);
  const [coarse, setCoarse] = useState(false);
  const [colors, setColors] = useState({ ivory: "#f5f7ef", lime: "#a7f51b" });

  // Decide after hydration, and load the (heavy) 3D chunk only once the page is idle.
  useEffect(() => {
    if (!canUse3D()) return;
    setColors(readColors());
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
    const start = () => setWanted(true);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback && w.cancelIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = setTimeout(start, 900);
    return () => clearTimeout(id);
  }, []);

  // Stop rendering when the hero is off screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el || !wanted) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, [wanted]);

  const on3D = wanted && !failed;

  return (
    <div ref={wrap} className="relative mx-auto aspect-[163/156] w-full max-w-[17rem] sm:max-w-[22rem] lg:max-w-[26rem]">
      {on3D ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[-12%] transition-opacity duration-700"
          style={{ opacity: ready ? 1 : 0 }}
        >
          <SceneBoundary onError={() => setFailed(true)}>
            <HeroScene colors={colors} hovered={hovered} active={visible} coarse={coarse} onReady={() => setReady(true)} onFail={() => setFailed(true)} />
          </SceneBoundary>
        </div>
      ) : null}

      {blocks.map((b) => {
        const flat = on3D && ready; // the 3D slab now provides the surface; keep only the label
        const fill = b.tone === "lime" ? "bg-lime" : "bg-ivory";
        const cls = `block-in absolute z-10 flex items-end p-3 sm:p-4 text-graphite transition-[background-color,filter] duration-700 ${flat ? "bg-transparent" : fill}`;
        const style = { ...b.style, ["--from-x" as string]: b.from[0], ["--from-y" as string]: b.from[1], ["--delay" as string]: `${b.delay}ms` };
        if (!b.href) return <span key={b.id} aria-hidden className={cls} style={style} />;
        return (
          <Link
            key={b.id}
            href={b.href}
            className={`${cls} group ${flat ? "" : "hover:brightness-95"}`}
            style={style}
            onPointerEnter={() => setHovered(b.id)}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setHovered(b.id)}
            onBlur={() => setHovered(null)}
          >
            <span className="text-base font-bold leading-none tracking-tight sm:text-lg">{b.label}</span>
            <span aria-hidden className="absolute right-3 top-3 size-2 bg-graphite transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:right-4 sm:top-4" />
          </Link>
        );
      })}
    </div>
  );
}
