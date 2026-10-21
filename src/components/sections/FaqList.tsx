import { Plus } from "lucide-react";
import type { FaqItem } from "@/types/site";

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.question} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
            {item.question}
            <Plus aria-hidden className="size-5 shrink-0 transition-transform group-open:rotate-45" />
          </summary>
          <p className="max-w-2xl pb-5 text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
