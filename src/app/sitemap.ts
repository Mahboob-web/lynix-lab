import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();
  const pages = ["", "/services", "/portfolio", "/pricing", "/about", "/contact", "/privacy-policy"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 })),
    ...siteConfig.services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...siteConfig.portfolio.map((p) => ({ url: `${base}/portfolio/${p.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
