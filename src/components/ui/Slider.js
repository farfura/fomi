"use client";

import { useId } from "react";
import styles from "./Slider.module.css";

/** Native range input with a filled track. Keeps native keyboard and screen reader support. */
export function Slider({ label, value, min = 0, max = 100, step = 1, onChange, format = String, hint }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={id} className="font-medium text-ink">
          {label}
        </label>
        <output htmlFor={id} className="tabular-nums text-muted">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={styles.range}
        style={{ "--value": value, "--min": min, "--max": max }}
      />
      {hint ? <p className="text-[11px] leading-4 text-muted">{hint}</p> : null}
    </div>
  );
}
