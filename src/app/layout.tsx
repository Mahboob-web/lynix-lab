import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site";
import { sourceSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name}: ${siteConfig.tagline}`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: "/",
    title: `${siteConfig.name}: ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: siteConfig.brand.colors.graphite,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const c = siteConfig.brand.colors;
  // Brand colours from the config become CSS variables used by Tailwind's theme.
  const brandVars = {
    "--brand-graphite": c.graphite,
    "--brand-lime": c.lime,
    "--brand-ivory": c.ivory,
    "--brand-gray": c.gray,
    "--brand-white": c.white,
    "--brand-muted": c.muted,
  } as CSSProperties;

  return (
    <html lang="en" className={sourceSans.variable} style={brandVars}>
      <body>{children}</body>
    </html>
  );
}
