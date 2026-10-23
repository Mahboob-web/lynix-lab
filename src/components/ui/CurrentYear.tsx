"use client";

import { useEffect, useState } from "react";

/**
 * The current year. Pages are prerendered, so a server-rendered year would freeze at build time;
 * this shows the build year in the HTML and corrects it in the browser.
 */
export function CurrentYear() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <span suppressHydrationWarning>{year}</span>;
}
