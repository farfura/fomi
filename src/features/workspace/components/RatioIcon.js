/** Tiny outline of an aspect ratio, so ratios can be compared at a glance. */
export function RatioIcon({ ratio, className = "size-3.5" }) {
  const [w, h] = ratio.split(":").map(Number);
  const scale = 10 / Math.max(w, h);
  const width = w * scale;
  const height = h * scale;
  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden>
      <rect
        x={(14 - width) / 2}
        y={(14 - height) / 2}
        width={width}
        height={height}
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
