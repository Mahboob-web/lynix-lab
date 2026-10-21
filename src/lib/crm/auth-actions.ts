"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestMeta } from "@/lib/request";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroyCurrentSession, getCurrentUser, revokeUserSessions } from "@/lib/auth/session";
import { passwordRule } from "@/lib/validation/password";
import { formObject, runAction, UserFacingError, type ActionState } from "./action-utils";

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;
const GENERIC = "That email and password don't match an active account.";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter your work email.").max(200),
  password: z.string().min(1, "Enter your password.").max(200),
  next: z.string().optional(),
});

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  let destination = "/crm";
  const result = await runAction(async () => {
    const { email, password, next } = loginSchema.parse(formObject(fd));
    const { ip } = await getRequestMeta();

    const byIp = await rateLimit(`login:ip:${ip}`, 20, 900);
    const byEmail = await rateLimit(`login:email:${email}`, 10, 900);
    if (!byIp.allowed || !byEmail.allowed) {
      await audit("auth.login_rate_limited", { metadata: { email } });
      throw new UserFacingError("Too many sign-in attempts. Wait 15 minutes and try again.");
    }

    const db = getDb();
    const user = await db.user.findUnique({ where: { email } });

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      await audit("auth.login_locked", { actorId: user.id });
      throw new UserFacingError(`This account is locked after repeated failed attempts. Try again after ${LOCK_MINUTES} minutes.`);
    }

    const valid = await verifyPassword(password, user?.passwordHash);
    if (!user || !valid || !user.isActive) {
      if (user) {
        const failed = user.failedLoginCount + 1;
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLoginCount: failed >= MAX_FAILED ? 0 : failed,
            lockedUntil: failed >= MAX_FAILED ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
          },
        });
        await audit(failed >= MAX_FAILED ? "auth.account_locked" : "auth.login_failed", { actorId: user.id, metadata: { reason: !user.isActive ? "inactive" : "password" } });
      } else {
        await audit("auth.login_failed", { metadata: { email, reason: "unknown_email" } });
      }
      throw new UserFacingError(GENERIC);
    }

    await db.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() } });
    await createSession(user.id);
    await audit("auth.login", { actorId: user.id });
    // Only allow internal CRM redirects (prevents open-redirect abuse).
    if (next && /^\/crm(\/[\w\-/?=&%]*)?$/.test(next) && !next.startsWith("/crm/login")) destination = next;
  });
  if (result?.ok) redirect(destination);
  return result;
}

export async function logoutAction() {
  const user = await getCurrentUser();
  await destroyCurrentSession();
  if (user) await audit("auth.logout", { actorId: user.id });
  redirect("/crm/login");
}

export async function changePasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UserFacingError("Your session has expired. Sign in again.");
    const data = z
      .object({ current: z.string().min(1, "Enter your current password."), password: passwordRule, confirm: z.string() })
      .refine((d) => d.password === d.confirm, { message: "The new passwords don't match." })
      .parse(formObject(fd));
    const db = getDb();
    const record = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    if (!(await verifyPassword(data.current, record.passwordHash))) throw new UserFacingError("Your current password is incorrect.");
    await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(data.password) } });
    // Sign out every other device, then start a fresh session here.
    await revokeUserSessions(user.id);
    await createSession(user.id);
    await audit("auth.password_changed", { actorId: user.id });
    return { ok: true, message: "Password changed. Other devices have been signed out." };
  });
}

