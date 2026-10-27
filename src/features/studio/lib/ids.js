/** Short unique ids for things created in the browser (notes). */
export function createClientId(prefix) {
  const random = globalThis.crypto?.randomUUID?.().slice(0, 8) ?? Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}
