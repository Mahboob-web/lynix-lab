import localFont from "next/font/local";

// Source Sans 3 (variable, 200–900) — a humanist sans close to the Lynix Lab wordmark.
// Bundled from npm, so builds don't depend on Google Fonts being reachable.
export const sourceSans = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2", weight: "200 900", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-italic.woff2", weight: "200 900", style: "italic" },
  ],
  variable: "--font-source",
  display: "swap",
});
