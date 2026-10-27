"use client";

import { useEffect, useRef } from "react";

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

/**
 * Registers a global keyboard shortcut.
 * `combo` examples: "/", "n", "mod+enter", "escape", "arrowleft".
 * Plain keys are ignored while the user is typing; `mod+` combos always fire.
 */
export function useHotkey(combo, handler, { enabled = true, allowInInputs = false } = {}) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    const parts = combo.toLowerCase().split("+");
    const key = parts.at(-1);
    const needsMod = parts.includes("mod");
    const needsShift = parts.includes("shift");

    function onKeyDown(event) {
      if (event.defaultPrevented || event.isComposing) return;
      const mod = event.metaKey || event.ctrlKey;
      if (needsMod !== mod) return;
      if (needsShift !== event.shiftKey) return;
      if (event.altKey) return;
      if (event.key.toLowerCase() !== key) return;
      if (!needsMod && !allowInInputs && isTypingTarget(event.target)) return;
      handlerRef.current(event);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [combo, enabled, allowInInputs]);
}
