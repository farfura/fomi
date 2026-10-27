import "server-only";
import seed from "../data/generations.json";
import { COUNTS, RATIOS } from "../data/catalog";
import { getClientMedia, pickMedia, toClientMedia } from "../media";
import { createId } from "../utils";
import { getModel, getStyle } from "./catalog";

export const PAGE_SIZE = 6;

const history = [...seed].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

function hydrate(generation) {
  const { mediaIds, ...rest } = generation;
  return { ...rest, count: mediaIds.length, media: mediaIds.map(getClientMedia) };
}

/** Cursor pagination over the seeded history, newest first. */
export function listGenerations({ cursor = null, limit = PAGE_SIZE, type = "all" } = {}) {
  const filtered = type === "all" ? history : history.filter((item) => item.mode === type);
  const start = cursor ? filtered.findIndex((item) => item.id === cursor) + 1 : 0;
  const page = filtered.slice(start, start + limit);
  const last = page.at(-1);
  const hasMore = start + limit < filtered.length;
  return { items: page.map(hydrate), nextCursor: hasMore && last ? last.id : null };
}

/** Returns an error message, or null when the request is valid. */
export function validateGenerationInput(input) {
  if (!input || typeof input !== "object") return "Request body must be JSON.";
  const { prompt, mode, count, ratio, modelId, styleId } = input;
  if (mode !== "image" && mode !== "video") return "Choose image or video.";
  const text = typeof prompt === "string" ? prompt.trim() : "";
  if (text.length < 3) return "Describe what you want to create (at least 3 characters).";
  if (text.length > 1200) return "Prompts are limited to 1,200 characters.";
  if (!COUNTS[mode].includes(count)) return `Pick between ${COUNTS[mode][0]} and ${COUNTS[mode].at(-1)} outputs.`;
  if (!RATIOS[mode].includes(ratio)) return "That aspect ratio is not available for this mode.";
  const model = getModel(modelId);
  if (!model || model.mode !== mode) return "That model is not available for this mode.";
  if (styleId && !getStyle(styleId)) return "Unknown style preset.";
  return null;
}

export function createGeneration(input) {
  const style = getStyle(input.styleId ?? "none");
  const media = pickMedia({
    prompt: input.prompt,
    tags: style?.tags ?? [],
    type: input.mode,
    count: input.count,
  });

  return {
    id: createId("gen"),
    mode: input.mode,
    prompt: input.prompt.trim(),
    modelId: input.modelId,
    ratio: input.ratio,
    styleId: input.styleId ?? "none",
    seed: Number.isInteger(input.seed) ? input.seed : Math.floor(Math.random() * 999999),
    ...(typeof input.negativePrompt === "string" && input.negativePrompt.trim()
      ? { negativePrompt: input.negativePrompt.trim().slice(0, 400) }
      : null),
    createdAt: new Date().toISOString(),
    count: media.length,
    media: media.map(toClientMedia),
  };
}
