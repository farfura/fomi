const UNITS = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "3 hours ago". Only call on the client (depends on the current time and locale). */
export function formatRelativeTime(iso, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

/** "1:1" -> "1 / 1" for the CSS aspect-ratio property. */
export function ratioToCss(ratio = "1:1") {
  const [w, h] = ratio.split(":").map(Number);
  return `${w} / ${h}`;
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function truncate(text, length = 80) {
  if (!text || text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

/** Turns a prompt into a short, safe file name for downloads. */
export function toFileName(text, extension) {
  const slug = (text || "fomi")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `fomi-${slug || "creation"}.${extension}`;
}
