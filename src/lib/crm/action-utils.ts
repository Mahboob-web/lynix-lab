import "server-only";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { ForbiddenError } from "@/lib/auth/guards";

/** Shape returned by every CRM server action (consumed by <ActionForm/> via useActionState). */
export type ActionState = { ok: boolean; message?: string } | null;

/**
 * Wraps a server action body: turns validation and permission errors into friendly messages,
 * lets Next.js redirects through, and hides unexpected errors from the browser.
 */
export async function runAction(fn: () => Promise<ActionState | void>): Promise<ActionState> {
  try {
    return (await fn()) ?? { ok: true };
  } catch (err) {
    unstable_rethrow(err);
    if (err instanceof ForbiddenError) return { ok: false, message: err.message };
    if (err instanceof z.ZodError) return { ok: false, message: err.issues.map((i) => i.message).join(" ") };
    if (err instanceof UserFacingError) return { ok: false, message: err.message };
    console.error("[crm action]", err);
    return { ok: false, message: "That didn't save because of a server error. Try again in a moment." };
  }
}

export class UserFacingError extends Error {}

/** FormData → plain object, with empty strings turned into undefined so optional fields parse cleanly. */
export function formObject(fd: FormData) {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v !== "string" || k.startsWith("$ACTION")) continue;
    const t = v.trim();
    out[k] = t === "" ? undefined : t;
  }
  return out;
}

export const zId = z.string().min(1).max(40);
export const zOptText = (max: number) => z.string().max(max, `Keep it under ${max} characters.`).optional();
export const zOptEmail = z.string().email("Enter a valid email address.").max(200).optional();
export const zOptDate = z
  .string()
  .optional()
  .transform((v, ctx) => {
    if (!v) return undefined;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: "custom", message: "Enter a valid date." });
      return z.NEVER;
    }
    return d;
  });
