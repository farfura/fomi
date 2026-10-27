"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import styles from "./Sheet.module.css";

/**
 * Modal surface built on the native <dialog> element.
 * - `variant="right"`: side sheet on desktop, bottom sheet on phones.
 * - `variant="center"`: full screen viewer (used by the lightbox).
 * Closing is always driven by `onClose`, so the owner keeps the open state.
 */
export function Sheet({ open, onClose, label, variant = "right", width, className, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // When the route is hidden (React Activity) the effect cleans up and the dialog closes.
  useEffect(() => {
    const dialog = ref.current;
    return () => dialog?.open && dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      className={cn(styles.dialog, styles[variant])}
      style={width ? { "--sheet-width": width } : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Clicks on the backdrop land on the <dialog> element itself.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          styles.panel,
          "flex flex-col overflow-hidden shadow-float",
          variant === "center" ? "bg-[#0f0d0c] text-white" : "bg-bg",
          className,
        )}
      >
        {open ? children : null}
      </div>
    </dialog>
  );
}
