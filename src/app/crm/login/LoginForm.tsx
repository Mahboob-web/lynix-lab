"use client";

import { startTransition, useActionState } from "react";
import { loginAction } from "@/lib/crm/auth-actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        // Submit manually so a failed attempt keeps the email the user typed.
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label htmlFor="email" className="label">
          Work email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state?.message ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="w-full rounded-[var(--radius-sm)] bg-graphite px-4 py-3 font-semibold text-ivory hover:bg-graphite-2 disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
