import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";
import { can, type AuthUser, type Permission } from "./permissions";

export class ForbiddenError extends Error {
  constructor(message = "You don't have permission to do that.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** For pages and layouts: redirect to the login page if signed out. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/crm/login");
  return user;
}

/** For pages: signed-in users without the permission get the 403 page. */
export async function requirePagePermission(permission: Permission): Promise<AuthUser> {
  const user = await requireUser();
  if (!can(user, permission)) redirect("/crm/forbidden");
  return user;
}

/** For server actions: throws so the action returns an error instead of mutating. */
export async function requirePermission(permission: Permission): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError("Your session has expired. Sign in again.");
  if (!can(user, permission)) throw new ForbiddenError();
  return user;
}
