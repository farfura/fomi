"use client";

import { memo, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { MediaTile } from "./MediaTile";
import { PromptCard } from "./PromptCard";

/** Wide ratios get two columns so landscape outputs never shrink to stamps. */
export function columnsFor(ratio) {
  const [w, h] = ratio.split(":").map(Number);
  return w > h ? "grid-cols-1 @min-[480px]:grid-cols-2" : "grid-cols-2 @min-[560px]:grid-cols-4";
}

/**
 * One generation: the prompt card beside its outputs.
 * Uses a container query, so the layout responds to the space the feed actually has,
 * not to the window (the composer takes a column on desktop but not on tablets).
 */
export const GenerationGroup = memo(function GenerationGroup({
  generation,
  modelName,
  styleLabel,
  favorites,
  highlighted,
  priority,
  onOpen,
  onToggleFavorite,
  onReuse,
  onDelete,
  onHighlightEnd,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [highlighted]);

  const wide = columnsFor(generation.ratio).startsWith("grid-cols-1");
  const sizes = wide
    ? "(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
    : "(min-width: 1536px) 300px, (min-width: 1024px) 18vw, (min-width: 640px) 24vw, 50vw";

  return (
    <section
      ref={ref}
      id={`generation-${generation.id}`}
      aria-label={`Generation: ${generation.prompt.slice(0, 60)}`}
      className="@container"
    >
      <div
        onAnimationEnd={(event) => {
          if (highlighted && event.target === event.currentTarget) onHighlightEnd();
        }}
        className={cn(
          "grid gap-3 rounded-[26px] @min-[880px]:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] @min-[880px]:gap-4",
          highlighted && "animate-flash",
        )}
      >
        <PromptCard
          generation={generation}
          modelName={modelName}
          styleLabel={styleLabel}
          onReuse={() => onReuse(generation)}
          onDelete={() => onDelete(generation.id)}
          className="@min-[880px]:self-start"
        />
        <div className={cn("grid gap-3", columnsFor(generation.ratio))}>
          {generation.media.map((media, index) => (
            <MediaTile
              key={media.id}
              media={media}
              ratio={generation.ratio}
              label={generation.prompt}
              index={index}
              favorite={favorites.has(media.id)}
              priority={priority && index < 4}
              sizes={sizes}
              onOpen={(i) => onOpen(generation.id, i)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
