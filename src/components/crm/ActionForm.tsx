"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent, type ReactNode } from "react";

export type ActionState = { ok: boolean; message?: string } | null;
type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Form wrapper for CRM server actions: shows pending state and the action's result message.
 * Validation and permissions are enforced on the server; this only presents the outcome.
 * Submits via onSubmit (not the `action` prop) so React doesn't clear the user's input when
 * the server rejects it; fields are reset only on success when `resetOnSuccess` is set.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  className = "",
  resetOnSuccess = false,
  buttonClassName = "",
  inline = false,
}: {
  action: Action;
  children?: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  className?: string;
  resetOnSuccess?: boolean;
  buttonClassName?: string;
  inline?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={ref}
      className={className}
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      {children}
      <div className={`flex flex-wrap items-center gap-3 ${inline ? "" : "mt-4"}`}>
        <button
          type="submit"
          disabled={pending}
          className={`inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-graphite px-4 py-2 text-sm font-semibold text-ivory hover:bg-graphite-2 disabled:opacity-60 ${buttonClassName}`}
        >
          {pending ? pendingLabel : submitLabel}
        </button>
        {state?.message ? (
          <p role={state.ok ? "status" : "alert"} className={`text-sm font-medium ${state.ok ? "text-success" : "text-danger"}`}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
