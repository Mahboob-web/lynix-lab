import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "./db";
import { getRequestMeta } from "./request";

/**
 * Append a security audit entry. Never include passwords, tokens or full message bodies in metadata.
 * Failures are logged but never break the user's action.
 */
export async function audit(
  action: string,
  opts: { actorId?: string | null; entityType?: string; entityId?: string; metadata?: Prisma.InputJsonValue } = {},
) {
  try {
    const { ip, userAgent } = await getRequestMeta();
    await getDb().auditLog.create({
      data: {
        action,
        actorId: opts.actorId ?? null,
        entityType: opts.entityType,
        entityId: opts.entityId,
        metadata: opts.metadata,
        ip,
        userAgent,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log", action, err instanceof Error ? err.message : err);
  }
}
