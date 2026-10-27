import "server-only";
import { COUNTS, DEFAULTS, MODELS, RATIOS, STYLES } from "../data/catalog";
import { getThumb } from "../media";

export function getCatalog() {
  return {
    models: MODELS,
    ratios: RATIOS,
    counts: COUNTS,
    defaults: DEFAULTS,
    styles: STYLES.map(({ id, label, coverId }) => ({
      id,
      label,
      cover: coverId ? getThumb(coverId) : null,
    })),
  };
}

export function getModel(id) {
  return MODELS.find((model) => model.id === id);
}

export function getStyle(id) {
  return STYLES.find((style) => style.id === id);
}
