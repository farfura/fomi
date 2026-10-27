/**
 * Joins class names, skipping falsy values.
 * Kept dependency free on purpose: our variants never need conflict resolution.
 */
export function cn(...values) {
  let out = "";
  for (const value of values) {
    if (!value) continue;
    out = out ? `${out} ${value}` : value;
  }
  return out;
}
