import "server-only";
import { headers } from "next/headers";
import { env } from "./env";

/** Client IP and user agent. Hostinger (and most hosts) sit behind a proxy that sets X-Forwarded-For. */
export async function getRequestMeta() {
  const h = await headers();
  let ip: string | null = null;
  if (env.TRUST_PROXY === "true") {
    // Read from the right: entries on the left can be forged by the client, the ones appended
    // by our own proxies cannot. This stops rate-limit bypass via a spoofed header.
    const chain = (h.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    ip = chain[chain.length - env.TRUSTED_PROXY_HOPS] ?? chain[0] ?? h.get("x-real-ip") ?? null;
  }
  const userAgent = h.get("user-agent")?.slice(0, 300) ?? null;
  return { ip: ip ?? "unknown", userAgent };
}

/**
 * Same-origin check for route handlers (Server Actions already do this automatically).
 * Rejects cross-site POSTs, which blocks CSRF from other websites.
 */
export async function isSameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
