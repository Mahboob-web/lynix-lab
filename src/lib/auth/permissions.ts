/**
 * Role-based access control.
 *
 *  ADMIN   – everything, including users and the audit log
 *  MANAGER – read/write all CRM records, assign owners, see reports
 *  SALES   – read/write only records they own or tasks assigned to them
 *  VIEWER  – read-only access to all CRM records
 *
 * Add a permission here, then check it with `requirePermission()` (server) or `can()` (UI).
 * This file has no server-only imports so the UI can use `can()` to hide buttons — the server
 * always re-checks.
 */
import type { Role } from "@/generated/prisma/enums";

export const PERMISSIONS = [
  "crm:read",
  "crm:write",
  "crm:delete",
  "crm:assign",
  "reports:read",
  "users:manage",
  "audit:read",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const matrix: Record<Role, readonly Permission[]> = {
  ADMIN: PERMISSIONS,
  MANAGER: ["crm:read", "crm:write", "crm:assign", "reports:read"],
  SALES: ["crm:read", "crm:write"],
  VIEWER: ["crm:read", "reports:read"],
};

export type AuthUser = { id: string; role: Role; name: string; email: string };

export const can = (user: Pick<AuthUser, "role"> | null | undefined, permission: Permission) =>
  Boolean(user && matrix[user.role]?.includes(permission));

/** SALES users only see their own records. Everyone else sees all records. */
export const isOwnScopeOnly = (user: Pick<AuthUser, "role">) => user.role === "SALES";

/** Prisma `where` fragment that enforces data isolation on owned records. */
export function ownerScope(user: AuthUser): { ownerId?: string } {
  return isOwnScopeOnly(user) ? { ownerId: user.id } : {};
}

/** Task visibility: SALES see tasks assigned to or created by them. */
export function taskScope(user: AuthUser) {
  return isOwnScopeOnly(user) ? { OR: [{ assigneeId: user.id }, { createdById: user.id }] } : {};
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  SALES: "Sales",
  VIEWER: "Viewer",
};
