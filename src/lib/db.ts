import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "./env";

/**
 * One Prisma client per server process. In development, Next.js hot reload would otherwise
 * create a new connection pool on every change.
 */
const globalForPrisma = globalThis as unknown as { prisma?: InstanceType<typeof PrismaClient> };

function createClient() {
  if (!env.DATABASE_URL) {
    throw new DatabaseNotConfiguredError();
  }
  const adapter = new PrismaPg({
    connectionString: withLibpqSslSemantics(env.DATABASE_URL),
    // Small pool: Hostinger web apps are a single modest process, and managed Postgres
    // free tiers cap connections. Raise if you move to a VPS.
    max: Number(process.env.DATABASE_POOL_MAX ?? (process.env.VERCEL ? 1 : 5)),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  return new PrismaClient({ adapter, log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });
}

/**
 * node-postgres treats `sslmode=require` as full certificate verification, which fails against
 * managed poolers (e.g. Supabase) whose CA isn't in Node's trust store. `uselibpqcompat=true`
 * restores the standard libpq meaning: the connection is encrypted, as with psql.
 * To verify the server certificate too, set `sslmode=verify-full&sslrootcert=/path/ca.crt` yourself;
 * this only changes URLs that say `sslmode=require` and don't already choose a behaviour.
 */
function withLibpqSslSemantics(url: string) {
  if (!/[?&]sslmode=require\b/.test(url) || /[?&]uselibpqcompat=/.test(url)) return url;
  return `${url}&uselibpqcompat=true`;
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not configured");
    this.name = "DatabaseNotConfiguredError";
  }
}

export function getDb() {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
  return globalForPrisma.prisma;
}

export const isDbConfigured = () => Boolean(env.DATABASE_URL);
