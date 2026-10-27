/**
 * Flattens generations into the entry shape the full screen viewer understands.
 * One entry per output, so arrow keys walk through every image in order.
 */
export function toViewerEntries(generations) {
  return generations.flatMap((generation) =>
    generation.media.map((media, index) => ({
      key: `${generation.id}:${index}`,
      media,
      prompt: generation.prompt,
      negativePrompt: generation.negativePrompt,
      modelId: generation.modelId,
      ratio: generation.ratio,
      styleId: generation.styleId,
      seed: generation.seed,
      createdAt: generation.createdAt,
      generationId: generation.id,
      mode: generation.mode,
    })),
  );
}
