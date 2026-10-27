"use client";

import { Heart, Play } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Masonry grid built on CSS columns: no layout JavaScript, and each item keeps
 * its real aspect ratio (known up front from the API), so nothing jumps while loading.
 */
export function MediaMasonry({ entries, favorites, onOpen, renderOverlay, className }) {
  return (
    <ul className={cn("columns-2 gap-3 sm:columns-3 lg:columns-4", className)}>
      {entries.map((entry, index) => {
        const { media } = entry;
        const isFavorite = favorites?.has(media.id);
        return (
          <li key={entry.key} className="group/item relative mb-3 break-inside-avoid animate-fade-in">
            <button
              type="button"
              onClick={() => onOpen(index)}
              aria-label={`Open: ${media.alt}`}
              className="relative block w-full overflow-hidden rounded-xl bg-media"
              style={{ aspectRatio: `${media.width} / ${media.height}`, backgroundColor: media.color }}
            >
              <Image
                src={media.type === "video" ? media.poster : media.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 200px, (min-width: 640px) 30vw, 50vw"
                placeholder={media.blurDataURL ? "blur" : "empty"}
                blurDataURL={media.blurDataURL}
                className="object-cover transition-transform duration-500 ease-out-soft group-hover/item:scale-[1.04]"
              />
              {media.type === "video" ? (
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
                  <Play className="size-2.5 fill-current" aria-hidden />
                  {media.duration}s
                </span>
              ) : null}
              {isFavorite ? (
                <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-black/45 text-[#ff8f7a] backdrop-blur-md">
                  <Heart className="size-3.5 fill-current" aria-label="Favourite" />
                </span>
              ) : null}
            </button>
            {renderOverlay ? renderOverlay(entry, index) : null}
          </li>
        );
      })}
    </ul>
  );
}
