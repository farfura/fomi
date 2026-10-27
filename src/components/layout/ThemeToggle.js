"use client";

import { Moon, Sun } from "lucide-react";
import { useRef } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { STORAGE_KEYS } from "@/lib/storage";

/**
 * Both icons are rendered and swapped with CSS based on <html data-theme>,
 * so the server markup is always correct and nothing flickers on hydration.
 * Where supported, the switch animates as a circular reveal from the button.
 */
export function ThemeToggle() {
  const buttonRef = useRef(null);

  function apply(next) {
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, next);
    } catch {
      /* The theme still applies for this visit. */
    }
  }

  function toggle() {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduced) return apply(next);

    const rect = buttonRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth;
    const y = rect ? rect.top + rect.height / 2 : 0;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    document.documentElement.style.setProperty("--reveal-x", `${x}px`);
    document.documentElement.style.setProperty("--reveal-y", `${y}px`);
    document.documentElement.style.setProperty("--reveal-r", `${radius}px`);
    document.startViewTransition(() => apply(next));
  }

  return (
    <IconButton ref={buttonRef} label="Toggle dark mode" onClick={toggle} variant="ghost" size="sm">
      <Moon aria-hidden className="size-[18px] [[data-theme=dark]_&]:hidden" />
      <Sun aria-hidden className="hidden size-[18px] [[data-theme=dark]_&]:block" />
    </IconButton>
  );
}
