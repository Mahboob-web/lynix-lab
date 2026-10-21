import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { getAuthSecret, isProd } from "@/lib/env";
import { getRequestMeta } from "@/lib/request";
import type { AuthUser } from "./permissions";

/**
 * Database-backed sessions.
 * - The browser holds a random 256-bit token in an HttpOnly, Secure, SameSite=Lax cookie.
 * - The database stores only HMAC-SHA256(token, AUTH_SECRET), so a database leak alone can't be
 *   replayed as a login, and sessions can be revoked instantly (logout, deactivation, role change).
 * - Absolute lifetime 7 days, idle timeout 12 hours.
 */
export const SESSION_COOKIE = isProd ? "__Host-lynix_session" : "lynix_session";
const ABSOLUTE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const IDLE_TTL_MS = 12 * 60 * 60 * 1000;
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

const hashToken = (token: string) => createHmac("sha256", getAuthSecret()).update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const { ip, userAgent } = await getRequestMeta();
  const expiresAt = new Date(Date.now() + ABSOLUTE_TTL_MS);
  await getDb().session.create({ data: { tokenHash: hashToken(token), userId, expiresAt, ip, userAgent } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Current user for this request (memoised per request), or null. */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 128) return null;

  const db = getDb();
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, name: true, email: true, role: true, isActive: true } } },
  });
  if (!session) return null;

  const now = Date.now();
  const expired = session.expiresAt.getTime() < now || now - session.lastSeenAt.getTime() > IDLE_TTL_MS;
  if (expired || !session.user.isActive) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  if (now - session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await db.session.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => {});
  }
  const { id, name, email, role } = session.user;
  return { id, name, email, role };
});

export async function destroyCurrentSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await getDb().session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  jar.delete(SESSION_COOKIE);
}

/** Revoke every session for a user (password reset, deactivation, role change). */
export const revokeUserSessions = (userId: string) => getDb().session.deleteMany({ where: { userId } });
