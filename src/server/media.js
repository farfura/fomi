import "server-only";
import library from "./data/media.json";

const byId = new Map([...library.images, ...library.videos].map((item) => [item.id, item]));

export function getMedia(id) {
  const item = byId.get(id);
  if (!item) throw new Error(`Unknown media id "${id}"`);
  return item;
}

/** Media as sent to the browser: everything except the generator's tags. */
export function toClientMedia(item) {
  const { tags: _tags, ...rest } = item;
  return rest;
}

export function getClientMedia(id) {
  return toClientMedia(getMedia(id));
}

/** Small shape for thumbnails (no tags), keeps RSC payloads light. */
export function getThumb(id) {
  const { src, poster, type, width, height, alt, blurDataURL, color } = getMedia(id);
  return { id, src, poster, type, width, height, alt, blurDataURL, color };
}

/** Everyday words mapped onto library tags, so "puppy" finds dogs and "kitten" finds cats. */
const SYNONYMS = {
  puppy: "dog",
  puppies: "dog",
  retriever: "dog",
  doggo: "dog",
  hound: "dog",
  kitten: "cat",
  kitty: "cat",
  kittens: "cat",
  bird: "bird",
  robin: "bird",
  parrot: "bird",
  lady: "woman",
  girl: "woman",
  model: "portrait",
  headshot: "portrait",
  meal: "food",
  dish: "food",
  noodles: "food",
  ramen: "food",
  city: "city",
  street: "city",
  toy: "toy",
  doll: "toy",
  cartoon: "cartoon",
  pixar: "3d",
  render: "3d",
  mountain: "alpine",
  mountains: "alpine",
  flowers: "floral",
  flower: "floral",
};

/** Words that describe almost every photo; they should not decide the subject. */
const GENERIC = new Set([
  "light", "lighting", "soft", "warm", "studio", "natural", "photo", "photograph", "shot",
  "detail", "detailed", "background", "with", "and", "the", "style", "image", "high", "quality",
  "cinematic", "beautiful", "golden", "hour", "lens", "film", "grain", "sharp", "focus",
]);

function tokenize(text = "") {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
  const expanded = words.flatMap((word) => (SYNONYMS[word] ? [word, SYNONYMS[word]] : [word]));
  return new Set(expanded);
}

/**
 * Scores the media library against a prompt and style tags.
 * The mock "model": subject words weigh most, generic photo words barely count,
 * and a little randomness keeps the same prompt from returning identical results.
 */
export function pickMedia({ prompt, tags = [], type = "image", count = 4, exclude = [] }) {
  const pool = type === "video" ? library.videos : library.images;
  const words = tokenize(prompt);
  const styleTags = new Set(tags);
  const excluded = new Set(exclude);
  const weight = (word) => (GENERIC.has(word) ? 0.3 : 1);

  const scored = pool
    .filter((item) => !excluded.has(item.id))
    .map((item) => {
      let score = Math.random() * 0.75;
      for (const tag of item.tags) {
        if (words.has(tag)) score += 3 * weight(tag);
        if (styleTags.has(tag)) score += 1.5;
      }
      for (const word of tokenize(item.alt)) if (words.has(word)) score += 1.2 * weight(word);
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, count).map(({ item }) => item);
}
