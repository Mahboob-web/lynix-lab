import "server-only";
import { z } from "zod";

/**
 * Server-side environment, validated once. Secrets are only read here and never sent to the browser.
 * Missing DATABASE_URL is tolerated so the public site still renders; features that need the
 * database report a clear error instead.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters").optional(),
  LEAD_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
  TRUST_PROXY: z.enum(["true", "false"]).default("true"),
  // Number of reverse proxies in front of the app that append to X-Forwarded-For (Hostinger: 1).
  TRUSTED_PROXY_HOPS: z.coerce.number().int().min(1).max(5).default(1),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Fail loudly with field names only — never print values.
  const fields = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  throw new Error(`Invalid environment configuration — ${fields}`);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";

/** Returns AUTH_SECRET or throws — the CRM must not run without it in production. */
export function getAuthSecret(): string {
  if (env.AUTH_SECRET) return env.AUTH_SECRET;
  if (isProd) throw new Error("AUTH_SECRET is not set. Generate one with: openssl rand -base64 48");
  return "dev-only-insecure-secret-change-me-0000000000";
}
