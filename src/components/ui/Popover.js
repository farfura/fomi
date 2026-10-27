"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useDismiss } from "@/hooks/use-dismiss";
import { cn } from "@/lib/cn";

const ALIGN = {
  start: "left-0 origin-top-left",
  end: "right-0 origin-top-right",
  center: "left-1/2 -translate-x-1/2 origin-top",
};

const SIDE = {
  bottom: "top-full mt-2",
  top: "bottom-full mb-2",
};

/**
 * Lightweight anchored popover.
 * `trigger` is a render function that receives the props the trigger button must spread,
 * so the trigger keeps full control of its own look.
 */
export function Popover({
  trigger,
  children,
  align = "end",
  side = "bottom",
  label,
  role = "dialog",
  className,
  wrapperClassName,
  open: controlledOpen,
  onOpenChange,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (value) => {
    setUncontrolledOpen(value);
    onOpenChange?.(value);
  };

  const id = useId();
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  useDismiss(
    [triggerRef, panelRef],
    (reason) => {
      setOpen(false);
      if (reason === "escape") triggerRef.current?.focus();
    },
    open,
  );

  useEffect(() => {
    if (open) panelRef.current?.focus({ preventScroll: true });
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className={cn("relative", wrapperClassName ?? "inline-flex")}>
      {trigger({
        ref: triggerRef,
        "aria-expanded": open,
        "aria-haspopup": role,
        "aria-controls": open ? id : undefined,
        onClick: () => setOpen(!open),
      })}
      {open ? (
        <div
          ref={panelRef}
          id={id}
          role={role}
          aria-label={label}
          tabIndex={-1}
          className={cn(
            "absolute z-50 min-w-56 animate-pop-in rounded-2xl border border-line bg-surface p-2 shadow-float outline-none",
            ALIGN[align],
            SIDE[side],
            className,
          )}
        >
          {typeof children === "function" ? children({ close }) : children}
        </div>
      ) : null}
    </div>
  );
}
