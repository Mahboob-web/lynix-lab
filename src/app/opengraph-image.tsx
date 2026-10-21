import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share image generated at build time from the config (no image files to maintain). */
export default function OgImage() {
  const c = siteConfig.brand.colors;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: c.graphite, color: c.ivory, padding: 80, justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ fontSize: 44, fontWeight: 800, display: "flex" }}>
            {siteConfig.name.split(" ")[0]}
            <span style={{ color: c.lime, marginLeft: 12 }}>{siteConfig.name.split(" ").slice(1).join(" ")}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>
            <span>{siteConfig.home.headline[0]}</span>
            <span style={{ color: c.lime }}>{siteConfig.home.headline[1]}</span>
          </div>
          <div style={{ fontSize: 28, letterSpacing: 8, color: c.gray }}>{siteConfig.tagline}</div>
        </div>
        <div style={{ position: "relative", width: 326, height: 312, display: "flex", alignSelf: "center" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 118, height: 312, background: c.ivory }} />
          <div style={{ position: "absolute", left: 220, top: 16, width: 102, height: 96, background: c.lime }} />
          <div style={{ position: "absolute", left: 130, top: 116, width: 72, height: 80, background: c.ivory }} />
          <div style={{ position: "absolute", left: 208, top: 216, width: 118, height: 96, background: c.ivory }} />
        </div>
      </div>
    ),
    size,
  );
}
