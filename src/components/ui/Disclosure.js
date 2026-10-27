"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Collapsible section. Height animates with the grid-rows 0fr → 1fr technique,
 * so content is never measured in JavaScript.
 */
export function Disclosure({ title, summary, defaultOpen = false, children, className }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className={cn("rounded-[22px] bg-chip transition-shadow duration-200", open && "shadow-soft", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-full items-center gap-2 rounded-[22px] px-4 text-left"
      >
        <span className="flex-1 text-center text-[15px] font-medium">{title}</span>
        {summary && !open ? (
          <span className="max-w-24 truncate text-[11px] text-muted">{summary}</span>
        ) : null}
        <ChevronDown
          aria-hidden
          className={cn("size-4 text-muted transition-transform duration-300", open && "rotate-180")}
        />
      </button>
      <div
        id={id}
        role="region"
        aria-label={title}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out-soft",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
