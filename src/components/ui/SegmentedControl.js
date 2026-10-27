"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import styles from "./SegmentedControl.module.css";

/**
 * Radio group rendered as a segmented control with a sliding indicator.
 * Arrow keys move the selection, matching native radio behaviour.
 */
export function SegmentedControl({ label, options, value, onChange, size = "md", className }) {
  const refs = useRef([]);
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  function onKeyDown(event) {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(styles.root, "rounded-full bg-chip p-1", className)}
      style={{ "--count": options.length, "--index": index }}
    >
      <span aria-hidden className={styles.indicator} />
      {options.map((option, i) => {
        const checked = i === index;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[i] = node;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors duration-200",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-[13px]",
              checked ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
