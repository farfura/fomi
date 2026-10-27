"use client";

import { useEffect, useRef } from "react";

/**
 * Closes a floating element on outside pointer down or Escape.
 * `refs` lists every element that counts as "inside" (trigger + panel).
 */
export function useDismiss(refs, onDismiss, enabled = true) {
  const latest = useRef({ refs, onDismiss });

  useEffect(() => {
    latest.current = { refs, onDismiss };
  });

  useEffect(() => {
    if (!enabled) return undefined;

    function onPointerDown(event) {
      const inside = latest.current.refs.some((ref) => ref.current?.contains(event.target));
      if (!inside) latest.current.onDismiss("outside");
    }
    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        latest.current.onDismiss("escape");
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled]);
}
