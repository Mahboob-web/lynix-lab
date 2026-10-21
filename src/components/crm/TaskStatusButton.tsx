"use client";

import { useTransition, useState } from "react";
import { setTaskStatusAction } from "@/lib/crm/actions";
import type { TaskStatus } from "@/generated/prisma/enums";

export function TaskStatusButton({ taskId, status, label }: { taskId: string; status: TaskStatus; label: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await setTaskStatusAction(taskId, status);
            setError(res && !res.ok ? res.message ?? "That didn't save." : null);
          })
        }
        className="rounded-[var(--radius-sm)] border border-graphite px-2.5 py-1 text-xs font-semibold hover:bg-graphite hover:text-ivory disabled:opacity-50"
      >
        {pending ? "Saving…" : label}
      </button>
      {error ? (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      ) : null}
    </span>
  );
}
