"use client";

import { cn } from "@/lib/cn";

export function Switch({ checked, onChange, label, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
        checked ? "bg-accent-strong" : "bg-line",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-spring",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
