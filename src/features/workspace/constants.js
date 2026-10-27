export const PROMPT_LIMIT = 1200;

/** "Surprise me" prompts: also a gentle way to show what good prompts look like. */
export const SAMPLE_PROMPTS = [
  "Portrait of a ceramicist in her sunlit studio, clay dust in the air, soft window light from the left, 50mm, quiet and warm.",
  "A red vintage tram climbing a narrow street at golden hour, long shadows, film grain, Lisbon in late autumn.",
  "Minimal product shot of a frosted glass perfume bottle on travertine, morning light, soft caustics, cream palette.",
  "Cinematic close up of a falcon taking off from a leather glove, desert dawn, dust and backlight.",
  "Knitted toy fox sitting on a stack of picture books, cosy reading nook, warm lamp light, shallow depth of field.",
  "Rainy neon alley at night, a delivery rider waiting under a noodle bar sign, reflections in puddles, anamorphic.",
];

/** Rough credit cost, shown next to the Generate button so the price is never a surprise. */
export function estimateCredits({ mode, count }) {
  return mode === "video" ? count * 5 : count;
}

/**
 * Expected wait in milliseconds. Mirrors the latency of the mock API
 * (see src/app/api/generations/route.js) so the progress bar stays honest.
 */
export function estimateDuration({ mode, modelEta = 8, count = 1 }) {
  const base = mode === "video" ? 3200 : 1500;
  return base + modelEta * 40 + count * 180 + 250;
}
