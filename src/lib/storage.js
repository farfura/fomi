/**
 * localStorage helpers that never throw (private mode, quota, disabled storage).
 * Keys are versioned so a future schema change can simply bump the suffix.
 */
export const STORAGE_KEYS = {
  theme: "fomi.theme",
  workspace: "fomi.workspace.v1",
  studio: (projectId) => `fomi.studio.${projectId}.v1`,
};

export function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage is a convenience, never a requirement. */
  }
}
