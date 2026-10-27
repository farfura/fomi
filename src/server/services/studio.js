import "server-only";
import project from "../data/studio.json";
import { getMedia, getThumb, pickMedia } from "../media";
import { createId } from "../utils";

const STRENGTHS = ["subtle", "balanced", "bold"];

function hydrateTake(take) {
  return { ...take, media: getThumb(take.mediaId) };
}

export function getProject(projectId) {
  if (projectId !== project.id) return null;
  return {
    ...project,
    dna: { ...project.dna, references: project.dna.references.map(getThumb) },
    shots: project.shots.map(({ pool: _pool, ...shot }) => ({
      ...shot,
      takes: shot.takes.map(hydrateTake),
    })),
  };
}

export function validateTakesInput(input) {
  if (!input || typeof input !== "object") return "Request body must be JSON.";
  const { shotId, parentId, direction, notes = [], strength, count } = input;
  if (!project.shots.some((shot) => shot.id === shotId)) return "Unknown shot.";
  if (typeof parentId !== "string") return "Pick a take to iterate from.";
  if (!STRENGTHS.includes(strength)) return "Unknown variation strength.";
  if (![1, 2, 3].includes(count)) return "Request between 1 and 3 takes.";
  const hasDirection = typeof direction === "string" && direction.trim().length > 0;
  if (!hasDirection && notes.length === 0) return "Add a direction or pin a note first.";
  return null;
}

/**
 * Mock iteration: prefers the shot's prepared pool (believable continuations of that shot),
 * then falls back to the closest matches in the library. `exclude` stops repeats.
 */
export function createTakes({ shotId, parentId, direction, notes = [], strength, count, exclude = [] }) {
  const shot = project.shots.find((item) => item.id === shotId);
  const used = new Set(exclude);
  const fromPool = shot.pool.filter((id) => !used.has(id)).slice(0, count);

  let mediaIds = fromPool;
  if (mediaIds.length < count) {
    const parentMediaId = exclude.find(Boolean);
    const parentTags = parentMediaId ? getMedia(parentMediaId).tags : [];
    const extra = pickMedia({
      prompt: `${direction ?? ""} ${notes.map((note) => note.text).join(" ")}`,
      tags: parentTags,
      count: count - mediaIds.length,
      exclude: [...used, ...mediaIds],
    });
    mediaIds = [...mediaIds, ...extra.map((item) => item.id)];
  }

  const summary =
    direction?.trim() ||
    (notes.length === 1 ? notes[0].text : `Addressed ${notes.length} notes`);

  return mediaIds.map((mediaId) =>
    hydrateTake({
      id: createId("take"),
      mediaId,
      parentId,
      direction: summary,
      strength,
      approved: false,
      createdAt: new Date().toISOString(),
      notes: [],
    }),
  );
}
