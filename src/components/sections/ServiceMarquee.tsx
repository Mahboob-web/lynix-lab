"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * A slow ticker of every service, between the hero and the services grid. The moving text is
 * decorative (the same services are listed, with links, right below it), so screen readers skip it.
 * It pauses on hover, on tap, and with the pause button (keyboard users). Reduced-motion users see a
 * static strip.
 */
export function ServiceMarquee() {
  const [paused, setPaused] = useState(false);
  const items = siteConfig.services.map((s) => s.name);
  const row = (
    <ul className="flex shrink-0 items-center">
      {items.map((name) => (
        <li key={name} className="flex items-center whitespace-nowrap">
          <span className="px-6 text-xl font-bold tracking-tight md:px-8 md:text-2xl">{name}</span>
          <span aria-hidden className="size-2.5 bg-graphite" />
        </li>
      ))}
    </ul>
  );
  return (
    <div data-paused={paused} className="marquee relative border-y border-graphite bg-lime text-graphite">
      <div aria-hidden className="overflow-hidden py-4 md:py-5" onClick={() => setPaused((p) => !p)}>
        <div className="marquee-track flex w-max">
          {row}
          {row}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center bg-graphite text-lime shadow-[-28px_0_20px_4px_var(--color-lime)] transition-colors hover:bg-graphite-2 motion-reduce:hidden md:right-6"
      >
        <span className="sr-only">{paused ? "Play the services ticker" : "Pause the services ticker"}</span>
        {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
      </button>
    </div>
  );
}
