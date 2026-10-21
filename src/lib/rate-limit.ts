import "server-only";
import { getDb } from "./db";

/**
 * Fixed-window rate limiter stored in PostgreSQL, so limits hold across restarts and
 * multiple app instances (Hostinger may stop idle apps and start them again on demand).
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const db = getDb();
  const rows = await db.$queryRaw<{ count: number; expiresAt: Date }[]>`
    INSERT INTO "RateLimit" ("key", "count", "expiresAt")
    VALUES (${key}, 1, NOW() + make_interval(secs => ${windowSeconds}))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."expiresAt" < NOW() THEN 1 ELSE "RateLimit"."count" + 1 END,
      "expiresAt" = CASE WHEN "RateLimit"."expiresAt" < NOW() THEN NOW() + make_interval(secs => ${windowSeconds}) ELSE "RateLimit"."expiresAt" END
    RETURNING "count", "expiresAt"`;
  const row = rows[0];

  // Opportunistic cleanup (about 1 in 50 calls) keeps the table small without a cron job.
  if (Math.random() < 0.02) {
    db.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {});
  }

  const retryAfter = Math.max(0, Math.ceil((row.expiresAt.getTime() - Date.now()) / 1000));
  return { allowed: row.count <= limit, remaining: Math.max(0, limit - row.count), retryAfter };
}
