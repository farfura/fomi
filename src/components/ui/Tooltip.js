import { useId } from "react";
import { cn } from "@/lib/cn";

const SIDES = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

/**
 * CSS-only tooltip: appears on hover and keyboard focus, never blocks clicks,
 * and is linked with aria-describedby. Content must be supplementary, not essential.
 */
export function Tooltip({ content, side = "bottom", shortcut, className, children }) {
  const id = useId();
  if (!content) return children;
  return (
    <span className={cn("group/tooltip relative inline-flex", className)} aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-bg shadow-float",
          "opacity-0 transition-opacity duration-150",
          "group-hover/tooltip:opacity-100 group-hover/tooltip:delay-300 group-has-[:focus-visible]/tooltip:opacity-100",
          SIDES[side],
        )}
      >
        {content}
        {shortcut ? (
          <kbd className="rounded border border-bg/25 px-1 font-sans text-[10px] leading-4 opacity-80">
            {shortcut}
          </kbd>
        ) : null}
      </span>
    </span>
  );
}
