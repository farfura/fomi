/**
 * Static product catalogue: models, aspect ratios and style presets.
 * In production this would come from a config service; the shape is what the UI relies on.
 */
export const MODELS = [
  {
    id: "fomi-photo-2",
    mode: "image",
    name: "Photo 2",
    description: "Photoreal people, skin and natural light",
    eta: 6,
  },
  {
    id: "fomi-cinematic",
    mode: "image",
    name: "Cinematic",
    description: "Dramatic lighting and film colour",
    eta: 8,
  },
  {
    id: "fomi-art",
    mode: "image",
    name: "Artist",
    description: "Painterly and illustrated looks",
    eta: 7,
  },
  {
    id: "fomi-3d",
    mode: "image",
    name: "3D Render",
    description: "Characters, toys and product renders",
    eta: 9,
  },
  {
    id: "fomi-motion",
    mode: "video",
    name: "Motion",
    description: "5 second clips with camera motion",
    eta: 40,
  },
  {
    id: "fomi-motion-relight",
    mode: "video",
    name: "Relight",
    description: "Animates light changes on a still",
    eta: 45,
  },
];

export const RATIOS = {
  image: ["1:1", "2:3", "3:4", "4:5", "9:16", "16:9"],
  video: ["2:3", "9:16", "1:1", "16:9"],
};

export const COUNTS = {
  image: [1, 2, 3, 4],
  video: [1, 2],
};

export const DEFAULTS = {
  image: { modelId: "fomi-photo-2", ratio: "1:1", count: 4 },
  video: { modelId: "fomi-motion", ratio: "2:3", count: 2 },
};

/** `tags` steer the mock generator; `coverId` points at a media item used as the thumbnail. */
export const STYLES = [
  { id: "none", label: "No style", tags: [], coverId: null },
  { id: "portrait", label: "Soft portrait", tags: ["portrait", "window", "soft"], coverId: "rose-window" },
  { id: "cinematic", label: "Cinematic", tags: ["cinematic", "dramatic"], coverId: "fighter-neon" },
  { id: "neon", label: "Neon noir", tags: ["neon", "night", "city"], coverId: "neon-street" },
  { id: "illustration", label: "Illustrated", tags: ["illustration", "painterly"], coverId: "field-illustrated" },
  { id: "toy", label: "3D toy", tags: ["3d", "cartoon", "toy"], coverId: "toon-kitten-hat" },
  { id: "product", label: "Product", tags: ["product", "backdrop"], coverId: "podium-clouds" },
  { id: "wildlife", label: "Wildlife", tags: ["animal", "bird", "nature"], coverId: "bird-robin" },
  { id: "food", label: "Food", tags: ["food", "restaurant"], coverId: "food-steak" },
];
